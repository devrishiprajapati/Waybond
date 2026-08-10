import React, { useState, useEffect } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Users, Star, ArrowLeft,
  CheckCircle2, Clock, ShieldCheck, ChevronDown,
  ChevronUp, Instagram, MessageCircle, FileText, Download, X,
  Share2, Link2, Check, Calendar
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
  const [enquiryOpen, setEnquiryOpen] = useState(false)
  const [enquiryForm, setEnquiryForm] = useState({ name: '', phone: '', email: '', travelDate: '', travellers: '', message: '' })
  const [enquiryErrors, setEnquiryErrors] = useState<Record<string, string>>({})
  const [enquirySubmitting, setEnquirySubmitting] = useState(false)
  const [enquiryDone, setEnquiryDone] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    if (slug) {
      getTripBySlug(slug).then(t => {
        setTrip(t || null)
        if (t) setSelectedDeparture(departureParam || t.departureDates?.[0] || '')
        setLoading(false)
      })
    }
  }, [slug, departureParam])

  // Scroll handler for sticky booking bar
  useEffect(() => {
    const handleScroll = () => {
      // Get the main image element
      const mainImage = document.querySelector('[data-main-image]')
      if (mainImage) {
        const imageRect = mainImage.getBoundingClientRect()
        // Show sticky bar when image is scrolled past (top is above viewport)
        // Hide it when image bottom is still visible in viewport
        const imageScrolledPast = imageRect.bottom < 100
        setShowStickyBar(imageScrolledPast)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const validateEnquiry = () => {
    const errs: Record<string, string> = {}
    if (!enquiryForm.name.trim()) errs.name = 'Name is required.'
    if (!/^\d{10}$/.test(enquiryForm.phone.trim())) errs.phone = 'Enter a valid 10-digit mobile number.'
    if (enquiryForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiryForm.email.trim())) errs.email = 'Enter a valid email address.'
    if (!enquiryForm.travelDate) errs.travelDate = 'Select a travel date.'
    if (!enquiryForm.travellers.trim() || isNaN(Number(enquiryForm.travellers)) || Number(enquiryForm.travellers) < 1) errs.travellers = 'Enter number of travellers.'
    return errs
  }

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validateEnquiry()
    if (Object.keys(errs).length) { setEnquiryErrors(errs); return }
    setEnquiryErrors({})
    setEnquirySubmitting(true)
    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiryForm.name,
          phone: enquiryForm.phone,
          email: enquiryForm.email,
          travelDate: enquiryForm.travelDate,
          travellers: enquiryForm.travellers,
          message: enquiryForm.message,
          tripTitle: trip?.title,
          tripLocation: trip?.location,
          tripDuration: trip?.duration,
        })
      })
    } catch (err) {
      console.error('Enquiry email failed:', err)
    }
    haptics.medium()
    setEnquirySubmitting(false)
    setEnquiryDone(true)
    setTimeout(() => {
      setEnquiryDone(false)
      setEnquiryOpen(false)
      setEnquiryForm({ name: '', phone: '', email: '', travelDate: '', travellers: '', message: '' })
    }, 2500)
  }

  const getTripShareLink = () => {
    const origin = window.location.origin
    const path = `/trip/${slug || (trip ? createSlug(trip.title) : '')}`
    const params = selectedDeparture ? `?departure=${encodeURIComponent(selectedDeparture)}` : ''
    return `${origin}${path}${params}`
  }

  const handleCopyShareLink = async () => {
    const shareLink = getTripShareLink()
    try {
      await navigator.clipboard.writeText(shareLink)
      setShareCopied(true)
      haptics.medium()
      window.setTimeout(() => setShareCopied(false), 1600)
    } catch (err) {
      console.error('Copy link failed:', err)
    }
  }

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

      // Create unique booking ID with timestamp + random suffix
      const timestamp = Date.now().toString(36).toUpperCase() // Convert timestamp to base36
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase()
      const uniqueBookingId = `WB-${timestamp}-${randomSuffix}`
      
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
        bookingId: uniqueBookingId,
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
    <>
    <div className="bg-white min-h-screen pt-28 pb-28 relative">
      <Helmet>
        <title>{trip.title} | WAYBOND</title>
        <meta name="description" content={trip.description.substring(0, 160)} />
      </Helmet>
      {/* Navigation & Header */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 md:py-8 lg:px-20">
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
            <h1 className="text-2xl md:text-4xl font-display font-black text-white liquid-text italic uppercase tracking-tighter">{trip.title}</h1>
            <div className="flex items-center text-white/60 mt-4 font-black uppercase tracking-widest text-xs min-w-0">
              <MapPin size={16} className="mr-2 text-secondary shrink-0" /> <span className="break-words">{trip.location}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <button
              onClick={() => haptics.light()}
              className="liquid-glass-dark flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 shadow-xl transition-colors hover:bg-white/10 sm:h-auto sm:w-auto sm:rounded-2xl sm:p-4"
            >
              <Instagram size={20} className="text-white/80" />
            </button>
            <a
              href={getWhatsAppLink(`Hi! I'm interested in the ${trip.title}`)}
              target="_blank" rel="noopener noreferrer"
              onClick={() => haptics.medium()}
              className="liquid-glass-dark flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 shadow-xl transition-colors hover:border-secondary hover:bg-secondary sm:h-auto sm:w-auto sm:rounded-2xl sm:p-4 group"
            >
              <MessageCircle size={20} className="text-secondary group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12 lg:mb-16">
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <motion.div
            layoutId="main-image"
            data-main-image
            className="relative h-[230px] overflow-hidden rounded-3xl border border-white/10 shadow-[0_14px_32px_rgba(0,0,0,0.24)] sm:h-[350px] sm:rounded-[3rem] md:h-[500px] md:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <img
              src={trip.images[activeImage] || trip.image}
              alt="Main Trip"
              className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003d6a]/60 via-transparent to-transparent"></div>
            <div className="absolute right-4 top-4 sm:right-8 sm:top-8">
              <button
                type="button"
                onClick={() => {
                  haptics.light()
                  setShareOpen(true)
                }}
                className="liquid-glass rounded-full border border-white/20 p-3 shadow-2xl transition-all hover:scale-110 hover:bg-secondary/20 sm:p-5"
                aria-label="Share trip"
              >
                <Share2 size={24} className="text-white sm:size-8" />
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
          <div className="sticky top-32 liquid-glass-dark border border-white/10 rounded-3xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.18)] space-y-5 md:rounded-[3rem] md:p-10 md:space-y-8 md:shadow-[0_15px_60px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center gap-4 pb-5 border-b border-white/10 md:pb-8">
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] drop-shadow-sm">Price per person</span>
                <div className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter mt-2 liquid-text italic break-all">₹{trip.price?.toLocaleString('en-IN')}</div>
              </div>
              <div className="liquid-glass p-3 md:p-4 rounded-2xl text-center shrink-0 min-w-[64px] md:min-w-[72px] border border-white/5">
                <div className="text-white font-black text-xl md:text-2xl drop-shadow-md">{trip.duration.split(' ')[0]}</div>
                <div className="text-[8px] md:text-[9px] text-white/60 font-black uppercase tracking-[0.2em] mt-1">Days</div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Date Picker - Same as Discover */}
              <div className="p-4 md:p-5 liquid-glass rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 md:p-5 liquid-glass rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center text-white/80 font-black uppercase tracking-widest text-xs">
                  <Users size={18} className="mr-3 text-secondary" /> Group Size
                </div>
                <span className="text-white font-black">{trip.groupSize}</span>
              </div>
            </div>

            <button
              onClick={handleBookSlot}
              disabled={paying}
              className="w-full bg-secondary text-white py-4 md:py-6 rounded-2xl font-black text-[11px] md:text-xs uppercase tracking-[0.22em] md:tracking-[0.3em] transition-all shadow-2xl shadow-secondary/30 text-center transform hover:scale-105 active:scale-95 border border-transparent hover:border-white/20"
            >
              {paying ? 'Opening Secure Payment...' : 'Book Your Slot'}
            </button>
            <p className="text-center text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest">No cancellation fee up to 15 days before departure</p>

            <div className="pt-5 md:pt-6 space-y-3 md:space-y-4 border-t border-white/10">
              <div className="flex items-center text-xs font-black tracking-widest uppercase text-white/60">
                <ShieldCheck size={18} className="text-green-400 mr-3" /> Verified Captains
              </div>
              <div className="flex items-center text-xs font-black tracking-widest uppercase text-white/60">
                <CheckCircle2 size={18} className="text-green-400 mr-3" /> Secure Payments
              </div>
              {trip.pdfUrl && (
                <a
                  href={trip.pdfUrl}
                  download={`${trip.title.replace(/\s+/g, '_')}_Brochure.pdf`}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-2xl border border-secondary/30 bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-[0.16em] hover:bg-secondary hover:text-white transition-all"
                  onClick={() => haptics.light()}
                >
                  <Download size={15} /> Download Brochure
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <section className="max-w-[1920px] mx-auto px-4 md:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-24">
        <div className="lg:col-span-8 space-y-12 md:space-y-20">
          {/* Overview */}
          <div>
            <h2 className="text-2xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic mb-5 md:mb-8 liquid-text">Trip Overview</h2>
            <p className="text-base md:text-lg text-white/60 leading-relaxed font-medium italic">
              {trip.description}
            </p>

            <div className="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {trip.highlights.map((highlight: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-4 md:gap-4 md:p-5 liquid-glass-dark border border-white/10 rounded-2xl shadow-lg">
                  <CheckCircle2 className="text-secondary shrink-0" size={18} />
                  <span className="text-white font-bold text-sm tracking-wide">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itinerary */}
          <div>
            <div className="flex justify-between items-end gap-4 mb-6 md:mb-10">
              <h2 className="text-2xl md:text-5xl font-display font-black text-white tracking-tighter uppercase italic liquid-text">The Itinerary</h2>
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
                  className={`border rounded-2xl md:rounded-3xl transition-all duration-500 overflow-hidden ${expandedDay === item.day ? 'border-secondary/50 liquid-glass-dark shadow-2xl' : 'border-white/10 liquid-glass hover:border-white/30 cursor-pointer'}`}
                  onClick={() => {
                    haptics.light();
                    setExpandedDay(expandedDay === item.day ? null : item.day);
                  }}
                >
                  <div className="p-4 md:p-8 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-6 min-w-0">
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-display transition-colors duration-500 shrink-0 ${expandedDay === item.day ? 'bg-secondary text-white shadow-lg shadow-secondary/30' : 'bg-white/5 text-white/40'}`}>
                        <span className="text-[10px] font-black uppercase tracking-widest">Day</span>
                        <span className="text-lg md:text-2xl font-black italic">0{item.day}</span>
                      </div>
                      <h3 className="text-base md:text-2xl font-bold text-white tracking-tight min-w-0">{item.title}</h3>
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
                        <div className="px-4 md:px-8 pb-6 md:pb-8 md:pl-[7.5rem]">
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
          <div className="p-5 md:p-12 liquid-glass-dark border border-white/10 rounded-3xl md:rounded-[3rem] text-white overflow-hidden relative group shadow-[0_12px_36px_rgba(0,0,0,0.18)] md:shadow-[0_15px_60px_rgba(0,0,0,0.4)]">
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

    <AnimatePresence>
      {shareOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShareOpen(false) }}
        >
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="w-full max-w-xl rounded-[1.5rem] bg-white p-5 text-[#171717] shadow-2xl sm:rounded-[2rem] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Share this Page</h2>
              <button
                type="button"
                onClick={() => setShareOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5"
                aria-label="Close share card"
              >
                <X size={27} strokeWidth={3} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4">
              <img
                src={trip.image}
                alt={trip.title}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20"
              />
              <div className="min-w-0">
                <h3 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">{trip.title}</h3>
                <p className="mt-1 text-sm font-black leading-tight sm:text-base">{trip.location}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCopyShareLink}
                className="flex h-12 items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold transition-all hover:border-secondary/30 hover:bg-secondary/5 sm:text-base"
              >
                {shareCopied ? <Check size={21} className="text-green-600" /> : <Link2 size={22} />}
                {shareCopied ? 'Copied' : 'Copy Link'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this trip: ${trip.title} ${getTripShareLink()}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => haptics.medium()}
                className="flex h-12 items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold transition-all hover:border-secondary/30 hover:bg-secondary/5 sm:text-base"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white">
                  <MessageCircle size={18} />
                </span>
                Whatsapp
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Enquiry Modal — outside page div to avoid stacking context issues */}
    <AnimatePresence>
      {enquiryOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-secondary/45 p-0 backdrop-blur-[3px] sm:items-center sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEnquiryOpen(false) }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl max-h-[calc(100dvh-1rem)] overflow-hidden rounded-t-[1.5rem] border border-secondary/10 bg-slate-50 p-3 text-[#1f2933] shadow-2xl shadow-secondary/20 sm:max-h-[calc(100dvh-2rem)] sm:rounded-[2rem] sm:p-4"
          >
            <div className="flex max-h-[calc(100dvh-2.5rem)] flex-col gap-4 overflow-y-auto sm:max-h-[calc(100dvh-4rem)] lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-6 lg:overflow-hidden">
              {/* Image panel */}
              <div className="keep-light-text relative h-40 shrink-0 overflow-hidden rounded-[1.25rem] shadow-xl shadow-secondary/15 sm:h-60 lg:h-auto lg:min-h-[470px]">
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/25 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10 text-white sm:bottom-5 sm:left-5 sm:right-5">
                  <p className="inline-flex rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-black leading-none shadow-sm backdrop-blur sm:text-sm">{trip.duration}</p>
                  <p className="mt-2 text-xl font-black leading-tight tracking-tight drop-shadow sm:text-3xl">{trip.title}</p>
                  <p className="mt-1.5 text-sm font-semibold leading-tight text-white/85 drop-shadow sm:text-lg">{trip.location}</p>
                </div>
              </div>

              {/* Form panel */}
              <div className="min-h-0 pb-[calc(0.25rem+env(safe-area-inset-bottom))] lg:overflow-y-auto lg:py-2 lg:pr-1">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-1.5 text-[9px] font-black uppercase tracking-[0.24em] text-secondary/70">WayBond Enquiry</p>
                    <h2 className="text-2xl font-black tracking-tight text-[#1f2933] sm:text-3xl">Plan Your Next Trip</h2>
                  </div>
                  <button type="button" onClick={() => setEnquiryOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary/10" aria-label="Close enquiry form">
                    <X size={26} strokeWidth={3} />
                  </button>
                </div>
                {enquiryDone ? (
                  <div className="py-10 text-center">
                    <p className="text-xl font-black text-secondary">Enquiry Sent!</p>
                    <p className="mt-2 text-sm font-medium text-slate-500">Our team will reach out to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} noValidate className="space-y-3.5">
                    <div>
                      <input type="text" placeholder="Your Name" value={enquiryForm.name} onChange={e => setEnquiryForm(f => ({ ...f, name: e.target.value }))} className={`h-[50px] w-full rounded-xl border ${enquiryErrors.name ? 'border-red-500' : 'border-secondary/15'} bg-white px-4 text-base font-semibold text-[#1f2933] shadow-sm shadow-secondary/5 outline-none transition-colors placeholder:text-slate-400 focus:border-secondary/60`} />
                      {enquiryErrors.name && <p className="mt-1.5 text-xs font-bold text-red-500">{enquiryErrors.name}</p>}
                    </div>
                    <div>
                      <div className={`flex h-[50px] overflow-hidden rounded-xl border ${enquiryErrors.phone ? 'border-red-500' : 'border-secondary/15'} bg-white shadow-sm shadow-secondary/5 transition-colors focus-within:border-secondary/60`}>
                        <span className="flex w-14 shrink-0 items-center justify-center border-r border-secondary/15 bg-secondary/5 text-sm font-black text-secondary">+91</span>
                        <input type="tel" placeholder="Mobile No." value={enquiryForm.phone} onChange={e => setEnquiryForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="min-w-0 flex-1 bg-white px-4 text-base font-semibold text-[#1f2933] outline-none placeholder:text-slate-400" />
                      </div>
                      {enquiryErrors.phone && <p className="mt-1.5 text-xs font-bold text-red-500">{enquiryErrors.phone}</p>}
                    </div>
                    <div>
                      <input type="email" placeholder="Email (optional)" value={enquiryForm.email} onChange={e => setEnquiryForm(f => ({ ...f, email: e.target.value }))} className={`h-[50px] w-full rounded-xl border ${enquiryErrors.email ? 'border-red-500' : 'border-secondary/15'} bg-white px-4 text-base font-semibold text-[#1f2933] shadow-sm shadow-secondary/5 outline-none transition-colors placeholder:text-slate-400 focus:border-secondary/60`} />
                      {enquiryErrors.email && <p className="mt-1.5 text-xs font-bold text-red-500">{enquiryErrors.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">
                      <div>
                        <div className={`relative h-[50px] rounded-xl border ${enquiryErrors.travelDate ? 'border-red-500' : 'border-secondary/15'} bg-white shadow-sm shadow-secondary/5 transition-colors focus-within:border-secondary/60`}>
                          {!enquiryForm.travelDate && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-400">Date of Travel</span>}
                          <input type="date" value={enquiryForm.travelDate} min={new Date().toISOString().split('T')[0]} onChange={e => setEnquiryForm(f => ({ ...f, travelDate: e.target.value }))} className={`h-full w-full rounded-xl bg-transparent px-4 pr-11 text-base font-semibold outline-none [color-scheme:light] ${enquiryForm.travelDate ? 'text-[#1f2933]' : 'text-transparent'}`} />
                          <Calendar size={19} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-secondary/45" />
                        </div>
                        {enquiryErrors.travelDate && <p className="mt-1.5 text-xs font-bold text-red-500">{enquiryErrors.travelDate}</p>}
                      </div>
                      <div>
                        <input type="number" placeholder="Traveller Count" min={1} value={enquiryForm.travellers} onChange={e => setEnquiryForm(f => ({ ...f, travellers: e.target.value }))} className={`h-[50px] w-full rounded-xl border ${enquiryErrors.travellers ? 'border-red-500' : 'border-secondary/15'} bg-white px-4 text-base font-semibold text-[#1f2933] shadow-sm shadow-secondary/5 outline-none transition-colors placeholder:text-slate-400 focus:border-secondary/60`} />
                        {enquiryErrors.travellers && <p className="mt-1.5 text-xs font-bold text-red-500">{enquiryErrors.travellers}</p>}
                      </div>
                    </div>
                    <textarea placeholder="Message (optional)" rows={2} value={enquiryForm.message} onChange={e => setEnquiryForm(f => ({ ...f, message: e.target.value }))} className="min-h-[82px] w-full resize-y rounded-xl border border-secondary/15 bg-white px-4 py-3 text-base font-semibold text-[#1f2933] shadow-sm shadow-secondary/5 outline-none transition-colors placeholder:text-slate-400 focus:border-secondary/60" />
                    <button type="submit" disabled={enquirySubmitting} className="flex h-[56px] w-full items-center justify-center gap-2.5 rounded-xl bg-secondary px-5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-secondary/25 transition-all hover:bg-secondary-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base">
                      <MessageCircle size={18} />
                      {enquirySubmitting ? 'Connecting...' : 'Connect with Expert'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Floating Enquiry Button — fixed bottom center, outside any stacking context */}
    <button
      onClick={() => { haptics.medium(); setEnquiryOpen(true) }}
      className="fixed bottom-6 sm:bottom-6 left-1/2 -translate-x-1/2 z-[150] flex max-w-[calc(100vw-2rem)] items-center justify-center gap-2.5 whitespace-nowrap bg-secondary text-white px-8 sm:px-7 py-4 sm:py-3.5 rounded-full shadow-[0_8px_30px_rgba(100,149,237,0.6)] hover:shadow-[0_8px_40px_rgba(100,149,237,0.8)] hover:scale-105 active:scale-95 transition-all duration-200 font-black text-sm sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] border-2 border-white/30 backdrop-blur-sm"
      aria-label="Open enquiry form"
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <MessageCircle size={20} className="sm:w-[18px] sm:h-[18px]" />
      Enquire Now
    </button>

    {/* Sticky Booking Bar - Appears when scrolling past main image */}
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: showStickyBar ? 0 : -100,
        opacity: showStickyBar ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg"
    >
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 lg:px-20 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <img 
              src={trip?.image} 
              alt={trip?.title}
              className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shrink-0 border border-gray-200"
            />
            <div className="min-w-0">
              <h3 className="text-sm md:text-lg font-black text-gray-900 truncate">{trip?.title}</h3>
              <p className="text-xs md:text-sm text-gray-500 font-semibold">{trip?.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-500 font-semibold">per person</p>
              <p className="text-lg md:text-2xl font-black text-gray-900">₹{trip?.price?.toLocaleString('en-IN')}</p>
            </div>
            <button
              onClick={handleBookSlot}
              disabled={paying}
              className="bg-secondary text-white px-4 md:px-8 py-2.5 md:py-3 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              {paying ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  )
}

export default TripDetails
