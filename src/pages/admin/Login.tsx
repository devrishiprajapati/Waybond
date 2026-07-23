import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react'

const AdminLogin = () => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple prototype auth
    if (password === 'admin123') {
      sessionStorage.setItem('isAdmin', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('Invalid expedition credentials')
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6">
            <Lock className="text-primary" size={32} />
          </div>
          <h1 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter">
            Admin <span className="text-primary">Basecamp</span>
          </h1>
          <p className="text-gray-400 font-medium text-sm mt-2 italic">Secure access for Infi Yatra organizers</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black text-white/40 tracking-[0.2em] ml-4">Access Key</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter credentials..."
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white focus:border-primary outline-none transition-all placeholder:text-white/20"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs font-bold text-center italic"
            >
              {error}
            </motion.p>
          )}

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center group"
          >
            Authorize Access <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <div className="flex items-center justify-center space-x-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} />
            <span>Encrypted Connection</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
