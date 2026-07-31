import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Github, Chrome, Compass, Phone, MapPin, AlertCircle, Upload, Droplet } from 'lucide-react'
import { haptics } from '../lib/haptics'

const SignUp = () => {
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [governmentID, setGovernmentID] = useState<File | null>(null)
  const [medicalInfo, setMedicalInfo] = useState('')
  const [bloodGroup, setBloodGroup] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required')
      haptics.error()
      return
    }
    if (!dateOfBirth) {
      setError('Date of birth is required')
      haptics.error()
      return
    }
    if (!gender) {
      setError('Gender is required')
      haptics.error()
      return
    }
    if (!mobileNumber.trim() || mobileNumber.length < 10) {
      setError('Valid mobile number is required (min 10 digits)')
      haptics.error()
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      haptics.error()
      return
    }
    if (!address.trim()) {
      setError('Address is required')
      haptics.error()
      return
    }
    if (!emergencyContact.trim()) {
      setError('Emergency contact is required')
      haptics.error()
      return
    }
    if (!governmentID) {
      setError('Government ID upload is required')
      haptics.error()
      return
    }
    if (!bloodGroup) {
      setError('Blood group is required')
      haptics.error()
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      haptics.error()
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      haptics.error()
      return
    }
    if (!termsAccepted) {
      setError('You must accept the Terms & Conditions')
      haptics.error()
      return
    }

    haptics.success()
    localStorage.setItem('user', JSON.stringify({
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
      address,
      emergencyContact,
      medicalInfo,
      bloodGroup,
      name: fullName
    }))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col items-center justify-start px-4 sm:px-5 pt-24 sm:pt-28 pb-8 sm:pb-10 relative">

      {/* Background accents only - no image */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 90% 10%, rgba(13,115,119,0.18) 0%, transparent 70%), ' +
            'radial-gradient(ellipse 60% 50% at 10% 90%, rgba(100,149,237,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Sign Up Card */}
        <div className="p-5 sm:p-7 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 shadow-xl bg-white">
          <div className="text-center mb-7">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-slate-800 uppercase italic tracking-tighter mb-2">
                Join the <span className="text-secondary">Community</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs italic tracking-wide">
                Ahmedabad's premier travel collective
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl sticky top-0 z-50">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em]">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Full Name *</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  autoComplete="name"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base"
                  required
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Date of Birth *</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 px-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors text-base"
                required
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors text-base"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer Not to Say</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Mobile Number *</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Email Address *</label>
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

            {/* Address */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Address *</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-5 text-slate-400 pointer-events-none" size={16} />
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, Postal Code"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base resize-none"
                  rows={2}
                  required
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Emergency Contact *</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Emergency Contact Number"
                  inputMode="tel"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base"
                  required
                />
              </div>
            </div>

            {/* Government ID Upload */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Government ID Upload *</label>
              <div className="relative">
                <Upload className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="file"
                  onChange={(e) => setGovernmentID(e.target.files?.[0] || null)}
                  placeholder="Upload ID (PDF, JPG, PNG)"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base file:bg-secondary file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:text-xs file:font-bold file:mr-2"
                  required
                />
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Medical Information</label>
              <textarea
                value={medicalInfo}
                onChange={(e) => setMedicalInfo(e.target.value)}
                placeholder="Any allergies, medications, medical conditions..."
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base resize-none"
                rows={2}
              />
            </div>

            {/* Blood Group */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Blood Group *</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors text-base"
                required
              >
                <option value="">Select Blood Group</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Password *</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base"
                  required
                />
              </div>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="space-y-2 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-slate-300 text-secondary focus:ring-secondary cursor-pointer"
                  required
                />
                <span className="text-slate-600 text-[8px] font-black uppercase tracking-[0.2em] leading-snug">
                  I accept the <Link to="/terms" className="text-secondary border-b border-secondary hover:text-secondary/80">Terms & Conditions</Link> and <Link to="/privacy" className="text-secondary border-b border-secondary hover:text-secondary/80">Privacy Policy</Link> *
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center active:scale-95 touch-manipulation bg-secondary shadow-secondary/20 text-white sticky bottom-0"
            >
              Create Account
              <ArrowRight className="ml-2 transition-transform" size={14} />
            </button>
          </form>

          {/* Social Sign Up */}
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

          {/* Sign In Link */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] mb-2">
              Already a member?
            </p>
            <Link
              to="/login"
              className="text-secondary text-[9px] font-black uppercase tracking-[0.2em] border-b border-secondary pb-0.5 transition-colors hover:text-secondary/80 touch-manipulation"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default SignUp
