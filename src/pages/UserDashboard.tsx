import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Heart,
  Image as ImageIcon,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Star,
  User
} from 'lucide-react'
import { registerUser } from '../lib/adminStorage'
import { getUser, logout } from '../lib/auth'
import { useWishlist } from '../lib/wishlist'
import { createSlug } from '../lib/dataService'
import { formatDateOnly } from '../lib/date'

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [bookedTrips, setBookedTrips] = useState<any[]>([])
  const [cancelledTrips, setCancelledTrips] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [testimonialText, setTestimonialText] = useState('')
  const [testimonialTripId, setTestimonialTripId] = useState('')
  const [testimonialRating, setTestimonialRating] = useState(5)
  const [testimonialImage, setTestimonialImage] = useState<string>('')
  const [testimonialImageFile, setTestimonialImageFile] = useState<File | null>(null)
  const { userId } = useParams()
  const navigate = useNavigate()
  const { count: wishlistCount } = useWishlist()

  useEffect(() => {
    const parsedUser = getUser()
    if (!parsedUser) {
      navigate('/login')
      return
    }

    if (!parsedUser.id || (userId && userId !== parsedUser.id)) {
      navigate('/login')
      return
    }

    if (!userId) {
      navigate(`/dashboard/${parsedUser.id}`, { replace: true })
      return
    }

    registerUser(parsedUser)
    setUser(parsedUser)

    const loadDashboard = async () => {
      try {
        if (!parsedUser.id) throw new Error('No database user')
        const response = await fetch(`/api/users/${parsedUser.id}/dashboard`)
        if (!response.ok) throw new Error('Dashboard unavailable')
        const data = await response.json()

        // Load testimonials
        setTestimonials(data.testimonials.map((item: any) => ({
          ...item,
          tripTitle: item.trip,
          text: item.review,
          createdAt: new Date(item.createdAt).toLocaleDateString('en-IN')
        })))

        // Separate active and cancelled bookings
        const activeBookings = data.bookings.filter((booking: any) => booking.status !== 'Cancelled')
        const cancelledBookings = data.bookings.filter((booking: any) => booking.status === 'Cancelled')

        setBookedTrips(activeBookings)
        setCancelledTrips(cancelledBookings)
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      }
    }
    loadDashboard()
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
    logout()
    navigate('/login')
  }

  const handleCancelTrip = async (bookingDbId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingDbId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to cancel booking')

      // Move booking from active to cancelled
      const tripToCancel = bookedTrips.find((trip) => trip.bookingDbId === bookingDbId)
      if (tripToCancel) {
        const cancelledTrip = {
          ...tripToCancel,
          status: 'Cancelled',
          cancelledOn: new Date().toLocaleDateString('en-IN')
        }
        setBookedTrips((prev) => prev.filter((trip) => trip.bookingDbId !== bookingDbId))
        setCancelledTrips((prev) => [...prev, cancelledTrip])
      }
    } catch (error) {
      console.error('Failed to cancel trip:', error)
      alert('Failed to cancel trip. Please try again.')
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB')
        return
      }
      setTestimonialImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setTestimonialImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Helper function to check if a trip already has a testimonial
  const hasTestimonialForTrip = (tripTitle: string) => {
    return testimonials.some((testimonial) => testimonial.tripTitle === tripTitle)
  }

  // Get confirmed trips without testimonials
  const tripsAvailableForTestimonial = useMemo(() => {
    return bookedTrips.filter(
      (trip) => trip.status === 'Confirmed' && !hasTestimonialForTrip(trip.title)
    )
  }, [bookedTrips, testimonials])

  const handleTestimonialSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!testimonialText.trim()) return

    // Only allow testimonials for confirmed trips
    const confirmedTrips = bookedTrips.filter((trip) => trip.status === 'Confirmed')
    if (confirmedTrips.length === 0) {
      alert('You can only add testimonials for confirmed trips.')
      return
    }

    const selectedTrip = confirmedTrips.find((trip) => String(trip.id) === testimonialTripId) || confirmedTrips[0]

    // Check if testimonial already exists for this trip
    if (hasTestimonialForTrip(selectedTrip?.title)) {
      alert('You have already submitted a testimonial for this trip.')
      return
    }

    try {
      if (!user.id) throw new Error('No database user')
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          trip: selectedTrip?.title || 'WayBond Trip',
          review: testimonialText.trim(),
          rating: testimonialRating,
          userId: user.id,
          media: testimonialImage || undefined,
          mediaType: testimonialImage ? 'image' : undefined
        })
      })

      if (!response.ok) throw new Error('Unable to publish')

      const saved = await response.json()
      setTestimonials((current) => [{
        ...saved,
        tripTitle: saved.trip,
        text: saved.review,
        createdAt: new Date(saved.createdAt).toLocaleDateString('en-IN')
      }, ...current])

      setTestimonialText('')
      setTestimonialRating(5)
      setTestimonialTripId('')
      setTestimonialImage('')
      setTestimonialImageFile(null)
    } catch (error) {
      console.error('Failed to add testimonial:', error)
      alert('Failed to add testimonial. Please try again.')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white text-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-8">
          <div className="space-y-4">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Welcome back, explorer</span>
            <h1 className="text-2xl md:text-5xl font-bungee font-black tracking-tighter uppercase italic leading-none liquid-text">
              {user.name}'s <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-white/50 max-w-2xl font-medium italic">
              Track your booked trips, review itinerary details, and share your travel story with the WayBond community.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
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
                <p className="text-3xl font-sans font-black text-white leading-none mt-1">{stat.value}</p>
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
                    <h3 className="text-xl font-bungee font-black tracking-tight">{user.name}</h3>
                    <p className="text-white/45 text-xs font-medium italic mt-1">{user.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to={`/dashboard/${userId}/profile`}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-secondary/30 transition-all duration-300 group"
                    >
                      <User size={18} className="text-secondary mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.18em]">Profile</p>
                      <p className="text-sm font-black text-secondary mt-1">View</p>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-secondary/30 transition-all duration-300 group"
                    >
                      <Heart size={18} className="text-secondary mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.18em]">Wishlist</p>
                      <p className="text-xl font-black">{wishlistCount}</p>
                    </Link>
                  </div>
                </div>
              </section>

              <section id="testimonial-form" className="hidden lg:block liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <div>
                  <p className="text-secondary text-[9px] font-black uppercase tracking-[0.3em]">Your Voice</p>
                  <h2 className="text-2xl font-bungee font-black uppercase italic tracking-tighter mt-2">Add Testimonial</h2>
                </div>

                {tripsAvailableForTestimonial.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="text-white/15 mx-auto mb-4" size={34} />
                    <p className="text-sm text-white/40 font-medium italic">
                      {bookedTrips.filter((trip) => trip.status === 'Confirmed').length === 0
                        ? 'Testimonials are only available for confirmed trips.'
                        : 'You have already added testimonials for all your confirmed trips.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                    <select
                      value={testimonialTripId}
                      onChange={(event) => setTestimonialTripId(event.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-secondary"
                    >
                      <option className="text-slate-800" value="">Select confirmed trip</option>
                      {tripsAvailableForTestimonial.map((trip) => (
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

                    {/* Image Upload */}
                    <div className="space-y-3">
                      <label className="block">
                        <span className="text-[9px] text-white/40 font-black uppercase tracking-[0.2em] mb-2 block">Trip Photo (Optional)</span>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="testimonial-image-upload"
                          />
                          <label
                            htmlFor="testimonial-image-upload"
                            className="flex items-center justify-center gap-2 w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white/60 hover:border-secondary hover:text-white transition-all cursor-pointer"
                          >
                            <ImageIcon size={18} />
                            <span>{testimonialImageFile ? testimonialImageFile.name : 'Upload trip photo'}</span>
                          </label>
                        </div>
                      </label>
                      {testimonialImage && (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10">
                          <img src={testimonialImage} alt="Preview" className="w-full h-32 object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setTestimonialImage('')
                              setTestimonialImageFile(null)
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-secondary text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] hover:bg-secondary/80 transition-all"
                    >
                      Publish Testimonial
                    </button>
                  </form>
                )}
              </section>

              {/* Testimonials List on Desktop ONLY */}
              <section className="hidden lg:block liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] space-y-6">
                <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter">My Testimonials</h2>
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
                <h2 className="text-xl font-bungee font-black uppercase italic tracking-tight flex items-center">
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
                            <h3 className="text-2xl md:text-3xl font-bungee font-black uppercase italic tracking-tighter leading-none">{trip.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.16em]">
                              <span className="flex items-center gap-2"><MapPin size={13} className="text-secondary" />{trip.location}</span>
                              <span className="flex items-center gap-2"><Clock size={13} className="text-secondary" />{trip.duration}</span>
                            </div>
                          </div>
                          <div className="text-left lg:text-right">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.22em]">Total Amount</p>
                            <p className="text-3xl font-sans font-black text-white tracking-tighter">₹{trip.price}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { label: 'Trip Start', value: formatDateOnly(trip.nextBatch || 'TBD') },
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
                              if (trip.status === 'Confirmed' && !hasTestimonialForTrip(trip.title)) {
                                setTestimonialTripId(String(trip.id))
                                document.getElementById('testimonial-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }
                            }}
                            disabled={trip.status !== 'Confirmed' || hasTestimonialForTrip(trip.title)}
                            className={`h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] border transition-all ${trip.status === 'Confirmed' && !hasTestimonialForTrip(trip.title)
                              ? 'bg-white/5 text-white border-white/10 hover:bg-white/20 hover:border-white/30 cursor-pointer'
                              : 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed opacity-50'
                              }`}
                            title={hasTestimonialForTrip(trip.title) ? 'Testimonial already submitted' : ''}
                          >
                            {hasTestimonialForTrip(trip.title) ? 'Testimonial Added' : 'Add Testimonial'}
                          </button>
                          {trip.status !== 'Confirmed' && (
                            <button
                              onClick={() => handleCancelTrip(trip.bookingDbId)}
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
                            <h3 className="text-2xl md:text-3xl font-bungee font-black uppercase italic tracking-tighter leading-none">{trip.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.16em]">
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
                            { label: 'Trip Start', value: formatDateOnly(trip.nextBatch || 'TBD') },
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
                            to={`/trip/${createSlug(trip.title)}`}
                            className="bg-white/5 text-white h-12 px-6 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.16em] border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all"
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
                <h2 className="text-2xl font-bungee font-black uppercase italic tracking-tighter mt-2">Add Testimonial</h2>
              </div>

              {tripsAvailableForTestimonial.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="text-white/15 mx-auto mb-4" size={34} />
                  <p className="text-sm text-white/40 font-medium italic">
                    {bookedTrips.filter((trip) => trip.status === 'Confirmed').length === 0
                      ? 'Testimonials are only available for confirmed trips.'
                      : 'You have already added testimonials for all your confirmed trips.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleTestimonialSubmit} className="space-y-4">
                  <select
                    value={testimonialTripId}
                    onChange={(event) => setTestimonialTripId(event.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-secondary"
                  >
                    <option className="text-slate-800" value="">Select confirmed trip</option>
                    {tripsAvailableForTestimonial.map((trip) => (
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
                    className="w-full bg-secondary text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] hover:bg-secondary/80 transition-all"
                  >
                    Publish Testimonial
                  </button>
                </form>
              )}
            </section>

            <section className="liquid-glass-dark border border-white/10 p-8 rounded-[2.5rem] space-y-6">
              <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter">My Testimonials</h2>
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
