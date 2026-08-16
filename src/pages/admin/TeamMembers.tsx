import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import {
    ArrowLeft, Plus, Trash2, Edit2, X, Save, Users2,
    Loader2, RefreshCw, Mail, Phone, Upload, ImageIcon
} from 'lucide-react'

type TeamMember = {
    id: number | string
    name: string
    designation: string
    shortBio: string
    fullBio: string
    image: string
    email?: string
    phone?: string
    linkedin?: string
    twitter?: string
    position: number
    isActive: boolean
    createdAt?: string
    updatedAt?: string
}

const EMPTY_FORM: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    designation: '',
    shortBio: '',
    fullBio: '',
    image: '',
    email: '',
    phone: '',
    linkedin: '',
    twitter: '',
    position: 0,
    isActive: true,
}

export default function AdminTeamMembers() {
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [imageUploading, setImageUploading] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
    const [editing, setEditing] = useState<TeamMember | null>(null)
    const [isAddingNew, setIsAddingNew] = useState(false)
    const [draft, setDraft] = useState<Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>>(EMPTY_FORM)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    const loadMembers = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/team-members')
            if (!res.ok) throw new Error('Failed to load team members')
            setMembers(await res.json())
        } catch {
            setError('Could not load team members. Is the server running?')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (sessionStorage.getItem('isAdmin') !== 'true') {
            navigate('/admin/login')
            return
        }
        loadMembers()
    }, [navigate])

    const validate = (d: typeof draft): Record<string, string> => {
        const errs: Record<string, string> = {}
        if (!d.name.trim()) errs.name = 'Name is required.'
        else if (d.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.'
        if (!d.designation.trim()) errs.designation = 'Designation is required.'
        else if (d.designation.trim().length < 2) errs.designation = 'Designation must be at least 2 characters.'
        if (!d.shortBio.trim()) errs.shortBio = 'Short bio is required.'
        else if (d.shortBio.trim().length < 10) errs.shortBio = 'Short bio must be at least 10 characters.'
        if (!d.image) errs.image = 'A profile image is required.'
        if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) errs.email = 'Enter a valid email address.'
        if (d.phone && !/^[6-9]\d{9}$/.test(d.phone.replace(/\s+/g, ''))) errs.phone = 'Enter a valid 10-digit Indian mobile number.'
        if (d.linkedin && !/^https?:\/\/.+/.test(d.linkedin)) errs.linkedin = 'LinkedIn URL must start with http:// or https://'
        if (d.twitter && !/^https?:\/\/.+/.test(d.twitter)) errs.twitter = 'Twitter/X URL must start with http:// or https://'
        if (d.position < 0) errs.position = 'Position must be 0 or greater.'
        return errs
    }

    const openAdd = () => {
        setDraft({ ...EMPTY_FORM, position: members.length })
        setEditing(null)
        setFieldErrors({})
        setIsAddingNew(true)
    }

    const openEdit = (member: TeamMember) => {
        setDraft({
            name: member.name,
            designation: member.designation,
            shortBio: member.shortBio,
            fullBio: member.fullBio,
            image: member.image,
            email: member.email ?? '',
            phone: member.phone ?? '',
            linkedin: member.linkedin ?? '',
            twitter: member.twitter ?? '',
            position: member.position,
            isActive: member.isActive,
        })
        setEditing(member)
        setFieldErrors({})
        setIsAddingNew(false)
    }

    const closeModal = () => {
        setIsAddingNew(false)
        setEditing(null)
        setFieldErrors({})
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 8 * 1024 * 1024) {
            setFieldErrors(prev => ({ ...prev, image: 'Image must be smaller than 8 MB.' }))
            return
        }
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowed.includes(file.type)) {
            setFieldErrors(prev => ({ ...prev, image: 'Only JPG, PNG, WEBP or GIF images are allowed.' }))
            return
        }
        setImageUploading(true)
        setFieldErrors(prev => { const n = { ...prev }; delete n.image; return n })
        const reader = new FileReader()
        reader.onload = (ev) => {
            setDraft(d => ({ ...d, image: ev.target?.result as string }))
            setImageUploading(false)
        }
        reader.onerror = () => {
            setFieldErrors(prev => ({ ...prev, image: 'Could not read the image file. Please try again.' }))
            setImageUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const errs = validate(draft)
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs)
            return
        }
        setSaving(true)
        setFieldErrors({})
        try {
            const url = editing ? `/api/team-members/${editing.id}` : '/api/team-members'
            const method = editing ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(draft),
            })
            if (!res.ok) {
                const body = await res.json().catch(() => ({}))
                setFieldErrors({ _form: body.message || 'Could not save. Please try again.' })
                return
            }
            const saved: TeamMember = await res.json()
            if (editing) {
                setMembers(curr => curr.map(m => String(m.id) === String(editing.id) ? saved : m))
            } else {
                setMembers(curr => [...curr, saved].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)))
            }
            closeModal()
        } catch {
            setFieldErrors({ _form: 'Network error. Please check your connection and try again.' })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (member: TeamMember) => {
        if (!window.confirm(`Remove ${member.name} from the team? This cannot be undone.`)) return
        try {
            await fetch(`/api/team-members/${member.id}`, { method: 'DELETE' })
            setMembers(curr => curr.filter(m => String(m.id) !== String(member.id)))
        } catch {
            alert('Delete failed. Please try again.')
        }
    }

    const setField = (key: keyof typeof draft, value: string | number | boolean) => {
        setDraft(d => ({ ...d, [key]: value }))
        setFieldErrors(prev => { const n = { ...prev }; delete n[key as string]; return n })
    }

    const field = (
        label: string,
        key: keyof typeof draft,
        type: string = 'text',
        required = false,
        placeholder = ''
    ) => (
        <div className="flex flex-col gap-1">
            <label className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">
                {label}{required && <span className="text-secondary ml-1">*</span>}
            </label>
            <input
                type={type}
                placeholder={placeholder}
                value={String(draft[key] ?? '')}
                onChange={e => setField(key, e.target.value)}
                className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-white text-sm outline-none transition-colors ${fieldErrors[key as string]
                    ? 'border-red-400/70 focus:border-red-400'
                    : 'border-white/10 focus:border-secondary'
                    }`}
            />
            {fieldErrors[key as string] && (
                <p className="text-red-400 text-[10px] font-semibold">{fieldErrors[key as string]}</p>
            )}
        </div>
    )

    const showModal = isAddingNew || editing !== null

    return (
        <div className="min-h-screen bg-white text-white px-6 md:px-10 lg:px-16 pt-32 pb-20">
            <div className="max-w-[1500px] mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7 mb-10">
                    <div>
                        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5">
                            <ArrowLeft size={15} /> Admin Dashboard
                        </Link>
                        <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">People &amp; Culture</p>
                        <h1 className="text-4xl md:text-6xl font-sans font-black uppercase italic tracking-tighter liquid-text ">
                            Manage <span className="text-primary font-bungee">Team</span>
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadMembers}
                            className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 hover:border-secondary transition-colors"
                        >
                            <RefreshCw size={15} /> Refresh
                        </button>
                        <button
                            onClick={openAdd}
                            className="h-12 px-6 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl shadow-secondary/20 hover:bg-secondary/80 transition-all"
                        >
                            <Plus size={16} /> Add Member
                        </button>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="liquid-glass-dark border border-white/10 rounded-[2rem] p-5 mb-7 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center">
                        <Users2 size={22} />
                    </div>
                    <div>
                        <p className="text-[9px] text-white/35 font-black uppercase tracking-[0.2em]">Total Members</p>
                        <p className="text-2xl font-sans font-black text-white">{members.length}</p>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="liquid-glass-dark border border-red-500/30 rounded-2xl p-4 mb-6 text-red-300 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="animate-spin text-secondary" size={40} />
                    </div>
                )}

                {/* Members Grid */}
                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {members.map(member => (
                            <motion.article
                                key={member.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-5"
                            >
                                {/* Avatar */}
                                <div className="w-full sm:w-28 h-44 sm:h-28 rounded-[1.5rem] overflow-hidden shrink-0 bg-white/5 border border-white/10">
                                    {member.image ? (
                                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Users2 className="text-white/20" size={32} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xl font-sans font-black text-white uppercase italic tracking-tight truncate">{member.name}</p>
                                            <p className="text-[10px] text-secondary font-black uppercase tracking-[0.16em] mt-1">{member.designation}</p>
                                            {!member.isActive && (
                                                <span className="text-[8px] font-black uppercase tracking-widest text-white/30 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full mt-1 inline-block">Inactive</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={() => openEdit(member)}
                                                className="w-10 h-10 rounded-xl border border-secondary/25 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white flex items-center justify-center transition-all"
                                                title="Edit member"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(member)}
                                                className="w-10 h-10 rounded-xl border border-red-400/25 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                                title="Delete member"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-white/55 text-sm leading-relaxed mt-3 line-clamp-2">{member.shortBio}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                        {member.email && <span className="text-[9px] text-white/35 font-black uppercase tracking-widest flex items-center gap-1"><Mail size={10} />{member.email}</span>}
                                        {member.phone && <span className="text-[9px] text-white/35 font-black uppercase tracking-widest flex items-center gap-1"><Phone size={10} />{member.phone}</span>}
                                    </div>
                                </div>
                            </motion.article>
                        ))}

                        {!loading && members.length === 0 && (
                            <div className="col-span-2 liquid-glass-dark border border-white/10 rounded-[2rem] py-16 text-center">
                                <Users2 className="mx-auto text-white/20 mb-4" size={40} />
                                <p className="text-white/50 font-bold">No team members yet.</p>
                                <p className="text-white/30 text-sm mt-1">Click "Add Member" to get started.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
                    >
                        <motion.form
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="w-full max-w-2xl liquid-glass-dark border border-white/15 rounded-[2rem] p-6 md:p-8 space-y-5 max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-secondary text-[9px] font-black uppercase tracking-[0.22em] mb-2">People & Culture</p>
                                    <h2 className="text-3xl font-sans font-black uppercase italic text-white">
                                        {editing ? 'Edit Member' : 'Add Member'}
                                    </h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-11 h-11 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                                    title="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <p className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">
                                    Profile Image <span className="text-secondary">*</span>
                                </p>

                                {/* Preview or placeholder */}
                                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed border-white/15 flex items-center justify-center group">
                                    {imageUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="animate-spin text-secondary" size={28} />
                                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">Processing…</p>
                                        </div>
                                    ) : draft.image ? (
                                        <>
                                            <img src={draft.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-white/40 transition-all"
                                                >
                                                    <Upload size={13} /> Change Image
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-col items-center gap-3 text-white/30 hover:text-secondary transition-colors p-8"
                                        >
                                            <ImageIcon size={36} strokeWidth={1} />
                                            <div className="text-center">
                                                <p className="text-[10px] font-black uppercase tracking-widest">Click to upload image</p>
                                                <p className="text-[9px] mt-1 text-white/25">JPG, PNG, WEBP — max 8 MB</p>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>

                            {/* Fields — Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {field('Name', 'name', 'text', true, 'e.g. Rishi Prajapati')}
                                {field('Designation', 'designation', 'text', true, 'e.g. Founder & CEO')}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">
                                    Short Bio <span className="text-secondary">*</span>
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="One-line intro shown on the profile card..."
                                    value={draft.shortBio}
                                    onChange={e => setField('shortBio', e.target.value)}
                                    className={`w-full rounded-xl bg-white/5 border px-4 py-3 text-white text-sm outline-none resize-y transition-colors ${fieldErrors.shortBio ? 'border-red-400/70 focus:border-red-400' : 'border-white/10 focus:border-secondary'
                                        }`}
                                />
                                {fieldErrors.shortBio && <p className="text-red-400 text-[10px] font-semibold">{fieldErrors.shortBio}</p>}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Full Bio</label>
                                <textarea
                                    rows={4}
                                    placeholder="Detailed biography shown in the popup modal..."
                                    value={draft.fullBio}
                                    onChange={e => setField('fullBio', e.target.value)}
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white text-sm outline-none focus:border-secondary resize-y transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {field('Email', 'email', 'email', false, 'contact@waybond.in')}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Phone</label>
                                    <input
                                        type="tel"
                                        placeholder="9876543210"
                                        maxLength={10}
                                        value={String(draft.phone ?? '')}
                                        onChange={e => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className={`w-full h-12 rounded-xl bg-white/5 border px-4 text-white text-sm outline-none transition-colors ${fieldErrors.phone ? 'border-red-400/70 focus:border-red-400' : 'border-white/10 focus:border-secondary'
                                            }`}
                                    />
                                    {fieldErrors.phone && <p className="text-red-400 text-[10px] font-semibold">{fieldErrors.phone}</p>}
                                </div>
                                {field('LinkedIn URL', 'linkedin', 'url', false, 'https://linkedin.com/in/...')}
                                {field('Twitter / X URL', 'twitter', 'url', false, 'https://x.com/...')}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">
                                    Display Order (Position)
                                    <input
                                        type="number"
                                        min={0}
                                        value={draft.position}
                                        onChange={e => setField('position', Number(e.target.value))}
                                        className={`mt-2 w-full h-12 rounded-xl bg-white/5 border px-4 text-white text-sm outline-none transition-colors ${fieldErrors.position ? 'border-red-400/70 focus:border-red-400' : 'border-white/10 focus:border-secondary'
                                            }`}
                                    />
                                </label>
                                <label className="block text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">
                                    Status
                                    <select
                                        value={draft.isActive ? 'active' : 'inactive'}
                                        onChange={e => setDraft(d => ({ ...d, isActive: e.target.value === 'active' }))}
                                        className="mt-2 w-full h-12 rounded-xl bg-white/5 border border-white/10 px-4 text-white text-sm outline-none focus:border-secondary transition-colors"
                                    >
                                        <option value="active" className="text-slate-900">Active</option>
                                        <option value="inactive" className="text-slate-900">Inactive</option>
                                    </select>
                                </label>
                            </div>

                            {fieldErrors._form && (
                                <p className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3">{fieldErrors._form}</p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="h-12 px-5 rounded-xl text-white/65 font-black text-[10px] uppercase tracking-[0.14em] hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="h-12 px-6 rounded-xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.14em] flex items-center gap-2 disabled:opacity-60 hover:bg-secondary/80 transition-all shadow-xl shadow-secondary/20"
                                >
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                    {saving ? 'Saving…' : 'Save Member'}
                                </button>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
