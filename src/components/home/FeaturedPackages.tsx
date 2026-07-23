import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, MessageCircle } from 'lucide-react'
import { getTripWhatsAppLink } from '../../lib/trips'
import { getTrips, optimizeImageUrl } from '../../lib/dataService'
import { Link } from 'react-router-dom'
import { haptics } from '../../lib/haptics'

export default function FeaturedPackages() {
  const [category, setCategory] = useState<'Domestic' | 'International'>('Domestic')
  const [trips, setTrips] = useState<any[]>([])

  useEffect(() => {
    getTrips().then(setTrips);
  }, []);

  return (
    <section className="py-24 bg-charcoal">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase italic leading-none liquid-text">
            Explore Our <span className="text-primary" style={{ WebkitTextStroke: '1px white' }}>Masterpieces</span>
          </h2>
          <p className="text-white/40 font-medium text-lg max-w-xl mx-auto italic leading-relaxed">Authentic journeys curated for the Ahmedabad explorer.</p>
        </div>

        <div className="flex justify-center mb-20">
          <div className="liquid-glass-dark p-1.5 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex">
            {['Domestic', 'International'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  haptics.light();
                  setCategory(tab as 'Domestic' | 'International');
                }}
                className={`px-10 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500 ${category === tab
                  ? 'bg-secondary text-white shadow-xl shadow-secondary/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="wait">
            {trips.filter(t => t.type === category).map((trip) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-charcoal rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-secondary/20 transition-all duration-700 h-[380px] shadow-2xl"
              >
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={optimizeImageUrl(trip.image, 800, 80)}
                    alt={trip.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s] will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                  <div className="absolute top-6 left-6">
                    <span className="liquid-glass text-white text-[10px] font-black uppercase px-4 py-2 rounded-full tracking-widest shadow-xl border-white/20">{trip.duration}</span>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8 space-y-4">
                    <div className="flex items-center space-x-2 text-secondary">
                      <MapPin size={14} className="fill-secondary/20" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] drop-shadow-md">{trip.location}</span>
                    </div>
                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter leading-[0.9] italic group-hover:text-secondary transition-all duration-500 drop-shadow-2xl">{trip.title}</h3>

                    <div className="pt-6 flex justify-between items-center border-t border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Starts At</span>
                        <span className="text-2xl font-display font-black text-white tracking-tighter">₹{trip.price}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <a
                          href={getTripWhatsAppLink(trip.title)}
                          target="_blank" rel="noopener noreferrer"
                          onClick={() => haptics.medium()}
                          className="liquid-glass-dark text-white p-3.5 rounded-2xl hover:bg-secondary transition-all transform hover:scale-105 border border-white/10 shadow-xl"
                        >
                          <MessageCircle size={18} />
                        </a>
                        <Link
                          to={`/trip/${trip.id}`}
                          onClick={() => haptics.medium()}
                          className="h-11 px-7 rounded-2xl bg-white text-charcoal font-black text-[10px] uppercase tracking-[0.16em] transition-all shadow-2xl duration-500 hover:bg-secondary hover:text-white flex items-center justify-center text-center whitespace-nowrap"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-20 text-center">
          <Link
            to="/discover"
            onClick={() => haptics.light()}
            className="text-secondary font-black uppercase tracking-[0.3em] text-xs border-b-2 border-secondary/20 pb-2 hover:border-secondary transition-all drop-shadow-md"
          >
            View All Adventures Hub
          </Link>
        </div>
      </div>
    </section>
  )
}
