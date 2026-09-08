import { useEffect, useState } from 'react'
import { ArrowRightLeft, CreditCard, History, X, ChevronRight, Check, IndianRupee, FileText, ArrowRight, Clock } from 'lucide-react'

type Trip = { id: number; title?: string; location?: string; price?: number;[key: string]: unknown }
type TransferRecord = { id: string; fromTripTitle: string; toTripTitle: string; fromPrice: number; toPrice: number; transferredAt: string; transferredBy: string }
type PaymentRecord = { id: string; amount: number; previousAmountPaid: number; newAmountPaid: number; pendingAmount: number; note: string; updatedAt: string; updatedBy: string }

type Props = {
    booking: Record<string, unknown>
    bookingDbId: string
    onClose: () => void
    onUpdate: (updatedBooking: Record<string, unknown>) => void
}

const TABS = [
    { id: 'transfer', label: 'Package Transfer', Icon: ArrowRightLeft },
    { id: 'payment', label: 'Payment Update', Icon: CreditCard },
    { id: 'history', label: 'Transfer History', Icon: History }
] as const

const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
const money = (value: number) => `₹${value.toLocaleString('en-IN')}`

export default function TransferPackageModal({ booking, bookingDbId, onClose, onUpdate }: Props) {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('transfer')
    const [trips, setTrips] = useState<Trip[]>([])
    const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paymentNote, setPaymentNote] = useState('')

    const currentTitle = String(booking.title || booking.tripTitle || 'WayBond Trip')
    const currentPrice = Number(booking.price || 0)
    const travelers = Number(booking.travelers || 1)
    const totalAmount = Number(booking.totalAmount || currentPrice * travelers)
    const amountPaid = Number(booking.amountPaid || 0)
    const pendingAmount = Number(booking.pendingAmount || Math.max(0, totalAmount - amountPaid))
    const transferHistory = (Array.isArray(booking.transferHistory) ? booking.transferHistory : []) as TransferRecord[]
    const paymentUpdateHistory = (Array.isArray(booking.paymentUpdateHistory) ? booking.paymentUpdateHistory : []) as PaymentRecord[]
    const paymentPercentage = totalAmount > 0 ? Math.min(100, Math.round((amountPaid / totalAmount) * 100)) : 0

    useEffect(() => {
        fetch('/api/trips')
            .then((res) => res.json())
            .then((data: Trip[]) => setTrips(Array.isArray(data) ? data : []))
            .catch(() => setTrips([]))
    }, [])

    const selectedTrip = trips.find((t) => t.id === selectedTripId)

    const handleTransfer = async () => {
        if (!selectedTripId) return
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            const response = await fetch(`/api/bookings/${bookingDbId}/transfer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetTripId: selectedTripId })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Transfer failed.')
            setSuccess('Package transferred successfully!')
            setSelectedTripId(null)
            onUpdate(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transfer failed.')
        } finally {
            setLoading(false)
        }
    }

    const handlePaymentUpdate = async () => {
        const amount = Number(paymentAmount)
        if (!amount || amount <= 0) { setError('Enter a valid payment amount.'); return }
        setLoading(true)
        setError('')
        setSuccess('')
        try {
            const response = await fetch(`/api/bookings/${bookingDbId}/payment-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amountPaid: amount, note: paymentNote })
            })
            const data = await response.json()
            if (!response.ok) throw new Error(data.message || 'Payment update failed.')
            setSuccess('Payment updated successfully!')
            setPaymentAmount('')
            setPaymentNote('')
            onUpdate(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment update failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <p className="text-[9px] text-blue-600 font-black uppercase tracking-[0.2em] mb-1">Manage booking</p>
                        <h2 className="text-xl font-sans font-black uppercase italic text-gray-900">{currentTitle}</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    {TABS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveTab(id); setError(''); setSuccess('') }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.16em] transition-colors ${activeTab === id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Icon size={15} />
                            <span className="hidden sm:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Feedback */}
                {error && <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">{error}</div>}
                {success && <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold flex items-center gap-2"><Check size={14} />{success}</div>}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* ─── Package Transfer Tab ─── */}
                    {activeTab === 'transfer' && (
                        <div className="space-y-6">
                            {/* Booking Information Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="3" y="6" width="18" height="15" rx="2" stroke="#2563eb" strokeWidth="2"/>
                                    <path d="M3 10H21" stroke="#2563eb" strokeWidth="2"/>
                                    <path d="M8 3V6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M16 3V6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                <h3 className="text-xl font-bold text-blue-600">Booking Information</h3>
                            </div>

                            {/* Package Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Package</label>
                                <div className="relative">
                                    <select 
                                        value={selectedTripId ?? ''} 
                                        onChange={(e) => setSelectedTripId(e.target.value ? Number(e.target.value) : null)} 
                                        className="w-full h-14 rounded-lg bg-gray-50 border border-gray-300 px-4 text-base font-semibold text-gray-800 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                                    >
                                        <option value="">Select a package...</option>
                                        {trips.filter((t) => t.id !== Number(booking.id || booking.tripId)).map((trip) => (
                                            <option key={trip.id} value={trip.id}>{trip.title || `Trip ${trip.id}`}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 9L12 15L18 9" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Departure Point Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Departure Point</label>
                                <div className="relative">
                                    <div className="w-full h-14 rounded-lg bg-gray-50 border border-gray-300 px-4 flex items-center justify-between">
                                        <span className="text-base font-semibold text-gray-800">
                                            {String(selectedTrip?.location || booking.location || booking.joinOrigin || 'Not specified')}
                                        </span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 9L12 15L18 9" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Travel Dates Field */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Dates</label>
                                <div className="flex items-center gap-4">
                                    {/* Start Date */}
                                    <div className="flex-1 relative">
                                        <div className="w-full h-14 rounded-lg bg-gray-50 border border-gray-300 px-4 flex items-center justify-between">
                                            <span className="text-base font-semibold text-gray-800">
                                                {String(booking.nextBatch || booking.departure || 'TBD')}
                                            </span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="6" width="18" height="15" rx="2" stroke="#9ca3af" strokeWidth="2"/>
                                                <path d="M3 10H21" stroke="#9ca3af" strokeWidth="2"/>
                                                <path d="M8 3V6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M16 3V6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>

                                    {/* End Date */}
                                    <div className="flex-1 relative">
                                        <div className="w-full h-14 rounded-lg bg-gray-50 border border-gray-300 px-4 flex items-center justify-between">
                                            <span className="text-base font-semibold text-gray-800">
                                                {String(selectedTrip?.nextBatch || booking.nextBatch || booking.departure || 'TBD')}
                                            </span>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="6" width="18" height="15" rx="2" stroke="#9ca3af" strokeWidth="2"/>
                                                <path d="M3 10H21" stroke="#9ca3af" strokeWidth="2"/>
                                                <path d="M8 3V6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                                                <path d="M16 3V6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price Comparison - Only show when package is selected */}
                            {selectedTrip && (
                                <div className="mt-6 space-y-3">
                                    {/* Current Package */}
                                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                                        <p className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wide">Current Package</p>
                                        <p className="text-gray-900 font-bold text-sm">{currentTitle}</p>
                                        <p className="text-amber-700 font-bold text-base mt-1">{money(currentPrice)}/person</p>
                                    </div>

                                    {/* Price Change Indicator */}
                                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-gray-500">Price change:</span>
                                            <span className="text-gray-900 font-bold">{money(currentPrice)}</span>
                                            <ArrowRight size={16} className="text-blue-600" />
                                            <span className="text-blue-600 font-bold">{money(Number(selectedTrip.price || 0))}</span>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${Number(selectedTrip.price || 0) > currentPrice ? 'bg-red-100 text-red-600' : Number(selectedTrip.price || 0) < currentPrice ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {Number(selectedTrip.price || 0) > currentPrice ? `+${money(Number(selectedTrip.price || 0) - currentPrice)}` : Number(selectedTrip.price || 0) < currentPrice ? `-${money(currentPrice - Number(selectedTrip.price || 0))}` : 'Same Price'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Transfer Button */}
                            <button 
                                disabled={!selectedTripId || loading} 
                                onClick={() => void handleTransfer()} 
                                className="w-full h-14 rounded-xl bg-blue-600 font-bold text-sm uppercase tracking-wide text-white transition-all hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 flex items-center justify-center gap-2 mt-6"
                            >
                                {loading ? 'Transferring Package...' : <><ArrowRightLeft size={18} /> Transfer Package</>}
                            </button>
                        </div>
                    )}

                    {/* ─── Payment Update Tab ─── */}
                    {activeTab === 'payment' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Amount', value: money(totalAmount), color: 'text-gray-900' },
                                    { label: 'Amount Paid', value: money(amountPaid), color: 'text-emerald-600' },
                                    { label: 'Pending Amount', value: money(pendingAmount), color: 'text-orange-500' },
                                    { label: 'Payment Status', value: String(booking.paymentStatus || 'Pending'), color: 'text-blue-600' }
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="rounded-2xl bg-gray-50 border border-gray-200 p-4 text-center">
                                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.14em] mb-2">{label}</p>
                                        <p className={`text-sm font-black ${color}`}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.14em]">Payment progress</span>
                                    <span className="text-[9px] text-blue-600 font-black">{paymentPercentage}%</span>
                                </div>
                                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500" style={{ width: `${paymentPercentage}%` }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <label>
                                    <span className="mb-2 flex items-center gap-2 text-[9px] text-gray-500 font-black uppercase tracking-[0.18em]"><IndianRupee size={14} className="text-blue-600" /> Amount received</span>
                                    <input type="number" min="1" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter amount" className="w-full h-12 rounded-2xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300" />
                                </label>
                                <label>
                                    <span className="mb-2 flex items-center gap-2 text-[9px] text-gray-500 font-black uppercase tracking-[0.18em]"><FileText size={14} className="text-blue-600" /> Note (optional)</span>
                                    <input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} placeholder="e.g. Cash received" className="w-full h-12 rounded-2xl bg-gray-50 border border-gray-200 px-4 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-gray-300" />
                                </label>
                            </div>

                            <button disabled={loading || !paymentAmount} onClick={() => void handlePaymentUpdate()} className="w-full h-12 rounded-2xl bg-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {loading ? 'Updating...' : <><CreditCard size={15} /> Update Payment</>}
                            </button>
                        </div>
                    )}

                    {/* ─── Transfer History Tab ─── */}
                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            {/* Transfer History */}
                            <div>
                                <h3 className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><ArrowRightLeft size={14} /> Package Transfers</h3>
                                {transferHistory.length ? (
                                    <div className="space-y-3">
                                        {[...transferHistory].reverse().map((record, index) => (
                                            <div key={record.id || index} className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-[0.14em]">
                                                        <Clock size={12} />
                                                        {formatDateTime(record.transferredAt)}
                                                    </div>
                                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 text-[8px] font-black uppercase tracking-[0.14em]">Transfer</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <div className="flex-1">
                                                        <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.1em] mb-1">From</p>
                                                        <p className="text-gray-900 font-bold text-xs">{record.fromTripTitle}</p>
                                                        <p className="text-gray-500 text-xs mt-0.5">{money(record.fromPrice)}/person</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-blue-600 shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-blue-600 text-[9px] font-black uppercase tracking-[0.1em] mb-1">To</p>
                                                        <p className="text-gray-900 font-bold text-xs">{record.toTripTitle}</p>
                                                        <p className="text-blue-600 text-xs mt-0.5">{money(record.toPrice)}/person</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center text-gray-400 text-sm">No package transfers yet.</div>
                                )}
                            </div>

                            {/* Payment Update History */}
                            <div>
                                <h3 className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><CreditCard size={14} /> Payment Updates</h3>
                                {paymentUpdateHistory.length ? (
                                    <div className="space-y-3">
                                        {[...paymentUpdateHistory].reverse().map((record, index) => (
                                            <div key={record.id || index} className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-[0.14em]">
                                                        <Clock size={12} />
                                                        {formatDateTime(record.updatedAt)}
                                                    </div>
                                                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase tracking-[0.14em]">Payment</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.1em] mb-1">Received</p>
                                                        <p className="text-emerald-600 font-black text-sm">+{money(record.amount)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.1em] mb-1">Total Paid</p>
                                                        <p className="text-gray-900 font-bold text-sm">{money(record.newAmountPaid)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.1em] mb-1">Pending</p>
                                                        <p className="text-orange-500 font-bold text-sm">{money(record.pendingAmount)}</p>
                                                    </div>
                                                </div>
                                                {record.note && <p className="mt-3 text-xs text-gray-400 italic border-t border-gray-100 pt-3">"{record.note}"</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center text-gray-400 text-sm">No payment updates yet.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
