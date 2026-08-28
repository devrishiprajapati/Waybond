import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MaterialReactTable, type MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import { Button, ThemeProvider, createTheme, MenuItem } from '@mui/material'
import { Filter, Database, Users, Package, FileDown, ArrowLeft, Calendar, Edit2 } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import PermissionGuard from '../../components/PermissionGuard'

type Trip = {
  id: number
  title: string
  location: string
  category: string
  experience: string
  price: number
  duration: string
  nextBatch?: string
}

type User = {
  id: string
  name: string
  email: string
  role: string
  bookingStatus: string
  joinedAt: string
  lastLoginAt: string
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
  travellerDetails?: Array<{
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
  }>
}

const DataFilters = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'trips' | 'users' | 'bookings'>('trips')
  const [loading, setLoading] = useState(true)
  const [currentAdminPermissions, setCurrentAdminPermissions] = useState<string[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    
    // Get admin permissions
    const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
    setCurrentAdminPermissions(adminData.permissions || [])
    
    // Check if admin has view or edit permission or is Master Admin
    const hasViewPermission = adminData.permissions?.includes('data_filters_view')
    const hasEditPermission = adminData.permissions?.includes('data_filters_edit')
    const isMasterAdmin = adminData.role === 'MASTER_ADMIN'
    
    if (!hasViewPermission && !hasEditPermission && !isMasterAdmin) {
      navigate('/admin/dashboard')
      return
    }
    
    loadData()
  }, [navigate])

  const hasEditPermission = () => {
    const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
    const isMasterAdmin = adminData.role === 'MASTER_ADMIN'
    const hasEditPerm = adminData.permissions?.includes('data_filters_edit')
    return isMasterAdmin || hasEditPerm
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [tripsRes, usersRes, bookingsRes] = await Promise.all([
        fetch('/api/admin/trips'),
        fetch('/api/users'),
        fetch('/api/admin/bookings')
      ])

      if (tripsRes.ok) {
        const tripsData = await tripsRes.json()
        setTrips(tripsData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.map((u: any) => ({
          ...u,
          bookingStatus: u.bookingStatus || 'No Bookings',
          joinedAt: new Date(u.joinedAt).toLocaleDateString('en-IN'),
          lastLoginAt: new Date(u.lastLoginAt).toLocaleDateString('en-IN')
        })))
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Save edited trip data
  const handleSaveTrip = async (trip: Trip): Promise<void> => {
    try {
      // Send only the fields that can be edited in the table
      const updateData = {
        title: trip.title,
        location: trip.location,
        category: trip.category,
        experience: trip.experience,
        price: typeof trip.price === 'string' ? trip.price : String(trip.price),
        duration: trip.duration,
        nextBatch: trip.nextBatch
      }

      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update trip')
      }

      // Reload data to get fresh data
      await loadData()
      
      // Show success message
      console.log('Trip updated successfully!')
    } catch (error) {
      console.error('Error updating trip:', error)
      throw error // Re-throw to let the caller handle it
    }
  }

  // Save edited user data
  const handleSaveUser = async (user: User): Promise<void> => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user')
      }

      await loadData()
      console.log('User updated successfully!')
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  // Save edited booking data
  const handleSaveBooking = async (booking: Booking): Promise<void> => {
    try {
      // Use the new general booking update endpoint
      const response = await fetch(`/api/admin/bookings/${booking.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          tripName: booking.tripName,
          location: booking.location,
          travelers: booking.travelers,
          price: booking.price,
          total: booking.total,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          bookingDate: booking.bookingDate
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update booking')
      }

      // Reload all data to ensure we have fresh booking information
      const bookingsRes = await fetch('/api/admin/bookings')
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData)
      }
      
      console.log('Booking updated successfully!')
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  }

  // Light theme for Material React Table
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#6495ED',
      },
      secondary: {
        main: '#0D7377',
      },
      background: {
        default: '#ffffff',
        paper: '#f8fafc',
      },
    },
  })

  // Trip columns
  const tripColumns = useMemo<MRT_ColumnDef<Trip>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        grow: false,
        muiTableHeadCellProps: {
          title: 'Trip ID - Unique identifier for each trip',
        },
      },
      {
        accessorKey: 'title',
        header: 'Trip',
        size: 200,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Trip Title - Name of the travel package',
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 150,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Location - Destination or route of the trip',
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 130,
        grow: false,
        filterVariant: 'select',
        muiTableHeadCellProps: {
          title: 'Category - Type of travel experience (Adventure, Beach, etc.)',
        },
      },
      {
        accessorKey: 'experience',
        header: 'Experience',
        size: 140,
        grow: false,
        filterVariant: 'select',
        muiTableHeadCellProps: {
          title: 'Experience - Travel season or style (Monsoon, Weekend, Road, Snow)',
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 120,
        grow: false,
        Cell: ({ cell }) => `₹${cell.getValue<number>().toLocaleString('en-IN')}`,
        muiTableHeadCellProps: {
          title: 'Price - Base price per person in Indian Rupees',
        },
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        size: 120,
        grow: false,
        muiTableHeadCellProps: {
          title: 'Duration - Length of the trip (Days/Nights)',
        },
      },
      {
        accessorKey: 'nextBatch',
        header: 'Next Batch',
        size: 150,
        grow: false,
        muiTableHeadCellProps: {
          title: 'Next Batch - Next available departure date',
        },
      },
    ],
    []
  )

  // User columns
  const userColumns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'User ID',
        size: 100,
        grow: false,
        muiTableHeadCellProps: {
          title: 'User ID - Unique identifier for each registered user',
        },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 150,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Name - Full name of the user',
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 220,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Email - User\'s email address for contact',
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 110,
        grow: false,
        filterVariant: 'select',
        muiTableHeadCellProps: {
          title: 'Role - User permission level (Admin, User, etc.)',
        },
      },
      {
        accessorKey: 'bookingStatus',
        header: 'Booking',
        size: 140,
        grow: false,
        filterVariant: 'select',
        muiTableHeadCellProps: {
          title: 'Booking Status - Current booking state for this user',
        },
        Cell: ({ cell }) => {
          const status = cell.getValue<string>()
          const colors: Record<string, string> = {
            'Active': 'bg-green-100 text-green-800 border-green-200',
            'Completed': 'bg-blue-100 text-blue-800 border-blue-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'No Bookings': 'bg-gray-100 text-gray-600 border-gray-200'
          }
          return (
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {status}
            </span>
          )
        }
      },
      {
        accessorKey: 'joinedAt',
        header: 'Joined',
        size: 120,
        grow: false,
        muiTableHeadCellProps: {
          title: 'Joined Date - When the user registered on the platform',
        },
      },
      {
        accessorKey: 'lastLoginAt',
        header: 'Last Login',
        size: 120,
        grow: false,
        muiTableHeadCellProps: {
          title: 'Last Login - Most recent login date and time',
        },
      },
    ],
    []
  )

  // Booking columns
  const bookingColumns = useMemo<MRT_ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: 'bookingId',
        header: 'Booking ID',
        size: 140,
        grow: false,
        enableEditing: false,
        muiTableHeadCellProps: {
          title: 'Booking ID - Unique identifier for each booking',
        },
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 150,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Customer Name - Full name of the person who made the booking',
        },
      },
      {
        accessorKey: 'customerEmail',
        header: 'Email',
        size: 200,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Customer Email - Contact email for the customer',
        },
      },
      {
        accessorKey: 'tripName',
        header: 'Trip Name',
        size: 180,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Trip Name - Name of the booked travel package',
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 140,
        grow: true,
        muiTableHeadCellProps: {
          title: 'Location - Destination of the booked trip',
        },
      },
      {
        accessorKey: 'travelers',
        header: 'Travelers',
        size: 100,
        grow: false,
        muiTableHeadCellProps: {
          title: 'Travelers - Number of people in this booking',
        },
      },
      {
        accessorKey: 'total',
        header: 'Total',
        size: 120,
        grow: false,
        Cell: ({ cell }) => `₹${cell.getValue<number>().toLocaleString('en-IN')}`,
        muiTableHeadCellProps: {
          title: 'Total Amount - Total booking amount in Indian Rupees',
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        grow: false,
        filterVariant: 'select',
        muiTableHeadCellProps: {
          title: 'Booking Status - Current state of the booking (Confirmed, Pending, Cancelled)',
        },
        muiEditTextFieldProps: {
          select: true,
          children: ['Confirmed', 'Pending', 'Cancelled', 'Payment Pending'].map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          )),
        },
        Cell: ({ cell }) => {
          const status = cell.getValue<string>()
          const colors: Record<string, string> = {
            'Confirmed': 'bg-green-100 text-green-800 border-green-200',
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Cancelled': 'bg-red-100 text-red-800 border-red-200',
            'Payment Pending': 'bg-orange-100 text-orange-800 border-orange-200'
          }
          return (
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {status}
            </span>
          )
        }
      },
      {
        accessorKey: 'paymentStatus',
        header: 'Payment',
        size: 130,
        grow: false,
        filterVariant: 'select',
        muiTableHeadCellProps: {
          title: 'Payment Status - Payment state (Paid, Pending, Failed, Cash, Online)',
        },
        muiEditTextFieldProps: {
          select: true,
          children: ['Paid', 'Pending Payment', 'Failed', 'Refunded', 'Cash', 'Online'].map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          )),
        },
        Cell: ({ cell }) => {
          const status = cell.getValue<string>()
          const colors: Record<string, string> = {
            'Paid': 'bg-green-100 text-green-800 border-green-200',
            'Pending Payment': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Failed': 'bg-red-100 text-red-800 border-red-200',
            'Refunded': 'bg-blue-100 text-blue-800 border-blue-200',
            'Cash': 'bg-purple-100 text-purple-800 border-purple-200',
            'Online': 'bg-green-100 text-green-800 border-green-200'
          }
          return (
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${colors[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {status}
            </span>
          )
        }
      },
      {
        accessorKey: 'bookingDate',
        header: 'Booking Date',
        size: 130,
        grow: false,
        muiTableHeadCellProps: {
          title: 'Booking Date - When the booking was made',
        },
      },
    ],
    []
  )

  // PDF Export handlers
  const handleExportTripsPDF = (selectedRows?: Trip[]) => {
    const doc = new jsPDF()
    const dataToExport = selectedRows && selectedRows.length > 0 ? selectedRows : trips
    
    doc.setFontSize(18)
    doc.text('WayBond Trips Data', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${dataToExport.length}`, 14, 36)
    
    autoTable(doc, {
      head: [['ID', 'Trip Title', 'Location', 'Category', 'Experience', 'Price (₹)', 'Duration', 'Next Batch']],
      body: dataToExport.map(trip => [
        trip.id,
        trip.title,
        trip.location,
        trip.category,
        trip.experience,
        `₹${trip.price.toLocaleString('en-IN')}`,
        trip.duration,
        trip.nextBatch || 'N/A'
      ]),
      startY: 40,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [100, 149, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 40 },
    })
    
    const filename = selectedRows && selectedRows.length > 0 
      ? `waybond-trips-selected-${dataToExport.length}.pdf`
      : 'waybond-trips-all.pdf'
    doc.save(filename)
  }

  const handleExportUsersPDF = (selectedRows?: User[]) => {
    const doc = new jsPDF()
    const dataToExport = selectedRows && selectedRows.length > 0 ? selectedRows : users
    
    doc.setFontSize(18)
    doc.text('WayBond Users Data', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${dataToExport.length}`, 14, 36)
    
    autoTable(doc, {
      head: [['User ID', 'Name', 'Email', 'Role', 'Booking Status', 'Joined Date', 'Last Login']],
      body: dataToExport.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.bookingStatus,
        user.joinedAt,
        user.lastLoginAt
      ]),
      startY: 40,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [100, 149, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 40 },
    })
    
    const filename = selectedRows && selectedRows.length > 0 
      ? `waybond-users-selected-${dataToExport.length}.pdf`
      : 'waybond-users-all.pdf'
    doc.save(filename)
  }

  const handleExportBookingsPDF = (selectedRows?: Booking[]) => {
    const doc = new jsPDF('landscape')
    const dataToExport = selectedRows && selectedRows.length > 0 ? selectedRows : bookings
    
    doc.setFontSize(18)
    doc.text('WayBond Bookings Data', 14, 22)
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Records: ${dataToExport.length}`, 14, 36)
    
    autoTable(doc, {
      head: [['Booking ID', 'Customer', 'Email', 'Trip', 'Location', 'Travelers', 'Total', 'Status', 'Payment', 'Date']],
      body: dataToExport.map(booking => [
        booking.bookingId,
        booking.customerName,
        booking.customerEmail,
        booking.tripName,
        booking.location,
        booking.travelers,
        `₹${booking.total.toLocaleString('en-IN')}`,
        booking.status,
        booking.paymentStatus,
        booking.bookingDate
      ]),
      startY: 40,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [100, 149, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 40 },
    })
    
    const filename = selectedRows && selectedRows.length > 0 
      ? `waybond-bookings-selected-${dataToExport.length}.pdf`
      : 'waybond-bookings-all.pdf'
    doc.save(filename)
  }

  const handleExportBookingsWithTravellersPDF = (selectedRows?: Booking[]) => {
    const doc = new jsPDF('portrait')
    const dataToExport = selectedRows && selectedRows.length > 0 ? selectedRows : bookings
    
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 15
    const contentWidth = pageWidth - (margin * 2)
    
    // Header with gradient effect (simulated with rectangles)
    doc.setFillColor(100, 149, 237)
    doc.rect(0, 0, pageWidth, 45, 'F')
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 30, pageWidth, 15, 'F')
    
    // WayBond Logo/Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text('WAYBOND', margin, 20)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Travel Experiences', margin, 28)
    
    // Document title
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('BOOKINGS & TRAVELLER DETAILS REPORT', margin, 38)
    
    // Report info box
    doc.setFillColor(248, 250, 252)
    doc.rect(margin, 50, contentWidth, 20, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.rect(margin, 50, contentWidth, 20, 'S')
    
    doc.setTextColor(71, 85, 105)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, margin + 3, 57)
    doc.text(`Total Bookings: ${dataToExport.length}`, margin + 3, 63)
    
    const totalTravellers = dataToExport.reduce((sum, b) => sum + (b.travellerDetails?.length || 0), 0)
    doc.text(`Total Travellers: ${totalTravellers}`, margin + 3, 69)
    
    let yPosition = 78
    const lineHeight = 5
    
    dataToExport.forEach((booking, bookingIndex) => {
      // Check if we need a new page for booking header
      if (yPosition > pageHeight - 80) {
        doc.addPage()
        yPosition = 20
      }
      
      // Booking header with gradient
      doc.setFillColor(100, 149, 237)
      doc.rect(margin, yPosition, contentWidth, 10, 'F')
      doc.setFillColor(79, 128, 217)
      doc.rect(margin, yPosition + 7, contentWidth, 3, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`BOOKING #${bookingIndex + 1}`, margin + 3, yPosition + 7)
      
      // Booking ID badge
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(contentWidth - 45, yPosition + 2, 55, 6, 1, 1, 'F')
      doc.setTextColor(100, 149, 237)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(booking.bookingId, contentWidth - 42, yPosition + 6)
      
      yPosition += 12
      
      // Booking details card
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, yPosition, contentWidth, 32, 2, 2, 'FD')
      doc.setDrawColor(226, 232, 240)
      doc.roundedRect(margin, yPosition, contentWidth, 32, 2, 2, 'S')
      
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(booking.customerName, margin + 4, yPosition + 6)
      
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(booking.customerEmail, margin + 4, yPosition + 11)
      
      // Trip info with icon simulation
      doc.setFillColor(239, 246, 255)
      doc.roundedRect(margin + 4, yPosition + 14, contentWidth - 8, 14, 1, 1, 'F')
      
      doc.setTextColor(59, 130, 246)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text('TRIP', margin + 6, yPosition + 18)
      
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(booking.tripName, margin + 6, yPosition + 22)
      
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(`${booking.location} | ${booking.travelers} ${booking.travelers === 1 ? 'Traveller' : 'Travellers'}`, margin + 6, yPosition + 26)
      
      // Payment info badges
      const badgeY = yPosition + 16
      let badgeX = contentWidth - 55
      
      // Status badge
      const statusColors: Record<string, { bg: [number, number, number], text: [number, number, number] }> = {
        'Confirmed': { bg: [16, 185, 129], text: [255, 255, 255] },
        'Pending': { bg: [251, 191, 36], text: [120, 53, 15] },
        'Cancelled': { bg: [239, 68, 68], text: [255, 255, 255] },
        'Payment Pending': { bg: [249, 115, 22], text: [255, 255, 255] }
      }
      
      const statusColor = statusColors[booking.status] || { bg: [156, 163, 175] as [number, number, number], text: [255, 255, 255] as [number, number, number] }
      doc.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2])
      doc.roundedRect(badgeX, badgeY, 25, 5, 1, 1, 'F')
      doc.setTextColor(statusColor.text[0], statusColor.text[1], statusColor.text[2])
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(booking.status.toUpperCase(), badgeX + 12.5, badgeY + 3.5, { align: 'center' })
      
      // Payment badge
      badgeX += 28
      const paymentColors: Record<string, { bg: [number, number, number], text: [number, number, number] }> = {
        'Paid': { bg: [16, 185, 129], text: [255, 255, 255] },
        'Online': { bg: [16, 185, 129], text: [255, 255, 255] },
        'Cash': { bg: [139, 92, 246], text: [255, 255, 255] },
        'Pending Payment': { bg: [251, 191, 36], text: [120, 53, 15] }
      }
      
      const paymentColor = paymentColors[booking.paymentStatus] || { bg: [156, 163, 175] as [number, number, number], text: [255, 255, 255] as [number, number, number] }
      doc.setFillColor(paymentColor.bg[0], paymentColor.bg[1], paymentColor.bg[2])
      doc.roundedRect(badgeX, badgeY, 25, 5, 1, 1, 'F')
      doc.setTextColor(paymentColor.text[0], paymentColor.text[1], paymentColor.text[2])
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(booking.paymentStatus.toUpperCase(), badgeX + 12.5, badgeY + 3.5, { align: 'center' })
      
      // Amount and date
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`₹${booking.total.toLocaleString('en-IN')}`, contentWidth + 10, yPosition + 6, { align: 'right' })
      
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text(booking.bookingDate, contentWidth + 10, yPosition + 11, { align: 'right' })
      
      yPosition += 35
      
      // Traveller details section
      const travellerDetails = booking.travellerDetails || []
      if (travellerDetails.length > 0) {
        // Section header
        doc.setFillColor(13, 115, 119)
        doc.rect(margin, yPosition, contentWidth, 7, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`TRAVELLERS (${travellerDetails.length})`, margin + 3, yPosition + 5)
        
        yPosition += 9
        
        travellerDetails.forEach((traveller, travellerIndex) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            doc.addPage()
            yPosition = 20
          }
          
          // Traveller card
          doc.setFillColor(240, 253, 244)
          doc.roundedRect(margin + 2, yPosition, contentWidth - 4, 38, 2, 2, 'F')
          doc.setDrawColor(187, 247, 208)
          doc.setLineWidth(0.5)
          doc.roundedRect(margin + 2, yPosition, contentWidth - 4, 38, 2, 2, 'S')
          
          // Traveller number badge
          doc.setFillColor(13, 115, 119)
          doc.circle(margin + 7, yPosition + 5, 3, 'F')
          doc.setTextColor(255, 255, 255)
          doc.setFontSize(8)
          doc.setFont('helvetica', 'bold')
          doc.text(`${travellerIndex + 1}`, margin + 7, yPosition + 6.5, { align: 'center' })
          
          // Traveller name
          doc.setTextColor(6, 78, 59)
          doc.setFontSize(10)
          doc.setFont('helvetica', 'bold')
          doc.text(traveller.name || 'N/A', margin + 12, yPosition + 6)
          
          doc.setTextColor(21, 128, 61)
          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          
          let infoY = yPosition + 12
          const col1X = margin + 6
          const col2X = margin + (contentWidth / 2) + 2
          const infoGap = 6
          
          // Column 1
          if (traveller.gender) {
            doc.setFont('helvetica', 'bold')
            doc.text('Gender:', col1X, infoY)
            doc.setFont('helvetica', 'normal')
            doc.text(traveller.gender, col1X + 14, infoY)
            infoY += infoGap
          }
          
          if (traveller.dateOfBirth || traveller.dob) {
            doc.setFont('helvetica', 'bold')
            doc.text('DOB:', col1X, infoY)
            doc.setFont('helvetica', 'normal')
            const dob = traveller.dateOfBirth || traveller.dob
            const formattedDob = dob ? new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : dob
            doc.text(formattedDob || 'N/A', col1X + 14, infoY)
            infoY += infoGap
          }
          
          if (traveller.phone) {
            doc.setFont('helvetica', 'bold')
            doc.text('Phone:', col1X, infoY)
            doc.setFont('helvetica', 'normal')
            doc.text(traveller.phone, col1X + 14, infoY)
            infoY += infoGap
          }
          
          if (traveller.emergencyContact) {
            doc.setFont('helvetica', 'bold')
            doc.text('Emergency:', col1X, infoY)
            doc.setFont('helvetica', 'normal')
            doc.text(traveller.emergencyContact, col1X + 14, infoY)
          }
          
          // Column 2
          infoY = yPosition + 12
          
          if (traveller.email) {
            doc.setFont('helvetica', 'bold')
            doc.text('Email:', col2X, infoY)
            doc.setFont('helvetica', 'normal')
            doc.text(traveller.email.length > 28 ? traveller.email.substring(0, 25) + '...' : traveller.email, col2X + 12, infoY)
            infoY += infoGap
          }
          
          if (traveller.city) {
            doc.setFont('helvetica', 'bold')
            doc.text('City:', col2X, infoY)
            doc.setFont('helvetica', 'normal')
            doc.text(traveller.city, col2X + 12, infoY)
            infoY += infoGap
          }
          
          if (traveller.state) {
            doc.setFont('helvetica', 'bold')
            doc.text('State:', col2X, infoY)
            doc.setFont('helvetica', 'normal')
            doc.text(traveller.state, col2X + 12, infoY)
          }
          
          yPosition += 40
        })
      } else {
        // No travellers message
        doc.setFillColor(254, 243, 199)
        doc.roundedRect(margin + 2, yPosition, contentWidth - 4, 10, 1, 1, 'F')
        doc.setTextColor(161, 98, 7)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text('No traveller details available for this booking', margin + 5, yPosition + 6)
        yPosition += 12
      }
      
      yPosition += 8
      
      // Separator line
      if (bookingIndex < dataToExport.length - 1) {
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition, contentWidth + margin, yPosition)
        yPosition += 8
      }
    })
    
    // Footer on all pages
    const pageCount = doc.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Footer background
      doc.setFillColor(248, 250, 252)
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')
      
      // Footer content
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('WayBond Travel Experiences | support@waybond.com | www.waybond.com', pageWidth / 2, pageHeight - 8, { align: 'center' })
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 4, { align: 'center' })
    }
    
    const filename = selectedRows && selectedRows.length > 0 
      ? `WayBond-Bookings-Report-${dataToExport.length}-bookings.pdf`
      : `WayBond-Bookings-Report-All.pdf`
    doc.save(filename)
  }

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: Package, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-green-500/20 text-green-400 border-green-500/20' },
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
    { label: 'Categories', value: new Set(trips.map(t => t.category)).size, icon: Filter, color: 'bg-orange-500/20 text-orange-400 border-orange-500/20' },
  ]

  // Trips Table Component
  const TripsTable = () => {
    const [rowSelection, setRowSelection] = useState({})
    const canEdit = hasEditPermission()

    const table = useMaterialReactTable({
      columns: tripColumns,
      data: trips,
      enableColumnFilterModes: true,
      enableColumnOrdering: true,
      enableGrouping: true,
      enablePinning: true,
      enableRowSelection: true,
      enableColumnResizing: true,
      enableStickyHeader: true,
      enableStickyFooter: true,
      enableEditing: canEdit,
      editDisplayMode: 'row',
      enableRowActions: canEdit,
      positionActionsColumn: 'last',
      displayColumnDefOptions: {
        'mrt-row-actions': {
          header: 'Actions',
          size: 100,
        },
      },
      onEditingRowSave: async ({ row, values, table }) => {
        try {
          const updatedTrip = { ...row.original, ...values }
          await handleSaveTrip(updatedTrip)
          table.setEditingRow(null)
        } catch (error) {
          console.error('Error saving trip:', error)
          alert('Failed to save changes. Please try again.')
        }
      },
      renderRowActions: ({ row, table }) => (
        <div className="flex gap-2">
          <button
            onClick={() => table.setEditingRow(row)}
            className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary hover:text-white transition-all"
            title="Edit row"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
      onRowSelectionChange: setRowSelection,
      state: { 
        isLoading: loading,
        rowSelection 
      },
      initialState: {
        showColumnFilters: false,
        showGlobalFilter: true,
        density: 'compact',
        pagination: { pageSize: 20, pageIndex: 0 },
      },
      muiTableProps: {
        sx: { 
          backgroundColor: '#ffffff',
          width: '100%',
          tableLayout: 'auto',
        },
      },
      muiTableContainerProps: {
        sx: {
          width: '100%',
          maxHeight: { xs: '400px', sm: '500px', md: '600px', lg: '700px', xl: '800px' },
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: '#f1f5f9', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb': { background: '#6495ED', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#5080d9' },
        },
      },
      muiTableHeadCellProps: {
        sx: {
          backgroundColor: '#6495ED',
          color: '#ffffff',
          fontWeight: '900',
          fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          borderBottom: '2px solid #5080d9',
          padding: { xs: '6px', sm: '8px', md: '10px' },
        },
      },
      muiTableBodyCellProps: {
        sx: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
          padding: { xs: '8px', sm: '10px', md: '12px' },
          borderBottom: '1px solid #e2e8f0',
        },
      },
      muiTableBodyRowProps: ({ row }) => ({
        sx: {
          backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f8fafc',
          '&:hover': { backgroundColor: '#e0e7ff' },
        },
      }),
      muiTablePaperProps: {
        sx: {
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      },
      muiTopToolbarProps: {
        sx: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '16px',
          padding: { xs: '8px', md: '12px' },
        },
      },
      muiBottomToolbarProps: {
        sx: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginTop: '16px',
          color: '#1e293b',
        },
      },
      muiSearchTextFieldProps: {
        sx: {
          '& .MuiInputBase-root': {
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
          },
          '& .MuiInputBase-input': { color: '#1e293b' },
          '& .MuiInputLabel-root': { color: '#64748b' },
          '& .MuiSvgIcon-root': { color: '#6495ED' },
        },
      },
      muiPaginationProps: {
        sx: {
          '& .MuiPaginationItem-root': {
            color: '#1e293b',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
          },
          '& .Mui-selected': { backgroundColor: '#6495ED !important', color: '#fff' },
        },
      },
      renderTopToolbarCustomActions: () => {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
        const hasSelection = selectedRows.length > 0
        
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportTripsPDF()}
              startIcon={<FileDown size={14} />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#6495ED',
                color: '#6495ED',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                padding: '6px 16px',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#5080d9',
                  backgroundColor: 'rgba(100, 149, 237, 0.1)',
                },
              }}
            >
              Export All
            </Button>
            {hasSelection && (
              <Button
                onClick={() => handleExportTripsPDF(selectedRows)}
                startIcon={<FileDown size={14} />}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#6495ED',
                  color: '#fff',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  letterSpacing: '0.05em',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#5080d9' },
                }}
              >
                Export Selected ({selectedRows.length})
              </Button>
            )}
          </div>
        )
      },
    })

    return <MaterialReactTable table={table} />
  }

  // Users Table Component
  const UsersTable = () => {
    const [rowSelection, setRowSelection] = useState({})
    const canEdit = hasEditPermission()

    const table = useMaterialReactTable({
      columns: userColumns,
      data: users,
      enableColumnFilterModes: true,
      enableColumnOrdering: true,
      enableGrouping: true,
      enablePinning: true,
      enableRowSelection: true,
      enableColumnResizing: true,
      enableStickyHeader: true,
      enableStickyFooter: true,
      enableEditing: canEdit,
      editDisplayMode: 'row',
      enableRowActions: canEdit,
      positionActionsColumn: 'last',
      displayColumnDefOptions: {
        'mrt-row-actions': {
          header: 'Actions',
          size: 100,
        },
      },
      onEditingRowSave: async ({ row, values, table }) => {
        try {
          const updatedUser = { ...row.original, ...values }
          await handleSaveUser(updatedUser)
          table.setEditingRow(null)
        } catch (error) {
          console.error('Error saving user:', error)
          alert('Failed to save changes. Please try again.')
        }
      },
      renderRowActions: ({ row, table }) => (
        <div className="flex gap-2">
          <button
            onClick={() => table.setEditingRow(row)}
            className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary hover:text-white transition-all"
            title="Edit row"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
      onRowSelectionChange: setRowSelection,
      state: { 
        isLoading: loading,
        rowSelection 
      },
      initialState: {
        showColumnFilters: false,
        showGlobalFilter: true,
        density: 'compact',
        pagination: { pageSize: 20, pageIndex: 0 },
      },
      muiTableProps: {
        sx: { 
          backgroundColor: '#ffffff',
          width: '100%',
          tableLayout: 'auto',
        },
      },
      muiTableContainerProps: {
        sx: {
          width: '100%',
          maxHeight: { xs: '400px', sm: '500px', md: '600px', lg: '700px', xl: '800px' },
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: '#f1f5f9', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb': { background: '#6495ED', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#5080d9' },
        },
      },
      muiTableHeadCellProps: {
        sx: {
          backgroundColor: '#6495ED',
          color: '#ffffff',
          fontWeight: '900',
          fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          borderBottom: '2px solid #5080d9',
          padding: { xs: '6px', sm: '8px', md: '10px' },
        },
      },
      muiTableBodyCellProps: {
        sx: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
          padding: { xs: '8px', sm: '10px', md: '12px' },
          borderBottom: '1px solid #e2e8f0',
        },
      },
      muiTableBodyRowProps: ({ row }) => ({
        sx: {
          backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f8fafc',
          '&:hover': { backgroundColor: '#e0e7ff' },
        },
      }),
      muiTablePaperProps: {
        sx: {
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      },
      muiTopToolbarProps: {
        sx: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '16px',
          padding: { xs: '8px', md: '12px' },
        },
      },
      muiBottomToolbarProps: {
        sx: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginTop: '16px',
          color: '#1e293b',
        },
      },
      muiSearchTextFieldProps: {
        sx: {
          '& .MuiInputBase-root': {
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
          },
          '& .MuiInputBase-input': { color: '#1e293b' },
          '& .MuiInputLabel-root': { color: '#64748b' },
          '& .MuiSvgIcon-root': { color: '#6495ED' },
        },
      },
      muiPaginationProps: {
        sx: {
          '& .MuiPaginationItem-root': {
            color: '#1e293b',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
          },
          '& .Mui-selected': { backgroundColor: '#6495ED !important', color: '#fff' },
        },
      },
      renderTopToolbarCustomActions: () => {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
        const hasSelection = selectedRows.length > 0
        
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => handleExportUsersPDF()}
              startIcon={<FileDown size={14} />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#6495ED',
                color: '#6495ED',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                padding: '6px 16px',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#5080d9',
                  backgroundColor: 'rgba(100, 149, 237, 0.1)',
                },
              }}
            >
              Export All
            </Button>
            {hasSelection && (
              <Button
                onClick={() => handleExportUsersPDF(selectedRows)}
                startIcon={<FileDown size={14} />}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#6495ED',
                  color: '#fff',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: '0.65rem',
                  letterSpacing: '0.05em',
                  padding: '6px 16px',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#5080d9' },
                }}
              >
                Export Selected ({selectedRows.length})
              </Button>
            )}
          </div>
        )
      },
    })

    return <MaterialReactTable table={table} />
  }

  // Bookings Table Component
  const BookingsTable = () => {
    const [rowSelection, setRowSelection] = useState({})
    const [editingTraveller, setEditingTraveller] = useState<{bookingId: string, index: number} | null>(null)
    const [editedTravellerData, setEditedTravellerData] = useState<any>({})
    const canEdit = hasEditPermission()

    const handleEditTraveller = (bookingId: string, index: number, traveller: any) => {
      setEditingTraveller({ bookingId, index })
      setEditedTravellerData({ ...traveller })
    }

    const handleCancelEdit = () => {
      setEditingTraveller(null)
      setEditedTravellerData({})
    }

    const handleSaveTraveller = async (booking: Booking, travellerIndex: number) => {
      try {
        const updatedTravellerDetails = [...(booking.travellerDetails || [])]
        updatedTravellerDetails[travellerIndex] = editedTravellerData

        const response = await fetch(`/api/admin/bookings/${booking.bookingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...booking,
            travellerDetails: updatedTravellerDetails
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to update traveller details')
        }

        // Reload bookings data
        const bookingsRes = await fetch('/api/admin/bookings')
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          setBookings(bookingsData)
        }

        setEditingTraveller(null)
        setEditedTravellerData({})
        console.log('Traveller details updated successfully!')
      } catch (error) {
        console.error('Error updating traveller details:', error)
        alert('Failed to update traveller details. Please try again.')
      }
    }

    const table = useMaterialReactTable({
      columns: bookingColumns,
      data: bookings,
      enableColumnFilterModes: true,
      enableColumnOrdering: true,
      enableGrouping: true,
      enablePinning: true,
      enableRowSelection: true,
      enableColumnResizing: true,
      enableStickyHeader: true,
      enableStickyFooter: true,
      enableEditing: canEdit,
      editDisplayMode: 'row',
      enableRowActions: canEdit,
      positionActionsColumn: 'last',
      enableExpandAll: true,
      enableExpanding: true,
      getRowCanExpand: () => true,
      displayColumnDefOptions: {
        'mrt-row-actions': {
          header: 'Actions',
          size: 100,
        },
      },
      onEditingRowSave: async ({ row, values, table }) => {
        try {
          const updatedBooking = { ...row.original, ...values }
          await handleSaveBooking(updatedBooking)
          table.setEditingRow(null)
        } catch (error) {
          console.error('Error saving booking:', error)
          alert('Failed to save changes. Please try again.')
        }
      },
      renderRowActions: ({ row, table }) => (
        <div className="flex gap-2">
          <button
            onClick={() => table.setEditingRow(row)}
            className="p-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary hover:text-white transition-all"
            title="Edit row"
          >
            <Edit2 size={16} />
          </button>
        </div>
      ),
      renderDetailPanel: ({ row }) => {
        const booking = row.original
        // Get traveller details from the booking data
        const travellerDetails = booking.travellerDetails || []
        
        if (!travellerDetails || travellerDetails.length === 0) {
          return (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-500 text-sm italic">No traveller details available for this booking.</p>
            </div>
          )
        }

        return (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
            <h3 className="text-lg font-black uppercase text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-secondary" />
              Traveller Details ({travellerDetails.length} {travellerDetails.length === 1 ? 'Person' : 'People'})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {travellerDetails.map((traveller: any, index: number) => {
                const isEditing = editingTraveller?.bookingId === booking.bookingId && editingTraveller?.index === index
                
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-black text-sm">
                          {index + 1}
                        </div>
                        <h4 className="font-black text-gray-800 text-sm uppercase">
                          Traveller {index + 1}
                        </h4>
                      </div>
                      {canEdit && !isEditing && (
                        <button
                          onClick={() => handleEditTraveller(booking.bookingId, index, traveller)}
                          className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all"
                          title="Edit traveller"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-3 text-sm">
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">Name</label>
                          <input
                            type="text"
                            value={editedTravellerData.name || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">Gender</label>
                          <select
                            value={editedTravellerData.gender || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, gender: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">Date of Birth</label>
                          <input
                            type="date"
                            value={editedTravellerData.dateOfBirth || editedTravellerData.dob || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, dateOfBirth: e.target.value, dob: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">Phone</label>
                          <input
                            type="tel"
                            value={editedTravellerData.phone || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, phone: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">Emergency Contact</label>
                          <input
                            type="tel"
                            value={editedTravellerData.emergencyContact || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, emergencyContact: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">Email</label>
                          <input
                            type="email"
                            value={editedTravellerData.email || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, email: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">City</label>
                          <input
                            type="text"
                            value={editedTravellerData.city || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, city: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 font-semibold text-xs block mb-1">State</label>
                          <input
                            type="text"
                            value={editedTravellerData.state || ''}
                            onChange={(e) => setEditedTravellerData({ ...editedTravellerData, state: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleSaveTraveller(booking, index)}
                            className="flex-1 px-3 py-2 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-secondary/90 transition-all"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-400 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm">
                        {traveller.name && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">Name:</span>
                            <span className="text-gray-800 font-bold">{traveller.name}</span>
                          </div>
                        )}
                        {traveller.gender && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">Gender:</span>
                            <span className="text-gray-800 font-bold">{traveller.gender}</span>
                          </div>
                        )}
                        {(traveller.dob || traveller.dateOfBirth) && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">DOB:</span>
                            <span className="text-gray-800 font-bold">{traveller.dob || traveller.dateOfBirth}</span>
                          </div>
                        )}
                        {traveller.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">Phone:</span>
                            <span className="text-gray-800 font-bold">{traveller.phone}</span>
                          </div>
                        )}
                        {traveller.emergencyContact && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">Emergency:</span>
                            <span className="text-gray-800 font-bold">{traveller.emergencyContact}</span>
                          </div>
                        )}
                        {traveller.email && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">Email:</span>
                            <span className="text-gray-800 font-bold text-xs">{traveller.email}</span>
                          </div>
                        )}
                        {traveller.city && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">City:</span>
                            <span className="text-gray-800 font-bold">{traveller.city}</span>
                          </div>
                        )}
                        {traveller.state && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 font-semibold">State:</span>
                            <span className="text-gray-800 font-bold">{traveller.state}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      },
      onRowSelectionChange: setRowSelection,
      state: { 
        isLoading: loading,
        rowSelection 
      },
      initialState: {
        showColumnFilters: false,
        showGlobalFilter: true,
        density: 'compact',
        pagination: { pageSize: 20, pageIndex: 0 },
      },
      muiTableProps: {
        sx: { 
          backgroundColor: '#ffffff',
          width: '100%',
          tableLayout: 'auto',
        },
      },
      muiTableContainerProps: {
        sx: {
          width: '100%',
          maxHeight: { xs: '400px', sm: '500px', md: '600px', lg: '700px', xl: '800px' },
          '&::-webkit-scrollbar': { width: '8px', height: '8px' },
          '&::-webkit-scrollbar-track': { background: '#f1f5f9', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb': { background: '#6495ED', borderRadius: '4px' },
          '&::-webkit-scrollbar-thumb:hover': { background: '#5080d9' },
        },
      },
      muiTableHeadCellProps: {
        sx: {
          backgroundColor: '#6495ED',
          color: '#ffffff',
          fontWeight: '900',
          fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
          borderBottom: '2px solid #5080d9',
          padding: { xs: '6px', sm: '8px', md: '10px' },
        },
      },
      muiTableBodyCellProps: {
        sx: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
          padding: { xs: '8px', sm: '10px', md: '12px' },
          borderBottom: '1px solid #e2e8f0',
        },
      },
      muiTableBodyRowProps: ({ row }) => ({
        sx: {
          backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#f8fafc',
          '&:hover': { backgroundColor: '#e0e7ff' },
        },
      }),
      muiTablePaperProps: {
        sx: {
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          borderRadius: '12px',
          overflow: 'hidden',
        },
      },
      muiTopToolbarProps: {
        sx: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginBottom: '16px',
          padding: { xs: '8px', md: '12px' },
        },
      },
      muiBottomToolbarProps: {
        sx: {
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          marginTop: '16px',
          color: '#1e293b',
        },
      },
      muiSearchTextFieldProps: {
        sx: {
          '& .MuiInputBase-root': {
            backgroundColor: '#ffffff',
            color: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
          },
          '& .MuiInputBase-input': { color: '#1e293b' },
          '& .MuiInputLabel-root': { color: '#64748b' },
          '& .MuiSvgIcon-root': { color: '#6495ED' },
        },
      },
      muiPaginationProps: {
        sx: {
          '& .MuiPaginationItem-root': {
            color: '#1e293b',
            fontSize: { xs: '0.75rem', md: '0.875rem' },
          },
          '& .Mui-selected': { backgroundColor: '#6495ED !important', color: '#fff' },
        },
      },
      renderTopToolbarCustomActions: () => {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
        const hasSelection = selectedRows.length > 0
        
        return (
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleExportBookingsPDF()}
              startIcon={<FileDown size={14} />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#6495ED',
                color: '#6495ED',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                padding: '6px 16px',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#5080d9',
                  backgroundColor: 'rgba(100, 149, 237, 0.1)',
                },
              }}
            >
              Export Summary
            </Button>
            <Button
              onClick={() => handleExportBookingsWithTravellersPDF()}
              startIcon={<Users size={14} />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: '#0D7377',
                color: '#0D7377',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: '0.05em',
                padding: '6px 16px',
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#0a5a5d',
                  backgroundColor: 'rgba(13, 115, 119, 0.1)',
                },
              }}
            >
              Export with Travellers
            </Button>
            {hasSelection && (
              <>
                <Button
                  onClick={() => handleExportBookingsPDF(selectedRows)}
                  startIcon={<FileDown size={14} />}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#6495ED',
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: '#5080d9' },
                  }}
                >
                  Export Selected ({selectedRows.length})
                </Button>
                <Button
                  onClick={() => handleExportBookingsWithTravellersPDF(selectedRows)}
                  startIcon={<Users size={14} />}
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: '#0D7377',
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: '#0a5a5d' },
                  }}
                >
                  With Travellers ({selectedRows.length})
                </Button>
              </>
            )}
          </div>
        )
      },
    })

    return <MaterialReactTable table={table} />
  }

  return (
    <PermissionGuard requiredPermission="view_data_filters">
      <div className="min-h-screen bg-white text-white p-4 pb-28 pt-24 sm:p-6 sm:pb-28 sm:pt-24 md:p-10 md:pb-28 lg:p-12 lg:pb-12">
        <div className="max-w-[1800px] mx-auto pt-20">
          {/* Back to Dashboard Button */}
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-white/50 font-black text-[10px] uppercase tracking-[0.24em] hover:text-secondary transition-all"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </Link>

          {/* Header */}
          <header className="mb-10">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Advanced Analytics</span>
            <h1 className="text-3xl md:text-5xl font-bungee font-black tracking-tighter uppercase italic leading-none mt-3">
              Data <span className="text-primary">Filters</span>
            </h1>
            <p className="text-white/45 font-medium italic mt-3 max-w-2xl">
              Filter and analyze trips by category, experience type, view all registered users with advanced search capabilities and booking status, and manage all bookings with detailed customer and payment information.
            </p>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="liquid-glass-dark border border-white/10 rounded-2xl p-6 flex items-center gap-4"
              >
                <div className={`w-12 h-12 rounded-xl ${stat.color} border flex items-center justify-center`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[9px] text-white/35 font-black uppercase tracking-[0.24em]">{stat.label}</p>
                  <p className="text-2xl font-sans font-black text-white mt-1">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] transition-all whitespace-nowrap ${
                activeTab === 'trips'
                  ? 'bg-secondary text-white'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Package size={16} />
              Trips Data
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] transition-all whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-secondary text-white'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Users size={16} />
              Users Data
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] transition-all whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'bg-secondary text-white'
                  : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }`}
            >
              <Calendar size={16} />
              Bookings Data
            </button>
          </div>

          {/* Data Tables */}
          <div className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 overflow-hidden w-full">
            <ThemeProvider theme={lightTheme}>
              {activeTab === 'trips' && <TripsTable />}
              {activeTab === 'users' && <UsersTable />}
              {activeTab === 'bookings' && <BookingsTable />}
            </ThemeProvider>
          </div>

          {/* Feature Info */}
          <div className="mt-8 liquid-glass-dark border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <Filter className="text-blue-400 mt-1" size={20} />
              <div>
                <h3 className="text-lg font-black text-white mb-2">Advanced Features</h3>
                <ul className="text-sm text-white/60 space-y-2 font-medium">
                  <li>• <strong>Global Search:</strong> Use the search bar to search across all columns</li>
                  <li>• <strong>Column Filters:</strong> Click filter icon on any column header to filter data</li>
                  <li>• <strong>Sorting:</strong> Click column headers to sort ascending/descending</li>
                  <li>• <strong>Row Selection:</strong> Select rows using checkboxes for bulk export</li>
                  <li>• <strong>Export Summary:</strong> Export booking overview to PDF (table format)</li>
                  <li>• <strong>Export with Travellers:</strong> Export detailed report including all traveller information</li>
                  <li>• <strong>Expandable Rows:</strong> Click arrow to view traveller details for each booking</li>
                  <li>• <strong>Edit Traveller Info:</strong> Click edit icon on any traveller card to update their information</li>
                  <li>• <strong>Column Ordering:</strong> Drag and drop column headers to reorder</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  )
}

export default DataFilters
