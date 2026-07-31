import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, MapPin, Clock, ArrowLeft, Package } from 'lucide-react'

const BOOKINGS_KEY = 'waybond_user_bookings'

const ConfirmedTripsPage = () => {
  const [confirmedTrips, setConfirmedTrips] = useState<any[]>([])
  const { userId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(savedUser)
    
    // Verify that the userId in URL matches the logged-in user
    if (userId && userId !== parsedUser.email?.replace(/[^a-z0-9]/g, '')) {
      navigate('/login')
      return
    }

    const savedBookings = localStorage.getItem(BOOKINGS_KEY)
    if (savedBookings) {
      const allTrips = JSON.parse(savedBookings)
      const confirmed = allTrips.filter((trip: any) => trip.status === 'Confirmed')
      setConfirmedTrips(confirmed)
    }
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
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Confirmed & Ready</span>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-none liquid-text">
              Confirmed <span className="text-primary">Trips</span>
            </h1>
            <p className="text-white/50 max-w-2xl font-medium italic">
              Your confirmed trips are all set! Get ready for an amazing adventure.
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="space-y-8">
          {confirmedTrips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-12 md:p-16 text-center"
            >
              <CheckCircle2 className="text-white/15 mx-auto mb-6" size={48} />
              <h2 className="text-2xl font-display font-black text-white mb-3">No Confirmed Trips Yet</h2>
              <p className="text-white/50 font-medium mb-8">Complete payment to confirm your booking!</p>
              <button
                onClick={() => navigate('/discover')}
                className="bg-secondary text-white h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] hover:bg-white hover:text-slate-800 transition-all"
              >
                Browse Trips
              </button>
            </motion.div>
          ) : (
            <div className="space-y-5">
              {confirmedTrips.map((trip, index) => (
                <motion.article
                  key={trip.bookingId || trip.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="liquid-glass-dark border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-secondary/40 transition-all cursor-pointer"
                  onClick={() => navigate(`/trip/${trip.id}`)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                    <div className="relative h-56 md:h-full min-h-[280px]">
                      <img src={trip.image} alt={trip.title} className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <span className="absolute left-5 bottom-5 bg-green-500 text-white rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] flex items-center gap-2">
                        <CheckCircle2 size={12} />
                        {trip.status}
                      </span>
                    </div>

                    <div className="p-7 md:p-8 space-y-6 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                          <div className="space-y-2">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.25em]">Booking ID {trip.bookingId}</p>
                            <h3 className="text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter leading-none">{trip.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.16em] mt-3">
                              <span className="flex items-center gap-2"><MapPin size={13} className="text-secondary" />{trip.location}</span>
                              <span className="flex items-center gap-2"><Clock size={13} className="text-secondary" />{trip.duration}</span>
                            </div>
                          </div>
                          <div className="text-left lg:text-right">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.22em]">Total Amount</p>
                            <p className="text-3xl font-display font-black text-white tracking-tighter">₹{trip.price}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { label: 'Next Batch', value: trip.nextBatch },
                            { label: 'Travelers', value: `${trip.travelers} Member${trip.travelers > 1 ? 's' : ''}` },
                            { label: 'Booked On', value: trip.bookedOn }
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
                          <span key={highlight} className="bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em]">
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
      </div>
    </div>
  )
}

export default ConfirmedTripsPage
