import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Search, Calendar, User, BookOpen, ArrowRight, X } from 'lucide-react'
import { getAllBlogs, Blog, getYouTubeThumbnailUrl } from '../lib/blogs'

export default function Blogs() {
  const allBlogs = getAllBlogs()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Get unique categories and tags
  const categories = Array.from(new Set(allBlogs.map(blog => blog.category)))
  const allTags = Array.from(new Set(allBlogs.flatMap(blog => blog.tags)))

  // Filter blogs based on search, category, and tags
  const filteredBlogs = useMemo(() => {
    return allBlogs.filter(blog => {
      const matchesSearch = searchQuery === '' ||
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === null || blog.category === selectedCategory
      const matchesTag = selectedTag === null || blog.tags.includes(selectedTag)

      return matchesSearch && matchesCategory && matchesTag
    })
  }, [searchQuery, selectedCategory, selectedTag])

  return (
    <>
      <Helmet>
        <title>Travel Blog - WAYBOND | Travel Stories & Tips</title>
        <meta name="description" content="Discover travel stories, tips, and guides from the WAYBOND community. Read the latest travel inspiration and advice." />
        <meta property="og:title" content="Travel Blog - WAYBOND" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="bg-white min-h-screen pt-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-secondary/10 to-blue-50 py-16 md:py-20 border-b-2 border-secondary/10"
        >
          <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
            <h1 className="text-2xl md:text-4xl font-sans font-black text-gray-900 uppercase tracking-tight mb-4 font-bungee">
              Travel <span className='font-bungee text-secondary'>Stories</span>
            </h1>
            <p className="text-xl text-xs text-gray-600 max-w-3xl font-medium">
              Explore inspiring travel stories, expert tips, and adventure guides from our community of travelers and local experts.
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-32 space-y-8">
                {/* Search Box */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                  <label className="block text-sm font-black text-gray-900 uppercase tracking-wide mb-3">
                    Search Blogs
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search stories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-secondary transition-colors text-gray-900 placeholder-gray-400"
                    />
                    <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
                  </div>
                </div>

                {/* Categories Filter */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                  <label className="block text-sm font-black text-gray-900 uppercase tracking-wide mb-4">
                    Categories
                  </label>
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selectedCategory === null
                          ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selectedCategory === category
                            ? 'bg-secondary text-white shadow-lg shadow-secondary/30'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg">
                  <label className="block text-sm font-black text-gray-900 uppercase tracking-wide mb-4">
                    Popular Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${selectedTag === tag
                            ? 'bg-secondary text-white shadow-lg'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Filters */}
                {(searchQuery || selectedCategory || selectedTag) && (
                  <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-gray-900 uppercase">Active Filters</span>
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedCategory(null)
                          setSelectedTag(null)
                        }}
                        className="text-xs text-secondary hover:text-secondary/80 font-bold"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <span className="inline-flex items-center space-x-2 bg-secondary text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                          <span>Search: {searchQuery}</span>
                          <button onClick={() => setSearchQuery('')}>
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {selectedCategory && (
                        <span className="inline-flex items-center space-x-2 bg-secondary text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                          <span>{selectedCategory}</span>
                          <button onClick={() => setSelectedCategory(null)}>
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {selectedTag && (
                        <span className="inline-flex items-center space-x-2 bg-secondary text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                          <span>#{selectedTag}</span>
                          <button onClick={() => setSelectedTag(null)}>
                            <X size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Blog List */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="lg:col-span-3"
            >
              {filteredBlogs.length > 0 ? (
                <div className="space-y-6">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Showing {filteredBlogs.length} of {allBlogs.length} articles
                  </p>

                  <AnimatePresence mode="popLayout">
                    {filteredBlogs.map((blog, index) => {
                      const imageSrc = getYouTubeThumbnailUrl(blog.youtubeUrl) || blog.image
                      return (
                        <motion.div
                          key={blog.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-secondary/30 flex flex-col md:flex-row"
                        >
<<<<<<< HEAD
                        {/* Blog Image */}
                        {blog.youtubeUrl ? (
                          <a
                            href={blog.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="md:w-80 h-64 md:h-auto overflow-hidden flex-shrink-0 bg-gray-200 relative block"
                            title={`Open video for ${blog.title}`}
                          >
                            <img                                          
                              src={imageSrc}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </a>
                        ) : (
                          <div className="md:w-80 h-64 md:h-auto overflow-hidden flex-shrink-0 bg-gray-200 relative">
                            <img
                              src={imageSrc}
                              alt={blog.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          </div>
                        )}

                        {/* Blog Content */}
                        <div className="flex-grow p-8 flex flex-col justify-between">
                          <div>
                            {/* Category & Read Time */}
                            <div className="flex items-center justify-between mb-4">
                              <span className="inline-block bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                {blog.category}
                              </span>
                              <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                <BookOpen size={16} />
                                <span>{blog.readTime} min read</span>
                              </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl md:text-3xl font-sans font-black text-gray-900 mb-3 group-hover:text-secondary transition-colors duration-300">
                              {blog.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                              {blog.excerpt}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {blog.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar size={16} />
                                <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User size={16} />
                                <span>{blog.author}</span>
                              </div>
                            </div>
                            <Link
                              to={`/blog/${blog.slug}`}
                              className="inline-flex items-center space-x-2 text-secondary font-bold hover:text-secondary/80 transition-colors group/link"
=======
                          {/* Blog Image */}
                          {blog.youtubeUrl ? (
                            <a
                              href={blog.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="md:w-80 h-64 md:h-auto overflow-hidden flex-shrink-0 bg-gray-200 relative block"
                              title={`Open video for ${blog.title}`}
>>>>>>> 6ca6e66c686c6779e9dc9b0568d3819d401ea8fe
                            >
                              <img
                                src={imageSrc}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </a>
                          ) : (
                            <div className="md:w-80 h-64 md:h-auto overflow-hidden flex-shrink-0 bg-gray-200 relative">
                              <img
                                src={imageSrc}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                          )}

                          {/* Blog Content */}
                          <div className="flex-grow p-8 flex flex-col justify-between">
                            <div>
                              {/* Category & Read Time */}
                              <div className="flex items-center justify-between mb-4">
                                <span className="inline-block bg-secondary text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                                  {blog.category}
                                </span>
                                <div className="flex items-center space-x-1 text-gray-500 text-sm">
                                  <BookOpen size={16} />
                                  <span>{blog.readTime} min read</span>
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="text-2xl md:text-3xl font-sans font-black text-gray-900 mb-3 group-hover:text-secondary transition-colors duration-300">
                                {blog.title}
                              </h3>

                              {/* Excerpt */}
                              <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                                {blog.excerpt}
                              </p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {blog.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar size={16} />
                                  <span>{new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <User size={16} />
                                  <span>{blog.author}</span>
                                </div>
                              </div>
                              <Link
                                to={`/blog/${blog.slug}`}
                                className="inline-flex items-center space-x-2 text-secondary font-bold hover:text-secondary/80 transition-colors group/link"
                              >
                                <span>Read</span>
                                <ArrowRight size={18} className="group-hover/link:translate-x-2 transition-transform duration-300" />
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-12 text-center border-2 border-dashed border-gray-300"
                >
                  <BookOpen size={64} className="mx-auto text-gray-400 mb-4 opacity-50" />
                  <h3 className="text-2xl font-black text-gray-900 mb-2">No blogs found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search query to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory(null)
                      setSelectedTag(null)
                    }}
                    className="inline-flex items-center space-x-2 bg-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all text-sm sm:text-base"
                  >
                    <span>Clear Filters</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
