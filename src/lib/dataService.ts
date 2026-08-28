import { ALL_TRIPS, Trip } from './trips'
import { heroSlides } from './data'

export interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

export interface TrendingCard {
  id?: number;
  image: string;
  badge: string;
  title: string;
  subtitle: string;
}

// Utility to optimize Unsplash images for performance
export const optimizeImageUrl = (url: string, width = 1200, quality = 80) => {
  if (url.includes('images.unsplash.com')) {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&q=${quality}&w=${width}`;
  }
  return url;
};

const HERO_STORAGE_KEY = 'waybond_hero'
const TRENDING_STORAGE_KEY = 'waybond_trending_cards'
const VERSION_KEY = 'waybond_version'
const CURRENT_VERSION = 6.0; // Increment this when making hardcoded data changes

// Sync logic: Clear stale cache if version mismatch
const syncData = () => {
  const savedVersion = localStorage.getItem(VERSION_KEY);
  if (!savedVersion || parseFloat(savedVersion) < CURRENT_VERSION) {
    console.log("Stale data detected. Syncing with fresh codebase...");
    localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(heroSlides));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
  }
}

syncData();

const notifyTripsUpdated = () => window.dispatchEvent(new Event('waybond:trips-updated'))

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit, timeout = 8000) => {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    window.clearTimeout(timer)
  }
}

export const getTrips = async (): Promise<Trip[]> => {
  const res = await fetchWithTimeout('/api/trips', undefined, 8000)
  if (!res.ok) throw new Error('Unable to load trips from the database.')
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('The database returned an invalid trips response.')
  return data
}

export const getTripById = async (id: number): Promise<Trip | undefined> => {
  const trips = await getTrips();
  return trips.find(t => t.id === id);
}

export const getAdminTrips = async (): Promise<Trip[]> => {
  const res = await fetchWithTimeout('/api/admin/trips', undefined, 8000)
  if (!res.ok) throw new Error('Unable to load admin trips from the database.')
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('The database returned an invalid admin trips response.')
  return data
}

export const getAdminTripById = async (id: number): Promise<Trip | undefined> => {
  const res = await fetchWithTimeout(`/api/admin/trips/${id}`, undefined, 8000)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error('Unable to load the package from the database.')
  return await res.json() as Trip
}

// Create a URL-friendly slug from trip title
export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Get trip by slug
export const getTripBySlug = async (slug: string): Promise<Trip | undefined> => {
  const trips = await getTrips();
  return trips.find(t => createSlug(t.title) === slug);
}

export const updateTrip = async (updatedTrip: Trip) => {
  const response = await fetchWithTimeout(`/api/trips/${updatedTrip.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTrip),
  }, 300_000) // 5 min — needed for large PDF payloads
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Unable to update the package in the database.')
  }
  const trip = await response.json() as Trip
  notifyTripsUpdated()
  return trip
}

export const addTrip = async (newTrip: Omit<Trip, 'id'>) => {
  const response = await fetchWithTimeout('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newTrip),
  }, 300_000) // 5 min — needed for large PDF payloads
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.message || 'Unable to save the package to the database.')
  }
  const trip = await response.json() as Trip
  notifyTripsUpdated()
  return trip
}

export const deleteTrip = async (id: number) => {
  const response = await fetchWithTimeout(`/api/trips/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Unable to delete the package from the database.')
  notifyTripsUpdated()
}

export const getHeroSlides = async (): Promise<HeroSlide[]> => {
  try {
    const res = await fetch('/api/heroSlides');
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) return data;
    }
  } catch (e) {
    console.warn("Backend not running. Using local storage/codebase.");
  }
  const localData = localStorage.getItem(HERO_STORAGE_KEY);
  return localData ? JSON.parse(localData) : heroSlides;
}

export const updateHeroSlides = async (slides: HeroSlide[]) => {
  try {
    await fetch('/api/heroSlides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slides),
    });
  } catch (e) { console.error(e); }
  localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(slides));
  // Ensure we mark this data as up-to-date with the current version
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION.toString());
}

const defaultTrendingCards = (): TrendingCard[] => ALL_TRIPS.slice(0, 6).map((trip) => ({
  id: trip.id,
  image: trip.image,
  badge: trip.experience,
  title: trip.title,
  subtitle: trip.location.split(',')[0]
}))

export const getTrendingCards = async (): Promise<TrendingCard[]> => {
  try {
    const response = await fetch('/api/trending-cards')
    if (response.ok) {
      const cards = await response.json()
      if (Array.isArray(cards) && cards.length > 0) return cards
    }
  } catch {
    // Static builds keep the last saved cards in local storage.
  }

  try {
    const savedCards = JSON.parse(localStorage.getItem(TRENDING_STORAGE_KEY) || '[]')
    if (Array.isArray(savedCards) && savedCards.length > 0) return savedCards
  } catch {
    // Fall through to starter cards.
  }
  return defaultTrendingCards()
}

export const updateTrendingCards = async (cards: TrendingCard[]): Promise<void> => {
  const response = await fetch('/api/trending-cards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cards.map(({ id, ...card }) => card))
  })
  if (!response.ok) throw new Error('Unable to save Trending Adventures.')
  localStorage.setItem(TRENDING_STORAGE_KEY, JSON.stringify(cards))
}
