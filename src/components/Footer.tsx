import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white pt-24 pb-8 relative overflow-hidden border-t border-white/10">
      <div className="absolute inset-0 liquid-glass-grain pointer-events-none"></div>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        <div className="space-y-6">
          <h3 className="text-3xl font-display font-black text-white tracking-tighter liquid-text">
            WAY<span className="text-secondary text-2xl uppercase ml-1">Bond</span>
          </h3>
          <p className="text-white/40 leading-relaxed text-sm italic font-medium">
            Ahmedabad's premier community travel platform. Connecting curious travelers with authentic local and international experiences since 2024.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-secondary drop-shadow-md">Quick Links</h4>
          <ul className="space-y-4 text-white/50 text-xs font-bold uppercase tracking-widest">
            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>Domestic Tours</a></li>
            {/* <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>International Escapes</a></li> */}
            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>Group Adventures</a></li>
            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>Custom Planning</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-secondary drop-shadow-md">Support & Safety</h4>
          <ul className="space-y-4 text-white/50 text-xs font-bold uppercase tracking-widest">
            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>24/7 SUPPORT </a></li>
            <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>TRIP SAFETY GUIDELINES</a></li>
            <li><a href="/cancellation-refunds" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>CANCELLATION & REFUNDS</a></li>
            <li><a href="/faqs" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 h-px bg-secondary group-hover:w-4 transition-all duration-300"></span>TRAVELER FAQS</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-secondary drop-shadow-md">Join the Community</h4>
          <p className="text-white/40 text-xs mb-6 italic font-medium">Subscribe to get secret deals and trip updates.</p>
          <div className="flex liquid-glass-dark rounded-full p-1.5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <input type="email" placeholder="YOUR EMAIL" className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest px-4 flex-grow text-white placeholder-white/20" />
            <button className="bg-secondary px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-all shadow-xl shadow-secondary/30">Join</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 mt-24 pt-8 border-t border-white/5 text-center relative z-10">
        <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">© 2026 WayBond Travels. All rights reserved. <span className="text-secondary/50">Designed for Ahmedabad, Built for the World.</span></p>
      </div>
    </footer>
  )
}

export default Footer
