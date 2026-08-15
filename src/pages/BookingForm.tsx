import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Check, Calendar } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { getTripById } from '../lib/dataService'
import { haptics } from '../lib/haptics'

interface TravellerInfo {
  name: string
  age: string
  gender: string
  phone: string
  emergencyContact: string
  email: string
  dateOfBirth: string
  state: string
  city: string
}

const BookingForm = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tripId = searchParams.get('tripId')
  const departure = searchParams.get('departure')

  const [trip, setTrip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [numTravellers, setNumTravellers] = useState(1)
  const [travellers, setTravellers] = useState<TravellerInfo[]>([{
    name: '', age: '', gender: 'Male', phone: '', emergencyContact: '', email: '', dateOfBirth: '', state: '', city: ''
  }])
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (tripId) {
      getTripById(parseInt(tripId)).then(t => {
        setTrip(t || null)
        setLoading(false)
      })
    }
  }, [tripId])

  const handleTravellerCountChange = (count: number) => {
    setNumTravellers(count)
    haptics.light()

    const newTravellers = [...travellers]
    if (count > travellers.length) {
      for (let i = travellers.length; i < count; i++) {
        newTravellers.push({
          name: '', age: '', gender: 'Male', phone: '', emergencyContact: '', email: '', dateOfBirth: '', state: '', city: ''
        })
      }
    } else {
      newTravellers.splice(count)
    }
    setTravellers(newTravellers)
  }

  const handleTravellerChange = (index: number, field: keyof TravellerInfo, value: string) => {
    const updated = [...travellers]
    updated[index][field] = value
    setTravellers(updated)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    travellers.forEach((traveller, idx) => {
      if (!traveller.name.trim()) newErrors[`name_${idx}`] = 'Name is required'
      if (!traveller.age.trim() || isNaN(Number(traveller.age)) || Number(traveller.age) < 1) {
        newErrors[`age_${idx}`] = 'Valid age is required'
      }
      if (!traveller.phone.trim() || !/^\d{10}$/.test(traveller.phone)) {
        newErrors[`phone_${idx}`] = 'Valid 10-digit phone number is required'
      }
      if (!traveller.emergencyContact.trim()) {
        newErrors[`emergencyContact_${idx}`] = 'Emergency contact number is required'
      } else if (!/^\d{10}$/.test(traveller.emergencyContact)) {
        newErrors[`emergencyContact_${idx}`] = 'Valid 10-digit emergency contact number is required'
      }
      if (!traveller.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(traveller.email)) {
        newErrors[`email_${idx}`] = 'Valid email is required'
      }
      if (!traveller.dateOfBirth.trim()) newErrors[`dob_${idx}`] = 'Date of birth is required'
      if (!traveller.state.trim()) newErrors[`state_${idx}`] = 'State is required'
      if (!traveller.city.trim()) newErrors[`city_${idx}`] = 'City is required'
    })

    if (!termsAccepted) newErrors.terms = 'You must accept the terms and conditions'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      haptics.error()
      return
    }

    setSubmitting(true)
    haptics.medium()

    try {
      // Send booking details email to host
      await fetch('/api/booking-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripTitle: trip?.title,
          tripLocation: trip?.location,
          tripDuration: trip?.duration,
          tripPrice: trip?.price,
          departureDate: departure,
          travellers,
          numTravellers
        })
      })

      // Navigate to confirmation page
      const bookingData = {
        tripId,
        trip,
        departure,
        travellers,
        numTravellers
      }
      navigate('/booking-confirmation', { state: bookingData })
    } catch (error) {
      console.error('Booking submission failed:', error)
      alert('Unable to process booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !trip) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>
  }

  return (
    <>
      <Helmet>
        <title>Booking Details - {trip.title} | WAYBOND</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 font-semibold mb-6 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back
          </button>

          <h1 className="text-3xl font-black text-gray-900 mb-8">Booking Details</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Number of Travellers */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center">
                <Users size={20} className="mr-2 text-secondary" />
                Number of Travellers
              </h2>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleTravellerCountChange(num)}
                    className={`w-12 h-12 rounded-full font-black text-lg transition-all ${numTravellers === num
                        ? 'bg-secondary text-white shadow-lg scale-110'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Traveller Details */}
            {travellers.map((traveller, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-black text-gray-900 mb-4">
                  • Traveller {idx + 1}
                </h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={traveller.name}
                      onChange={e => handleTravellerChange(idx, 'name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors[`name_${idx}`] ? 'border-red-400' : 'border-gray-300'
                        } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                    />
                    {errors[`name_${idx}`] && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors[`name_${idx}`]}</p>
                    )}
                  </div>

                  {/* Age & Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Age"
                        value={traveller.age}
                        onChange={e => handleTravellerChange(idx, 'age', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${errors[`age_${idx}`] ? 'border-red-400' : 'border-gray-300'
                          } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                      />
                      {errors[`age_${idx}`] && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors[`age_${idx}`]}</p>
                      )}
                    </div>
                    <select
                      value={traveller.gender}
                      onChange={e => handleTravellerChange(idx, 'gender', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Phone with country code */}
                  <div>
                    <div className="flex gap-2">
                      <div className="w-24 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center font-semibold text-gray-600">
                        +91
                      </div>
                      <input
                        type="tel"
                        placeholder="Mobile No."
                        value={traveller.phone}
                        onChange={e => handleTravellerChange(idx, 'phone', e.target.value)}
                        className={`flex-1 px-4 py-3 rounded-xl border ${errors[`phone_${idx}`] ? 'border-red-400' : 'border-gray-300'
                          } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                      />
                    </div>
                    {errors[`phone_${idx}`] && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors[`phone_${idx}`]}</p>
                    )}
                  </div>

                  {/* Emergency Contact with country code */}
                  <div>
                    <div className="flex gap-2">
                      <div className="w-24 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center font-semibold text-gray-600">
                        +91
                      </div>
                      <input
                        type="tel"
                        placeholder="Emergency Contact No."
                        value={traveller.emergencyContact}
                        onChange={e => handleTravellerChange(idx, 'emergencyContact', e.target.value)}
                        className={`flex-1 px-4 py-3 rounded-xl border ${errors[`emergencyContact_${idx}`] ? 'border-red-400' : 'border-gray-300'
                          } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                      />
                    </div>
                    {errors[`emergencyContact_${idx}`] && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors[`emergencyContact_${idx}`]}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={traveller.email}
                      onChange={e => handleTravellerChange(idx, 'email', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors[`email_${idx}`] ? 'border-red-400' : 'border-gray-300'
                        } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                    />
                    {errors[`email_${idx}`] && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors[`email_${idx}`]}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <input
                      type="date"
                      value={traveller.dateOfBirth}
                      onChange={e => handleTravellerChange(idx, 'dateOfBirth', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors[`dob_${idx}`] ? 'border-red-400' : 'border-gray-300'
                        } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                    />
                    {errors[`dob_${idx}`] && (
                      <p className="text-red-500 text-xs mt-1 ml-1">{errors[`dob_${idx}`]}</p>
                    )}
                  </div>

                  {/* State & City */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="State"
                        value={traveller.state}
                        onChange={e => handleTravellerChange(idx, 'state', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${errors[`state_${idx}`] ? 'border-red-400' : 'border-gray-300'
                          } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                      />
                      {errors[`state_${idx}`] && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors[`state_${idx}`]}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        value={traveller.city}
                        onChange={e => handleTravellerChange(idx, 'city', e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border ${errors[`city_${idx}`] ? 'border-red-400' : 'border-gray-300'
                          } focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-colors`}
                      />
                      {errors[`city_${idx}`] && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{errors[`city_${idx}`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Terms & Conditions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <label className="flex items-start cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => {
                      setTermsAccepted(e.target.checked)
                      haptics.light()
                    }}
                    className="w-6 h-6 rounded border-2 border-gray-300 text-secondary focus:ring-2 focus:ring-secondary/20 cursor-pointer accent-secondary"
                  />
                </div>
                <span className="ml-3 text-sm text-gray-700 leading-relaxed">
                  I accept waybond.com{' '}
                  <button
                    type="button"
                    onClick={() => window.open('/terms', '_blank')}
                    className="text-secondary underline hover:text-secondary/80 font-medium"
                  >
                    terms and conditions (Click Here)
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-2 ml-1">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-full font-black text-lg uppercase tracking-wide shadow-xl shadow-secondary/30 transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Save & Continue'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default BookingForm
