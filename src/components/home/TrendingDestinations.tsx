import React from 'react'
import { motion } from 'framer-motion'
import { optimizeImageUrl } from '../../lib/dataService'

export default function TrendingDestinations() {
  const destinations = [
    { title: 'Girnar', img: 'https://images.unsplash.com/photo-1504109586057-7a2ae83d1338?auto=format&fit=crop&q=80&w=800', badge: 'Adventure' },
    { title: 'Leh-Ladakh', img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800', badge: 'Luxury' },
    { title: 'Somnath', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800', badge: 'Culture' }
  ];

  return (
    <section className="py-24 bg-charcoal">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-8 md:space-y-0">
          <div className="space-y-4">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] drop-shadow-sm">GLOBAL TRENDS</span>
            <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase italic leading-none liquid-text">
              Destinations <span className="text-primary" style={{ WebkitTextStroke: '1px white' }}>In Demand</span>
            </h2>
          </div>
          <button className="liquid-glass text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all shadow-xl">Global Map</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {destinations.map((dest, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative h-[450px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
            >
              <img src={optimizeImageUrl(dest.img, 800, 80)} alt={dest.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] will-change-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute top-8 right-8">
                <span className="bg-secondary text-white text-[10px] font-black uppercase px-6 py-3 rounded-full tracking-widest shadow-xl transform group-hover:-translate-y-2 transition-transform duration-500">{dest.badge}</span>
              </div>

              <div className="absolute bottom-12 left-10">
                <h3 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter italic leading-none group-hover:text-secondary transition-colors duration-500">{dest.title}</h3>
                <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mt-4">Discover the Unexplored</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
