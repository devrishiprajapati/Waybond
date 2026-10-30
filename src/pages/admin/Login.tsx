import React, { useState, useEffect } from 'react'
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { getAdmin, setAdmin } from '../../lib/adminAuth'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const errorParam = searchParams.get('error')

  // Show error message if redirected from session expiry
  useEffect(() => {
    if (errorParam === 'session_expired') {
      setError('Your session has expired. Please log in again.')
    } else if (errorParam === 'admin_not_found') {
      setError('Your admin account was not found. It may have been deleted or deactivated.')
    }
  }, [errorParam])

  const admin = getAdmin()
  if (admin) {
    // Check where to redirect based on permissions
    const hasDashboardAccess = admin.role === 'MASTER_ADMIN' || 
      (admin.permissions && admin.permissions.includes('manage_trips'))
    
    if (!hasDashboardAccess) {
      // Find first available page
      const availablePages = [
        { path: '/admin/data-filters', permission: 'view_data_filters' },
        { path: '/admin/analytics', permission: 'view_analytics' },
        { path: '/admin/payment-update', permission: 'view_bookings' }
      ]
      
      for (const page of availablePages) {
        if (admin.permissions && admin.permissions.includes(page.permission)) {
          return <Navigate to={page.path} replace />
        }
      }
    }
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to authorize')
      
      // Store admin data using the new auth library
      setAdmin(data.admin)
      
      // Redirect based on permissions
      // All admins go to dashboard - sidebar will show only accessible pages
      navigate('/admin/dashboard')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Invalid expedition credentials')
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
            <h1 className="text-2xl sm:text-3xl font-bungee font-black text-slate-800 uppercase italic tracking-tighter">
              Admin <span className="text-primary">Basecamp</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-2 italic">Secure access for WayBond organizers</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email..."
                autoComplete="email"
                /* text-base (16px) prevents iOS Safari/Chrome auto-zoom on focus */
                className="w-full bg-slate-50 border border-slate-200 p-4 sm:p-5 rounded-2xl text-slate-800 focus:border-primary outline-none transition-colors placeholder:text-slate-400 text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  autoComplete="current-password"
                  /* text-base (16px) prevents iOS Safari/Chrome auto-zoom on focus */
                  className="w-full bg-slate-50 border border-slate-200 p-4 sm:p-5 pr-12 rounded-2xl text-slate-800 focus:border-primary outline-none transition-colors placeholder:text-slate-400 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
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
