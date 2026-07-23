import React from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Heart, MapPin } from 'lucide-react'

export default function StatsSection() {
  const stats = [
    { label: 'Travelers', value: '100+', icon: Users },
    { label: 'Tours', value: '40+', icon: TrendingUp },
    { label: 'Rating', value: '4.1★', icon: Heart },
    { label: 'Destinations', value: '15+', icon: MapPin },
  ];

  return (
    <section className="py-20 bg-charcoal relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-1/2 bg-primary/10 blur-[80px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col items-center group cursor-default"
            >
              <div className="liquid-glass-dark w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-700">
                <stat.icon className="text-white opacity-80 group-hover:text-secondary group-hover:opacity-100 transition-all" size={24} />
              </div>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-display font-black text-white drop-shadow-2xl tracking-tighter leading-none mb-2 uppercase italic liquid-text">{stat.value}</p>
                <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-black">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
