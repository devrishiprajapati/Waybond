import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  Smile,
  Calendar,
  Heart,
  Star
} from 'lucide-react'
import { haptics } from '../../lib/haptics'

interface UserData {
  fullName: string
  dateOfBirth: string
  gender: string
  mobileNumber: string
  email: string
  address: string
  emergencyContact: string
  medicalInfo: string
  bloodGroup: string
  name: string
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState<UserData | null>(null)
  const { userId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(savedUser)
    
    // Verify that the userId in URL matches the logged-in user
    if (!parsedUser.id || (userId && userId !== parsedUser.id)) {
      navigate('/login')
      return
    }

    setUser(parsedUser)
    setFormData(parsedUser)
  }, [navigate, userId])

  const handleInputChange = (field: keyof UserData, value: string) => {
    if (formData) {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handleSave = () => {
    if (!formData) return

    setError('')
    setSuccess('')

    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      haptics.error()
      return
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required')
      haptics.error()
      return
    }
    if (!formData.gender) {
      setError('Gender is required')
      haptics.error()
      return
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setError('Valid mobile number is required (min 10 digits)')
      haptics.error()
      return
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      haptics.error()
      return
    }
    if (!formData.address.trim()) {
      setError('Address is required')
      haptics.error()
      return
    }
    if (!formData.emergencyContact.trim()) {
      setError('Emergency contact is required')
      haptics.error()
      return
    }
    if (!formData.bloodGroup) {
      setError('Blood group is required')
      haptics.error()
      return
    }

    haptics.success()
    localStorage.setItem('user', JSON.stringify(formData))
    setUser(formData)
    setIsEditing(false)
    setSuccess('Profile updated successfully!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleCancel = () => {
    setFormData(user)
    setIsEditing(false)
    setError('')
  }

  if (!user || !formData) return null

  return (
    <div className="min-h-screen bg-white text-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-14">
          <button
            onClick={() => navigate(`/dashboard/${userId}`)}
            className="flex items-center gap-2 text-secondary hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest mb-6"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-4">
              <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Your Account</span>
              <h1 className="text-5xl md:text-6xl font-display font-black tracking-tighter uppercase italic leading-none liquid-text">
                Profile <span className="text-primary">Settings</span>
              </h1>
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  handleCancel()
                } else {
                  setIsEditing(true)
                }
              }}
              className={`h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] flex items-center gap-2 transition-all ${
                isEditing
                  ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  : 'bg-secondary text-white hover:bg-white hover:text-slate-800 shadow-lg shadow-secondary/20'
              }`}
            >
              {isEditing ? (
                <>
                  <X size={14} />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 size={14} />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-[9px] font-black uppercase tracking-[0.2em]">{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-[9px] font-black uppercase tracking-[0.2em]">{success}</p>
          </motion.div>
        )}

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-8 h-fit"
          >
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-100 border border-blue-200 flex items-center justify-center">
                  <User size={56} className="text-secondary/70" />
                </div>
              </div>

              {/* User Info */}
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-display font-black text-white">{user.fullName}</h2>
                <p className="text-white/45 text-xs font-medium italic">{user.email}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <Heart size={18} className="text-secondary mx-auto mb-2" />
                  <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.18em]">Wishlist</p>
                  <p className="text-xl font-black mt-1">12</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <Star size={18} className="text-secondary mx-auto mb-2" />
                  <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.18em]">XP</p>
                  <p className="text-xl font-black mt-1">850</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Personal Information */}
            <section className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <p className="text-secondary text-[9px] font-black uppercase tracking-[0.3em]">Personal Info</p>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter mt-2">Basic Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors placeholder:text-white/25"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors placeholder:text-white/25"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer Not to Say</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <p className="text-secondary text-[9px] font-black uppercase tracking-[0.3em]">Contact Info</p>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter mt-2">Phone & Address</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Mobile Number */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                    <input
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors placeholder:text-white/25"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Emergency Contact</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={16} />
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors placeholder:text-white/25"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-white/30 pointer-events-none" size={16} />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors placeholder:text-white/25 resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Medical Information */}
            <section className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-8 space-y-6">
              <div>
                <p className="text-secondary text-[9px] font-black uppercase tracking-[0.3em]">Health Info</p>
                <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter mt-2">Medical Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Blood Group */}
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors"
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

                {/* Medical Info */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/50 tracking-[0.2em]">Medical Information</label>
                  <textarea
                    value={formData.medicalInfo}
                    onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Any allergies, medications, medical conditions..."
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-secondary outline-none transition-colors placeholder:text-white/25 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <button
                  onClick={handleSave}
                  className="flex-1 bg-secondary text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 hover:bg-white hover:text-slate-800 transition-all"
                >
                  <Save size={14} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-white/10 text-white h-12 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] border border-white/20 flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                >
                  <X size={14} />
                  Cancel
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
