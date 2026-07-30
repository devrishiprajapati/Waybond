import { useEffect, useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, CircleHelp, Download, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTripWhatsAppLink } from '../../lib/trips'
import { getTrips, optimizeImageUrl } from '../../lib/dataService'
import { haptics } from '../../lib/haptics'

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
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute left-1/2 top-0 h-80 w-2/3 -translate-x-1/2 rounded-full bg-secondary/5 blur-[110px] pointer-events-none" />
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-4">WayBond adventures</p>
          <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase italic leading-none liquid-text">Choose Your <span className="text-secondary">Experience</span></h2>
          <p className="text-white/45 font-medium text-base md:text-lg mt-5">Pick the perfect adventure for you.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-xl md:max-w-none mx-auto mb-14 md:mb-16">
          {experiences.map(filter => (
            <button
              key={filter.key}
              type="button"
              onClick={() => handleExperienceChange(filter.key)}
              className={`min-w-0 w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-full border text-[10px] sm:text-xs md:text-sm font-black transition-all duration-300 overflow-hidden ${experience === filter.key ? 'bg-secondary border-secondary text-white shadow-xl shadow-secondary/20' : 'bg-white/5 border-white/15 text-white hover:border-secondary/50 hover:bg-white/10'}`}
              title={`${filter.label}`}
            >
              <span className="inline-block mr-1 text-sm sm:text-base" aria-hidden="true">{filter.icon}</span>
              <span className="hidden sm:inline">{filter.label}</span>
              <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {experience ? (
            <motion.div key={experience} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 md:gap-9">
              {selectedTrips.map(trip => {
                const selectedDeparture = selectedDepartures[trip.id] || trip.departureDates?.[0]
                return (
                  <article key={trip.id} className="group overflow-hidden rounded-[2rem] liquid-glass text-white border border-white/10 shadow-2xl transition-transform duration-500 hover:-translate-y-2 flex flex-col">
                    {/* Image Section - Fixed */}
                    <div className="relative h-56 sm:h-60 overflow-hidden bg-white flex-shrink-0">
                      <img src={optimizeImageUrl(trip.image, 800, 80)} alt={trip.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">{Array.from({ length: 4 }).map((_, dot) => <span key={dot} className={`h-2 w-2 rounded-full border border-white/60 ${dot === 0 ? 'bg-secondary' : 'bg-white/70'}`} />)}</div>
                    </div>

                    {/* Content Section - Flexible */}
                    <div className="p-5 md:p-6 flex-grow flex flex-col">
                      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[10px] font-bold text-white/55 mb-3">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><CalendarDays size={13} className="text-secondary" /> {trip.duration}</span>
                        <span className="inline-flex items-center gap-1.5 min-w-0"><MapPin size={13} className="text-secondary shrink-0" /><span className="truncate">{trip.location}</span></span>
                      </div>
                      <div className="h-px bg-white/10 mb-3" />
                      <h3 className="text-lg md:text-xl font-display font-black tracking-tight text-white leading-snug line-clamp-2 mb-2">{trip.title}</h3>
                      <p className="text-xs md:text-sm text-white/55 line-clamp-3 flex-grow">{trip.description}</p>
                    </div>

                    {/* Bottom Section - Fixed, Independent */}
                    <div className="border-t border-white/10 p-5 md:p-6 flex-shrink-0 space-y-3">
                      {/* Price & Difficulty */}
                      <div className="grid grid-cols-2 gap-3 items-end">
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-white/45 mb-1">Starting from</p>
                          <p className="text-xl md:text-2xl font-display font-black text-secondary leading-none">₹{trip.price}</p>
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
                          const dates = trip.departureDates || []
                          if (!dates.length) return <p className="text-[7px] text-white/30">No dates available</p>

                          // Create month groups: { "2026-08": ["2026-08-05", "2026-08-10", ...] }
                          const monthGroups: Record<string, string[]> = {}
                          dates.forEach(date => {
                            const monthKey = date.slice(0, 7) // "2026-08"
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

                          // Get or set current selected month
                          let currentSelectedMonth = firstMonth
                          let currentSelectedDate = selectedDepartures[trip.id]
                          
                          if (currentSelectedDate) {
                            const dateMonthKey = currentSelectedDate.slice(0, 7)
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
                                  const monthName = new Date(`${year}-${month}-01`).toLocaleDateString('en-IN', { month: 'short' })

                                  return (
                                    <button
                                      key={monthKey}
                                      type="button"
                                      onClick={() => {
                                        // Select first date of this month
                                        const firstDate = monthGroups[monthKey]?.[0]
                                        if (firstDate) {
                                          setSelectedDepartures(prev => ({
                                            ...prev,
                                            [trip.id]: firstDate
                                          }))
                                        }
                                      }}
                                      className={`px-2 py-1 text-[7px] font-black uppercase tracking-wider rounded transition-colors ${
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

                              {/* Date circles for selected month */}
                              <div className="flex gap-1.5 flex-wrap">
                                {datesInMonth && datesInMonth.length > 0 ? (
                                  datesInMonth.map(date => {
                                    const day = date.slice(8, 10) // Get DD from YYYY-MM-DD
                                    const isSelected = currentSelectedDate === date

                                    return (
                                      <button
                                        key={date}
                                        type="button"
                                        onClick={() => {
                                          setSelectedDepartures(prev => ({
                                            ...prev,
                                            [trip.id]: date
                                          }))
                                        }}
                                        className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center transition-all ${
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

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Link to={`/trip/${trip.id}${selectedDeparture ? `?departure=${selectedDeparture}` : ''}`} onClick={() => haptics.medium()} className="inline-flex justify-center items-center gap-1 rounded-full bg-white/10 px-2 py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white hover:bg-white hover:text-slate-800 transition-colors" title="More details">
                          <CircleHelp size={12} /> 
                          <span className="hidden sm:inline">Details</span>
                          <span className="sm:hidden">View</span>
                        </Link>
                        <a href={getTripWhatsAppLink(`${trip.title}${selectedDeparture ? ` on ${selectedDeparture}` : ''}`)} target="_blank" rel="noopener noreferrer" onClick={() => haptics.medium()} className="inline-flex justify-center items-center gap-1 rounded-full bg-secondary/15 px-2 py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-secondary hover:bg-secondary hover:text-white transition-colors" title="Get PDF">
                          <Download size={12} /> 
                          <span className="hidden sm:inline">PDF</span>
                          <span className="sm:hidden">Get</span>
                        </a>
                      </div>
                    </div>
                  </article>
                )
              })}
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
