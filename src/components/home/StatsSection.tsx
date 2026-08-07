import { motion } from 'framer-motion'
import { Users, TrendingUp, Heart, MapPin } from 'lucide-react'

export default function StatsSection() {
  const stats = [
    { label: 'Travelers', value: '100+', icon: Users },
    { label: 'Tours', value: '40+', icon: TrendingUp },
    { label: 'Rating', value: '4.1★', icon: Heart },
    { label: 'Destinations', value: '15+', icon: MapPin },
  ]

  return (
    <section className="pt-8 sm:pt-10 md:pt-12 pb-20 md:pb-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-1/2 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 bg-white shadow-2xl">
          <div className="p-8 sm:p-10 md:p-14 lg:p-16">
            <div className="mb-10 md:mb-12">
              <p className="text-secondary font-black uppercase tracking-[0.32em] text-[9px] mb-4">The WayBond community</p>
              <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-tighter uppercase italic">Journeys made memorable</h2>
              <p className="text-white/45 text-sm md:text-base mt-4 max-w-lg leading-relaxed">From first-time explorers to seasoned adventurers, every number represents a story shared on the road.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-5 sm:gap-y-8 md:gap-x-10 md:gap-y-10">
              {stats.map((stat, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="flex min-w-0 items-center gap-2.5 sm:gap-3 md:gap-4 group cursor-default">
                  <div className="liquid-glass-dark shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-secondary/20 transition-all duration-700"><stat.icon className="text-white opacity-80 group-hover:text-secondary group-hover:opacity-100 transition-all" size={19} /></div>
                  <div className="min-w-0"><p className="text-xl sm:text-2xl md:text-4xl font-display font-black text-white tracking-tighter leading-none uppercase italic liquid-text">{stat.value}</p><p className="text-[7px] sm:text-[8px] md:text-[9px] text-white/40 uppercase tracking-[0.12em] sm:tracking-[0.2em] md:tracking-[0.3em] font-black mt-1.5 md:mt-2 whitespace-normal leading-tight">{stat.label}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 1.03 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative min-h-[300px] lg:min-h-full overflow-hidden group">
            <img src="/assets/groupimg.jpg" alt="WayBond travellers sharing a moment" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003d6a]/85 via-[#003d6a]/10 to-transparent" />
            <div className="keep-light-text absolute bottom-8 left-8 md:bottom-10 md:left-10 right-8"><p className="text-secondary font-black uppercase tracking-[0.3em] text-[9px] mb-3">Explore together</p><p className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tighter max-w-sm">More than a trip, it&apos;s a bond.</p></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
