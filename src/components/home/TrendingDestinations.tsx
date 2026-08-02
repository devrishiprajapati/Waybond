import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { ALL_TRIPS } from '../../lib/trips'
import { optimizeImageUrl } from '../../lib/dataService'

export default function TrendingDestinations() {
  // Get top 6 trips to display as trending destinations
  const trendingTrips = ALL_TRIPS.slice(0, 6)

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
            <span className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] md:text-[11px] drop-shadow-sm bg-gradient-to-r from-secondary to-blue-400 bg-clip-text text-transparent">
              ✨ Destinations In Demand
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-gray-900 tracking-tight uppercase leading-tight mb-6 max-w-4xl mx-auto">
            Trending <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-secondary to-blue-400 blur-lg opacity-30" />
              <span className="relative bg-gradient-to-r from-secondary to-blue-400 bg-clip-text text-transparent">
                Adventures
              </span>
            </span>
          </h2>
          <p className="text-base md:text-lg text-white font-medium max-w-3xl mx-auto leading-relaxed">
            Discover our most sought-after curated experiences, hand-picked by our community of adventurers
          </p>
        </motion.div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16">
          {trendingTrips.map((trip, idx) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.7, type: 'spring', stiffness: 100 }}
              viewport={{ once: true }}
              className="group h-full"
            >
              <Link
                to="/discover"
                className="block relative h-96 sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 backdrop-blur-sm group"
              >
                {/* Image Container */}
                <div className="relative z-0 w-full h-full overflow-hidden bg-gray-200">
                  <img
                    src={optimizeImageUrl(trip.image, 900, 85)}
                    alt={trip.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 will-change-transform"
                  />

                  {/* Premium Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 opacity-85 group-hover:opacity-90 transition-opacity duration-500" />
                </div>

                {/* Top Right - Experience Type Badge */}
                <div className="absolute top-5 md:top-6 right-5 md:right-6 z-10">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.12 + 0.15, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="inline-block bg-gradient-to-r from-secondary to-blue-400 text-white text-[10px] md:text-xs font-black uppercase px-4 md:px-5 py-2 md:py-2.5 rounded-full tracking-widest shadow-2xl shadow-secondary/50 transform group-hover:scale-110 transition-transform duration-500 border border-white/30 capitalize"
                  >
                    {trip.experience}
                  </motion.span>
                </div>

                {/* Center - Destination Title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.12 + 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center space-y-1 md:space-y-2 mt-10"
                  >
                    <h3
                      className="text-3xl sm:text-4xl md:text-5xl font-display font-black !text-white uppercase tracking-tight leading-tight line-clamp-2"
                      style={{ color: 'white' }}
                    >
                      {trip.title.split(' ')[0]}
                    </h3>
                    <p
                      className="!text-white text-xs md:text-sm font-semibold tracking-widest uppercase line-clamp-1"
                      style={{ color: 'white' }}
                    >
                      {trip.location.split(',')[0]}
                    </p>
                  </motion.div>
                </div>

              </Link>
            </motion.div>
          ))}
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
            className="inline-flex items-center space-x-3 px-8 md:px-10 py-4 md:py-5 rounded-full font-black text-xs md:text-sm uppercase tracking-[0.2em] text-white bg-gradient-to-r from-secondary to-blue-400 hover:shadow-2xl hover:shadow-secondary/40 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-secondary/30 border border-white/20"
          >
            <span>View All Experiences</span>
            <ArrowUpRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
