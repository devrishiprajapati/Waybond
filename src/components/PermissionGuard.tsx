import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldAlert, Lock } from 'lucide-react'

type PermissionGuardProps = {
  children: React.ReactNode
  requiredPermission?: string | string[]
  requireMasterAdmin?: boolean
}

type AdminData = {
  id: string
  name: string
  email: string
  role: 'MASTER_ADMIN' | 'ADMIN'
  permissions: string[]
}

const PermissionGuard = ({ children, requiredPermission, requireMasterAdmin = false }: PermissionGuardProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const checkPermissions = () => {
      // Check if admin is logged in
      const isAdmin = sessionStorage.getItem('isAdmin')
      if (isAdmin !== 'true') {
        navigate('/admin/login')
        return
      }

      // Get admin data
      const adminDataStr = sessionStorage.getItem('adminData')
      if (!adminDataStr) {
        navigate('/admin/login')
        return
      }

      try {
        const admin: AdminData = JSON.parse(adminDataStr)
        
        if (!isMounted) return

        setAdminData(admin)

        // Master Admin has access to everything
        if (admin.role === 'MASTER_ADMIN') {
          setHasPermission(true)
          return
        }

        // Check if Master Admin role is required
        if (requireMasterAdmin) {
          setHasPermission(false)
          return
        }

        // Check specific permission(s)
        if (requiredPermission) {
          const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
          const hasAllPermissions = permissions.every(perm => admin.permissions && admin.permissions.includes(perm))
          setHasPermission(hasAllPermissions)
        } else {
          // No specific permission required, just need to be logged in as admin
          setHasPermission(true)
        }
      } catch (error) {
        console.error('Failed to parse admin data:', error)
        navigate('/admin/login')
      }
    }

    checkPermissions()

    return () => {
      isMounted = false
    }
  }, []) // Empty dependency array - only run once on mount

  // Loading state
  if (hasPermission === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto"></div>
          <p className="text-white/60 mt-4 font-medium">Checking permissions...</p>
        </div>
      </div>
    )
  }

  // No permission
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-white text-white flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <div className="liquid-glass-dark border border-red-500/20 rounded-[2.5rem] p-10 text-center">
            <div className="w-20 h-20 mx-auto bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mb-6">
              <ShieldAlert size={40} className="text-red-400" />
            </div>

            <h1 className="text-3xl font-bungee font-black uppercase italic tracking-tighter mb-4">
              Access <span className="text-red-400">Denied</span>
            </h1>

            <p className="text-white/60 font-medium mb-6 leading-relaxed">
              {requireMasterAdmin
                ? 'This feature is only available to Master Administrators. Please contact your Master Admin if you need access.'
                : 'You do not have permission to access this feature. Please contact your administrator to request the necessary permissions.'}
            </p>

            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <Lock size={18} className="text-red-400 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-black text-red-300 uppercase tracking-wider mb-2">
                    Required Access
                  </p>
                  {requireMasterAdmin ? (
                    <p className="text-sm text-white/70 font-medium">Master Admin Role</p>
                  ) : requiredPermission ? (
                    <ul className="space-y-1">
                      {(Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]).map(perm => (
                        <li key={perm} className="text-sm text-white/70 font-medium flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              {adminData && (
                <div className="pt-4 border-t border-red-500/20">
                  <p className="text-xs text-white/40 font-medium">
                    Logged in as: <span className="text-white/60 font-bold">{adminData.name}</span>
                  </p>
                  <p className="text-xs text-white/40 font-medium mt-1">
                    Role: <span className="text-white/60 font-bold">{adminData.role === 'MASTER_ADMIN' ? 'Master Admin' : 'Admin'}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="h-12 px-6 rounded-2xl bg-secondary text-white hover:bg-secondary/80 transition-all font-black text-[10px] uppercase tracking-[0.16em]"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => {
                  sessionStorage.removeItem('isAdmin')
                  sessionStorage.removeItem('adminData')
                  navigate('/admin/login')
                }}
                className="h-12 px-6 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-[0.16em]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Has permission
  return <>{children}</>
}

export default PermissionGuard
