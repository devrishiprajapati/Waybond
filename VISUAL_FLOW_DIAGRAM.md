# Visual Flow: Group Member Transfer

## Before Transfer

```
┌──────────────────────────────────────────────────────────┐
│                    DATABASE STATE                        │
└──────────────────────────────────────────────────────────┘

Booking Table:
┌─────────────────────────────────────────────────────────┐
│ ID: WB-123456                                           │
│ userId: usr-demo-001 (Primary Booker)                   │
│ payload: {                                              │
│   travelers: 2                                          │
│   travellerDetails: [                                   │
│     { name: "Demo User", email: "one1@gmail.com" }      │
│     { name: "Patel Samarth",                            │
│       email: "patelsamarth200@gmail.com" }              │
│   ]                                                     │
│   trip: "Seychelles Paradise"                           │
│ }                                                       │
└─────────────────────────────────────────────────────────┘

PassengerBooking Table:
┌─────────────┬──────────────┬─────────────────┬─────────┐
│ bookingId   │ userId       │ passengerName   │ Primary │
├─────────────┼──────────────┼─────────────────┼─────────┤
│ WB-123456   │ usr-demo-001 │ Demo User       │ true    │
│ WB-123456   │ usr-sam-002  │ Patel Samarth   │ false   │
└─────────────┴──────────────┴─────────────────┴─────────┘


WHAT USERS SEE:
┌──────────────────────────┐  ┌──────────────────────────┐
│  Demo User's Dashboard   │  │ Samarth's Dashboard      │
├──────────────────────────┤  ├──────────────────────────┤
│ SEYCHELLES PARADISE      │  │ SEYCHELLES PARADISE      │
│ Booking: WB-123456       │  │ Booking: WB-123456       │
│ ⚡ 2 TRAVELLER(S) ⚡      │  │ ⚡ 2 TRAVELLER(S) ⚡      │
│ Status: Confirmed        │  │ Status: Confirmed        │
│ Booked by: Demo User     │  │ Booked by: Demo User     │
└──────────────────────────┘  └──────────────────────────┘
```

## Transfer Action

```
┌──────────────────────────────────────────────────────────┐
│          ADMIN CLICKS "TRANSFER PACKAGE"                 │
└──────────────────────────────────────────────────────────┘

Transfer Modal:
┌─────────────────────────────────────────────────────────┐
│ 📦 Package Transfer                                     │
│                                                         │
│ This is a group booking with 2 travelers.               │
│ Select transfer type:                                   │
│                                                         │
│ ○ Transfer Entire Booking                               │
│   Move all 2 travelers to new package                   │
│                                                         │
│ ● Transfer Only: Patel Samarth          ← SELECTED      │
│   patelsamarth200@gmail.com                             │
│   • This member will be removed from group              │
│                                                         │
│ New Package: [Bali Adventure ▼]                         │
│                                                         │
│         [Transfer Package] ←── CLICKED                  │
└─────────────────────────────────────────────────────────┘

API Call:
POST /api/bookings/WB-123456/transfer
{
  targetTripId: 42,  // Bali Adventure
  participantIndex: 1  // Patel Samarth (index in array)
}
```

## Backend Processing

```
┌──────────────────────────────────────────────────────────┐
│               BACKEND LOGIC EXECUTION                    │
└──────────────────────────────────────────────────────────┘

STEP 1: Identify Transfer Type
isGroupMemberTransfer = true (participantIndex = 1)

STEP 2: Extract Removed Member
removedParticipant = {
  name: "Patel Samarth",
  email: "patelsamarth200@gmail.com"
}

STEP 3: Update Traveler List
updatedTravellerDetails = [
  { name: "Demo User", email: "one1@gmail.com" }
]  // Filtered out index 1

STEP 4: Calculate New Count
travelers = Math.max(1, updatedTravellerDetails.length)
         = Math.max(1, 1)
         = 1  ✅

STEP 5: Build Updated Payload (Original Booking)
updatedPayload = {
  ...oldPayload,
  travelers: 1,  ← REDUCED COUNT
  travellerDetails: updatedTravellerDetails,  ← ONE MEMBER
  // Keep original trip details
  trip: "Seychelles Paradise",
  participantRemovals: [...history, newRemoval]
}

STEP 6: Update Database
UPDATE Booking 
SET payload = updatedPayload 
WHERE id = 'WB-123456'

STEP 7: Create New Booking for Transferred Member
INSERT INTO Booking
{
  id: WB-789012,
  userId: usr-sam-002,
  payload: {
    travelers: 1,
    travellerDetails: [
      { name: "Patel Samarth", email: "patelsamarth200@gmail.com" }
    ],
    trip: "Bali Adventure"  ← NEW PACKAGE
  }
}

STEP 8: Update PassengerBooking Links
DELETE FROM PassengerBooking 
WHERE bookingId = 'WB-123456' 
  AND userId = 'usr-sam-002'

INSERT INTO PassengerBooking
{
  bookingId: 'WB-789012',
  userId: 'usr-sam-002',
  isPrimaryBooker: true
}
```

