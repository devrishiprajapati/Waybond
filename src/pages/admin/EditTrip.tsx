import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Image as ImageIcon, Clock, Trash2, Plus, Info, List, User, MapPin, IndianRupee, Star, Users, Globe, Upload, FileText, CheckCircle } from 'lucide-react'
import { getTripById, updateTrip, addTrip } from '../../lib/dataService'
import { Trip } from '../../lib/trips'
import { parseDateOnly } from '../../lib/date'

const CATEGORIES = ['Adventure', 'Beach', 'Luxury', 'Nature', 'Honeymoon', 'Backpacking']
const DIFFICULTY_LEVELS: { value: Trip['difficulty'], label: string, color: string }[] = [
  { value: 'Easy', label: 'Easy', color: 'bg-green-500/15 text-green-400 border-green-400/30' },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-400/30' },
  { value: 'Difficult', label: 'Difficult', color: 'bg-red-500/15 text-red-400 border-red-400/30' }
]
const EXPERIENCES: { value: Trip['experience'], label: string }[] = [
  { value: 'monsoon', label: 'Monsoon Treks' },
  { value: 'weekend', label: 'Weekend Treks' },
  { value: 'road', label: 'Road Trips' },
  { value: 'snow', label: 'Snow Treks' }
]

const sectionClass = 'liquid-glass-dark border border-white/10 rounded-[2.5rem] p-5 md:p-8 space-y-7'
const labelClass = 'text-[10px] uppercase font-black text-white/45 tracking-[0.2em] ml-2 flex items-center'
const inputClass = 'w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl text-white placeholder:text-white/25 focus:border-secondary focus:bg-white/10 outline-none transition-all font-bold'
const textareaClass = `${inputClass} min-h-[120px] resize-none leading-relaxed`

