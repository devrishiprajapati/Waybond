import React from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

export default function NewsletterSection() {
  return (
    <section className="py-6 md:py-8 bg-white relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="liquid-glass-dark max-w-4xl mx-auto p-3 md:p-4 rounded-2xl md:rounded-3xl flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 transition-all hover:shadow-lg border border-white/10"
        >
          <div className="w-full flex items-center px-3 md:px-5 flex-grow order-2 md:order-1">
            <Send className="text-secondary opacity-70 shrink-0 mr-2 md:mr-3" size={18} />
            <input 
              type="email" 
              placeholder="Enter your email for exclusive updates" 
              className="w-full min-w-0 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/40 font-semibold text-xs md:text-sm py-2 md:py-2.5 px-0" 
            />
          </div>
          <button className="bg-secondary text-white px-5 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-full font-black text-[9px] md:text-[10px] uppercase tracking-wider hover:bg-secondary/80 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 w-full md:w-auto order-1 md:order-2 shrink-0">
            Subscribe
          </button>
        </motion.div>
      </div>
    </section>
  )
}
