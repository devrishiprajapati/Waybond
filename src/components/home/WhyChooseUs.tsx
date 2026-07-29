import React from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Headphones, AlertCircle } from 'lucide-react'

export default function WhyChooseUs() {
  const reasons = [
    { 
      title: "Verified Captains", 
      desc: "Every trip is led by an Ahmedabad-local expert who knows the terrain and culture like the back of their hand.", 
      icon: BadgeCheck
    },
    { 
      title: "Direct Support", 
      desc: "Instant WhatsApp connectivity with our captains. No corporate bots, just real humans planning your dream escape.", 
      icon: Headphones
    },
    { 
      title: "Safety First", 
      desc: "24/7 emergency support and geo-locked SOS integration on every group adventure.", 
      icon: AlertCircle
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 uppercase tracking-tight mb-4">
            Why Choose Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Experience travel reimagined with authentic local expertise, genuine human connections, and your safety as our priority.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white border-2 border-gray-100 p-12 rounded-[2.5rem] hover:border-blue-300 hover:shadow-lg transition-all duration-500 group"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform duration-500 border border-blue-200">
                <reason.icon className="text-blue-600 group-hover:text-blue-700 transition-colors" size={36} />
              </div>
              <h3 className="text-2xl font-display font-black text-gray-900 uppercase tracking-tight mb-3">
                {reason.title}
              </h3>
              <p className="text-gray-600 font-medium leading-relaxed">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
