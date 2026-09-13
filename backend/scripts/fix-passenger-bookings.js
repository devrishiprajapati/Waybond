/**
 * Migration script to create PassengerBooking records for existing bookings
 * This links travelers to bookings based on their phone numbers
 */

import { prisma } from '../src/prisma.js'

async function main() {
  console.log('Starting PassengerBooking migration...')
  
  // Get all bookings
  const bookings = await prisma.booking.findMany({
    include: {
      passengerBookings: true,
      user: true
    }
  })

  console.log(`Found ${bookings.length} bookings to process`)

  let processedCount = 0
  let skippedCount = 0
  let createdCount = 0

  for (const booking of bookings) {
    const payload = booking.payload || {}
    const travellers = payload.travellerDetails || []

    if (travellers.length === 0) {
      console.log(`  Skipping booking ${booking.id} - no traveller details`)
      skippedCount++
      continue
    }

    // Extract phone numbers from travelers
    const travelerPhones = travellers
      .map(t => t.phone?.trim())
      .filter(phone => phone && phone.length > 0)

    if (travelerPhones.length === 0) {
      console.log(`  Skipping booking ${booking.id} - no valid phone numbers`)
      skippedCount++
      continue
    }

    // Find users with matching phone numbers
    const matchedUsers = await prisma.user.findMany({
      where: {
        phone: { in: travelerPhones }
      }
    })

    if (matchedUsers.length === 0) {
      console.log(`  No matching users found for booking ${booking.id}`)
      skippedCount++
      continue
    }

    // Create PassengerBooking records for matched users
    const firstTravellerPhone = travellers[0]?.phone?.trim()
    
    for (const user of matchedUsers) {
      // Check if PassengerBooking already exists
      const existingPB = booking.passengerBookings.find(pb => pb.userId === user.id)
      if (existingPB) {
        console.log(`  PassengerBooking already exists for user ${user.name} (${user.phone}) in booking ${booking.id}`)
        continue
      }

      const traveller = travellers.find(t => t.phone?.trim() === user.phone)
      if (!traveller) continue

      const isPrimaryBooker = user.phone === firstTravellerPhone && user.id === booking.userId

      try {
        await prisma.passengerBooking.create({
          data: {
            bookingId: booking.id,
            userId: user.id,
            passengerName: traveller.name,
            isPrimaryBooker
          }
        })
        console.log(`  ✓ Created PassengerBooking for ${user.name} (${user.phone}) in booking ${booking.id}`)
        createdCount++
      } catch (error) {
        console.error(`  ✗ Failed to create PassengerBooking for ${user.name} in booking ${booking.id}:`, error.message)
      }
    }

    processedCount++
  }

  console.log('\nMigration completed!')
  console.log(`  Total bookings: ${bookings.length}`)
  console.log(`  Processed: ${processedCount}`)
  console.log(`  Skipped: ${skippedCount}`)
  console.log(`  PassengerBookings created: ${createdCount}`)
}

main()
  .catch(error => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
