/** Admin authentication helpers - stores admin session in sessionStorage */

export interface AdminUser {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MASTER_ADMIN'
    permissions: string[]
    isPersistent?: boolean // Master/Legacy admin that can't be deleted
}

const ADMIN_STORAGE_KEY = 'adminData'
const ADMIN_FLAG_KEY = 'isAdmin'

export const getAdmin = (): AdminUser | null => {
    try {
        const isAdmin = sessionStorage.getItem(ADMIN_FLAG_KEY)
        if (isAdmin !== 'true') return null

        const raw = sessionStorage.getItem(ADMIN_STORAGE_KEY)
        if (!raw) return null

        const admin = JSON.parse(raw) as AdminUser
        return admin
    } catch {
        return null
    }
}

export const isAdminLoggedIn = (): boolean => getAdmin() !== null

export const setAdmin = (admin: AdminUser): void => {
    sessionStorage.setItem(ADMIN_FLAG_KEY, 'true')
    sessionStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin))
}

export const logoutAdmin = (): void => {
    sessionStorage.removeItem(ADMIN_FLAG_KEY)
    sessionStorage.removeItem(ADMIN_STORAGE_KEY)
}

/**
 * Check if the currently logged-in admin still exists and is active.
 * Persistent admins (master/legacy) always pass validation.
 * Database admins are checked against the API.
 */
export const validateAdminSession = async (): Promise<boolean> => {
    const admin = getAdmin()
    if (!admin || !admin.id) return false

    // Persistent admins (master/legacy) are always valid
    if (admin.isPersistent) {
        return true
    }

    try {
        const response = await fetch(`/api/auth/admin/validate?adminId=${admin.id}`)
        if (!response.ok) {
            // Admin no longer exists or is deactivated - log them out
            logoutAdmin()
            return false
        }
        
        const data = await response.json()
        return data.valid === true
    } catch (error) {
        console.error('Error validating admin session:', error)
        // On network error, assume session is still valid
        return true
    }
}

/**
 * Check if admin has a specific permission
 */
export const hasPermission = (permission: string): boolean => {
    const admin = getAdmin()
    if (!admin) return false
    
    // Master admin has all permissions
    if (admin.role === 'MASTER_ADMIN') return true
    
    return admin.permissions.includes(permission)
}

/**
 * Check if admin has any of the specified permissions
 */
export const hasAnyPermission = (permissions: string[]): boolean => {
    const admin = getAdmin()
    if (!admin) return false
    
    // Master admin has all permissions
    if (admin.role === 'MASTER_ADMIN') return true
    
    return permissions.some(permission => admin.permissions.includes(permission))
}
