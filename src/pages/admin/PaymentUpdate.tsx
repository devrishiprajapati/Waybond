import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, CheckCircle2, CreditCard, Mail, MapPin, Percent, Search, UserRound, X } from 'lucide-react'
import PermissionGuard from '../../components/PermissionGuard'

type BookingUser = {
  id: string
  name: string
  email: string
}

type PaymentBooking = Record<string, unknown> & {
  id: string
  bookingDbId: string
  user: BookingUser
}

type PaymentTrip = {
  tripId: string
  title: string
  location: string
  nextBatch: string
  bookings: PaymentBooking[]
}

type PaymentUpdateData = {
  paymentMethods: string[]
  paymentStatuses: string[]
  trips: PaymentTrip[]
}

const DEFAULT_PAYMENT_METHODS = ['Online', 'Cash', 'Cheque', 'Credit Card']
const DEFAULT_PAYMENT_STATUSES = ['Pending Payment', 'Paid', 'Failed', 'Refunded', 'Partially Paid', 'Cancelled']
const REFUND_PERCENTAGES = [25, 50, 75, 100]
const bookingText = (booking: Record<string, unknown>, key: string, fallback = '') => String(booking[key] || fallback)
const bookingNumber = (booking: Record<string, unknown>, key: string, fallback = 0) => {
  const value = Number(booking[key] ?? fallback)
  return Number.isFinite(value) ? value : fallback
}
const bookingPaymentMethod = (booking: Record<string, unknown>) => bookingText(booking, 'paymentMethod') || (DEFAULT_PAYMENT_METHODS.includes(bookingText(booking, 'paymentStatus')) ? bookingText(booking, 'paymentStatus') : '')
const bookingPaymentStatus = (booking: Record<string, unknown>) => {
  const status = bookingText(booking, 'paymentStatus', 'Pending Payment')
  return DEFAULT_PAYMENT_METHODS.includes(status) ? 'Paid' : status
}
const bookingRefundPercentage = (booking: Record<string, unknown>) => bookingNumber(booking, 'refundPercentage', 100)
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Date pending'

