import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, CircleHelp, Download, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getTripWhatsAppLink } from '../../lib/trips'
import { getTrips, optimizeImageUrl } from '../../lib/dataService'
import { haptics } from '../../lib/haptics'
import DepartureDatePicker from '../DepartureDatePicker'

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
  const [selectedDepartures, setSelectedDepartures] = useState<Record<number, string>>({})

  useEffect(() => { getTrips().then(setTrips) }, [])

  const selectedTrips = useMemo(() => trips.filter(trip => tripMatchesExperience(trip, experience)), [trips, experience])

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
              onClick={() => { haptics.light(); setExperience(filter.key) }}
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
          <motion.div key={experience} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 md:gap-9">
            {selectedTrips.map(trip => {
              const selectedDeparture = selectedDepartures[trip.id] || trip.departureDates?.[0]
              return <article key={trip.id} className="group overflow-hidden rounded-[2rem] liquid-glass text-white border border-white/10 shadow-2xl transition-transform duration-500 hover:-translate-y-2">
              <div className="relative h-56 sm:h-60 overflow-hidden bg-white">
                <img src={optimizeImageUrl(trip.image, 800, 80)} alt={trip.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">{Array.from({ length: 4 }).map((_, dot) => <span key={dot} className={`h-2 w-2 rounded-full border border-white/60 ${dot === 0 ? 'bg-secondary' : 'bg-white/70'}`} />)}</div>
              </div>
              <div className="p-6 md:p-7">
                <div className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-[11px] font-bold text-white/55">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap"><CalendarDays size={15} className="text-secondary" /> {trip.duration}</span>
                  <span className="inline-flex items-center gap-2 min-w-0"><MapPin size={15} className="text-secondary shrink-0" /><span className="truncate">{trip.location}</span></span>
                </div>
                <div className="h-px bg-white/10 my-5" />
                <h3 className="text-xl font-display font-black tracking-tight text-white leading-tight">{trip.title}</h3>
                <p className="text-sm text-white/55 mt-2 min-h-10">{trip.description}</p>
                <div className="grid grid-cols-2 gap-4 mt-7 items-end">
                  <div><p className="text-[9px] font-black uppercase tracking-widest text-white/45 mb-1">Starting from</p><p className="text-2xl font-display font-black text-secondary leading-none">₹{trip.price}</p></div>
                  <div className="text-right"><p className="text-[9px] font-black uppercase tracking-widest text-white/45 mb-2">Difficulty</p><div className="flex justify-end gap-1.5">{[0, 1, 2].map(level => <span key={level} className={`h-1.5 w-5 rounded-full ${level === 0 ? 'bg-secondary' : 'bg-white/20'}`} />)}</div></div>
                </div>
                <div className="mt-7"><DepartureDatePicker dates={trip.departureDates} value={selectedDeparture} onChange={date => setSelectedDepartures(current => ({ ...current, [trip.id]: date }))} /></div>
                <div className="grid grid-cols-2 gap-3 mt-7">
                  <Link to={`/trip/${trip.id}${selectedDeparture ? `?departure=${selectedDeparture}` : ''}`} onClick={() => haptics.medium()} className="inline-flex justify-center items-center gap-1 sm:gap-2 rounded-full bg-white/10 px-2 sm:px-3 py-2.5 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white hover:bg-white hover:text-slate-800 transition-colors" title="More details">
                    <CircleHelp size={14} className="sm:w-[15px] sm:h-[15px]" /> 
                    <span className="hidden sm:inline">More details</span>
                    <span className="sm:hidden">Details</span>
                  </Link>
                  <a href={getTripWhatsAppLink(`${trip.title}${selectedDeparture ? ` on ${selectedDeparture}` : ''}`)} target="_blank" rel="noopener noreferrer" onClick={() => haptics.medium()} className="inline-flex justify-center items-center gap-1 sm:gap-2 rounded-full bg-secondary/15 px-2 sm:px-3 py-2.5 sm:py-3.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-secondary hover:bg-secondary hover:text-white transition-colors" title="Get PDF">
                    <Download size={14} className="sm:w-[15px] sm:h-[15px]" /> 
                    <span className="hidden sm:inline">Get PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </a>
                </div>
              </div>
            </article>
            })}
          </motion.div>
        </AnimatePresence>

        {trips.length > 0 && selectedTrips.length === 0 && <p className="text-center text-white/50 italic py-10">More adventures are coming soon.</p>}
        <div className="mt-16 text-center"><Link to="/discover" onClick={() => haptics.light()} className="text-secondary font-black uppercase tracking-[0.3em] text-xs border-b-2 border-secondary/20 pb-2 hover:border-secondary transition-all">View All Adventures Hub</Link></div>
      </div>
    </section>
  )
}
