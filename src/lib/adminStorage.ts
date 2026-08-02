export type ManagedTestimonial = {
  id: string | number
  name: string
  email?: string
  trip: string
  review: string
  rating: number
  createdAt?: string
  source: 'published' | 'dashboard' | 'starter'
}

export type RegisteredUser = {
  id: string
  name: string
  email: string
  joinedAt: string
  lastLoginAt: string
}

const PUBLIC_TESTIMONIALS_KEY = 'waybond_testimonials'
const DASHBOARD_TESTIMONIALS_KEY = 'waybond_user_testimonials'
const USERS_KEY = 'waybond_users'
const HIDDEN_TESTIMONIALS_KEY = 'waybond_hidden_testimonial_ids'

const readList = <T,>(key: string): T[] => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

const writeList = <T,>(key: string, value: T[]) => localStorage.setItem(key, JSON.stringify(value))

const normalizeTestimonial = (testimonial: any, source: ManagedTestimonial['source'] = 'published'): ManagedTestimonial => ({
  id: testimonial.id,
  name: testimonial.name || testimonial.userName || 'WayBond traveller',
  email: testimonial.email,
  trip: testimonial.trip || testimonial.tripTitle || 'WayBond Trip',
  review: testimonial.review || testimonial.text || '',
  rating: Number(testimonial.rating || 0),
  createdAt: testimonial.createdAt,
  source
})

export const getHiddenTestimonialIds = (): Array<string | number> => readList(HIDDEN_TESTIMONIALS_KEY)

export const isTestimonialHidden = (id: string | number): boolean =>
  getHiddenTestimonialIds().some((hiddenId) => String(hiddenId) === String(id))

export const getManagedTestimonials = async (): Promise<ManagedTestimonial[]> => {
  let apiTestimonials: any[] = []
  let apiAvailable = false
  try {
    const response = await fetch('/api/testimonials')
    if (response.ok) {
      apiTestimonials = await response.json()
      apiAvailable = true
    }
  } catch {
    // The static deployment uses local storage as its data source.
  }

  const published = apiAvailable ? apiTestimonials : readList<any>(PUBLIC_TESTIMONIALS_KEY)
  const dashboard = apiAvailable ? [] : readList<any>(DASHBOARD_TESTIMONIALS_KEY)
  const hiddenIds = getHiddenTestimonialIds()
  const seen = new Set<string>()

  return [...published.map((item) => normalizeTestimonial(item)), ...dashboard.map((item) => normalizeTestimonial(item, 'dashboard'))]
    .filter((item) => !hiddenIds.some((hiddenId) => String(hiddenId) === String(item.id)))
    .filter((item) => {
      const key = `${item.source}-${item.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
}

export const deleteManagedTestimonial = async (testimonial: ManagedTestimonial): Promise<void> => {
  if (testimonial.source === 'published') {
    try {
      await fetch(`/api/testimonials/${testimonial.id}`, { method: 'DELETE' })
    } catch {
      // Keep the local deletion path available for static hosting.
    }
  }

  writeList(PUBLIC_TESTIMONIALS_KEY, readList<any>(PUBLIC_TESTIMONIALS_KEY).filter((item) => String(item.id) !== String(testimonial.id)))
  writeList(DASHBOARD_TESTIMONIALS_KEY, readList<any>(DASHBOARD_TESTIMONIALS_KEY).filter((item) => String(item.id) !== String(testimonial.id)))

  const hiddenIds = getHiddenTestimonialIds()
  if (!hiddenIds.some((id) => String(id) === String(testimonial.id))) {
    writeList(HIDDEN_TESTIMONIALS_KEY, [...hiddenIds, testimonial.id])
  }
}

export const updateManagedTestimonial = async (
  testimonial: ManagedTestimonial,
  updates: Pick<ManagedTestimonial, 'name' | 'trip' | 'review' | 'rating'>
): Promise<ManagedTestimonial> => {
  const normalizedUpdates = {
    name: updates.name.trim(),
    trip: updates.trip.trim(),
    review: updates.review.trim(),
    rating: Math.min(5, Math.max(1, Number(updates.rating)))
  }

  if (testimonial.source === 'published') {
    const response = await fetch(`/api/testimonials/${testimonial.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedUpdates)
    })
    if (response.ok) return normalizeTestimonial(await response.json())
  }

  const key = testimonial.source === 'dashboard' ? DASHBOARD_TESTIMONIALS_KEY : PUBLIC_TESTIMONIALS_KEY
  writeList(key, readList<any>(key).map((item) =>
    String(item.id) === String(testimonial.id) ? { ...item, ...normalizedUpdates } : item
  ))
  return { ...testimonial, ...normalizedUpdates }
}

export const registerUser = (user: { name?: string; email: string }): RegisteredUser => {
  const users = readList<RegisteredUser>(USERS_KEY)
  const email = user.email.trim().toLowerCase()
  const now = new Date().toISOString()
  const existingIndex = users.findIndex((item) => item.email.toLowerCase() === email)
  const existing = users[existingIndex]
  const nextUser: RegisteredUser = {
    id: existing?.id || `user-${Date.now()}`,
    name: user.name?.trim() || existing?.name || email.split('@')[0],
    email,
    joinedAt: existing?.joinedAt || now,
    lastLoginAt: now
  }

  if (existingIndex >= 0) users[existingIndex] = nextUser
  else users.unshift(nextUser)
  writeList(USERS_KEY, users)
  return nextUser
}

export const getRegisteredUsers = (): RegisteredUser[] => readList<RegisteredUser>(USERS_KEY)

export const getAllRegisteredUsers = async (): Promise<RegisteredUser[]> => {
  try {
    const response = await fetch('/api/users')
    if (response.ok) return await response.json()
  } catch {
    // Static hosting continues with the local user registry.
  }

  return getRegisteredUsers().sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime())
}