const toDateInputValue = (value?: string) => {
  const parsed = parseDateOnly(String(value || '').trim())
  if (!parsed) return ''
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeDateText = (value?: string) => String(value || '').trim()
const mergeUniqueDates = (dates: string[]) => Array.from(new Set(dates.map(normalizeDateText).filter(Boolean)))

const EditTrip = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Partial<Trip>>({
    title: '',
    location: '',
    price: '',
    duration: '',
    category: 'Adventure',
    experience: 'weekend',
    difficulty: 'Medium',
    image: '',
    rating: 4.8,
    reviews: 120,
    link: '#',
    description: '',
    images: [],
    inclusion: [''],
    exclusion: [''],
    nextBatch: '',
    departureDates: [],
    groupSize: '',
    captain: {
      name: '',
      role: '',
      bio: '',
      avatar: '',
      rating: 5.0,
      trips: 0
    },
    itinerary: [],
    pdfUrl: '',
    thingsToCarry: [''],
    termsAndConditions: ''
  })
  const [mediaError, setMediaError] = useState('')
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })
  const [confirmedDateIndex, setConfirmedDateIndex] = useState('')
  const [confirmedDateValue, setConfirmedDateValue] = useState('')

  const showToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }

  const handleNextBatchChange = (date: string) => {
    const nextBatch = normalizeDateText(date)
    const previousNextBatch = normalizeDateText(formData.nextBatch)
    const departureDates = mergeUniqueDates([
      nextBatch,
      ...(formData.departureDates || []).map((item) => (
        previousNextBatch && normalizeDateText(item) === previousNextBatch ? nextBatch : item
      ))
    ])

    setFormData({ ...formData, nextBatch, departureDates })
  }

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
    }
    if (id && id !== 'new') {
      getTripById(parseInt(id)).then(trip => {
        if (trip) setFormData(trip)
      })
    }
  }, [id, navigate])

  const readImage = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read the selected image.'))
    reader.readAsDataURL(file)
  })

  const validateImage = (file: File) => {
    if (!file.type.startsWith('image/')) throw new Error('Please select an image file.')
    if (file.size > 4 * 1024 * 1024) throw new Error('Each image must be smaller than 4 MB.')
  }

  const handleCoverUpload = async (file?: File) => {
    if (!file) return
    try {
      validateImage(file)
      const image = await readImage(file)
      setFormData((current) => ({ ...current, image, images: [image, ...(current.images || []).filter((item) => item !== current.image)] }))
      setMediaError('')
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Unable to upload image.')
    }
  }

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files?.length) return
    try {
      const selected = Array.from(files)
      selected.forEach(validateImage)
      const images = await Promise.all(selected.map(readImage))
      setFormData((current) => ({ ...current, images: [...(current.images || []), ...images] }))
      setMediaError('')
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Unable to upload images.')
    }
  }

  const handleCaptainUpload = async (file?: File) => {
    if (!file) return
    try {
      validateImage(file)
      const avatar = await readImage(file)
      setFormData((current) => ({ ...current, captain: { ...current.captain!, avatar } }))
      setMediaError('')
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Unable to upload image.')
    }
  }

  const handlePdfUpload = async (file?: File) => {
    if (!file) return
    try {
      if (file.type !== 'application/pdf') throw new Error('Please select a PDF file.')
      if (file.size > 50 * 1024 * 1024) throw new Error('PDF must be smaller than 50 MB.')
      const pdfUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error('Unable to read the selected PDF.'))
        reader.readAsDataURL(file)
      })
      setFormData((current) => ({ ...current, pdfUrl, _pdfName: file.name } as any))
      setMediaError('')
      showToast('PDF uploaded successfully')
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Unable to upload PDF.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _pdfName, ...cleanData } = formData as any
    const finalData = {
      ...cleanData,
      images: formData.images && formData.images.length > 0 ? formData.images : [formData.image || ''],
      inclusion: (formData.inclusion || []).filter(item => item.trim()),
      exclusion: (formData.exclusion || []).filter(item => item.trim()),
      thingsToCarry: (formData.thingsToCarry || []).filter(item => item.trim()),
      termsAndConditions: (formData.termsAndConditions || '').trim(),
      departureDates: mergeUniqueDates([cleanData.nextBatch, ...(formData.departureDates || [])]),
      itinerary: formData.itinerary || []
    }

    try {
      if (id && id !== 'new') {
        await updateTrip(finalData as Trip)
        showToast('Package updated successfully')
      } else {
        await addTrip(finalData as Omit<Trip, 'id'>)
        showToast('Package created successfully')
      }
      setTimeout(() => navigate('/admin/dashboard'), 1200)
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : 'Unable to save the package.')
    }
  }

  const handleApplyConfirmedDateChange = () => {
    const index = Number(confirmedDateIndex)
    if (!Number.isInteger(index) || index < 0) {
      setMediaError('Select the confirmed trip date you want to change.')
      return
    }
    if (!confirmedDateValue) {
      setMediaError('Choose the new confirmed trip date.')
      return
    }

    const departureDates = [...(formData.departureDates || [])]
    const previousDate = departureDates[index]
    if (!previousDate) {
      setMediaError('Selected confirmed trip date is not available.')
      return
    }

    departureDates[index] = confirmedDateValue
    setFormData({
      ...formData,
      _confirmedDateChange: { oldDate: previousDate, newDate: confirmedDateValue },
      departureDates,
      nextBatch: formData.nextBatch === previousDate || !formData.nextBatch ? confirmedDateValue : formData.nextBatch
    } as Partial<Trip>)
    setMediaError('')
    showToast('Confirmed trip date updated. Save package to notify booked users.')
  }

  return (
    <div className="min-h-screen bg-white text-white px-4 sm:px-5 md:px-10 lg:px-12 pt-24 md:pt-32 pb-52 lg:pb-36">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
          <div className="space-y-5">
            <Link to="/admin/dashboard" className="inline-flex items-center text-white/50 font-black text-[10px] uppercase tracking-[0.24em] hover:text-secondary transition-all">
              <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-[10px] font-black uppercase tracking-[0.24em] mb-4">
                <Globe size={14} /> Package Builder
              </div>
              <h2 className="text-4xl md:text-6xl font-sans font-black tracking-tighter uppercase italic leading-none font-bungee">
                {id === 'new' ? 'New' : 'Edit'} <span className="text-secondary font-bungee">Package</span>
              </h2>
              <p className="text-white/45 font-bold italic mt-3 max-w-xl">
                Configure package details, images, batches, itinerary and trip lead.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <Star size={17} className="mx-auto text-secondary mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest text-white/35">Rating</p>
              <p className="font-black">{formData.rating}</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <List size={17} className="mx-auto text-secondary mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest text-white/35">Days</p>
              <p className="font-black">{formData.itinerary?.length || 0}</p>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <Users size={17} className="mx-auto text-secondary mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest text-white/35">Group</p>
              <p className="font-black">{formData.groupSize || '--'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={sectionClass}>
            <h3 className="text-xl font-sans font-black uppercase italic tracking-widest text-white flex items-center">
              <Info size={20} className="mr-3 text-secondary" /> Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Trip Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mystical Manali Adventure"
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Himachal Pradesh"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className={labelClass}><IndianRupee size={13} className="mr-1 text-secondary" /> Base Price</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="14,999"
                  className={inputClass}
                  required
                />
              </div>
              <div className="space-y-2 xl:col-span-1">
                <label className={labelClass}>Duration</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="1"
                      value={(() => { const m = String(formData.duration || '').match(/(\d+)\s*Day/i); return m ? m[1] : '' })()}
                      onChange={e => {
                        const days = e.target.value
                        const nights = String(formData.duration || '').match(/(\d+)\s*Night/i)?.[1] || ''
                        setFormData({ ...formData, duration: days && nights ? `${days} Days / ${nights} Nights` : days ? `${days} Days` : '' })
                      }}
                      placeholder="6"
                      className={inputClass}
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-white/30 pointer-events-none">D</span>
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min="0"
                      value={(() => { const m = String(formData.duration || '').match(/(\d+)\s*Night/i); return m ? m[1] : '' })()}
                      onChange={e => {
                        const nights = e.target.value
                        const days = String(formData.duration || '').match(/(\d+)\s*Day/i)?.[1] || ''
                        setFormData({ ...formData, duration: days && nights ? `${days} Days / ${nights} Nights` : days ? `${days} Days` : '' })
                      }}
                      placeholder="5"
                      className={inputClass}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-white/30 pointer-events-none">N</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className={`${inputClass} appearance-none`}
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-white text-white">{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Experience</label>
                <select
                  value={formData.experience}
                  onChange={e => setFormData({ ...formData, experience: e.target.value as Trip['experience'] })}
                  className={`${inputClass} appearance-none`}
                >
                  {EXPERIENCES.map(item => <option key={item.value} value={item.value} className="bg-white text-white">{item.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className={labelClass}>Difficulty Level</label>
              <p className="text-xs text-white/45 ml-2 mb-3">Select the physical difficulty level for this package</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFFICULTY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level.value })}
                    className={`h-14 rounded-2xl border-2 font-black text-xs uppercase tracking-[0.16em] transition-all ${formData.difficulty === level.value
                      ? `${level.color} scale-[1.02] shadow-lg`
                      : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                      }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write an immersive summary for explorers..."
                className={textareaClass}
                required
              />
            </div>
          </motion.section>

          <section className={sectionClass}>
            <h3 className="text-xl font-sans font-black uppercase italic tracking-widest text-white flex items-center">
              <ImageIcon size={20} className="mr-3 text-secondary" /> Media & Highlights
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-7">
              <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-white/[0.03] border border-white/10">
                {formData.image ? (
                  <img src={formData.image} alt="Package preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-white/20">
                    <ImageIcon size={44} />
                    <span className="text-[10px] uppercase font-black tracking-[0.22em]">Cover Preview</span>
                  </div>
                )}
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className={labelClass}>Main Cover Image</label>
                  <label className="h-14 rounded-2xl border border-secondary/35 bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary hover:text-white transition-all"><Upload size={16} /> Upload Cover Image<input type="file" accept="image/*" className="sr-only" onChange={(event) => handleCoverUpload(event.target.files?.[0])} /></label>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Gallery Images</label>
                  <label className="min-h-[96px] rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-white/55 font-black text-[10px] uppercase tracking-[0.16em] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-secondary hover:text-secondary transition-all"><Upload size={18} /> Upload one or more images<input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => handleGalleryUpload(event.target.files)} /></label>
                  {formData.images && formData.images.length > 0 && <div className="flex flex-wrap gap-2 pt-2">{formData.images.map((image, index) => <div key={`${image.slice(0, 24)}-${index}`} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10"><img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" /><button type="button" onClick={() => setFormData((current) => ({ ...current, images: (current.images || []).filter((_, imageIndex) => imageIndex !== index) }))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-md bg-black/70 text-white flex items-center justify-center" aria-label="Remove gallery image"><Trash2 size={11} /></button></div>)}</div>}
                </div>
                <div className="space-y-2">
                  <label className={labelClass}><FileText size={13} className="mr-1 text-secondary" /> PDF Brochure</label>
                  {formData.pdfUrl ? (
                    <div className="flex items-center gap-3 h-14 px-5 rounded-2xl border border-green-400/30 bg-green-400/10">
                      <FileText size={18} className="text-green-400 shrink-0" />
                      <span className="text-green-300 font-black text-[10px] uppercase tracking-[0.14em] truncate flex-1">{(formData as any)._pdfName || 'Brochure.pdf'}</span>
                      <button
                        type="button"
                        onClick={() => setFormData((current) => ({ ...current, pdfUrl: '', _pdfName: '' } as any))}
                        className="shrink-0 w-7 h-7 rounded-xl bg-red-400/15 text-red-300 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        aria-label="Remove PDF"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <label className="h-14 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] text-white/55 font-black text-[10px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer hover:border-secondary hover:text-secondary transition-all">
                      <Upload size={16} /> Upload PDF Brochure
                      <input type="file" accept="application/pdf" className="sr-only" onChange={(event) => handlePdfUpload(event.target.files?.[0])} />
                    </label>
                  )}
                  <p className="text-[10px] text-white/30 ml-2">PDF only · max 50 MB · users can download from the trip page</p>
                </div>
              </div>
            </div>

            {mediaError && <p className="text-sm font-bold text-red-300">{mediaError}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Inclusion (Press Enter after each item)</label>
                <div className="space-y-2">
                  {(formData.inclusion || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={e => {
                          const newInclusion = [...(formData.inclusion || [])]
                          newInclusion[index] = e.target.value
                          setFormData({ ...formData, inclusion: newInclusion })
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            setFormData({
                              ...formData,
                              inclusion: [...(formData.inclusion || []), '']
                            })
                          }
                        }}
                        placeholder="e.g., Accommodation"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newInclusion = [...(formData.inclusion || [])]
                          newInclusion.splice(index, 1)
                          setFormData({ ...formData, inclusion: newInclusion })
                        }}
                        className="w-12 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        aria-label="Remove inclusion item"
                      >
                        <Trash2 size={16} className="mx-auto" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      inclusion: [...(formData.inclusion || []), '']
                    })}
                    className="w-full h-12 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Plus size={16} /> Add Inclusion Item
                  </button>
                </div>
                <p className="text-[10px] text-white/30 ml-2">What's included in the package</p>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Exclusion (Press Enter after each item)</label>
                <div className="space-y-2">
                  {(formData.exclusion || []).map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={e => {
                          const newExclusion = [...(formData.exclusion || [])]
                          newExclusion[index] = e.target.value
                          setFormData({ ...formData, exclusion: newExclusion })
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            setFormData({
                              ...formData,
                              exclusion: [...(formData.exclusion || []), '']
                            })
                          }
                        }}
                        placeholder="e.g., Personal Expenses"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newExclusion = [...(formData.exclusion || [])]
                          newExclusion.splice(index, 1)
                          setFormData({ ...formData, exclusion: newExclusion })
                        }}
                        className="w-12 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                        aria-label="Remove exclusion item"
                      >
                        <Trash2 size={16} className="mx-auto" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      exclusion: [...(formData.exclusion || []), '']
                    })}
                    className="w-full h-12 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2 font-bold text-sm"
                  >
                    <Plus size={16} /> Add Exclusion Item
                  </button>
                </div>
                <p className="text-[10px] text-white/30 ml-2">What's not included in the package</p>
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-sans font-black uppercase italic tracking-widest text-white flex items-center">
                <List size={20} className="mr-3 text-secondary" /> Itinerary
              </h3>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  itinerary: [...(formData.itinerary || []), { day: (formData.itinerary?.length || 0) + 1, title: '', description: '' }]
                })}
                className="h-11 px-5 rounded-2xl bg-secondary/15 text-secondary border border-secondary/20 uppercase font-black text-[10px] tracking-[0.18em] flex items-center justify-center gap-2 hover:bg-secondary hover:text-white transition-colors"
              >
                <Plus size={14} /> Add Day
              </button>
            </div>

            <div className="space-y-5">
              {formData.itinerary?.map((item, index) => (
                <div key={index} className="p-5 md:p-6 bg-white/[0.04] rounded-[2rem] border border-white/10 relative group">
                  <button
                    type="button"
                    onClick={() => {
                      const newItinerary = [...(formData.itinerary || [])]
                      newItinerary.splice(index, 1)
                      newItinerary.forEach((it, idx) => { it.day = idx + 1 })
                      setFormData({ ...formData, itinerary: newItinerary })
                    }}
                    className="absolute -top-3 -right-3 bg-red-500/15 text-red-300 border border-red-400/20 w-9 h-9 rounded-2xl flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                    aria-label="Remove day"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="w-16 h-16 bg-secondary/15 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-secondary/20">
                      <span className="text-[8px] uppercase font-black text-white/35">Day</span>
                      <span className="font-black text-secondary text-xl">{item.day}</span>
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => {
                        const newItinerary = [...(formData.itinerary || [])]
                        newItinerary[index].title = e.target.value
                        setFormData({ ...formData, itinerary: newItinerary })
                      }}
                      placeholder="Day Title (e.g. Arrival in Manali)"
                      className={inputClass}
                      required
                    />
                  </div>
                  <textarea
                    value={item.description}
                    onChange={e => {
                      const newItinerary = [...(formData.itinerary || [])]
                      newItinerary[index].description = e.target.value
                      setFormData({ ...formData, itinerary: newItinerary })
                    }}
                    placeholder="Day description..."
                    className={textareaClass}
                    required
                  />
                </div>
              ))}

              {(!formData.itinerary || formData.itinerary.length === 0) && (
                <p className="text-center text-white/35 font-bold italic py-8 border border-dashed border-white/10 rounded-[2rem]">
                  No itinerary days added yet. Add a day to get started.
                </p>
              )}
            </div>
          </section>

          <motion.section 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className={sectionClass}
          >
            <h3 className="text-xl font-sans font-black uppercase italic tracking-widest text-white flex items-center">
              <List size={20} className="mr-3 text-secondary" /> Things to Carry
            </h3>
            <p className="text-xs text-white/45 ml-2 mb-4">Essential items travelers should bring for this trip</p>

            <div className="space-y-2">
              {(formData.thingsToCarry || []).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={e => {
                      const newThingsToCarry = [...(formData.thingsToCarry || [])]
                      newThingsToCarry[index] = e.target.value
                      setFormData({ ...formData, thingsToCarry: newThingsToCarry })
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        setFormData({ 
                          ...formData, 
                          thingsToCarry: [...(formData.thingsToCarry || []), ''] 
                        })
                      }
                    }}
                    placeholder="e.g., Warm Clothes, Trekking Shoes, Sunscreen"
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newThingsToCarry = [...(formData.thingsToCarry || [])]
                      newThingsToCarry.splice(index, 1)
                      setFormData({ ...formData, thingsToCarry: newThingsToCarry })
                    }}
                    className="w-12 shrink-0 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} className="mx-auto" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  thingsToCarry: [...(formData.thingsToCarry || []), ''] 
                })}
                className="w-full h-12 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2 font-bold text-sm"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 16 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }}
            className={sectionClass}
          >
            <h3 className="text-xl font-sans font-black uppercase italic tracking-widest text-white flex items-center">
              <FileText size={20} className="mr-3 text-secondary" /> Terms & Conditions
            </h3>
            <p className="text-xs text-white/45 ml-2 mb-4">Package-specific terms, cancellation policy, and important guidelines</p>

            <div className="space-y-2">
              <textarea
                value={formData.termsAndConditions}
                onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
                placeholder="Enter terms and conditions, cancellation policy, payment terms, safety guidelines, etc.&#10;&#10;Example:&#10;• Full payment required 15 days before departure&#10;• 50% refund if cancelled 7 days before trip&#10;• No refund for cancellations within 3 days&#10;• Travel insurance recommended&#10;• Valid ID proof mandatory"
                className={`${textareaClass} min-h-[200px]`}
              />
              <p className="text-[10px] text-white/30 ml-2">Use bullet points (•) or numbers for better readability</p>
            </div>
          </motion.section>

          <section className={sectionClass}>
            <h3 className="text-xl font-sans font-black uppercase italic tracking-widest text-white flex items-center">
              <Clock size={20} className="mr-3 text-secondary" /> Logistics & Batches
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={labelClass}>Next Batch Date</label>
                <input
                  type="date"
                  value={toDateInputValue(formData.nextBatch)}
                  onChange={e => handleNextBatchChange(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Group Size</label>
                <input
                  type="text"
                  value={formData.groupSize}
                  onChange={e => setFormData({ ...formData, groupSize: e.target.value })}
                  placeholder="e.g. 12-15 Persons"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-secondary/25 bg-secondary/10 p-5 md:p-6 space-y-5">
              <div>
                <label className={labelClass}>Change Confirmed Trip Date</label>
                <p className="text-xs text-white/50 mt-2 ml-2">
                  Use this when users have already booked a confirmed departure. After you save the package, all confirmed bookings for this changed date are updated and emailed automatically.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 md:items-end">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-[0.18em] ml-2">Current confirmed date</label>
                  <select
                    value={confirmedDateIndex}
                    onChange={(event) => {
                      setConfirmedDateIndex(event.target.value)
                      const selectedDate = formData.departureDates?.[Number(event.target.value)] || ''
                      setConfirmedDateValue(selectedDate)
                    }}
                    className={`${inputClass} p-3 text-sm`}
                  >
                    <option value="" className="bg-slate-900">Select date</option>
                    {(formData.departureDates || []).map((date, index) => date ? (
                      <option key={`${date}-${index}`} value={index} className="bg-slate-900">{date}</option>
                    ) : null)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black text-white/40 tracking-[0.18em] ml-2">New date</label>
                  <input
                    type="date"
                    value={confirmedDateValue}
                    onChange={(event) => setConfirmedDateValue(event.target.value)}
                    className={`${inputClass} p-3 text-sm`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyConfirmedDateChange}
                  className="h-12 px-5 rounded-2xl bg-secondary text-white font-black text-[9px] uppercase tracking-[0.16em] hover:bg-secondary/80 transition-all"
                >
                  Apply Date
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <label className={labelClass}>Available Departure Dates</label>
                  <p className="text-xs text-white/45 mt-2 ml-2">Travellers can select only these dates on trip cards.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, departureDates: [...(formData.departureDates || []), ''] })}
                  className="h-10 px-4 rounded-xl bg-secondary/15 text-secondary border border-secondary/20 uppercase font-black text-[9px] tracking-[0.16em] hover:bg-secondary hover:text-white transition-colors"
                >
                  <Plus size={13} className="inline mr-1" /> Add date
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {formData.departureDates?.map((date, index) => <div key={`${date}-${index}`} className="flex gap-2">
                  <input
                    type="date"
                    value={date}
                    onChange={event => {
                      const departureDates = [...(formData.departureDates || [])]
                      departureDates[index] = event.target.value
                      setFormData({ ...formData, departureDates })
                    }}
                    className={`${inputClass} p-3 text-sm min-w-0`}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, departureDates: (formData.departureDates || []).filter((_, dateIndex) => dateIndex !== index) })}
                    className="w-11 shrink-0 rounded-xl border border-red-200 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Remove departure date"
                  >
                    <Trash2 size={15} className="mx-auto" />
                  </button>
                </div>)}
              </div>
            </div>
          </section>

          <section className={sectionClass}>
            <h3 className="text-xl font-sans font-black uppercase italic tracking-widest text-white flex items-center">
              <User size={20} className="mr-3 text-secondary" /> Expedition Lead
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-7">
              <div className="space-y-4">
                <div className="aspect-square rounded-[2rem] overflow-hidden bg-white/[0.03] border border-white/10">
                  {formData.captain?.avatar ? (
                    <img src={formData.captain.avatar} alt="Captain preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/20">
                      <User size={44} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-black tracking-widest">
                  <MapPin size={13} className="text-secondary" /> Lead Preview
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Captain Name</label>
                    <input
                      type="text"
                      value={formData.captain?.name}
                      onChange={e => setFormData({ ...formData, captain: { ...formData.captain!, name: e.target.value } })}
                      placeholder="e.g. Captain Rohan Shah"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Captain Image</label>
                    <label className="h-14 rounded-2xl border border-secondary/35 bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 cursor-pointer hover:bg-secondary hover:text-white transition-all"><Upload size={16} /> Upload Captain Image<input type="file" accept="image/*" className="sr-only" onChange={(event) => handleCaptainUpload(event.target.files?.[0])} /></label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Captain Bio</label>
                  <textarea
                    value={formData.captain?.bio}
                    onChange={e => setFormData({ ...formData, captain: { ...formData.captain!, bio: e.target.value } })}
                    placeholder="Professional background and expertise..."
                    className={textareaClass}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-5 bg-white/85 backdrop-blur-3xl border border-white/10 p-4 md:p-5 rounded-[2rem] fixed bottom-24 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 lg:bottom-6 z-50 shadow-2xl shadow-black/40">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="h-12 px-7 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] text-white/45 hover:text-white hover:bg-white/10 transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="h-12 px-8 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.18em] shadow-xl shadow-secondary/20 hover:bg-secondary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Package
            </button>
          </div>
        </form>
      </div>
      {/* Toast Notification */}
      <div
        className={`fixed bottom-44 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-500/90 backdrop-blur-md text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-green-500/30 border border-green-400/40 transition-all duration-500 lg:bottom-8 ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}
      >
        <CheckCircle size={18} className="shrink-0" />
        {toast.message}
      </div>
    </div>
  )
}

export default EditTrip
