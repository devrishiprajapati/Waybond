import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, Star, ArrowLeft, Package } from 'lucide-react'
import { getUser } from '../../lib/auth'

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { userId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const parsedUser = getUser()
    if (!parsedUser) {
      navigate('/login')
      return
    }

    // Verify that the userId in URL matches the logged-in user's database ID
    if (!parsedUser.id || (userId && userId !== parsedUser.id)) {
      navigate('/login')
      return
    }

    const loadTestimonials = async () => {
      try {
        if (!parsedUser.id) throw new Error('No database user')
        const response = await fetch(`/api/users/${parsedUser.id}/dashboard`)
        if (!response.ok) throw new Error('Dashboard unavailable')
        const data = await response.json()

        // Get user's testimonials
        setTestimonials(data.testimonials || [])
      } catch (error) {
        console.error('Failed to load testimonials:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTestimonials()
  }, [navigate, userId])

  return (
    <div className="min-h-screen bg-white text-white pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="mb-14">
          <button
            onClick={() => navigate(`/dashboard/${userId}`)}
            className="flex items-center gap-2 text-secondary hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest mb-6"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <div className="space-y-4">
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[10px]">Your Reviews</span>
            <h1 className="text-5xl md:text-7xl font-bungee font-black tracking-tighter uppercase italic leading-none liquid-text">
              My <span className="text-primary">Testimonials</span>
            </h1>
            <p className="text-white/50 max-w-2xl font-medium italic">
              Share your travel experiences and help other adventurers discover amazing destinations.
            </p>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/40 font-medium">Loading testimonials...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {testimonials.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="liquid-glass-dark border border-white/10 rounded-[2.5rem] p-12 md:p-16 text-center"
              >
                <MessageCircle className="text-white/15 mx-auto mb-6" size={48} />
                <h2 className="text-2xl font-bungee font-black text-white mb-3">No Testimonials Yet</h2>
                <p className="text-white/50 font-medium mb-8">Share your travel story and help inspire others!</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-secondary text-white h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.16em] hover:bg-secondary/80 transition-all"
                >
                  Add a Testimonial
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <motion.article
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="liquid-glass-dark border border-white/10 rounded-[2rem] p-6 md:p-8 space-y-4 hover:border-secondary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-secondary font-black uppercase tracking-[0.18em]">{testimonial.trip}</p>
                        <p className="text-xs text-white/40 font-medium mt-1">{testimonial.name}</p>
                      </div>
                      <span className="text-[9px] text-white/30 font-bold whitespace-nowrap">
                        {new Date(testimonial.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < testimonial.rating ? 'currentColor' : 'none'}
                          className={i < testimonial.rating ? 'text-secondary' : 'text-white/20'}
                        />
                      ))}
                    </div>

                    <p className="text-sm text-white/70 leading-relaxed italic">{testimonial.review}</p>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TestimonialsPage
