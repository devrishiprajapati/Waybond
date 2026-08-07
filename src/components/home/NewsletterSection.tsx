import React from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'

export default function NewsletterSection() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full"></div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 relative z-10 text-center">
        <div className="space-y-4 mb-20 text-center">
          <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px] drop-shadow-sm">COMMUNITY EXCLUSIVE</span>
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-display font-black text-white tracking-tighter uppercase italic leading-none">
            Join the <span className="text-primary italic px-4 drop-shadow-2xl" style={{ WebkitTextStroke: '2px white' }}>WayBond Elite</span>
          </h2>
          <p className="text-white/40 font-medium text-lg max-w-xl mx-auto py-6 italic leading-relaxed">Early access to expedition openings and exclusive members-only gatherings.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass-dark max-w-2xl mx-auto p-3 sm:p-4 md:p-6 rounded-[2rem] md:rounded-full flex flex-col md:flex-row items-center gap-3 md:gap-4 transition-all hover:bg-white/10 hover:shadow-2xl border border-white/5 group"
        >
          <div className="w-full flex items-center px-3 sm:px-5 md:px-8 flex-grow">
            <Send className="text-secondary opacity-70 rotate-12 group-hover:rotate-0 transition-transform" size={24} />
            <input type="email" placeholder="Your Explorer ID (Email)" className="w-full min-w-0 bg-transparent border-none focus:ring-0 text-white placeholder:text-white/30 font-black text-base sm:text-xl uppercase tracking-tighter py-4 sm:py-5 px-4 sm:px-6" />
          </div>
          <button className="bg-secondary text-white px-12 md:px-16 py-5 md:py-6 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-800 transition-all shadow-2xl shadow-secondary/30 transform hover:scale-105 active:scale-95 duration-500 w-full md:w-auto">
            Secure Spot
          </button>
        </motion.div>

        <p className="mt-10 text-white/20 text-[10px] uppercase font-black tracking-[0.4em]">Zero Spam. Pure Adventure.</p>
      </div>
    </section>
  )
}
