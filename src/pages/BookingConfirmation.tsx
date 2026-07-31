import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Calendar, Users, CreditCard, Download, Share2, MapPin } from 'lucide-react'

interface BookingData {
  bookingId: string
  tripTitle: string
  tripImage: string
  category: string
  startDate: string
  endDate: string
  guests: number
  guestName: string
  guestEmail: string
  baseFare: number
  upgrade: number
  taxes: number
  totalPaid: number
  cardLast4: string
  issueDate: string
}

const BookingConfirmation = () => {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const navigate = useNavigate()
  const { bookingId } = useParams()

  useEffect(() => {
    // Try to get booking data from location state or localStorage
    const savedBookings = localStorage.getItem('waybond_user_bookings')
    if (savedBookings && bookingId) {
      const bookings = JSON.parse(savedBookings)
      const booking = bookings.find((b: any) => b.bookingId === bookingId || b.id === bookingId)
      
      if (booking) {
        setBookingData({
          bookingId: booking.bookingId || `WB-${booking.id}`,
          tripTitle: booking.title,
          tripImage: booking.image,
          category: booking.category || 'ADVENTURE SERIES',
          startDate: booking.startDate || 'Oct 12, 2024',
          endDate: booking.endDate || 'Oct 20, 2024',
          guests: booking.travelers || 2,
          guestName: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).name : 'Guest',
          guestEmail: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : 'guest@example.com',
          baseFare: booking.price || 2450,
          upgrade: Math.round(booking.price * 0.18) || 450,
          taxes: Math.round((booking.price + Math.round(booking.price * 0.18)) * 0.07) || 182.40,
          totalPaid: booking.price ? Math.round(booking.price * 1.25) : 3082.40,
          cardLast4: '1234',
          issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
        })
      }
    }
  }, [bookingId])

  const handleDownloadPDF = () => {
    // In a real app, this would generate and download a PDF
    alert('PDF download feature coming soon!')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Booking Confirmation',
        text: `Check out my booking for ${bookingData?.tripTitle}!`,
        url: window.location.href
      }).catch((err) => console.log('Share failed:', err))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Booking link copied to clipboard!')
    }
  }

  const handleMyTrips = () => {
    const user = localStorage.getItem('user')
    if (user) {
      const userId = JSON.parse(user).email?.replace(/[^a-z0-9]/g, '')
      navigate(`/dashboard/${userId}/booked-trips`)
    } else {
      navigate('/login')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-white text-white pt-32 pb-20 px-6 md:px-12 lg:px-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50">Loading booking confirmation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-white pt-20 pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-6xl mx-auto h-16 px-6 md:px-12 lg:px-20 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-slate-800 font-black text-[10px] uppercase tracking-widest">WayBond</span>
            <span className="text-slate-800 font-black text-sm">Booking Confirmation</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="flex flex-col items-center px-6 md:px-12 pt-6 pb-8 text-center bg-gradient-to-b from-blue-50 to-transparent">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4 shadow-lg shadow-green-500/20">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black uppercase italic text-slate-800 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-slate-600 font-medium italic">Your adventure with WayBond is ready to begin.</p>
        </div>

        {/* Hero Card */}
        <div className="px-6 md:px-12 -mt-2">
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white">
            {/* Image */}
            <div className="h-56 md:h-64 w-full relative">
              <img alt={bookingData.tripTitle} className="w-full h-full object-cover" src={bookingData.tripImage} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
                <div className="text-white">
                  <span className="text-[9px] font-black uppercase tracking-[0.18em] bg-blue-500/30 backdrop-blur-md px-3 py-1.5 rounded-full inline-block mb-3">
                    {bookingData.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight">{bookingData.tripTitle}</h2>
                </div>
              </div>
            </div>

            {/* Quick Info Ribbon */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-blue-600" />
                <span className="text-sm font-black text-slate-800">
                  {bookingData.startDate} — {bookingData.endDate}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users size={20} className="text-blue-600" />
                <span className="text-sm font-black text-slate-800">{bookingData.guests} Guests</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details Card */}
        <div className="px-6 md:px-12 mt-8">
          <div className="p-6 md:p-8 rounded-2xl bg-white shadow-md space-y-6">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-200">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Booking ID</p>
                <p className="text-lg font-black text-slate-800">{bookingData.bookingId}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Issue Date</p>
                <p className="text-lg font-black text-slate-800">{bookingData.issueDate}</p>
              </div>
            </div>

            {/* Guest Info */}
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Guest Details</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center text-blue-900 font-black text-sm">
                  {getInitials(bookingData.guestName)}
                </div>
                <div>
                  <p className="font-black text-slate-800 leading-none">{bookingData.guestName}</p>
                  <p className="text-sm text-slate-600 font-medium">{bookingData.guestEmail}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Payment Breakdown</p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Base Expedition Fare</span>
                  <span className="font-black text-slate-800">₹{bookingData.baseFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Luxury Camp Upgrade</span>
                  <span className="font-black text-slate-800">₹{bookingData.upgrade.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Taxes & Permits</span>
                  <span className="font-black text-slate-800">₹{bookingData.taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center">
                  <span className="font-black text-slate-800">Total Paid</span>
                  <span className="text-2xl font-display font-black text-blue-600">₹{bookingData.totalPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border border-blue-200">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Paid via Card ending in **** {bookingData.cardLast4}</span>
              </div>
              <span className="text-[9px] font-black text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-widest">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="px-6 md:px-12 py-8 space-y-4">
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-slate-800 text-white py-4 rounded-xl font-white text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors active:scale-95"
          >
            <Download size={16} />
            Download PDF Invoice
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleShare}
              className="bg-white text-slate-800 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors active:scale-95"
            >
              <Share2 size={16} />
              Share
            </button>
            <button
              onClick={handleMyTrips}
              className="bg-white text-slate-800 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors active:scale-95"
            >
              <MapPin size={16} />
              My Trips
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookingConfirmation
