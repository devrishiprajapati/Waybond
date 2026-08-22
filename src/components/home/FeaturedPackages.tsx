import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, MapPin, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTripWhatsAppLink } from '../../lib/trips'
import { getTrips, optimizeImageUrl, createSlug } from '../../lib/dataService'
import { haptics } from '../../lib/haptics'
import { useWishlist } from '../../lib/wishlist'
import { formatDateOnly } from '../../lib/date'

type Experience = 'monsoon' | 'weekend' | 'road' | 'snow'

const experiences: { key: Experience, label: string, icon: string }[] = [
  { key: 'monsoon', label: 'Monsoon ', icon: '⛰️' },
  { key: 'weekend', label: 'Weekend ', icon: '🥾' },
  { key: 'road', label: 'Road Trips', icon: '🚙' },
  { key: 'snow', label: 'Snow Treks', icon: '❄️' },
]

const tripMatchesExperience = (trip: any, experience: Experience) => trip.experience === experience

export default function FeaturedPackages() {
  const [experience, setExperience] = useState<Experience>('monsoon')
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDepartures, setSelectedDepartures] = useState<Record<number, string>>({})
  const { toggle, isInList } = useWishlist()

  useEffect(() => {
    let isMounted = true
    const loadTrips = async () => {
      try {
        const data = await getTrips()
        if (isMounted) {
          setTrips(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load trips:', error)
        if (isMounted) setLoading(false)
      }
    }
    loadTrips()
    return () => {
      isMounted = false
    }
  }, [])

  const selectedTrips = useMemo(() => {
    if (!experience) return []
    return trips.filter(trip => tripMatchesExperience(trip, experience))
  }, [trips, experience])

  const handleExperienceChange = useCallback((exp: Experience) => {
    haptics.light()
    setExperience(exp)
  }, [])

  return (
    <section className="py-10 bg-white relative overflow-hidden">
      <div className="absolute left-1/2 top-0 h-80 w-2/3 -translate-x-1/2 rounded-full bg-secondary/5 blur-[110px] pointer-events-none" />
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-5xl font-black text-white tracking-tighter uppercase italic leading-none font-bungee">Choose Your <span className="text-secondary font-bungee">Experience</span></h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-xl md:max-w-none mx-auto mb-14 md:mb-16">
          {experiences.map(filter => (
            <button
              key={filter.key}
              type="button"
              onClick={() => handleExperienceChange(filter.key)}
              className={`min-w-0 w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-full text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 overflow-hidden ${experience === filter.key ? 'bg-secondary text-white shadow-xl shadow-secondary/20' : 'bg-white/5 text-white hover:bg-white/10'}`}
              style={experience === filter.key
                ? { border: '2px solid var(--secondary)' }
                : { border: '2px solid rgba(0, 0, 0, 0.8)' }
              }
              title={`${filter.label}`}
            >
              <span className="hidden sm:inline font-bungee">{filter.label}</span>
              <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {experience ? (
            <motion.div 
              key={experience} 
              initial={{ opacity: 0, y: 16 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -12 }} 
              transition={{ duration: 0.28 }} 
              className="relative"
            >
              {/* Horizontal Scroll Container */}
              <div className="flex gap-4 md:gap-7 lg:gap-9 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1">
                {selectedTrips.map(trip => {
                const selectedDeparture = selectedDepartures[trip.id] || trip.departureDates?.[0]
                const isWishlisted = isInList(trip.id)
                
                return (
                  <Link 
                    key={trip.id}
                    to={`/trip/${createSlug(trip.title)}${selectedDeparture ? `?departure=${selectedDeparture}` : ''}`}
                    onClick={() => haptics.medium()}
                    className="group overflow-hidden rounded-2xl md:rounded-[2rem] liquid-glass text-white border border-white/10 shadow-xl md:shadow-2xl transition-transform duration-500 hover:-translate-y-2 flex flex-col relative min-w-[280px] max-w-[280px] sm:min-w-[340px] sm:max-w-[340px] md:min-w-[380px] md:max-w-[380px] snap-start cursor-pointer"
                  >
                    {/* Wishlist Button - Top Right */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        haptics.light()
                        toggle(trip)
                      }}
                      className="absolute top-3 right-3 md:top-4 md:right-4 z-10 h-9 w-9 md:h-10 md:w-10 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-secondary hover:border-secondary hover:text-white transition-all duration-300 hover:scale-110 active:scale-95 group/wishlist"
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart 
                        className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${isWishlisted ? 'fill-secondary text-secondary' : 'fill-none'}`}
                      />
                    </button>
                    
                    {/* Experience Badge - Top Left */}
                    <span className="absolute top-3 left-3 md:top-4 md:left-4 z-10 bg-secondary text-white rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[8px] md:text-[9px] font-black uppercase tracking-[0.18em] shadow-lg">
                      {trip.experience}
                    </span>
                    
                    {/* Image Section */}
                    <div className="relative h-44 sm:h-52 md:h-60 overflow-hidden bg-white flex-shrink-0">
                      <img src={optimizeImageUrl(trip.image, 800, 80)} alt={trip.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#003d6a]/55 via-transparent to-transparent" />
                    </div>

                    {/* Content Section */}
                    <div className="p-4 md:p-5 lg:p-6 flex-grow flex flex-col">
                      <div className="grid grid-cols-[auto_1fr] gap-x-3 md:gap-x-4 gap-y-1.5 md:gap-y-2 text-[9px] md:text-[10px] font-bold text-white/55 mb-2.5 md:mb-3">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><CalendarDays size={13} className="text-secondary" /> {trip.duration}</span>
                        <span className="inline-flex items-center gap-1.5 min-w-0"><MapPin size={13} className="text-secondary shrink-0" /><span className="truncate">{trip.location}</span></span>
                      </div>
                      <div className="h-px bg-white/10 mb-2.5 md:mb-3" />
                      <h3 className="text-base md:text-lg lg:text-xl font-sans font-black tracking-tight text-white leading-snug line-clamp-2 mb-1.5 md:mb-2">{trip.title}</h3>
                      <p className="text-xs md:text-sm text-white/55 line-clamp-2 md:line-clamp-3 flex-grow leading-relaxed">{trip.description}</p>
                    </div> 

                    {/* Bottom Section */}
                    <div className="border-t border-white/10 p-4 md:p-5 lg:p-6 flex-shrink-0 space-y-2.5 md:space-y-3">
                      {/* Price & Difficulty */}
                      <div className="grid grid-cols-2 gap-2.5 md:gap-3 items-end">
                        <div>
                          <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/45 mb-0.5 md:mb-1">Starting from</p>
                          <p className="text-lg md:text-xl lg:text-2xl font-sans font-black text-secondary leading-none">₹{trip.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-white/45 mb-0.5 md:mb-1">Difficulty</p>
                          <div className="flex justify-end gap-1">{[0, 1, 2].map(level => <span key={level} className={`h-1 w-3 md:w-4 rounded-full ${level === 0 ? 'bg-secondary' : 'bg-white/20'}`} />)}</div>
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div className="space-y-1.5 md:space-y-2">
                        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.18em] text-white/45">SELECT DEPARTURE</p>
                        
                        {/* Month tabs and dates */}
                        {(() => {
                          const dates = trip.departureDates || []
                          if (!dates.length) return <p className="text-[7px] text-white/30">No dates available</p>

                          const monthGroups: Record<string, string[]> = {}
                          dates.forEach(date => {
                            const monthKey = date.slice(0, 7)
                            if (!monthGroups[monthKey]) {
                              monthGroups[monthKey] = []
                            }
                            monthGroups[monthKey].push(date)
                          })

                          Object.keys(monthGroups).forEach(month => {
                            monthGroups[month].sort()
                          })

                          const sortedMonths = Object.keys(monthGroups).sort()
                          const firstMonth = sortedMonths[0]

                          let currentSelectedMonth = firstMonth
                          let currentSelectedDate = selectedDepartures[trip.id]
                          
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

                          const datesInMonth = monthGroups[currentSelectedMonth] || []

                          return (
                            <div className="space-y-1.5 md:space-y-2">
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
                                        e.preventDefault()
                                        e.stopPropagation()
                                        const firstDate = monthGroups[monthKey]?.[0]
                                        if (firstDate) {
                                          setSelectedDepartures(prev => ({
                                            ...prev,
                                            [trip.id]: firstDate
                                          }))
                                        }
                                      }}
                                      className={`px-1.5 md:px-2 py-0.5 md:py-1 text-[6px] md:text-[7px] font-black uppercase tracking-wider rounded transition-colors ${
                                        isActive
                                          ? 'bg-secondary text-white'
                                          : 'bg-transparent text-white/50 hover:text-white'
                                      }`}
                                    >
                                      {monthName} {year}
                                    </button>
                                  )
                                })}
                              </div>

                              <div className="flex gap-1 md:gap-1.5 flex-wrap">
                                {datesInMonth && datesInMonth.length > 0 ? (
                                  datesInMonth.map(date => {
                                    const day = date.slice(8, 10)
                                    const isSelected = currentSelectedDate === date

                                    return (
                                      <button
                                        key={date}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          setSelectedDepartures(prev => ({
                                            ...prev,
                                            [trip.id]: date
                                          }))
                                        }}
                                        className={`w-6 h-6 md:w-7 md:h-7 rounded-full font-black text-[10px] md:text-xs flex items-center justify-center transition-all ${
                                          isSelected
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

                      {/* Single Explore Button
                      <Link 
                        to={`/trip/${createSlug(trip.title)}${selectedDeparture ? `?departure=${selectedDeparture}` : ''}`} 
                        onClick={() => haptics.medium()} 
                        className="w-full inline-flex justify-center items-center gap-2 rounded-full bg-secondary px-4 py-3 text-[10px] font-black uppercase tracking-wider text-white hover:bg-secondary/80 transition-all shadow-lg hover:shadow-xl" 
                        title="Explore package"
                      >
                        <span>Explore</span>
                      </Link> */}
                    </div>
                  </Link>
                )
              })}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} className="text-center py-12">
              <p className="text-white/50 italic text-lg">Select an experience to view available adventures</p>
            </motion.div>
          )}
        </AnimatePresence>

        {trips.length > 0 && selectedTrips.length === 0 && <p className="text-center text-white/50 italic py-10">More adventures are coming soon.</p>}
        <div className="mt-16 text-center"><Link to="/discover" onClick={() => haptics.light()} className="text-secondary font-black uppercase tracking-[0.3em] text-xs border-b-2 border-secondary/20 pb-2 hover:border-secondary transition-all">View All Adventures Hub</Link></div>
      </div>
    </section>
  )
}
