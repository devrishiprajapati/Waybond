import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import nodemailer from 'nodemailer'
import { createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
import https from 'node:https'
import { prisma } from './prisma.js'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || true }))
app.use(express.json({ limit: '100mb' }))

const toTrip = (record) => ({ id: record.id, ...record.payload })
const toHeroSlide = (record) => ({ id: record.id, ...record.payload })

// Cloudflare Turnstile server-side verification
// Dev uses always-pass test keys from env; production uses real keys from env
const TURNSTILE_SECRET = process.env.NODE_ENV === 'development'
  ? (process.env.TURNSTILE_TEST_SECRET_KEY || '1x0000000000000000000000000000000AA')
  : (process.env.TURNSTILE_SECRET_KEY || '')
const verifyTurnstile = (token) => new Promise((resolve) => {
  const isDev = process.env.NODE_ENV === 'development'
  // In dev: pass if token is empty/missing or is the frontend bypass signal
  if (isDev && (!token || token === 'dev-no-sitekey')) {
    console.log('[Turnstile] dev bypass — skipping verification')
    return resolve(true)
  }
  if (!token) return resolve(false)
  const body = `secret=${encodeURIComponent(TURNSTILE_SECRET)}&response=${encodeURIComponent(token)}`
  const req = https.request({
    hostname: 'challenges.cloudflare.com',
    path: '/turnstile/v0/siteverify',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
  }, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      try {
        const json = JSON.parse(data)
        if (!json.success) console.warn('[Turnstile] verification failed:', json['error-codes'])
        resolve(json.success === true)
      } catch { resolve(false) }
    })
  })
  req.on('error', (err) => { console.error('[Turnstile] request error:', err.message); resolve(false) })
  req.write(body)
  req.end()
})
const toTrendingCard = (record) => ({ id: record.id, ...record.payload })
const toBooking = (record) => ({ id: record.id, bookingDbId: record.id, ...record.payload })
const publicUser = ({ passwordHash, ...user }) => user
const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
const passwordMatches = (password, storedHash) => {
  const [salt, hash] = String(storedHash || '').split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'))
}
const mailTransport = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: Number(process.env.EMAIL_PORT || 465) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  })
  : null

app.get('/', (_req, res) => res.json({ service: 'WayBond API', status: 'running', health: '/api/health' }))
app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const turnstileOk = await verifyTurnstile(req.body.turnstileToken)
    if (!turnstileOk) return res.status(403).json({ message: 'CAPTCHA verification failed. Please try again.' })
    const email = String(req.body.email || '').trim().toLowerCase()
    const name = String(req.body.name || '').trim()
    const password = String(req.body.password || '')
    const profile = req.body.profile || undefined
    if (!name || !email || password.length < 6) return res.status(400).json({ message: 'Name, email, and a 6-character password are required.' })
    if (await prisma.user.findUnique({ where: { email } })) return res.status(409).json({ message: 'An account already exists for this email.' })
    const user = await prisma.user.create({ data: { name, email, passwordHash: hashPassword(password), profile } })
    res.status(201).json({ user: publicUser(user) })
  } catch (error) { next(error) }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const turnstileOk = await verifyTurnstile(req.body.turnstileToken)
    if (!turnstileOk) return res.status(403).json({ message: 'CAPTCHA verification failed. Please try again.' })
    const email = String(req.body.email || '').trim().toLowerCase()
    const password = String(req.body.password || '')
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !passwordMatches(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid email or password.' })
    const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
    res.json({ user: publicUser(updatedUser) })
  } catch (error) { next(error) }
})

app.post('/api/auth/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const genericMessage = 'If an account exists for this email, an OTP has been sent.'
    if (!email) return res.status(400).json({ message: 'Email is required.' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.json({ message: genericMessage })
    if (!mailTransport) return res.status(503).json({ message: 'Email delivery is not configured.' })

    const latestOtp = await prisma.passwordResetOtp.findFirst({ where: { email }, orderBy: { createdAt: 'desc' } })
    if (latestOtp && Date.now() - latestOtp.createdAt.getTime() < 60_000) {
      return res.status(429).json({ message: 'Please wait a minute before requesting another OTP.' })
    }

    const otp = String(randomInt(100000, 1000000))
    await prisma.passwordResetOtp.deleteMany({ where: { email } })
    await prisma.passwordResetOtp.create({ data: { email, codeHash: hashPassword(otp), expiresAt: new Date(Date.now() + 10 * 60_000) } })
    try {
      await mailTransport.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'WayBond password reset OTP',
        text: `Your WayBond password reset OTP is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`
      })
    } catch (mailError) {
      await prisma.passwordResetOtp.deleteMany({ where: { email } })
      throw mailError
    }
    res.json({ message: genericMessage })
  } catch (error) { next(error) }
})

