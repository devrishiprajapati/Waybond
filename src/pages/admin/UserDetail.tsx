import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ClipboardList, Mail, MapPin, MessageSquareText, Phone, ShieldCheck, Star, UserRound, type LucideIcon } from 'lucide-react'

type UserDetailData = {
  user: {
    id: string
    name: string
    email: string
    role?: string
    joinedAt: string
    lastLoginAt: string
    profile?: Record<string, unknown>
  }
  bookings: Array<Record<string, unknown>>
  testimonials: Array<{ id: string; trip: string; review: string; rating: number; createdAt: string }>
}

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not available'
const profileValue = (profile: Record<string, unknown> | undefined, key: string) => String(profile?.[key] || 'Not provided')

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<UserDetailData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    if (!id) return

    const loadUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}/dashboard`)
        if (!response.ok) throw new Error('Unable to load this user.')
        setData(await response.json())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load this user.')
      }
    }
    void loadUser()
  }, [id, navigate])

  if (error) return <div className="min-h-screen bg-white text-white px-6 pt-32"><div className="max-w-5xl mx-auto liquid-glass-dark border border-white/10 rounded-[2rem] p-10"><Link to="/admin/users" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-6"><ArrowLeft size={15} /> Back to users</Link><p className="text-red-300 font-bold">{error}</p></div></div>
  if (!data) return <div className="min-h-screen bg-white text-white px-6 pt-32"><div className="max-w-5xl mx-auto text-white/45 font-bold">Loading user details...</div></div>

  const { user, bookings, testimonials } = data
  const profile = user.profile
  const governmentId = profile?.governmentId as { name?: string } | undefined
  const details = [
    ['Phone', profileValue(profile, 'mobileNumber'), Phone],
    ['Date of birth', profileValue(profile, 'dateOfBirth'), CalendarDays],
    ['Gender', profileValue(profile, 'gender'), UserRound],
    ['Blood group', profileValue(profile, 'bloodGroup'), ShieldCheck],
    ['Address', profileValue(profile, 'address'), MapPin],
    ['Emergency contact', profileValue(profile, 'emergencyContact'), Phone],
    ['Medical information', profileValue(profile, 'medicalInfo'), ClipboardList],
    ['Government ID', governmentId?.name || 'Not provided', ShieldCheck]
  ] as const
  const overview: Array<{ label: string; value: number; Icon: LucideIcon }> = [
    { label: 'Bookings', value: bookings.length, Icon: ClipboardList },
    { label: 'Testimonials', value: testimonials.length, Icon: MessageSquareText },
    { label: 'Profile details', value: details.filter(([, value]) => value !== 'Not provided').length, Icon: UserRound }
  ]

  return (
    <div className="min-h-screen bg-white text-white px-6 md:px-10 lg:px-16 pt-32 pb-20">
      <div className="max-w-[1500px] mx-auto">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-7"><ArrowLeft size={15} /> All users</Link>

        <section className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 md:p-9 mb-7 flex flex-col lg:flex-row lg:items-center justify-between gap-7">
          <div className="flex items-center gap-5"><span className="w-16 h-16 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center"><UserRound size={30} /></span><div><p className="text-secondary text-[9px] font-black uppercase tracking-[0.2em] mb-2">Explorer profile</p><h1 className="text-3xl md:text-5xl font-display font-black uppercase italic tracking-tighter text-white">{user.name}</h1><p className="text-white/55 text-sm mt-2 flex items-center gap-2"><Mail size={14} className="text-secondary" /> {user.email}</p></div></div>
          <div className="flex flex-wrap gap-3 text-[9px] font-black uppercase tracking-[0.16em]"><span className="px-4 py-2 rounded-full bg-secondary/15 text-secondary">{user.role || 'User'}</span><span className="px-4 py-2 rounded-full bg-white/5 text-white/50">Joined {formatDate(user.joinedAt)}</span><span className="px-4 py-2 rounded-full bg-white/5 text-white/50">Last sign in {formatDate(user.lastLoginAt)}</span></div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
          {overview.map(({ label, value, Icon }) => <div key={label} className="liquid-glass-dark border border-white/10 rounded-2xl p-6 flex items-center gap-4"><span className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center"><Icon size={21} /></span><div><p className="text-[9px] text-white/35 font-black uppercase tracking-[0.16em]">{label}</p><p className="text-3xl font-display font-black text-white mt-1">{value}</p></div></div>)}
        </div>

        <section className="mb-7"><h2 className="text-2xl font-display font-black uppercase italic text-white mb-4">Personal <span className="text-secondary">Details</span></h2><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{details.map(([label, value, Icon]) => <div key={label} className="liquid-glass-dark border border-white/10 rounded-2xl p-5"><Icon size={18} className="text-secondary mb-4" /><p className="text-[9px] text-white/35 font-black uppercase tracking-[0.16em] mb-2">{label}</p><p className="text-sm text-white/80 font-semibold break-words">{value}</p></div>)}</div></section>

        <section className="mb-7"><h2 className="text-2xl font-display font-black uppercase italic text-white mb-4">Booked <span className="text-secondary">Trips</span></h2><div className="space-y-4">{bookings.length ? bookings.map((booking, index) => <article key={String(booking.id || index)} className="liquid-glass-dark border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"><div><p className="text-lg font-display font-black uppercase italic text-white">{String(booking.title || booking.tripTitle || 'WayBond Trip')}</p><p className="text-sm text-white/50 mt-2">{String(booking.location || booking.destination || 'Location pending')}</p></div><div className="flex flex-wrap gap-3 text-[9px] font-black uppercase tracking-[0.14em]"><span className="px-3 py-2 rounded-full bg-secondary/15 text-secondary">{String(booking.status || 'Booked')}</span><span className="px-3 py-2 rounded-full bg-white/5 text-white/55">{String(booking.bookingId || `Booking ${index + 1}`)}</span><span className="px-3 py-2 rounded-full bg-white/5 text-white/55">{String(booking.travelers || 1)} traveller(s)</span></div></article>) : <div className="liquid-glass-dark border border-white/10 rounded-2xl p-8 text-white/45">No booked trips yet.</div>}</div></section>

        <section><h2 className="text-2xl font-display font-black uppercase italic text-white mb-4">User <span className="text-secondary">Testimonials</span></h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{testimonials.length ? testimonials.map((testimonial) => <article key={testimonial.id} className="liquid-glass-dark border border-white/10 rounded-2xl p-5"><p className="text-secondary text-[10px] font-black uppercase tracking-[0.16em] mb-3">{testimonial.trip}</p><p className="text-white/75 italic leading-relaxed">&ldquo;{testimonial.review}&rdquo;</p><div className="flex items-center justify-between border-t border-white/10 mt-5 pt-4"><span className="flex gap-1">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} className={index < testimonial.rating ? 'text-secondary fill-secondary' : 'text-white/15'} />)}</span><span className="text-[9px] text-white/35 font-black uppercase tracking-[0.14em]">{formatDate(testimonial.createdAt)}</span></div></article>) : <div className="liquid-glass-dark border border-white/10 rounded-2xl p-8 text-white/45">No testimonials yet.</div>}</div></section>
      </div>
    </div>
  )
}
