/** Simple localStorage-based auth helpers */

export interface WayBondUser {
    id?: string
    email: string
    name: string
    role?: string
}

const USER_STORAGE_KEY = 'user'
const ADMIN_USER_ID = 'waybond-admin'

const isAdminUser = (user: WayBondUser): boolean => (
    user.role === 'ADMIN' || user.id === ADMIN_USER_ID
)

export const getUser = (): WayBondUser | null => {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY)
        if (!raw) return null
        const user = JSON.parse(raw) as WayBondUser
        if (isAdminUser(user)) {
            localStorage.removeItem(USER_STORAGE_KEY)
            return null
        }
        return user
    } catch {
        return null
    }
}

export const isLoggedIn = (): boolean => getUser() !== null

export const setUser = (user: WayBondUser): void => {
    if (isAdminUser(user)) return
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export const logout = (): void => {
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('userId')
    sessionStorage.removeItem('userEmail')
}

/**
 * Check if the currently logged-in user still exists in the database.
 * If not, automatically log them out. This prevents issues when the
 * database is reset but localStorage still has old user data.
 * 
 * Note: This makes a lightweight API call to verify the user exists.
 * If the endpoint returns 404, we know the user was deleted.
 */
export const validateUserSession = async (): Promise<boolean> => {
    const user = getUser()
    if (!user || !user.id) return false

    try {
        // Try to fetch the user's dashboard which checks if user exists
        const response = await fetch(`/api/users/${user.id}/dashboard`)
        if (response.status === 404) {
            // User no longer exists in database - log them out
            logout()
            return false
        }
        // For other errors (network, 500, etc.), assume session is still valid
        // to avoid logging out users unnecessarily
        return true
    } catch (error) {
        console.error('Error validating user session:', error)
        // On network error, assume session is still valid
        return true
    }
}
