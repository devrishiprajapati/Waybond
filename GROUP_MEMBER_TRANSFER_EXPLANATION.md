# Group Member Transfer - Traveler Count Update

## How It Works

When you transfer a single member (e.g., "Patel Samarth") from a group booking to a different package, the system updates the traveler count for **everyone** in the group automatically.

## Technical Flow

### 1. **Original Booking Structure**
```
Booking ID: WB-123456
Trip: Seychelles Paradise
Travelers: 2
Members:
  - Demo User (one1@gmail.com)
  - Patel Samarth (patelsamarth200@gmail.com)
```

### 2. **When "Transfer Only: Patel Samarth" is Selected**

The backend performs these operations:

#### A. Update Original Booking (Line 2241-2252 in server.js)
```javascript
updatedPayload = {
  ...oldPayload,
  travelers: 1,  // Reduced from 2 to 1
  travellerDetails: [
    { name: "Demo User", email: "one1@gmail.com" }
  ],  // Only remaining member
  participantRemovals: [
    {
      participantName: "Patel Samarth",
      participantEmail: "patelsamarth200@gmail.com",
      removedAt: "2025-01-20T10:30:00Z",
      reason: "Package Transfer"
    }
  ]
}
```

The booking is then updated in the database:
```javascript
await prisma.booking.update({
  where: { id: booking.id },
  data: { payload: updatedPayload }
})
```

#### B. PassengerBooking Links (Automatic Visibility)

The `PassengerBooking` table links users to bookings:

```
PassengerBooking Table:
┌────────────┬───────────────┬─────────────────┐
│ bookingId  │ userId        │ passengerName   │
├────────────┼───────────────┼─────────────────┤
│ WB-123456  │ usr-demo-001  │ Demo User       │
│ WB-123456  │ usr-sam-002   │ Patel Samarth   │  ← Deleted after transfer
└────────────┴───────────────┴─────────────────┘
```

When Patel Samarth is transferred:
1. His `PassengerBooking` entry is deleted
2. Demo User's entry remains
3. Demo User sees the **same booking** (WB-123456) but with updated payload showing 1 traveler

#### C. Create New Booking for Transferred Member (Line 2383-2404)
```javascript
New Booking:
  ID: WB-789012
  Trip: New Package Selected
  Travelers: 1
  Members: [Patel Samarth]
  Status: Confirmed
  Payment Status: Pending Payment
```

### 3. **Result After Transfer**

#### Original Booking (WB-123456)
```
Trip: Seychelles Paradise
Travelers: 1  ← Updated!
Members:
  - Demo User (one1@gmail.com)

Visible to:
  - Demo User (via PassengerBooking)
  - Primary Booker (whoever created the original booking)
```

#### New Booking (WB-789012)
```
Trip: [New Selected Package]
Travelers: 1
Members:
  - Patel Samarth (patelsamarth200@gmail.com)

Visible to:
  - Patel Samarth (via PassengerBooking or new user account)
```

## Key Points

### ✅ All Group Members See Updated Count
- The traveler count is stored in the **booking payload**
- All remaining members reference the **same booking ID**
- When the payload is updated, everyone sees the change instantly
- No need to update each member individually

### ✅ Removed Member Loses Access
```javascript
// This ensures removed member can't see original booking anymore
await prisma.passengerBooking.deleteMany({
  where: {
    bookingId: originalBookingId,
    userId: transferredMemberUserId
  }
})
```

### ✅ Automatic User Account Creation
If the transferred member doesn't have a user account:
```javascript
memberUser = await prisma.user.create({
  data: {
    uid: `usr-${Date.now()}-${random()}`,
    email: removedParticipant.email,
    name: removedParticipant.name,
    phone: removedParticipant.phone,
    passwordHash: tempPassword  // They'll need to reset
  }
})
```

## UI Display

### Before Transfer
```
┌─────────────────────────────────────┐
│ SEYCHELLES PARADISE                 │
│ Mahé & Praslin                      │
│                                     │
│ WB-MTYR92BD-YNV  2 TRAVELLER(S)     │  ← Shows 2
└─────────────────────────────────────┘
```

### After Transfer (Demo User sees)
```
┌─────────────────────────────────────┐
│ SEYCHELLES PARADISE                 │
│ Mahé & Praslin                      │
│                                     │
│ WB-MTYR92BD-YNV  1 TRAVELLER(S)     │  ← Updated to 1
└─────────────────────────────────────┘
```

### After Transfer (Patel Samarth sees)
```
┌─────────────────────────────────────┐
│ NEW PACKAGE SELECTED                │
│ Location                            │
│                                     │
│ WB-789012  1 TRAVELLER(S)           │  ← New booking
└─────────────────────────────────────┘
```

## Code Changes Summary

### Modified: `backend/src/server.js`

1. **Split updatedPayload logic** (lines 2236-2273)
   - Group member transfer: Keep original trip, reduce count
   - Full transfer: Move to new trip

2. **Added logging** (lines 2210-2218, 2312-2318)
   - Track traveler count changes
   - Verify remaining members

3. **Proper PassengerBooking cleanup** (lines 2373-2382)
   - Remove transferred member's access
   - Keep remaining members' access

4. **Conditional reschedule records** (lines 2275-2295)
   - Only for full booking transfers
   - Group member transfers don't need reschedule

## Testing Checklist

- [x] Backend syntax validated
- [ ] Test with 2-member group booking
- [ ] Verify original booking shows reduced count
- [ ] Verify new booking created for transferred member
- [ ] Check all remaining members see updated count
- [ ] Verify transferred member can't see original booking
- [ ] Check payment amounts recalculated correctly
- [ ] Test with 3+ member groups
- [ ] Verify UI displays correct counts everywhere

## Console Logs to Watch For

```
Group member transfer: {
  originalTravelerCount: 2,
  removedMember: 'Patel Samarth',
  remainingTravelerCount: 1,
  remainingMembers: [ 'Demo User' ]
}

Original booking updated: {
  bookingId: 'WB-123456',
  newTravelerCount: 1,
  remainingMembers: 1,
  message: 'All group members will see this updated count'
}

Creating new booking for transferred member: {
  name: 'Patel Samarth',
  email: 'patelsamarth200@gmail.com',
  originalUserId: 'usr-original'
}
```
