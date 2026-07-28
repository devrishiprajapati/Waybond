import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { MapPin, Calendar, Users, ShieldCheck, MessageCircle, Star, Palmtree } from 'lucide-react'
import { getWhatsAppLink } from '../lib/data'

export default function BaliPage() {
  const itinerary = [
    { day: "01", title: "Arrival in Ubud", desc: "Check-in at a tropical villa and explore the sacred Monkey Forest." },
    { day: "02", title: "Sunrise at Tegalalang", desc: "Walking through iconic rice terraces and swinging over the jungle." },
    { day: "03", title: "Temple & Waterfalls", desc: "Spiritual visit to Tirta Empul and hidden waterfall treks." },
    { day: "04", title: "Seminyak Sunset", desc: "Relaxing at world-class beach clubs and coastal dining." },
    { day: "05", title: "Nusa Penida Boat Trip", desc: "A day trip to Kelingking Beach and crystal clear snorkel spots." }
  ];

  return (
    <div className="bg-white min-h-screen text-white">
      <Helmet>
        <title>Bali Essence — 7 Day Tropical Escape | WAYBOND</title>
        <meta name="description" content="Luxury Bali escape with WAYBOND. 7 days through Ubud & Seminyak with private villas and island tours starting at ₹54,999." />
      </Helmet>
      <section className="keep-light-text relative h-[85vh] overflow-hidden">
        <img
          src="/assets/bali.jpg"
          alt="Bali"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-slate-900"></div>

        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="text-center px-6 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass inline-block px-6 py-2 rounded-full mb-8 border-white/20"
            >
              <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">TROPICAL PARADISE</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-[8rem] font-display font-black leading-[0.8] tracking-tighter uppercase drop-shadow-2xl liquid-text mb-8"
            >
              BALI<br />
              <span className="text-transparent px-4 italic" style={{ WebkitTextStroke: '2px white' }}>ESSENCE</span>
            </motion.h1>

            <div className="flex flex-wrap justify-center gap-6 mt-12 pb-10 border-b border-white/10">
              {[
                { icon: MapPin, text: "Ubud & Seminyak" },
                { icon: Calendar, text: "7 DAYS / 6 NIGHTS" },
                { icon: Star, text: "4.9 RATING" }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3 text-white/80 font-black text-xs uppercase tracking-widest">
                  <item.icon className="text-secondary" size={16} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trip Overview Content */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-primary flex items-center gap-4">
              <Palmtree size={32} /> The Tropical Call
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Bali is more than a destination; it's a state of mind. From the emerald rice paddies of Ubud to the golden sunset shores of Seminyak, this curated Infi Yatra experience brings you the perfect blend of spiritual awakening and coastal luxury. Designed for the Ahmedabad community with high-end villa stays and authentic Balinese hospitality.
            </p>
          </div>

          {/* Itinerary Timeline */}
          <div className="space-y-8">
            <h3 className="text-2xl font-display font-black uppercase tracking-tighter border-l-4 border-secondary pl-6">Deep Dive Journey</h3>
            <div className="space-y-4">
              {itinerary.map((day, i) => (
                <motion.div
                  key={i}
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -20 }}
                  className="liquid-glass p-8 rounded-[2.5rem] flex items-center space-x-8 group hover:bg-white/10 transition-all duration-500 cursor-default border-white/10"
                >
                  <span className="text-4xl font-display font-black text-secondary group-hover:scale-110 transition-transform">{day.day}</span>
                  <div>
                    <h4 className="text-xl font-display font-black uppercase tracking-tighter mb-1">{day.title}</h4>
                    <p className="text-gray-500 font-medium text-sm">{day.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 liquid-glass p-10 rounded-[3rem] border-white/20 shadow-2xl">
            <div className="mb-10 text-center">
              <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">ALL-INCLUSIVE PACK</span>
              <p className="text-5xl font-display font-black text-white mt-2 tracking-tighter">₹54,999<span className="text-xs text-white/20 ml-2">/PP</span></p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-white/60">
                <span>Inclusion Highlights</span>
                <span className="text-secondary text-[10px]">ULTIMATE</span>
              </div>
              <ul className="space-y-4">
                {["Private Pool Villas", "Full-Day Penida Trip", "A-la-carte Meals", "Private Ground Transport"].map((inc, i) => (
                  <li key={i} className="flex items-center space-x-3 text-xs font-bold text-white/80">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-secondary text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-slate-800 transition-all shadow-xl shadow-secondary/30 transform hover:scale-105 active:scale-95 duration-500">
                Claim My Escape
              </button>
              <a
                href={getWhatsAppLink("Hi! I want to plan my Bali Essence trip.")}
                target="_blank"
                className="w-full liquid-glass-dark py-5 rounded-3xl flex items-center justify-center space-x-3 border-white/10 hover:bg-white/10 transition-all"
              >
                <MessageCircle size={18} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Chat with Captain</span>
              </a>
            </div>

            <div className="mt-8 text-center px-4">
              <p className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-relaxed">Flight assistance & Visa processing included for international members.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
