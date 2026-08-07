import { useState, useEffect } from 'react'

const WISHLIST_STORAGE_KEY = 'waybond_wishlist'

export interface WishlistItem {
  id: number
  title: string
  image: string
  price: string
  duration: string
  location: string
  description: string
  category: string
  experience: string
  addedAt: string
}

// Get wishlist from localStorage
export const getWishlist = (): WishlistItem[] => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load wishlist:', error)
    return []
  }
}

// Save wishlist to localStorage
const saveWishlist = (wishlist: WishlistItem[]): void => {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('waybond:wishlist-updated', { detail: wishlist }))
  } catch (error) {
    console.error('Failed to save wishlist:', error)
  }
}

// Add item to wishlist
export const addToWishlist = (trip: any): boolean => {
  try {
    const wishlist = getWishlist()
    
    // Check if already in wishlist
    if (wishlist.some(item => item.id === trip.id)) {
      return false
    }

    const newItem: WishlistItem = {
      id: trip.id,
      title: trip.title,
      image: trip.image,
      price: trip.price,
      duration: trip.duration,
      location: trip.location,
      description: trip.description,
      category: trip.category,
      experience: trip.experience,
      addedAt: new Date().toISOString()
    }

    const updatedWishlist = [...wishlist, newItem]
    saveWishlist(updatedWishlist)
    return true
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    return false
  }
}

// Remove item from wishlist
export const removeFromWishlist = (tripId: number): boolean => {
  try {
    const wishlist = getWishlist()
    const updatedWishlist = wishlist.filter(item => item.id !== tripId)
    saveWishlist(updatedWishlist)
    return true
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    return false
  }
}

// Check if item is in wishlist
export const isInWishlist = (tripId: number): boolean => {
  const wishlist = getWishlist()
  return wishlist.some(item => item.id === tripId)
}

// Toggle wishlist status
export const toggleWishlist = (trip: any): boolean => {
  if (isInWishlist(trip.id)) {
    removeFromWishlist(trip.id)
    return false
  } else {
    addToWishlist(trip)
    return true
  }
}

// Custom hook for wishlist
export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load initial wishlist
    setWishlist(getWishlist())
    setIsLoading(false)

    // Listen for wishlist updates
    const handleWishlistUpdate = (event: CustomEvent) => {
      setWishlist(event.detail)
    }

    window.addEventListener('waybond:wishlist-updated', handleWishlistUpdate as EventListener)

    return () => {
      window.removeEventListener('waybond:wishlist-updated', handleWishlistUpdate as EventListener)
    }
  }, [])

  const add = (trip: any) => {
    const added = addToWishlist(trip)
    if (added) {
      setWishlist(getWishlist())
    }
    return added
  }

  const remove = (tripId: number) => {
    const removed = removeFromWishlist(tripId)
    if (removed) {
      setWishlist(getWishlist())
    }
    return removed
  }

  const toggle = (trip: any) => {
    const isNowInWishlist = toggleWishlist(trip)
    setWishlist(getWishlist())
    return isNowInWishlist
  }

  const isInList = (tripId: number) => {
    return wishlist.some(item => item.id === tripId)
  }

  return {
    wishlist,
    isLoading,
    add,
    remove,
    toggle,
    isInList,
    count: wishlist.length
  }
}
