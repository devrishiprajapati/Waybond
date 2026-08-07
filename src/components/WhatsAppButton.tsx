import React from 'react'
import { FaWhatsapp } from 'react-icons/fa6'
import { motion } from 'framer-motion'
import { getWhatsAppLink } from '../lib/data'
import { haptics } from '../lib/haptics'

const WhatsAppButton = () => {
  const message = "Hi Waybond! I'm interested in booking a trip. Could you please help me with the details?"

  return (
    <motion.a
      href={getWhatsAppLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => haptics.medium()}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-8 right-8 z-[100]"
      aria-label="Chat with WayBond on WhatsApp"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none" />

      {/* Button */}
      <div className="relative w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-2xl">
        <FaWhatsapp size={30} color="white" />
      </div>
    </motion.a>
  )
}

export default WhatsAppButton
