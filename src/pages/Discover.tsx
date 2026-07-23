import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Filter, Search, MapPin, Calendar, Star, ChevronDown, CheckCircle2, MessageCircle, ShieldCheck, ArrowUpRight, Clock } from 'lucide-react'
import { CATEGORIES, getTripWhatsAppLink } from '../lib/trips'
import { getTrips } from '../lib/dataService'
import { haptics } from '../lib/haptics'

const Discover = () => {
  const [trips, setTrips] = useState<any[]>([])
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    getTrips().then(setTrips);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<'All' | 'Domestic' | 'International'>('All');

  const toggleFilter = (cat: string) => {
    setActiveFilters(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilters.length === 0 || activeFilters.includes(trip.category);
    const matchesType = activeType === 'All' || trip.type === activeType;
    return matchesSearch && matchesFilter && matchesType;
  })

  return (
    <div className="min-h-screen bg-charcoal text-white pt-28 pb-12">
      <Helmet>
        <title>Explore Adventures — WAYBOND Trips Catalog</title>
        <meta name="description" content="Browse curated domestic and international travel packages. From Himachal to Bali — find your next adventure with Infi Yatra." />
      </Helmet>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">

        {/* Cinematic Header */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] drop-shadow-lg">COLLECTIONS 2024</span>
              <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase italic leading-none liquid-text">
                The <span className="text-primary" style={{ WebkitTextStroke: '1px white' }}>Adventures</span> Hub
              </h1>
              <p className="text-white/40 font-medium text-sm max-w-xl italic leading-relaxed">Curated escapes for the Ahmedabad spirit. From the rugged north to tropical islands.</p>
            </div>

            {/* Search - Liquid Glass */}
            <div className="liquid-glass p-2 rounded-full flex items-center max-w-lg w-full border-white/20 group hover:shadow-[0_0_50px_rgba(255,107,53,0.15)] transition-all duration-700">
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

          {/* Type Filters & Sidebar Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex flex-wrap gap-2">
              {['All', 'Domestic', 'International'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    haptics.light();
                    setActiveType(type as any);
                  }}
                  className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${activeType === type
                    ? 'bg-secondary text-white shadow-2xl shadow-secondary/40'
                    : 'liquid-glass text-white/40 hover:text-white hover:bg-white/10'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                haptics.light();
                setIsFiltersOpen(!isFiltersOpen);
              }}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${isFiltersOpen ? 'bg-charcoal text-charcoal' : 'liquid-glass text-white/40 hover:text-white'}`}
            >
              <Filter size={14} className={isFiltersOpen ? 'text-charcoal' : 'text-secondary'} />
              {isFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
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
                      <h2 className="text-xl font-display font-black uppercase italic tracking-tighter">Refine</h2>
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
                {filteredTrips.map((trip) => (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative liquid-glass-dark liquid-glass-shine rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-700 h-auto flex flex-col shadow-2xl"
                  >
                    {/* Top Visual Area */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={trip.image}
                        alt={trip.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent"></div>

                      {/* Difficulty/Type Tag */}
                      <div className="absolute top-4 left-4">
                        <div className="liquid-glass backdrop-blur-md text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-[0.2em] border-white/20 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                          {trip.type}
                        </div>
                      </div>

                      {/* Favorite/Star */}
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => haptics.light()}
                          className="w-10 h-10 rounded-full liquid-glass border-white/20 flex items-center justify-center text-white/40 hover:text-secondary hover:scale-110 transition-all"
                        >
                          <Star size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex-grow flex flex-col space-y-4 relative z-20">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter leading-tight group-hover:text-secondary transition-colors line-clamp-1">
                            {trip.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-white/40">
                            <MapPin size={12} className="text-secondary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{trip.location}</span>
                            <span className="text-white/10">•</span>
                            <Clock size={12} className="text-secondary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{trip.duration}</span>
                          </div>
                        </div>
                        <ArrowUpRight className="text-white/20 group-hover:text-secondary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" size={24} />
                      </div>

                      <p className="text-white/40 text-xs font-medium italic leading-relaxed line-clamp-2">
                        {trip.description || "Embark on an unforgettable journey through Ahmedabad's most curated travel collective."}
                      </p>

                      <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Starting from</span>
                          <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-display font-black text-white tracking-tighter">₹{trip.price}</span>
                          </div>
                        </div>

                        <Link
                          to={`/trip/${trip.id}`}
                          onClick={() => haptics.medium()}
                          className="px-8 py-3 liquid-glass border-white/20 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all transform hover:scale-105"
                        >
                          Experience
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredTrips.length === 0 && (
              <div className="flex flex-col items-center justify-center py-40 text-center space-y-6">
                <div className="liquid-glass-dark w-24 h-24 rounded-[2rem] flex items-center justify-center text-white/10 border-white/5">
                  <Search size={40} />
                </div>
                <h3 className="text-3xl font-display font-black text-white/20 uppercase tracking-tighter italic">No matching adventures found...</h3>
                <button
                  onClick={() => {
                    haptics.light();
                    setActiveFilters([]);
                    setActiveType('All');
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
