import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, ArrowLeft, Image as ImageIcon, Trash2, Plus, LayoutDashboard, Sparkles } from 'lucide-react'
import { getHeroSlides, updateHeroSlides, HeroSlide } from '../../lib/dataService'

const inputClass = 'w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl text-white placeholder:text-white/25 focus:border-secondary focus:bg-white/10 outline-none transition-all font-bold'
const labelClass = 'text-[10px] uppercase font-black text-white/45 tracking-[0.2em] ml-2'

const EditHero = () => {
  const navigate = useNavigate()
  const [slides, setSlides] = useState<HeroSlide[]>([])

  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login')
    }
    getHeroSlides().then(setSlides)
  }, [navigate])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateHeroSlides(slides)
    navigate('/admin/dashboard')
  }

  const addSlide = () => {
    setSlides([...slides, { image: '', title: '', subtitle: '' }])
  }

  const removeSlide = (index: number) => {
    const newSlides = [...slides]
    newSlides.splice(index, 1)
    setSlides(newSlides)
  }

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    const newSlides = [...slides]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setSlides(newSlides)
  }

  return (
    <div className="min-h-screen bg-white text-white px-5 md:px-10 lg:px-12 pt-32 pb-36">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
          <div className="space-y-5">
            <Link to="/admin/dashboard" className="inline-flex items-center text-white/50 font-black text-[10px] uppercase tracking-[0.24em] hover:text-secondary transition-all">
              <ArrowLeft size={18} className="mr-2" /> Back to Dashboard
            </Link>
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-[10px] font-black uppercase tracking-[0.24em] mb-4">
                <LayoutDashboard size={14} /> Homepage Editor
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic leading-none">
                Hero <span className="text-secondary">Slides</span>
              </h2>
              <p className="text-white/45 font-bold italic mt-3 max-w-xl">
                Update the main homepage carousel headline, subtitle, and background image.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addSlide}
            className="h-[52px] px-7 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 shadow-2xl shadow-secondary/20 hover:bg-secondary/90 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Plus size={16} /> Add Slide
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-7">
          <AnimatePresence>
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-5 md:p-7 relative overflow-hidden group"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-2xl bg-red-500/10 text-red-300 border border-red-400/20 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                  aria-label="Remove slide"
                >
                  <Trash2 size={17} />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-7">
                  <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-white/[0.03] border border-white/10 relative">
                      {slide.image ? (
                        <img src={slide.image} alt="Hero preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col gap-3 items-center justify-center h-full text-white/20">
                          <ImageIcon size={48} />
                          <span className="text-[10px] uppercase font-black tracking-[0.22em]">Image Preview</span>
                        </div>
                      )}
                      <div className="absolute left-4 top-4 px-3 py-1.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-xl text-[10px] font-black uppercase tracking-widest">
                        Slide {index + 1}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Image URL</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={e => updateSlide(index, 'image', e.target.value)}
                        placeholder="https://..."
                        className={`${inputClass} text-sm`}
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pr-0 md:pr-12 lg:pr-0">
                    <div className="flex items-center gap-3 text-white/35 text-[10px] uppercase font-black tracking-[0.24em]">
                      <Sparkles size={15} className="text-secondary" /> Main Message
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Headline</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={e => updateSlide(index, 'title', e.target.value)}
                        placeholder="e.g. From Miles To Memories"
                        className={`${inputClass} text-xl md:text-2xl font-black uppercase italic`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Sub-headline</label>
                      <textarea
                        value={slide.subtitle}
                        onChange={e => updateSlide(index, 'subtitle', e.target.value)}
                        placeholder="A short description that grabs attention..."
                        className={`${inputClass} min-h-[140px] resize-none font-semibold italic leading-relaxed`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {slides.length === 0 && (
            <div className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-12 text-center">
              <ImageIcon size={44} className="mx-auto text-white/15 mb-4" />
              <p className="text-white/45 font-bold italic">No hero slides yet. Add one slide to start the homepage carousel.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-5 bg-white/85 backdrop-blur-3xl border border-white/10 p-4 md:p-5 rounded-[2rem] fixed bottom-6 left-5 right-5 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50 shadow-2xl shadow-black/40">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="h-12 px-7 rounded-2xl font-black text-[10px] uppercase tracking-[0.18em] text-white/45 hover:text-white hover:bg-white/10 transition-all"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              className="h-12 px-8 rounded-2xl bg-secondary text-white font-black text-[10px] uppercase tracking-[0.18em] shadow-xl shadow-secondary/20 hover:bg-secondary/90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={16} /> Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditHero
