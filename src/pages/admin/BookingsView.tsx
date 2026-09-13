import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Download, Users, Search, MapPin, Edit2, Save, X, CreditCard, User, MessageCircle } from 'lucide-react'

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

const BookingsView: React.FC<BookingsViewProps> = ({ bookings, onBookingUpdate }) => {
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set())
  const [expandedJoinLocations, setExpandedJoinLocations] = useState<Set<string>>(new Set())
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [expandedParticipants, setExpandedParticipants] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [editingParticipant, setEditingParticipant] = useState<{ bookingId: string; index: number } | null>(null)
  const [editedData, setEditedData] = useState<TravellerDetail | null>(null)
  const [editingPayment, setEditingPayment] = useState<string | null>(null)
  const [editedPaymentData, setEditedPaymentData] = useState<{ status: string; paymentStatus: string } | null>(null)
  const [editingWhatsAppLink, setEditingWhatsAppLink] = useState<string | null>(null)
  const [whatsappLinkInput, setWhatsappLinkInput] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const getInitials = (name: string): string => {
    if (!name) return '?'
    const words = name.trim().split(' ')
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
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

  const handleEditPayment = (bookingId: string, status: string, paymentStatus: string) => {
    setEditingPayment(bookingId)
    setEditedPaymentData({ status, paymentStatus })
  }

  const handleSavePayment = async (booking: Booking) => {
    if (!editedPaymentData) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/bookings/${booking.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editedPaymentData.status,
          paymentStatus: editedPaymentData.paymentStatus
        })
      })
      if (!response.ok) throw new Error('Failed to update payment')
      setEditingPayment(null)
      setEditedPaymentData(null)
      onBookingUpdate ? onBookingUpdate() : window.location.reload()
    } catch (error) {
      alert('Failed to update payment information')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveParticipant = async (booking: Booking, index: number) => {
    if (!editedData) return
    setSaving(true)
    try {
      const updatedTravellerDetails = [...(booking.travellerDetails || [])]
      if (!editedData.bookedBy) editedData.bookedBy = getInitials(booking.customerName)
      updatedTravellerDetails[index] = editedData

      const response = await fetch(`/api/admin/bookings/${booking.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travellerDetails: updatedTravellerDetails })
      })
      if (!response.ok) throw new Error('Failed to update participant')
      setEditingParticipant(null)
      setEditedData(null)
      onBookingUpdate ? onBookingUpdate() : window.location.reload()
    } catch (error) {
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
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Download size={20} className="text-gray-600" />
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
                                    <div className="flex items-center gap-3 mb-2">
                                      <button 
                                        onClick={() => toggleDate(dateKey)}
                                        className="text-gray-600 hover:text-gray-900"
                                      >
                                        {isDateExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                      </button>
                                      <div className="flex items-center gap-4 flex-1">
                                        <p className="text-sm font-bold text-gray-700">{date}</p>
                                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full font-semibold">
                                          {bookingsArray.length} {bookingsArray.length === 1 ? 'booking' : 'bookings'}
                                        </span>
                                      </div>
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
                                        const isEditingPaymentForThis = editingPayment === booking.bookingId
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
                                                </div>

                                                <p className="text-lg font-bold text-gray-900 mb-1">{booking.customerName}</p>
                                                {booking.customerEmail && booking.customerEmail !== 'N/A' && (
                                                  <p className="text-sm text-gray-600 mb-2">{booking.customerEmail}</p>
                                                )}

                                                {booking.joinOrigin && (
                                                  <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 font-semibold">
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
                                                
                                                {isEditingPaymentForThis ? (
                                                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 space-y-2">
                                                    <select
                                                      value={editedPaymentData?.status || ''}
                                                      onChange={(e) => setEditedPaymentData(prev => prev ? {...prev, status: e.target.value} : null)}
                                                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg font-semibold"
                                                    >
                                                      <option value="Confirmed">Confirmed</option>
                                                      <option value="Pending">Pending</option>
                                                      <option value="Cancelled">Cancelled</option>
                                                      <option value="Payment Pending">Payment Pending</option>
                                                    </select>
                                                    <select
                                                      value={editedPaymentData?.paymentStatus || ''}
                                                      onChange={(e) => setEditedPaymentData(prev => prev ? {...prev, paymentStatus: e.target.value} : null)}
                                                      className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded-lg font-semibold"
                                                    >
                                                      <option value="Online">Online</option>
                                                      <option value="Cash">Cash</option>
                                                      <option value="Credit Card">Credit Card</option>
                                                      <option value="Debit Card">Debit Card</option>
                                                      <option value="UPI">UPI</option>
                                                      <option value="Bank Transfer">Bank Transfer</option>
                                                    </select>
                                                    <div className="flex gap-1">
                                                      <button
                                                        onClick={() => handleSavePayment(booking)}
                                                        disabled={saving}
                                                        className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                                                      >
                                                        <Save size={14} className="inline mr-1" /> Save
                                                      </button>
                                                      <button
                                                        onClick={() => {setEditingPayment(null); setEditedPaymentData(null)}}
                                                        disabled={saving}
                                                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-300 disabled:opacity-50"
                                                      >
                                                        <X size={14} />
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <div className="flex flex-col gap-2 items-end">
                                                    <div className="flex items-center gap-2">
                                                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase border ${getStatusStyle(booking.status)}`}>
                                                        {booking.status}
                                                      </span>
                                                      <button
                                                        onClick={() => handleEditPayment(booking.bookingId, booking.status, booking.paymentStatus)}
                                                        className="p-1.5 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                                                        title="Edit payment"
                                                      >
                                                        <Edit2 size={14} />
                                                      </button>
                                                    </div>
                                                    {booking.paymentStatus && (
                                                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getPaymentMethodStyle(booking.paymentStatus)}`}>
                                                        {booking.paymentStatus}
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
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
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                                    {booking.travellerDetails.map((traveller, idx) => {
                                                      const isEditing = editingParticipant?.bookingId === booking.bookingId && editingParticipant?.index === idx
                                                      const initials = traveller.bookedBy || bookedByInitials
                                                      
                                                      return (
                                                        <div
                                                          key={idx}
                                                          className={`relative border-2 rounded-xl p-4 transition-all ${
                                                            isEditing 
                                                              ? 'bg-amber-50 border-amber-300 shadow-lg' 
                                                              : 'bg-blue-50 border-blue-200 hover:bg-blue-100 hover:shadow-md'
                                                          }`}
                                                        >
                                                          {/* Booked By Badge */}
                                                          <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg border-2 border-white">
                                                            {initials}
                                                          </div>

                                                          <div className="flex items-start justify-between mb-3">
                                                            {isEditing ? (
                                                              <input
                                                                type="text"
                                                                value={editedData?.name || ''}
                                                                onChange={(e) => updateEditedField('name', e.target.value)}
                                                                className="text-sm font-bold text-blue-900 flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg"
                                                                placeholder="Name"
                                                              />
                                                            ) : (
                                                              <p className="text-sm font-bold text-blue-900 flex-1 pr-2">
                                                                {traveller.name || `Traveller ${idx + 1}`}
                                                              </p>
                                                            )}
                                                            
                                                            {isEditing ? (
                                                              <div className="flex gap-1">
                                                                <button
                                                                  onClick={() => handleSaveParticipant(booking, idx)}
                                                                  disabled={saving}
                                                                  className="p-1 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                  <Save size={16} />
                                                                </button>
                                                                <button
                                                                  onClick={() => {setEditingParticipant(null); setEditedData(null)}}
                                                                  disabled={saving}
                                                                  className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                  <X size={16} />
                                                                </button>
                                                              </div>
                                                            ) : (
                                                              <button
                                                                onClick={() => handleEditParticipant(booking.bookingId, idx, traveller)}
                                                                className="p-1 text-gray-500 hover:bg-blue-200 rounded-lg transition-colors"
                                                              >
                                                                <Edit2 size={14} />
                                                              </button>
                                                            )}
                                                          </div>
                                                          
                                                          <div className="space-y-2 text-xs text-gray-700">
                                                            {isEditing ? (
                                                              <>
                                                                <div className="flex gap-2">
                                                                  <select
                                                                    value={editedData?.gender || ''}
                                                                    onChange={(e) => updateEditedField('gender', e.target.value)}
                                                                    className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs"
                                                                  >
                                                                    <option value="">Gender</option>
                                                                    <option value="Male">Male</option>
                                                                    <option value="Female">Female</option>
                                                                    <option value="Other">Other</option>
                                                                  </select>
                                                                  <input
                                                                    type="text"
                                                                    value={editedData?.age || ''}
                                                                    onChange={(e) => updateEditedField('age', e.target.value)}
                                                                    className="w-16 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs"
                                                                    placeholder="Age"
                                                                  />
                                                                </div>
                                                                <input
                                                                  type="tel"
                                                                  value={editedData?.phone || ''}
                                                                  onChange={(e) => updateEditedField('phone', e.target.value)}
                                                                  className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs"
                                                                  placeholder="Phone"
                                                                />
                                                                <input
                                                                  type="email"
                                                                  value={editedData?.email || ''}
                                                                  onChange={(e) => updateEditedField('email', e.target.value)}
                                                                  className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs"
                                                                  placeholder="Email"
                                                                />
                                                                <div className="flex gap-2">
                                                                  <input
                                                                    type="text"
                                                                    value={editedData?.city || ''}
                                                                    onChange={(e) => updateEditedField('city', e.target.value)}
                                                                    className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs"
                                                                    placeholder="City"
                                                                  />
                                                                  <input
                                                                    type="text"
                                                                    value={editedData?.state || ''}
                                                                    onChange={(e) => updateEditedField('state', e.target.value)}
                                                                    className="flex-1 px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs"
                                                                    placeholder="State"
                                                                  />
                                                                </div>
                                                                <input
                                                                  type="tel"
                                                                  value={editedData?.emergencyContact || ''}
                                                                  onChange={(e) => updateEditedField('emergencyContact', e.target.value)}
                                                                  className="w-full px-2 py-1.5 border-2 border-gray-300 rounded-lg text-xs"
                                                                  placeholder="Emergency Contact"
                                                                />
                                                              </>
                                                            ) : (
                                                              <>
                                                                {traveller.gender && (
                                                                  <div className="flex items-center gap-1.5">
                                                                    <span className="text-gray-500 font-bold">•</span>
                                                                    <span className="font-semibold">{traveller.gender}</span>
                                                                    {traveller.age && <span>, {traveller.age} yrs</span>}
                                                                  </div>
                                                                )}
                                                                {traveller.phone && (
                                                                  <div className="flex items-center gap-1.5">
                                                                    <span>📞</span>
                                                                    <span className="font-mono font-semibold">{traveller.phone}</span>
                                                                  </div>
                                                                )}
                                                                {traveller.email && (
                                                                  <div className="flex items-center gap-1.5">
                                                                    <span>✉️</span>
                                                                    <span className="truncate font-semibold" title={traveller.email}>
                                                                      {traveller.email.length > 18 ? traveller.email.substring(0, 18) + '...' : traveller.email}
                                                                    </span>
                                                                  </div>
                                                                )}
                                                                {traveller.city && traveller.state && (
                                                                  <div className="flex items-center gap-1.5">
                                                                    <span>📍</span>
                                                                    <span className="font-semibold">{traveller.city}, {traveller.state}</span>
                                                                  </div>
                                                                )}
                                                                {traveller.emergencyContact && (
                                                                  <div className="flex items-center gap-1.5">
                                                                    <span>🚨</span>
                                                                    <span className="font-mono font-semibold">{traveller.emergencyContact}</span>
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
