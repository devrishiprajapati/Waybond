import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { prisma } from './prisma.js'

const app = express()
const port = Number(process.env.PORT || 3001)

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim()) || true }))
app.use(express.json({ limit: '20mb' }))

const toTrip = (record) => ({ id: record.id, ...record.payload })
const toHeroSlide = (record) => ({ id: record.id, ...record.payload })
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

app.get('/api/testimonials', async (_req, res, next) => {
  try { res.json(await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })) } catch (error) { next(error) }
})

app.post('/api/testimonials', async (req, res, next) => {
  try {
    const { name, trip, review, rating, email, media, mediaType, userId } = req.body
    res.status(201).json(await prisma.testimonial.create({ data: { name, trip, review, rating: Number(rating), email, media, mediaType, userId } }))
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
