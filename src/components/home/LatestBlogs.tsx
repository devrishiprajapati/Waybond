import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, BookOpen } from 'lucide-react'
import { getLatestBlogs, getYouTubeThumbnailUrl } from '../../lib/blogs'

// Simplified, ultra-fast blog card component
const BlogCard = React.memo(({ blog, index }: any) => {
  const formattedDate = useMemo(() => {
    return new Date(blog.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }, [blog.date])
  const imageSrc = getYouTubeThumbnailUrl(blog.youtubeUrl) || blog.image

  return (
    <motion.div
      key={blog.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      viewport={{ once: true }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
    >
      {/* Blog Image - Optimized */}
      {blog.youtubeUrl ? (
        <a
          href={blog.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-48 w-full overflow-hidden bg-gray-200 block"
          title={`Open video for ${blog.title}`}
        >
          <img
            src={imageSrc}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* YouTube Icon — bottom-right corner */}
          <div className="absolute bottom-3 right-3 drop-shadow-lg">
            <svg viewBox="0 0 24 24" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#FF0000" />
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
            </svg>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
              {blog.category}
            </span>
          </div>

          {/* Read Time Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/95 text-gray-900 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-md">
              <BookOpen size={12} />
              <span>{blog.readTime}m</span>
            </div>
          </div>
        </a>
      ) : (
        <Link to={`/blog/${blog.slug}`} className="relative h-48 overflow-hidden bg-gray-200 block">
          <img
            src={imageSrc}
            alt={blog.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
              {blog.category}
            </span>
          </div>

          {/* Read Time Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-white/95 text-gray-900 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-md">
              <BookOpen size={12} />
              <span>{blog.readTime}m</span>
            </div>
          </div>
        </Link>
      )}

      <Link to={`/blog/${blog.slug}`} className="block">
        {/* Content - Simplified */}
        <div className="p-5 cursor-pointer">
          {/* Meta Info - Compact */}
          <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-sans font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-secondary transition-colors duration-300">
            {blog.title}
          </h3>

          {/* Excerpt - Minimal */}
          <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-1">
            {blog.excerpt}
          </p>

          {/* Read More Link */}
          <div className="inline-flex items-center gap-1 text-secondary font-bold group-hover:text-secondary/80 transition-colors text-sm group/link">
            <span>Read</span>
            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
})

BlogCard.displayName = 'BlogCard'

export default function LatestBlogs() {
  const [blogs, setBlogs] = useState(() => getLatestBlogs(3))

  useEffect(() => {
    const refreshBlogs = () => setBlogs(getLatestBlogs(3))
    window.addEventListener('waybond-travel-stories-updated', refreshBlogs)
    window.addEventListener('storage', refreshBlogs)
    return () => {
      window.removeEventListener('waybond-travel-stories-updated', refreshBlogs)
      window.removeEventListener('storage', refreshBlogs)
    }
  }, [])

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12 space-y-3"
        >
          <h2 className="text-2xl md:text-5xl font-bungee font-black text-slate-800 tracking-tighter uppercase italic leading-none">
            Travel <span className="text-primary font-bungee">Stories</span>
          </h2>
        </motion.div>

        {/* Blog Cards - Horizontal Scroll on Mobile, Grid on Desktop */}
        {/* Mobile: Horizontal Scroll */}
        <div className="lg:hidden flex gap-4 overflow-x-auto pb-8 px-6 snap-x snap-mandatory scroll-smooth hide-scrollbar mb-10 -mx-6">
          {blogs.map((blog, index) => (
            <div key={blog.id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-center first:ml-6 last:mr-6">
              <BlogCard blog={blog} index={index} />
            </div>
          ))}
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 mb-10">
          {blogs.map((blog, index) => (
            <BlogCard key={blog.id} blog={blog} index={index} />
          ))}
        </div>

        {/* View All Blogs Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-[#003d6a] text-white px-6 md:px-8 py-3 rounded-full font-black uppercase tracking-wide text-xs md:text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span className="!text-white font-sans font-bold">View All Stories</span>
            <ArrowRight size={16} className='!text-white' />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
