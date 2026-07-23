import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, LayoutDashboard, LogOut, Package, MapPin, Image as ImageIcon } from 'lucide-react'
import { getTrips, deleteTrip } from '../../lib/dataService'
import { Trip } from '../../lib/trips'

const AdminDashboard = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
    }
    getTrips().then(setTrips)
  }, [navigate])

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this expedition?')) {
      await deleteTrip(id)
      getTrips().then(setTrips)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-charcoal text-white p-8 hidden lg:flex flex-col">
        <div className="mb-12">
          <h1 className="text-2xl font-display font-black uppercase italic tracking-tighter">
            Infi <span className="text-primary">Admin</span>
          </h1>
        </div>
        
        <nav className="flex-grow space-y-4">
          <Link to="/admin/dashboard" className={`flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all ${location.pathname === '/admin/dashboard' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={20} />
            <span>Package Inventory</span>
          </Link>
          <Link to="/admin/hero" className={`flex items-center space-x-3 p-4 rounded-2xl font-bold transition-all ${location.pathname === '/admin/hero' ? 'bg-primary text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <ImageIcon size={20} />
            <span>Homepage Hero</span>
          </Link>
          <Link to="/admin/new" className="flex items-center space-x-3 p-4 text-white/60 hover:text-white hover:bg-white/5 transition-all font-bold">
            <Plus size={20} />
            <span>New Package</span>
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 p-4 text-red-400 hover:text-red-300 transition-all font-bold mt-auto"
        >
          <LogOut size={20} />
          <span>Exit Basecamp</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-display font-black text-charcoal tracking-tighter uppercase italic">Inventory</h2>
            <p className="text-gray-400 font-medium italic mt-1">Manage active expeditions and packages</p>
          </div>
          <Link 
            to="/admin/new"
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add Expedition
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {trips.map((trip) => (
            <motion.div 
              key={trip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-charcoal p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col md:flex-row items-center gap-8 group"
            >
              <div className="w-32 h-32 rounded-3xl overflow-hidden shrink-0">
                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              
              <div className="flex-grow space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${trip.type === 'International' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    {trip.type}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 text-gray-500 rounded-full">
                    {trip.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-charcoal">{trip.title}</h3>
                <div className="flex items-center justify-center md:justify-start text-gray-400 text-xs font-medium">
                  <MapPin size={12} className="mr-1" /> {trip.location}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 px-8 border-x border-gray-50 hidden md:grid text-center">
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Rates From</span>
                  <span className="text-lg font-black text-secondary tracking-tighter italic">₹{trip.price}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Duration</span>
                  <span className="text-lg font-black text-charcoal tracking-tighter italic">{trip.duration}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link 
                  to={`/admin/edit/${trip.id}`}
                  className="p-4 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                >
                  <Edit2 size={18} />
                </Link>
                <button 
                  onClick={() => handleDelete(trip.id)}
                  className="p-4 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-2xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
