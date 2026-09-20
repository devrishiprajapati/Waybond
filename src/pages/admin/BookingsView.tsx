import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Download, Users, Search, MapPin, Edit2, Save, X, CreditCard, User, MessageCircle, Clock, History } from 'lucide-react'

type ChangeLog = {
  timestamp: string
  changedBy: string
  changedByRole?: string
  changeType: string
  field?: string
  oldValue?: string
  newValue?: string
}

type TravellerDetail = {
  name?: string
  gender?: string
  dob?: string
  dateOfBirth?: string
  age?: string
  phone?: string
  emergencyContact?: string
  email?: string
  city?: string
  state?: string
  isEligible?: boolean
  bookedBy?: string
  lastModifiedBy?: string
  lastModifiedAt?: string
}

type Booking = {
  bookingId: string
  customerName: string
  customerEmail: string
  tripName: string
  location: string
  travelers: number
  price: number
  total: number
  status: string
  paymentStatus: string
  bookingDate: string
  joinOrigin?: string
  departureDate?: string
  travellerDetails?: TravellerDetail[]
  whatsappGroupLink?: string
  lastModifiedBy?: string
  lastModifiedAt?: string
  changeLog?: ChangeLog[]
}

type BookingsViewProps = {
  bookings: Booking[]
  onBookingUpdate?: () => void
}

type GroupedBookings = {
  [tripName: string]: {
    [joinLocation: string]: {
      [date: string]: Booking[]
    }
  }
}

