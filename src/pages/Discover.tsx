import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Filter, Search, MapPin, Calendar, Star, ChevronDown, CheckCircle2, ShieldCheck, Heart } from 'lucide-react'
import { CATEGORIES } from '../lib/trips'
import { getTrips, createSlug } from '../lib/dataService'
import { haptics } from '../lib/haptics'
import { useWishlist } from '../lib/wishlist'
import { formatDateOnly, parseDateOnly } from '../lib/date'

const experienceFilters = [
  { key: 'monsoon', label: 'Monsoon ', icon: '⛰️' },
  { key: 'weekend', label: 'Weekend ', icon: '🥾' },
  { key: 'road', label: 'Road ', icon: '🚙' },
  { key: 'snow', label: 'Snow ', icon: '❄️' },
] as const

const getDepartureOptions = (trip: any) => {
  const dates = [
    trip.nextBatch,
    ...(Array.isArray(trip.departureDates) ? trip.departureDates : [])
  ]

  return Array.from(new Set(dates.map((date) => String(date || '').trim()).filter(Boolean)))
}

const getMonthKey = (date: string) => {
  const parsed = parseDateOnly(date)
  if (!parsed) return ''
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const Discover = () => {
  const [trips, setTrips] = useState<any[]>([])
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [selectedDepartures, setSelectedDepartures] = useState<Record<number, string>>({})
  const { toggle, isInList } = useWishlist()

  useEffect(() => {
    let isMounted = true
    const loadTrips = () => {
      void getTrips()
        .then((data) => { if (isMounted) setTrips(data) })
        .catch((error) => console.error('Unable to load database trips:', error))
    }
    loadTrips()
    window.addEventListener('waybond:trips-updated', loadTrips)
    const refreshInterval = window.setInterval(loadTrips, 15000)
    return () => {
      isMounted = false
      window.removeEventListener('waybond:trips-updated', loadTrips)
      window.clearInterval(refreshInterval)
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeExperience, setActiveExperience] = useState<'All' | 'monsoon' | 'weekend' | 'road' | 'snow'>('All');
  const footerCategory = searchParams.get('category')
  const footerExperience = searchParams.get('experience')
  const footerRegion = searchParams.get('region')
  const footerDuration = searchParams.get('duration')

  const getDays = (duration: string) => Number.parseInt(duration, 10) || 0
  const matchesRegion = (trip: any, region: string) => {
    const text = `${trip.title} ${trip.location}`.toLowerCase()
    if (region === 'himalayas') return /spiti|leh|ladakh|kashmir|manali|shimla/.test(text)
    if (region === 'northeast') return /meghalaya|shillong|cherrapunji|dawki/.test(text)
    if (region === 'south-india') return /kerala|munnar|alleppey|thekkady/.test(text)
    if (region === 'islands') return /andaman|bali|thai|phuket|krabi|seychelles/.test(text)
    return true
  }

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(trip.category);
    const matchesExperience = activeExperience === 'All' || trip.experience === activeExperience;
    const matchesFooterCategory = !footerCategory || trip.category === footerCategory
    const matchesFooterExperience = !footerExperience || trip.experience === footerExperience
    const matchesFooterRegion = !footerRegion || matchesRegion(trip, footerRegion)
    const days = getDays(trip.duration)
    const matchesFooterDuration = !footerDuration ||
      (footerDuration === 'weekend' && days <= 5) ||
      (footerDuration === 'week-long' && days >= 6 && days <= 7) ||
      (footerDuration === 'extended' && days >= 8)
    return matchesSearch && matchesFilter && matchesExperience && matchesFooterCategory && matchesFooterExperience && matchesFooterRegion && matchesFooterDuration;
  })

  return (
    <div className="min-h-screen bg-white text-white pt-28 pb-12">
      <Helmet>
        <title>Explore Adventures — WAYBOND Trips Catalog</title>
        <meta name="description" content="Browse curated domestic and international travel packages. From Himachal to Bali — find your next adventure with WayBond." />
      </Helmet>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Cinematic Header */}
        <div className="mb-6 space-y-4">
          {(footerCategory || footerExperience || footerRegion || footerDuration) && <div className="inline-flex items-center gap-3 rounded-full bg-secondary/10 border border-secondary/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
            Viewing a curated category
            <Link to="/discover" className="text-slate-500 hover:text-secondary">Clear</Link>
          </div>}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] drop-shadow-lg">COLLECTIONS 2026</span>
              <h1 className="text-2xl md:text-4xl font-bungee font-black tracking-tighter uppercase italic leading-none liquid-text">
                The <span className="text-primary font-bungee" style={{ WebkitTextStroke: '1px white' }}>Adventures</span> Hub
              </h1>
              {/* <p className="text-white/40 font-medium text-sm max-w-xl italic leading-relaxed">Curated escapes for the Ahmedabad spirit. From the rugged north to tropical islands.</p> */}
            </div>

            {/* Search - Liquid Glass */}
            <div className="liquid-glass p-2 rounded-full flex items-center max-w-lg w-full border-white/20 group hover:shadow-[0_0_50px_rgba(100,149,237,0.15)] transition-all duration-700">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search destinations, Captains..."
                className="bg-transparent border-none focus:ring-0 w-full text-base font-black uppercase tracking-tighter py-3 px-4 placeholder:text-white/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Experience Filters & Sidebar Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full lg:w-auto">
              {experienceFilters.map((experience) => (
                <button
                  key={experience.key}
                  onClick={() => {
                    haptics.light();
                    setActiveExperience(activeExperience === experience.key ? 'All' : experience.key);
                  }}
                  className={`px-3 sm:px-5 py-3 rounded-full text-[10px] font-black font-bungee transition-all duration-500 ${activeExperience === experience.key
                    ? 'bg-secondary text-white shadow-2xl shadow-secondary/40'
                    : ' text-white/40 hover:text-white hover:bg-white/10'}`}
                  style={activeExperience === experience.key
                    ? { border: '2px solid var(--secondary)' }
                    : { border: '1px solid rgba(0, 0, 0, 0.8)' }
                  }
                >
                  {experience.label}
                </button>
              ))}
            </div>

          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Refined Sidebar - Collapsible */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.aside
                initial={{ width: 0, opacity: 0, x: -20 }}
                animate={{ width: 'auto', opacity: 1, x: 0 }}
                exit={{ width: 0, opacity: 0, x: -20 }}
                className="lg:w-64 flex-shrink-0 space-y-6 overflow-hidden"
              >
                <div className="liquid-glass-dark p-6 rounded-[2rem] border-white/10 sticky top-32 min-w-[256px]">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <Filter className="text-secondary" size={20} />
                      <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter">Refine</h2>
                    </div>
                    {activeFilters.length > 0 && (
                      <button onClick={() => { haptics.light(); setActiveFilters([]); }} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-secondary transition-colors underline">RESET</button>
                    )}
                  </div>

                  <div className="space-y-12">
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black mb-6">Experience</h3>
                      <div className="space-y-4">
                        {CATEGORIES.map(cat => (
                          <label key={cat} className="flex items-center group cursor-pointer">
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={activeFilters.includes(cat)}
                              onChange={() => {
                                haptics.light();
                                toggleFilter(cat);
                              }}
                            />
                            <div className={`w-6 h-6 rounded-xl border-2 mr-4 flex items-center justify-center transition-all ${activeFilters.includes(cat) ? 'bg-secondary border-secondary scale-110 shadow-lg shadow-secondary/40' : 'border-white/10 group-hover:border-secondary'}`}>
                              {activeFilters.includes(cat) && <CheckCircle2 className="text-white" size={14} />}
                            </div>
                            <span className={`text-xs font-black uppercase tracking-widest transition-colors ${activeFilters.includes(cat) ? 'text-white' : 'text-white/30 group-hover:text-white'}`}>{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black mb-6">Refractive Price</h3>
                      <div className="space-y-6">
                        <input
                          type="range"
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-secondary"
                          onChange={() => haptics.light()}
                        />
                        <div className="flex justify-between text-[10px] font-black text-white/20 uppercase tracking-widest leading-none">
                          <span>MIN 5K</span>
                          <span>MAX 200K+</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <div className="flex items-center space-x-4 text-secondary/40">
                        <ShieldCheck size={18} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-relaxed">Verified Captain Trips Only</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Cinematic Wide Grid */}
          <div className="flex-grow">
            <div className={`grid grid-cols-1 md:grid-cols-2 ${isFiltersOpen ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-6 transition-all duration-700`}>
              <AnimatePresence mode="popLayout">
                {filteredTrips.map((trip) => {
                  const departureOptions = getDepartureOptions(trip)
                  const selectedDeparture = selectedDepartures[trip.id] || departureOptions[0]
                  const isWishlisted = isInList(trip.id)

                  return (
                    <motion.div
                      key={trip.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group overflow-hidden rounded-[2rem] liquid-glass text-white border border-white/10 shadow-2xl transition-transform duration-500 hover:-translate-y-2 flex flex-col relative cursor-pointer"
                      onClick={() => {
                        haptics.medium()
                        navigate(`/trip/${createSlug(trip.title)}${selectedDeparture ? `?departure=${selectedDeparture}` : ''}`)
                      }}
                    >
                      {/* Wishlist Button - Top Right */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          haptics.light()
                          toggle(trip)
                        }}
                        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-secondary hover:border-secondary hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 group/wishlist"
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`w-5 h-5 transition-all duration-300 ${isWishlisted ? 'fill-secondary text-secondary' : 'fill-none'}`}
                        />
                      </button>

                      {/* Image Section - Fixed */}
                      <div className="relative h-56 sm:h-60 overflow-hidden bg-white flex-shrink-0">
                        <img src={trip.image} alt={trip.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#003d6a]/55 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">{Array.from({ length: 4 }).map((_, dot) => <span key={dot} className={`h-2 w-2 rounded-full border border-white/60 ${dot === 0 ? 'bg-secondary' : 'bg-white/70'}`} />)}</div>
                      </div>

                      {/* Content Section - Flexible */}
                      <div className="p-5 md:p-6 flex-grow flex flex-col">
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[10px] font-bold text-white/55 mb-3">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><Calendar size={13} className="text-secondary" /> {trip.duration}</span>
                          <span className="inline-flex items-center gap-1.5 min-w-0"><MapPin size={13} className="text-secondary shrink-0" /><span className="truncate">{trip.location}</span></span>
                        </div>
                        <div className="h-px bg-white/10 mb-3" />
                        <h3 className="text-lg md:text-xl font-bungee font-black tracking-tight text-white leading-snug line-clamp-2 mb-2">{trip.title}</h3>
                        <p className="text-xs md:text-sm text-white/55 line-clamp-3 flex-grow">{trip.description}</p>
                      </div>

                      {/* Bottom Section - Fixed, Independent */}
                      <div className="border-t border-white/10 p-5 md:p-6 flex-shrink-0 space-y-3">
                        {/* Price & Difficulty */}
                        <div className="grid grid-cols-2 gap-3 items-end">
                          <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/45 mb-1">Starting from</p>
                            <p className="text-xl md:text-2xl font-bungee font-black text-secondary leading-none">₹{trip.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/45 mb-1">Difficulty</p>
                            <div className="flex justify-end gap-1">{[0, 1, 2].map(level => <span key={level} className={`h-1 w-4 rounded-full ${level === 0 ? 'bg-secondary' : 'bg-white/20'}`} />)}</div>
                          </div>
                        </div>

                        {/* Date Selection */}
                        <div className="space-y-2">
                          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/45">SELECT DEPARTURE</p>

                          {/* Month tabs and dates */}
                          {(() => {
                            const dates = departureOptions
                            if (!dates.length) return <p className="text-[7px] text-white/30">No dates available</p>

                            // Create month groups: { "2026-08": ["2026-08-05", "2026-08-10", ...] }
                            const monthGroups: Record<string, string[]> = {}
                            dates.forEach(date => {
                              const monthKey = getMonthKey(date)
                              if (!monthKey) return
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
                            if (!firstMonth) return <p className="text-[7px] text-white/30">{dates[0]}</p>

                            // Get or set current selected month
                            let currentSelectedMonth = firstMonth
                            let currentSelectedDate = selectedDepartures[trip.id]

                            if (currentSelectedDate) {
                              const dateMonthKey = getMonthKey(currentSelectedDate)
                              // Make sure month exists in data
                              if (monthGroups[dateMonthKey]) {
                                currentSelectedMonth = dateMonthKey
                              } else {
                                // If stored date month doesn't exist, use first month
                                currentSelectedMonth = firstMonth
                                currentSelectedDate = monthGroups[firstMonth]?.[0]
                              }
                            } else {
                              // Initialize with first date of first month
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
                                    const monthName = formatDateOnly(`${year}-${month}-01`, { month: 'short' })

                                    return (
                                      <button
                                        key={monthKey}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          // Select first date of this month
                                          const firstDate = monthGroups[monthKey]?.[0]
                                          if (firstDate) {
                                            setSelectedDepartures(prev => ({
                                              ...prev,
                                              [trip.id]: firstDate
                                            }))
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

                                {/* Date circles for selected month */}
                                <div className="flex gap-1.5 flex-wrap">
                                  {datesInMonth && datesInMonth.length > 0 ? (
                                    datesInMonth.map(date => {
                                      const parsedDate = parseDateOnly(date)
                                      const day = parsedDate ? String(parsedDate.getDate()).padStart(2, '0') : date
                                      const isSelected = currentSelectedDate === date

                                      return (
                                        <button
                                          key={date}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedDepartures(prev => ({
                                              ...prev,
                                              [trip.id]: date
                                            }))
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
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {filteredTrips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
                <div className="liquid-glass-dark w-24 h-24 rounded-[2rem] flex items-center justify-center text-white/10 border-white/5">
                  <Search size={40} />
                </div>
                <h3 className="text-3xl font-bungee font-black text-white/20 uppercase tracking-tighter italic">No matching adventures found...</h3>
                <button
                  onClick={() => {
                    haptics.light();
                    setActiveFilters([]);
                    setActiveExperience('All');
                  }}
                  className="text-secondary font-black uppercase tracking-widest text-xs border-b-2 border-secondary/20 pb-1 hover:border-secondary transition-all"
                >
                  REVEAL ALL VOYAGES
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Discover
