import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, CalendarDays, ClipboardList, CreditCard, Mail, MapPin, MessageSquareText, Percent, Phone, ShieldCheck, Star, UserRound, type LucideIcon } from 'lucide-react'
import TransferPackageModal from './TransferPackageModal'

type UserDetailData = {
  user: {
    id: string
    name: string
    email: string
    role?: string
    joinedAt: string
    lastLoginAt: string
    profile?: Record<string, unknown>
  }
  bookings: Array<Record<string, unknown>>
  testimonials: Array<{ id: string; trip: string; review: string; rating: number; createdAt: string }>
}

const PAYMENT_METHOD_OPTIONS = ['Online', 'Cash', 'Cheque', 'Credit Card']
const PAYMENT_STATUS_OPTIONS = ['Pending Payment', 'Paid', 'Failed', 'Refunded', 'Partially Paid', 'Cancelled']
const REFUND_PERCENTAGES = [25, 50, 75, 100]
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not available'
const profileValue = (profile: Record<string, unknown> | undefined, key: string) => String(profile?.[key] || 'Not provided')
const bookingText = (booking: Record<string, unknown>, key: string, fallback = '') => String(booking[key] || fallback)
const bookingNumber = (booking: Record<string, unknown>, key: string, fallback = 0) => {
  const value = Number(booking[key] ?? fallback)
  return Number.isFinite(value) ? value : fallback
}
const bookingDbId = (booking: Record<string, unknown>) => bookingText(booking, 'bookingDbId', bookingText(booking, 'id'))
const bookingPaymentMethod = (booking: Record<string, unknown>) => bookingText(booking, 'paymentMethod') || (PAYMENT_METHOD_OPTIONS.includes(bookingText(booking, 'paymentStatus')) ? bookingText(booking, 'paymentStatus') : '')
const bookingPaymentStatus = (booking: Record<string, unknown>) => {
  const status = bookingText(booking, 'paymentStatus', 'Pending Payment')
  return PAYMENT_METHOD_OPTIONS.includes(status) ? 'Paid' : status
}
const bookingRefundPercentage = (booking: Record<string, unknown>) => bookingNumber(booking, 'refundPercentage', 100)

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<UserDetailData | null>(null)
  const [error, setError] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [updatingPaymentId, setUpdatingPaymentId] = useState('')
  const [transferModalBooking, setTransferModalBooking] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    if (!id) return

    const loadUser = async () => {
      try {
        const response = await fetch(`/api/users/${id}/dashboard`)
        if (!response.ok) throw new Error('Unable to load this user.')
        setData(await response.json())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load this user.')
      }
    }
    void loadUser()
  }, [id, navigate])

  if (error) return <div className="min-h-screen bg-white text-white px-4 sm:px-6 pt-24 md:pt-32 pb-28"><div className="max-w-5xl mx-auto liquid-glass-dark border border-white/10 rounded-[2rem] p-6 md:p-10"><Link to="/admin/users" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-6"><ArrowLeft size={15} /> Back to users</Link><p className="text-red-300 font-bold">{error}</p></div></div>
  if (!data) return <div className="min-h-screen bg-white text-white px-4 sm:px-6 pt-24 md:pt-32 pb-28"><div className="max-w-5xl mx-auto text-white/45 font-bold">Loading user details...</div></div>

  const { user, bookings, testimonials } = data
  const profile = user.profile
  const governmentId = profile?.governmentId as { name?: string } | undefined
  const details = [
    ['Phone', profileValue(profile, 'mobileNumber'), Phone],
    ['Date of birth', profileValue(profile, 'dateOfBirth'), CalendarDays],
    ['Gender', profileValue(profile, 'gender'), UserRound],
    ['Blood group', profileValue(profile, 'bloodGroup'), ShieldCheck],
    ['Address', profileValue(profile, 'address'), MapPin],
    ['Emergency contact', profileValue(profile, 'emergencyContact'), Phone],
    ['Medical information', profileValue(profile, 'medicalInfo'), ClipboardList],
    ['Government ID', governmentId?.name || 'Not provided', ShieldCheck]
  ] as const
  const overview: Array<{ label: string; value: number; Icon: LucideIcon }> = [
    { label: 'Bookings', value: bookings.length, Icon: ClipboardList },
    { label: 'Testimonials', value: testimonials.length, Icon: MessageSquareText },
    { label: 'Profile details', value: details.filter(([, value]) => value !== 'Not provided').length, Icon: UserRound }
  ]

  const handlePaymentFieldChange = async (booking: Record<string, unknown>, payload: { paymentMethod?: string; paymentStatus?: string; refundPercentage?: number }) => {
    const currentBookingDbId = bookingDbId(booking)
    if (!currentBookingDbId) return

    setPaymentError('')
    setUpdatingPaymentId(currentBookingDbId)

    try {
      const response = await fetch(`/api/bookings/${currentBookingDbId}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const updatedBooking = await response.json()
      if (!response.ok) throw new Error(updatedBooking.message || 'Unable to update payment details.')

      setData((current) => current ? {
        ...current,
        bookings: current.bookings.map((item) => bookingDbId(item) === currentBookingDbId ? updatedBooking : item)
      } : current)
    } catch (updateError) {
      setPaymentError(updateError instanceof Error ? updateError.message : 'Unable to update payment details.')
    } finally {
      setUpdatingPaymentId('')
    }
  }

  return (
    <div className="min-h-screen bg-white text-white px-4 sm:px-6 md:px-10 lg:px-16 pt-24 md:pt-32 pb-28 lg:pb-20">
      <div className="max-w-[1500px] mx-auto">
        <Link to="/admin/users" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-7"><ArrowLeft size={15} /> All users</Link>

        <section className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 md:p-9 mb-7 flex flex-col lg:flex-row lg:items-center justify-between gap-7">
          <div className="flex items-center gap-5"><span className="w-16 h-16 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center"><UserRound size={30} /></span><div><p className="text-secondary text-[9px] font-black uppercase tracking-[0.2em] mb-2">Explorer profile</p><h1 className="text-3xl md:text-5xl font-sans font-black uppercase italic tracking-tighter text-white">{user.name}</h1><p className="text-white/55 text-sm mt-2 flex items-center gap-2"><Mail size={14} className="text-secondary" /> {user.email}</p></div></div>
          <div className="flex flex-wrap gap-3 text-[9px] font-black uppercase tracking-[0.16em]"><span className="px-4 py-2 rounded-full bg-secondary/15 text-secondary">{user.role || 'User'}</span><span className="px-4 py-2 rounded-full bg-white/5 text-white/50">Joined {formatDate(user.joinedAt)}</span><span className="px-4 py-2 rounded-full bg-white/5 text-white/50">Last sign in {formatDate(user.lastLoginAt)}</span></div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-7">
          {overview.map(({ label, value, Icon }) => <div key={label} className="liquid-glass-dark border border-white/10 rounded-2xl p-6 flex items-center gap-4"><span className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center"><Icon size={21} /></span><div><p className="text-[9px] text-white/35 font-black uppercase tracking-[0.16em]">{label}</p><p className="text-3xl font-sans font-black text-white mt-1">{value}</p></div></div>)}
        </div>

        <section className="mb-7"><h2 className="text-2xl font-sans font-black uppercase italic text-white mb-4">Personal <span className="text-secondary">Details</span></h2><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">{details.map(([label, value, Icon]) => <div key={label} className="liquid-glass-dark border border-white/10 rounded-2xl p-5"><Icon size={18} className="text-secondary mb-4" /><p className="text-[9px] text-white/35 font-black uppercase tracking-[0.16em] mb-2">{label}</p><p className="text-sm text-white/80 font-semibold break-words">{value}</p></div>)}</div></section>

        <section className="mb-7"><div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4"><h2 className="text-2xl font-sans font-black uppercase italic text-white">Booked <span className="text-secondary">Trips</span></h2>{paymentError && <p className="text-xs font-bold text-red-300">{paymentError}</p>}</div><div className="space-y-4">{bookings.length ? bookings.map((booking, index) => {
          const currentBookingDbId = bookingDbId(booking)
          const paymentMethod = bookingPaymentMethod(booking)
          const paymentStatus = bookingPaymentStatus(booking)
          const refundPercentage = bookingRefundPercentage(booking)
          const refundAmount = bookingNumber(booking, 'refundAmount')
          const isUpdating = updatingPaymentId === currentBookingDbId

          return (
            <article key={currentBookingDbId || String(index)} className="liquid-glass-dark border border-white/10 rounded-2xl p-5 flex flex-col xl:flex-row xl:items-start justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <p className="text-lg font-sans font-black uppercase italic text-white">{bookingText(booking, 'title', bookingText(booking, 'tripTitle', 'WayBond Trip'))}</p>
                      
                      {/* Group Booking Indicator */}
                      {bookingNumber(booking, 'travelers') > 1 && (
                        <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-[8px] font-black uppercase tracking-wider">
                          <UserRound size={11} />
                          Group
                        </span>
                      )}
                      
                      {/* Transfer Badge */}
                      {(booking.transferredFrom || booking.transferredFromTrip || booking.transferredFromBooking) && (
                        <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-[8px] font-black uppercase tracking-wider">
                          <ArrowRightLeft size={11} />
                          Transferred
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/50 mb-3">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-secondary" />
                        {bookingText(booking, 'location', bookingText(booking, 'destination', 'Location pending'))}
                      </span>
                    </div>
                    
                    {/* Package Departure Date */}
                    {(bookingText(booking, 'departureDate') || bookingText(booking, 'departure') || bookingText(booking, 'nextBatch')) && (
                      <div className="mb-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 inline-flex items-center gap-2">
                        <CalendarDays size={16} className="text-green-400" />
                        <div>
                          <p className="text-[8px] text-white/40 font-black uppercase tracking-wider">Departure Date</p>
                          <p className="text-sm text-white font-bold">
                            {bookingText(booking, 'departureDate') ? 
                              formatDate(bookingText(booking, 'departureDate')) : 
                              bookingText(booking, 'departure') || bookingText(booking, 'nextBatch', 'TBD')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Only show transfer button for primary bookers */}
                  {booking.isPrimaryBooker && (
                    <button onClick={() => setTransferModalBooking(booking)} className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/15 border border-secondary/25 text-secondary text-[9px] font-black uppercase tracking-[0.16em] hover:bg-secondary/25 transition-colors">
                      <ArrowRightLeft size={14} />
                      Transfer Package
                    </button>
                  )}
                </div>

                {/* Transfer Information */}
                {(booking.transferredFrom || booking.transferredFromTrip || booking.transferredFromBooking || (Array.isArray(booking.transferHistory) && booking.transferHistory.length > 0)) && (
                  <div className="mb-4 bg-purple-100/95 backdrop-blur-sm border-2 border-purple-300 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowRightLeft size={18} className="text-purple-600" />
                      <h4 className="text-sm font-black text-purple-700 uppercase tracking-wide">Transfer History</h4>
                      {Array.isArray(booking.transferHistory) && booking.transferHistory.length > 0 && (
                        <span className="text-xs text-purple-700 font-bold ml-auto">
                          {booking.transferHistory.length} Transfer{booking.transferHistory.length > 1 ? 's' : ''} Made
                        </span>
                      )}
                    </div>
                    
                    {/* Show simple transfer info if no detailed history */}
                    {!Array.isArray(booking.transferHistory) || booking.transferHistory.length === 0 ? (
                      <div className="bg-white/90 rounded-lg p-3 border border-purple-200">
                        <p className="text-sm text-gray-800 font-semibold mb-1">
                          <span className="font-black text-gray-900">From:</span> {bookingText(booking, 'transferredFrom', bookingText(booking, 'transferredFromTrip', 'Previous Package'))}
                        </p>
                        {(bookingText(booking, 'transferredOn') || bookingText(booking, 'transferDate')) && (
                          <p className="text-xs text-gray-600">
                            <span className="font-bold">Date:</span> {formatDate(bookingText(booking, 'transferredOn', bookingText(booking, 'transferDate')))}
                          </p>
                        )}
                        {bookingText(booking, 'transferredFromBooking') && (
                          <p className="text-xs text-gray-600">
                            <span className="font-bold">Booking ID:</span> {bookingText(booking, 'transferredFromBooking')}
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Show detailed transfer history - HORIZONTAL GRID LAYOUT */
                      <div className="space-y-2.5">
                        {booking.transferHistory.slice(-2).reverse().map((transfer: any, idx: number) => (
                          <div key={transfer.id || idx} className="bg-white/90 rounded-lg p-3 border border-purple-200 shadow-sm">
                            {/* Admin badge and date - Right aligned */}
                            <div className="flex items-center justify-end gap-2 mb-2.5">
                              {transfer.transferredBy && (
                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold shadow-sm">
                                  <ShieldCheck size={12} />
                                  {transfer.transferredBy}
                                </span>
                              )}
                              {transfer.transferredAt && (
                                <span className="text-xs text-gray-700 font-bold">
                                  {formatDate(transfer.transferredAt)}
                                </span>
                              )}
                            </div>
                            
                            {/* Transfer info - Horizontal layout with packages side by side */}
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                              <div>
                                <p className="text-base font-black text-gray-900 mb-1">{transfer.fromTripTitle}</p>
                                {transfer.fromPrice !== undefined && (
                                  <p className="text-sm text-gray-600 font-semibold">Price: ₹{Number(transfer.fromPrice).toLocaleString('en-IN')}</p>
                                )}
                              </div>
                              
                              <ArrowRightLeft size={20} className="text-purple-500 shrink-0" />
                              
                              <div>
                                <p className="text-base font-black text-gray-900 mb-1">{transfer.toTripTitle}</p>
                                {transfer.toPrice !== undefined && (
                                  <p className="text-sm text-gray-600 font-semibold">Price: ₹{Number(transfer.toPrice).toLocaleString('en-IN')}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {booking.transferHistory.length > 2 && (
                          <p className="text-xs text-purple-600 font-bold italic text-center pt-1">
                            + {booking.transferHistory.length - 2} more transfer{booking.transferHistory.length - 2 > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 text-[9px] font-black uppercase tracking-[0.14em]">
                  <span className="px-3 py-2 rounded-full bg-secondary/15 text-secondary">{bookingText(booking, 'status', 'Booked')}</span>
                  <span className="px-3 py-2 rounded-full bg-white/5 text-white/55">{bookingText(booking, 'bookingId', `Booking ${index + 1}`)}</span>
                  <span className="px-3 py-2 rounded-full bg-white/5 text-white/55">{bookingText(booking, 'travelers', '1')} traveller(s)</span>
                </div>
              </div>
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[48rem]">
                <label>
                  <span className="mb-2 flex items-center gap-2 text-[9px] text-white/40 font-black uppercase tracking-[0.18em]"><CreditCard size={14} className="text-secondary" /> Payment method</span>
                  <select disabled={isUpdating} value={paymentMethod} onChange={(event) => void handlePaymentFieldChange(booking, { paymentMethod: event.target.value })} className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white outline-none focus:border-secondary disabled:opacity-60">
                    <option value="">Select method</option>
                    {PAYMENT_METHOD_OPTIONS.map((method) => <option key={method} value={method}>{method}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-2 flex items-center gap-2 text-[9px] text-white/40 font-black uppercase tracking-[0.18em]"><CreditCard size={14} className="text-secondary" /> Payment status</span>
                  <select disabled={isUpdating} value={paymentStatus} onChange={(event) => {
                    const nextStatus = event.target.value
                    void handlePaymentFieldChange(booking, {
                      paymentStatus: nextStatus,
                      ...(nextStatus === 'Refunded' ? { refundPercentage } : {})
                    })
                  }} className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white outline-none focus:border-secondary disabled:opacity-60">
                    {PAYMENT_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-2 flex items-center gap-2 text-[9px] text-white/40 font-black uppercase tracking-[0.18em]"><Percent size={14} className="text-secondary" /> Refund</span>
                  {paymentStatus === 'Refunded' ? (
                    <>
                      <div className="relative">
                        <input
                          key={`${currentBookingDbId}-${refundPercentage}`}
                          disabled={isUpdating}
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          defaultValue={refundPercentage}
                          onBlur={(event) => {
                            const nextPercentage = Number(event.target.value)
                            if (!Number.isFinite(nextPercentage)) return
                            void handlePaymentFieldChange(booking, { paymentStatus: 'Refunded', refundPercentage: nextPercentage })
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter') return
                            event.currentTarget.blur()
                          }}
                          className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 px-4 pr-9 text-sm text-white outline-none focus:border-secondary disabled:opacity-60"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-white/35">%</span>
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        {REFUND_PERCENTAGES.map((percentage) => (
                          <button
                            key={percentage}
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void handlePaymentFieldChange(booking, { paymentStatus: 'Refunded', refundPercentage: percentage })}
                            className="h-7 rounded-lg bg-white/5 text-[9px] font-black text-white/45 transition-colors hover:bg-secondary/15 hover:text-secondary disabled:opacity-60"
                          >
                            {percentage}%
                          </button>
                        ))}
                      </div>
                      <span className="mt-2 block text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Rs. {refundAmount.toLocaleString('en-IN')}</span>
                    </>
                  ) : (
                    <span className="flex h-12 items-center rounded-2xl bg-white/5 border border-white/10 px-4 text-sm text-white/30">-</span>
                  )}
                </label>
                {isUpdating && <span className="sm:col-span-3 mt-1 block text-[9px] font-black uppercase tracking-[0.16em] text-white/40">Updating...</span>}
              </div>
            </article>
          )
        }) : <div className="liquid-glass-dark border border-white/10 rounded-2xl p-8 text-white/45">No booked trips yet.</div>}</div>

          {transferModalBooking && <TransferPackageModal booking={transferModalBooking} bookingDbId={bookingDbId(transferModalBooking)} onClose={() => setTransferModalBooking(null)} onUpdate={(updatedBooking) => { setData((current) => current ? { ...current, bookings: current.bookings.map((b) => bookingDbId(b) === bookingDbId(transferModalBooking) ? updatedBooking : b) } : current); setTransferModalBooking(updatedBooking) }} />}
        </section>

        <section><h2 className="text-2xl font-sans font-black uppercase italic text-white mb-4">User <span className="text-secondary">Testimonials</span></h2><div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{testimonials.length ? testimonials.map((testimonial) => <article key={testimonial.id} className="liquid-glass-dark border border-white/10 rounded-2xl p-5"><p className="text-secondary text-[10px] font-black uppercase tracking-[0.16em] mb-3">{testimonial.trip}</p><p className="text-white/75 italic leading-relaxed">&ldquo;{testimonial.review}&rdquo;</p><div className="flex items-center justify-between border-t border-white/10 mt-5 pt-4"><span className="flex gap-1">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={14} className={index < testimonial.rating ? 'text-secondary fill-secondary' : 'text-white/15'} />)}</span><span className="text-[9px] text-white/35 font-black uppercase tracking-[0.14em]">{formatDate(testimonial.createdAt)}</span></div></article>) : <div className="liquid-glass-dark border border-white/10 rounded-2xl p-8 text-white/45">No testimonials yet.</div>}</div></section>
      </div>
    </div>
  )
}
