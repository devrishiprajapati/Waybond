import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ImagePlus, Quote, Send, Star, Video, X } from 'lucide-react'
import { haptics } from '../lib/haptics'
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
  const [name, setName] = useState('')
  const [trip, setTrip] = useState('')
  const [review, setReview] = useState('')
  const [rating, setRating] = useState(5)
  const [media, setMedia] = useState<string | undefined>()
  const [mediaType, setMediaType] = useState<'image' | 'video' | undefined>()
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

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

  const handleMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setError('Please choose an image or video file.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Please choose a file smaller than 8 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setMedia(String(reader.result))
      setMediaType(file.type.startsWith('video/') ? 'video' : 'image')
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || !trip.trim() || !review.trim()) {
      setError('Please add your name, trip name, and review.')
      return
    }
    const testimonial = { name: name.trim(), trip: trip.trim(), review: review.trim(), rating, media, mediaType, createdAt: new Date().toISOString() }
    let saved: Testimonial = { ...testimonial, id: Date.now() }
    try {
      const response = await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testimonial) })
      if (response.ok) saved = await response.json()
      else throw new Error('Unable to save')
    } catch {
      const local = [saved, ...readLocalTestimonials()]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
    }
    setTestimonials(current => [saved, ...current])
    setName('')
    setTrip('')
    setReview('')
    setRating(5)
    setMedia(undefined)
    setMediaType(undefined)
    setError('')
    setSubmitted(true)
    haptics.medium()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-40 pb-24 bg-white text-white relative overflow-hidden">
      <Helmet><title>Testimonials & Reviews | WayBond</title><meta name="description" content="Read WayBond traveller reviews and share your own trip story." /></Helmet>
      <div className="absolute top-24 right-[-10%] h-[34rem] w-[34rem] rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-4xl mb-16 md:mb-20 space-y-6">
          <div className="liquid-glass inline-flex items-center gap-3 px-5 py-2 rounded-full border-white/10 shadow-lg"><Quote size={14} className="text-secondary" /><span className="text-secondary font-black uppercase tracking-[0.4em] text-[9px]">Stories from the tribe</span></div>
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-display font-black text-white tracking-tighter uppercase leading-[0.9] liquid-text italic">TRAVELLER<br /><span className="text-secondary">REVIEWS</span></h1>
          <p className="text-lg text-white/50 font-medium max-w-2xl italic leading-relaxed">Real journeys, shared memories, and the people who made the WayBond experience their own.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-start">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.filter((testimonial) => !isTestimonialHidden(testimonial.id)).map((testimonial, index) => <motion.article key={`${testimonial.id}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="liquid-glass-dark rounded-[2.5rem] overflow-hidden border border-white/10 shadow-xl">
              {testimonial.media && <div className="h-56 bg-black/30">{testimonial.mediaType === 'video' ? <video src={testimonial.media} controls className="w-full h-full object-cover" /> : <img src={testimonial.media} alt={`${testimonial.name}'s trip`} className="w-full h-full object-cover" />}</div>}
              <div className="p-7 md:p-8"><Quote size={24} className="text-secondary/70 mb-5" /><p className="text-white/65 text-sm leading-relaxed italic font-medium">“{testimonial.review}”</p><div className="flex gap-1 mt-6">{Array.from({ length: testimonial.rating }).map((_, star) => <Star key={star} size={14} className="text-secondary fill-secondary" />)}</div><p className="mt-5 font-display font-black uppercase italic text-white tracking-tight">{testimonial.name}</p><p className="text-[9px] font-black uppercase tracking-[0.22em] text-secondary mt-1">{testimonial.trip}</p></div>
            </motion.article>)}
          </section>

          <aside className="liquid-glass p-7 md:p-10 rounded-[3rem] border border-white/15 shadow-2xl lg:sticky lg:top-28">
            <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">Share your story</h2>
            <p className="text-sm text-white/50 leading-relaxed italic font-medium mt-4 mb-8">Tell fellow travellers about your WayBond experience. You can add one photo or video with your review.</p>
            {submitted ? <div className="rounded-2xl bg-secondary/15 border border-secondary/30 p-5 text-sm text-white/80 italic">Thank you — your review has been added.</div> : <form onSubmit={handleSubmit} className="space-y-5">
              <input value={name} onChange={event => setName(event.target.value)} placeholder="YOUR NAME" className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold tracking-wider text-white placeholder-white/30 focus:outline-none focus:border-secondary/60" />
              <input value={trip} onChange={event => setTrip(event.target.value)} placeholder="TRIP NAME" className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold tracking-wider text-white placeholder-white/30 focus:outline-none focus:border-secondary/60" />
              <textarea value={review} onChange={event => setReview(event.target.value)} placeholder="YOUR REVIEW" rows={5} className="w-full resize-none bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-secondary/60" />
              <div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/50 mb-3">Your rating</p><div className="flex gap-2">{[1, 2, 3, 4, 5].map(value => <button key={value} type="button" onClick={() => setRating(value)} className="p-1"><Star size={22} className={value <= rating ? 'text-secondary fill-secondary' : 'text-white/20'} /></button>)}</div></div>
              <label className="block cursor-pointer rounded-2xl border border-dashed border-white/20 hover:border-secondary/60 transition-colors p-5 text-center"><input type="file" accept="image/*,video/*" onChange={handleMedia} className="hidden" /><div className="flex justify-center gap-3 text-secondary mb-2"><ImagePlus size={20} /><Video size={20} /></div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Upload photo or video</p><p className="text-[9px] text-white/35 mt-2">Image or video · maximum 8 MB</p></label>
              {media && <div className="relative h-32 rounded-2xl overflow-hidden bg-black/30">{mediaType === 'video' ? <video src={media} className="h-full w-full object-cover" /> : <img src={media} alt="Upload preview" className="h-full w-full object-cover" />}<button type="button" onClick={() => { setMedia(undefined); setMediaType(undefined) }} className="absolute top-3 right-3 bg-white/80 p-2 rounded-full"><X size={14} /></button></div>}
              {error && <p className="text-xs text-red-300">{error}</p>}
              <button type="submit" className="w-full bg-secondary text-white py-4 rounded-full font-black text-[10px] uppercase tracking-[0.22em] hover:bg-white hover:text-slate-800 transition-all duration-500 flex items-center justify-center gap-3"><Send size={15} /> Submit review</button>
            </form>}
          </aside>
        </div>
      </div>
    </motion.div>
  )
}

export default Testimonials
