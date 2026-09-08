import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  RefreshCw,
  Percent,
  Tag,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Calendar,
  Package,
  DollarSign,
  ArrowLeft,
  BarChart3
} from 'lucide-react'
import PermissionGuard from '../../components/PermissionGuard'

type PromoCode = {
  id: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  eligiblePackages: number[]
  minBookingAmount: number | null
  maxDiscount: number | null
  validFrom: string
  validUntil: string
  usageLimit: number | null
  usageCount: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  description: string | null
}

type Trip = {
  id: number
  title: string
  location: string
}

const PromoCodesManagement = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all')
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    eligiblePackages: [] as number[],
    minBookingAmount: '',
    maxDiscount: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    usageLimit: '',
    description: '',
    autoGenerate: false
  })

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }

    const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
    const hasPermission = adminData.permissions?.includes('manage_promo_codes')
    const isMasterAdmin = adminData.role === 'MASTER_ADMIN'

    if (!hasPermission && !isMasterAdmin) {
      navigate('/admin/dashboard')
      return
    }

    loadData()
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [promoCodesRes, tripsRes] = await Promise.all([
        fetch('/api/admin/promo-codes'),
        fetch('/api/admin/trips')
      ])

      if (promoCodesRes.ok) {
        const data = await promoCodesRes.json()
        setPromoCodes(data)
      }

      if (tripsRes.ok) {
        const data = await tripsRes.json()
        setTrips(data)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setError('Failed to load promo codes')
    } finally {
      setLoading(false)
    }
  }

  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = 
      promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promo.description && promo.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const now = new Date()
    const isExpired = new Date(promo.validUntil) < now
    
    let matchesFilter = true
    if (filterStatus === 'active') matchesFilter = promo.isActive && !isExpired
    if (filterStatus === 'inactive') matchesFilter = !promo.isActive
    if (filterStatus === 'expired') matchesFilter = isExpired

    return matchesSearch && matchesFilter
  })

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCodes(newExpanded)
  }

  const handleOpenModal = (promo?: PromoCode) => {
    if (promo) {
      setEditingPromo(promo)
      setFormData({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: String(promo.discountValue),
        eligiblePackages: promo.eligiblePackages || [],
        minBookingAmount: promo.minBookingAmount ? String(promo.minBookingAmount) : '',
        maxDiscount: promo.maxDiscount ? String(promo.maxDiscount) : '',
        validFrom: promo.validFrom.split('T')[0],
        validUntil: promo.validUntil.split('T')[0],
        usageLimit: promo.usageLimit ? String(promo.usageLimit) : '',
        description: promo.description || '',
        autoGenerate: false
      })
    } else {
      setEditingPromo(null)
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        eligiblePackages: [],
        minBookingAmount: '',
        maxDiscount: '',
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        usageLimit: '',
        description: '',
        autoGenerate: false
      })
    }
    setShowCreateModal(true)
    setError(null)
  }

  const handleSubmit = async () => {
    setError(null)
    setSaving(true)

    try {
      if (!formData.autoGenerate && !formData.code.trim()) {
        setError('Promo code is required')
        setSaving(false)
        return
      }

      if (!formData.discountValue || Number(formData.discountValue) <= 0) {
        setError('Discount value must be greater than 0')
        setSaving(false)
        return
      }

      if (formData.discountType === 'PERCENTAGE' && Number(formData.discountValue) > 100) {
        setError('Percentage discount cannot exceed 100%')
        setSaving(false)
        return
      }

      if (!formData.validUntil) {
        setError('Valid until date is required')
        setSaving(false)
        return
      }

      const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')

      const payload = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        eligiblePackages: formData.eligiblePackages,
        minBookingAmount: formData.minBookingAmount ? Number(formData.minBookingAmount) : null,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        description: formData.description || null,
        createdBy: adminData.id || 'admin',
        autoGenerate: formData.autoGenerate
      }

      const url = editingPromo
        ? `/api/admin/promo-codes/${editingPromo.id}`
        : '/api/admin/promo-codes'

      const response = await fetch(url, {
        method: editingPromo ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save promo code')
      }

      setSuccess(editingPromo ? 'Promo code updated!' : 'Promo code created!')
      setShowCreateModal(false)
      await loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to save promo code')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete')

      setSuccess('Promo code deleted!')
      setDeleteConfirm(null)
      await loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      setError('Failed to delete promo code')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const response = await fetch(`/api/admin/promo-codes/${promo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive })
      })

      if (!response.ok) throw new Error('Failed to toggle status')
      await loadData()
    } catch (error) {
      setError('Failed to update status')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Code copied!')
    setTimeout(() => setSuccess(null), 2000)
  }

  const getPackageNames = (packageIds: number[]) => {
    if (!packageIds || packageIds.length === 0) return 'All Packages'
    return packageIds
      .map(id => trips.find(t => t.id === id)?.title || `Package ${id}`)
      .slice(0, 2)
      .join(', ') + (packageIds.length > 2 ? ` +${packageIds.length - 2}` : '')
  }

  const isExpired = (date: string) => new Date(date) < new Date()

  const getStatusColor = (promo: PromoCode) => {
    if (isExpired(promo.validUntil)) return 'bg-red-100 text-red-700 border-red-200'
    if (!promo.isActive) return 'bg-gray-100 text-gray-700 border-gray-200'
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return 'bg-orange-100 text-orange-700 border-orange-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const getStatusText = (promo: PromoCode) => {
    if (isExpired(promo.validUntil)) return 'Expired'
    if (!promo.isActive) return 'Inactive'
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return 'Limit Reached'
    return 'Active'
  }

  return (
    <PermissionGuard requiredPermission="manage_promo_codes">
      <div className="min-h-screen bg-white px-4 sm:px-6 md:px-10 lg:px-16 pt-24 md:pt-32 pb-28 lg:pb-20">
        <div className="max-w-[1500px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back to Dashboard */}
            <Link 
              to="/admin/dashboard" 
              className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"
            >
              <ArrowLeft size={15} /> Admin dashboard
            </Link>

            {/* Section Label */}
            <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">
              PROMOTIONAL TOOLS
            </p>

            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-6xl font-bungee font-black uppercase italic tracking-tighter liquid-text">
                PROMO CODE <span className="text-primary font-bungee">MANAGEMENT</span>
              </h1>
              <p className="text-gray-600 mt-3 text-sm sm:text-base font-medium">
                Create and manage promotional discount codes for travel packages
              </p>
            </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                  <X size={20} />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-green-800 font-semibold">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
                  <X size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search and Actions */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search promo codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/30"
              >
                <Plus size={20} />
                Create Promo Code
              </button>
              <button
                onClick={loadData}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                <RefreshCw size={20} />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'active', 'inactive', 'expired'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
              <div className="ml-auto text-sm font-medium text-gray-600">
                {filteredPromoCodes.length} {filteredPromoCodes.length === 1 ? 'code' : 'codes'}
              </div>
            </div>
          </div>

          {/* Promo Codes List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPromoCodes.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <Tag className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-lg font-bold text-gray-500">No promo codes found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first promo code to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPromoCodes.map((promo) => {
                const isExpanded = expandedCodes.has(promo.id)
                
                return (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Collapsed Header */}
                    <div
                      onClick={() => toggleExpanded(promo.id)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <button className="text-gray-600">
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-black font-mono text-gray-900">{promo.code}</h3>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(promo.code)
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                              title="Copy code"
                            >
                              <Copy size={14} className="text-gray-500" />
                            </button>
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(promo)}`}>
                              {getStatusText(promo)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <div className="flex items-center gap-2">
                              {promo.discountType === 'PERCENTAGE' ? (
                                <Percent size={16} className="text-blue-600" />
                              ) : (
                                <DollarSign size={16} className="text-purple-600" />
                              )}
                              <span className="font-bold text-gray-900">
                                {promo.discountType === 'PERCENTAGE' 
                                  ? `${promo.discountValue}% OFF`
                                  : `₹${promo.discountValue.toLocaleString('en-IN')} OFF`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-600">
                              <TrendingUp size={14} />
                              <span className="font-medium">
                                {promo.usageCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
                              </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1 text-gray-600">
                              <Calendar size={14} />
                              <span className="font-medium">
                                Until {new Date(promo.validUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/admin/promo-codes/${promo.id}/usage`)
                          }}
                          className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                          title="View Usage History"
                        >
                          <BarChart3 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenModal(promo)
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteConfirm(promo.id)
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t-2 border-gray-100 bg-gray-50"
                        >
                          <div className="p-6 space-y-4">
                            {/* Discount Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Discount Type</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {promo.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                                </p>
                              </div>
                              
                              <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Discount Value</p>
                                <p className="text-sm font-bold text-gray-900">
                                  {promo.discountType === 'PERCENTAGE' 
                                    ? `${promo.discountValue}%`
                                    : `₹${promo.discountValue.toLocaleString('en-IN')}`}
                                  {promo.maxDiscount && promo.discountType === 'PERCENTAGE' && (
                                    <span className="text-xs text-gray-600 ml-2">
                                      (Max: ₹{promo.maxDiscount.toLocaleString('en-IN')})
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Eligible Packages */}
                            <div className="p-4 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-start gap-2 mb-2">
                                <Package className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
                                <p className="text-xs text-gray-500 font-semibold uppercase">Eligible Packages</p>
                              </div>
                              <p className="text-sm text-gray-900 font-medium">
                                {getPackageNames(promo.eligiblePackages)}
                              </p>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Valid From</p>
                                <p className="text-sm text-gray-900 font-medium">
                                  {new Date(promo.validFrom).toLocaleDateString('en-IN', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                              
                              <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Valid Until</p>
                                <p className={`text-sm font-medium ${isExpired(promo.validUntil) ? 'text-red-600' : 'text-gray-900'}`}>
                                  {new Date(promo.validUntil).toLocaleDateString('en-IN', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Usage and Minimum */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Usage Count</p>
                                <p className="text-sm text-gray-900 font-medium">
                                  {promo.usageCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''} times
                                  {promo.usageLimit && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({Math.round((promo.usageCount / promo.usageLimit) * 100)}%)
                                    </span>
                                  )}
                                </p>
                              </div>
                              
                              {promo.minBookingAmount && (
                                <div className="p-4 bg-white rounded-lg border border-gray-200">
                                  <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Min. Booking Amount</p>
                                  <p className="text-sm text-gray-900 font-medium">
                                    ₹{promo.minBookingAmount.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Description */}
                            {promo.description && (
                              <div className="p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Description</p>
                                <p className="text-sm text-gray-700">{promo.description}</p>
                              </div>
                            )}

                            {/* Toggle Active */}
                            <button
                              onClick={() => handleToggleActive(promo)}
                              className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                                promo.isActive
                                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {promo.isActive ? 'Deactivate Code' : 'Activate Code'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => !saving && setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900">
                    {editingPromo ? 'Edit Promo Code' : 'Create New Promo Code'}
                  </h2>
                  <button
                    onClick={() => !saving && setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={saving}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Auto Generate Toggle */}
                  {!editingPromo && (
                    <div className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
                      <input
                        type="checkbox"
                        id="autoGenerate"
                        checked={formData.autoGenerate}
                        onChange={(e) => setFormData({ ...formData, autoGenerate: e.target.checked })}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <label htmlFor="autoGenerate" className="flex items-center gap-2 font-bold text-gray-900 cursor-pointer">
                        <Sparkles size={18} className="text-purple-600" />
                        Auto-generate promo code
                      </label>
                    </div>
                  )}

                  {/* Code Input */}
                  {!formData.autoGenerate && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Promo Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., SUMMER2024"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold"
                        disabled={!!editingPromo}
                      />
                      <p className="text-xs text-gray-500 mt-1">4-20 characters, letters and numbers only</p>
                    </div>
                  )}

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Discount Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.discountType === 'PERCENTAGE'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Percent className="mx-auto mb-2" size={24} />
                        <p className="font-bold text-sm">Percentage</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, discountType: 'FIXED' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.discountType === 'FIXED'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <DollarSign className="mx-auto mb-2" size={24} />
                        <p className="font-bold text-sm">Fixed Amount</p>
                      </button>
                    </div>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      {formData.discountType === 'PERCENTAGE' ? 'Discount Percentage *' : 'Discount Amount *'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        placeholder={formData.discountType === 'PERCENTAGE' ? '20' : '500'}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                        {formData.discountType === 'PERCENTAGE' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>

                  {/* Max Discount (for percentage) */}
                  {formData.discountType === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Maximum Discount Cap (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.maxDiscount}
                          onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                          placeholder="2000"
                          className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                      </div>
                    </div>
                  )}

                  {/* Eligible Packages */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Eligible Packages
                    </label>
                    <div className="max-h-40 overflow-y-auto border-2 border-gray-200 rounded-xl p-3 space-y-2">
                      {trips.length === 0 ? (
                        <p className="text-sm text-gray-500">No packages available</p>
                      ) : (
                        trips.map((trip) => (
                          <label key={trip.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.eligiblePackages.includes(trip.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    eligiblePackages: [...formData.eligiblePackages, trip.id]
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    eligiblePackages: formData.eligiblePackages.filter(id => id !== trip.id)
                                  })
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-900">{trip.title} ({trip.location})</span>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all packages</p>
                  </div>

                  {/* Min Booking Amount */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Minimum Booking Amount (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.minBookingAmount}
                        onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                        placeholder="5000"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Valid From
                      </label>
                      <input
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Valid Until *
                      </label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Usage Limit */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Usage Limit (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="100"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited usage</p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Internal notes about this promo code..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => !saving && setShowCreateModal(false)}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {editingPromo ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => !saving && setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Delete Promo Code</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this promo code? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => !saving && setDeleteConfirm(null)}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </PermissionGuard>
  )
}

export default PromoCodesManagement