const BookingsView: React.FC<BookingsViewProps> = ({ bookings: initialBookings, onBookingUpdate }) => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set())
  const [expandedJoinLocations, setExpandedJoinLocations] = useState<Set<string>>(new Set())
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [expandedParticipants, setExpandedParticipants] = useState<Set<string>>(new Set())
  const [expandedChangeLogs, setExpandedChangeLogs] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [editingParticipant, setEditingParticipant] = useState<{ bookingId: string; index: number } | null>(null)
  const [editedData, setEditedData] = useState<TravellerDetail | null>(null)
  const [editingWhatsAppLink, setEditingWhatsAppLink] = useState<string | null>(null)
  const [whatsappLinkInput, setWhatsappLinkInput] = useState<string>('')
  const [saving, setSaving] = useState(false)

  // Update bookings when prop changes
  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  // Get current admin user from localStorage or context
  const getCurrentUser = () => {
    try {
      const adminDataStr = sessionStorage.getItem('adminData')
      if (adminDataStr) {
        const adminData = JSON.parse(adminDataStr)
        const name = adminData.name || adminData.email || 'Admin'
        const role = adminData.role || 'ADMIN'
        return { name, role, isMaster: role === 'MASTER_ADMIN' }
      }
    } catch (error) {
      console.error('Error getting current user:', error)
    }
    return { name: 'Admin', role: 'ADMIN', isMaster: false }
  }

  const toggleChangeLog = (bookingId: string) => {
    const newExpanded = new Set(expandedChangeLogs)
    newExpanded.has(bookingId) ? newExpanded.delete(bookingId) : newExpanded.add(bookingId)
    setExpandedChangeLogs(newExpanded)
  }

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return dateString
    }
  }

  const formatRole = (role: string): string => {
    if (!role) return 'Admin'
    if (role === 'MASTER_ADMIN') return 'Master Admin'
    if (role === 'ADMIN') return 'Admin'
    // Handle other roles with proper formatting
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  const getInitials = (name: string): string => {
    if (!name) return '?'
    const words = name.trim().split(' ')
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
  }

  // Parse field changes from old and new values
  const parseFieldChanges = (oldValue?: string, newValue?: string) => {
    if (!oldValue || !newValue) return []
    
    try {
      const oldData = JSON.parse(oldValue)
      const newData = JSON.parse(newValue)
      const changes: { field: string; oldVal: string; newVal: string }[] = []
      
      // Field labels mapping
      const fieldLabels: Record<string, string> = {
        name: 'Name',
        gender: 'Gender',
        age: 'Age',
        phone: 'Phone',
        email: 'Email',
        city: 'City',
        state: 'State',
        emergencyContact: 'Emergency Contact',
        dob: 'Date of Birth',
        dateOfBirth: 'Date of Birth'
      }
      
      // Compare all fields
      const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
      
      allKeys.forEach(key => {
        // Skip internal fields
        if (['bookedBy', 'lastModifiedBy', 'lastModifiedAt', 'isEligible'].includes(key)) return
        
        const oldVal = oldData[key]
        const newVal = newData[key]
        
        // Only show if value actually changed
        if (oldVal !== newVal) {
          changes.push({
            field: fieldLabels[key] || key,
            oldVal: oldVal || '(empty)',
            newVal: newVal || '(empty)'
          })
        }
      })
      
      return changes
    } catch (error) {
      console.error('Error parsing field changes:', error)
      return []
    }
  }

  // Download CSV function
  const downloadCSV = (data: Booking[], filename: string) => {
    const headers = [
      'Booking ID',
      'Trip Name',
      'Location',
      'Pickup Point',
      'Departure Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Travelers',
      'Price per Person',
      'Total Amount',
      'Status',
      'Payment Status',
      'Booking Date',
      'WhatsApp Group',
      'Participant Name',
      'Participant Gender',
      'Participant Age',
      'Participant Phone',
      'Participant Email',
      'Participant City',
      'Participant State',
      'Emergency Contact'
    ]

    const rows: string[][] = []
    
    data.forEach(booking => {
      if (booking.travellerDetails && booking.travellerDetails.length > 0) {
        // Create a row for each participant
        booking.travellerDetails.forEach(traveller => {
          rows.push([
            booking.bookingId,
            booking.tripName,
            booking.location,
            booking.joinOrigin || 'Not specified',
            booking.departureDate || 'Not specified',
            booking.customerName,
            booking.customerEmail || 'N/A',
            traveller.phone || 'N/A',
            booking.travelers.toString(),
            booking.price.toString(),
            booking.total.toString(),
            booking.status,
            booking.paymentStatus || 'N/A',
            booking.bookingDate,
            booking.whatsappGroupLink || 'Not set',
            traveller.name || 'N/A',
            traveller.gender || 'N/A',
            traveller.age || 'N/A',
            traveller.phone || 'N/A',
            traveller.email || 'N/A',
            traveller.city || 'N/A',
            traveller.state || 'N/A',
            traveller.emergencyContact || 'N/A'
          ])
        })
      } else {
        // Single row if no traveller details
        rows.push([
          booking.bookingId,
          booking.tripName,
          booking.location,
          booking.joinOrigin || 'Not specified',
          booking.departureDate || 'Not specified',
          booking.customerName,
          booking.customerEmail || 'N/A',
          'N/A',
          booking.travelers.toString(),
          booking.price.toString(),
          booking.total.toString(),
          booking.status,
          booking.paymentStatus || 'N/A',
          booking.bookingDate,
          booking.whatsappGroupLink || 'Not set',
          'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'
        ])
      }
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadTrip = (tripName: string) => {
    const tripBookings = filteredBookings.filter(b => b.tripName === tripName)
    const filename = `${tripName.replace(/\s+/g, '_')}_All_Bookings_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(tripBookings, filename)
  }

  const handleDownloadByPickup = (tripName: string, pickupPoint: string) => {
    const pickupBookings = filteredBookings.filter(
      b => b.tripName === tripName && (b.joinOrigin || 'No pickup point specified') === pickupPoint
    )
    const filename = `${tripName.replace(/\s+/g, '_')}_${pickupPoint.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(pickupBookings, filename)
  }

  const handleDownloadByDate = (tripName: string, pickupPoint: string, date: string) => {
    const dateBookings = filteredBookings.filter(
      b => b.tripName === tripName && 
           (b.joinOrigin || 'No pickup point specified') === pickupPoint &&
           (b.departureDate || b.bookingDate) === date
    )
    const filename = `${tripName.replace(/\s+/g, '_')}_${pickupPoint.replace(/\s+/g, '_')}_${date}_${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(dateBookings, filename)
  }

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const customerState = booking.travellerDetails?.[0]?.state || ''
    const joinLocation = booking.joinOrigin || 'No pickup point specified'
    return (
      booking.tripName.toLowerCase().includes(query) ||
      booking.location.toLowerCase().includes(query) ||
      booking.customerName.toLowerCase().includes(query) ||
      booking.bookingId.toLowerCase().includes(query) ||
      customerState.toLowerCase().includes(query) ||
      joinLocation.toLowerCase().includes(query)
    )
  })

  const groupedBookings: GroupedBookings = filteredBookings.reduce((acc, booking) => {
    const tripName = booking.tripName
    const groupKey = booking.joinOrigin || 'No pickup point specified'
    const date = booking.departureDate || booking.bookingDate
    
    if (!acc[tripName]) acc[tripName] = {}
    if (!acc[tripName][groupKey]) acc[tripName][groupKey] = {}
    if (!acc[tripName][groupKey][date]) acc[tripName][groupKey][date] = []
    acc[tripName][groupKey][date].push(booking)
    
    return acc
  }, {} as GroupedBookings)

  const toggleTrip = (tripName: string) => {
    const newExpanded = new Set(expandedTrips)
    newExpanded.has(tripName) ? newExpanded.delete(tripName) : newExpanded.add(tripName)
    setExpandedTrips(newExpanded)
  }

  const toggleJoinLocation = (locationKey: string) => {
    const newExpanded = new Set(expandedJoinLocations)
    newExpanded.has(locationKey) ? newExpanded.delete(locationKey) : newExpanded.add(locationKey)
    setExpandedJoinLocations(newExpanded)
  }

  const toggleDate = (dateKey: string) => {
    const newExpanded = new Set(expandedDates)
    newExpanded.has(dateKey) ? newExpanded.delete(dateKey) : newExpanded.add(dateKey)
    setExpandedDates(newExpanded)
  }

  const toggleParticipants = (bookingId: string) => {
    const newExpanded = new Set(expandedParticipants)
    newExpanded.has(bookingId) ? newExpanded.delete(bookingId) : newExpanded.add(bookingId)
    setExpandedParticipants(newExpanded)
  }

  const handleEditParticipant = (bookingId: string, index: number, traveller: TravellerDetail) => {
    setEditingParticipant({ bookingId, index })
    setEditedData({ ...traveller })
  }

  const handleSaveParticipant = async (booking: Booking, index: number) => {
    if (!editedData) return
    setSaving(true)
    try {
      const updatedTravellerDetails = [...(booking.travellerDetails || [])]
      const currentUser = getCurrentUser()
      const timestamp = new Date().toISOString()
      
      // Add modification tracking to participant
      if (!editedData.bookedBy) editedData.bookedBy = getInitials(booking.customerName)
      editedData.lastModifiedBy = currentUser.name
      editedData.lastModifiedAt = timestamp
      
      updatedTravellerDetails[index] = editedData

      // Create change log entry
      const oldData = booking.travellerDetails?.[index]
      const changeLog: ChangeLog = {
        timestamp,
        changedBy: currentUser.name,
        changedByRole: currentUser.role,
        changeType: 'Participant Updated',
        field: `Participant ${index + 1} (${editedData.name || 'Unnamed'})`,
        oldValue: JSON.stringify(oldData),
        newValue: JSON.stringify(editedData)
      }

      const existingChangeLogs = Array.isArray(booking.changeLog) ? booking.changeLog : []

      const requestBody = { 
        travellerDetails: updatedTravellerDetails,
        lastModifiedBy: currentUser.name,
        lastModifiedAt: timestamp,
        changeLog: [...existingChangeLogs, changeLog]
      }
      
      console.log('💾 Saving booking update...')

      const response = await fetch(`/api/admin/bookings/${booking.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) throw new Error('Failed to update participant')
      
      const responseData = await response.json()
      console.log('✅ Saved! Change logs:', responseData.changeLog?.length || 0)
      
      // Update the bookings state with the new data
      setBookings(prevBookings => {
        const updated = prevBookings.map(b => 
          b.bookingId === booking.bookingId 
            ? { ...b, ...responseData } 
            : b
        )
        
        // Check if update worked
        const updatedBooking = updated.find(b => b.bookingId === booking.bookingId)
        console.log('📊 Updated booking changeLog count:', updatedBooking?.changeLog?.length || 0)
        
        return updated
      })
      
      setEditingParticipant(null)
      setEditedData(null)
      
      // Optionally notify parent component (but don't reload)
      if (onBookingUpdate) {
        onBookingUpdate()
      }
    } catch (error) {
      console.error('❌ Error saving participant:', error)
      alert('Failed to update participant')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveWhatsAppLink = async (bookingsArray: Booking[], dateKey: string) => {
    if (!whatsappLinkInput.trim()) {
      alert('Please enter a valid WhatsApp group link')
      return
    }
    
    setSaving(true)
    try {
      console.log('Updating WhatsApp link for bookings:', bookingsArray.map(b => b.bookingId))
      console.log('WhatsApp link:', whatsappLinkInput.trim())
      
      // Update all bookings in this date group
      const updatePromises = bookingsArray.map(async (booking) => {
        const response = await fetch(`/api/admin/bookings/${booking.bookingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ whatsappGroupLink: whatsappLinkInput.trim() })
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Failed to update booking ${booking.bookingId}:`, errorText)
          throw new Error(`Failed to update booking ${booking.bookingId}`)
        }
        
        return response.json()
      })
      
      await Promise.all(updatePromises)
      
      alert(`WhatsApp group link updated for ${bookingsArray.length} booking(s)`)
      setEditingWhatsAppLink(null)
      setWhatsappLinkInput('')
      onBookingUpdate ? onBookingUpdate() : window.location.reload()
    } catch (error) {
      console.error('Error updating WhatsApp link:', error)
      alert(`Failed to update WhatsApp group link: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleEditWhatsAppLink = (dateKey: string, currentLink: string) => {
    setEditingWhatsAppLink(dateKey)
    setWhatsappLinkInput(currentLink || '')
  }

  const updateEditedField = (field: keyof TravellerDetail, value: string) => {
    if (editedData) setEditedData({ ...editedData, [field]: value })
  }

  const getTotalBookingsForTrip = (tripName: string) => {
    return Object.values(groupedBookings[tripName] || {}).reduce(
      (sum, locations) => sum + Object.values(locations).reduce(
        (locSum, bookingsArray) => locSum + bookingsArray.length, 0
      ), 0
    )
  }

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'Confirmed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
      'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200',
      'Payment Pending': 'bg-orange-50 text-orange-700 border-orange-200'
    }
    return styles[status] || 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const getPaymentMethodStyle = (method: string) => {
    const styles: Record<string, string> = {
      'Online': 'bg-blue-50 text-blue-700',
      'Cash': 'bg-purple-50 text-purple-700',
      'Credit Card': 'bg-indigo-50 text-indigo-700',
      'Debit Card': 'bg-cyan-50 text-cyan-700',
      'UPI': 'bg-green-50 text-green-700',
      'Bank Transfer': 'bg-teal-50 text-teal-700'
    }
    return styles[method] || 'bg-gray-50 text-gray-700'
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredBookings.length}</span> of {bookings.length} bookings
        </p>
      </div>

      {/* Bookings List */}
      {Object.keys(groupedBookings).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <p className="text-lg font-semibold text-gray-500">No bookings found</p>
          {searchQuery && <p className="text-sm text-gray-400 mt-2">Try adjusting your search</p>}
        </div>
      ) : (
        Object.entries(groupedBookings).map(([tripName, locationGroups]) => {
          const totalBookings = getTotalBookingsForTrip(tripName)
          const isExpanded = expandedTrips.has(tripName)

          return (
            <div key={tripName} className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Trip Header */}
              <div
                onClick={() => toggleTrip(tripName)}
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button className="text-gray-600 hover:text-gray-900">
                    {isExpanded ? <ChevronDown size={22} /> : <ChevronRight size={22} />}
                  </button>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{tripName}</h3>
                    <p className="text-sm text-gray-500 font-medium">{totalBookings} total bookings</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownloadTrip(tripName)
                  }}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors group"
                  title="Download all bookings for this trip"
                >
                  <Download size={20} className="text-blue-600 group-hover:text-blue-700" />
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t-2 border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                  {Object.entries(locationGroups).map(([joinLocation, dateGroups]) => {
                    const locationKey = `${tripName}-${joinLocation}`
                    const isLocationExpanded = expandedJoinLocations.has(locationKey)
                    const locationBookingCount = Object.values(dateGroups).reduce(
                      (sum, bookings) => sum + bookings.length, 0
                    )

                    return (
                      <div key={locationKey} className="border-b border-gray-200 last:border-b-0">
                        {/* Location Header */}
                        <div
                          onClick={() => toggleJoinLocation(locationKey)}
                          className="flex items-center gap-3 px-8 py-3.5 bg-gray-100 cursor-pointer hover:bg-gray-150 transition-colors"
                        >
                          <button className="text-gray-600">
                            {isLocationExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </button>
                          <div className="flex items-center gap-3 flex-1">
                            <MapPin size={18} className="text-green-600" />
                            <div>
                              <p className="text-sm font-bold text-gray-800">{joinLocation}</p>
                              <p className="text-xs text-gray-500 font-medium">{locationBookingCount} bookings</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadByPickup(tripName, joinLocation)
                            }}
                            className="p-1.5 hover:bg-green-200 rounded-lg transition-colors group"
                            title="Download bookings for this pickup point"
                          >
                            <Download size={18} className="text-green-600 group-hover:text-green-700" />
                          </button>
                        </div>

                        {/* Date Groups */}
                        {isLocationExpanded && (
                          <div className="bg-white">
                            {Object.entries(dateGroups).map(([date, bookingsArray]) => {
                              const dateKey = `${locationKey}-${date}`
                              const isDateExpanded = expandedDates.has(dateKey)
                              const isEditingWhatsAppForThis = editingWhatsAppLink === dateKey
                              const currentWhatsAppLink = bookingsArray[0]?.whatsappGroupLink || ''

                              return (
                                <div key={dateKey} className="border-b border-gray-100 last:border-b-0">
                                  {/* Date Header */}
                                  <div className="px-10 py-3 bg-gray-50">
                                    <div 
                                      className="flex items-center gap-3 mb-2 cursor-pointer hover:bg-gray-100 -mx-2 px-2 py-1 rounded-lg transition-colors"
                                      onClick={() => toggleDate(dateKey)}
                                    >
                                      <div className="text-gray-600">
                                        {isDateExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                      </div>
                                      <div className="flex items-center gap-4 flex-1">
                                        <p className="text-sm font-bold text-gray-700">{date}</p>
                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full font-semibold">
                                          {bookingsArray.length} {bookingsArray.length === 1 ? 'booking' : 'bookings'}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDownloadByDate(tripName, joinLocation, date)
                                        }}
                                        className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors group"
                                        title="Download bookings for this date"
                                      >
                                        <Download size={16} className="text-purple-600 group-hover:text-purple-700" />
                                      </button>
                                    </div>
                                    
                                    {/* WhatsApp Group Link Section */}
                                    <div className="ml-9 mt-2">
                                      {isEditingWhatsAppForThis ? (
                                        <div className="flex items-center gap-2 bg-green-50 border-2 border-green-300 rounded-lg p-2">
                                          <MessageCircle size={16} className="text-green-600" />
                                          <input
                                            type="text"
                                            value={whatsappLinkInput}
                                            onChange={(e) => setWhatsappLinkInput(e.target.value)}
                                            placeholder="Enter WhatsApp group invite link"
                                            className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleSaveWhatsAppLink(bookingsArray, dateKey)
                                            }}
                                            disabled={saving}
                                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                          >
                                            <Save size={12} /> Save
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setEditingWhatsAppLink(null)
                                              setWhatsappLinkInput('')
                                            }}
                                            disabled={saving}
                                            className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 disabled:opacity-50"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2">
                                          <MessageCircle size={14} className="text-green-600" />
                                          {currentWhatsAppLink ? (
                                            <a
                                              href={currentWhatsAppLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-green-600 font-semibold hover:underline flex-1 truncate"
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              {currentWhatsAppLink}
                                            </a>
                                          ) : (
                                            <span className="text-xs text-gray-400 italic flex-1">No WhatsApp group link set</span>
                                          )}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleEditWhatsAppLink(dateKey, currentWhatsAppLink)
                                            }}
                                            className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded-lg font-semibold flex items-center gap-1"
                                          >
                                            <Edit2 size={12} /> {currentWhatsAppLink ? 'Edit' : 'Add'} Link
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Bookings */}
                                  {isDateExpanded && (
                                    <div className="bg-white divide-y divide-gray-100">
                                      {bookingsArray.map((booking) => {
                                        const bookedByInitials = getInitials(booking.customerName)

                                        return (
                                          <div key={booking.bookingId} className="px-12 py-5 hover:bg-gray-50 transition-colors">
                                            {/* Booking Header */}
                                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg font-semibold">
                                                    {booking.bookingId}
                                                  </span>
                                                  <span className="text-xs text-gray-400">•</span>
                                                  <span className="text-sm font-bold text-gray-600">
                                                    {booking.travelers} {booking.travelers === 1 ? 'participant' : 'participants'}
                                                  </span>
                                                  
                                                  {/* Change Log Button */}
                                                  {booking.changeLog && booking.changeLog.length > 0 && (
                                                    <>
                                                      <span className="text-xs text-gray-400">•</span>
                                                      <button
                                                        onClick={() => toggleChangeLog(booking.bookingId)}
                                                        className="inline-flex items-center gap-1.5 text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 font-semibold hover:bg-purple-100 transition-colors"
                                                      >
                                                        <History size={12} />
                                                        {booking.changeLog.length} {booking.changeLog.length === 1 ? 'change' : 'changes'}
                                                      </button>
                                                    </>
                                                  )}
                                                </div>

                                                <p className="text-lg font-bold text-gray-900 mb-1">{booking.customerName}</p>
                                                {booking.customerEmail && booking.customerEmail !== 'N/A' && (
                                                  <p className="text-sm text-gray-600 mb-2">{booking.customerEmail}</p>
                                                )}

                                                {/* Last Modified Info */}
                                                {booking.lastModifiedBy && booking.lastModifiedAt && (
                                                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 inline-flex">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span>
                                                      Last modified by <span className="font-bold text-gray-700">{booking.lastModifiedBy}</span>
                                                      {' '}on {formatDateTime(booking.lastModifiedAt)}
                                                    </span>
                                                  </div>
                                                )}

                                                {booking.joinOrigin && (
                                                  <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 font-semibold mt-2">
                                                    <MapPin size={12} />
                                                    Pickup: {booking.joinOrigin}
                                                  </span>
                                                )}
                                              </div>

                                              <div className="flex flex-col items-end gap-3">
                                                <div className="text-right">
                                                  <p className="text-2xl font-black text-gray-900">
                                                    ₹{booking.total.toLocaleString('en-IN')}
                                                  </p>
                                                  <p className="text-xs text-gray-500 font-medium">
                                                    ₹{booking.price.toLocaleString('en-IN')} × {booking.travelers}
                                                  </p>
                                                </div>
                                                
                                                <div className="flex flex-col gap-2 items-end">
                                                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getStatusStyle(booking.status)}`}>
                                                    {booking.status}
                                                  </span>
                                                  {booking.paymentStatus && (
                                                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getPaymentMethodStyle(booking.paymentStatus)}`}>
                                                      {booking.paymentStatus}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Participants Section */}
                                            {booking.travellerDetails && booking.travellerDetails.length > 0 && (
                                              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                                <button
                                                  onClick={() => toggleParticipants(booking.bookingId)}
                                                  className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-blue-600 transition-colors mb-3"
                                                >
                                                  <Users size={18} className="text-gray-500" />
                                                  <span>Participants</span>
                                                  {expandedParticipants.has(booking.bookingId) ? (
                                                    <ChevronDown size={18} className="text-gray-500" />
                                                  ) : (
                                                    <ChevronRight size={18} className="text-gray-500" />
                                                  )}
                                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-semibold">
                                                    {booking.travellerDetails.length}
                                                  </span>
                                                </button>
                                                
                                                {expandedParticipants.has(booking.bookingId) && (
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {booking.travellerDetails.map((traveller, idx) => {
                                                      const isEditing = editingParticipant?.bookingId === booking.bookingId && editingParticipant?.index === idx
                                                      const initials = traveller.bookedBy || bookedByInitials
                                                      
                                                      return (
                                                        <div
                                                          key={idx}
                                                          className={`relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border-2 transition-all duration-300 ${
                                                            isEditing 
                                                              ? 'border-secondary shadow-xl shadow-secondary/30 ring-4 ring-secondary/20 scale-[1.02]' 
                                                              : 'border-gray-200 hover:border-secondary/50 hover:shadow-lg'
                                                          }`}
                                                        >
                                                          {/* Booked By Badge */}
                                                          <div className="absolute -top-3 -right-3 w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-secondary/70 text-white flex items-center justify-center font-black text-sm shadow-lg border-4 border-white">
                                                            {initials}
                                                          </div>

                                                          {/* Participant Number Badge */}
                                                          <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 text-white flex items-center justify-center font-black text-sm shadow-lg border-4 border-white">
                                                            {idx + 1}
                                                          </div>

                                                          {/* Header */}
                                                          <div className="mb-4 pb-3 border-b border-gray-200">
                                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                              {isEditing ? (
                                                                <input
                                                                  type="text"
                                                                  value={editedData?.name || ''}
                                                                  onChange={(e) => updateEditedField('name', e.target.value)}
                                                                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                                                                  placeholder="Enter full name"
                                                                />
                                                              ) : (
                                                                <p className="text-base font-black text-gray-900 flex-1 pr-2">
                                                                  {traveller.name || `Participant ${idx + 1}`}
                                                                </p>
                                                              )}
                                                              
                                                              {isEditing ? (
                                                                <div className="flex gap-1.5">
                                                                  <button
                                                                    onClick={() => handleSaveParticipant(booking, idx)}
                                                                    disabled={saving}
                                                                    className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                                                                    title="Save changes"
                                                                  >
                                                                    <Save size={16} />
                                                                  </button>
                                                                  <button
                                                                    onClick={() => {setEditingParticipant(null); setEditedData(null)}}
                                                                    disabled={saving}
                                                                    className="p-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-all disabled:opacity-50"
                                                                    title="Cancel"
                                                                  >
                                                                    <X size={16} />
                                                                  </button>
                                                                </div>
                                                              ) : (
                                                                <button
                                                                  onClick={() => handleEditParticipant(booking.bookingId, idx, traveller)}
                                                                  className="p-2 text-secondary bg-secondary/10 hover:bg-secondary hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                                                                  title="Edit participant"
                                                                >
                                                                  <Edit2 size={16} />
                                                                </button>
                                                              )}
                                                            </div>
                                                            {isEditing && (
                                                              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
                                                                Editing Participant Details
                                                              </p>
                                                            )}
                                                          </div>
                                                          
                                                          {/* Content */}
                                                          <div className="space-y-3">
                                                            {isEditing ? (
                                                              <>
                                                                {/* Gender & Age */}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                  <div>
                                                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Gender</label>
                                                                    <select
                                                                      value={editedData?.gender || ''}
                                                                      onChange={(e) => updateEditedField('gender', e.target.value)}
                                                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-xs font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none bg-white"
                                                                    >
                                                                      <option value="">Select</option>
                                                                      <option value="Male">Male</option>
                                                                      <option value="Female">Female</option>
                                                                      <option value="Other">Other</option>
                                                                    </select>
                                                                  </div>
                                                                  <div>
                                                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Age</label>
                                                                    <input
                                                                      type="text"
                                                                      value={editedData?.age || ''}
                                                                      onChange={(e) => updateEditedField('age', e.target.value)}
                                                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-xs font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                                                                      placeholder="Age"
                                                                    />
                                                                  </div>
                                                                </div>

                                                                {/* Phone */}
                                                                <div>
                                                                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Phone</label>
                                                                  <input
                                                                    type="tel"
                                                                    value={editedData?.phone || ''}
                                                                    onChange={(e) => updateEditedField('phone', e.target.value)}
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-xs font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                                                                    placeholder="10-digit number"
                                                                  />
                                                                </div>

                                                                {/* Email */}
                                                                <div>
                                                                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Email</label>
                                                                  <input
                                                                    type="email"
                                                                    value={editedData?.email || ''}
                                                                    onChange={(e) => updateEditedField('email', e.target.value)}
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-xs font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                                                                    placeholder="email@example.com"
                                                                  />
                                                                </div>

                                                                {/* City & State */}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                  <div>
                                                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">City</label>
                                                                    <input
                                                                      type="text"
                                                                      value={editedData?.city || ''}
                                                                      onChange={(e) => updateEditedField('city', e.target.value)}
                                                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-xs font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                                                                      placeholder="City"
                                                                    />
                                                                  </div>
                                                                  <div>
                                                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">State</label>
                                                                    <input
                                                                      type="text"
                                                                      value={editedData?.state || ''}
                                                                      onChange={(e) => updateEditedField('state', e.target.value)}
                                                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-xs font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                                                                      placeholder="State"
                                                                    />
                                                                  </div>
                                                                </div>

                                                                {/* Emergency Contact */}
                                                                <div>
                                                                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide block mb-1">Emergency</label>
                                                                  <input
                                                                    type="tel"
                                                                    value={editedData?.emergencyContact || ''}
                                                                    onChange={(e) => updateEditedField('emergencyContact', e.target.value)}
                                                                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl text-xs font-semibold focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                                                                    placeholder="Emergency contact"
                                                                  />
                                                                </div>
                                                              </>
                                                            ) : (
                                                              <>
                                                                {traveller.gender && (
                                                                  <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">
                                                                    <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">Gender</span>
                                                                    <span className="text-xs font-black text-gray-900">
                                                                      {traveller.gender}{traveller.age && `, ${traveller.age} yrs`}
                                                                    </span>
                                                                  </div>
                                                                )}
                                                                {traveller.phone && (
                                                                  <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">
                                                                    <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">Phone</span>
                                                                    <span className="text-xs font-black text-gray-900 font-mono">{traveller.phone}</span>
                                                                  </div>
                                                                )}
                                                                {traveller.email && (
                                                                  <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">
                                                                    <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">Email</span>
                                                                    <span className="text-xs font-black text-gray-900 truncate max-w-[60%]" title={traveller.email}>
                                                                      {traveller.email}
                                                                    </span>
                                                                  </div>
                                                                )}
                                                                {traveller.city && traveller.state && (
                                                                  <div className="flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg">
                                                                    <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">Location</span>
                                                                    <span className="text-xs font-black text-gray-900">{traveller.city}, {traveller.state}</span>
                                                                  </div>
                                                                )}
                                                                {traveller.emergencyContact && (
                                                                  <div className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border border-red-200">
                                                                    <span className="text-xs text-red-600 font-bold uppercase tracking-wide">Emergency</span>
                                                                    <span className="text-xs font-black text-red-900 font-mono">{traveller.emergencyContact}</span>
                                                                  </div>
                                                                )}
                                                              </>
                                                            )}
                                                          </div>
                                                        </div>
                                                      )
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            )}

                                            {/* Change Log Section */}
                                            {expandedChangeLogs.has(booking.bookingId) && booking.changeLog && booking.changeLog.length > 0 && (
                                              <div className="mt-4 pt-4 border-t-2 border-purple-200">
                                                <div className="flex items-center gap-2 mb-4">
                                                  <History size={18} className="text-purple-600" />
                                                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                                                    Change History
                                                  </h4>
                                                </div>
                                                <div className="space-y-3">
                                                  {booking.changeLog.slice().reverse().map((log, idx) => {
                                                    const isMasterAdmin = log.changedByRole === 'MASTER_ADMIN'
                                                    const fieldChanges = parseFieldChanges(log.oldValue, log.newValue)
                                                    
                                                    return (
                                                      <div
                                                        key={idx}
                                                        className={`border-l-4 p-4 rounded-lg ${
                                                          isMasterAdmin 
                                                            ? 'bg-gradient-to-r from-amber-50 to-white border-amber-500' 
                                                            : 'bg-gradient-to-r from-purple-50 to-white border-purple-400'
                                                        }`}
                                                      >
                                                        <div className="flex items-start justify-between gap-3 mb-2">
                                                          <div className="flex items-center gap-2">
                                                            {/* User Badge with Role-based styling */}
                                                            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-black text-xs ${
                                                              isMasterAdmin ? 'bg-amber-600' : 'bg-purple-600'
                                                            }`}>
                                                              {log.changedBy.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                            </div>
                                                            
                                                            <div className="flex-1">
                                                              <div className="flex items-center gap-2">
                                                                <p className="text-sm font-black text-gray-900">{log.changedBy}</p>
                                                                
                                                                {/* Role Badge */}
                                                                {log.changedByRole && (
                                                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                                    isMasterAdmin 
                                                                      ? 'bg-amber-100 border border-amber-300 text-amber-800'
                                                                      : 'bg-purple-100 border border-purple-300 text-purple-800'
                                                                  }`}>
                                                                    {isMasterAdmin && (
                                                                      <svg 
                                                                        className="w-3 h-3" 
                                                                        fill="currentColor" 
                                                                        viewBox="0 0 20 20"
                                                                      >
                                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                      </svg>
                                                                    )}
                                                                    {formatRole(log.changedByRole)}
                                                                  </span>
                                                                )}
                                                              </div>
                                                              <p className="text-xs text-gray-500 font-semibold">{log.changeType}</p>
                                                            </div>
                                                          </div>
                                                          
                                                          <div className="text-right">
                                                            <p className="text-xs text-gray-600 font-semibold">
                                                              {formatDateTime(log.timestamp)}
                                                            </p>
                                                          </div>
                                                        </div>
                                                        
                                                        {log.field && (
                                                          <div className="text-xs bg-white px-3 py-2 rounded border mt-2" 
                                                            style={{ borderColor: isMasterAdmin ? '#f59e0b' : '#a855f7' }}>
                                                            <span className="font-bold" style={{ color: isMasterAdmin ? '#b45309' : '#7c3aed' }}>
                                                              Updated: 
                                                            </span>
                                                            <span className="text-gray-700 ml-1">{log.field}</span>
                                                          </div>
                                                        )}
                                                        
                                                        {/* Show specific field changes */}
                                                        {fieldChanges.length > 0 && (
                                                          <div className="mt-3 space-y-2">
                                                            {fieldChanges.map((change, changeIdx) => (
                                                              <div key={changeIdx} className="bg-white rounded-lg p-3 border" style={{ borderColor: isMasterAdmin ? '#f59e0b' : '#a855f7' }}>
                                                                <div className="flex items-start gap-2">
                                                                  <span className="text-xs font-black text-gray-700 min-w-[100px]">{change.field}:</span>
                                                                  <div className="flex-1 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                      <span className="text-[10px] font-bold text-red-600 uppercase">From:</span>
                                                                      <span className="text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded font-medium line-through">{change.oldVal}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                      <span className="text-[10px] font-bold text-green-600 uppercase">To:</span>
                                                                      <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-bold">{change.newVal}</span>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default BookingsView
