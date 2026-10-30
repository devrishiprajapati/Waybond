import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getUser, logout, validateUserSession } from '../lib/auth'

/**
 * Component that validates the user session on mount and navigation.
 * If the user in localStorage doesn't exist in the database anymore
 * (e.g., after a database reset), this will automatically log them out
 * and redirect to the login page.
 */
export const AuthValidator = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()

  useEffect(() => {
    const checkSession = async () => {
      // Only validate if user is logged in
      if (!user || !user.id) return

      // Don't validate on login/signup pages or home page
      const publicPaths = ['/login', '/signup', '/']
      if (publicPaths.some(path => location.pathname === path)) return

      // Only validate when navigating to dashboard or booking pages
      // This prevents unnecessary API calls on every page navigation
      const needsValidation = location.pathname.includes('/dashboard') || 
                             location.pathname.includes('/booking')
      
      if (!needsValidation) return

      const isValid = await validateUserSession()
      if (!isValid) {
        // User no longer exists - redirect to login with message
        console.warn('User session invalid - logging out')
        navigate('/login?error=session_expired', { replace: true })
      }
    }

    checkSession()
  }, [location.pathname, user, navigate])

  // This component doesn't render anything
  return null
}

export default AuthValidator
