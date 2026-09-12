/**
 * Utility functions for filtering past dates from trips
 */

import { parseDateOnly } from './date'

/**
 * Filters out past dates, keeping only today and future dates
 * @param dates Array of date strings
 * @returns Array of future date strings
 */
export function filterFutureDates(dates: string[]): string[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day for accurate comparison
  
  return dates.filter(date => {
    const dateObj = parseDateOnly(date)
    return dateObj && dateObj >= today
  })
}

/**
 * Gets the next available departure date for a trip
 * @param trip Trip object with nextBatch and/or departureDates
 * @returns The next available date or empty string
 */
export function getNextDepartureDate(trip: any): string {
  const dates = [
    trip.nextBatch,
    ...(Array.isArray(trip.departureDates) ? trip.departureDates : [])
  ]
  
  const validDates = Array.from(new Set(dates.map((date) => String(date || '').trim()).filter(Boolean)))
  const futureDates = filterFutureDates(validDates)
  
  return futureDates.sort()[0] || ''
}

/**
 * Gets all future departure options for a trip
 * @param trip Trip object with nextBatch and/or departureDates
 * @returns Array of future date strings sorted chronologically
 */
export function getDepartureOptions(trip: any): string[] {
  const dates = [
    trip.nextBatch,
    ...(Array.isArray(trip.departureDates) ? trip.departureDates : [])
  ]
  
  const validDates = Array.from(new Set(dates.map((date) => String(date || '').trim()).filter(Boolean)))
  const futureDates = filterFutureDates(validDates)
  
  return futureDates.sort()
}
