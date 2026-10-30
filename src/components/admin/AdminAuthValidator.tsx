import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAdmin, logoutAdmin, validateAdminSession } from '../../lib/adminAuth'

/**
 * Component that validates the admin session on mount and navigation.
 * If the admin in sessionStorage doesn't exist in the database anymore
 * (e.g., after being deleted or deactivated), this will automatically log them out.
 * 
 * Note: Persistent admins (master/legacy from environment variables) are never logged out.
 */
export const AdminAuthValidator = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const admin = getAdmin()

  useEffect(() => {
    const checkSession = async () => {
      // Only validate if admin is logged in
      if (!admin || !admin.id) return

      // Don't validate on login page
      if (location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname === '/') {
        return
      }

      // Persistent admins (master/legacy) don't need validation
      if (admin.isPersistent) {
        return
      }

      const isValid = await validateAdminSession()
      if (!isValid) {
        // Admin account no longer exists or is deactivated - redirect to login
        console.warn('Admin session invalid - logging out')
        const isAdminSubdomain = window.location.hostname.startsWith('admin.')
        const loginPath = isAdminSubdomain ? '/login' : '/admin/login'
        navigate(`${loginPath}?error=session_expired`, { replace: true })
      }
    }

    checkSession()
  }, [location.pathname, admin, navigate])

  // This component doesn't render anything
  return null
}

export default AdminAuthValidator
