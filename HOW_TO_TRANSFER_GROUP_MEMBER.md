# How to Transfer a Group Member to Another Package

## ✨ What Was Implemented

The existing **Transfer Package Modal** now supports:
1. **Transfer Entire Booking** - Move all travelers to a new package (original behavior)
2. **Transfer Individual Member** - Move ONE member to a new package:
   - **Automatically removes** them from the original group
   - **Creates a new booking** for them in the target package

---

## 🎯 How It Works

### Before:
```
Group Booking: Goa Trip (ID: WB-12345)
- Jane (3 people total)
- John
- Alice
Total: 3 × ₹15,000 = ₹45,000
```

### You Transfer John to Himalayan Trek:

### After:
```
Original Booking (Goa Trip - WB-12345):
- Jane
- Alice
Total: 2 × ₹15,000 = ₹30,000  ✅ John removed automatically

NEW Booking Created (Himalayan Trek - WB-NEW-123):
- John (transferred from Goa Trip)
Total: 1 × ₹20,000 = ₹20,000  ✅ New booking for John
Status: Confirmed
Payment Status: Pending Payment
```

---

## 🚀 How to Use

### Step 1: Open Transfer Package Modal

In your **Admin Bookings Page**, click the transfer button for any booking:

```tsx
<TransferPackageModal
  booking={booking}
  bookingDbId={booking.bookingId}
  onClose={() => setShowModal(false)}
  onUpdate={(updatedBooking) => {
    // Refresh bookings
    refreshBookings()
  }}
/>
```

### Step 2: Select Transfer Type

The modal will show:

**For Group Bookings (2+ travelers):**
```
┌──────────────────────────────────────┐
│ This is a group booking with 3       │
│ travelers. Select transfer type:     │
│                                      │
│ ○ Transfer Entire Booking           │
│   Move all 3 travelers to new       │
│   package                           │
│                                      │
│ ○ Transfer Only: Jane               │
│   jane@example.com                  │
│   This member will be removed       │
│                                      │
│ ○ Transfer Only: John               │
│   john@example.com                  │
│   This member will be removed       │
│                                      │
│ ○ Transfer Only: Alice              │
│   alice@example.com                 │
│   This member will be removed       │
└──────────────────────────────────────┘
```

### Step 3: Select Destination Package

Choose the package to transfer to from the dropdown.

### Step 4: Confirm Transfer

Click **"Transfer Package"** button.

---

## 🔧 What Happens Automatically

When you transfer a **single group member**:

### Backend Updates:

```javascript
// Original booking before transfer
{
  bookingId: "WB-12345",
  travelers: 3,
  travellerDetails: [
    { name: "Jane" },
    { name: "John" },  // ← This person is being transferred
    { name: "Alice" }
  ],
  totalAmount: 45000,
  price: 15000
}

// After transferring John (index 1)
{
  bookingId: "WB-12345",
  travelers: 2,  // ✅ Automatically decreased
  travellerDetails: [
    { name: "Jane" },
    { name: "Alice" }  // ✅ John removed
  ],
  totalAmount: 30000,  // ✅ Recalculated (2 × 15000)
  price: 15000,
  participantRemovals: [{  // ✅ History added
    participantName: "John",
    removedAt: "2024-01-15...",
    reason: "Package Transfer"
  }]
}
```

---

## 📝 API Changes

### Backend Endpoint: `/api/bookings/:bookingId/transfer`

**New Parameter Added:**
```json
{
  "targetTripId": 123,
  "participantIndex": 1  // ← NEW: Index of participant to transfer (optional)
}
```

**If `participantIndex` is provided:**
- That specific participant is removed from the original booking
- Traveler count is decreased
- Total amount is recalculated
- Removal is logged in history

**If `participantIndex` is NOT provided:**
- Entire booking is transferred (original behavior)
- All travelers move to new package

---

## ✅ Features

- ✅ Automatic member removal from original booking
- ✅ Automatic traveler count update
- ✅ Automatic amount recalculation
- ✅ Transfer history tracking
- ✅ Removal history tracking
- ✅ Works with existing Transfer Package Modal
- ✅ No additional UI components needed

---

## 🎬 Complete Example

### Admin wants to transfer John from Goa to Himalayan Trek:

1. **Open Bookings Management**
2. **Find the Goa Trip booking** (3 travelers: Jane, John, Alice)
3. **Click "Transfer Package" button**
4. **Modal opens showing all group members**
5. **Select: "Transfer Only: John"** (radio button)
6. **Select destination: "Himalayan Trek"** (dropdown)
7. **Click "Transfer Package"** button
8. **Success!** 
   - John removed from Goa booking
   - Goa booking now has 2 travelers
   - Transfer complete

---

## 📊 Visual Flow

```
Admin Action:
1. Click Transfer on Goa booking (3 people)
     ↓
2. Select "Transfer Only: John"
     ↓
3. Select destination "Himalayan Trek"
     ↓
4. Click Transfer Package
     ↓
5. Backend Process:
   - Remove John from Goa booking ✓
   - Update travelers: 3 → 2 ✓
   - Update total: ₹45k → ₹30k ✓
   - Log removal in history ✓
     ↓
6. Success Message!
   "Package transferred successfully! 
    Member removed from original booking."
```

---

## 🐛 Troubleshooting

### Issue: Don't see "Transfer Only" options
**Solution:** This only appears for group bookings (2+ travelers with traveller details)

### Issue: Wrong person removed
**Solution:** Double-check which radio button is selected before clicking transfer

### Issue: Total amount not updated
**Solution:** Refresh the bookings list after transfer

---

## 🎉 Summary

**You can now:**
- Transfer individual group members to different packages
- Members are automatically removed from original booking
- All calculations update automatically
- Full history tracking maintained

**Just use the existing Transfer Package Modal - no new components needed!**

---

## 📞 Quick Reference

**Transfer Entire Booking:**
- Select: "Transfer Entire Booking" radio button
- All travelers move together

**Transfer Single Member:**
- Select: "Transfer Only: [Name]" radio button
- Only that member moves
- Automatically removed from original booking
- Original booking travelers count decreases
