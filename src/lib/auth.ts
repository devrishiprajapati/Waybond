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

export const logout = (): void => localStorage.removeItem(USER_STORAGE_KEY)
