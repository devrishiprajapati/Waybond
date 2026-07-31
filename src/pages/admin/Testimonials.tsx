import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquareText, Search, Star, Trash2, ArrowLeft, RefreshCw } from 'lucide-react'
import { deleteManagedTestimonial, getManagedTestimonials, ManagedTestimonial } from '../../lib/adminStorage'

const formatDate = (value?: string) => {
  if (!value) return 'Date not available'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<ManagedTestimonial[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadTestimonials = async () => {
    setLoading(true)
    setTestimonials(await getManagedTestimonials())
    setLoading(false)
  }

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    loadTestimonials()
  }, [navigate])

  const filteredTestimonials = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return testimonials
    return testimonials.filter((item) => [item.name, item.email, item.trip, item.review].filter(Boolean).some((value) => value!.toLowerCase().includes(query)))
  }, [search, testimonials])

  const handleDelete = async (testimonial: ManagedTestimonial) => {
    if (!window.confirm(`Delete ${testimonial.name}'s testimonial? This cannot be undone.`)) return
    await deleteManagedTestimonial(testimonial)
    setTestimonials((current) => current.filter((item) => !(String(item.id) === String(testimonial.id) && item.source === testimonial.source)))
  }

  return (
    <div className="min-h-screen bg-white text-white px-6 md:px-10 lg:px-16 pt-32 pb-20">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7 mb-10">
          <div>
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"><ArrowLeft size={15} /> Admin dashboard</Link>
            <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">Community voice</p>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase italic tracking-tighter liquid-text">Manage <span className="text-primary">Testimonials</span></h1>
          </div>
          <button onClick={loadTestimonials} className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 hover:border-secondary"><RefreshCw size={15} /> Refresh</button>
        </div>

        <div className="liquid-glass-dark border border-white/10 rounded-[2rem] p-5 mb-7 flex flex-col sm:flex-row gap-5 sm:items-center sm:justify-between">
          <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center"><MessageSquareText size={22} /></div><div><p className="text-[9px] text-white/35 font-black uppercase tracking-[0.2em]">Total testimonials</p><p className="text-2xl font-display font-black text-white">{testimonials.length}</p></div></div>
          <label className="relative w-full sm:max-w-md"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, trip or review..." className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary" /></label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredTestimonials.map((testimonial) => (
            <article key={`${testimonial.source}-${testimonial.id}`} className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-xl font-display font-black text-white uppercase italic tracking-tight">{testimonial.name}</p><p className="text-[10px] text-secondary font-black uppercase tracking-[0.16em] mt-1">{testimonial.trip}</p>{testimonial.email && <p className="text-xs text-white/40 mt-2">{testimonial.email}</p>}</div><button onClick={() => handleDelete(testimonial)} className="w-11 h-11 rounded-xl border border-red-400/25 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white flex items-center justify-center" title="Delete testimonial"><Trash2 size={17} /></button></div>
              <p className="text-white/70 text-sm leading-relaxed italic">&ldquo;{testimonial.review}&rdquo;</p>
              <div className="flex items-center justify-between border-t border-white/10 pt-4"><div className="flex gap-1">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} className={index < testimonial.rating ? 'text-secondary fill-secondary' : 'text-white/15'} />)}</div><span className="text-[9px] text-white/35 font-black uppercase tracking-[0.15em]">{formatDate(testimonial.createdAt)}</span></div>
            </article>
          ))}
        </div>

        {!loading && filteredTestimonials.length === 0 && <div className="liquid-glass-dark border border-white/10 rounded-[2rem] py-16 text-center"><MessageSquareText className="mx-auto text-white/20 mb-4" size={40} /><p className="text-white/50 font-bold">No testimonials found.</p></div>}
      </div>
    </div>
  )
}
