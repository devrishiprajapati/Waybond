import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MaterialReactTable, type MRT_ColumnDef, useMaterialReactTable } from 'material-react-table'
import { Button, ThemeProvider, createTheme } from '@mui/material'
import { Filter, Database, Users, Package, FileDown, ArrowLeft, Calendar } from 'lucide-react'
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
}

const DataFilters = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'trips' | 'users' | 'bookings'>('trips')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    loadData()
  }, [navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      const [tripsRes, usersRes, bookingsRes] = await Promise.all([
        fetch('/api/trips'),
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
      },
      {
        accessorKey: 'title',
        header: 'Trip',
        size: 200,
        grow: true,
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 150,
        grow: true,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 130,
        grow: false,
        filterVariant: 'select',
      },
      {
        accessorKey: 'experience',
        header: 'Experience',
        size: 140,
        grow: false,
        filterVariant: 'select',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        size: 120,
        grow: false,
        Cell: ({ cell }) => `₹${cell.getValue<number>().toLocaleString('en-IN')}`,
      },
      {
        accessorKey: 'duration',
        header: 'Duration',
        size: 120,
        grow: false,
      },
      {
        accessorKey: 'nextBatch',
        header: 'Next Batch',
        size: 150,
        grow: false,
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
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 150,
        grow: true,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 220,
        grow: true,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 110,
        grow: false,
        filterVariant: 'select',
      },
      {
        accessorKey: 'bookingStatus',
        header: 'Booking',
        size: 140,
        grow: false,
        filterVariant: 'select',
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
      },
      {
        accessorKey: 'lastLoginAt',
        header: 'Last Login',
        size: 120,
        grow: false,
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
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 150,
        grow: true,
      },
      {
        accessorKey: 'customerEmail',
        header: 'Email',
        size: 200,
        grow: true,
      },
      {
        accessorKey: 'tripName',
        header: 'Trip Name',
        size: 180,
        grow: true,
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 140,
        grow: true,
      },
      {
        accessorKey: 'travelers',
        header: 'Travelers',
        size: 100,
        grow: false,
      },
      {
        accessorKey: 'total',
        header: 'Total',
        size: 120,
        grow: false,
        Cell: ({ cell }) => `₹${cell.getValue<number>().toLocaleString('en-IN')}`,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        grow: false,
        filterVariant: 'select',
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

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: Package, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-green-500/20 text-green-400 border-green-500/20' },
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
    { label: 'Categories', value: new Set(trips.map(t => t.category)).size, icon: Filter, color: 'bg-orange-500/20 text-orange-400 border-orange-500/20' },
  ]

  // Trips Table Component
  const TripsTable = () => {
    const [rowSelection, setRowSelection] = useState({})

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
              Export All
            </Button>
            {hasSelection && (
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
                  ? 'bg-secondary text-white shadow-xl shadow-secondary/20'
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
                  ? 'bg-secondary text-white shadow-xl shadow-secondary/20'
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
                  ? 'bg-secondary text-white shadow-xl shadow-secondary/20'
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
                <h3 className="text-lg font-black text-white mb-2">Advanced Filtering Features</h3>
                <ul className="text-sm text-white/60 space-y-2 font-medium">
                  <li>• <strong>Global Search:</strong> Use the search bar to search across all columns</li>
                  <li>• <strong>Column Filters:</strong> Click filter icon on any column header to filter data</li>
                  <li>• <strong>Sorting:</strong> Click column headers to sort ascending/descending</li>
                  <li>• <strong>Row Selection:</strong> Select rows using checkboxes for bulk export</li>
                  <li>• <strong>Export All:</strong> Export all visible data to PDF</li>
                  <li>• <strong>Export Selected:</strong> Select specific rows and export only those to PDF</li>
                  <li>• <strong>Booking Status:</strong> View user booking status with color-coded badges</li>
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
