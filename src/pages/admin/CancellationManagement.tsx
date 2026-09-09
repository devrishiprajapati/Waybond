import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  RefreshCw,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Calendar,
  User,
  Mail,
  Package,
  MessageSquare,
  Edit2,
  Trash2,
  X,
  Save,
  ArrowLeft
} from 'lucide-react'

type CancellationRequest = {
  id: string
  bookingId: string
  userId: string
  userName: string
  userEmail: string
  tripId: number
  tripTitle: string
  bookingAmount: number
  departure: string | null
  cancellationReason: string
  experience: string | null
  feedback: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  refundAmount: number | null
  refundStatus: string | null
  requestedAt: string
  processedAt: string | null
  processedBy: string | null
  adminNotes: string | null
}

type Stats = {
  pending: number
  approved: number
  rejected: number
  total: number
  totalRefundAmount: number
}

const CancellationManagement = () => {
  const [cancellations, setCancellations] = useState<CancellationRequest[]>([])
  const [filteredCancellations, setFilteredCancellations] = useState<CancellationRequest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all')
  const [selectedCancellation, setSelectedCancellation] = useState<CancellationRequest | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    status: '',
    refundAmount: '',
    refundStatus: '',
    adminNotes: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [navigate])

  useEffect(() => {
    filterCancellations()
  }, [cancellations, searchQuery, filterStatus])

  const loadData = async () => {
    try {
      setLoading(true)
      const [cancellationsRes, statsRes] = await Promise.all([
        fetch('/api/admin/cancellations'),
        fetch('/api/admin/cancellations-stats')
      ])

      if (cancellationsRes.ok) {
        const data = await cancellationsRes.json()
        setCancellations(data)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (err) {
      console.error('Error loading cancellations:', err)
      setError('Failed to load cancellation requests')
    } finally {
      setLoading(false)
    }
  }

  const filterCancellations = () => {
    let filtered = [...cancellations]

    if (filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === filterStatus)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.userName.toLowerCase().includes(query) ||
        c.userEmail.toLowerCase().includes(query) ||
        c.tripTitle.toLowerCase().includes(query) ||
        c.bookingId.toLowerCase().includes(query)
      )
    }

    setFilteredCancellations(filtered)
  }

  const handleOpenDetails = (cancellation: CancellationRequest) => {
    setSelectedCancellation(cancellation)
    setFormData({
      status: cancellation.status,
      refundAmount: cancellation.refundAmount?.toString() || '',
      refundStatus: cancellation.refundStatus || '',
      adminNotes: cancellation.adminNotes || ''
    })
    setShowDetailsModal(true)
    setError(null)
    setSuccess(null)
  }

  const handleCloseModal = () => {
    setShowDetailsModal(false)
    setSelectedCancellation(null)
    setError(null)
    setSuccess(null)
  }

  const handleUpdateCancellation = async () => {
    if (!selectedCancellation) return

    try {
      setProcessing(true)
      setError(null)

      const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
      
      const response = await fetch(`/api/admin/cancellations/${selectedCancellation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          processedBy: adminData.id || adminData.email
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update cancellation')
      }

      setSuccess('Cancellation request updated successfully')
      await loadData()
      
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cancellation request?')) return

    try {
      const response = await fetch(`/api/admin/cancellations/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')

      await loadData()
    } catch (err) {
      alert('Failed to delete cancellation request')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} />
      case 'APPROVED':
        return <CheckCircle size={16} />
      case 'REJECTED':
        return <XCircle size={16} />
      default:
        return <AlertCircle size={16} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 pt-24 md:pt-32 pb-28 lg:pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] text-secondary uppercase mb-4 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft size={12} />
            ADMIN DASHBOARD
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-black font-bungee text-gray-900 liquid-text mb-2">
            CANCELLATION MANAGEMENT
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Manage booking cancellation requests from customers
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-blue-600" size={20} />
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total</p>
              </div>
              <p className="text-3xl font-black text-blue-900">{stats.total}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-yellow-600" size={20} />
                <p className="text-xs font-bold text-yellow-600 uppercase tracking-wide">Pending</p>
              </div>
              <p className="text-3xl font-black text-yellow-900">{stats.pending}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="text-green-600" size={20} />
                <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Approved</p>
              </div>
              <p className="text-3xl font-black text-green-900">{stats.approved}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="text-red-600" size={20} />
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Rejected</p>
              </div>
              <p className="text-3xl font-black text-red-900">{stats.rejected}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-purple-600" size={20} />
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Refunds</p>
              </div>
              <p className="text-2xl font-black text-purple-900">₹{stats.totalRefundAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by user, email, trip, or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={loadData}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
            <div className="ml-auto text-sm font-medium text-gray-600">
              {filteredCancellations.length} {filteredCancellations.length === 1 ? 'request' : 'requests'}
            </div>
          </div>
        </div>

        {/* Cancellation Requests List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCancellations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <XCircle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-lg font-bold text-gray-500">No cancellation requests found</p>
            <p className="text-sm text-gray-400 mt-2">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Cancellation requests will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCancellations.map((cancellation) => (
              <motion.div
                key={cancellation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(cancellation.status)}`}>
                        {getStatusIcon(cancellation.status)}
                        {cancellation.status}
                      </span>
                      <div>
                        <h3 className="text-lg font-black text-gray-900">{cancellation.tripTitle}</h3>
                        <p className="text-sm text-gray-500">Booking ID: {cancellation.bookingId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User size={16} className="text-gray-400" />
                        <span className="font-semibold">{cancellation.userName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail size={16} className="text-gray-400" />
                        <span className="font-medium">{cancellation.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-semibold">₹{cancellation.bookingAmount.toLocaleString('en-IN')}</span>
                      </div>
                      {cancellation.departure && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar size={16} className="text-gray-400" />
                          <span className="font-medium">{new Date(cancellation.departure).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Reason</p>
                      <p className="text-sm text-gray-900 font-medium">{cancellation.cancellationReason}</p>
                    </div>

                    {cancellation.refundAmount && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-bold">
                          Refund: ₹{cancellation.refundAmount.toLocaleString('en-IN')}
                        </span>
                        {cancellation.refundStatus && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold">
                            {cancellation.refundStatus}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                      Requested: {new Date(cancellation.requestedAt).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDetails(cancellation)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors"
                    >
                      <Edit2 size={16} />
                      Review
                    </button>
                    <button
                      onClick={() => handleDelete(cancellation.id)}
                      className="p-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedCancellation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Review Cancellation</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Details */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-bold text-gray-700">Name:</span> {selectedCancellation.userName}</p>
                    <p><span className="font-bold text-gray-700">Email:</span> {selectedCancellation.userEmail}</p>
                    <p><span className="font-bold text-gray-700">Booking ID:</span> {selectedCancellation.bookingId}</p>
                    <p><span className="font-bold text-gray-700">Trip:</span> {selectedCancellation.tripTitle}</p>
                    <p><span className="font-bold text-gray-700">Amount:</span> ₹{selectedCancellation.bookingAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {/* Cancellation Details */}
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Cancellation Reason</h3>
                  <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{selectedCancellation.cancellationReason}</p>
                </div>

                {selectedCancellation.experience && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Experience</h3>
                    <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{selectedCancellation.experience}</p>
                  </div>
                )}

                {selectedCancellation.feedback && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Additional Feedback</h3>
                    <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{selectedCancellation.feedback}</p>
                  </div>
                )}

                {/* Status Update Form */}
                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Update Status</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Refund Amount (₹)</label>
                      <input
                        type="number"
                        value={formData.refundAmount}
                        onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                        placeholder="Enter refund amount"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Refund Status</label>
                      <select
                        value={formData.refundStatus}
                        onChange={(e) => setFormData({ ...formData, refundStatus: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Not Set</option>
                        <option value="PENDING">Pending</option>
                        <option value="PROCESSED">Processed</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes</label>
                      <textarea
                        value={formData.adminNotes}
                        onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                        placeholder="Add internal notes about this cancellation..."
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-sm text-red-700 font-semibold">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mt-4 p-3 bg-green-50 border-2 border-green-200 rounded-lg text-sm text-green-700 font-semibold flex items-center gap-2">
                      <CheckCircle size={16} />
                      {success}
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleUpdateCancellation}
                      disabled={processing}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      <Save size={20} />
                      {processing ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCloseModal}
                      disabled={processing}
                      className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CancellationManagement
