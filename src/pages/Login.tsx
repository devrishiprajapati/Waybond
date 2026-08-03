import React, { useState } from 'react'
import { useNavigate, Link, Navigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Github, Chrome, Shield, Compass, Eye, EyeOff } from 'lucide-react'
import { haptics } from '../lib/haptics'
import { registerUser } from '../lib/adminStorage'
import { getUser } from '../lib/auth'

const Login = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [mode, setMode] = useState<'user' | 'admin'>('user')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'
  const existingUser = getUser()

  if (existingUser) {
    return <Navigate to={sessionStorage.getItem('isAdmin') === 'true' ? '/admin/dashboard' : redirectTo} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      if (resetMode) {
        if (!otpSent) {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })
          const data = await response.json().catch(() => ({}))
          if (!response.ok) throw new Error(data.message || 'Unable to send the OTP.')
          setOtpSent(true)
          setMessage(data.message || 'OTP sent. Check your email.')
          return
        }
        if (newPassword !== confirmNewPassword) throw new Error('Passwords do not match.')
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, password: newPassword })
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Unable to reset password.')
        setResetMode(false)
        setOtpSent(false)
        setOtp('')
        setPassword('')
        setNewPassword('')
        setConfirmNewPassword('')
        setMessage(data.message || 'Password updated. You can now sign in.')
        return
      }
      const endpoint = mode === 'admin' ? '/api/auth/admin/login' : isLogin ? '/api/auth/login' : '/api/auth/signup'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const responseText = await response.text()
      let data: { user?: { id?: string; name: string; email: string; [key: string]: unknown }; message?: string } = {}
      try { data = responseText ? JSON.parse(responseText) : {} } catch { /* Non-JSON server responses are handled below. */ }
      if (!response.ok && !data.message) throw new Error(`Authentication service returned ${response.status}. Restart the backend and try again.`)
      if (!response.ok) throw new Error(data.message || 'Unable to continue.')
      if (!data.user) throw new Error('Authentication service returned an incomplete response. Restart the backend and try again.')
      haptics.success()
      if (mode === 'admin') {
        sessionStorage.setItem('isAdmin', 'true')
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate('/admin/dashboard')
      } else {
        const registeredUser = registerUser(data.user)
        localStorage.setItem('user', JSON.stringify({ ...data.user, name: registeredUser.name }))
        navigate(redirectTo)
      }
    } catch (requestError) {
      haptics.error()
      setError(requestError instanceof Error ? requestError.message : 'Unable to connect to the server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    /*
     * iOS fixes:
     * - min-h-[100dvh] accounts for safari's collapsible address bar
     * - NO overflow-hidden: kills fixed positioning & clips form when keyboard opens
     * - bg-white solid ensures no flash while image loads
     * - pb-safe uses safe-area-inset-bottom for home indicator
     */
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-start px-4 sm:px-5 pt-24 sm:pt-28 pb-8 sm:pb-10 relative">

      {/* Background accents only - removed image */}
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
            className="p-1 rounded-full flex gap-1 border border-slate-200 shadow-sm bg-white"
          >
            <button
              type="button"
              onClick={() => { haptics.light(); setMode('user'); }}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === 'user' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-slate-500'
                }`}
            >
              <Compass size={12} /> Explorer
            </button>
            <button
              type="button"
              onClick={() => { haptics.light(); setMode('admin'); }}
              className={`px-4 sm:px-6 py-2.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${mode === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'
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
          className="p-5 sm:p-7 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-xl bg-white"
        >
          <div className="text-center mb-7">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-800 uppercase italic tracking-tighter mb-2">
                {mode === 'admin' ? (
                  <>Admin <span className="text-primary">Basecamp</span></>
                ) : resetMode ? (
                  <>Reset <span className="text-secondary">Password</span></>
                ) : (
                  <>{isLogin ? 'Welcome' : 'Join the'} <span className="text-secondary">Community</span></>
                )}
              </h1>
              <p className="text-slate-500 font-medium text-xs italic tracking-wide">
                {mode === 'admin'
                  ? 'Authorized access for organizers'
                  : resetMode
                    ? (otpSent ? 'Enter the OTP from your email and choose a new password' : 'We will send a secure OTP to your email')
                  : (isLogin ? 'Sign in to your curated expeditions' : "Ahmedabad's premier travel collective")}
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'user' && !isLogin && (
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Full Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <input
                    type="text"
                    placeholder="Your Name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    /* text-base (16px) prevents iOS auto-zoom on focus */
                    className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base"
                  />
                </div>
              </div>
            )}

            {mode === 'user' && (
              <div className="space-y-1">
                <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@example.com"
                    autoComplete="email"
                    inputMode="email"
                    className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base"
                    required
                  />
                </div>
              </div>
            )}

            {!resetMode && <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">
                {mode === 'admin' ? 'Access Key' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  className={`w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 outline-none transition-colors placeholder:text-slate-400 text-base ${mode === 'admin' ? 'focus:border-primary' : 'focus:border-secondary'
                    }`}
                  required
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-secondary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>}

            {mode === 'user' && resetMode && otpSent && (
              <>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Email OTP</label>
                  <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="6-digit OTP" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base tracking-[0.3em]" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">New Password</label>
                  <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 6 characters" autoComplete="new-password" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Confirm New Password</label>
                  <input type="password" value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} placeholder="Repeat new password" autoComplete="new-password" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base" required />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center active:scale-95 touch-manipulation ${mode === 'admin' ? 'bg-primary shadow-primary/20' : 'bg-secondary shadow-secondary/20'
                } text-white`}
            >
              {submitting ? 'Please wait' : resetMode ? (otpSent ? 'Reset Password' : 'Send OTP') : mode === 'admin' ? 'Authorize' : (isLogin ? 'Sign In' : 'Join')}
              <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={14} />
            </button>
            {error && <p className="text-center text-xs font-bold text-red-500">{error}</p>}
            {message && <p className="text-center text-xs font-bold text-emerald-600">{message}</p>}
          </form>

          {mode === 'user' && isLogin && (
            <div className="mt-4 text-center">
              <button type="button" onClick={() => { setResetMode((current) => !current); setOtpSent(false); setError(''); setMessage('') }} className="text-secondary text-[9px] font-black uppercase tracking-[0.2em] hover:text-secondary/80">
                {resetMode ? 'Back to sign in' : 'Forgot password?'}
              </button>
            </div>
          )}

          {mode === 'user' && (
            <>
              {/* <div className="mt-7 text-center">
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.2em] mb-4">Or continue with</p>
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => haptics.light()}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition-colors active:bg-slate-100 touch-manipulation"
                  >
                    <Chrome size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => haptics.light()}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 transition-colors active:bg-slate-100 touch-manipulation"
                  >
                    <Github size={18} />
                  </button>
                </div>
              </div> */}

              <div className="mt-7 pt-5 border-t border-slate-100 text-center">
                <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
                  {isLogin ? 'Need an account?' : 'Already a member?'}
                </p>
                <Link
                  to="/signup"
                  className="text-secondary text-[9px] font-black uppercase tracking-[0.2em] border-b border-secondary pb-0.5 transition-colors hover:text-secondary/80 touch-manipulation"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Link>
              </div>
            </>
          )}

          {mode === 'admin' && (
            <div className="mt-7 pt-5 border-t border-slate-100 text-center">
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
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
