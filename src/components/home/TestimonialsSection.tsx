import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { isTestimonialHidden } from '../../lib/adminStorage'
import { haptics } from '../../lib/haptics'

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

function readLocalTestimonials(): Testimonial[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const fallbackTestimonials: Testimonial[] = [
  { 
    id: 1, 
    name: 'Riya Shah', 
    trip: 'Spiti Valley Expedition', 
    review: 'Every detail felt thoughtful, from the group energy to the unforgettable mountain views. I came home with stories and new friends.', 
    rating: 5,
    media: '/assets/spiti.jpg',
    mediaType: 'image'
  },
  { 
    id: 2, 
    name: 'Dev Mehta',  
    trip: 'Himachal Escape', 
    review: 'WayBond made travelling as a solo explorer feel easy and exciting. The trip leader was fantastic and the itinerary was beautifully paced.', 
    rating: 5,
    media: '/assets/himal.jpg',
    mediaType: 'image'
  },
  { 
    id: 3, 
    name: 'Bhumit Rabadiya', 
    trip: 'Thailand Trip', 
    review: 'Thank you for crafting a trip that perfectly matched our style and interests. Your attention to detail made all the difference!', 
    rating: 5,
    media: '/assets/LBK.jpeg',
    mediaType: 'image'
  },
  { 
    id: 4, 
    name: 'Aarav Patel', 
    trip: 'Bali Getaway', 
    review: 'A perfect mix of adventure, comfort, and great people. It was the kind of holiday that stays with you long after you return.', 
    rating: 5,
    media: '/assets/bali.jpg',
    mediaType: 'image'
  },
  { 
    id: 5, 
    name: 'Priya Nair', 
    trip: 'Kerala Backwaters', 
    review: 'The houseboat experience was magical. WayBond took care of every detail — all I had to do was enjoy.', 
    rating: 5,
    media: '/assets/kerelabeach.jpg',
    mediaType: 'image'
  },
  { 
    id: 6, 
    name: 'Karan Joshi', 
    trip: 'Rajasthan Royal Trail', 
    review: 'Heritage forts, vibrant bazaars, and an incredible group. Easily one of the best trips of my life.', 
    rating: 5,
    media: '/assets/hadimba.jpg',
    mediaType: 'image'
  },
]

function TestimonialCard({ test }: { test: Testimonial }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const truncatedReview = test.review.length > 100 ? test.review.slice(0, 100) + '...' : test.review

  return (
    <Link 
      to="/testimonials"
      onClick={() => haptics.light()}
      className="block shrink-0 w-[280px] sm:w-[300px] md:w-[320px] mx-3 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 bg-white cursor-pointer hover:-translate-y-1"
    >
      {/* Trip Photo - Large at top */}
      {test.media && (
        <div className="h-48 sm:h-52 md:h-56 overflow-hidden bg-slate-100 relative">
          {test.mediaType === 'video' ? (
            <video src={test.media} className="w-full h-full object-cover pointer-events-none" />
          ) : (
            <img 
              src={test.media} 
              alt={`${test.name}'s ${test.trip}`} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="p-5 sm:p-6">
        {/* Star Rating */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: Math.min(test.rating || 5, 5) }).map((_, i) => (
            <Star key={i} size={16} className="text-yellow-500 fill-yellow-500" />
          ))}
        </div>

        {/* Review Text */}
        <p className="text-slate-700 font-normal text-sm leading-relaxed mb-3">
          {isExpanded ? test.review : truncatedReview}
        </p>

        {/* Read More Link */}
        {test.review.length > 100 && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-slate-400 text-xs font-medium hover:text-secondary transition-colors mb-4"
          >
            {isExpanded ? 'Show less' : 'Read more...'}
          </button>
        )}

        {/* User Info at Bottom */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          {/* Profile Photo */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full overflow-hidden bg-secondary/10 border-2 border-secondary/20">
            {test.media ? (
              <img 
                src={test.media} 
                alt={test.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-secondary font-bold text-base">{test.name[0]}</span>
              </div>
            )}
          </div>
          
          {/* Name and Trip */}
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-800 text-sm truncate">
              {test.name}
            </h4>
            <p className="text-slate-400 text-xs truncate">
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

  // Filter to show only testimonials with photos, then duplicate for marquee
  const visibleTestimonials = testimonials.filter((testimonial) => !isTestimonialHidden(testimonial.id) && testimonial.media)
  const doubled = [...visibleTestimonials, ...visibleTestimonials]

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Soft decorative glow — no dark colours */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 text-center mb-14 space-y-3">
        <Heart className="text-secondary mx-auto drop-shadow-lg" size={40} />
        <h2 className="text-2xl md:text-5xl font-bungee font-black text-slate-800 tracking-tighter uppercase italic leading-none">
          Traveler <span className="text-secondary font-bungee">Love</span>
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
