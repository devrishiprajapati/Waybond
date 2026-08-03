import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Users, Star, ArrowLeft,
  CheckCircle2, Clock, ShieldCheck, ChevronDown,
  ChevronUp, PlayCircle, Instagram, MessageCircle
} from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { getWhatsAppLink } from '../lib/data'
import { getTripBySlug, createSlug } from '../lib/dataService'
import { haptics } from '../lib/haptics'
import { isLoggedIn } from '../lib/auth'

type RazorpayPaymentResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

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

const TripDetails = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const departureParam = searchParams.get('departure')
  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [expandedDay, setExpandedDay] = useState<number | null>(1)
  const [selectedDeparture, setSelectedDeparture] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    if (slug) {
      getTripBySlug(slug).then(t => {
        setTrip(t || null)
        if (t) setSelectedDeparture(departureParam || t.departureDates?.[0] || '')
        setLoading(false)
      })
    }
  }, [slug, departureParam])

  // Update URL when date changes
  const handleDateChange = (date: string) => {
    setSelectedDeparture(date)
    navigate(`/trip/${slug}?departure=${date}`, { replace: true })
  }

  /** Create a pending booking, then confirm it only after Razorpay verifies payment. */
  const handleBookSlot = async () => {
    haptics.medium()
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate(`/login?redirect=${encodeURIComponent(`/trip/${slug}`)}`)
      return
    }

    try {
      const user = JSON.parse(savedUser)
      if (!user.id) throw new Error('User ID not found')

      // Create booking payload (spread trip first, then override specific fields)
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
        inclusions: trip.inclusions || [],
        exclusions: trip.exclusions || [],
        departureDates: trip.departureDates || [],
        bookingId: `WB-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        status: 'Payment Pending',
        travelers: 1,
        bookedOn: new Date().toLocaleDateString('en-IN'),
        nextBatch: selectedDeparture || trip.departureDates?.[0] || 'TBD'
      }

      // Save to database
      const response = await fetch(`/api/users/${user.id}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      })

      if (!response.ok) throw new Error('Failed to create booking')
      const booking = await response.json()
      const priceInRupees = Number(String(trip.price || '').replace(/[^\d.]/g, ''))
      const amount = Math.round(priceInRupees * 100)
      if (!Number.isInteger(amount) || amount < 100) throw new Error('Trip price is invalid')

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
        prefill: { name: user.name, email: user.email },
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
      console.error('Booking failed:', error)
      setPaying(false)
      alert(error instanceof Error ? error.message : 'Unable to start payment. Please try again.')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white uppercase font-black tracking-widest text-white/40">Loading Expedition...</div>
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white uppercase font-black text-4xl tracking-tighter text-white/30 liquid-text">
        Expedition Not Found
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pt-28 pb-12">
      <Helmet>
        <title>{trip.title} | WAYBOND</title>
        <meta name="description" content={trip.description.substring(0, 160)} />
      </Helmet>
      {/* Navigation & Header */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        <Link
          to="/discover"
          onClick={() => haptics.light()}
          className="inline-flex items-center text-secondary font-black tracking-widest text-xs uppercase hover:gap-3 transition-all mb-8 drop-shadow-md"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Discover
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="liquid-glass text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Most Popular</span>
              <div className="flex items-center text-accent bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                <Star size={14} fill="currentColor" />
                <span className="ml-1.5 text-xs font-black text-white">{trip.rating} ({trip.reviews} reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-white liquid-text italic uppercase tracking-tighter">{trip.title}</h1>
            <div className="flex items-center text-white/60 mt-4 font-black uppercase tracking-widest text-xs min-w-0">
              <MapPin size={16} className="mr-2 text-secondary shrink-0" /> <span className="break-words">{trip.location}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => haptics.light()}
              className="liquid-glass-dark p-4 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors shadow-xl"
            >
              <Instagram size={20} className="text-white/80" />
            </button>
            <a
              href={getWhatsAppLink(`Hi! I'm interested in the ${trip.title}`)}
              target="_blank" rel="noopener noreferrer"
              onClick={() => haptics.medium()}
              className="liquid-glass-dark p-4 border border-white/10 rounded-2xl hover:bg-secondary hover:border-secondary transition-colors flex items-center justify-center shadow-xl group"
            >
              <MessageCircle size={20} className="text-secondary group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-8 space-y-6">
          <motion.div
            layoutId="main-image"
            className="relative h-[350px] md:h-[500px] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
          >
            <img
              src={trip.images[activeImage] || trip.image}
              alt="Main Trip"
              className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            <div className="absolute top-8 right-8">
              <button
                onClick={() => haptics.light()}
                className="liquid-glass p-5 rounded-full shadow-2xl hover:scale-110 hover:bg-secondary/20 transition-all border border-white/20"
              >
                <PlayCircle size={32} className="text-white" />
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
            {(trip.images.length > 0 ? trip.images : [trip.image]).map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => {
                  haptics.light();
                  setActiveImage(idx);
                }}
                className={`h-16 sm:h-20 md:h-24 rounded-2xl sm:rounded-[2rem] overflow-hidden border-2 transition-all duration-500 ${activeImage === idx ? 'border-secondary scale-95 shadow-xl shadow-secondary/20' : 'border-white/10 opacity-50 hover:opacity-100 hover:scale-105'}`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Booking Widget */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 liquid-glass-dark border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-[0_15px_60px_rgba(0,0,0,0.5)] space-y-8">
            <div className="flex justify-between items-center gap-4 pb-8 border-b border-white/10">
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] drop-shadow-sm">Price per person</span>
                <div className="text-4xl font-display font-black text-white tracking-tighter mt-2 liquid-text italic break-all">₹{trip.price?.toLocaleString('en-IN')}</div>
              </div>
              <div className="liquid-glass p-4 rounded-2xl text-center shrink-0 min-w-[72px] border border-white/5">
                <div className="text-white font-black text-2xl drop-shadow-md">{trip.duration.split(' ')[0]}</div>
                <div className="text-[9px] text-white/60 font-black uppercase tracking-[0.2em] mt-1">Days</div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Date Picker - Same as Discover */}
              <div className="p-5 liquid-glass rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45">SELECT DEPARTURE</p>

                  {(() => {
                    const dates = trip.departureDates || []
                    if (!dates.length) return <p className="text-[7px] text-white/30">No dates available</p>

                    // Create month groups
                    const monthGroups: Record<string, string[]> = {}
                    dates.forEach(date => {
                      const monthKey = date.slice(0, 7)
                      if (!monthGroups[monthKey]) {
                        monthGroups[monthKey] = []
                      }
                      monthGroups[monthKey].push(date)
                    })

                    // Sort each month's dates
                    Object.keys(monthGroups).forEach(month => {
                      monthGroups[month].sort()
                    })

                    // Get sorted month keys
                    const sortedMonths = Object.keys(monthGroups).sort()
                    const firstMonth = sortedMonths[0]

                    // Get current selected month
                    let currentSelectedMonth = firstMonth
                    let currentSelectedDate = selectedDeparture

                    if (currentSelectedDate) {
                      const dateMonthKey = currentSelectedDate.slice(0, 7)
                      if (monthGroups[dateMonthKey]) {
                        currentSelectedMonth = dateMonthKey
                      } else {
                        currentSelectedMonth = firstMonth
                        currentSelectedDate = monthGroups[firstMonth]?.[0]
                      }
                    } else {
                      currentSelectedDate = monthGroups[firstMonth]?.[0]
                    }

                    // Get dates in current month
                    const datesInMonth = monthGroups[currentSelectedMonth] || []

                    return (
                      <div className="space-y-2">
                        {/* Month tabs */}
                        <div className="flex gap-1 flex-wrap">
                          {sortedMonths.map(monthKey => {
                            const isActive = monthKey === currentSelectedMonth
                            const [year, month] = monthKey.split('-')
                            const monthName = new Date(`${year}-${month}-01`).toLocaleDateString('en-IN', { month: 'short' })

                            return (
                              <button
                                key={monthKey}
                                type="button"
                                onClick={() => {
                                  const firstDate = monthGroups[monthKey]?.[0]
                                  if (firstDate) {
                                    handleDateChange(firstDate)
                                  }
                                }}
                                className={`px-2 py-1 text-[7px] font-black uppercase tracking-wider rounded transition-colors ${isActive
                                  ? 'bg-secondary text-white'
                                  : 'bg-transparent text-white/50 hover:text-white'
                                  }`}
                              >
                                {monthName} {year}
                              </button>
                            )
                          })}
                        </div>

                        {/* Date circles */}
                        <div className="flex gap-1.5 flex-wrap">
                          {datesInMonth && datesInMonth.length > 0 ? (
                            datesInMonth.map(date => {
                              const day = date.slice(8, 10)
                              const isSelected = currentSelectedDate === date

                              return (
                                <button
                                  key={date}
                                  type="button"
                                  onClick={() => {
                                    handleDateChange(date)
                                  }}
                                  className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center transition-all ${isSelected
                                    ? 'bg-secondary text-white shadow-lg shadow-secondary/40'
                                    : 'bg-white/10 text-white border border-white/30 hover:border-secondary'
                                    }`}
                                  title={date}
                                >
                                  {day}
                                </button>
                              )
                            })
                          ) : (
                            <p className="text-[7px] text-white/30">No dates for this month</p>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 liquid-glass rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center text-white/80 font-black uppercase tracking-widest text-xs">
                  <Users size={18} className="mr-3 text-secondary" /> Group Size
                </div>
                <span className="text-white font-black">{trip.groupSize}</span>
              </div>
            </div>

            <button
              onClick={handleBookSlot}
              disabled={paying}
              className="w-full bg-secondary text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl shadow-secondary/30 text-center transform hover:scale-105 active:scale-95 border border-transparent hover:border-white/20"
            >
              {paying ? 'Opening Secure Payment...' : 'Book Your Slot'}
            </button>
            <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-widest">No cancellation fee up to 15 days before departure</p>

            <div className="pt-6 space-y-4 border-t border-white/10">
              <div className="flex items-center text-xs font-black tracking-widest uppercase text-white/60">
                <ShieldCheck size={18} className="text-green-400 mr-3" /> Verified Captains
              </div>
              <div className="flex items-center text-xs font-black tracking-widest uppercase text-white/60">
                <CheckCircle2 size={18} className="text-green-400 mr-3" /> Secure Payments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 pb-24">
        <div className="lg:col-span-8 space-y-20">
          {/* Overview */}
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic mb-8 liquid-text">Trip Overview</h2>
            <p className="text-lg text-white/60 leading-relaxed font-medium italic">
              {trip.description}
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.highlights.map((highlight: string, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-5 liquid-glass-dark border border-white/10 rounded-2xl shadow-lg">
                  <CheckCircle2 className="text-secondary shrink-0" size={20} />
                  <span className="text-white font-bold text-sm tracking-wide">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-3xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic liquid-text">The Itinerary</h2>
              <button
                onClick={() => {
                  haptics.light();
                  setExpandedDay(expandedDay === null ? 1 : null);
                }}
                className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] border-b border-secondary/30 pb-1 hover:border-secondary transition-all"
              >
                {expandedDay === null ? 'Expand All' : 'Collapse All'}
              </button>
            </div>

            <div className="space-y-4">
              {trip.itinerary.map((item: any) => (
                <div
                  key={item.day}
                  className={`border rounded-3xl transition-all duration-500 overflow-hidden ${expandedDay === item.day ? 'border-secondary/50 liquid-glass-dark shadow-2xl' : 'border-white/10 liquid-glass hover:border-white/30 cursor-pointer'}`}
                  onClick={() => {
                    haptics.light();
                    setExpandedDay(expandedDay === item.day ? null : item.day);
                  }}
                >
                  <div className="p-6 md:p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-display transition-colors duration-500 ${expandedDay === item.day ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Day</span>
                        <span className="text-2xl font-black italic">0{item.day}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{item.title}</h3>
                    </div>
                    {expandedDay === item.day ? <ChevronUp className="text-secondary" size={24} /> : <ChevronDown className="text-white/30" size={24} />}
                  </div>

                  <AnimatePresence>
                    {expandedDay === item.day && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-8 pb-8 pl-[6.5rem] md:pl-[7.5rem] pr-6">
                          <div className="w-full h-px bg-white/10 mb-6"></div>
                          <p className="text-white/60 font-medium leading-relaxed italic">
                            {item.description}
                          </p>
                          <div className="mt-8 flex items-center text-xs text-secondary font-black uppercase tracking-widest bg-secondary/10 w-fit px-4 py-2 rounded-full border border-secondary/20">
                            <Clock size={14} className="mr-2" /> Typical Activity: 4-6 Hours
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Captain Profile */}
          <div className="p-8 md:p-12 liquid-glass-dark border border-white/10 rounded-[3rem] text-white overflow-hidden relative group shadow-[0_15px_60px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-transform duration-1000 group-hover:scale-150"></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
              <div className="relative shrink-0">
                <img
                  src={trip.captain.avatar}
                  alt="Captain"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] object-cover border-2 border-white/20 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-3 -right-3 bg-secondary text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-secondary/30 border border-white/20">
                  Top Rated
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-3xl md:text-4xl font-display font-black italic tracking-tighter liquid-text">{trip.captain.name}</h3>
                  <p className="text-secondary font-black text-[10px] uppercase tracking-[0.3em] mt-2">{trip.captain.role}</p>
                </div>
                <p className="text-white/50 font-medium leading-relaxed max-w-xl italic">
                  {trip.captain.bio}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4 border-t border-white/10">
                  <div className="liquid-glass px-5 py-3 rounded-2xl border border-white/10">
                    <span className="text-[9px] text-white/40 block font-black uppercase tracking-[0.2em] mb-1">Experience</span>
                    <span className="text-lg font-black tracking-tighter">{trip.captain.trips}+ Trips</span>
                  </div>
                  <div className="liquid-glass px-5 py-3 rounded-2xl border border-white/10">
                    <span className="text-[9px] text-white/40 block font-black uppercase tracking-[0.2em] mb-1">Rating</span>
                    <span className="text-lg font-black tracking-tighter flex items-center gap-1.5">{trip.captain.rating} <Star size={16} fill="#FFD700" className="text-accent" /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TripDetails
