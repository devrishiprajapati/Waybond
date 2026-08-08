import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, TrendingUp, Users, Star } from 'lucide-react'

import StatsSection from "../components/home/StatsSection"
import FeaturedPackages from "../components/home/FeaturedPackages"

export default function BackupHome() {
  // The container ref must be on the scrollable element, per the library's pattern
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-white min-h-screen">
      {/* Cinematic Video Hero — this is the scrollable container */}
      <div ref={containerRef} className="relative h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
        >
          <source src="/assets/best.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#003d6a]/90"></div>

        {/* Hero Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="text-secondary font-black uppercase tracking-[0.5em] text-[10px] drop-shadow-2xl">
              AHMEDABAD'S PREMIERE GATEWAY
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[5rem] md:text-[8rem] font-display font-black text-white leading-[0.8] tracking-tighter uppercase mb-32 liquid-text"
          >
            EXPLORE<br />
            <span className="text-transparent px-4 italic" style={{ WebkitTextStroke: '2px white' }}>ADVENTURE</span>
          </motion.h1>
        </div>

        {/* Liquid Glass Search Bar — mounted inside containers that has the ref */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '62%' }}
        >
          <div
            style={{
              backdropFilter: 'blur(16px) saturate(140%)',
              WebkitBackdropFilter: 'blur(16px) saturate(140%)',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '100px',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 6px',
            }}
          >
            <div className="flex items-center" style={{ minWidth: '560px' }}>
              <div className="flex-grow flex items-center px-5 border-r border-white/10">
                <Search className="text-secondary mr-3 flex-shrink-0" size={17} />
                <input
                  type="text"
                  placeholder="WHERE SHOULD INFI YATRA TAKE YOU?"
                  className="bg-transparent border-none focus:ring-0 w-full text-white font-black uppercase tracking-tighter text-xs placeholder:text-white/40 outline-none"
                />
              </div>
              <div className="hidden md:flex items-center px-5 text-white/40 space-x-2 border-r border-white/10">
                <MapPin size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">GLOBAL TOURS</span>
              </div>
              <button className="bg-secondary text-white px-8 py-3 mx-1 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-800 transition-all shadow-xl flex-shrink-0">
                SEARCH
              </button>
            </div>
          </div>
        </motion.div>

        {/* Floating Mini Stats */}
        <div className="absolute bottom-24 left-0 right-0 flex flex-wrap justify-center gap-12 md:gap-24 opacity-70">
          {[
            { icon: Users, val: "100K+", label: "TRAVELERS" },
            { icon: TrendingUp, val: "4.5K+", label: "TOURS" },
            { icon: Star, val: "4.9★", label: "RATING" },
            { icon: MapPin, val: "80+", label: "DESTINATIONS" }
          ].map((s, i) => (
            <div key={i} className="text-center group cursor-default">
              <s.icon className="mx-auto text-white/30 mb-3 group-hover:text-secondary transition-colors" size={22} />
              <p className="text-3xl font-display font-black text-white tracking-tighter italic">{s.val}</p>
              <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.3em] mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-white via-white/40 to-transparent"></div>
        </motion.div>
      </div>

      <StatsSection />
      <FeaturedPackages />
    </div>
  )
}
