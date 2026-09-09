import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react'

type CancellationModalProps = {
  isOpen: boolean
  onClose: () => void
  booking: any
  userId: string
  onSuccess: () => void
}

const CancellationModal: React.FC<CancellationModalProps> = ({ isOpen, onClose, booking, userId, onSuccess }) => {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    cancellationReason: '',
    experience: '',
    feedback: ''
  })

  const reasons = [
    'Change of plans',
    'Found alternative travel option',
    'Health issues',
    'Financial constraints',
    'Schedule conflict',
    'Emergency situation',
    'Not satisfied with itinerary',
    'Other'
  ]

  const handleReasonSelect = (reason: string) => {
    setFormData({ ...formData, cancellationReason: reason })
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!formData.cancellationReason.trim()) {
      setError('Please select a cancellation reason')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      // Get the actual user ID from props (passed from parent)
      const bookingId = booking.bookingDbId || booking.id

      console.log('Cancellation data:', {
        userId,
        bookingId,
        booking,
        bookingKeys: Object.keys(booking || {})
      })

      if (!userId || !bookingId) {
        throw new Error(`Booking information is incomplete. UserId: ${userId}, BookingId: ${bookingId}`)
      }

      const response = await fetch(`/api/users/${userId}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit cancellation request')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
        resetForm()
      }, 2000)
    } catch (err: any) {
      console.error('Cancellation error:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setFormData({
      cancellationReason: '',
      experience: '',
      feedback: ''
    })
    setError('')
    setSuccess(false)
  }

  const handleClose = () => {
    if (!submitting) {
      onClose()
      resetForm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Cancel Booking</h2>
                <p className="text-sm text-gray-600 mt-1">{booking?.title || booking?.payload?.title || 'Trip'}</p>
              </div>
              <button
                onClick={handleClose}
                disabled={submitting}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Request Submitted!</h3>
                  <p className="text-sm text-gray-600">
                    Your cancellation request has been submitted successfully. Our team will review it and contact you shortly.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1: Reason Selection */}
                  {step === 1 && (
                    <div>
                      <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                          <div>
                            <p className="text-sm font-bold text-yellow-900 mb-1">Before you proceed</p>
                            <p className="text-sm text-yellow-800">
                              Please note that cancellation is subject to our cancellation policy. Refund amount will be determined based on the cancellation timeline and policy terms.
                            </p>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-4">Why do you want to cancel?</h3>
                      <div className="space-y-2">
                        {reasons.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleReasonSelect(reason)}
                            className="w-full text-left px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-medium text-gray-900"
                          >
                            {reason}
                          </button>
                        ))}
                      </div>

                      {formData.cancellationReason === 'Other' && (
                        <div className="mt-4">
                          <textarea
                            value={formData.cancellationReason}
                            onChange={(e) => setFormData({ ...formData, cancellationReason: e.target.value })}
                            placeholder="Please specify your reason..."
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Experience & Feedback */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Selected Reason</h3>
                        <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                          {formData.cancellationReason}
                        </p>
                        <button
                          onClick={() => setStep(1)}
                          className="text-sm text-blue-600 hover:underline mt-2"
                        >
                          Change reason
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          How was your experience so far? (Optional)
                        </label>
                        <textarea
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                          placeholder="Share your experience with the booking process..."
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Any additional feedback? (Optional)
                        </label>
                        <textarea
                          value={formData.feedback}
                          onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                          placeholder="Is there anything we could have done better?"
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-700 font-semibold">
                          {error}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <Loader className="animate-spin" size={20} />
                              Submitting...
                            </>
                          ) : (
                            'Submit Cancellation Request'
                          )}
                        </button>
                        <button
                          onClick={() => setStep(1)}
                          disabled={submitting}
                          className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CancellationModal
