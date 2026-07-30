import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import Home from './pages/Home'
import Discover from './pages/Discover'
import HimachalPage from './pages/HimachalPage'
import BaliPage from './pages/BaliPage'
import BackupHome from './pages/BackupHome'
import TripDetails from './pages/TripDetails'
import { About, Community, Wishlist } from './pages/StaticPages'
import UserDashboard from './pages/UserDashboard'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import EditTrip from './pages/admin/EditTrip'
import EditHero from './pages/admin/EditHero'
import AdminLogin from './pages/admin/Login'
import FAQs from './pages/FAQs'
import CancellationRefunds from './pages/CancellationRefunds'
import SafetyGuidelines from './pages/SafetyGuidelines'
import Testimonials from './pages/Testimonials'
import Blogs from './pages/Blogs'
import BlogDetail from './pages/BlogDetail'

function App() {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  // Scroll to top on initial page load/reload
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  return (
    <div className="light-theme flex flex-col min-h-screen selection:bg-secondary/30 w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/himachal" element={<HimachalPage />} />
            <Route path="/bali" element={<BaliPage />} />
            <Route path="/backup" element={<BackupHome />} />
            <Route path="/about" element={<About />} />
            <Route path="/community" element={<Community />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
            <Route path="/safety-guidelines" element={<SafetyGuidelines />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/trip/:id" element={<TripDetails />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/hero" element={<EditHero />} />
            <Route path="/admin/edit/:id" element={<EditTrip />} />
            <Route path="/admin/new" element={<EditTrip />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}

export default App
