import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Image as ImageIcon } from 'lucide-react'
import { CommunityGallery as CommunityGalleryData, getCommunityGallery, loadCommunityGalleries } from '../lib/communityGalleries'

export default function CommunityGallery() {
  const { destination } = useParams()
  const [gallery, setGallery] = useState<CommunityGalleryData | undefined>(() => getCommunityGallery(destination))

  useEffect(() => {
    loadCommunityGalleries().then((galleries) => setGallery(galleries.find((item) => item.slug === destination)))
  }, [destination])

  if (!gallery) {
    return (
      <div className="min-h-screen bg-white text-white pt-40 px-6 text-center">
        <ImageIcon className="mx-auto text-white/20 mb-5" size={44} />
        <h1 className="text-3xl font-bungee font-black uppercase italic">Gallery not found</h1>
        <Link to="/community" className="inline-flex mt-8 text-secondary font-black text-xs uppercase tracking-widest">Back to community</Link>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-white text-white pt-36 pb-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-[1920px] mx-auto">
        <Link to="/community" className="inline-flex items-center gap-2 text-secondary font-black text-[10px] uppercase tracking-[0.24em] mb-8"><ArrowLeft size={16} /> Community</Link>
        <div className="mb-14">
          <p className="text-secondary font-black uppercase tracking-[0.35em] text-[10px] mb-4">Community gallery</p>
          <h1 className="text-5xl md:text-7xl font-bungee font-black uppercase italic tracking-tighter liquid-text">{gallery.destination}</h1>
          <p className="text-white/50 font-medium italic mt-4">{gallery.label}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {gallery.images.map((image, index) => (
            <motion.figure key={image.src} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="relative h-[300px] sm:h-[380px] lg:h-[460px] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
              <img src={image.src} alt={image.alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
              <figcaption className="absolute left-8 bottom-7 text-[9px] uppercase font-black tracking-[0.25em] text-white/80">{gallery.destination}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
