import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Menu, Phone, User, Heart, X, Plane } from 'lucide-react'
import { getWhatsAppLink } from '../lib/data'
import { haptics } from '../lib/haptics'
import { isLoggedIn } from '../lib/auth'
import { useWishlist } from '../lib/wishlist'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const { count } = useWishlist()

  /** Auth-gate: navigate to /discover if logged in, else go to login with redirect back */
  const handleBookNow = (redirect = '/discover') => {
    haptics.medium()
    if (isLoggedIn()) {
      navigate(redirect)
    } else {
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Glassmorphism trigger
      setScrolled(currentScrollY > 60)

      // Navbar remains stable and visible always

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  const navLinks = [
    { name: 'Explore Trips', path: '/discover' },
    { name: 'Travel Stories', path: '/blogs' },
    { name: 'Gallery', path: '/community' },
    { name: 'About Us', path: '/about' }
  ]

  return (
    <>
      <nav className={`fixed left-0 right-0 z-50 transition-all duration-700 transform flex justify-center w-full px-0 pt-0 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
        <div className={`navbar-glass mobile-navbar-surface w-full mx-auto rounded-none liquid-glass shadow-2xl transition-all duration-500 relative group/nav ${scrolled ? 'py-1.5 scale-100' : 'py-2.5 md:py-3'}`}>

          <div className="flex justify-between items-center h-10 relative z-10 px-6 md:px-12 lg:px-20">
            <Link to="/" onClick={() => haptics.light()} className="flex items-center space-x-2 group">
              <img 
                src="/assets/waybond-logo.svg" 
                alt="Waybond Logo" 
                className="h-8 md:h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center lg:space-x-8 xl:space-x-12">
              <div className="flex items-center lg:space-x-6 xl:space-x-12">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => haptics.light()}
                    className="transition-all duration-500 font-bold text-[9px] uppercase tracking-[0.25em] text-white hover:text-secondary relative group drop-shadow-md"
                  >
                    {link.name}
                    <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-secondary transition-all duration-500 group-hover:w-full"></span>
                  </Link>
                ))}
              </div>

              <div className="h-4 w-px bg-white/20"></div>

              <div className="flex items-center lg:space-x-4 xl:space-x-6">
                <Link to={isLoggedIn() ? '/dashboard' : '/login'} onClick={() => haptics.light()} className="transition-colors duration-500 text-white hover:text-secondary">
                  <User size={18} />
                </Link>
                <Link to="/wishlist" onClick={() => haptics.light()} className="transition-colors duration-500 text-white hover:text-secondary relative">
                  <Heart size={18} />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-lg">
                      {count > 9 ? '9+' : count}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => handleBookNow('/discover')}
                  className="bg-secondary text-white px-4 md:px-5 py-2 rounded-full font-black text-[7px] md:text-[8px] uppercase tracking-widest transition-all duration-300 shadow-xl shadow-secondary/20 transform hover:scale-105 active:scale-95 whitespace-nowrap flex items-center justify-center"
                >
                  Book Now
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => {
                  haptics.light();
                  setIsOpen(true);
                }}
                className="mobile-menu-icon p-2 transition-colors duration-500 text-white"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Mobile Hub Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/20"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-45%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-45%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-1/2 left-1/2 w-[90%] max-w-[340px] liquid-glass shadow-2xl p-8 rounded-[3rem] flex flex-col max-h-[90vh] overflow-y-auto isolate"
            >
              <div className="flex justify-between items-center mb-8 relative z-20 sticky top-0 bg-white rounded-2xl px-3 py-2">
                <Link to="/" onClick={() => haptics.light()} className="flex items-center" aria-label="Waybond home">
                  <img 
                    src="/assets/waybond-logo.svg" 
                    alt="Waybond Logo" 
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  onClick={() => {
                    haptics.light();
                    setIsOpen(false);
                  }}
                  className="p-2 liquid-glass rounded-xl text-white hover:bg-white/10 transition-colors border border-white/10"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col space-y-6 flex-grow relative z-10 pb-4">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => haptics.light()}
                      className="text-xl font-sans font-black text-white hover:text-secondary transition-colors uppercase italic drop-shadow-lg font-bungee"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="h-px bg-white/20 w-full my-4"></div>

                <div className="flex items-center space-x-6">
                  <Link to="/dashboard" onClick={() => haptics.light()} className="text-white p-3 liquid-glass border border-white/20 rounded-2xl hover:bg-white/10 transition-all">
                    <User size={22} />
                  </Link>
                  <Link to="/wishlist" onClick={() => haptics.light()} className="text-white p-3 liquid-glass border border-white/20 rounded-2xl hover:bg-white/10 transition-all relative">
                    <Heart size={22} />
                    {count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-secondary text-white text-[8px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                        {count > 9 ? '9+' : count}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              <button
                onClick={() => { setIsOpen(false); handleBookNow('/discover') }}
                className="w-full bg-secondary text-white py-4 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-secondary/30 active:scale-95 transition-all outline-none relative z-10 mt-auto font-bungee"
              >
                Book Now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
