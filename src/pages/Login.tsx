import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Github, Chrome, Shield, Compass } from 'lucide-react'
import { haptics } from '../lib/haptics'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [mode, setMode] = useState<'user' | 'admin'>('user')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'admin') {
      if (password === 'admin123') {
        haptics.success()
        sessionStorage.setItem('isAdmin', 'true')
        navigate('/admin/dashboard')
      } else {
        haptics.error()
        alert('Invalid Admin Credentials')
      }
      return
    }
    haptics.success()
    localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }))
    navigate('/dashboard')
  }

  return (
    /*
     * iOS fixes:
     * - min-h-[100dvh] accounts for safari's collapsible address bar
     * - NO overflow-hidden: kills fixed positioning & clips form when keyboard opens
     * - bg-charcoal solid ensures no flash while image loads
     * - pb-safe uses safe-area-inset-bottom for home indicator
     */
    <div className="min-h-[100dvh] bg-charcoal flex flex-col items-center justify-start px-5 pt-28 pb-10 relative">

      {/* Background Image — pointer-events-none prevents touch interception */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=1200"
          alt=""
          className="w-full h-full object-cover opacity-15"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/85 via-charcoal/70 to-charcoal" />
      </div>

      {/*
       * Background accents: replaced giant blur-[180px] circles with a simple
       * radial gradient — far cheaper to composite on mobile GPUs.
       */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 90% 10%, rgba(13,115,119,0.18) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 50% at 10% 90%, rgba(100,149,237,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Card wrapper — scrollable on iOS via -webkit-overflow-scrolling */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Explorer / Admin mode tabs */}
        <div className="flex justify-center mb-4">
          <div
            className="p-1 rounded-full flex gap-1 border border-white/10"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <button
              type="button"
              onClick={() => { haptics.light(); setMode('user'); }}
              className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === 'user' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-white/40'
                }`}
            >
              <Compass size={12} /> Explorer
            </button>
            <button
              type="button"
              onClick={() => { haptics.light(); setMode('admin'); }}
              className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40'
                }`}
            >
              <Shield size={12} /> Admin
            </button>
          </div>
        </div>

        {/*
         * Card: backdrop-blur reduced from blur-3xl (64px) → 16px.
         * On iOS, >20px blurs inside nested stacking contexts cause GPU overload.
         * We keep the glass aesthetic while being mobile-performant.
         */}
        <div
          className="p-7 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
        >
          <div className="text-center mb-7">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl md:text-4xl font-display font-black text-white uppercase italic tracking-tighter liquid-text mb-2">
                {mode === 'admin' ? (
                  <>Admin <span className="text-primary">Basecamp</span></>
                ) : (
                  <>{isLogin ? 'Welcome' : 'Join the'} <span className="text-secondary">Community</span></>
                )}
              </h1>
              <p className="text-white/40 font-medium text-xs italic tracking-wide">
                {mode === 'admin'
                  ? 'Authorized access for organizers'
                  : (isLogin ? 'Sign in to your curated expeditions' : "Ahmedabad's premier travel collective")}
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'user' && !isLogin && (
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] ml-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
                  <input
                    type="text"
                    placeholder="Your Name"
                    autoComplete="name"
                    /* text-base (16px) prevents iOS auto-zoom on focus */
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white focus:border-secondary outline-none transition-colors placeholder:text-white/20 text-base"
                  />
                </div>
              </div>
            )}

            {mode === 'user' && (
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    autoComplete="email"
                    inputMode="email"
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white focus:border-secondary outline-none transition-colors placeholder:text-white/20 text-base"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] ml-4">
                {mode === 'admin' ? 'Access Key' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={`w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none transition-colors placeholder:text-white/20 text-base ${mode === 'admin' ? 'focus:border-primary' : 'focus:border-secondary'
                    }`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center active:scale-95 touch-manipulation ${mode === 'admin' ? 'bg-primary shadow-primary/20' : 'bg-secondary shadow-secondary/20'
                } text-white`}
            >
              {mode === 'admin' ? 'Authorize' : (isLogin ? 'Sign In' : 'Join')}
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={14} />
            </button>
          </form>

          {mode === 'user' && (
            <>
              <div className="mt-7 text-center">
                <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em] mb-4">Or continue with</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => haptics.light()}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white transition-colors active:bg-white/20 touch-manipulation"
                  >
                    <Chrome size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => haptics.light()}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white transition-colors active:bg-white/20 touch-manipulation"
                  >
                    <Github size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-white/5 text-center">
                <button
                  type="button"
                  onClick={() => { haptics.light(); setIsLogin(!isLogin); }}
                  className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] transition-colors active:text-secondary touch-manipulation"
                >
                  {isLogin ? 'Join the community' : 'Already a member?'}
                </button>
              </div>
            </>
          )}

          {mode === 'admin' && (
            <div className="mt-7 pt-5 border-t border-white/5 text-center">
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                <Shield size={10} /> SECURE BASECAMP
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default Login
