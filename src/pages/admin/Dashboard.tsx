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
  Users2,
  Images,
  Shield,
  Filter,
  CreditCard,
  TrendingUp
} from 'lucide-react'
import { getTrips, deleteTrip } from '../../lib/dataService'
import { Trip } from '../../lib/trips'
import PermissionGuard from '../../components/PermissionGuard'

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
  const [adminData, setAdminData] = useState<any>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }

    // Get admin data for permission checking
    const adminDataStr = sessionStorage.getItem('adminData')
    if (adminDataStr) {
      try {
        setAdminData(JSON.parse(adminDataStr))
      } catch (error) {
        console.error('Failed to parse admin data:', error)
      }
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
    sessionStorage.removeItem('adminData')
    navigate('/admin/login')
  }

  const navItems = [
    { label: 'Inventory', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'manage_trips' },
    { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp, permission: 'view_analytics' },
    { label: 'Data Filters', path: '/admin/data-filters', icon: Filter, permission: 'view_data_filters' },
    { label: 'Trending Adventures', path: '/admin/hero', icon: ImageIcon, permission: 'manage_hero' },
    { label: 'New Package', path: '/admin/new', icon: Plus, permission: 'manage_trips' },
    { label: 'Travel Stories', path: '/admin/travel-stories', icon: BookOpen, permission: 'manage_travel_stories' },
    { label: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareText, permission: 'manage_testimonials' },
    { label: 'Team Members', path: '/admin/team-members', icon: Users2, permission: 'manage_team_members' },
    { label: 'Users', path: '/admin/users', icon: UsersRound, permission: 'manage_users' },
    { label: 'Payment Update', path: '/admin/payment-update', icon: CreditCard, permission: 'view_bookings' },
    { label: 'Gallery', path: '/admin/gallery', icon: Images, permission: 'manage_gallery' },
    { label: 'Admin Management', path: '/admin/admins', icon: Shield, permission: 'manage_admins' }
  ]

  // Helper function to check if admin has permission
  const hasPermission = (permission: string) => {
    if (!adminData) return false
    // Master Admin has all permissions
    if (adminData.role === 'MASTER_ADMIN') return true
    // Check if admin has the specific permission
    return adminData.permissions && adminData.permissions.includes(permission)
  }

  // Filter navigation items based on permissions
  const visibleNavItems = navItems.filter(item => hasPermission(item.permission))

  return (
    <PermissionGuard>
    <div className="min-h-screen bg-white text-white flex overflow-x-hidden pb-24 lg:pb-0">
      <aside className="w-80 liquid-glass-dark border-r border-white/10 px-8 pt-24 pb-8 hidden lg:flex flex-col">
        <div className="mb-12">
          <p className="text-secondary text-[9px] font-black uppercase tracking-[0.4em] mb-3 font-bungee">WayBond</p>
          <h1 className="text-3xl font-bungee font-black uppercase italic tracking-tighter">
            Admin <span className="text-primary font-bungee">Basecamp</span>
          </h1>
        </div>

        <nav className="flex-grow space-y-3">
          {visibleNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.16em] transition-all${location.pathname === item.path
                ? 'bg-secondary text-white shadow-xl shadow-secondary/20'
                : 'text-white/55 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={18} />
              <span className='font-bungee'>{item.label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 text-red-300/80 hover:text-red-200 hover:bg-red-500/10 rounded-2xl transition-all font-black text-[11px] uppercase tracking-[0.16em] mt-auto"
        >
          <LogOut size={18} />
          <span className='font-bungee'>Exit Basecamp</span>
        </button>
      </aside>

      <main className="min-w-0 flex-grow p-4 pt-24 sm:p-6 sm:pt-24 md:p-10 lg:p-12 lg:pt-12 overflow-y-auto">
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 shadow-xl shadow-slate-950/10 lg:hidden">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-secondary">WayBond</p>
            <p className="truncate text-sm font-black uppercase text-white">Admin Basecamp</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300"
            aria-label="Exit admin panel"
          >
            <LogOut size={17} />
          </button>
        </div>

        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-5 md:gap-8 mb-8 md:mb-10">
          <div className="space-y-4">
            {/* <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Control Center</span> */}
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:pt-8 font-bungee font-black uppercase italic leading-tight">
              Package <span className="text-primary font-bungee">Inventory</span>
            </h2>
            {/* <p className="text-white/45 font-medium italic max-w-2xl">
              Manage trips, pricing, hero content, and featured expedition details from one focused admin dashboard.
            </p> */}
          </div>

          {/* <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/hero"
              className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-white/20 hover:border-white/30 transition-all font-bungee"
            >
              <ImageIcon size={16} /> Edit Trending Cards
            </Link>
            <Link
              to="/admin/testimonials"
              className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-white/20 hover:border-white/30 transition-all font-bungee"
            >
              <MessageSquareText size={16} /> Testimonials
            </Link>
            <Link
              to="/admin/new"
              className="h-12 px-6 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 hover:bg-secondary/80 transition-all shadow-xl shadow-secondary/20 font-bungee"
            >
              <Plus size={16} /> Add Expedition
            </Link>
          </div> */}
        </header>

        <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-8">
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
                <p className="text-2xl md:text-3xl font-sans font-black text-white mt-1 md:mt-2 leading-none">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show trips section only if admin has manage_trips permission */}
        {hasPermission('manage_trips') ? (
          <>
        <section className="liquid-glass-dark border border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-6 mb-8">
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

            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
              {(['All', 'monsoon', 'weekend', 'road', 'snow'] as const).map((experience) => (
                <button
                  key={experience}
                  onClick={() => setExperienceFilter(experience)}
                  className={`h-11 shrink-0 px-4 sm:px-5 rounded-2xl font-black text-[9px] uppercase tracking-[0.14em] sm:tracking-[0.18em] transition-all font-bungee ${experienceFilter === experience
                    ? 'bg-secondary text-white'
                    : 'bg-white/5 text-white/45 border border-white/10 hover:text-white hover:bg-white/10 font-bungee'
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
              className="liquid-glass-dark border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-6 flex flex-col xl:flex-row xl:items-center gap-5 md:gap-6 group"
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
                <h3 className="text-xl md:text-2xl font-bungee font-black uppercase italic text-white leading-tight break-words">{trip.title}</h3>
                <div className="flex flex-wrap items-center gap-4 text-white/45 text-[10px] font-black uppercase tracking-[0.16em]">
                  <span className="flex items-center gap-2"><MapPin size={13} className="text-secondary" /> {trip.location}</span>
                  <span className="flex items-center gap-2"><Calendar size={13} className="text-secondary" /> {trip.nextBatch || 'Batch TBA'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4 xl:w-[260px]">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.18em] block mb-2">Rate</span>
                  <span className="text-xl font-sans font-black text-secondary tracking-tighter">₹{trip.price}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.18em] block mb-2">Duration</span>
                  <span className="text-sm font-black text-white">{trip.duration}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 xl:ml-auto xl:flex xl:items-center">
                <Link
                  to={`/trip/${trip.id}`}
                  className="h-12 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/20 hover:border-white/30 transition-all flex items-center justify-center xl:px-5"
                  title="Preview trip"
                >
                  <BarChart3 size={17} />
                </Link>
                <Link
                  to={`/admin/edit/${trip.id}`}
                  className="h-12 rounded-2xl bg-secondary text-white hover:bg-secondary/80 transition-all flex items-center justify-center xl:px-5"
                  title="Edit trip"
                >
                  <Edit2 size={17} />
                </Link>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="h-12 rounded-2xl bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center xl:px-5"
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
              <h3 className="text-2xl font-bungee font-black uppercase italic tracking-tighter text-white/50">No packages found</h3>
              <p className="text-white/35 text-sm font-medium italic mt-2">Try another search or add a fresh expedition.</p>
            </div>
          )}
        </section>
        </>
        ) : (
          <div className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-12 text-center">
            <Shield className="mx-auto text-white/20 mb-5" size={44} />
            <h3 className="text-2xl font-bungee font-black uppercase italic tracking-tighter text-white/50">Welcome to Admin Dashboard</h3>
            <p className="text-white/35 text-sm font-medium italic mt-2 mb-6">
              You don't have permission to manage trips. Use the navigation menu to access features available to you.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {visibleNavItems.slice(0, 4).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] hover:bg-secondary hover:text-white transition-all"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
    </PermissionGuard>
  )
}

export default AdminDashboard
