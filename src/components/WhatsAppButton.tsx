import React from 'react'
import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { getWhatsAppLink } from '../lib/data'
import { haptics } from '../lib/haptics'

const WhatsAppButton = () => {
  const message = "Hi Waybond! I'm interested in booking a trip. Could you please help me with the details?"
  const whatsappUrl = getWhatsAppLink(message)

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => haptics.medium()}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-10 right-10 z-[100] group"
    >
      {/* Pulse Effect */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-25 group-hover:opacity-40 transition-opacity"></div>

      {/* Button Body */}
      <div className="relative bg-white/10 backdrop-blur-3xl border border-white/20 p-5 rounded-full shadow-2xl shadow-green-500/20 group-hover:bg-green-500 transition-all duration-500">
        <MessageCircle size={32} className="text-green-500 group-hover:text-white transition-colors duration-500" />
      </div>

      {/* Label Tooltip */}
      <div className="absolute right-full mr-6 top-1/2 -translate-y-1/2 bg-charcoal text-white text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap hidden md:block">
        Chat with us
      </div>
    </motion.a>
  )
}

export default WhatsAppButton
