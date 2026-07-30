import React from 'react'
import { motion } from 'framer-motion'
import { getWhatsAppLink } from '../lib/data'
import { haptics } from '../lib/haptics'

const WhatsAppIcon = () => (
  <svg className="w-7 h-7 md:w-8 md:h-8" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="#25D366" />
    <path
      fill="#FFFFFF"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.87 1.246-3.045 3.006-3.045 5.411 0 1.361.264 2.679.754 3.91L2.07 19.07a.5.5 0 00.63.63l3.993-1.335a9.861 9.861 0 004.412 1.256h.004c5.159 0 9.427-4.26 9.427-9.487 0-2.524-1.01-4.898-2.845-6.679-1.835-1.78-4.277-2.758-6.844-2.758z"
    />
  </svg>
)

export default function FloatingWhatsApp() {
  return (
    <motion.a
      href={getWhatsAppLink("Hi WAYBOND! I'd like to book an adventure.")}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => haptics.medium()}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      className="fixed bottom-6 md:bottom-8 right-6 md:right-8 z-40 w-14 md:w-16 h-14 md:h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-2xl shadow-green-500/60 hover:shadow-green-500/80 transition-all duration-300 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm"
    >
      {/* Floating Up-Down Animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="flex items-center justify-center"
      >
        <WhatsAppIcon />
      </motion.div>
    </motion.a>
  )
}
