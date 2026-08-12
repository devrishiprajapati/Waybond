import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Calendar, User, BookOpen, ArrowLeft, ArrowRight, Clock, Twitter, Facebook, Linkedin } from 'lucide-react'
import { getBlogBySlug, getAllBlogs, Blog, getYouTubeEmbedUrl } from '../lib/blogs'

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-1.87 1.246-3.045 3.006-3.045 5.411 0 1.361.264 2.679.754 3.91L2.070 19.07a.5.5 0 00.63.63l3.993-1.335a9.861 9.861 0 004.412 1.256h.004c5.159 0 9.427-4.26 9.427-9.487 0-2.524-1.01-4.898-2.845-6.679-1.835-1.78-4.277-2.758-6.844-2.758z"/>
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.205 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163C8.756 0 8.331.012 7.053.07 2.695.272.273 2.69.07 7.052.012 8.330 0 8.757 0 12c0 3.244.012 3.669.07 4.948.202 4.358 2.623 6.78 6.985 6.982 1.278.058 1.704.07 4.945.07 3.242 0 3.668-.012 4.947-.072 4.358-.2 6.78-2.623 6.984-6.986.057-1.278.069-1.703.069-4.947 0-3.242-.012-3.668-.069-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.704-.071-4.948-.071zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110-2.881 1.44 1.44 0 010 2.88z"/>
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const blog = getBlogBySlug(slug || '')
  const allBlogs = getAllBlogs()

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-6"
        >
          <h1 className="text-5xl font-sans font-black text-gray-900 mb-4">Blog Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">The blog you're looking for doesn't exist.</p>
          <Link
            to="/blogs"
            className="inline-flex items-center space-x-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <ArrowLeft size={20} />
            <span>Back to Blogs</span>
          </Link>
        </motion.div>
      </div>
    )
  }

  // Get related blogs (same category, exclude current)
  const relatedBlogs = allBlogs
    .filter(b => b.category === blog.category && b.id !== blog.id)
    .slice(0, 3)

  // Get previous and next blogs
  const currentIndex = allBlogs.findIndex(b => b.id === blog.id)
  const prevBlog = currentIndex > 0 ? allBlogs[currentIndex - 1] : null
  const nextBlog = currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null

  const shareUrl = `${window.location.origin}/blog/${blog.slug}`
  const shareText = `Check out this travel story: ${blog.title}`
  const youtubeEmbedUrl = getYouTubeEmbedUrl(blog.youtubeUrl)

  const handleShare = (platform: string) => {
    let url = ''
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        break
    }
    if (url) window.open(url, '_blank')
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} - WAYBOND Blog</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.image} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="bg-white min-h-screen pt-24">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-secondary hover:text-secondary/80 font-bold transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-12"
        >
          <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x500?text=Travel+Blog'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            
            {/* Category Badge on Image */}
            <div className="absolute top-6 left-6">
              <span className="inline-block bg-secondary text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg">
                {blog.category}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-black text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center space-x-2 text-gray-600 text-xs sm:text-base">
              <User size={18} className="hidden sm:block" />
              <User size={16} className="sm:hidden" />
              <span className="font-semibold">{blog.author}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-xs sm:text-base">
              <Calendar size={18} className="hidden sm:block" />
              <Calendar size={16} className="sm:hidden" />
              <span className="font-semibold">
                {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 text-xs sm:text-base">
              <Clock size={18} className="hidden sm:block" />
              <Clock size={16} className="sm:hidden" />
              <span className="font-semibold">{blog.readTime} min read</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mt-6 mb-8">
            {blog.tags.map((tag, idx) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <span className="text-gray-600 font-semibold text-xs sm:text-base">Share:</span>
            <button
              onClick={() => handleShare('twitter')}
              className="p-2 sm:p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-colors shadow-lg hover:shadow-xl"
              title="Share on Twitter"
            >
              <Twitter size={18} className="hidden sm:block" />
              <Twitter size={16} className="sm:hidden" />
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="p-2 sm:p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              title="Share on Facebook"
            >
              <Facebook size={18} className="hidden sm:block" />
              <Facebook size={16} className="sm:hidden" />
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="p-2 sm:p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 transition-colors shadow-lg hover:shadow-xl"
              title="Share on LinkedIn"
            >
              <LinkedInIcon />
            </button>
            <button
              onClick={() => handleShare('whatsapp')}
              className="p-2 sm:p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl"
              title="Share on WhatsApp"
            >
              <WhatsAppIcon />
            </button>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-20"
        >
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
              {blog.content}
            </div>
          </div>
        </motion.div>

        {youtubeEmbedUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-20"
          >
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
              <iframe
                src={youtubeEmbedUrl}
                title={`${blog.title} video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}

        {/* Author Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-20"
        >
          <div className="bg-gradient-to-r from-secondary/10 to-blue-50 rounded-3xl p-6 sm:p-8 border-2 border-secondary/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-secondary to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <User size={40} className="sm:w-[48px] sm:h-[48px] text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-sans font-black text-gray-900 mb-2">
                  About {blog.author}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {blog.author} is a passionate travel enthusiast and member of the WAYBOND community. They love sharing travel stories and helping others discover amazing destinations around the world.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation - Previous and Next */}
        {(prevBlog || nextBlog) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {prevBlog ? (
                <Link
                  to={`/blog/${prevBlog.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-secondary hover:shadow-xl transition-all duration-500 p-4 sm:p-6 flex flex-col"
                >
                  <div className="flex items-center space-x-2 text-gray-600 mb-3 font-semibold text-xs sm:text-sm">
                    <ArrowLeft size={16} />
                    <span>Previous Article</span>
                  </div>
                  <h4 className="text-base sm:text-lg font-sans font-black text-gray-900 group-hover:text-secondary transition-colors line-clamp-2 flex-grow">
                    {prevBlog.title}
                  </h4>
                </Link>
              ) : (
                <div></div>
              )}
              {nextBlog ? (
                <Link
                  to={`/blog/${nextBlog.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-secondary hover:shadow-xl transition-all duration-500 p-4 sm:p-6 flex flex-col text-right md:text-left"
                >
                  <div className="flex items-center justify-end md:justify-start space-x-2 text-gray-600 mb-3 font-semibold text-xs sm:text-sm">
                    <span>Next Article</span>
                    <ArrowRight size={16} />
                  </div>
                  <h4 className="text-base sm:text-lg font-sans font-black text-gray-900 group-hover:text-secondary transition-colors line-clamp-2 flex-grow">
                    {nextBlog.title}
                  </h4>
                </Link>
              ) : (
                <div></div>
              )}
            </div>
          </motion.div>
        )}

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-gradient-to-b from-white to-blue-50 py-16 sm:py-20"
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
              <h2 className="text-3xl sm:text-4xl font-sans font-black text-gray-900 mb-10 sm:mb-12 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedBlogs.map((relatedBlog, idx) => (
                  <motion.div
                    key={relatedBlog.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1, duration: 0.6 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-secondary"
                  >
                    <Link to={`/blog/${relatedBlog.slug}`} className="block">
                      <div className="relative h-48 overflow-hidden bg-gray-200">
                        <img
                          src={relatedBlog.image}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <span className="inline-block bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                          {relatedBlog.category}
                        </span>
                        <h3 className="text-lg font-sans font-black text-gray-900 group-hover:text-secondary transition-colors line-clamp-2 mb-3">
                          {relatedBlog.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {relatedBlog.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{relatedBlog.readTime} min read</span>
                          <ArrowRight size={16} className="text-secondary" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-16 sm:py-20"
        >
          <div className="bg-gradient-to-r from-secondary to-blue-500 rounded-3xl p-6 sm:p-12 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-black text-white mb-4">
              Ready for Your Next Adventure?
            </h2>
            <p className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
              Explore amazing destinations and curated travel experiences with WAYBOND community.
            </p>
            <Link
              to="/discover"
              className="inline-flex items-center justify-center sm:justify-start space-x-2 bg-white text-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black uppercase tracking-widest text-xs sm:text-sm hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <span>Explore Trips</span>
              <ArrowRight size={18} className="hidden sm:block" />
              <ArrowRight size={16} className="sm:hidden" />
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
