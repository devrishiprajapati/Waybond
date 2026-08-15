import React, { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, Compass, Phone, MapPin, AlertCircle, Upload, Droplet, Eye, EyeOff, Check, X } from 'lucide-react'
import { haptics } from '../lib/haptics'
import { getUser } from '../lib/auth'

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
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()
  const existingUser = getUser()

  if (existingUser) {
    return <Navigate to={sessionStorage.getItem('isAdmin') === 'true' ? '/admin/dashboard' : '/dashboard'} replace />
  }

  // Validation functions
  const validateFullName = (name: string): string => {
    if (!name.trim()) return 'Full name is required'
    if (name.trim().length < 3) return 'Name must be at least 3 characters'
    if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces'
    return ''
  }

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
    return ''
  }

  const validateMobileNumber = (number: string): string => {
    if (!number.trim()) return 'Mobile number is required'
    if (!/^\d{10}$/.test(number)) return 'Mobile number must be exactly 10 digits'
    return ''
  }

  const validateEmergencyContact = (number: string): string => {
    if (!number.trim()) return 'Emergency contact is required'
    if (!/^\d{10}$/.test(number)) return 'Emergency contact must be exactly 10 digits'
    return ''
  }

  const validateDateOfBirth = (dob: string): string => {
    if (!dob) return 'Date of birth is required'
    // Reject years that are not exactly 4 digits (e.g. 20000 or 200)
    const yearPart = dob.split('-')[0]
    if (!yearPart || yearPart.length !== 4) return 'Please enter a valid 4-digit year'
    const birthDate = new Date(dob)
    if (isNaN(birthDate.getTime())) return 'Please enter a valid date'
    const today = new Date()
    if (birthDate > today) return 'Date of birth cannot be in the future'
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    if (age < 18) return 'You must be at least 18 years old'
    return ''
  }

  const validatePassword = (pwd: string): string => {
    if (!pwd) return 'Password is required'
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least one number'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character'
    return ''
  }

  const validateConfirmPassword = (pwd: string, confirmPwd: string): string => {
    if (!confirmPwd) return 'Please confirm your password'
    if (pwd !== confirmPwd) return 'Passwords do not match'
    return ''
  }

  const validateAddress = (addr: string): string => {
    if (!addr.trim()) return 'Address is required'
    if (addr.trim().length < 10) return 'Please provide a complete address'
    return ''
  }

  // Handle field blur to mark as touched
  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
  }

  // Validate field and update errors
  const validateField = (fieldName: string, value: string) => {
    let error = ''
    switch (fieldName) {
      case 'fullName':
        error = validateFullName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'mobileNumber':
        error = validateMobileNumber(value)
        break
      case 'emergencyContact':
        error = validateEmergencyContact(value)
        break
      case 'dateOfBirth':
        error = validateDateOfBirth(value)
        break
      case 'password':
        error = validatePassword(value)
        break
      case 'confirmPassword':
        error = validateConfirmPassword(password, value)
        break
      case 'address':
        error = validateAddress(value)
        break
    }
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))
    return error
  }

  const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read the government ID file.'))
    reader.readAsDataURL(file)
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Mark all fields as touched
    setTouched({
      fullName: true,
      dateOfBirth: true,
      gender: true,
      mobileNumber: true,
      email: true,
      address: true,
      emergencyContact: true,
      bloodGroup: true,
      password: true,
      confirmPassword: true
    })

    // Validate all fields
    const errors: Record<string, string> = {}
    errors.fullName = validateFullName(fullName)
    errors.dateOfBirth = validateDateOfBirth(dateOfBirth)
    errors.email = validateEmail(email)
    errors.mobileNumber = validateMobileNumber(mobileNumber)
    errors.emergencyContact = validateEmergencyContact(emergencyContact)
    errors.address = validateAddress(address)
    errors.password = validatePassword(password)
    errors.confirmPassword = validateConfirmPassword(password, confirmPassword)

    if (!gender) errors.gender = 'Gender is required'
    if (!governmentID) errors.governmentID = 'Government ID upload is required'
    if (!bloodGroup) errors.bloodGroup = 'Blood group is required'
    if (!termsAccepted) errors.terms = 'You must accept the Terms & Conditions'

    setFieldErrors(errors)

    // Check if any errors exist
    const hasErrors = Object.values(errors).some((err) => err !== '')
    if (hasErrors) {
      const firstError = Object.values(errors).find((err) => err !== '')
      setError(firstError || 'Please fix all validation errors')
      haptics.error()
      return
    }

    setSubmitting(true)
    try {
      if (governmentID.size > 4 * 1024 * 1024) throw new Error('Government ID must be smaller than 4 MB.')
      const governmentIdData = await toDataUrl(governmentID)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, profile: { dateOfBirth, gender, mobileNumber, address, emergencyContact, medicalInfo, bloodGroup, governmentId: { name: governmentID.name, type: governmentID.type, data: governmentIdData } } })
      })
      const responseText = await response.text()
      let data: { user?: { id?: string; name: string; email: string;[key: string]: unknown }; message?: string } = {}
      try { data = responseText ? JSON.parse(responseText) : {} } catch { /* Non-JSON server responses are handled below. */ }
      if (!response.ok && !data.message) throw new Error(`Signup service returned ${response.status}. Restart the backend and try again.`)
      if (!response.ok) throw new Error(data.message || 'Unable to create account.')
      if (!data.user) throw new Error('Signup service returned an incomplete response. Restart the backend and try again.')
      haptics.success()
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (submitError) {
      haptics.error()
      setError(submitError instanceof Error ? submitError.message : 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bungee font-black text-slate-800 uppercase italic tracking-tighter mb-2">
                Join the <span className="text-secondary font-bungee ">Community</span>
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
                  onChange={(e) => {
                    setFullName(e.target.value)
                    if (touched.fullName) validateField('fullName', e.target.value)
                  }}
                  onBlur={() => {
                    handleBlur('fullName')
                    validateField('fullName', fullName)
                  }}
                  placeholder="Your Full Name"
                  autoComplete="name"
                  className={`w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base ${touched.fullName && fieldErrors.fullName
                    ? 'border-red-500 bg-red-50'
                    : touched.fullName && !fieldErrors.fullName && fullName
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200'
                    }`}
                  required
                />
                {touched.fullName && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {fieldErrors.fullName ? (
                      <X size={18} className="text-red-500" />
                    ) : fullName ? (
                      <Check size={18} className="text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.fullName && fieldErrors.fullName && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Date of Birth *</label>
              <input
                type="date"
                value={dateOfBirth}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const val = e.target.value
                  // Only commit value when the year part is exactly 4 digits
                  const year = val.split('-')[0]
                  if (year && year.length > 4) return
                  setDateOfBirth(val)
                  if (touched.dateOfBirth) validateField('dateOfBirth', val)
                }}
                onBlur={() => {
                  handleBlur('dateOfBirth')
                  validateField('dateOfBirth', dateOfBirth)
                }}
                className={`w-full bg-slate-50 border p-4 px-4 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors text-base ${touched.dateOfBirth && fieldErrors.dateOfBirth
                  ? 'border-red-500 bg-red-50'
                  : touched.dateOfBirth && !fieldErrors.dateOfBirth && dateOfBirth
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200'
                  }`}
                required
              />
              {touched.dateOfBirth && fieldErrors.dateOfBirth && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.dateOfBirth}</p>
              )}
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
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setMobileNumber(value)
                    if (touched.mobileNumber) validateField('mobileNumber', value)
                  }}
                  onBlur={() => {
                    handleBlur('mobileNumber')
                    validateField('mobileNumber', mobileNumber)
                  }}
                  placeholder="10 digit mobile number"
                  autoComplete="tel"
                  inputMode="numeric"
                  className={`w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base ${touched.mobileNumber && fieldErrors.mobileNumber
                    ? 'border-red-500 bg-red-50'
                    : touched.mobileNumber && !fieldErrors.mobileNumber && mobileNumber
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200'
                    }`}
                  required
                />
                {touched.mobileNumber && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {fieldErrors.mobileNumber ? (
                      <X size={18} className="text-red-500" />
                    ) : mobileNumber.length === 10 ? (
                      <Check size={18} className="text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.mobileNumber && fieldErrors.mobileNumber && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.mobileNumber}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (touched.email) validateField('email', e.target.value)
                  }}
                  onBlur={() => {
                    handleBlur('email')
                    validateField('email', email)
                  }}
                  placeholder="hello@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className={`w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base ${touched.email && fieldErrors.email
                    ? 'border-red-500 bg-red-50'
                    : touched.email && !fieldErrors.email && email
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200'
                    }`}
                  required
                />
                {touched.email && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {fieldErrors.email ? (
                      <X size={18} className="text-red-500" />
                    ) : email ? (
                      <Check size={18} className="text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.email && fieldErrors.email && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Address *</label>
              <div className="relative">
                <MapPin className="absolute left-5 top-5 text-slate-400 pointer-events-none" size={16} />
                <textarea
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    if (touched.address) validateField('address', e.target.value)
                  }}
                  onBlur={() => {
                    handleBlur('address')
                    validateField('address', address)
                  }}
                  placeholder="Street, City, State, Postal Code"
                  className={`w-full bg-slate-50 border p-4 pl-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base resize-none ${touched.address && fieldErrors.address
                    ? 'border-red-500 bg-red-50'
                    : touched.address && !fieldErrors.address && address
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200'
                    }`}
                  rows={2}
                  required
                />
              </div>
              {touched.address && fieldErrors.address && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.address}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Emergency Contact *</label>
              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type="tel"
                  value={emergencyContact}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setEmergencyContact(value)
                    if (touched.emergencyContact) validateField('emergencyContact', value)
                  }}
                  onBlur={() => {
                    handleBlur('emergencyContact')
                    validateField('emergencyContact', emergencyContact)
                  }}
                  placeholder="10 digit emergency contact"
                  inputMode="numeric"
                  className={`w-full bg-slate-50 border p-4 pl-12 pr-12 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base ${touched.emergencyContact && fieldErrors.emergencyContact
                    ? 'border-red-500 bg-red-50'
                    : touched.emergencyContact && !fieldErrors.emergencyContact && emergencyContact
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200'
                    }`}
                  required
                />
                {touched.emergencyContact && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {fieldErrors.emergencyContact ? (
                      <X size={18} className="text-red-500" />
                    ) : emergencyContact.length === 10 ? (
                      <Check size={18} className="text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {touched.emergencyContact && fieldErrors.emergencyContact && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.emergencyContact}</p>
              )}
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (touched.password) validateField('password', e.target.value)
                    if (touched.confirmPassword && confirmPassword) validateField('confirmPassword', confirmPassword)
                  }}
                  onBlur={() => {
                    handleBlur('password')
                    validateField('password', password)
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full bg-slate-50 border p-4 pl-12 pr-24 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base ${touched.password && fieldErrors.password
                    ? 'border-red-500 bg-red-50'
                    : touched.password && !fieldErrors.password && password
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200'
                    }`}
                  required
                />
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  {touched.password && (
                    fieldErrors.password ? (
                      <X size={18} className="text-red-500" />
                    ) : password ? (
                      <Check size={18} className="text-green-500" />
                    ) : null
                  )}
                </div>
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-secondary" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {touched.password && fieldErrors.password && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.password}</p>
              )}
              {touched.password && !fieldErrors.password && password && (
                <div className="ml-4 mt-2 space-y-1">
                  <p className="text-green-600 text-[7px] font-black uppercase tracking-[0.2em]">✓ Strong password</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-black text-slate-500 tracking-[0.2em] ml-4">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (touched.confirmPassword) validateField('confirmPassword', e.target.value)
                  }}
                  onBlur={() => {
                    handleBlur('confirmPassword')
                    validateField('confirmPassword', confirmPassword)
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full bg-slate-50 border p-4 pl-12 pr-24 rounded-2xl text-slate-800 focus:border-secondary outline-none transition-colors placeholder:text-slate-400 text-base ${touched.confirmPassword && fieldErrors.confirmPassword
                    ? 'border-red-500 bg-red-50'
                    : touched.confirmPassword && !fieldErrors.confirmPassword && confirmPassword
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-200'
                    }`}
                  required
                />
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  {touched.confirmPassword && (
                    fieldErrors.confirmPassword ? (
                      <X size={18} className="text-red-500" />
                    ) : confirmPassword && password === confirmPassword ? (
                      <Check size={18} className="text-green-500" />
                    ) : null
                  )}
                </div>
                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-secondary" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {touched.confirmPassword && fieldErrors.confirmPassword && (
                <p className="text-red-600 text-[8px] font-black uppercase tracking-[0.2em] ml-4 mt-1">{fieldErrors.confirmPassword}</p>
              )}
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
              disabled={submitting}
              className="w-full py-5 rounded-2xl font-sans font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center active:scale-95 touch-manipulation bg-secondary shadow-secondary/20 text-white sticky bottom-0"
            >
              {submitting ? 'Creating Account' : 'Create Account'}
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
