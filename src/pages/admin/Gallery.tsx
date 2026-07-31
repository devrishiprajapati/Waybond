import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Pencil, Save, Trash2, Upload, X } from 'lucide-react'
import { CommunityGallery, communityGalleries, loadCommunityGalleries, saveCommunityGalleries } from '../../lib/communityGalleries'

export default function AdminGallery() {
  const [galleries, setGalleries] = useState<CommunityGallery[]>(communityGalleries)
  const [destination, setDestination] = useState(communityGalleries[0].slug)
  const [source, setSource] = useState('')
  const [alt, setAlt] = useState('')
  const [editingSource, setEditingSource] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    loadCommunityGalleries().then(setGalleries)
  }, [navigate])

  const selectedGallery = useMemo(() => galleries.find((gallery) => gallery.slug === destination), [destination, galleries])

  const persist = async (nextGalleries: CommunityGallery[]) => {
    setGalleries(nextGalleries)
    setSaving(true)
    await saveCommunityGalleries(nextGalleries)
    setSaving(false)
  }

  const handleImageFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setSource(String(reader.result))
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setSource('')
    setAlt('')
    setEditingSource(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedGallery || !source.trim()) return
    const nextGalleries = galleries.map((gallery) => {
      if (gallery.slug !== destination) return gallery
      const image = { src: source.trim(), alt: alt.trim() || `${gallery.destination} travel memory` }
      return {
        ...gallery,
        images: editingSource
          ? gallery.images.map((current) => current.src === editingSource ? image : current)
          : [...gallery.images, image]
      }
    })
    await persist(nextGalleries)
    resetForm()
  }

  const beginEdit = (gallery: CommunityGallery, image: { src: string; alt: string }) => {
    setDestination(gallery.slug)
    setSource(image.src)
    setAlt(image.alt)
    setEditingSource(image.src)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeImage = async (gallery: CommunityGallery, sourceToRemove: string) => {
    if (!window.confirm(`Delete this image from ${gallery.destination}?`)) return
    await persist(galleries.map((item) => item.slug === gallery.slug ? { ...item, images: item.images.filter((image) => image.src !== sourceToRemove) } : item))
    if (editingSource === sourceToRemove) resetForm()
  }

  return (
    <div className="min-h-screen bg-white text-white px-6 md:px-10 lg:px-16 pt-32 pb-20">
      <div className="max-w-[1500px] mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"><ArrowLeft size={15} /> Admin dashboard</Link>
        <div className="mb-10"><p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">Community media</p><h1 className="text-4xl md:text-6xl font-display font-black uppercase italic tracking-tighter liquid-text">Destination <span className="text-primary">Gallery</span></h1></div>

        <form onSubmit={handleSubmit} className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 md:p-8 mb-10">
          <div className="flex items-center justify-between gap-4 mb-6"><h2 className="text-xl font-display font-black uppercase italic text-white">{editingSource ? 'Edit image' : 'Upload image'}</h2>{editingSource && <button type="button" onClick={resetForm} className="text-white/45 hover:text-white"><X size={20} /></button>}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Destination</span><select value={destination} onChange={(event) => setDestination(event.target.value)} className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white outline-none focus:border-secondary">{galleries.map((gallery) => <option className="bg-charcoal" key={gallery.slug} value={gallery.slug}>{gallery.destination}</option>)}</select></label>
            <label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Image URL</span><input value={source} onChange={(event) => setSource(event.target.value)} placeholder="https://..." className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary" /></label>
            <label className="space-y-2"><span className="text-[9px] text-white/40 uppercase font-black tracking-[0.18em]">Image description</span><input value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Describe the image" className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary" /></label>
            <div className="flex items-end gap-3"><label className="h-12 w-12 shrink-0 rounded-xl bg-white/5 border border-white/10 text-secondary hover:bg-secondary hover:text-white flex items-center justify-center cursor-pointer" title="Upload image file"><Upload size={18} /><input type="file" accept="image/*" onChange={handleImageFile} className="hidden" /></label><button type="submit" disabled={!source.trim() || saving} className="h-12 flex-grow rounded-xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 disabled:opacity-50"><Save size={16} /> {saving ? 'Saving' : editingSource ? 'Update' : 'Add image'}</button></div>
          </div>
        </form>

        <div className="space-y-12">
          {galleries.map((gallery) => (
            <section key={gallery.slug}>
              <div className="flex items-center justify-between mb-5"><div><h2 className="text-2xl font-display font-black text-white uppercase italic">{gallery.destination}</h2><p className="text-[9px] text-secondary uppercase font-black tracking-[0.18em] mt-1">{gallery.images.length} images · {gallery.label}</p></div><button onClick={() => setDestination(gallery.slug)} className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 text-secondary hover:bg-secondary hover:text-white flex items-center justify-center" title={`Add ${gallery.destination} image`}><ImagePlus size={18} /></button></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {gallery.images.map((image) => <article key={image.src} className="relative h-60 overflow-hidden rounded-2xl border border-white/10 group"><img src={image.src} alt={image.alt} className="w-full h-full object-cover" /><div className="absolute inset-x-0 bottom-0 p-4 bg-black/70 translate-y-full group-hover:translate-y-0 transition-transform"><p className="text-[10px] text-white truncate mb-3">{image.alt}</p><div className="flex gap-2"><button onClick={() => beginEdit(gallery, image)} className="w-9 h-9 rounded-lg bg-white text-charcoal flex items-center justify-center" title="Edit image"><Pencil size={15} /></button><button onClick={() => removeImage(gallery, image.src)} className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center" title="Delete image"><Trash2 size={15} /></button></div></div></article>)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
