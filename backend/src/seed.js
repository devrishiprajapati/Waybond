import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { scryptSync, randomBytes } from 'node:crypto'
import { prisma } from './prisma.js'

const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}

const dbPath = resolve(process.cwd(), '..', 'db.json')
const source = JSON.parse(await readFile(dbPath, 'utf8'))

// Define all available permissions
const ALL_PERMISSIONS = [
  'manage_trips',
  'manage_hero',
  'manage_testimonials',
  'manage_team_members',
  'manage_users',
  'manage_gallery',
  'manage_travel_stories',
  'view_bookings',
  'manage_admins'
]

try {
  if (await prisma.trip.count() === 0) {
    await prisma.trip.createMany({ data: source.trips.map((trip) => ({ id: trip.id, payload: trip })) })
  }

  if (await prisma.heroSlide.count() === 0 && Array.isArray(source.heroSlides)) {
    await prisma.heroSlide.createMany({ data: source.heroSlides.map((slide, position) => ({ position, payload: slide })) })
  }

  // Create Master Admin if doesn't exist
  const masterAdminEmail = process.env.MASTER_ADMIN_EMAIL || 'master@waybond.com'
  const masterAdminPassword = process.env.MASTER_ADMIN_PASSWORD || 'master123'
  
  const existingMasterAdmin = await prisma.admin.findFirst({
    where: { role: 'MASTER_ADMIN' }
  })

  if (!existingMasterAdmin) {
    await prisma.admin.create({
      data: {
        name: 'Master Admin',
        email: masterAdminEmail,
        passwordHash: hashPassword(masterAdminPassword),
        role: 'MASTER_ADMIN',
        permissions: ALL_PERMISSIONS,
        isActive: true
      }
    })
    console.log(`✅ Master Admin created with email: ${masterAdminEmail}`)
  }

  console.log('WayBond database seed complete.')
} finally {
  await prisma.$disconnect()
}
