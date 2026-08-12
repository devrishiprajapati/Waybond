import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MapPin, ArrowLeft, Package, AlertCircle } from 'lucide-react'

const CancelledTripsPage = () => {
  const [cancelledTrips, setCancelledTrips] = useState<any[]>([])
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

    const loadCancelledTrips = async () => {
      try {
        if (!parsedUser.id) throw new Error('No database user')
        const response = await fetch(`/api/users/${parsedUser.id}/dashboard`)
        if (!response.ok) throw new Error('Dashboard unavailable')
        const data = await response.json()

        // Filter only cancelled bookings
        const cancelled = data.bookings.filter((booking: any) => booking.status === 'Cancelled')
        setCancelledTrips(cancelled)
      } catch (error) {
        console.error('Failed to load cancelled trips:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCancelledTrips()
  }, [navigate, userId])

  return (
    <div className="min-h-screen bg-white text-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-14">
          <button
            onClick={() => navigate(`/dashboard/${userId}`)}
            className="flex items-center gap-2 text-secondary hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest mb-6"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div className="space-y-4">
            <span className="text-red-400 font-black uppercase tracking-[0.4em] text-[10px]">Cancellation History</span>
            <h1 className="text-5xl md:text-7xl font-bungee font-black tracking-tighter uppercase italic leading-none liquid-text">
              Cancelled <span className="text-red-400">Trips</span>
            </h1>
            <p className="text-white/50 max-w-2xl font-medium italic">
              View your cancelled bookings and refund information.
            </p>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/40 font-medium">Loading cancelled trips...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {cancelledTrips.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-12 md:p-16 text-center"
              >
                <Package className="text-white/15 mx-auto mb-6" size={48} />
                <h2 className="text-2xl font-bungee font-black text-white mb-3">No Cancelled Trips</h2>
                <p className="text-white/50 font-medium mb-8">Great! You haven't cancelled any trips yet.</p>
                <button
                  onClick={() => navigate('/discover')}
                  className="bg-secondary text-white h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] hover:bg-white hover:text-slate-800 transition-all"
                >
                  Book a Trip
                </button>
              </motion.div>
            ) : (
              <div className="space-y-5">
                {cancelledTrips.map((trip, index) => (
                  <motion.article
                    key={trip.bookingId || trip.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="liquid-glass-dark border border-red-500/20 rounded-[2.5rem] overflow-hidden opacity-75 hover:opacity-100 hover:border-red-500/40 transition-all cursor-pointer"
                    onClick={() => navigate(`/trip/${trip.id}`)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                      <div className="relative h-56 md:h-full min-h-[280px]">
                        <img src={trip.image} alt={trip.title} className="absolute inset-0 w-full h-full object-cover grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <span className="absolute left-5 bottom-5 bg-red-500 text-white rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] flex items-center gap-2">
                          <AlertCircle size={12} />
                          {trip.status}
                        </span>
                      </div>

                      <div className="p-7 md:p-8 space-y-6 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                            <div className="space-y-2">
                              <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.25em]">Booking ID {trip.bookingId}</p>
                              <h3 className="text-2xl md:text-3xl font-bungee font-black uppercase italic tracking-tighter leading-none">{trip.title}</h3>
                              <div className="flex flex-wrap items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.16em] mt-3">
                                <span className="flex items-center gap-2"><MapPin size={13} className="text-red-400" />{trip.location}</span>
                                <span className="flex items-center gap-2"><Clock size={13} className="text-red-400" />{trip.duration}</span>
                              </div>
                            </div>
                            <div className="text-left lg:text-right">
                              <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.22em]">Total Amount</p>
                              <p className="text-3xl font-sans font-black text-white tracking-tighter">₹{trip.price}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { label: 'Next Batch', value: trip.nextBatch },
                              { label: 'Travelers', value: `${trip.travelers} Member${trip.travelers > 1 ? 's' : ''}` },
                              { label: 'Cancelled On', value: trip.cancelledOn }
                            ].map((item) => (
                              <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">{item.label}</p>
                                <p className="text-sm font-black text-white mt-2">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {trip.highlights?.slice(0, 4).map((highlight: string) => (
                            <span key={highlight} className="bg-red-500/10 text-red-300 border border-red-500/20 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em]">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CancelledTripsPage
