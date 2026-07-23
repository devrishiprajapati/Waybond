import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, MessageCircle, MapPin, Search, Users, TrendingUp } from 'lucide-react'

export default function WhyChooseUs() {
  const reasons = [
    { 
      title: "Verified Captains", 
      desc: "Every trip is led by an Ahmedabad-local expert who knows the terrain and culture like the back of their hand.", 
      icon: Users
    },
    { 
      title: "Direct Support", 
      desc: "Instant WhatsApp connectivity with our captains. No corporate bots, just real humans planning your dream escape.", 
      icon: MessageCircle
    },
    { 
      title: "Safety First", 
      desc: "24/7 emergency support and geo-locked SOS integration on every group adventure.", 
      icon: ShieldCheck
    }
  ];

  return (
    <section className="py-24 bg-charcoal">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="liquid-glass-dark p-12 rounded-[3.5rem] hover:border-secondary/20 transition-all duration-700 group shadow-2xl"
            >
              <div className="liquid-glass p-6 rounded-[2rem] w-fit mb-8 shadow-xl group-hover:scale-110 transition-transform duration-500 border border-white/10">
                <reason.icon className="text-white group-hover:text-secondary transition-colors drop-shadow-md" size={32} />
              </div>
              <h3 className="text-3xl font-display font-black text-white uppercase tracking-tighter mb-4 italic drop-shadow-2xl">{reason.title}</h3>
              <p className="text-white/50 font-medium leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
