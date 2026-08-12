import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Quote, Star } from 'lucide-react'
import { isTestimonialHidden } from '../lib/adminStorage'

type Testimonial = {
  id: number
  name: string
  trip: string
  review: string
  rating: number
  media?: string
  mediaType?: 'image' | 'video'
  createdAt?: string
}

const STORAGE_KEY = 'waybond_testimonials'
const starterTestimonials: Testimonial[] = [
  { id: 1, name: 'Riya Shah', trip: 'Spiti Valley Expedition', review: 'Every detail felt thoughtful, from the group energy to the unforgettable mountain views. I came home with stories and new friends.', rating: 5 },
  { id: 2, name: 'Dev Mehta', trip: 'Himachal Escape', review: 'WayBond made travelling as a solo explorer feel easy and exciting. The trip leader was fantastic and the itinerary was beautifully paced.', rating: 5 },
  { id: 3, name: 'Aarav Patel', trip: 'Bali Getaway', review: 'A perfect mix of adventure, comfort, and great people. It was the kind of holiday that stays with you long after you return.', rating: 5 }
]

const readLocalTestimonials = (): Testimonial[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(starterTestimonials)

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials')
        if (response.ok) {
          const saved = await response.json()
          if (saved.length) setTestimonials([...saved, ...starterTestimonials])
          return
        }
      } catch { /* Local storage fallback is used below. */ }
      const saved = readLocalTestimonials()
      if (saved.length) setTestimonials([...saved, ...starterTestimonials])
    }
    loadTestimonials()
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-40 pb-24 bg-white text-white relative overflow-hidden">
      <Helmet><title>Testimonials & Reviews | WayBond</title><meta name="description" content="Read WayBond traveller reviews and testimonials." /></Helmet>
      <div className="absolute top-24 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-4xl mb-16 md:mb-20 space-y-6">
          {/* <div className="liquid-glass inline-flex items-center gap-3 px-5 py-2 rounded-full border-white/10 shadow-lg"><Quote size={14} className="text-secondary" /><span className="text-secondary font-black uppercase tracking-[0.4em] text-[9px]">Stories from the tribe</span></div> */}
          <h1 className="text-2xl md:text-4xl lg:text-5xl
           font-bungee font-black text-white tracking-tighter uppercase leading-[0.9] liquid-text italic">TRAVELLER<br /><span className="text-secondary">REVIEWS</span></h1>
          <p className="text-lg text-white/50 font-medium max-w-2xl italic leading-relaxed">Real journeys, shared memories, and the people who made the WayBond experience their own.</p>
          <p className="text-sm text-white/40 italic mt-4">Add your testimonial from your dashboard after booking a trip.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.filter((testimonial) => !isTestimonialHidden(testimonial.id)).map((testimonial, index) => (
            <motion.article
              key={`${testimonial.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="liquid-glass-dark rounded-[2.5rem] overflow-hidden border border-white/10 shadow-xl"
            >
              {testimonial.media && (
                <div className="h-56 bg-black/30">
                  {testimonial.mediaType === 'video' ? (
                    <video src={testimonial.media} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={testimonial.media} alt={`${testimonial.name}'s trip`} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              <div className="p-7 md:p-8">
                <Quote size={24} className="text-secondary/70 mb-5" />
                <p className="text-white/65 text-sm leading-relaxed italic font-medium">"{testimonial.review}"</p>
                <div className="flex gap-1 mt-6">
                  {Array.from({ length: testimonial.rating }).map((_, star) => (
                    <Star key={star} size={14} className="text-secondary fill-secondary" />
                  ))}
                </div>
                <p className="mt-5 font-bungee font-black uppercase italic text-white tracking-tight">{testimonial.name}</p>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-secondary mt-1">{testimonial.trip}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Testimonials
