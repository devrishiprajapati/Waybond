import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, User, BookOpen } from 'lucide-react'
import { getLatestBlogs } from '../../lib/blogs'

export default function LatestBlogs() {
  const blogs = getLatestBlogs(3)

  return (
    <section className="py-24 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-black text-gray-900 uppercase tracking-tight mb-4">
            Travel Stories & Tips
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Discover travel inspiration, tips, and stories from our community of adventurers and travel enthusiasts.
          </p>
        </motion.div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200"
            >
              {/* Blog Image */}
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    {blog.category}
                  </span>
                </div>

                {/* Read Time Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                    <BookOpen size={14} />
                    <span>{blog.readTime} min</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Meta Info */}
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User size={16} />
                    <span>{blog.author}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-display font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-secondary transition-colors duration-300">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {blog.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                  {blog.tags.length > 2 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{blog.tags.length - 2}
                    </span>
                  )}
                </div>

                {/* Read More Link */}
                <Link
                  to={`/blog/${blog.slug}`}
                  className="inline-flex items-center space-x-2 text-secondary font-bold hover:text-secondary/80 transition-colors group/link"
                >
                  <span>Read Full Article</span>
                  <ArrowRight size={18} className="group-hover/link:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Blogs Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Link
            to="/blogs"
            className="inline-flex items-center justify-center sm:justify-start space-x-2 bg-gradient-to-r from-secondary to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black uppercase tracking-widest text-xs sm:text-sm shadow-xl shadow-secondary/30 hover:shadow-2xl hover:shadow-secondary/40 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <span>View All Travel Stories</span>
            <ArrowRight size={18} className="hidden sm:block" />
            <ArrowRight size={16} className="sm:hidden" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
