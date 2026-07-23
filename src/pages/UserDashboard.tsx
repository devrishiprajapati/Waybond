import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Heart, Package, LogOut, User, Compass, Star, Shield } from 'lucide-react'

const UserDashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate('/login')
    } else {
      setUser(JSON.parse(savedUser))
      // Check if user has admin privileges (prototype check)
      setIsAdmin(sessionStorage.getItem('isAdmin') === 'true')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('user')
    sessionStorage.removeItem('isAdmin')
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-4">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Welcome back, explorer</span>
            <h1 className="text-5xl md:text-7xl font-display font-black text-charcoal tracking-tighter uppercase italic leading-none">
              {user.name}'s <span className="text-primary">Basecamp</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            {isAdmin && (
              <Link 
                to="/admin/dashboard"
                className="flex items-center space-x-2 bg-charcoal text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary transition-all"
              >
                <Shield size={14} className="text-secondary" />
                <span>Admin Panel</span>
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Expeditions', value: '02', icon: Compass, color: 'bg-primary' },
                { label: 'Wishlist', value: '12', icon: Heart, color: 'bg-secondary' },
                { label: 'Community XP', value: '850', icon: Star, color: 'bg-accent' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-charcoal p-8 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center space-x-6"
                >
                  <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-display font-black text-charcoal">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Upcoming Trips */}
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-black text-charcoal uppercase italic tracking-tight flex items-center">
                <Calendar className="mr-3 text-primary" /> Upcoming Expeditions
              </h2>
              <div className="bg-charcoal p-10 rounded-[4rem] shadow-xl shadow-gray-200/50 border border-gray-100 text-center space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                   <Package className="text-gray-300" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-charcoal">No Active Bookings</h3>
                  <p className="text-gray-400 text-sm mt-2 font-medium italic">Your next great story is waiting to be written.</p>
                </div>
                <button 
                  onClick={() => navigate('/discover')}
                  className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                >
                  Explore Packages
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-10">
            {/* Profile Card */}
            <div className="bg-charcoal p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative z-10 space-y-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary to-secondary p-1">
                  <div className="w-full h-full rounded-[2.2rem] bg-charcoal flex items-center justify-center">
                    <User size={40} className="text-white/20" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-display font-black tracking-tight">{user.name}</h3>
                  <p className="text-white/40 text-xs font-medium italic mt-1">{user.email}</p>
                </div>
                <button className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-charcoal transition-all">
                  Edit Explorer Profile
                </button>
              </div>
            </div>

            {/* Community Feed Preview */}
            <div className="bg-charcoal p-8 rounded-[3.5rem] shadow-xl border border-gray-100 space-y-6">
              <h3 className="text-lg font-black text-charcoal uppercase tracking-tight italic">Community Feed</h3>
              <div className="space-y-6">
                {[1, 2].map((_, i) => (
                  <div key={i} className="flex space-x-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 shrink-0 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-charcoal group-hover:text-primary transition-colors">Shared a new memory from Spiti</p>
                      <p className="text-[10px] text-gray-400 font-medium">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
