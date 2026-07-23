import React from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function TestimonialsSection() {
  const testimonials = [
    { name: 'Karan Shah', text: "Infi Yatra transformed my solo trip to Spiti into a lifetime memory. Their local captains are true gems, ensuring every detail is perfect.", role: 'Photographer' },
    { name: 'Aditi Patel', text: "The WhatsApp integration is a game-changer. I could chat directly with the person who was going to lead the trek before even booking.", role: 'Trekker' },
    { name: 'Rajiv Mehta', text: "Best travel community in Ahmedabad. No corporate vibes, just pure passion for exploration and storytelling.", role: 'Expeditionist' }
  ];

  return (
    <section className="py-24 bg-charcoal relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <Heart className="text-secondary mx-auto drop-shadow-lg" size={40} />
          <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase italic leading-none">
            Traveler <span className="text-secondary">Love</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {testimonials.map((test, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="liquid-glass-dark p-12 rounded-[4rem] border border-white/10 hover:border-secondary/20 transition-all duration-700 shadow-2xl group"
            >
              <p className="text-white/80 font-medium text-lg leading-relaxed italic mb-8">"{test.text}"</p>
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/20 group-hover:bg-secondary transition-all">
                  <span className="text-white font-black text-xl">{test.name[0]}</span>
                </div>
                <div>
                  <h4 className="text-xl font-display font-black text-white uppercase italic tracking-tighter group-hover:text-secondary transition-all">{test.name}</h4>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-1">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