app.post('/api/auth/reset-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    const otp = String(req.body.otp || '').trim()
    const password = String(req.body.password || '')
    if (!email || !/^\d{6}$/.test(otp) || password.length < 6) return res.status(400).json({ message: 'Enter a valid OTP and a password with at least 6 characters.' })

    const resetOtp = await prisma.passwordResetOtp.findFirst({ where: { email, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } })
    if (!resetOtp) return res.status(400).json({ message: 'This OTP is invalid or has expired.' })
    if (resetOtp.attempts >= 5) {
      await prisma.passwordResetOtp.delete({ where: { id: resetOtp.id } })
      return res.status(400).json({ message: 'Too many attempts. Request a new OTP.' })
    }
    if (!passwordMatches(otp, resetOtp.codeHash)) {
      await prisma.passwordResetOtp.update({ where: { id: resetOtp.id }, data: { attempts: { increment: 1 } } })
      return res.status(400).json({ message: 'Incorrect OTP.' })
    }

    await prisma.user.update({ where: { email }, data: { passwordHash: hashPassword(password) } })
    await prisma.passwordResetOtp.deleteMany({ where: { email } })
    res.json({ message: 'Password updated. You can now sign in.' })
  } catch (error) { next(error) }
})

app.post('/api/auth/admin/login', async (req, res, next) => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@waybond.local'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    if (String(req.body.password || '') !== password) return res.status(401).json({ message: 'Invalid admin credentials.' })
    // Admin access is configured through environment variables. Do not block sign-in
    // on a database write, especially when the shared database is temporarily offline.
    res.json({ user: { id: 'waybond-admin', name: 'WayBond Admin', email, role: 'ADMIN' } })
  } catch (error) { next(error) }
})

app.get('/api/trips', async (_req, res, next) => {
  try { res.json((await prisma.trip.findMany({ orderBy: { id: 'asc' } })).map(toTrip)) } catch (error) { next(error) }
})

app.get('/api/trips/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(req.params.id) } })
    if (!trip) return res.status(404).json({ message: 'Not found' })
    res.json(toTrip(trip))
  } catch (error) { next(error) }
})

app.post('/api/trips', async (req, res, next) => {
  try { res.status(201).json(toTrip(await prisma.trip.create({ data: { payload: req.body } }))) } catch (error) { next(error) }
})

app.put('/api/trips/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const current = await prisma.trip.findUnique({ where: { id } })
    if (!current) return res.status(404).json({ message: 'Not found' })
    res.json(toTrip(await prisma.trip.update({ where: { id }, data: { payload: { ...current.payload, ...req.body } } })))
  } catch (error) { next(error) }
})

app.delete('/api/trips/:id', async (req, res, next) => {
  try { await prisma.trip.delete({ where: { id: Number(req.params.id) } }); res.json({ success: true }) } catch (error) { next(error) }
})

app.get('/api/heroSlides', async (_req, res, next) => {
  try { res.json((await prisma.heroSlide.findMany({ orderBy: { position: 'asc' } })).map(toHeroSlide)) } catch (error) { next(error) }
})

app.post('/api/heroSlides', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Hero slides must be an array' })
    await prisma.$transaction([
      prisma.heroSlide.deleteMany(),
      ...req.body.map((slide, position) => prisma.heroSlide.create({ data: { position, payload: slide } }))
    ])
    res.json({ success: true })
  } catch (error) { next(error) }
})

app.get('/api/trending-cards', async (_req, res, next) => {
  try { res.json((await prisma.trendingCard.findMany({ orderBy: { position: 'asc' } })).map(toTrendingCard)) } catch (error) { next(error) }
})

app.post('/api/trending-cards', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Trending cards must be an array' })
    if (req.body.length > 6) return res.status(400).json({ message: 'A maximum of 6 Trending Adventure cards is allowed.' })
    await prisma.$transaction([
      prisma.trendingCard.deleteMany(),
      ...req.body.map((card, position) => prisma.trendingCard.create({ data: { position, payload: card } }))
    ])
    res.json({ success: true })
  } catch (error) { next(error) }
})

app.get('/api/testimonials', async (_req, res, next) => {
  try { res.json(await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })) } catch (error) { next(error) }
})

