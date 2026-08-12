import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Pencil, Save, Trash2, Upload, X } from 'lucide-react'
import { CommunityGallery, communityGalleries, loadCommunityGalleries, saveCommunityGalleries } from '../../lib/communityGalleries'

const inputClass = 'w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary'

export default function AdminGallery() {
  const [galleries, setGalleries] = useState<CommunityGallery[]>(communityGalleries)
  const [destination, setDestination] = useState(communityGalleries[0].slug)
  const [destinationName, setDestinationName] = useState(communityGalleries[0].destination)
  const [destinationLabel, setDestinationLabel] = useState(communityGalleries[0].label)
  const [cardCover, setCardCover] = useState(communityGalleries[0].images[0]?.src || '')
  const [source, setSource] = useState('')
  const [alt, setAlt] = useState('')
  const [editingSource, setEditingSource] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const navigate = useNavigate()
  const selectedGallery = useMemo(() => galleries.find((gallery) => gallery.slug === destination), [destination, galleries])

  const syncDestination = (gallery?: CommunityGallery) => {
    if (!gallery) return
    setDestination(gallery.slug)
    setDestinationName(gallery.destination)
    setDestinationLabel(gallery.label)
    setCardCover(gallery.images[0]?.src || '')
  }

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    loadCommunityGalleries().then((loadedGalleries) => {
      setGalleries(loadedGalleries)
      syncDestination(loadedGalleries[0])
    })
  }, [navigate])

  const persist = async (nextGalleries: CommunityGallery[]) => {
    setGalleries(nextGalleries)
    setSaving(true)
    try { await saveCommunityGalleries(nextGalleries) } finally { setSaving(false) }
  }

  const readFile = (file: File | undefined, apply: (value: string) => void) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return setUploadError('Please select an image file.')
    if (file.size > 4 * 1024 * 1024) return setUploadError('Each image must be smaller than 4 MB.')
    const reader = new FileReader()
    reader.onload = () => { apply(String(reader.result)); setUploadError('') }
    reader.onerror = () => setUploadError('Unable to read the selected image.')
    reader.readAsDataURL(file)
  }

  const resetImageForm = () => { setSource(''); setAlt(''); setEditingSource(null) }

  const saveDestinationCard = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedGallery || !destinationName.trim() || !destinationLabel.trim() || !cardCover) return setUploadError('Destination name, label, and card cover image are required.')
    const nextGalleries = galleries.map((gallery) => gallery.slug !== selectedGallery.slug ? gallery : {
      ...gallery,
      destination: destinationName.trim(),
      label: destinationLabel.trim(),
      images: [{ src: cardCover, alt: gallery.images[0]?.alt || `${destinationName.trim()} destination card` }, ...gallery.images.slice(1)]
    })
    await persist(nextGalleries)
    syncDestination(nextGalleries.find((gallery) => gallery.slug === selectedGallery.slug))
  }

  const saveImage = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedGallery || !source.trim()) return
    const nextGalleries = galleries.map((gallery) => {
      if (gallery.slug !== destination) return gallery
      const image = { src: source.trim(), alt: alt.trim() || `${gallery.destination} travel memory` }
      return { ...gallery, images: editingSource ? gallery.images.map((current) => current.src === editingSource ? image : current) : [...gallery.images, image] }
    })
    await persist(nextGalleries)
    resetImageForm()
  }

  const editImage = (gallery: CommunityGallery, image: { src: string; alt: string }) => {
    syncDestination(gallery)
    setSource(image.src)
    setAlt(image.alt)
    setEditingSource(image.src)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeImage = async (gallery: CommunityGallery, sourceToRemove: string) => {
    if (gallery.images.length <= 1) return setUploadError('A destination needs one image for its Moments Captured card.')
    if (!window.confirm(`Delete this image from ${gallery.destination}?`)) return
    await persist(galleries.map((item) => item.slug === gallery.slug ? { ...item, images: item.images.filter((image) => image.src !== sourceToRemove) } : item))
    if (editingSource === sourceToRemove) resetImageForm()
  }

  return <div className="min-h-screen bg-white text-white px-6 md:px-10 lg:px-16 pt-32 pb-20"><div className="max-w-[1500px] mx-auto">
    <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"><ArrowLeft size={15} /> Admin dashboard</Link>
    <div className="mb-10"><p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">Community media</p><h1 className="text-4xl md:text-6xl font-sans font-black uppercase italic tracking-tighter liquid-text font-bungee">Destination <span className="text-primary font-bungee">Gallery</span></h1></div>

    <form onSubmit={saveDestinationCard} className="liquid-glass-dark border border-secondary/20 rounded-[2rem] p-6 md:p-8 mb-7"><div className="flex items-center justify-between gap-4 mb-6"><div><p className="text-secondary font-black text-[9px] uppercase tracking-[0.2em] mb-2">Community page</p><h2 className="text-xl font-sans font-black uppercase italic text-white">Moments Captured Card</h2></div><Pencil size={19} className="text-secondary" /></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"><label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Destination</span><select value={destination} onChange={(event) => syncDestination(galleries.find((gallery) => gallery.slug === event.target.value))} className={inputClass}>{galleries.map((gallery) => <option className="bg-charcoal" key={gallery.slug} value={gallery.slug}>{gallery.destination}</option>)}</select></label><label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Card title</span><input value={destinationName} onChange={(event) => setDestinationName(event.target.value)} className={inputClass} required /></label><label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Card label</span><input value={destinationLabel} onChange={(event) => setDestinationLabel(event.target.value)} className={inputClass} required /></label><label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Card cover image</span><span className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"><Upload size={16} /> Upload cover<input type="file" accept="image/*" className="sr-only" onChange={(event) => readFile(event.target.files?.[0], setCardCover)} /></span></label></div>{cardCover && <div className="mt-5 flex items-center gap-4"><img src={cardCover} alt="Destination card cover preview" className="w-20 h-14 rounded-xl object-cover border border-white/10" /><button disabled={saving} type="submit" className="h-12 px-5 rounded-xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.14em] flex items-center gap-2 disabled:opacity-50"><Save size={16} /> {saving ? 'Saving' : 'Save card'}</button></div>}</form>

    <form onSubmit={saveImage} className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 md:p-8 mb-10"><div className="flex items-center justify-between gap-4 mb-6"><h2 className="text-xl font-sans font-black uppercase italic text-white">{editingSource ? 'Edit gallery image' : 'Upload gallery image'}</h2>{editingSource && <button type="button" onClick={resetImageForm} className="text-white/45 hover:text-white"><X size={20} /></button>}</div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"><label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Destination</span><select value={destination} onChange={(event) => syncDestination(galleries.find((gallery) => gallery.slug === event.target.value))} className={inputClass}>{galleries.map((gallery) => <option className="bg-charcoal" key={gallery.slug} value={gallery.slug}>{gallery.destination}</option>)}</select></label><label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Image file</span><span className="h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"><Upload size={16} /> {source ? 'Replace image' : 'Upload image'}<input type="file" accept="image/*" onChange={(event: ChangeEvent<HTMLInputElement>) => readFile(event.target.files?.[0], setSource)} className="sr-only" /></span></label><label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Image description</span><input value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Describe the image" className={inputClass} /></label><div className="flex items-end"><button type="submit" disabled={!source.trim() || saving} className="h-12 w-full rounded-xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 disabled:opacity-50"><Save size={16} /> {saving ? 'Saving' : editingSource ? 'Update' : 'Add image'}</button></div></div></form>
    {uploadError && <p className="mb-6 text-sm font-bold text-red-300">{uploadError}</p>}
    <div className="space-y-12">{galleries.map((gallery) => <section key={gallery.slug}><div className="flex items-center justify-between mb-5"><div><h2 className="text-2xl font-sans font-black text-white uppercase italic">{gallery.destination}</h2><p className="text-[9px] text-secondary uppercase font-black tracking-[0.18em] mt-1">{gallery.images.length} images · {gallery.label}</p></div><div className="flex gap-2"><button onClick={() => { syncDestination(gallery); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-secondary hover:bg-secondary hover:text-white flex items-center justify-center" title={`Edit ${gallery.destination} card`}><Pencil size={17} /></button><button onClick={() => { syncDestination(gallery); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-secondary hover:bg-secondary hover:text-white flex items-center justify-center" title={`Add ${gallery.destination} image`}><ImagePlus size={18} /></button></div></div><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">{gallery.images.map((image) => <article key={image.src} className="relative h-60 overflow-hidden rounded-2xl border border-white/10 group"><img src={image.src} alt={image.alt} className="w-full h-full object-cover" /><div className="absolute inset-x-0 bottom-0 p-4 bg-black/70 translate-y-full group-hover:translate-y-0 transition-transform"><p className="text-[10px] text-white truncate mb-3">{image.alt}</p><div className="flex gap-2"><button onClick={() => editImage(gallery, image)} className="w-9 h-9 rounded-lg bg-white text-charcoal flex items-center justify-center" title="Edit image"><Pencil size={15} /></button><button onClick={() => removeImage(gallery, image.src)} className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center" title="Delete image"><Trash2 size={15} /></button></div></div></article>)}</div></section>)}</div>
  </div></div>
}
