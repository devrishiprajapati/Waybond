import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  BookOpen,
  Calendar,
  Edit2,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquareText,
  Package,
  Plus,
  Search,
  Star,
  Trash2,
  UsersRound,
  Images
} from 'lucide-react'
import { getTrips, deleteTrip } from '../../lib/dataService'
import { Trip } from '../../lib/trips'

type DashboardStats = {
  totalPackages: number
  users: number
  bookings: number
  testimonials: number
}

const AdminDashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [liveStats, setLiveStats] = useState<DashboardStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [experienceFilter, setExperienceFilter] = useState<'All' | Trip['experience']>('All')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/admin/dashboard')
        if (!response.ok) throw new Error('Live dashboard data is unavailable.')
        const data = await response.json()
        setTrips(data.trips)
        setLiveStats(data.stats)
      } catch {
        setTrips([])
      }
    }

    void loadDashboard()
    const refreshInterval = window.setInterval(() => void loadDashboard(), 15000)
    return () => window.clearInterval(refreshInterval)
  }, [navigate])

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesExperience = experienceFilter === 'All' || trip.experience === experienceFilter
      return matchesSearch && matchesExperience
    })
  }, [trips, searchTerm, experienceFilter])

  const stats = useMemo(() => {
    return [
      { label: 'Total Packages', value: liveStats?.totalPackages ?? trips.length, icon: Package },
      { label: 'Registered Users', value: liveStats?.users ?? 0, icon: UsersRound },
      { label: 'Total Bookings', value: liveStats?.bookings ?? 0, icon: Calendar },
      { label: 'Testimonials', value: liveStats?.testimonials ?? 0, icon: Star }
    ]
  }, [liveStats, trips.length])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this expedition?')) {
      await deleteTrip(id)
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setTrips(data.trips)
        setLiveStats(data.stats)
      } else {
        setTrips([])
      }
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin')
    navigate('/admin/login')
  }

  const navItems = [
    { label: 'Inventory', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Trending Adventures', path: '/admin/hero', icon: ImageIcon },
    { label: 'New Package', path: '/admin/new', icon: Plus },
    { label: 'Travel Stories', path: '/admin/travel-stories', icon: BookOpen },
    { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareText },
    { label: 'Users', path: '/admin/users', icon: UsersRound },
    { label: 'Gallery', path: '/admin/gallery', icon: Images }
  ]

  return (
    <div className="min-h-screen bg-white text-white flex">
      <aside className="w-80 liquid-glass-dark border-r border-white/10 p-8 hidden lg:flex flex-col">
        <div className="mb-12">
          <p className="text-secondary text-[9px] font-black uppercase tracking-[0.4em] mb-3">WayBond</p>
          <h1 className="text-3xl font-display font-black uppercase italic tracking-tighter liquid-text">
            Admin <span className="text-primary">Basecamp</span>
          </h1>
        </div>

        <nav className="flex-grow space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.16em] transition-all ${
                location.pathname === item.path
                  ? 'bg-secondary text-white shadow-xl shadow-secondary/20'
                  : 'text-white/55 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 text-red-300/80 hover:text-red-200 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.16em] mt-auto"
        >
          <LogOut size={18} />
          <span>Exit Basecamp</span>
        </button>
      </aside>

      <main className="flex-grow p-6 md:p-10 lg:p-12 overflow-y-auto">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-10">
          <div className="space-y-4">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Control Center</span>
            <h2 className="text-3xl md:text-5xl pt-8 font-display font-black tracking-tighter uppercase italic leading-none liquid-text">
              Package <span className="text-primary">Inventory</span>
            </h2>
            <p className="text-white/45 font-medium italic max-w-2xl">
              Manage trips, pricing, hero content, and featured expedition details from one focused admin dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/hero"
              className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-white hover:text-slate-800 transition-all"
            >
              <ImageIcon size={16} /> Edit Trending Cards
            </Link>
            <Link
              to="/admin/testimonials"
              className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-white hover:text-slate-800 transition-all"
            >
              <MessageSquareText size={16} /> Testimonials
            </Link>
            <Link
              to="/admin/new"
              className="h-12 px-6 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-white hover:text-slate-800 transition-all shadow-xl shadow-secondary/20"
            >
              <Plus size={16} /> Add Expedition
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="liquid-glass-dark border border-white/10 rounded-2xl lg:rounded-[2rem] p-4 md:p-6 flex flex-col lg:flex-row items-center gap-3 lg:gap-5"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl lg:rounded-2xl bg-secondary/15 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
                <stat.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <div className="text-center lg:text-left">
                <p className="text-[8px] md:text-[9px] text-white/35 font-black uppercase tracking-[0.18em] md:tracking-[0.24em]">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-display font-black text-white mt-1 md:mt-2 leading-none">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-5 md:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative flex-grow max-w-2xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/25" size={18} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search package, location, category..."
                className="w-full h-[52px] bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(['All', 'monsoon', 'weekend', 'road', 'snow'] as const).map((experience) => (
                <button
                  key={experience}
                  onClick={() => setExperienceFilter(experience)}
                  className={`h-11 px-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.18em] transition-all ${
                    experienceFilter === experience
                      ? 'bg-secondary text-white'
                      : 'bg-white/5 text-white/45 border border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {experience === 'All' ? 'All' : `${experience} trips`}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          {filteredTrips.map((trip, index) => (
            <motion.article
              key={trip.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035 }}
              className="liquid-glass-dark border border-white/10 rounded-[2rem] p-5 md:p-6 flex flex-col xl:flex-row xl:items-center gap-6 group"
            >
              <div className="w-full xl:w-32 h-44 xl:h-32 rounded-[1.5rem] overflow-hidden shrink-0">
                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>

              <div className="flex-grow min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border bg-secondary/10 text-secondary border-secondary/20">
                    {trip.experience} trips
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full bg-white/5 text-white/50 border border-white/10">
                    {trip.category}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter text-white leading-none">{trip.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-white/45 text-[10px] font-black uppercase tracking-[0.16em]">
                  <span className="flex items-center gap-2"><MapPin size={13} className="text-secondary" /> {trip.location}</span>
                  <span className="flex items-center gap-2"><Calendar size={13} className="text-secondary" /> {trip.nextBatch || 'Batch TBA'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 xl:w-[260px]">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.18em] block mb-2">Rate</span>
                  <span className="text-xl font-display font-black text-secondary tracking-tighter">₹{trip.price}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.18em] block mb-2">Duration</span>
                  <span className="text-sm font-black text-white">{trip.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 xl:ml-auto">
                <Link
                  to={`/trip/${trip.id}`}
                  className="h-12 px-5 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white hover:text-slate-800 transition-all flex items-center justify-center"
                  title="Preview trip"
                >
                  <BarChart3 size={17} />
                </Link>
                <Link
                  to={`/admin/edit/${trip.id}`}
                  className="h-12 px-5 rounded-2xl bg-secondary text-white hover:bg-white hover:text-slate-800 transition-all flex items-center justify-center"
                  title="Edit trip"
                >
                  <Edit2 size={17} />
                </Link>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="h-12 px-5 rounded-2xl bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                  title="Delete trip"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </motion.article>
          ))}

          {filteredTrips.length === 0 && (
            <div className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-12 text-center">
              <Package className="mx-auto text-white/20 mb-5" size={44} />
              <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter text-white/50">No packages found</h3>
              <p className="text-white/35 text-sm font-medium italic mt-2">Try another search or add a fresh expedition.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminDashboard
