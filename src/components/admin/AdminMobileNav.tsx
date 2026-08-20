import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  CreditCard,
  Filter,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  MessageSquareText,
  Plus,
  Shield,
  TrendingUp,
  Users2,
  UsersRound
} from 'lucide-react'

type AdminData = {
  role?: string
  permissions?: string[]
}

const navItems = [
  { label: 'Inventory', path: '/admin/dashboard', icon: LayoutDashboard, permission: 'manage_trips' },
  { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp, permission: 'view_analytics' },
  { label: 'Filters', path: '/admin/data-filters', icon: Filter, permission: 'view_data_filters' },
  { label: 'Trending', path: '/admin/hero', icon: ImageIcon, permission: 'manage_hero' },
  { label: 'New', path: '/admin/new', icon: Plus, permission: 'manage_trips' },
  { label: 'Stories', path: '/admin/travel-stories', icon: BookOpen, permission: 'manage_travel_stories' },
  { label: 'Reviews', path: '/admin/testimonials', icon: MessageSquareText, permission: 'manage_testimonials' },
  { label: 'Team', path: '/admin/team-members', icon: Users2, permission: 'manage_team_members' },
  { label: 'Users', path: '/admin/users', icon: UsersRound, permission: 'manage_users' },
  { label: 'Payments', path: '/admin/payment-update', icon: CreditCard, permission: 'view_bookings' },
  { label: 'Gallery', path: '/admin/gallery', icon: Images, permission: 'manage_gallery' },
  { label: 'Admins', path: '/admin/admins', icon: Shield, permission: 'manage_admins' }
]

const getAdminData = (): AdminData | null => {
  try {
    return JSON.parse(sessionStorage.getItem('adminData') || 'null')
  } catch {
    return null
  }
}

export default function AdminMobileNav() {
  const location = useLocation()
  const isAdmin = sessionStorage.getItem('isAdmin') === 'true'
  const adminData = getAdminData()

  if (!isAdmin || location.pathname.includes('/login')) return null

  const hasPermission = (permission: string) => {
    if (adminData?.role === 'MASTER_ADMIN') return true
    return Boolean(adminData?.permissions?.includes(permission))
  }

  const visibleNavItems = navItems.filter((item) => hasPermission(item.permission))
  if (!visibleNavItems.length) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[180] border-t border-slate-200 bg-white/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:hidden">
      <nav className="flex gap-2 overflow-x-auto hide-scrollbar" aria-label="Admin navigation">
        {visibleNavItems.map((item) => {
          const active = location.pathname === item.path || location.pathname.endsWith(item.path.replace('/admin', ''))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-w-[76px] flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[9px] font-black uppercase tracking-[0.08em] transition-colors ${
                active
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                  : 'bg-slate-100 text-slate-500 hover:bg-secondary/10 hover:text-secondary'
              }`}
            >
              <item.icon size={17} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
