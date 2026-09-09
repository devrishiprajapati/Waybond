import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, LoaderCircle, Mail, MessageSquare, Phone, Search, Trash2, User, Users } from 'lucide-react'

type Enquiry = {
  id: string
  name: string
  phone: string
  email: string | null
  travelDate: string
  travellers: string
  message: string | null
  tripTitle: string | null
  tripLocation: string | null
  status: string
  notes: string | null
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All', color: 'bg-gray-100 text-gray-700' },
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-700' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  { value: 'CONFIRM', label: 'CONFIRM', color: 'bg-green-100 text-green-700' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-gray-100 text-gray-500' }
]

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function Enquiries() {
  const navigate = useNavigate()
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    loadEnquiries()
  }, [navigate, selectedStatus])

  const loadEnquiries = async () => {
    setLoading(true)
    try {
      const url = selectedStatus !== 'ALL' ? `/api/admin/enquiries?status=${selectedStatus}` : '/api/admin/enquiries'
      const response = await fetch(url)
      const data = await response.json()
      setEnquiries(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load enquiries:', error)
      setEnquiries([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(true)
    try {
      const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updatedBy: adminData.id })
      })

      if (response.ok) {
        await loadEnquiries()
        if (selectedEnquiry?.id === id) {
          const updated = await response.json()
          setSelectedEnquiry(updated)
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleNotesUpdate = async (id: string, notes: string) => {
    setUpdating(true)
    try {
      const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}')
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, updatedBy: adminData.id })
      })

      if (response.ok) {
        const updated = await response.json()
        setSelectedEnquiry(updated)
        await loadEnquiries()
      }
    } catch (error) {
      console.error('Failed to update notes:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadEnquiries()
        if (selectedEnquiry?.id === id) {
          setModalOpen(false)
          setSelectedEnquiry(null)
        }
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete enquiry:', error)
    }
  }

  const filteredEnquiries = enquiries.filter(enq =>
    enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.phone.includes(searchTerm) ||
    enq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enq.tripTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-white px-4 pb-28 pt-24 text-slate-900 sm:px-6 lg:px-12 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Link to="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500 transition-colors hover:text-secondary">
              <ArrowLeft size={15} /> Admin dashboard
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-secondary">Trip Enquiries</p>
            <h1 className="mt-2 text-3xl font-black uppercase text-slate-900 sm:text-4xl">Enquiry Management</h1>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            <MessageSquare size={18} className="text-secondary" />
            {filteredEnquiries.length} enquiries
          </div>
        </header>

        {/* Status Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(status => (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${selectedStatus === status.value
                ? status.color + ' shadow-md'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email, or trip..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        {/* Enquiries List */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-500">
            <LoaderCircle size={24} className="animate-spin" />
            Loading enquiries...
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 py-20 text-center text-slate-500">
            No enquiries found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredEnquiries.map(enquiry => (
              <div
                key={enquiry.id}
                onClick={() => {
                  setSelectedEnquiry(enquiry)
                  setModalOpen(true)
                }}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-secondary hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{enquiry.name}</h3>
                        {enquiry.tripTitle && (
                          <p className="mt-1 text-sm font-semibold text-secondary">
                            {enquiry.tripTitle}
                            {enquiry.tripLocation && ` • ${enquiry.tripLocation}`}
                          </p>
                        )}
                      </div>
                      <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold uppercase ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-secondary" />
                        +91 {enquiry.phone}
                      </div>
                      {enquiry.email && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail size={14} className="text-secondary" />
                          {enquiry.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar size={14} className="text-secondary" />
                        {enquiry.travelDate}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users size={14} className="text-secondary" />
                        {enquiry.travellers} travellers
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-400">
                      Received {formatDateTime(enquiry.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enquiry Detail Modal */}
      {modalOpen && selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary">Enquiry Details</p>
                <h2 className="text-xl font-black text-slate-900">{selectedEnquiry.name}</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Trip Information */}
              {selectedEnquiry.tripTitle && (
                <div className="rounded-2xl bg-secondary/5 border border-secondary/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-secondary/70">Trip of Interest</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{selectedEnquiry.tripTitle}</p>
                  {selectedEnquiry.tripLocation && (
                    <p className="mt-1 text-sm text-slate-600">{selectedEnquiry.tripLocation}</p>
                  )}
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</p>
                    <p className="text-sm font-bold text-slate-900">{selectedEnquiry.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</p>
                    <p className="text-sm font-bold text-slate-900">+91 {selectedEnquiry.phone}</p>
                  </div>
                </div>
                {selectedEnquiry.email && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-secondary" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
                      <p className="text-sm font-bold text-slate-900">{selectedEnquiry.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Travel Date</p>
                    <p className="text-sm font-bold text-slate-900">{selectedEnquiry.travelDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-secondary" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Travellers</p>
                    <p className="text-sm font-bold text-slate-900">{selectedEnquiry.travellers}</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {selectedEnquiry.message && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Message</p>
                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    {selectedEnquiry.message}
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.filter(s => s.value !== 'ALL').map(status => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(selectedEnquiry.id, status.value)}
                      disabled={updating}
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${selectedEnquiry.status === status.value
                        ? status.color + ' shadow-md'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 disabled:opacity-50'
                        }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Admin Notes</p>
                <textarea
                  value={selectedEnquiry.notes || ''}
                  onChange={e => {
                    setSelectedEnquiry({ ...selectedEnquiry, notes: e.target.value })
                  }}
                  onBlur={e => handleNotesUpdate(selectedEnquiry.id, e.target.value)}
                  placeholder="Add notes about this enquiry..."
                  className="h-32 w-full rounded-xl border border-slate-300 bg-white p-4 text-sm text-slate-900 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              {/* Metadata */}
              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                <p>Created: {formatDateTime(selectedEnquiry.createdAt)}</p>
                <p>Last Updated: {formatDateTime(selectedEnquiry.updatedAt)}</p>
              </div>

              {/* Delete Button */}
              <div className="border-t border-slate-200 pt-4">
                {deleteConfirm === selectedEnquiry.id ? (
                  <div className="flex items-center gap-3">
                    <p className="flex-1 text-sm font-semibold text-red-600">Delete this enquiry?</p>
                    <button
                      onClick={() => handleDelete(selectedEnquiry.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold uppercase text-white transition-colors hover:bg-red-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-600 transition-colors hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(selectedEnquiry.id)}
                    className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold uppercase text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={14} /> Delete Enquiry
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