app.post('/api/testimonials', async (req, res, next) => {
  try {
    const { name, trip, review, rating, email, media, mediaType, userId } = req.body
    res.status(201).json(await prisma.testimonial.create({ data: { name, trip, review, rating: Number(rating), email, media, mediaType, userId } }))
  } catch (error) { next(error) }
})

app.put('/api/testimonials/:id', async (req, res, next) => {
  try {
    const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ message: 'Testimonial not found' })

    const name = String(req.body.name ?? existing.name).trim()
    const trip = String(req.body.trip ?? existing.trip).trim()
    const review = String(req.body.review ?? existing.review).trim()
    const rating = Math.min(5, Math.max(1, Number(req.body.rating ?? existing.rating)))
    if (!name || !trip || !review || !Number.isFinite(rating)) {
      return res.status(400).json({ message: 'Name, trip, review, and a rating from 1 to 5 are required.' })
    }

    res.json(await prisma.testimonial.update({
      where: { id: existing.id },
      data: { name, trip, review, rating }
    }))
  } catch (error) { next(error) }
})

app.delete('/api/testimonials/:id', async (req, res, next) => {
  try { await prisma.testimonial.delete({ where: { id: req.params.id } }); res.json({ success: true }) } catch (error) { next(error) }
})

app.get('/api/users', async (_req, res, next) => {
  try { res.json((await prisma.user.findMany({ orderBy: { lastLoginAt: 'desc' } })).map(publicUser)) } catch (error) { next(error) }
})

app.get('/api/admin/dashboard', async (_req, res, next) => {
  try {
    const [tripRecords, userCount, bookingCount, testimonialCount] = await prisma.$transaction([
      prisma.trip.findMany({ orderBy: { id: 'asc' } }),
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.booking.count(),
      prisma.testimonial.count()
    ])

    res.json({
      trips: tripRecords.map(toTrip),
      stats: {
        totalPackages: tripRecords.length,
        users: userCount,
        bookings: bookingCount,
        testimonials: testimonialCount
      },
      updatedAt: new Date().toISOString()
    })
  } catch (error) { next(error) }
})

app.post('/api/users', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase()
    if (!email) return res.status(400).json({ message: 'Email is required' })
    const name = String(req.body.name || email.split('@')[0]).trim()
    res.json(publicUser(await prisma.user.upsert({ where: { email }, create: { email, name, passwordHash: hashPassword(randomBytes(20).toString('hex')) }, update: { name } })))
  } catch (error) { next(error) }
})

app.get('/api/users/:id/dashboard', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { bookings: { orderBy: { createdAt: 'desc' } }, testimonials: { orderBy: { createdAt: 'desc' } } } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: publicUser(user), bookings: user.bookings.map(toBooking), testimonials: user.testimonials })
  } catch (error) { next(error) }
})

app.post('/api/users/:id/bookings', async (req, res, next) => {
  try {
    const booking = await prisma.booking.create({ data: { userId: req.params.id, payload: req.body } })
    res.status(201).json(toBooking(booking))
  } catch (error) { next(error) }
})

app.put('/api/bookings/:bookingId/cancel', async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const updatedPayload = { ...booking.payload, status: 'Cancelled', cancelledOn: new Date().toLocaleDateString('en-IN') }
    const updated = await prisma.booking.update({
      where: { id: req.params.bookingId },
      data: { payload: updatedPayload }
    })
    res.json(toBooking(updated))
  } catch (error) { next(error) }
})

app.post('/api/payments/create-order', async (req, res, next) => {
  try {
    const { bookingId, userId, amount } = req.body
    const amountInPaise = Math.round(Number(amount))
    if (!bookingId || !userId || !Number.isInteger(amountInPaise) || amountInPaise < 100) {
      return res.status(400).json({ message: 'A valid booking and payment amount are required.' })
    }
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Razorpay is not configured. Add Razorpay keys to backend/.env.' })
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.userId !== userId) return res.status(404).json({ message: 'Booking not found.' })

    const authorization = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${authorization}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `wb_${bookingId}`.slice(0, 40),
        payment_capture: 1
      })
    })
    const order = await razorpayResponse.json()
    if (!razorpayResponse.ok) {
      if (razorpayResponse.status === 401 || razorpayResponse.status === 403) {
        return res.status(503).json({
          message: 'Razorpay authentication failed. Update RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET with a matching active key pair, then restart the backend.'
        })
      }
      return res.status(502).json({ message: order.error?.description || 'Unable to create Razorpay order.' })
    }

    await prisma.payment.create({
      data: { bookingId, userId, amount: amountInPaise, currency: 'INR', razorpayOrderId: order.id }
    })
    res.status(201).json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID })
  } catch (error) { next(error) }
})

