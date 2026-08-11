export default function ContactSocialSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* WhatsApp Contact */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 p-6 sm:p-8 md:p-12 bg-white">
              <div className="flex-shrink-0">
                <svg className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" viewBox="0 0 48 48" fill="none">
                  <path d="M34.6 13.4C32.2 11 29 9.6 25.5 9.6C18.3 9.6 12.4 15.5 12.4 22.7C12.4 25 13 27.2 14.1 29.2L12.3 35.7L18.9 33.9C20.8 34.9 22.9 35.4 25 35.4C32.2 35.4 38.1 29.5 38.1 22.3C38.1 18.8 36.7 15.6 34.6 13.4ZM25.5 33.1C23.6 33.1 21.7 32.6 20.1 31.7L19.7 31.5L15.9 32.5L16.9 28.8L16.7 28.4C15.7 26.7 15.2 24.7 15.2 22.7C15.2 17 19.8 12.4 25.5 12.4C28.2 12.4 30.8 13.5 32.7 15.4C34.6 17.3 35.7 19.9 35.7 22.6C35.8 28.4 31.2 33.1 25.5 33.1ZM31.2 25.3C30.9 25.2 29.4 24.4 29.1 24.3C28.8 24.2 28.6 24.2 28.4 24.5C28.2 24.8 27.6 25.5 27.4 25.7C27.2 25.9 27.1 26 26.8 25.8C26.5 25.7 25.5 25.4 24.4 24.4C23.5 23.6 22.9 22.7 22.7 22.4C22.6 22.1 22.7 21.9 22.9 21.8C23 21.6 23.2 21.4 23.3 21.2C23.5 21 23.5 20.9 23.6 20.7C23.7 20.5 23.6 20.3 23.6 20.2C23.5 20.1 22.9 18.6 22.7 18C22.4 17.4 22.2 17.5 22 17.4C21.8 17.4 21.6 17.4 21.4 17.4C21.2 17.4 20.9 17.4 20.6 17.7C20.3 18 19.5 18.8 19.5 20.3C19.5 21.8 20.6 23.3 20.8 23.5C20.9 23.7 22.9 26.8 26 28.1C26.7 28.4 27.3 28.6 27.8 28.7C28.5 28.9 29.1 28.9 29.6 28.8C30.2 28.7 31.4 28 31.6 27.3C31.9 26.5 31.9 25.9 31.8 25.8C31.7 25.6 31.5 25.5 31.2 25.3Z" fill="#25D366"/>
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 font-semibold mb-1 sm:mb-2">Don't wait any longer, Contact us!</p>
                <a 
                  href="https://wa.me/919099599331" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 hover:text-[#25D366] transition-colors block"
                >
                  90 99 599 331
                </a>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-5 p-6 sm:p-8 md:p-12 bg-gradient-to-br from-gray-50 to-gray-100">
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 font-semibold text-center px-2">Be part of our Social Media Journey!</p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:gap-4">
                {/* Instagram */}
                <a 
                  href="https://www.instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg hover:shadow-xl"
                  aria-label="Follow us on Instagram"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a 
                  href="https://www.youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-red-600 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg hover:shadow-xl"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9" fill="white" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a 
                  href="https://www.facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg hover:shadow-xl"
                  aria-label="Like us on Facebook"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="white" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Twitter/X */}
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg hover:shadow-xl"
                  aria-label="Follow us on X (Twitter)"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" fill="white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-blue-700 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg hover:shadow-xl"
                  aria-label="Connect with us on LinkedIn"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" fill="white" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
