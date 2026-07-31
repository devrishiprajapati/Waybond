import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Heart,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Shield,
  Star,
  User
} from 'lucide-react'
import { getTrips } from '../lib/dataService'
import { registerUser } from '../lib/adminStorage'

const BOOKINGS_KEY = 'waybond_user_bookings'
const TESTIMONIALS_KEY = 'waybond_user_testimonials'
const CANCELLED_TRIPS_KEY = 'waybond_user_cancelled_trips'

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [bookedTrips, setBookedTrips] = useState<any[]>([])
  const [cancelledTrips, setCancelledTrips] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [testimonialText, setTestimonialText] = useState('')
  const [testimonialTripId, setTestimonialTripId] = useState('')
  const [testimonialRating, setTestimonialRating] = useState(5)
  const { userId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(savedUser)
<<<<<<< HEAD
    
    if (userId && userId !== parsedUser.email?.replace(/[^a-z0-9]/g, '')) {
      navigate('/login')
      return
    }
    
    if (!userId) {
      const newUserId = parsedUser.email?.replace(/[^a-z0-9]/g, '')
      navigate(`/dashboard/${newUserId}`, { replace: true })
      return
    }

=======
    registerUser(parsedUser)
>>>>>>> f8341f01d632edaac39f48bd08d3c3c5ba240267
    setUser(parsedUser)
    setIsAdmin(sessionStorage.getItem('isAdmin') === 'true')

    const savedTestimonials = localStorage.getItem(TESTIMONIALS_KEY)
    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials))
    }

    const savedCancelledTrips = localStorage.getItem(CANCELLED_TRIPS_KEY)
    if (savedCancelledTrips) {
      setCancelledTrips(JSON.parse(savedCancelledTrips))
    }

    getTrips().then((trips) => {
      const savedBookings = localStorage.getItem(BOOKINGS_KEY)
      if (savedBookings) {
        setBookedTrips(JSON.parse(savedBookings))
        return
      }

      const starterBookings = trips.slice(0, 2).map((trip, index) => ({
        ...trip,
        bookingId: `WB-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
        status: index === 0 ? 'Confirmed' : 'Payment Pending',
        travelers: index === 0 ? 2 : 1,
        bookedOn: index === 0 ? 'Jul 12, 2026' : 'Jul 18, 2026'
      }))
      setBookedTrips(starterBookings)
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(starterBookings))
    })
  }, [navigate, userId])

  const stats = useMemo(() => {
    const confirmedTrips = bookedTrips.filter((trip) => trip.status === 'Confirmed').length
    const totalTrips = bookedTrips.length + cancelledTrips.length
    return [
      { label: 'All Trips', value: String(totalTrips).padStart(2, '0'), icon: Compass },
      { label: 'Confirmed', value: String(confirmedTrips).padStart(2, '0'), icon: CheckCircle2 },
      { label: 'Testimonials', value: String(testimonials.length).padStart(2, '0'), icon: MessageCircle },
      { label: 'Cancelled', value: String(cancelledTrips.length).padStart(2, '0'), icon: Clock }
    ]
  }, [bookedTrips, testimonials, cancelledTrips])

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.removeItem('isAdmin')
    navigate('/login')
  }

  const handleCancelTrip = (tripId: string | number) => {
    const tripToCancel = bookedTrips.find((trip) => trip.id === tripId || trip.bookingId === tripId)
    if (!tripToCancel) return

    const updatedBookedTrips = bookedTrips.filter((trip) => trip.id !== tripId && trip.bookingId !== tripId)
    const cancelledTrip = { ...tripToCancel, status: 'Cancelled', cancelledOn: new Date().toLocaleDateString('en-IN') }

    setBookedTrips(updatedBookedTrips)
    setCancelledTrips([...cancelledTrips, cancelledTrip])

    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedBookedTrips))
    localStorage.setItem(CANCELLED_TRIPS_KEY, JSON.stringify([...cancelledTrips, cancelledTrip]))
  }

  const handleTestimonialSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!testimonialText.trim()) return

    const selectedTrip = bookedTrips.find((trip) => String(trip.id) === testimonialTripId) || bookedTrips[0]
    const nextTestimonials = [
      {
        id: Date.now(),
        userName: user.name,
        tripTitle: selectedTrip?.title || 'WayBond Trip',
        rating: testimonialRating,
        text: testimonialText.trim(),
        createdAt: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      },
      ...testimonials
    ]

    setTestimonials(nextTestimonials)
    localStorage.setItem(TESTIMONIALS_KEY, JSON.stringify(nextTestimonials))
    setTestimonialText('')
    setTestimonialRating(5)
    setTestimonialTripId('')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white text-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-8">
          <div className="space-y-4">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Welcome back, explorer</span>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-none liquid-text">
              {user.name}'s <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-white/50 max-w-2xl font-medium italic">
              Track your booked trips, review itinerary details, and share your travel story with the WayBond community.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 bg-white text-slate-800 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-secondary hover:text-white transition-all"
              >
                <Shield size={14} />
                <span>Admin Panel</span>
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/50 hover:text-red-300 transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* STAT CARDS - Full Width */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => {
                if (stat.label === 'All Trips') navigate(`/dashboard/${userId}/all-trips`)
                else if (stat.label === 'Confirmed') navigate(`/dashboard/${userId}/confirmed`)
                else if (stat.label === 'Testimonials') navigate(`/dashboard/${userId}/testimonials`)
                else if (stat.label === 'Cancelled') navigate(`/dashboard/${userId}/cancelled`)
              }}
              className="liquid-glass-dark border border-white/10 p-6 rounded-[2rem] flex flex-col items-center gap-4 cursor-pointer hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 border border-blue-200 flex items-center justify-center text-secondary/70">
                <stat.icon size={28} />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.25em]">{stat.label}</p>
                <p className="text-3xl font-display font-black text-white leading-none mt-1">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MAIN CONTENT GRID - Profile (1), Trips (2), Testimonials (3) on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PROFILE CARD - Mobile (order-1, FIRST), Desktop (4 cols on right) */}
          <div className="col-span-1 lg:col-span-4 order-1 lg:order-1">
            <div className="sticky top-32 space-y-8">
              <section 
                onClick={() => navigate(`/dashboard/${userId}/profile`)}
                className="liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] overflow-hidden relative cursor-pointer hover:border-secondary/40 transition-all hover:shadow-lg hover:shadow-secondary/10"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-secondary/20 blur-3xl rounded-full"></div>
                <div className="relative z-10 space-y-7">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-secondary p-1">
                    <div className="w-full h-full rounded-[1.7rem] bg-white flex items-center justify-center">
                      <User size={38} className="text-white/40" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-black tracking-tight">{user.name}</h3>
                    <p className="text-white/45 text-xs font-medium italic mt-1">{user.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <Heart size={18} className="text-secondary mb-3" />
                      <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.18em]">Wishlist</p>
                      <p className="text-xl font-black">12</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <Star size={18} className="text-secondary mb-3" />
                      <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.18em]">XP</p>
                      <p className="text-xl font-black">850</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Form on Desktop */}
              <section id="testimonial-form" className="liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <div>
                  <p className="text-secondary text-[9px] font-black uppercase tracking-[0.3em]">Your Voice</p>
                  <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter mt-2">Add Testimonial</h2>
                </div>

                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <select
                    value={testimonialTripId}
                    onChange={(event) => setTestimonialTripId(event.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-secondary"
                  >
                    <option className="text-slate-800" value="">Select booked trip</option>
                    {bookedTrips.map((trip) => (
                      <option className="text-slate-800" key={trip.id} value={trip.id}>{trip.title}</option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                    <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">Rating</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setTestimonialRating(rating)}
                          className={rating <= testimonialRating ? 'text-secondary' : 'text-white/20'}
                        >
                          <Star size={18} fill="currentColor" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={testimonialText}
                    onChange={(event) => setTestimonialText(event.target.value)}
                    placeholder="Share your trip experience..."
                    className="w-full min-h-[140px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-white/25 outline-none focus:border-secondary resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full bg-secondary text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] hover:bg-white hover:text-slate-800 transition-all"
                  >
                    Publish Testimonial
                  </button>
                </form>
              </section>

              {/* Testimonials List on Desktop */}
              <section className="liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <h2 className="text-xl font-display font-black uppercase italic tracking-tighter">My Testimonials</h2>
                {testimonials.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="text-white/15 mx-auto mb-4" size={34} />
                    <p className="text-sm text-white/40 font-medium italic">No testimonial added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial) => (
                      <article key={testimonial.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] text-secondary font-black uppercase tracking-[0.18em]">{testimonial.tripTitle}</p>
                          <span className="text-[9px] text-white/30 font-bold">{testimonial.createdAt}</span>
                        </div>
                        <div className="flex text-secondary">
                          {Array.from({ length: testimonial.rating }).map((_, index) => (
                            <Star key={index} size={14} fill="currentColor" />
                          ))}
                        </div>
                        <p className="text-sm text-white/65 leading-relaxed italic">{testimonial.text}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* BOOKED TRIPS SECTION - Mobile (order-2, SECOND), Desktop (8 cols on left) */}
          <div className="col-span-1 lg:col-span-8 order-2 lg:order-2">
            <section className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-display font-black uppercase italic tracking-tight flex items-center">
                  <Calendar className="mr-3 text-secondary" /> All Your Trips
                </h2>
                <Link
                  to={`/dashboard/${userId}/all-trips`}
                  className="text-secondary font-black uppercase tracking-[0.25em] text-[10px] border-b border-secondary/40 pb-1"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-5">
                {bookedTrips.map((trip, index) => (
                  <motion.article
                    key={trip.bookingId || trip.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="liquid-glass-dark border border-white/10 rounded-[2.5rem] overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                      <div className="relative h-56 md:h-full min-h-[220px]">
                        <img src={trip.image} alt={trip.title} className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <span className="absolute left-5 bottom-5 bg-secondary text-white rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em]">
                          {trip.status}
                        </span>
                      </div>

                      <div className="p-7 md:p-8 space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.25em]">Booking ID {trip.bookingId}</p>
                            <h3 className="text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter leading-none">{trip.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.16em]">
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

                        <div className="flex flex-wrap gap-2">
                          {trip.highlights?.slice(0, 4).map((highlight: string) => (
                            <span key={highlight} className="bg-secondary/10 text-secondary border border-secondary/20 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em]">
                              {highlight}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            to={`/trip/${trip.id}`}
                            className="bg-secondary text-white h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] hover:bg-white hover:text-slate-800 transition-all"
                          >
                            View Trip Details
                          </Link>
                          {trip.status === 'Confirmed' && (
                            <Link
                              to={`/booking-confirmation/${trip.bookingId}`}
                              className="bg-green-500/10 text-green-300 h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"
                            >
                              Download Invoice
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              setTestimonialTripId(String(trip.id))
                              document.getElementById('testimonial-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }}
                            className="bg-white/5 text-white h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] border border-white/10 hover:bg-white hover:text-slate-800 transition-all"
                          >
                            Add Testimonial
                          </button>
                          {trip.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleCancelTrip(trip.id || trip.bookingId)}
                              className="bg-red-500/10 text-red-300 h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                            >
                              Cancel Trip
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}

                {cancelledTrips.map((trip, index) => (
                  <motion.article
                    key={trip.bookingId || trip.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (bookedTrips.length + index) * 0.08 }}
                    className="liquid-glass-dark border border-red-500/20 rounded-[2.5rem] overflow-hidden opacity-75"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                      <div className="relative h-56 md:h-full min-h-[220px]">
                        <img src={trip.image} alt={trip.title} className="absolute inset-0 w-full h-full object-cover grayscale" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <span className="absolute left-5 bottom-5 bg-red-500 text-white rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em]">
                          {trip.status}
                        </span>
                      </div>

                      <div className="p-7 md:p-8 space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.25em]">Booking ID {trip.bookingId}</p>
                            <h3 className="text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter leading-none">{trip.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.16em]">
                              <span className="flex items-center gap-2"><MapPin size={13} className="text-red-400" />{trip.location}</span>
                              <span className="flex items-center gap-2"><Clock size={13} className="text-red-400" />{trip.duration}</span>
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
                            { label: 'Cancelled On', value: trip.cancelledOn }
                          ].map((item) => (
                            <div key={item.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                              <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.2em]">{item.label}</p>
                              <p className="text-sm font-black text-white mt-2">{item.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {trip.highlights?.slice(0, 4).map((highlight: string) => (
                            <span key={highlight} className="bg-red-500/10 text-red-300 border border-red-500/20 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em]">
                              {highlight}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            to={`/trip/${trip.id}`}
                            className="bg-white/5 text-white h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] border border-white/10 hover:bg-white hover:text-slate-800 transition-all"
                          >
                            View Trip Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}

                {bookedTrips.length === 0 && cancelledTrips.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="text-white/15 mx-auto mb-4" size={40} />
                    <p className="text-sm text-white/40 font-medium italic">No trips yet. Start your adventure!</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* MOBILE TESTIMONIALS - order-3, THIRD (after trips) with View All link */}
          <div className="col-span-1 lg:hidden order-3 space-y-8 w-full">
            <section className="liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] space-y-6">
              <div>
                <p className="text-secondary text-[9px] font-black uppercase tracking-[0.3em]">Your Voice</p>
                <h2 className="text-2xl font-display font-black uppercase italic tracking-tighter mt-2">Add Testimonial</h2>
              </div>

              <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                <select
                  value={testimonialTripId}
                  onChange={(event) => setTestimonialTripId(event.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-secondary"
                >
                  <option className="text-slate-800" value="">Select booked trip</option>
                  {bookedTrips.map((trip) => (
                    <option className="text-slate-800" key={trip.id} value={trip.id}>{trip.title}</option>
                  ))}
                </select>

                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em]">Rating</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setTestimonialRating(rating)}
                        className={rating <= testimonialRating ? 'text-secondary' : 'text-white/20'}
                      >
                        <Star size={18} fill="currentColor" />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={testimonialText}
                  onChange={(event) => setTestimonialText(event.target.value)}
                  placeholder="Share your trip experience..."
                  className="w-full min-h-[140px] bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white placeholder:text-white/25 outline-none focus:border-secondary resize-none"
                />

                <button
                  type="submit"
                  className="w-full bg-secondary text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] hover:bg-white hover:text-slate-800 transition-all"
                >
                  Publish Testimonial
                </button>
              </form>
            </section>

            <section className="liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] space-y-6">
              <h2 className="text-xl font-display font-black uppercase italic tracking-tighter">My Testimonials</h2>
              {testimonials.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="text-white/15 mx-auto mb-4" size={34} />
                  <p className="text-sm text-white/40 font-medium italic">No testimonial added yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <article key={testimonial.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] text-secondary font-black uppercase tracking-[0.18em]">{testimonial.tripTitle}</p>
                        <span className="text-[9px] text-white/30 font-bold">{testimonial.createdAt}</span>
                      </div>
                      <div className="flex text-secondary">
                        {Array.from({ length: testimonial.rating }).map((_, index) => (
                          <Star key={index} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <p className="text-sm text-white/65 leading-relaxed italic">{testimonial.text}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* VIEW ALL TESTIMONIALS LINK */}
            <div className="text-center pt-6 pb-4">
              <Link
                to={`/dashboard/${userId}/testimonials`}
                className="text-secondary font-black uppercase tracking-[0.25em] text-[11px] border-b-2 border-secondary pb-2 hover:text-white transition-colors inline-block"
              >
                View All Testimonials →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
