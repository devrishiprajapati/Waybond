import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, ArrowLeft, Image as ImageIcon, Trash2, Plus, LayoutDashboard } from 'lucide-react'
import { getHeroSlides, updateHeroSlides, HeroSlide } from '../../lib/dataService'

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
    <div className="min-h-screen bg-gray-50 p-8 md:p-12 pb-32">
      <div className="max-w-5xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center text-primary font-bold hover:gap-2 transition-all mb-10">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-display font-black text-charcoal tracking-tighter uppercase italic">Manage <span className="text-primary">Hero Slides</span></h2>
            <p className="text-gray-400 font-medium italic mt-1">Configure the main carousel on your homepage</p>
          </div>
          <button 
            onClick={addSlide}
            className="bg-charcoal text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center hover:bg-primary transition-all shadow-lg"
          >
            <Plus size={16} className="mr-2" /> Add Slide
          </button>
        </header>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence>
              {slides.map((slide, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-charcoal p-8 rounded-[3rem] shadow-xl border border-gray-100 relative group"
                >
                  <button 
                    type="button"
                    onClick={() => removeSlide(index)}
                    className="absolute -top-3 -right-3 bg-red-100 text-red-500 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:bg-red-200"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative">
                        {slide.image ? (
                          <img src={slide.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300">
                            <ImageIcon size={48} />
                          </div>
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-2">Image URL</label>
                        <input 
                          type="text"
                          value={slide.image}
                          onChange={e => updateSlide(index, 'image', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-medium outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-2">Headline</label>
                        <input 
                          type="text"
                          value={slide.title}
                          onChange={e => updateSlide(index, 'title', e.target.value)}
                          placeholder="e.g. Discover the Art of Travel"
                          className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal font-bold outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-gray-400 tracking-widest ml-2">Sub-headline</label>
                        <textarea 
                          value={slide.subtitle}
                          onChange={e => updateSlide(index, 'subtitle', e.target.value)}
                          placeholder="A short description that grabs attention..."
                          className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal font-medium italic outline-none focus:border-primary transition-all min-h-[120px]"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-6 bg-white/80 backdrop-blur-3xl border border-white/20 p-6 rounded-[2.5rem] fixed bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-2xl shadow-primary/20">
            <button 
              type="button" 
              onClick={() => navigate('/admin/dashboard')}
              className="px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-charcoal transition-all"
            >
              Discard Changes
            </button>
            <button 
              type="submit"
              className="bg-primary text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center"
            >
              <Save size={16} className="mr-2" /> Apply Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditHero
