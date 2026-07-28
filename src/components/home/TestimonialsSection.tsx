import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

type Testimonial = {
  id: number
  name: string
  trip: string
  review: string
  rating: number
  media?: string
  mediaType?: 'image' | 'video'
}

const STORAGE_KEY = 'waybond_testimonials'
const fallbackTestimonials: Testimonial[] = [
  { id: 1, name: 'Riya Shah', trip: 'Spiti Valley Expedition', review: 'Every detail felt thoughtful, from the group energy to the unforgettable mountain views. I came home with stories and new friends.', rating: 5 },
  { id: 2, name: 'Dev Mehta', trip: 'Himachal Escape', review: 'WayBond made travelling as a solo explorer feel easy and exciting. The trip leader was fantastic and the itinerary was beautifully paced.', rating: 5 },
  { id: 3, name: 'Aarav Patel', trip: 'Bali Getaway', review: 'A perfect mix of adventure, comfort, and great people. It was the kind of holiday that stays with you long after you return.', rating: 5 }
]

const readLocalTestimonials = (): Testimonial[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)

  useEffect(() => {
    const loadLatestTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials')
        if (response.ok) {
          const saved: Testimonial[] = await response.json()
          if (saved.length) {
            setTestimonials(saved.slice(0, 3))
            return
          }
        }
      } catch { /* Fall back to reviews saved in this browser. */ }

      const localReviews = readLocalTestimonials()
      if (localReviews.length) setTestimonials(localReviews.slice(0, 3))
    }

    loadLatestTestimonials()
  }, [])

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <Heart className="text-secondary mx-auto drop-shadow-lg" size={40} />
          <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter uppercase italic leading-none">Traveler <span className="text-secondary">Love</span></h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {testimonials.map((test, index) => (
            <Link key={`${test.id}-${index}`} to="/testimonials" aria-label={`Read more traveller reviews, including ${test.name}'s review`} className="block h-full rounded-[4rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="liquid-glass-dark h-full p-12 rounded-[4rem] border border-white/10 hover:border-secondary/20 transition-all duration-700 shadow-2xl group"
              >
                {test.media && <div className="h-40 rounded-[2rem] overflow-hidden bg-black/30 mb-8">{test.mediaType === 'video' ? <video src={test.media} controls className="w-full h-full object-cover" /> : <img src={test.media} alt={`${test.name}'s trip`} className="w-full h-full object-cover" />}</div>}
                <p className="text-white/80 font-medium text-lg leading-relaxed italic mb-6 max-h-36 overflow-hidden">&quot;{test.review}&quot;</p>
                <div className="flex gap-1 mb-6">{Array.from({ length: Math.min(test.rating || 5, 5) }).map((_, star) => <Star key={star} size={14} className="text-secondary fill-secondary" />)}</div>
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/20 group-hover:bg-secondary transition-all"><span className="text-white font-black text-xl">{test.name[0]}</span></div>
                  <div className="min-w-0"><h4 className="text-xl font-display font-black text-white uppercase italic tracking-tighter group-hover:text-secondary transition-all truncate">{test.name}</h4><p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-1 truncate">{test.trip}</p></div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
