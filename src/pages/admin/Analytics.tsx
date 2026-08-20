import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Package,
  Calendar,
  DollarSign,
  MapPin,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import PermissionGuard from '../../components/PermissionGuard'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type AnalyticsData = {
  bookingTrends: {
    labels: string[]
    data: number[]
  }
  categoryDistribution: {
    labels: string[]
    data: number[]
  }
  experienceDistribution: {
    labels: string[]
    data: number[]
  }
  locationPopularity: {
    labels: string[]
    data: number[]
  }
  monthlyRevenue: {
    labels: string[]
    data: number[]
  }
  userGrowth: {
    labels: string[]
    data: number[]
  }
  stats: {
    totalBookings: number
    totalRevenue: number
    averageBookingValue: number
    conversionRate: number
    totalTrips: number
    totalUsers: number
  }
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    loadAnalytics()
  }, [navigate, timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const analyticsData = await response.json()
        setData(analyticsData)
      } else {
        console.error('Failed to load analytics - using fallback data')
        setData(generateMockData())
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setData(generateMockData())
    } finally {
      setLoading(false)
    }
  }

  const generateMockData = (): AnalyticsData => {
    return {
      bookingTrends: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        data: [45, 67, 82, 95]
      },
      categoryDistribution: {
        labels: ['Adventure', 'Beach', 'Nature', 'Backpacking', 'Luxury'],
        data: [35, 25, 20, 15, 5]
      },
      experienceDistribution: {
        labels: ['Road', 'Weekend', 'Monsoon', 'Snow'],
        data: [40, 30, 20, 10]
      },
      locationPopularity: {
        labels: ['Spiti Valley', 'Leh Ladakh', 'Kashmir', 'Meghalaya', 'Kerala', 'Andaman'],
        data: [85, 92, 78, 65, 70, 88]
      },
      monthlyRevenue: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [245000, 189000, 310000, 425000, 567000, 489000, 523000, 612000, 534000, 489000, 456000, 678000]
      },
      userGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [120, 145, 178, 210, 245, 289]
      },
      stats: {
        totalBookings: 289,
        totalRevenue: 5917000,
        averageBookingValue: 20473,
        conversionRate: 12.5,
        totalTrips: 9,
        totalUsers: 289
      }
    }
  }

  // Chart configurations
  const lineChartOptions: any = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#f8fafc',
          font: { size: 12, weight: 'bold' }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  }

  const barChartOptions: any = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#cbd5e1', font: { size: 11 } },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  }

  const pieChartOptions: any = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f8fafc',
          font: { size: 11 },
          padding: 15
        }
      }
    }
  }

  const getBookingTrendsData = () => ({
    labels: data?.bookingTrends.labels || [],
    datasets: [
      {
        label: 'Bookings',
        data: data?.bookingTrends.data || [],
        fill: true,
        borderColor: '#6495ED',
        backgroundColor: 'rgba(100, 149, 237, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#6495ED',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  })

  const getRevenueData = () => ({
    labels: data?.monthlyRevenue.labels || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: data?.monthlyRevenue.data || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2
      }
    ]
  })

  const getCategoryData = () => ({
    labels: data?.categoryDistribution.labels || [],
    datasets: [
      {
        data: data?.categoryDistribution.data || [],
        backgroundColor: [
          '#6495ED',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899'
        ],
        hoverBackgroundColor: [
          '#5080d9',
          '#059669',
          '#d97706',
          '#7c3aed',
          '#db2777'
        ]
      }
    ]
  })

  const getExperienceData = () => ({
    labels: data?.experienceDistribution.labels || [],
    datasets: [
      {
        data: data?.experienceDistribution.data || [],
        backgroundColor: [
          '#0ea5e9',
          '#f59e0b',
          '#8b5cf6',
          '#06b6d4'
        ],
        hoverBackgroundColor: [
          '#0284c7',
          '#d97706',
          '#7c3aed',
          '#0891b2'
        ]
      }
    ]
  })

  const getLocationData = () => ({
    labels: data?.locationPopularity.labels || [],
    datasets: [
      {
        label: 'Popularity Score',
        data: data?.locationPopularity.data || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8b5cf6',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  })

  const getUserGrowthData = () => ({
    labels: data?.userGrowth.labels || [],
    datasets: [
      {
        label: 'New Users',
        data: data?.userGrowth.data || [],
        fill: true,
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        tension: 0.4,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5
      }
    ]
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="text-white/60 mt-4 font-medium">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <PermissionGuard requiredPermission="view_analytics">
      <div className="min-h-screen bg-white text-white p-4 pb-28 pt-24 sm:p-6 sm:pb-28 sm:pt-24 md:p-10 md:pb-28 lg:p-12 lg:pb-12">
        <div className="max-w-[1800px] mx-auto pt-20">
          {/* Back to Dashboard */}
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-white/50 font-black text-[10px] uppercase tracking-[0.24em] hover:text-secondary transition-all mb-6"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </Link>

          {/* Header */}
          <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
            <div className="space-y-3">
              <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">
                Business Intelligence
              </span>
              <h1 className="text-3xl md:text-5xl font-bungee font-black tracking-tighter uppercase italic leading-none">
                Analytics <span className="text-primary">Dashboard</span>
              </h1>
              <p className="text-white/45 font-medium italic max-w-2xl">
                Real-time insights into bookings, revenue, and customer behavior
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`h-10 px-5 rounded-xl font-black text-[9px] uppercase tracking-[0.16em] transition-all ${
                    timeRange === range
                      ? 'bg-secondary text-white shadow-xl shadow-secondary/20'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {range === '7d' && 'Last 7 Days'}
                  {range === '30d' && 'Last 30 Days'}
                  {range === '90d' && 'Last 90 Days'}
                  {range === '1y' && 'Last Year'}
                </button>
              ))}
            </div>
          </header>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="liquid-glass-dark border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Calendar size={20} />
                </div>
              </div>
              <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.2em] mb-1">
                Total Bookings
              </p>
              <p className="text-2xl font-sans font-black text-white">{data?.stats.totalBookings || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="liquid-glass-dark border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400">
                  <DollarSign size={20} />
                </div>
              </div>
              <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.2em] mb-1">
                Total Revenue
              </p>
              <p className="text-2xl font-sans font-black text-white">
                ₹{((data?.stats.totalRevenue || 0) / 100000).toFixed(1)}L
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="liquid-glass-dark border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.2em] mb-1">
                Avg Booking Value
              </p>
              <p className="text-2xl font-sans font-black text-white">
                ₹{(data?.stats.averageBookingValue || 0).toLocaleString('en-IN')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="liquid-glass-dark border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.2em] mb-1">
                Conversion Rate
              </p>
              <p className="text-2xl font-sans font-black text-white">
                {data?.stats.conversionRate || 0}%
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="liquid-glass-dark border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Package size={20} />
                </div>
              </div>
              <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.2em] mb-1">
                Total Trips
              </p>
              <p className="text-2xl font-sans font-black text-white">{data?.stats.totalTrips || 0}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="liquid-glass-dark border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-[8px] text-white/35 font-black uppercase tracking-[0.2em] mb-1">
                Total Users
              </p>
              <p className="text-2xl font-sans font-black text-white">{data?.stats.totalUsers || 0}</p>
            </motion.div>
          </div>

          {/* Charts Grid */}
          <div className="space-y-6">
            {/* Row 1: Booking Trends & Revenue */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="text-secondary" size={20} />
                  <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter text-white">
                    Booking Trends
                  </h2>
                </div>
                <div style={{ height: '300px' }}>
                  <Line data={getBookingTrendsData()} options={lineChartOptions} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="text-green-400" size={20} />
                  <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter text-white">
                    Monthly Revenue
                  </h2>
                </div>
                <div style={{ height: '300px' }}>
                  <Bar data={getRevenueData()} options={barChartOptions} />
                </div>
              </motion.div>
            </div>

            {/* Row 2: Category & Experience Distribution */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <PieChartIcon className="text-primary" size={20} />
                  <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter text-white">
                    Category Distribution
                  </h2>
                </div>
                <div style={{ height: '300px' }}>
                  <Doughnut data={getCategoryData()} options={pieChartOptions} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <PieChartIcon className="text-purple-400" size={20} />
                  <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter text-white">
                    Experience Type
                  </h2>
                </div>
                <div style={{ height: '300px' }}>
                  <Pie data={getExperienceData()} options={pieChartOptions} />
                </div>
              </motion.div>
            </div>

            {/* Row 3: Location Popularity & User Growth */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-purple-400" size={20} />
                  <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter text-white">
                    Location Popularity
                  </h2>
                </div>
                <div style={{ height: '300px' }}>
                  <Bar data={getLocationData()} options={barChartOptions} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Users className="text-pink-400" size={20} />
                  <h2 className="text-xl font-bungee font-black uppercase italic tracking-tighter text-white">
                    User Growth
                  </h2>
                </div>
                <div style={{ height: '300px' }}>
                  <Line data={getUserGrowthData()} options={lineChartOptions} />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Info Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 liquid-glass-dark border border-blue-500/20 rounded-2xl p-6"
          >
            <div className="flex items-start gap-3">
              <Activity className="text-blue-400 mt-1" size={20} />
              <div>
                <h3 className="text-lg font-black text-white mb-2">Analytics Insights</h3>
                <p className="text-sm text-white/60 font-medium leading-relaxed">
                  This dashboard provides real-time analytics and insights into your business performance. 
                  Use the time range selector to view data for different periods. Charts are interactive - 
                  hover over data points for detailed information.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PermissionGuard>
  )
}

export default Analytics
