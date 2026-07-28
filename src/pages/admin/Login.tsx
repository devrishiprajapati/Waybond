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
    if (password === 'admin123') {
      sessionStorage.setItem('isAdmin', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('Invalid expedition credentials')
    }
  }

  return (
    /* iOS fixes: min-h-[100dvh], no overflow-hidden, background via fixed layer */
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 relative">

      {/* Background Decor — fixed so it doesn't scroll, pointer-events-none so it can't intercept touches */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 90% 10%, rgba(13,115,119,0.20) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 55% 45% at 10% 90%, rgba(100,149,237,0.10) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/*
         * Card: inline backdrop-filter so we can control the exact blur level.
         * 16px blur is the sweet spot — looks great, stays performant on iOS.
         */}
        <div
          className="p-6 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-xl bg-white"
        >
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6">
              <Lock className="text-primary" size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-800 uppercase italic tracking-tighter">
              Admin <span className="text-primary">Basecamp</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-2 italic">Secure access for WayBond organizers</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Access Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter credentials..."
                autoComplete="current-password"
                /* text-base (16px) prevents iOS Safari/Chrome auto-zoom on focus */
                className="w-full bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl text-slate-800 focus:border-primary outline-none transition-colors placeholder:text-slate-400 text-base"
                required
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
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/20 transition-all flex items-center justify-center active:scale-95 touch-manipulation"
            >
              Authorize Access <ArrowRight className="ml-2 transition-transform" size={16} />
            </button>
          </form>

          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center space-x-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>Encrypted Connection</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
