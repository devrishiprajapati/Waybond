/** Simple localStorage-based auth helpers */

export interface WayBondUser {
    email: string
    name: string
}

export const getUser = (): WayBondUser | null => {
    try {
        const raw = localStorage.getItem('user')
        return raw ? (JSON.parse(raw) as WayBondUser) : null
    } catch {
        return null
    }
}

export const isLoggedIn = (): boolean => getUser() !== null

export const logout = (): void => localStorage.removeItem('user')
