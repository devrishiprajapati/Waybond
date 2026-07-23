import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
    // Prototype user auth
    haptics.success()
    localStorage.setItem('user', JSON.stringify({ email, name: email.split('@')[0] }))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-start justify-center px-6 pb-10 pt-36 md:pt-44 relative overflow-hidden">
      {/* Immersive Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=2000" 
          alt="Travel Background" 
          className="w-full h-full object-cover opacity-20 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/80 via-charcoal/60 to-charcoal"></div>
      </div>

      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[180px] -translate-y-1/2 translate-x-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[180px] translate-y-1/2 -translate-x-1/2 z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Mode Switcher Tabs */}
        <div className="flex justify-center mb-4">
          <div className="liquid-glass-dark p-1 rounded-full border border-white/10 flex gap-1">
            <button 
              onClick={() => {
                haptics.light();
                setMode('user');
              }}
              className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${mode === 'user' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-white/40 hover:text-white'}`}
            >
              <Compass size={12} /> Explorer
            </button>
            <button 
              onClick={() => {
                haptics.light();
                setMode('admin');
              }}
              className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${mode === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              <Shield size={12} /> Admin
            </button>
          </div>
        </div>

        <div className="liquid-glass-dark p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-3xl">
          <div className="text-center mb-8">
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
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
                  : (isLogin ? 'Sign in to your curated expeditions' : 'Ahmedabad\'s premier travel collective')}
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'user' && !isLogin && (
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] ml-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="text" 
                    placeholder="Your Name"
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white focus:border-secondary outline-none transition-all placeholder:text-white/10 text-sm"
                  />
                </div>
              </div>
            )}

            {mode === 'user' && (
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-white/40 tracking-[0.2em] ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white focus:border-secondary outline-none transition-all placeholder:text-white/10 text-sm"
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
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none transition-all placeholder:text-white/10 text-sm ${mode === 'admin' ? 'focus:border-primary' : 'focus:border-secondary'}`}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center group hover:scale-[1.02] active:scale-[0.98] ${mode === 'admin' ? 'bg-primary shadow-primary/20' : 'bg-secondary shadow-secondary/20'} text-white`}
            >
              {mode === 'admin' ? 'Authorize' : (isLogin ? 'Sign In' : 'Join')} 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={14} />
            </button>
          </form>

          {mode === 'user' && (
            <>
              <div className="mt-8 text-center">
                <p className="text-white/40 text-[8px] font-black uppercase tracking-[0.2em] mb-4">Or continue with</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => haptics.light()}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all hover:scale-110"
                  >
                    <Chrome size={18} />
                  </button>
                  <button 
                    onClick={() => haptics.light()}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all hover:scale-110"
                  >
                    <Github size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <button 
                  onClick={() => {
                    haptics.light();
                    setIsLogin(!isLogin);
                  }}
                  className="text-white/60 hover:text-secondary text-[9px] font-black uppercase tracking-[0.2em] transition-colors"
                >
                  {isLogin ? "Join the community" : "Already a member?"}
                </button>
              </div>
            </>
          )}

          {mode === 'admin' && (
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
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
