import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import nodemailer from 'nodemailer'
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'
import { prisma } from './prisma.js'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || true }))
app.use(express.json({ limit: '20mb' }))

const toTrip = (record) => ({ id: record.id, ...record.payload })
const toHeroSlide = (record) => ({ id: record.id, ...record.payload })
const toTrendingCard = (record) => ({ id: record.id, ...record.payload })
const toBooking = (record) => ({ id: record.id, ...record.payload })
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
    const admin = await prisma.user.upsert({
      where: { email },
      create: { name: 'WayBond Admin', email, passwordHash: hashPassword(password), role: 'ADMIN' },
      update: { role: 'ADMIN' }
    })
    if (!passwordMatches(String(req.body.password || ''), admin.passwordHash)) return res.status(401).json({ message: 'Invalid admin credentials.' })
    res.json({ user: publicUser(admin) })
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
