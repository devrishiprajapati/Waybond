import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, FileUp, LoaderCircle, Ticket, Upload, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import PermissionGuard from '../../components/PermissionGuard'

type TicketMeta = {
  id: string
  passengerName: string
  ticketType: string
  fileName: string
  mimeType: string
  uploadedAt: string
}

type ConfirmedBooking = {
  id: string
  bookingId: string
  tripId: string
  title: string
  location: string
  departure: string
  user: { id: string; name: string; email: string }
  passengers: string[]
  tickets: TicketMeta[]
}

const ACCEPTED_TICKET_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const TICKET_TYPES = ['Train Ticket', 'Flight Ticket', 'Bus Ticket', 'Other Travel Ticket']
const formatDate = (value: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Departure pending'

export default function TicketManagement() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<ConfirmedBooking[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState('')
  const [passengerName, setPassengerName] = useState('')
  const [ticketType, setTicketType] = useState(TICKET_TYPES[0])
  const [ticketFile, setTicketFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedBooking = useMemo(() => bookings.find((booking) => booking.id === selectedBookingId) || null, [bookings, selectedBookingId])

  const handlePendingClick = (bookingId: string, passenger: string) => {
    setSelectedBookingId(bookingId)
    setPassengerName(passenger)
    setTicketFile(null)
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const loadBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/tickets')
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Unable to load confirmed trips.')
      const nextBookings = Array.isArray(payload) ? payload : []
      setBookings(nextBookings)
      setSelectedBookingId((current) => current && nextBookings.some((booking) => booking.id === current) ? current : nextBookings[0]?.id || '')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load confirmed trips.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    void loadBookings()
  }, [navigate])

  useEffect(() => {
    setPassengerName(selectedBooking?.passengers[0] || '')
    setTicketFile(null)
  }, [selectedBookingId])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setError('')
    if (!file) return setTicketFile(null)
    if (!ACCEPTED_TICKET_TYPES.includes(file.type)) {
      setTicketFile(null)
      event.target.value = ''
      setError('Choose a PDF, JPG, PNG, or WEBP ticket.')
      return
    }
    if (file.size > 12 * 1024 * 1024) {
      setTicketFile(null)
      event.target.value = ''
      setError('Ticket files must be 12 MB or smaller.')
      return
    }
    setTicketFile(file)
  }

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!selectedBooking || !passengerName || !ticketFile) {
      setError('Select a confirmed trip, passenger, and ticket file.')
      return
    }

    setUploading(true)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result || ''))
        reader.onerror = () => reject(new Error('Unable to read the ticket file.'))
        reader.readAsDataURL(ticketFile)
      })
      const response = await fetch(`/api/admin/tickets/${selectedBooking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passengerName, ticketType, fileName: ticketFile.name, mimeType: ticketFile.type, dataUrl, uploadedBy: JSON.parse(sessionStorage.getItem('adminData') || '{}').id })
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message || 'Unable to upload ticket.')

      setBookings((current) => current.map((booking) => booking.id === selectedBooking.id
        ? { ...booking, tickets: [...booking.tickets.filter((ticket) => ticket.passengerName.toLowerCase() !== passengerName.toLowerCase()), payload.ticket] }
        : booking))
      setTicketFile(null)
      setSuccess(`Ticket uploaded for ${passengerName}. The traveller has been notified.`)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload ticket.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <PermissionGuard requiredPermission="view_bookings">
      <div className="min-h-screen bg-white px-4 pb-28 pt-24 text-slate-900 sm:px-6 lg:px-12 lg:pb-12">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Link to="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 transition-colors hover:text-secondary"><ArrowLeft size={15} /> Admin dashboard</Link>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-secondary">Confirmed departures</p>
              <h1 className="mt-2 text-3xl font-black uppercase text-slate-900 sm:text-4xl">Ticket management</h1>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><Ticket size={18} className="text-secondary" /> {bookings.length} confirmed bookings</div>
          </header>

          <section className="liquid-glass-dark rounded-lg border border-slate-200 p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary"><Upload size={18} /></div><div><h2 className="font-bold text-slate-900">Upload traveller ticket</h2><p className="text-sm text-slate-600">Attach a ticket to a passenger on a confirmed booking.</p></div></div>
            <form onSubmit={handleUpload} className="grid gap-5 lg:grid-cols-4 lg:items-end">
              <label className="block text-sm font-semibold text-slate-700">Confirmed trip
                <select value={selectedBookingId} onChange={(event) => setSelectedBookingId(event.target.value)} disabled={loading || !bookings.length} className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 disabled:bg-slate-100 disabled:opacity-60">
                  {bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.title} - {booking.user.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">Passenger
                <select value={passengerName} onChange={(event) => setPassengerName(event.target.value)} disabled={!selectedBooking} className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 disabled:bg-slate-100 disabled:opacity-60">
                  {selectedBooking?.passengers.map((passenger) => <option key={passenger} value={passenger}>{passenger}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">Ticket type
                <select value={ticketType} onChange={(event) => setTicketType(event.target.value)} disabled={!selectedBooking} className="mt-2 h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/15 disabled:bg-slate-100 disabled:opacity-60">
                  {TICKET_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-700">Ticket file
                <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={!selectedBooking} className="mt-2 block h-12 w-full rounded-md border border-dashed border-slate-300 bg-white px-3 py-3 text-xs text-slate-600 file:mr-3 file:border-0 file:bg-transparent file:text-xs file:font-bold file:text-secondary disabled:bg-slate-100 disabled:opacity-60" />
              </label>
              <div className="lg:col-span-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
                <p className="text-xs text-white/45">PDF, JPG, PNG, or WEBP. Maximum file size: 12 MB. Re-uploading replaces this passenger’s current ticket.</p>
                <button type="submit" disabled={uploading || !selectedBooking || !ticketFile} className="inline-flex h-11 items-center gap-2 rounded-md bg-secondary px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40">
                  {uploading ? <LoaderCircle size={16} className="animate-spin" /> : <FileUp size={16} />} {uploading ? 'Uploading' : 'Upload ticket'}
                </button>
              </div>
            </form>
            {error && <p className="mt-5 border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">{error}</p>}
            {success && <p className="mt-5 border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">{success}</p>}
          </section>

          <section className="liquid-glass-dark mt-8 overflow-hidden rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7"><div className="flex items-center gap-3"><UsersRound size={18} className="text-secondary" /><h2 className="font-bold text-slate-900">Passenger ticket status</h2></div><button type="button" onClick={() => void loadBookings()} className="text-[10px] font-black uppercase tracking-[0.14em] text-secondary hover:text-primary">Refresh</button></div>
            {loading ? <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" /> Loading confirmed bookings</div> : bookings.length === 0 ? <div className="px-6 py-16 text-center text-sm text-slate-500">No confirmed bookings are ready for ticket upload.</div> : <div className="divide-y divide-slate-200">
              {bookings.map((booking) => <article key={booking.id} className="px-5 py-5 sm:px-7"><div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><h3 className="font-bold text-white">{booking.title}</h3><p className="mt-1 text-sm text-white/50">{booking.location} · {formatDate(booking.departure)} · {booking.bookingId}</p></div><p className="text-sm text-white/55">Account: {booking.user.name}</p></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{booking.passengers.map((passenger) => { const ticket = booking.tickets.find((item) => item.passengerName.toLowerCase() === passenger.toLowerCase()); const isPending = !ticket; return <div key={passenger} onClick={() => isPending && handlePendingClick(booking.id, passenger)} className={`flex min-w-0 items-center justify-between gap-3 border border-white/10 bg-white/[0.03] px-3 py-3 ${isPending ? 'cursor-pointer transition-all hover:border-amber-300/40 hover:bg-amber-300/5' : ''}`}><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{passenger}</p><p className="truncate text-xs text-white/45">{ticket ? ticket.fileName : 'Ticket not uploaded'}</p></div>{ticket ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <span className="text-[9px] font-black uppercase tracking-[0.12em] text-amber-300">Pending</span>}</div> })}</div></article>)}
            </div>}
          </section>
        </div>
      </div>
    </PermissionGuard>
  )
}
