import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, ArrowLeft, Image as ImageIcon, MapPin, Tag, Clock, Globe, Star, Users, Trash2, Plus, Info, List, User } from 'lucide-react'
import { getTripById, updateTrip, addTrip } from '../../lib/dataService'
import { Trip } from '../../lib/trips'

const CATEGORIES = ['Adventure', 'Beach', 'Luxury', 'Nature', 'Honeymoon', 'Backpacking']

const EditTrip = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState<Partial<Trip>>({
    title: '',
    location: '',
    price: '',
    duration: '',
    category: 'Adventure',
    type: 'Domestic',
    image: '',
    rating: 4.8,
    reviews: 120,
    link: '#',
    description: '',
    images: [],
    highlights: [],
    nextBatch: '',
    groupSize: '',
    captain: {
      name: '',
      role: '',
      bio: '',
      avatar: '',
      rating: 5.0,
      trips: 0
    },
    itinerary: []
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Ensure arrays are handled even if left empty in form
    const finalData = {
      ...formData,
      images: formData.images || [formData.image || ''],
      highlights: formData.highlights || [],
      itinerary: formData.itinerary || []
    }
    
    if (id && id !== 'new') {
      await updateTrip(finalData as Trip)
    } else {
      await addTrip(finalData as Omit<Trip, 'id'>)
    }
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 md:p-12 pb-32">
      <div className="max-w-5xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center text-primary font-bold hover:gap-2 transition-all mb-10">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </Link>

        <header className="mb-12">
          <h2 className="text-4xl font-display font-black text-charcoal tracking-tighter uppercase italic">{id === 'new' ? 'Create' : 'Edit'} <span className="text-primary">Expedition</span></h2>
          <p className="text-gray-400 font-medium italic mt-1">Configure full package details, itinerary, and captain</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section: Basic Info */}
          <div className="bg-charcoal p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 space-y-10">
            <h3 className="text-xl font-display font-black uppercase italic tracking-widest text-charcoal flex items-center">
              <Info size={20} className="mr-3 text-primary" /> Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Trip Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mystical Manali Adventure"
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Himachal Pradesh"
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">₹ Base Price</label>
                <input 
                  type="text" 
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="14,999"
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Duration</label>
                <input 
                  type="text" 
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="6 Days / 5 Nights"
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold appearance-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write an immersive summary for explorers..."
                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-medium min-h-[150px]"
                required
              />
            </div>
          </div>

          {/* Section: Media & Highlights */}
          <div className="bg-charcoal p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 space-y-10">
            <h3 className="text-xl font-display font-black uppercase italic tracking-widest text-charcoal flex items-center">
              <ImageIcon size={20} className="mr-3 text-primary" /> Media & Highlights
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Main Cover Image URL</label>
              <input 
                type="text" 
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-medium text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Gallery Images (Comma separated URLs)</label>
              <textarea 
                value={formData.images?.join(', ')}
                onChange={e => setFormData({ ...formData, images: e.target.value.split(',').map(url => url.trim()).filter(url => url) })}
                placeholder="https://img1.jpg, https://img2.jpg"
                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-medium min-h-[100px] text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Highlights (Comma separated)</label>
              <textarea 
                value={formData.highlights?.join(', ')}
                onChange={e => setFormData({ ...formData, highlights: e.target.value.split(',').map(h => h.trim()).filter(h => h) })}
                placeholder="Traditional Homestays, Professional Photography, Stargazing"
                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold min-h-[100px]"
              />
            </div>
          </div>

          {/* Section: Itinerary */}
          <div className="bg-charcoal p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 space-y-10">
            <h3 className="text-xl font-display font-black uppercase italic tracking-widest text-charcoal flex items-center justify-between">
              <div className="flex items-center"><List size={20} className="mr-3 text-primary" /> Itinerary</div>
              <button 
                type="button" 
                onClick={() => setFormData({ 
                  ...formData, 
                  itinerary: [...(formData.itinerary || []), { day: (formData.itinerary?.length || 0) + 1, title: '', description: '' }] 
                })}
                className="text-[10px] text-primary bg-primary/10 px-4 py-2 rounded-full uppercase font-black tracking-widest flex items-center hover:bg-primary/20 transition-colors"
              >
                <Plus size={14} className="mr-1"/> Add Day
              </button>
            </h3>
            
            <div className="space-y-8">
              {formData.itinerary?.map((item, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative group">
                  <button 
                    type="button"
                    onClick={() => {
                      const newItinerary = [...(formData.itinerary || [])];
                      newItinerary.splice(index, 1);
                      newItinerary.forEach((it, idx) => it.day = idx + 1);
                      setFormData({ ...formData, itinerary: newItinerary });
                    }}
                    className="absolute -top-3 -right-3 bg-red-100 text-red-500 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-10 hover:bg-red-200"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-charcoal rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm border border-gray-100">
                      <span className="text-[8px] uppercase font-black text-gray-400">Day</span>
                      <span className="font-bold text-charcoal">{item.day}</span>
                    </div>
                    <div className="flex-grow">
                      <input 
                        type="text" 
                        value={item.title}
                        onChange={e => {
                          const newItinerary = [...(formData.itinerary || [])];
                          newItinerary[index].title = e.target.value;
                          setFormData({ ...formData, itinerary: newItinerary });
                        }}
                        placeholder="Day Title (e.g. Arrival in Manali)"
                        className="w-full bg-charcoal border border-gray-100 p-4 rounded-xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                  <textarea 
                    value={item.description}
                    onChange={e => {
                      const newItinerary = [...(formData.itinerary || [])];
                      newItinerary[index].description = e.target.value;
                      setFormData({ ...formData, itinerary: newItinerary });
                    }}
                    placeholder="Day description..."
                    className="w-full bg-charcoal border border-gray-100 p-4 rounded-xl text-charcoal focus:border-primary outline-none transition-all font-medium min-h-[100px]"
                    required
                  />
                </div>
              ))}
              {(!formData.itinerary || formData.itinerary.length === 0) && (
                <p className="text-center text-gray-400 font-medium italic py-4">No itinerary days added yet. Add a day to get started.</p>
              )}
            </div>
          </div>

          {/* Section: Logistics */}
          <div className="bg-charcoal p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 space-y-10">
            <h3 className="text-xl font-display font-black uppercase italic tracking-widest text-charcoal flex items-center">
              <Clock size={20} className="mr-3 text-primary" /> Logistics & Batches
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Next Batch Date</label>
                <input 
                  type="text" 
                  value={formData.nextBatch}
                  onChange={e => setFormData({ ...formData, nextBatch: e.target.value })}
                  placeholder="e.g. Oct 15, 2026"
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Group Size</label>
                <input 
                  type="text" 
                  value={formData.groupSize}
                  onChange={e => setFormData({ ...formData, groupSize: e.target.value })}
                  placeholder="e.g. 12-15 Persons"
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section: Captain */}
          <div className="bg-charcoal p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 space-y-10">
            <h3 className="text-xl font-display font-black uppercase italic tracking-widest text-charcoal flex items-center">
              <User size={20} className="mr-3 text-primary" /> Expedition Lead (Captain)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Captain Name</label>
                <input 
                  type="text" 
                  value={formData.captain?.name}
                  onChange={e => setFormData({ ...formData, captain: { ...formData.captain!, name: e.target.value } })}
                  placeholder="e.g. Captain Rohan Shah"
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Captain Avatar URL</label>
                <input 
                  type="text" 
                  value={formData.captain?.avatar}
                  onChange={e => setFormData({ ...formData, captain: { ...formData.captain!, avatar: e.target.value } })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-medium text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] ml-4 flex items-center">Captain Bio</label>
              <textarea 
                value={formData.captain?.bio}
                onChange={e => setFormData({ ...formData, captain: { ...formData.captain!, bio: e.target.value } })}
                placeholder="Professional background and expertise..."
                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-charcoal focus:border-primary outline-none transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-6 bg-white/80 backdrop-blur-3xl border border-white/20 p-6 rounded-[2.5rem] fixed bottom-8 left-1/2 -translate-x-1/2 z-50 shadow-2xl shadow-primary/20">
            <button 
              type="button" 
              onClick={() => navigate('/admin/dashboard')}
              className="px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:text-charcoal transition-all"
            >
              Discard
            </button>
            <button 
              type="submit"
              className="bg-primary text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center"
            >
              <Save size={16} className="mr-2" /> Save Package
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTrip
