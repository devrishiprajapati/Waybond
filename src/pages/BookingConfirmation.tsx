import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, MapPin, Clock, Check, IndianRupee, CheckCircle, X, ArrowLeft } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { haptics } from '../lib/haptics'
import { getUser } from '../lib/auth'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: () => void) => void }
  }
}

const loadRazorpay = () => new Promise<boolean>((resolve) => {
  if (window.Razorpay) return resolve(true)
  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload = () => resolve(true)
  script.onerror = () => resolve(false)
  document.body.appendChild(script)
})

type RazorpayPaymentResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

const BookingConfirmation = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const bookingData = location.state as any

  const [paying, setPaying] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(true)

  useEffect(() => {
    if (!bookingData) {
      navigate('/discover')
    }
  }, [bookingData, navigate])

  // Auto-hide popup after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccessPopup(false)
    }, 4000)
    
    return () => clearTimeout(timer)
  }, [])

  if (!bookingData) return null

  const { trip, departure, travellers, numTravellers } = bookingData
  const pricePerPerson = Number(String(trip.price || '').replace(/[^\d.]/g, ''))
  const subtotal = pricePerPerson * numTravellers
  const gst = Math.round(subtotal * 0.05) // 5% GST
  const totalAmount = subtotal + gst

  const handlePayNow = async () => {
    haptics.medium()

    // Check if user is logged in
    const user = getUser()
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent('/booking-confirmation')}`)
      return
    }

    try {
      if (!user.id) throw new Error('User ID not found')

      // Create unique booking ID
      const timestamp = Date.now().toString(36).toUpperCase()
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase()
      const uniqueBookingId = `WB-${timestamp}-${randomSuffix}`

      // Create booking payload
      const bookingPayload = {
        id: trip.id,
        title: trip.title,
        location: trip.location,
        duration: trip.duration,
        price: trip.price,
        image: trip.image,
        rating: trip.rating,
        reviews: trip.reviews,
        description: trip.description,
        highlights: trip.highlights || [],
        itinerary: trip.itinerary || [],
        departureDates: trip.departureDates || [],
        bookingId: uniqueBookingId,
        status: 'Payment Pending',
        travelers: numTravellers,
        travellerDetails: travellers,
        bookedOn: new Date().toLocaleDateString('en-IN'),
        nextBatch: departure || trip.departureDates?.[0] || 'TBD'
      }

      // Save to database
      const response = await fetch(`/api/users/${user.id}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      })

      if (!response.ok) throw new Error('Failed to create booking')
      const booking = await response.json()

      const amount = Math.round(totalAmount * 100)
      if (!Number.isInteger(amount) || amount < 100) throw new Error('Invalid amount')

      setPaying(true)
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.bookingDbId, userId: user.id, amount })
      })
      const order = await orderResponse.json()
      if (!orderResponse.ok) throw new Error(order.message || 'Unable to start payment')
      if (!(await loadRazorpay()) || !window.Razorpay) throw new Error('Razorpay checkout could not be loaded')

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'WayBond',
        description: trip.title,
        order_id: order.orderId,
        prefill: {
          name: travellers[0]?.name || user.name,
          email: travellers[0]?.email || user.email,
          contact: travellers[0]?.phone || ''
        },
        theme: { color: '#6495ED' },
        handler: async (payment: RazorpayPaymentResponse) => {
          try {
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payment)
            })
            const verified = await verifyResponse.json()
            if (!verifyResponse.ok || !verified.success) throw new Error(verified.message || 'Payment verification failed')
            alert('Payment successful. Your trip is confirmed!')
            navigate(`/dashboard/${user.id}`)
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment was received but verification failed. Please contact support.')
          } finally {
            setPaying(false)
          }
        },
        modal: { ondismiss: () => setPaying(false) }
      })
      razorpay.open()
    } catch (error) {
      console.error('Payment failed:', error)
      setPaying(false)
      alert(error instanceof Error ? error.message : 'Unable to start payment. Please try again.')
    }
  }

  return (
    <>
      <Helmet>
        <title>Booking Confirmation - {trip.title} | WAYBOND</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Booking Details</h1>
          <p className="text-center text-gray-600 mb-8">Review your booking and proceed to payment</p>

          {/* Trip Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6"
          >
            <div className="flex gap-4 mb-6">
              <img
                src={trip.image}
                alt={trip.title}
                className="w-24 h-24 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h2 className="font-black text-xl text-gray-900 mb-1">{trip.title}</h2>
                <p className="text-gray-600 text-sm mb-2">{trip.location}</p>
                <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                  Pending
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-700">
                <Clock size={18} className="mr-3 text-gray-400" />
                <span className="font-semibold">{trip.duration}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Calendar size={18} className="mr-3 text-gray-400" />
                <span className="font-semibold">
                  {departure ? new Date(departure).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Date TBD'}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <Users size={18} className="mr-3 text-gray-400" />
                <span className="font-semibold">{numTravellers} Traveler{numTravellers > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Traveller Names */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-black text-gray-900 mb-3">Travellers</h3>
              <div className="space-y-2">
                {travellers.map((traveller: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <span className="text-gray-700 font-semibold">{traveller.name}</span>
                    <span className="text-gray-500 text-sm">{traveller.age} years</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Savings Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 mb-6 border border-green-200"
          >
            <p className="text-center text-green-700 font-bold text-sm">
              🎉 You saved ₹{Math.round(pricePerPerson * 0.15).toLocaleString('en-IN')} on this trip
            </p>
          </motion.div>

          {/* Amount Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
              <IndianRupee size={24} className="mr-2" />
              Amount to Pay: ₹{totalAmount.toLocaleString('en-IN')}
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-gray-900">₹{pricePerPerson.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">No of Participants</span>
                <span className="font-bold text-gray-900">{numTravellers}</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">GST (5%)</span>
                <span className="font-bold text-gray-900">₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-4 flex justify-between">
                <span className="text-lg font-black text-gray-900">Amount To Pay</span>
                <span className="text-lg font-black text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </motion.div>

          {/* Pay Now Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handlePayNow}
            disabled={paying}
            className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-full font-black text-lg uppercase tracking-wide shadow-xl shadow-secondary/30 transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {paying ? 'Processing Payment...' : 'Pay Now'}
          </motion.button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </>
  )
}

export default BookingConfirmation