## After Transfer

```
┌──────────────────────────────────────────────────────────┐
│                    DATABASE STATE                        │
└──────────────────────────────────────────────────────────┘

Booking Table:
┌─────────────────────────────────────────────────────────┐
│ ID: WB-123456                            ← UPDATED      │
│ userId: usr-demo-001                                    │
│ payload: {                                              │
│   travelers: 1  ←─────────── CHANGED FROM 2            │
│   travellerDetails: [                                   │
│     { name: "Demo User", email: "one1@gmail.com" }      │
│   ]  ←────────────────────── ONLY 1 MEMBER NOW         │
│   trip: "Seychelles Paradise"  ← SAME TRIP             │
│   participantRemovals: [{                               │
│     participantName: "Patel Samarth",                   │
│     removedAt: "2025-01-20T10:30:00Z"                   │
│   }]                                                    │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ ID: WB-789012                            ← NEW BOOKING  │
│ userId: usr-sam-002                                     │
│ payload: {                                              │
│   travelers: 1                                          │
│   travellerDetails: [                                   │
│     { name: "Patel Samarth",                            │
│       email: "patelsamarth200@gmail.com" }              │
│   ]                                                     │
│   trip: "Bali Adventure"  ← NEW PACKAGE                 │
│ }                                                       │
└─────────────────────────────────────────────────────────┘

PassengerBooking Table:
┌─────────────┬──────────────┬─────────────────┬─────────┐
│ bookingId   │ userId       │ passengerName   │ Primary │
├─────────────┼──────────────┼─────────────────┼─────────┤
│ WB-123456   │ usr-demo-001 │ Demo User       │ true    │
│ WB-789012   │ usr-sam-002  │ Patel Samarth   │ true    │
└─────────────┴──────────────┴─────────────────┴─────────┘
             ↑ Samarth removed from original booking


WHAT USERS NOW SEE:
┌──────────────────────────┐  ┌──────────────────────────┐
│  Demo User's Dashboard   │  │ Samarth's Dashboard      │
├──────────────────────────┤  ├──────────────────────────┤
│ SEYCHELLES PARADISE      │  │ BALI ADVENTURE           │
│ Booking: WB-123456       │  │ Booking: WB-789012       │
│ ⚡ 1 TRAVELLER(S) ⚡ ✅   │  │ ⚡ 1 TRAVELLER(S) ⚡      │
│ Status: Confirmed        │  │ Status: Confirmed        │
│ Booked by: Demo User     │  │ Payment: Pending         │
└──────────────────────────┘  └──────────────────────────┘
    COUNT AUTOMATICALLY             NEW BOOKING
    UPDATED FOR ALL!                ON NEW PACKAGE
```

## Key Mechanism: Why All Members See Updated Count

```
┌──────────────────────────────────────────────────────────┐
│           HOW GROUP MEMBERS SEE BOOKINGS                 │
└──────────────────────────────────────────────────────────┘

When a user logs in and views "My Trips":

QUERY EXECUTED:
┌─────────────────────────────────────────────────────────┐
│ 1. Find all PassengerBookings for this user             │
│    SELECT * FROM PassengerBooking WHERE userId = '...'  │
│                                                         │
│ 2. For each PassengerBooking, load the Booking data    │
│    SELECT * FROM Booking WHERE id = bookingId           │
│                                                         │
│ 3. Display booking.payload.travelers                    │
└─────────────────────────────────────────────────────────┘

CRITICAL POINT:
┌─────────────────────────────────────────────────────────┐
│ Multiple users → Same bookingId → Same payload data     │
│                                                         │
│ When payload is updated:                                │
│   ✅ Demo User sees travelers: 1 (from WB-123456)       │
│   ✅ Any other remaining member sees travelers: 1       │
│   ✅ NO individual updates needed per user!             │
│                                                         │
│ It's a SHARED booking record, not individual copies!    │
└─────────────────────────────────────────────────────────┘
```

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Original Booking (WB-123456)** | | |
| Travelers | 2 | 1 ✅ |
| Members | Demo + Samarth | Demo only ✅ |
| Trip | Seychelles | Seychelles (unchanged) |
| Visible to | Both users | Demo only ✅ |
| **New Booking (WB-789012)** | | |
| Travelers | - | 1 ✅ |
| Members | - | Samarth only ✅ |
| Trip | - | Bali Adventure ✅ |
| Visible to | - | Samarth only ✅ |

✅ **Result**: All group members automatically see the updated traveler count because they all reference the same booking record in the database!
