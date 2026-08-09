import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, ImagePlus, Play, Save, Search, Upload, X } from 'lucide-react'
import { Blog, getAllBlogs, saveBlogUpdates } from '../../lib/blogs'

type StoryDraft = Omit<Blog, 'id' | 'tags'> & { tags: string }

const inputClass = 'w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary'
const textareaClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary resize-y'

const toDraft = (story: Blog): StoryDraft => ({
  title: story.title,
  excerpt: story.excerpt,
  content: story.content,
  author: story.author,
  image: story.image,
  youtubeUrl: story.youtubeUrl || '',
  category: story.category,
  date: story.date,
  readTime: story.readTime,
  slug: story.slug,
  tags: story.tags.join(', ')
})

export default function AdminTravelStories() {
  const [stories, setStories] = useState<Blog[]>([])
  const [search, setSearch] = useState('')
  const [editingStory, setEditingStory] = useState<Blog | null>(null)
  const [draft, setDraft] = useState<StoryDraft | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
      return
    }
    setStories(getAllBlogs())
  }, [navigate])

  const filteredStories = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return stories
    return stories.filter((story) =>
      [story.title, story.excerpt, story.author, story.category, story.tags.join(' ')]
        .some((value) => value.toLowerCase().includes(query))
    )
  }, [search, stories])

  const openEditor = (story: Blog) => {
    setEditingStory(story)
    setDraft(toDraft(story))
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateDraft = <K extends keyof StoryDraft>(key: K, value: StoryDraft[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current)
  }

  const readImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please upload an image file.')
    if (file.size > 4 * 1024 * 1024) return setError('The image must be smaller than 4 MB.')
    const reader = new FileReader()
    reader.onload = () => {
      updateDraft('image', String(reader.result))
      setError('')
    }
    reader.onerror = () => setError('Unable to read the selected image.')
    reader.readAsDataURL(file)
  }

  const saveStory = (event: FormEvent) => {
    event.preventDefault()
    if (!editingStory || !draft) return
    if (!draft.title.trim() || !draft.excerpt.trim() || !draft.content.trim() || !draft.image.trim()) {
      setError('Title, excerpt, content, and image are required.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const updated = saveBlogUpdates(editingStory.id, {
        ...draft,
        title: draft.title.trim(),
        excerpt: draft.excerpt.trim(),
        content: draft.content.trim(),
        author: draft.author.trim() || 'WayBond Team',
        image: draft.image.trim(),
        youtubeUrl: draft.youtubeUrl?.trim(),
        category: draft.category.trim() || 'Travel Stories',
        date: draft.date,
        readTime: Number(draft.readTime),
        slug: draft.slug.trim(),
        tags: draft.tags.split(',')
      })
      setStories((current) => current.map((story) => story.id === updated.id ? updated : story))
      setEditingStory(null)
      setDraft(null)
    } catch {
      setError('Unable to save this story.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-white px-6 md:px-10 lg:px-16 pt-32 pb-20">
      <div className="max-w-[1500px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-7 mb-10">
          <div>
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.22em] mb-5"><ArrowLeft size={15} /> Admin dashboard</Link>
            <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-3">Editorial desk</p>
            <h1 className="text-4xl md:text-6xl font-display font-black uppercase italic tracking-tighter liquid-text">Travel <span className="text-primary">Stories</span></h1>
          </div>
          <label className="relative w-full lg:max-w-md">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stories..." className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 pl-11 pr-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-secondary" />
          </label>
        </div>

        {editingStory && draft && (
          <form onSubmit={saveStory} className="liquid-glass-dark border border-secondary/20 rounded-[2rem] p-6 md:p-8 mb-10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-secondary text-[9px] font-black uppercase tracking-[0.22em] mb-2">Update story</p>
                <h2 className="text-2xl md:text-3xl font-display font-black uppercase italic text-white">{editingStory.title}</h2>
              </div>
              <button type="button" onClick={() => { setEditingStory(null); setDraft(null); setError('') }} className="w-11 h-11 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center" title="Close editor"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-7">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Title</span><input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} className={inputClass} /></label>
                  <label className="space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Slug</span><input value={draft.slug} onChange={(event) => updateDraft('slug', event.target.value)} className={inputClass} /></label>
                  <label className="space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Author</span><input value={draft.author} onChange={(event) => updateDraft('author', event.target.value)} className={inputClass} /></label>
                  <label className="space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Category</span><input value={draft.category} onChange={(event) => updateDraft('category', event.target.value)} className={inputClass} /></label>
                  <label className="space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Date</span><input type="date" value={draft.date} onChange={(event) => updateDraft('date', event.target.value)} className={inputClass} /></label>
                  <label className="space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Read time</span><input type="number" min={1} value={draft.readTime} onChange={(event) => updateDraft('readTime', Number(event.target.value))} className={inputClass} /></label>
                </div>
                <label className="block space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Excerpt</span><textarea required rows={3} value={draft.excerpt} onChange={(event) => updateDraft('excerpt', event.target.value)} className={textareaClass} /></label>
                <label className="block space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Story content</span><textarea required rows={9} value={draft.content} onChange={(event) => updateDraft('content', event.target.value)} className={textareaClass} /></label>
                <label className="block space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Tags</span><input value={draft.tags} onChange={(event) => updateDraft('tags', event.target.value)} placeholder="Himachal, Adventure, Nature" className={inputClass} /></label>
                <label className="block space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">YouTube video link</span><input value={draft.youtubeUrl || ''} onChange={(event) => updateDraft('youtubeUrl', event.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={inputClass} /></label>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <img src={draft.image} alt="Travel story preview" className="w-full aspect-[4/3] object-cover" />
                </div>
                <label className="block space-y-2"><span className="text-[9px] text-white/45 font-black uppercase tracking-[0.18em]">Image URL</span><input value={draft.image} onChange={(event) => updateDraft('image', event.target.value)} className={inputClass} /></label>
                <label className="h-12 rounded-xl bg-white/5 border border-white/10 text-secondary hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer font-black text-[10px] uppercase tracking-[0.14em]">
                  <Upload size={16} /> Upload or replace image
                  <input type="file" accept="image/*" onChange={readImage} className="sr-only" />
                </label>
                {error && <p className="text-red-300 text-xs font-bold">{error}</p>}
                <button disabled={saving} type="submit" className="h-12 w-full rounded-xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.14em] flex items-center justify-center gap-2 disabled:opacity-60"><Save size={15} />{saving ? 'Saving' : 'Save updates'}</button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredStories.map((story) => (
            <article key={story.id} className="liquid-glass-dark border border-white/10 rounded-[2rem] overflow-hidden">
              <div className="relative h-52 bg-white/5">
                <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                {story.youtubeUrl && <div className="absolute top-4 right-4 w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg" title="YouTube link added"><Play size={17} fill="currentColor" /></div>}
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[8px] font-black uppercase tracking-[0.18em] px-3 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">{story.category}</span>
                  <span className="text-[9px] text-white/35 font-black uppercase tracking-[0.15em]">{story.readTime} min</span>
                </div>
                <div>
                  <h2 className="text-xl font-display font-black uppercase italic text-white leading-tight">{story.title}</h2>
                  <p className="text-white/45 text-sm leading-relaxed mt-3 line-clamp-2">{story.excerpt}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <span className="text-[9px] text-white/35 font-black uppercase tracking-[0.15em]">{story.author}</span>
                  <button onClick={() => openEditor(story)} className="h-11 px-4 rounded-xl bg-secondary text-white hover:bg-white hover:text-slate-800 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.12em]" title={`Edit ${story.title}`}><Edit2 size={15} /> Edit</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredStories.length === 0 && <div className="liquid-glass-dark border border-white/10 rounded-[2rem] py-16 text-center"><ImagePlus className="mx-auto text-white/20 mb-4" size={40} /><p className="text-white/50 font-bold">No travel stories found.</p></div>}
      </div>
    </div>
  )
}