export default function PaymentUpdate() {
  const navigate = useNavigate()
  const [data, setData] = useState<PaymentUpdateData>({ paymentMethods: DEFAULT_PAYMENT_METHODS, paymentStatuses: DEFAULT_PAYMENT_STATUSES, trips: [] })
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [updatingBookingId, setUpdatingBookingId] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirmedPopup, setConfirmedPopup] = useState<{ bookingId: string; paymentMethod: string; paymentStatus: string } | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }

    const loadPayments = async () => {
      try {
        const response = await fetch('/api/admin/payment-updates')
        const payload = await response.json()
        if (!response.ok) throw new Error(payload.message || 'Unable to load payment updates.')
        setData({
          paymentMethods: payload.paymentMethods || DEFAULT_PAYMENT_METHODS,
          paymentStatuses: payload.paymentStatuses || DEFAULT_PAYMENT_STATUSES,
          trips: payload.trips || []
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load payment updates.')
      } finally {
        setLoading(false)
      }
    }

    void loadPayments()
  }, [navigate])

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return data.trips

    return data.trips
      .map((trip) => ({
        ...trip,
        bookings: trip.bookings.filter((booking) => {
          const haystack = [
            trip.title,
            trip.location,
            booking.user?.name,
            booking.user?.email,
            bookingText(booking, 'bookingId'),
            bookingPaymentMethod(booking),
            bookingPaymentStatus(booking)
          ].join(' ').toLowerCase()
          return haystack.includes(query)
        })
      }))
      .filter((trip) => trip.bookings.length > 0 || `${trip.title} ${trip.location}`.toLowerCase().includes(query))
  }, [data.trips, search])

  const totalBookings = data.trips.reduce((count, trip) => count + trip.bookings.length, 0)

  const updatePaymentField = async (bookingId: string, payload: { paymentMethod?: string; paymentStatus?: string; refundPercentage?: number }) => {
    setError('')
    setUpdatingBookingId(bookingId)

    try {
      const response = await fetch(`/api/bookings/${bookingId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const updatedBooking = await response.json()
      if (!response.ok) throw new Error(updatedBooking.message || 'Unable to update payment details.')

      setData((current) => ({
        ...current,
        trips: current.trips.map((trip) => ({
          ...trip,
          bookings: trip.bookings.map((booking) => booking.bookingDbId === bookingId ? { ...booking, ...updatedBooking } : booking)
        }))
      }))
      if (payload.paymentStatus === 'Paid') {
        setConfirmedPopup({
          bookingId: bookingText(updatedBooking, 'bookingId', bookingId),
          paymentMethod: bookingPaymentMethod(updatedBooking) || 'Not specified',
          paymentStatus: bookingText(updatedBooking, 'paymentStatus', 'Paid')
        })
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update payment details.')
    } finally {
      setUpdatingBookingId('')
    }
  }

  return (
    <PermissionGuard requiredPermission="view_bookings">
      <div className="min-h-screen bg-white text-white px-4 sm:px-6 md:px-10 lg:px-16 pt-24 md:pt-32 pb-28 lg:pb-20">
        {confirmedPopup && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-[2rem] border border-green-500/20 bg-white p-7 text-center text-slate-950 shadow-2xl">
              <button
                type="button"
                onClick={() => setConfirmedPopup(null)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close payment confirmation"
              >
                <X size={20} />
              </button>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 size={34} strokeWidth={2.5} />
              </div>
              <p className="text-2xl font-black">Payment Confirmed</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                Booking {confirmedPopup.bookingId} is confirmed with {confirmedPopup.paymentMethod} payment marked {confirmedPopup.paymentStatus}. The user can now view and download the invoice.
              </p>
              <button
                type="button"
                onClick={() => setConfirmedPopup(null)}
                className="mt-6 h-12 w-full rounded-full bg-secondary px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-lg shadow-secondary/20 transition-all hover:bg-secondary/90 active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        )}
        <div className="max-w-[1500px] mx-auto">
          <div className="mb-9">
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"><ArrowLeft size={15} /> Admin dashboard</Link>
            <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">Trip-wise payments</p>
            <h1 className="text-4xl md:text-6xl font-sans font-black uppercase italic tracking-tighter liquid-text font-bungee">Payment <span className="text-primary font-bungee">Update</span></h1>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 mb-7">
            <label className="relative">
              <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search trip, user, email, booking ID..." className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary" />
            </label>
            <div className="h-12 px-5 rounded-2xl bg-secondary/15 text-secondary border border-secondary/20 flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.16em]"><CreditCard size={16} /> {totalBookings} bookings</div>
            <div className="h-12 px-5 rounded-2xl bg-white/5 text-white/55 border border-white/10 flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.16em]"><CalendarDays size={16} /> {data.trips.length} trips</div>
          </section>

          {error && <div className="mb-5 liquid-glass-dark border border-red-500/20 rounded-2xl p-4 text-red-300 text-sm font-bold">{error}</div>}
          {loading && <div className="liquid-glass-dark border border-white/10 rounded-[2rem] p-8 text-white/45 font-bold">Loading payment updates...</div>}

          {!loading && filteredTrips.length === 0 && (
            <div className="liquid-glass-dark border border-white/10 rounded-[2rem] p-10 text-center text-white/45">No bookings found for payment updates.</div>
          )}

          <div className="space-y-6">
            {filteredTrips.map((trip) => (
              <section key={trip.tripId} className="liquid-glass-dark border border-white/10 rounded-[2rem] overflow-hidden">
                <div className="p-5 md:p-6 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-sans font-black uppercase italic text-white">{trip.title}</h2>
                    <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      <span className="flex items-center gap-2"><MapPin size={13} className="text-secondary" /> {trip.location}</span>
                      <span className="flex items-center gap-2"><CalendarDays size={13} className="text-secondary" /> {formatDate(trip.nextBatch)}</span>
                    </div>
                  </div>
                  <span className="px-4 py-2 rounded-full bg-secondary/15 text-secondary text-[9px] font-black uppercase tracking-[0.16em]">{trip.bookings.length} traveller booking{trip.bookings.length === 1 ? '' : 's'}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1220px] text-left">
                    <thead className="text-[9px] uppercase tracking-[0.18em] text-white/35 border-b border-white/10">
                      <tr>
                        <th className="p-5">Traveller</th>
                        <th className="p-5">Booking</th>
                        <th className="p-5">Travellers</th>
                        <th className="p-5">Booking Status</th>
                        <th className="p-5 w-60">Payment Method</th>
                        <th className="p-5 w-60">Payment Status</th>
                        <th className="p-5 w-56">Refund</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trip.bookings.map((booking, index) => {
                        const paymentStatus = bookingPaymentStatus(booking)
                        const paymentMethod = bookingPaymentMethod(booking)
                        const refundPercentage = bookingRefundPercentage(booking)
                        const refundAmount = bookingNumber(booking, 'refundAmount')
                        const methodOptions = paymentMethod && data.paymentMethods.includes(paymentMethod) ? data.paymentMethods : [paymentMethod, ...data.paymentMethods].filter(Boolean)
                        const statusOptions = data.paymentStatuses.includes(paymentStatus) ? data.paymentStatuses : [paymentStatus, ...data.paymentStatuses]
                        const isUpdating = updatingBookingId === booking.bookingDbId

                        return (
                          <tr key={booking.bookingDbId || `${trip.tripId}-${index}`} className="border-b border-white/5 last:border-0">
                            <td className="p-5">
                              <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center"><UserRound size={17} /></span>
                                <div>
                                  <p className="text-sm font-bold text-white">{booking.user?.name || 'Traveller'}</p>
                                  <p className="text-xs text-white/50 mt-1 flex items-center gap-1"><Mail size={12} className="text-secondary" /> {booking.user?.email || 'Email pending'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-white/60 text-sm font-bold">{bookingText(booking, 'bookingId', `Booking ${index + 1}`)}</td>
                            <td className="p-5 text-white/60 text-sm font-bold">{bookingText(booking, 'travelers', '1')}</td>
                            <td className="p-5"><span className="px-3 py-2 rounded-full bg-white/5 text-white/55 text-[9px] font-black uppercase tracking-[0.14em]">{bookingText(booking, 'status', 'Booked')}</span></td>
                            <td className="p-5">
                              <select disabled={isUpdating} value={paymentMethod} onChange={(event) => void updatePaymentField(booking.bookingDbId, { paymentMethod: event.target.value })} className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-secondary disabled:opacity-60">
                                <option value="">Select method</option>
                                {methodOptions.map((method) => <option key={method} value={method}>{method}</option>)}
                              </select>
                            </td>
                            <td className="p-5">
                              <select disabled={isUpdating} value={paymentStatus} onChange={(event) => {
                                const nextStatus = event.target.value
                                void updatePaymentField(booking.bookingDbId, {
                                  paymentStatus: nextStatus,
                                  ...(nextStatus === 'Refunded' ? { refundPercentage } : {})
                                })
                              }} className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white outline-none focus:border-secondary disabled:opacity-60">
                                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                              </select>
                              {isUpdating && <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.14em] mt-2">Updating...</p>}
                            </td>
                            <td className="p-5">
                              {paymentStatus === 'Refunded' ? (
                                <div className="space-y-2">
                                  <label className="relative block">
                                    <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                    <input
                                      key={`${booking.bookingDbId}-${refundPercentage}`}
                                      disabled={isUpdating}
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.01"
                                      defaultValue={refundPercentage}
                                      onBlur={(event) => {
                                        const nextPercentage = Number(event.target.value)
                                        if (!Number.isFinite(nextPercentage)) return
                                        void updatePaymentField(booking.bookingDbId, { paymentStatus: 'Refunded', refundPercentage: nextPercentage })
                                      }}
                                      onKeyDown={(event) => {
                                        if (event.key !== 'Enter') return
                                        event.currentTarget.blur()
                                      }}
                                      className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-9 pr-8 text-sm text-white outline-none focus:border-secondary disabled:opacity-60"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-white/35">%</span>
                                  </label>
                                  <div className="grid grid-cols-4 gap-1">
                                    {REFUND_PERCENTAGES.map((percentage) => (
                                      <button
                                        key={percentage}
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() => void updatePaymentField(booking.bookingDbId, { paymentStatus: 'Refunded', refundPercentage: percentage })}
                                        className="h-7 rounded-lg bg-white/5 text-[9px] font-black text-white/45 transition-colors hover:bg-secondary/15 hover:text-secondary disabled:opacity-60"
                                      >
                                        {percentage}%
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/40">
                                    Refund Rs. {refundAmount.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-white/30">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </PermissionGuard>
  )
}
