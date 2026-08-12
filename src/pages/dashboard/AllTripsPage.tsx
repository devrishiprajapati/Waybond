import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, MapPin, Package, Download } from 'lucide-react'

interface Trip {
  id: string | number
  bookingId: string
  title: string
  image: string
  location: string
  duration: string
  price: number
  travelers: number
  bookedOn?: string
  cancelledOn?: string
  status: string
  highlights?: string[]
  nextBatch: string
}

const AllTripsPage = () => {
  const [bookedTrips, setBookedTrips] = useState<Trip[]>([])
  const [cancelledTrips, setCancelledTrips] = useState<Trip[]>([])
  const [allTrips, setAllTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(savedUser)

    // Verify that the userId in URL matches the logged-in user's database ID
    if (!parsedUser.id || (userId && userId !== parsedUser.id)) {
      navigate('/login')
      return
    }

    const loadAllTrips = async () => {
      try {
        if (!parsedUser.id) throw new Error('No database user')
        const response = await fetch(`/api/users/${parsedUser.id}/dashboard`)
        if (!response.ok) throw new Error('Dashboard unavailable')
        const data = await response.json()

        // Separate booked and cancelled trips
        const booked = data.bookings.filter((booking: any) => booking.status !== 'Cancelled')
        const cancelled = data.bookings.filter((booking: any) => booking.status === 'Cancelled')

        setBookedTrips(booked)
        setCancelledTrips(cancelled)
        setAllTrips(data.bookings)
      } catch (error) {
        console.error('Failed to load trips:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllTrips()
  }, [navigate, userId])

  const handleDownloadInvoice = (bookingId: string) => {
    navigate(`/booking-confirmation/${bookingId}`)
  }

  return (
    <div className="min-h-screen bg-white text-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-14 gap-6">
          <div className="space-y-4">
            <button
              onClick={() => navigate(`/dashboard/${userId}`)}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <h1 className="text-5xl md:text-7xl font-bungee font-black tracking-tighter uppercase italic leading-none liquid-text">
              All Your <span className="text-primary">Trips</span>
            </h1>
            <p className="text-white/50 max-w-2xl font-medium italic">
              View all your booked and cancelled trips in one place.
            </p>
          </div>
        </header>

        {/* Trip Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="liquid-glass-dark border border-white/10 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">Total Trips</p>
              <p className="text-3xl font-sans font-black text-white">{allTrips.length}</p>
            </div>
          </div>

          <div className="liquid-glass-dark border border-white/10 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">Booked Trips</p>
              <p className="text-3xl font-sans font-black text-white">{bookedTrips.length}</p>
            </div>
          </div>

          <div className="liquid-glass-dark border border-white/10 p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-300">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">Cancelled</p>
              <p className="text-3xl font-sans font-black text-white">{cancelledTrips.length}</p>
            </div>
          </div>
        </div>

        {/* Trips List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-white/40 font-medium">Loading trips...</p>
            </div>
          ) : allTrips.length === 0 ? (
            <div className="text-center py-16">
              <Package className="text-white/15 mx-auto mb-4" size={48} />
              <p className="text-lg text-white/40 font-medium italic">No trips yet. Start your adventure!</p>
            </div>
          ) : (
            allTrips.map((trip, index) => {
              const isCancelled = cancelledTrips.some((t) => t.id === trip.id || t.bookingId === trip.bookingId)

              return (
                <motion.article
                  key={trip.bookingId || trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`liquid-glass-dark border rounded-[2.5rem] overflow-hidden ${isCancelled ? 'border-red-500/20 opacity-75' : 'border-white/10'
                    }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
                    {/* Image Section */}
                    <div className="relative h-56 md:h-full min-h-[240px]">
                      <img
                        src={trip.image}
                        alt={trip.title}
                        className={`absolute inset-0 w-full h-full object-cover ${isCancelled ? 'grayscale' : ''}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <span
                        className={`absolute left-5 bottom-5 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] ${isCancelled
                            ? 'bg-red-500 text-white'
                            : trip.status === 'Confirmed'
                              ? 'bg-green-500 text-white'
                              : 'bg-secondary text-white'
                          }`}
                      >
                        {trip.status}
                      </span>
                    </div>

                    {/* Content Section */}
                    <div className="p-7 md:p-8 space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.25em]">
                            Booking ID {trip.bookingId}
                          </p>
                          <h3 className="text-2xl md:text-3xl font-bungee font-black uppercase italic tracking-tighter leading-none">
                            {trip.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.16em]">
                            <span className="flex items-center gap-2">
                              <MapPin size={13} className={isCancelled ? 'text-red-400' : 'text-secondary'} />
                              {trip.location}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock size={13} className={isCancelled ? 'text-red-400' : 'text-secondary'} />
                              {trip.duration}
                            </span>
                          </div>
                        </div>
                        <div className="text-left lg:text-right">
                          <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.22em]">Total Amount</p>
                          <p className="text-3xl font-sans font-black text-white tracking-tighter">₹{trip.price}</p>
                        </div>
                      </div>

                      {/* Trip Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { label: 'Next Batch', value: trip.nextBatch },
                          {
                            label: 'Travelers',
                            value: `${trip.travelers} Member${trip.travelers > 1 ? 's' : ''}`
                          },
                          {
                            label: isCancelled ? 'Cancelled On' : 'Booked On',
                            value: isCancelled ? trip.cancelledOn : trip.bookedOn
                          }
                        ].map((item) => (
                          <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">
                              {item.label}
                            </p>
                            <p className="text-sm font-black text-white mt-2">{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2">
                        {trip.highlights?.slice(0, 4).map((highlight: string) => (
                          <span
                            key={highlight}
                            className={`rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] ${isCancelled
                                ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                                : 'bg-secondary/10 text-secondary border border-secondary/20'
                              }`}
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => navigate(`/trip/${trip.id}`)}
                          className="bg-secondary text-white h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] hover:bg-white hover:text-slate-800 transition-all"
                        >
                          View Details
                        </button>

                        {!isCancelled && trip.status === 'Confirmed' && (
                          <button
                            onClick={() => handleDownloadInvoice(trip.bookingId)}
                            className="bg-green-500/10 text-green-300 h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] border border-green-500/20 hover:bg-green-500 hover:text-white transition-all gap-2"
                          >
                            <Download size={14} />
                            Download Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default AllTripsPage
