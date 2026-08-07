import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { prisma } from './prisma.js'

const dbPath = resolve(process.cwd(), '..', 'db.json')
const source = JSON.parse(await readFile(dbPath, 'utf8'))

try {
  if (await prisma.trip.count() === 0) {
    await prisma.trip.createMany({ data: source.trips.map((trip) => ({ id: trip.id, payload: trip })) })
  }

  if (await prisma.heroSlide.count() === 0 && Array.isArray(source.heroSlides)) {
    await prisma.heroSlide.createMany({ data: source.heroSlides.map((slide, position) => ({ position, payload: slide })) })
  }

  console.log('WayBond database seed complete.')
} finally {
  await prisma.$disconnect()
}
