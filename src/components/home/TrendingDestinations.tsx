import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { getTrendingCards, optimizeImageUrl, TrendingCard } from '../../lib/dataService'

export default function TrendingDestinations() {
  const [trendingCards, setTrendingCards] = useState<TrendingCard[]>([])

  useEffect(() => {
    getTrendingCards().then(setTrendingCards)
  }, [])

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-white via-blue-50/30 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24 text-center"
        >
          <div className="inline-block mb-6">
            <span className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] md:text-[11px] drop-shadow-sm bg-gradient-to-r from-secondary to-[#003d6a] bg-clip-text text-transparent">
              ✨ Destinations In Demand
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-black text-gray-900 tracking-tight uppercase leading-tight mb-6 max-w-4xl mx-auto">
            Trending <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-secondary to[#003d6a] blur-lg opacity-30" />
              <span className="relative bg-gradient-to-r from-secondary to-[#003d6a] bg-clip-text text-transparent">
                Adventures
              </span>
            </span>
          </h2>
          <p className="text-base md:text-lg text-white font-medium max-w-3xl mx-auto leading-relaxed">
            Discover our most sought-after curated experiences, hand-picked by our community of adventurers
          </p>
        </motion.div>

        {/* Horizontal Scrolling Cards - All Devices with Responsiveness */}
        <div className="relative mb-16">
          <div 
            className="flex gap-3 md:gap-4 lg:gap-5 overflow-x-auto pb-8 px-4 sm:px-6 md:px-8 lg:px-0 snap-x snap-mandatory scroll-smooth hide-scrollbar"
          >
            {trendingCards.map((card, idx) => (
              <motion.div
                key={card.id ?? `${card.title}-${idx}`}
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.12, duration: 0.7, type: 'spring', stiffness: 100 }}
                viewport={{ once: true }}
                className="group flex-shrink-0 w-[192px] sm:w-[220px] md:w-[240px] lg:w-[260px] xl:w-[280px] snap-center first:ml-0 last:mr-0"
              >
                <Link
                  to="/discover"
                  className="block relative h-[291px] sm:h-[333px] md:h-[364px] lg:h-[394px] xl:h-[424px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Image Container */}
                  <div className="relative z-0 w-full h-full overflow-hidden bg-gray-200">
                    <img
                      src={optimizeImageUrl(card.image, 900, 85)}
                      alt={card.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                    />

                    {/* Gradient Overlay - Darker at top and bottom */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/80" />
                  </div>

                  {/* Top Section - Title and Subtitle */}
                  <div className="absolute top-0 left-0 right-0 z-10 p-3 sm:p-4 md:p-5 text-center">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.12 + 0.2, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="space-y-0.5"
                    >
                      <h3 
                        className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-caveat font-bold tracking-wide leading-tight drop-shadow-2xl"
                        style={{ color: 'white', fontFamily: "'Caveat', cursive" }}
                      >
                        {card.title}
                      </h3>
                      <p 
                        className="text-[8px] sm:text-[9px] md:text-[10px] font-sans font-normal tracking-widest drop-shadow-lg uppercase"
                        style={{ color: 'white' }}
                      >
                        {card.subtitle}
                      </p>
                    </motion.div>
                  </div>

                  {/* Bottom Badge - Experience Type */}
                  {card.badge && (
                    <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-10">
                      <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.12 + 0.3, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="inline-block bg-white/95 backdrop-blur-sm text-slate-800 text-[7px] sm:text-[8px] font-black uppercase px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full tracking-widest shadow-lg border border-white/50 group-hover:bg-secondary group-hover:text-white transition-all duration-300"
                      >
                        {card.badge}
                      </motion.span>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Link
            to="/discover"
            className="inline-flex items-center space-x-3 px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-xs md:text-sm uppercase tracking-[0.2em] text-white bg-gradient-to-r from-secondary to-[#003d6a] hover:shadow-2xl hover:shadow-secondary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-secondary/30 border border-white/20"
          >
            <span className="!text-white">View All Experiences</span>
            <ArrowUpRight size={20} className='!text-white' />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
