/**
 * Migration Script: Fix Transferred Bookings
 * 
 * This script fixes bookings that were transferred but are missing PassengerBooking entries.
 * It ensures that when a member is transferred to a new trip, they can see their new booking.
 * 
 * Run: node backend/scripts/fix-transferred-bookings.js
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function fixTransferredBookings() {
  console.log('🔍 Starting migration to fix transferred bookings...\n')

  try {
    // Find all bookings that have transferredFromBooking in their payload
    const allBookings = await prisma.booking.findMany({
      include: {
        user: true,
        passengerBookings: true
      }
    })

    console.log(`📊 Total bookings in database: ${allBookings.length}`)

    const transferredBookings = allBookings.filter(booking => {
      const payload = booking.payload
      return payload && (
        payload.transferredFromBooking || 
        payload.transferredFromTrip ||
        (Array.isArray(payload.travellerDetails) && 
         payload.travellerDetails.some(t => t.transferredFrom))
      )
    })

    console.log(`🔄 Found ${transferredBookings.length} transferred bookings\n`)

    let fixedCount = 0
    let alreadyCorrect = 0
    let errors = []

    for (const booking of transferredBookings) {
      const payload = booking.payload
      const bookingId = booking.id
      const userId = booking.userId

      console.log(`\n📦 Processing booking: ${bookingId}`)
      console.log(`   User ID: ${userId}`)
      console.log(`   Trip: ${payload.tripTitle || payload.title}`)
      console.log(`   Customer: ${payload.customerName}`)

      // Check if PassengerBooking already exists
      const existingPassengerBooking = await prisma.passengerBooking.findUnique({
        where: {
          bookingId_userId: {
            bookingId: bookingId,
            userId: userId
          }
        }
      })

      if (existingPassengerBooking) {
        console.log(`   ✅ PassengerBooking already exists`)
        alreadyCorrect++
        continue
      }

      // Find the user who should own this booking
      let targetUser = null
      const customerEmail = payload.customerEmail
      const customerPhone = payload.customerPhone

      // Try to find user by email or phone
      if (customerEmail || customerPhone) {
        const searchConditions = []
        
        if (customerEmail && customerEmail !== 'N/A') {
          searchConditions.push(
            { email: customerEmail.toLowerCase().trim() }
          )
        }
        
        if (customerPhone && customerPhone !== 'N/A') {
          searchConditions.push(
            { phone: customerPhone.trim() }
          )
        }

        if (searchConditions.length > 0) {
          targetUser = await prisma.user.findFirst({
            where: { OR: searchConditions }
          })
        }
      }

      if (!targetUser) {
        console.log(`   ⚠️  Could not find user for email: ${customerEmail} or phone: ${customerPhone}`)
        console.log(`   ℹ️  Using booking.userId: ${userId}`)
        targetUser = await prisma.user.findUnique({ where: { uid: userId } })
      }

      if (!targetUser) {
        console.log(`   ❌ ERROR: Could not find any user for this booking`)
        errors.push({
          bookingId,
          error: 'User not found',
          email: customerEmail,
          phone: customerPhone
        })
        continue
      }

      // Create the missing PassengerBooking entry
      try {
        await prisma.passengerBooking.create({
          data: {
            bookingId: bookingId,
            userId: targetUser.uid,
            isPrimaryBooker: true
          }
        })

        console.log(`   ✅ Created PassengerBooking entry`)
        console.log(`      Booking: ${bookingId}`)
        console.log(`      User: ${targetUser.uid} (${targetUser.name})`)
        fixedCount++
      } catch (createError) {
        if (createError.code === 'P2002') {
          console.log(`   ℹ️  PassengerBooking already exists (race condition)`)
          alreadyCorrect++
        } else {
          console.log(`   ❌ Failed to create PassengerBooking: ${createError.message}`)
          errors.push({
            bookingId,
            error: createError.message,
            userId: targetUser.uid
          })
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total transferred bookings found: ${transferredBookings.length}`)
    console.log(`✅ Fixed (created PassengerBooking): ${fixedCount}`)
    console.log(`✓  Already correct: ${alreadyCorrect}`)
    console.log(`❌ Errors: ${errors.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. Booking ${err.bookingId}: ${err.error}`)
      })
    }

    console.log('\n✨ Migration completed!\n')

  } catch (error) {
    console.error('❌ Fatal error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
fixTransferredBookings()
  .then(() => {
    console.log('✅ Script finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
