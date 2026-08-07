import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './src/components/Navbar'
import Footer from './src/components/Footer'
import WhatsAppButton from './src/components/WhatsAppButton'
import Home from './src/pages/Home'
import Discover from './src/pages/Discover'
import HimachalPage from './src/pages/HimachalPage'
import BaliPage from './src/pages/BaliPage'
import BackupHome from './src/pages/BackupHome'
import { About, Community, Wishlist } from './src/pages/StaticPages'

// Placeholder for other routes
const TripDetails = () => <div className="min-h-screen pt-40 px-8 flex items-center justify-center bg-gray-50 uppercase font-black text-6xl tracking-tighter">Trip Details Layout Coming Soon...</div>
const Dashboard = () => <div className="min-h-screen pt-40 px-8 flex items-center justify-center bg-gray-100 uppercase font-black text-6xl tracking-tighter">User Dashboard Hub Coming Soon...</div>

function App() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-secondary/30 w-full overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/himachal" element={<HimachalPage />} />
          <Route path="/bali" element={<BaliPage />} />
          <Route path="/backup" element={<BackupHome />} />
          <Route path="/about" element={<About />} />
          <Route path="/community" element={<Community />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/trip/:id" element={<TripDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App