app.post('/api/payments/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body
    if (!orderId || !paymentId || !signature || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({ message: 'Invalid payment verification request.' })
    }

    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    const isValid = signature.length === expectedSignature.length
      && timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    if (!isValid) return res.status(400).json({ message: 'Payment verification failed.' })

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } })
    if (!payment) return res.status(404).json({ message: 'Payment order not found.' })
    if (payment.status === 'PAID') return res.json({ success: true })

    const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId }, include: { user: true } })
    if (!booking) return res.status(404).json({ message: 'Booking not found.' })
    const payload = {
      ...booking.payload,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentId,
      razorpayOrderId: orderId
    }
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { razorpayPaymentId: paymentId, status: 'PAID' } }),
      prisma.booking.update({ where: { id: booking.id }, data: { payload } })
    ])

    // Send invoice email
    if (mailTransport && booking.user?.email) {
      try {
        const bookingData = toBooking({ ...booking, payload })
        await mailTransport.sendMail({
          from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
          to: booking.user.email,
          subject: `WayBond Booking Confirmation - ${bookingData.bookingId}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">WAYBOND</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Your Journey, Our Passion</p>
              </div>
              
              <div style="background: #f8fafc; padding: 40px 20px;">
                <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <h2 style="color: #10b981; margin: 0 0 20px 0; font-size: 24px;">✓ Booking Confirmed!</h2>
                  
                  <p style="color: #475569; margin: 0 0 20px 0; font-size: 16px;">
                    Dear ${booking.user.name},
                  </p>
                  
                  <p style="color: #475569; margin: 0 0 30px 0; line-height: 1.6;">
                    Your booking for <strong>${bookingData.title}</strong> has been confirmed! 
                    Get ready for an unforgettable adventure with WayBond.
                  </p>
                  
                  <div style="background: #f1f5f9; border-left: 4px solid #0ea5e9; padding: 20px; margin: 0 0 30px 0;">
                    <p style="margin: 0 0 10px 0; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Details</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Booking ID:</strong> ${bookingData.bookingId}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Trip:</strong> ${bookingData.title}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Departure:</strong> ${bookingData.nextBatch}</p>
                    <p style="margin: 0 0 8px 0; color: #1e293b;"><strong>Travelers:</strong> ${bookingData.travelers}</p>
                    <p style="margin: 0; color: #1e293b;"><strong>Amount Paid:</strong> ₹${Number(bookingData.price || 0).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <p style="color: #475569; margin: 0 0 20px 0; line-height: 1.6;">
                    You can view your complete booking details and download your invoice anytime from your dashboard.
                  </p>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.CORS_ORIGIN || 'http://localhost:5173'}/dashboard/${booking.userId}" 
                       style="display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
                      VIEW MY DASHBOARD
                    </a>
                  </div>
                </div>
              </div>
              
              <div style="background: #1e293b; padding: 30px 20px; text-align: center;">
                <p style="color: #94a3b8; margin: 0 0 10px 0; font-size: 14px;">
                  Need help? Contact us at <a href="mailto:support@waybond.com" style="color: #0ea5e9;">support@waybond.com</a>
                </p>
                <p style="color: #64748b; margin: 0; font-size: 12px;">
                  © ${new Date().getFullYear()} WayBond. All rights reserved.
                </p>
              </div>
            </div>
          `
        })
        console.log(`Invoice email sent to ${booking.user.email}`)
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError)
        // Don't fail the payment verification if email fails
      }
    }

    res.json({ success: true, booking: toBooking({ ...booking, payload }) })
  } catch (error) { next(error) }
})

app.get('/api/community-galleries', async (_req, res, next) => {
  try {
    const galleries = await prisma.communityGallery.findMany({ orderBy: { destination: 'asc' } })
    if (!galleries.length) return res.status(404).json({ message: 'No gallery data yet' })
    res.json(galleries.map(({ slug, destination, label, images }) => ({ slug, destination, label, images })))
  } catch (error) { next(error) }
})

app.put('/api/community-galleries', async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Gallery data must be an array' })
    await prisma.$transaction(req.body.map((gallery) => prisma.communityGallery.upsert({
      where: { slug: gallery.slug },
      create: { slug: gallery.slug, destination: gallery.destination, label: gallery.label, images: gallery.images },
      update: { destination: gallery.destination, label: gallery.label, images: gallery.images }
    })))
    res.json({ success: true })
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: process.env.NODE_ENV === 'development' ? error.message : 'Unexpected server error' })
})

app.listen(port, () => console.log(`WayBond API running on http://localhost:${port}`))
