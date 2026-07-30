import React from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import { motion } from 'framer-motion'
import { getWhatsAppLink } from '../lib/data'
import { haptics } from '../lib/haptics'

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
      className="fixed bottom-6 md:bottom-8 right-6 md:right-8 z-40"
      aria-label="Chat with WayBond on WhatsApp"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />

      {/* Floating up-down motion */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative w-14 md:w-16 h-14 md:h-16 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl shadow-green-500/60 border-2 border-white/20"
      >
        <FaWhatsapp size={30} color="white" />
      </motion.div>
    </motion.a>
  )
}
