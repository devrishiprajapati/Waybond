import { useEffect, useRef, useState } from 'react'
import { Heart, Quote, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isTestimonialHidden } from '../../lib/adminStorage'

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
  { id: 3, name: 'Aarav Patel', trip: 'Bali Getaway', review: 'A perfect mix of adventure, comfort, and great people. It was the kind of holiday that stays with you long after you return.', rating: 5 },
  { id: 4, name: 'Priya Nair', trip: 'Kerala Backwaters', review: 'The houseboat experience was magical. WayBond took care of every detail — all I had to do was enjoy.', rating: 5 },
  { id: 5, name: 'Karan Joshi', trip: 'Rajasthan Royal Trail', review: 'Heritage forts, vibrant bazaars, and an incredible group. Easily one of the best trips of my life.', rating: 5 },
]

const readLocalTestimonials = (): Testimonial[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function TestimonialCard({ test }: { test: Testimonial }) {
  return (
    <Link
      to="/testimonials"
      aria-label={`Read ${test.name}'s review`}
      className="block shrink-0 w-80 md:w-96 mx-3 rounded-[2.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      tabIndex={-1}
    >
      <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-white shadow-lg hover:shadow-xl hover:border-accent/40 transition-all duration-500 group">
        {test.media && (
          <div className="h-36 rounded-2xl overflow-hidden bg-slate-100 mb-6">
            {test.mediaType === 'video'
              ? <video src={test.media} controls className="w-full h-full object-cover" />
              : <img src={test.media} alt={`${test.name}'s trip`} className="w-full h-full object-cover" />}
          </div>
        )}

        <Quote size={20} className="text-accent mb-3" />
        <p className="text-slate-600 font-medium text-sm leading-relaxed italic mb-5">
          &quot;{test.review}&quot;
        </p>

        <div className="flex gap-1 mb-5">
          {Array.from({ length: Math.min(test.rating || 5, 5) }).map((_, i) => (
            <Star key={i} size={13} className="text-accent fill-accent" />
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 shrink-0 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover:bg-secondary transition-all">
            <span className="text-secondary group-hover:text-white font-black text-lg transition-colors">{test.name[0]}</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-display font-black text-slate-800 uppercase italic tracking-tighter group-hover:text-secondary transition-all truncate text-sm">
              {test.name}
            </h4>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.28em] mt-0.5 truncate">
              {test.trip}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/testimonials')
        if (res.ok) {
          const saved: Testimonial[] = await res.json()
          if (saved.length) { setTestimonials(saved); return }
        }
      } catch { /* fall through */ }
      const local = readLocalTestimonials()
      if (local.length) setTestimonials([...local, ...fallbackTestimonials])
    }
    load()
  }, [])

  // Duplicate so the marquee can translate -50% and loop perfectly
  const visibleTestimonials = testimonials.filter((testimonial) => !isTestimonialHidden(testimonial.id))
  const doubled = [...visibleTestimonials, ...visibleTestimonials]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Soft decorative glow — no dark colours */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 text-center mb-14 space-y-3">
        <Heart className="text-secondary mx-auto drop-shadow-lg" size={40} />
        <h2 className="text-4xl md:text-6xl font-display font-black text-slate-800 tracking-tighter uppercase italic leading-none">
          Traveler <span className="text-secondary">Love</span>
        </h2>
      </div>

      {/* Marquee viewport */}
      <div className="relative overflow-hidden">
        {/* White edge-fade masks — matches the white background, zero dark leaking */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-48 z-10"
          style={{ background: 'linear-gradient(to right, #ffffff 0%, transparent 100%)' }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-48 z-10"
          style={{ background: 'linear-gradient(to left, #ffffff 0%, transparent 100%)' }}
        />

        {/*
          marquee-track in index.css:
            animation: marquee 40s linear infinite;
            translateX(-50%) moves exactly one set of cards (half of doubled array) off-screen,
            then the animation resets instantly to 0 — producing a seamless, jitter-free loop.
        */}
        <div ref={trackRef} className="marquee-track py-4">
          {doubled.map((test, i) => (
            <TestimonialCard key={`${test.id}-${i}`} test={test} />
          ))}
        </div>
      </div>
    </section>
  )
}
