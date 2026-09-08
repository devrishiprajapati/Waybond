import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  User,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  Filter,
  Search,
  Tag,
  BarChart3,
  Users,
  RefreshCw
} from 'lucide-react'
import PermissionGuard from '../../components/PermissionGuard'

type PromoCodeUsage = {
  id: string
  promoCodeId: string
  userId: string
  userName: string
  userEmail: string
  bookingId: string | null
  tripId: number | null
  tripTitle: string | null
  discountAmount: number
  bookingAmount: number
  finalAmount: number
  usedAt: string
  promoCode?: {
    code: string
    discountType: string
    discountValue: number
  }
}

type Statistics = {
  code: string
  totalUsages: number
  totalDiscountGiven: number
  totalRevenue: number
  averageDiscount: number
  usagesByTrip: Array<{
    tripId: number
    tripTitle: string
    count: number
    totalDiscount: number
  }>
  usagesByDate: Record<string, number>
  recentUsages: PromoCodeUsage[]
}

const PromoCodeUsageHistory = () => {
  const { id } = useParams<{ id: string }>()
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [usages, setUsages] = useState<PromoCodeUsage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTrip, setFilterTrip] = useState<string>('all')
  const navigate = useNavigate()

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
  }, [navigate, id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, usagesRes] = await Promise.all([
        fetch(`/api/admin/promo-codes/${id}/statistics`),
        fetch(`/api/admin/promo-codes/${id}/usage-history`)
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStatistics(data)
      }

      if (usagesRes.ok) {
        const data = await usagesRes.json()
        setUsages(data)
      }
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsages = usages.filter(usage => {
    const matchesSearch = 
      usage.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usage.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (usage.tripTitle && usage.tripTitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (usage.bookingId && usage.bookingId.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTrip = filterTrip === 'all' || (usage.tripId && String(usage.tripId) === filterTrip)

    return matchesSearch && matchesTrip
  })

  const uniqueTrips = Array.from(new Set(usages.map(u => u.tripId).filter(Boolean)))
    .map(tripId => {
      const usage = usages.find(u => u.tripId === tripId)
      return { id: tripId, title: usage?.tripTitle || `Trip ${tripId}` }
    })

  const exportCSV = () => {
    const headers = ['Date', 'User Name', 'User Email', 'Package', 'Booking Amount', 'Discount', 'Final Amount', 'Booking ID']
    const rows = filteredUsages.map(usage => [
      new Date(usage.usedAt).toLocaleString('en-IN'),
      usage.userName,
      usage.userEmail,
      usage.tripTitle || 'N/A',
      `₹${usage.bookingAmount.toLocaleString('en-IN')}`,
      `₹${usage.discountAmount.toLocaleString('en-IN')}`,
      `₹${usage.finalAmount.toLocaleString('en-IN')}`,
      usage.bookingId || 'N/A'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `promo-code-${statistics?.code}-usage-history.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
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
            {/* Back Links */}
            <Link 
              to="/admin/promo-codes" 
              className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"
            >
              <ArrowLeft size={15} /> Back to Promo Codes
            </Link>

            {/* Header */}
            <div className="mb-8">
              <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">
                USAGE ANALYTICS
              </p>
              <h1 className="text-4xl md:text-6xl font-bungee font-black uppercase italic tracking-tighter liquid-text">
                {statistics?.code} <span className="text-primary font-bungee">USAGE HISTORY</span>
              </h1>
              <p className="text-gray-600 mt-3 text-sm sm:text-base font-medium">
                Track all usage activity and statistics for this promo code
              </p>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-600 uppercase">Total Uses</p>
                      <p className="text-2xl font-black text-gray-900">{statistics.totalUsages}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-600 uppercase">Total Discount</p>
                      <p className="text-2xl font-black text-gray-900">
                        ₹{statistics.totalDiscountGiven.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <BarChart3 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase">Avg Discount</p>
                      <p className="text-2xl font-black text-gray-900">
                        ₹{statistics.averageDiscount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <Package size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-orange-600 uppercase">Revenue</p>
                      <p className="text-2xl font-black text-gray-900">
                        ₹{statistics.totalRevenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Usage by Package */}
            {statistics && statistics.usagesByTrip.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Usage by Package
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {statistics.usagesByTrip.map((trip) => (
                    <div key={trip.tripId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="font-bold text-gray-900 mb-1">{trip.tripTitle}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{trip.count} bookings</span>
                        <span className="font-bold text-blue-600">
                          ₹{trip.totalDiscount.toLocaleString('en-IN')} saved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters and Actions */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by user, email, package, or booking ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={exportCSV}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-colors"
                >
                  <Download size={20} />
                  Export CSV
                </button>
                <button
                  onClick={loadData}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              {/* Package Filter */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterTrip('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    filterTrip === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Packages
                </button>
                {uniqueTrips.map((trip) => (
                  <button
                    key={trip.id}
                    onClick={() => setFilterTrip(String(trip.id))}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      filterTrip === String(trip.id)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {trip.title}
                  </button>
                ))}
                <div className="ml-auto text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Filter size={16} />
                  {filteredUsages.length} {filteredUsages.length === 1 ? 'usage' : 'usages'}
                </div>
              </div>
            </div>

            {/* Usage History Table */}
            {filteredUsages.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Tag className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg font-bold text-gray-500">No usage history found</p>
                <p className="text-sm text-gray-400 mt-2">This promo code hasn't been used yet</p>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                          Package
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                          Booking Amount
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-wider">
                          Final Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-wider">
                          Booking ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsages.map((usage) => (
                        <tr key={usage.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar size={14} className="text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {new Date(usage.usedAt).toLocaleDateString('en-IN')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(usage.usedAt).toLocaleTimeString('en-IN', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <User size={14} className="text-gray-400 mt-1" />
                              <div>
                                <p className="text-sm font-bold text-gray-900">{usage.userName}</p>
                                <p className="text-xs text-gray-500">{usage.userEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package size={14} className="text-gray-400" />
                              <p className="text-sm font-medium text-gray-900">
                                {usage.tripTitle || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <p className="text-sm font-medium text-gray-900">
                              ₹{usage.bookingAmount.toLocaleString('en-IN')}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <p className="text-sm font-bold text-green-600">
                              -₹{usage.discountAmount.toLocaleString('en-IN')}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <p className="text-sm font-bold text-blue-600">
                              ₹{usage.finalAmount.toLocaleString('en-IN')}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-xs font-mono text-gray-500">
                              {usage.bookingId || 'N/A'}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PermissionGuard>
  )
}

export default PromoCodeUsageHistory
