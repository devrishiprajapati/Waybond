import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { MapPin, Calendar, Users, ShieldCheck, MessageCircle, ArrowRight, Star } from 'lucide-react'
import { getWhatsAppLink } from '../lib/data'

export default function HimachalPage() {
  const itinerary = [
    { day: "01", title: "Arrival in Manali", desc: "Acclimatization and local café exploration in Old Manali." },
    { day: "02", title: "Rohtang Pass Expedition", desc: "Breathtaking snow views and high-altitude photography." },
    { day: "03", title: "Kasol & Parvati Valley", desc: "Riverside camping and mystical vibes in the heart of the valley." },
    { day: "04", title: "Trek to Kheerganga", desc: "A spiritual journey to natural hot springs under the stars." },
    { day: "05", title: "The Return Journey", desc: "Shopping for local artifacts and departure for Ahmedabad." }
  ];

  return (
    <div className="bg-white min-h-screen text-white">
      <Helmet>
        <title>Himachal Mystique — 6 Day Expedition | WAYBOND</title>
        <meta name="description" content="Explore the rugged Himalayas with WAYBOND. 6-day expedition through Manali, Kasol, and Kheerganga starting at ₹14,999." />
      </Helmet>
      <section className="keep-light-text relative h-[85vh] overflow-hidden">
        <img
          src="/assets/himalayas-bg.jpg"
          alt="Himachal"
          className="absolute inset-0 w-full h-full object-cover"
        />


        <div className="absolute inset-0 flex items-center justify-center pt-20">
          <div className="text-center px-6 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass inline-block px-6 py-2 rounded-full mb-8 border-white/20"
            >
              <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">ULTIMATE EXPEDITION</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-[8rem] font-bungee font-black leading-[0.8] tracking-tighter uppercase liquid-text mb-8"
            >
              HIMACHAL<br />
              <span className="text-transparent px-4 italic" style={{ WebkitTextStroke: '2px white' }}>MYSTIQUE</span>
            </motion.h1>

            <div className="flex flex-wrap justify-center gap-6 mt-12 pb-10 border-b border-white/10">
              {[
                { icon: MapPin, text: "Manali & Kasol" },
                { icon: Calendar, text: "6 DAYS / 5 NIGHTS" },
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
            <h2 className="text-4xl font-bungee font-black uppercase italic tracking-tighter text-primary">The Adventure Calling</h2>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Join the Infi Yatra community as we venture into the rugged heart of the Himalayas. This isn't just a sightseeing tour; it's a soul-stirring journey through pine forests, snow-clad peaks, and the mystical Parvati Valley. Experience the authentic "Old Manali" lifestyle curated specifically for the Ahmedabad explorer.
            </p>
          </div>

          {/* Itinerary Timeline */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bungee font-black uppercase tracking-tighter border-l-4 border-secondary pl-6">Detailed Itinerary</h3>
            <div className="space-y-4">
              {itinerary.map((day, i) => (
                <motion.div
                  key={i}
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: -20 }}
                  className="liquid-glass p-8 rounded-[2.5rem] flex items-center space-x-8 group hover:bg-white/10 transition-all duration-500 cursor-default border-white/10"
                >
                  <span className="text-4xl font-bungee font-black text-secondary group-hover:scale-110 transition-transform">{day.day}</span>
                  <div>
                    <h4 className="text-xl font-bungee font-black uppercase tracking-tighter mb-1">{day.title}</h4>
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
              <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px]">PACKAGE STARTS FROM</span>
              <p className="text-5xl font-bungee font-black text-white mt-2 tracking-tighter">₹14,999<span className="text-xs text-white/20 ml-2">/PP</span></p>
            </div>

            <div className="space-y-6 mb-10">
              <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-white/60">
                <span>Inclusions</span>
                <span className="text-secondary text-[10px]">ALL INCLUSIVE</span>
              </div>
              <ul className="space-y-4">
                {["Luxury Transport", "Standard Stay", "Breakfast & Dinner", "Professional Captain"].map((inc, i) => (
                  <li key={i} className="flex items-center space-x-3 text-xs font-bold text-white/80">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-secondary text-white py-5 rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-secondary/80 transition-all shadow-xl shadow-secondary/30 transform hover:scale-105 active:scale-95 duration-500">
                Book My Adventure
              </button>
              <a
                href={getWhatsAppLink("Hi! I want to book the Himachal Mystique trip.")}
                target="_blank"
                className="w-full liquid-glass-dark py-5 rounded-3xl flex items-center justify-center space-x-3 border-white/10 hover:bg-white/10 transition-all"
              >
                <MessageCircle size={18} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Contact Captain</span>
              </a>
            </div>

            <div className="mt-8 text-center px-4">
              <p className="text-[9px] text-white/20 font-black uppercase tracking-widest leading-relaxed">Secured booking guaranteed with verified community badges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations CTA */}
      <section className="py-24 bg-white/5 backdrop-blur-3xl border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bungee font-black uppercase tracking-tighter italic mb-12">Looking for <span className="text-secondary">More?</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["Spiti", "Ladakh", "Srinagar", "Shimla"].map((place, i) => (
              <div key={i} className="liquid-glass p-6 rounded-3xl hover:bg-secondary transition-all cursor-pointer group border-white/5">
                <h4 className="font-bungee font-black text-xl uppercase italic group-hover:scale-110 transition-transform">{place}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
