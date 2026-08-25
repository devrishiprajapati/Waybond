import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { CheckCircle2, ShieldCheck, MapPin, Star, UserCheck, MessageCircle, Heart, Users, Share2, Compass, Calendar, CircleHelp, Download, Trash2, X, Mail, Phone, Linkedin, Twitter, Users2 } from 'lucide-react'
import { communityGalleries, loadCommunityGalleries } from '../lib/communityGalleries'
import { useWishlist } from '../lib/wishlist'
import { haptics } from '../lib/haptics'
import { getTripWhatsAppLink } from '../lib/trips'
import { createSlug } from '../lib/dataService'

type TeamMember = {
  id: number | string
  name: string
  designation: string
  shortBio: string
  fullBio: string
  image: string
  email?: string
  phone?: string
  linkedin?: string
  twitter?: string
  isActive: boolean
  position: number
}

const PageLayout = ({ children, title, subtitle, seoTitle, seoDescription, className = "" }: { children: React.ReactNode, title: React.ReactNode, subtitle?: string, seoTitle?: string, seoDescription?: string, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, paddingTop: 75 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`min-h-screen pt-40 pb-24 bg-white text-white ${className}`}
  >
    {seoTitle && (
      <Helmet>
        <title>{seoTitle}</title>
        {seoDescription && <meta name="description" content={seoDescription} />}
      </Helmet>
    )}
    <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
      {children}
    </div>
  </motion.div>
)

// ─── Team Member Modal ──────────────────────────────────────────────────────
const TeamMemberModal = ({ member, onClose }: { member: TeamMember; onClose: () => void }) => (
  <AnimatePresence>
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        key="card"
        initial={{ scale: 0.9, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="w-full max-w-xl liquid-glass-dark border border-white/15 rounded-[2.5rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-72 w-full bg-white/5">
          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/40 border border-white/20 backdrop-blur-sm text-white hover:bg-white/20 flex items-center justify-center transition-all"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-6 left-6">
            <p className="text-3xl font-bungee font-black text-white italic tracking-tighter">{member.name}</p>
            <p className="text-[10px] text-secondary font-black uppercase tracking-[0.25em] mt-1">{member.designation}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-7 space-y-5">
          {member.fullBio && (
            <p className="text-white/70 leading-relaxed text-sm italic">{member.fullBio}</p>
          )}
          {!member.fullBio && member.shortBio && (
            <p className="text-white/70 leading-relaxed text-sm italic">{member.shortBio}</p>
          )}

          {/* Contact / Social Links */}
          <div className="flex flex-wrap gap-3 pt-1">
            {member.email && (
              <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-secondary/40 text-white/60 hover:text-secondary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                <Mail size={13} />{member.email}
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-secondary/40 text-white/60 hover:text-secondary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                <Phone size={13} />{member.phone}
              </a>
            )}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-secondary/40 text-white/60 hover:text-secondary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                <Linkedin size={13} />LinkedIn
              </a>
            )}
            {member.twitter && (
              <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:border-secondary/40 text-white/60 hover:text-secondary px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">
                <Twitter size={13} />Twitter / X
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

// ─── Team Members Section ────────────────────────────────────────────────────
const TeamMembersSection = () => {
  const [members, setMembers] = React.useState<TeamMember[]>([])
  const [selected, setSelected] = React.useState<TeamMember | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetch('/api/team-members')
      .then(r => r.ok ? r.json() : [])
      .then((data: TeamMember[]) => {
        setMembers(data.filter(m => m.isActive))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || members.length === 0) return null

  // First member (position 0) is pinned/featured
  const pinnedMember = members.find(m => m.position === 0) || members[0]
  const otherMembers = members.filter(m => m.id !== pinnedMember?.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className=""
    >
      {/* Section Heading */}
      <div className="mb-14 text-center">
        {/* <div className="liquid-glass inline-block px-5 py-2 rounded-full border border-white/10 shadow-lg mb-6">
          <span className="text-secondary font-black uppercase tracking-[0.4em] text-[9px]">The People Behind The Adventure</span>
        </div> */}
        <h2 className="text-3xl md:text-5xl lg:text-[5rem] font-bungee font-black text-white tracking-tighter uppercase leading-[0.9] italic liquid-text">
          Meet The <span className="text-primary px-2">Team</span>
        </h2>
        <p className="text-white/40 italic mt-6 text-sm font-medium max-w-xl mx-auto leading-relaxed">
          The passionate explorers and visionaries who make every WayBond journey unforgettable.
        </p>
      </div>

      {/* Pinned/Featured Member - Full Details */}
      {pinnedMember && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="liquid-glass-dark border-2 border-secondary/30 rounded-[3rem] overflow-hidden mb-16 shadow-[0_20px_60px_rgba(100,149,237,0.3)] relative"
        >
          {/* Pinned Badge */}
          <div className="absolute top-6 right-6 z-10 bg-secondary text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-xl border-2 border-white/30 flex items-center gap-2">
            <Star size={14} fill="currentColor" />
            Featured Leader
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-96 lg:h-auto lg:min-h-[600px] overflow-hidden bg-white/5">
              <img
                src={pinnedMember.image}
                alt={pinnedMember.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12 lg:p-16 space-y-8 flex flex-col justify-center">
              {/* Name & Designation */}
              <div className="space-y-4">
                <h3 className="text-4xl md:text-5xl lg:text-6xl font-bungee font-black text-white italic tracking-tighter liquid-text leading-none">
                  {pinnedMember.name}
                </h3>
                <p className="text-secondary font-black uppercase tracking-[0.3em] text-xs md:text-sm">
                  {pinnedMember.designation}
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-4">
                {pinnedMember.fullBio && (
                  <p className="text-white/80 leading-relaxed text-base md:text-lg font-medium italic">
                    {pinnedMember.fullBio}
                  </p>
                )}
                {!pinnedMember.fullBio && pinnedMember.shortBio && (
                  <p className="text-white/80 leading-relaxed text-base md:text-lg font-medium italic">
                    {pinnedMember.shortBio}
                  </p>
                )}
              </div>

              {/* Contact & Social Links */}
              <div className="flex flex-wrap gap-3 pt-4">
                {pinnedMember.email && (
                  <a
                    href={`mailto:${pinnedMember.email}`}
                    className="inline-flex items-center gap-2 bg-white/5 border-2 border-white/20 hover:border-secondary/60 hover:bg-secondary/10 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Mail size={16} className="text-secondary" />
                    {pinnedMember.email}
                  </a>
                )}
                {pinnedMember.phone && (
                  <a
                    href={`tel:${pinnedMember.phone}`}
                    className="inline-flex items-center gap-2 bg-white/5 border-2 border-white/20 hover:border-secondary/60 hover:bg-secondary/10 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Phone size={16} className="text-secondary" />
                    {pinnedMember.phone}
                  </a>
                )}
                {pinnedMember.linkedin && (
                  <a
                    href={pinnedMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 border-2 border-white/20 hover:border-secondary/60 hover:bg-secondary/10 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Linkedin size={16} className="text-secondary" />
                    LinkedIn
                  </a>
                )}
                {pinnedMember.twitter && (
                  <a
                    href={pinnedMember.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/5 border-2 border-white/20 hover:border-secondary/60 hover:bg-secondary/10 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    <Twitter size={16} className="text-secondary" />
                    Twitter / X
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Other Team Members - Cards Grid */}
      {otherMembers.length > 0 && (
        <>
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-4xl font-bungee font-black text-white tracking-tighter uppercase italic">
              Our <span className="text-secondary">Team</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {otherMembers.map((member, i) => (
              <motion.button
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -8 }}
                onClick={() => setSelected(member)}
                className="group text-left liquid-glass-dark border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-secondary/30 transition-all shadow-xl w-full"
              >
                {/* Image */}
                <div className="relative h-64 w-full overflow-hidden bg-white/5">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
                  />
                </div>
                {/* Info */}
                <div className="p-6 space-y-2">
                  <p className="text-xl font-bungee font-black text-white uppercase italic tracking-tight group-hover:text-secondary transition-colors">{member.name}</p>
                  <p className="text-[9px] text-secondary font-black uppercase tracking-[0.25em]">{member.designation}</p>
                  <p className="text-white/45 text-xs leading-relaxed line-clamp-2 mt-1">{member.shortBio}</p>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-secondary/60 mt-2 flex items-center gap-1">
                    <Users2 size={10} /> View Profile
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      {selected && <TeamMemberModal member={selected} onClose={() => setSelected(null)} />}
    </motion.div>
  )
}

// ─── About Page ──────────────────────────────────────────────────────────────

const About = () => (
  <PageLayout
    seoTitle="About WAYBOND — Ahmedabad's Premier Travel Community"
    seoDescription="Learn about Way Bond's mission to make travel meaningful, accessible, and community-driven for Ahmedabad."
    title=''
  >
    <TeamMembersSection />
  </PageLayout>
)

const Community = () => {
  const [galleries, setGalleries] = React.useState(communityGalleries)
  const [activeImageIndex, setActiveImageIndex] = React.useState<{ [key: string]: number }>({})

  React.useEffect(() => {
    loadCommunityGalleries().then(setGalleries)
  }, [])

  // Auto-slide images for each gallery
  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => {
        const updated = { ...prev }
        galleries.forEach((gallery) => {
          const currentIndex = prev[gallery.destination] || 0
          const nextIndex = (currentIndex + 1) % Math.min(gallery.images.length, 4) // Cycle through first 4 images
          updated[gallery.destination] = nextIndex
        })
        return updated
      })
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [galleries])

  return (
    <PageLayout
      // seoTitle="Community & Socials — Join the WAYBOND Tribe"
      // seoDescription="Connect with 45K+ fellow travelers. Share stories, find expedition partners, and access local intel."
      title=""
    // subtitle="The digital campfire for our global tribe. Connect with fellow explorers, share road-side epiphanies, and find your next expedition partner."
    >
      {/* Moments / Group Images Section */}
      <div className="mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-4xl font-sans font-black uppercase italic tracking-tighter text-white font-bungee">Moments <span className="text-primary font-bungee">Captured</span></h2>
          <p className="text-white/40 italic mt-4 text-sm font-medium tracking-wide">Real smiles, real connections.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {galleries.map((gallery, index) => {
            const currentImageIndex = activeImageIndex[gallery.destination] || 0
            const imagesToShow = gallery.images.slice(0, 4) // Show only first 4 images

            return (
              <motion.div
                key={gallery.destination}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden group keep-light-text shadow-[0_15px_40px_rgba(0,0,0,0.5)] aspect-square w-full border border-white/10"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={`${gallery.destination}-${currentImageIndex}`}
                    src={imagesToShow[currentImageIndex].src}
                    alt={`${gallery.destination} travel memories`}
                    loading="lazy"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.7, ease: 'easeInOut' }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                <Link to={`/community/${gallery.slug}`} aria-label={`View ${gallery.destination} gallery`} className="absolute inset-0 z-20" />
                <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 z-20">
                  <p className="text-2xl md:text-3xl font-sans font-black text-white italic tracking-tighter">{gallery.destination}</p>
                  <p className="text-[9px] md:text-[10px] text-white uppercase font-black tracking-[0.25em] md:tracking-[0.3em] mt-2">{gallery.label}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Community Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
        {[
          { title: "Tribe Chat", icon: MessageCircle, color: "bg-blue-500/10", desc: "Instant connectivity with travelers on your upcoming voyage." },
          { title: "Memory Share", icon: Share2, color: "bg-blue-500/10", desc: "A cinematic gallery of stories told through raw adventurer lenses." },
          { title: "Local Intel", icon: MapPin, color: "bg-teal-500/10", desc: "Crowdsourced secret spots and authentic local experiences." }
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -10 }}
            className="liquid-glass-dark p-10 rounded-[3.5rem] border border-white/10 flex flex-col items-center justify-center text-center space-y-8 h-[450px] group overflow-hidden relative shadow-2xl hover:border-secondary/30"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full"></div>
            <div className={`${card.color} p-6 rounded-[2rem] group-hover:scale-110 transition-all duration-500 shadow-xl border border-white/5`}>
              <card.icon className="text-secondary" size={40} />
            </div>
            <div className="space-y-3 relative z-10">
              <h3 className="text-2xl font-sans font-black uppercase italic tracking-tighter text-white group-hover:text-secondary transition-all">{card.title}</h3>
              <p className="text-xs text-white/50 font-black uppercase tracking-widest leading-loose max-w-[220px] px-2">{card.desc}</p>
            </div>
            <button className="bg-white/5 text-white/40 px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] group-hover:bg-secondary group-hover:text-white transition-all shadow-lg border border-white/10">ENTER HUB</button>
          </motion.div>
        ))}
      </div>

      {/* Community Impact Section */}
      <div className="liquid-glass p-16 md:p-20 rounded-[4rem] border border-white/10 text-center space-y-12 shadow-[0_20px_50px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[100px] rounded-full z-0"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-sans font-black uppercase italic tracking-tighter text-white mb-16 liquid-text">Our Shared <span className="text-primary">Legacy</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: "45k+", label: "ACTIVE TRIBE" },
              { value: "180+", label: "EXPEDITIONS" },
              { value: "92%", label: "RETURNING SOULS" },
              { value: " #1", label: "RATED IN AHMEDABAD" }
            ].map((stat, i) => (
              <div key={i} className="space-y-3">
                <p className="text-4xl md:text-5xl font-sans font-black text-secondary tracking-tighter italic">{stat.value}</p>
                <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.3em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

const Wishlist = () => {
  const { wishlist, remove, isLoading } = useWishlist()

  return (
    <PageLayout
      seoTitle="Your Wishlist — Future Expeditions with WAYBOND"
      seoDescription="Your personal vault of saved travel adventures. Keep track of trips you want to conquer."
      title={<>YOUR<br /><span className="text-primary italic px-4" style={{ WebkitTextStroke: '2px white' }}>DREAMS</span></>}
      subtitle="The vault of adventures awaiting your signal. Keep track of the soul-stirring voyages you're planning to conquer."
    >
      {isLoading ? (
        <div className="liquid-glass-dark py-32 md:py-40 rounded-[4rem] border border-white/10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <p className="text-white/50 italic text-lg">Loading your wishlist...</p>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="liquid-glass-dark py-32 md:py-40 rounded-[4rem] border border-white/10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="relative inline-block mb-10">
            <Heart size={80} className="mx-auto text-white/10 fill-white/10 group-hover:fill-secondary/20 transition-all scale-110" />
            <Star size={32} className="absolute -top-4 -right-4 text-secondary animate-pulse" />
          </div>
          <h3 className="text-3xl md:text-4xl font-sans font-black uppercase italic tracking-tighter text-white/30 mb-10">Your Expedition Vault is Empty</h3>
          <Link
            to="/discover"
            onClick={() => haptics.light()}
            className="inline-block bg-white text-slate-800 px-12 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-secondary hover:text-white transition-all shadow-xl shadow-black/40 active:scale-95 duration-500"
          >
            UNCOVER DESTINATIONS
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-sm font-medium">
              <span className="text-secondary font-black">{wishlist.length}</span> {wishlist.length === 1 ? 'adventure' : 'adventures'} saved
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {wishlist.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group overflow-hidden rounded-[2rem] liquid-glass text-white border border-white/10 shadow-2xl transition-transform duration-500 hover:-translate-y-2 flex flex-col relative"
              >
                {/* Remove Button - Top Right */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    haptics.light()
                    remove(trip.id)
                  }}
                  className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-red-500/20 border border-red-500/40 backdrop-blur-sm flex items-center justify-center text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white transition-all duration-300 hover:scale-110 active:scale-95"
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Image Section */}
                <div className="relative h-56 sm:h-60 overflow-hidden bg-white flex-shrink-0">
                  <img src={trip.image} alt={trip.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[2s] group-hover:scale-105" />

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {Array.from({ length: 4 }).map((_, dot) => (
                      <span key={dot} className={`h-2 w-2 rounded-full border border-white/60 ${dot === 0 ? 'bg-secondary' : 'bg-white/70'}`} />
                    ))}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 md:p-6 flex-grow flex flex-col">
                  <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[10px] font-bold text-white/55 mb-3">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar size={13} className="text-secondary" /> {trip.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <MapPin size={13} className="text-secondary shrink-0" />
                      <span className="truncate">{trip.location}</span>
                    </span>
                  </div>
                  <div className="h-px bg-white/10 mb-3" />
                  <h3 className="text-lg md:text-xl font-sans font-black tracking-tight text-white leading-snug line-clamp-2 mb-2">
                    {trip.title}
                  </h3>
                  <p className="text-xs md:text-sm text-white/55 line-clamp-3 flex-grow">{trip.description}</p>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-white/10 p-5 md:p-6 flex-shrink-0 space-y-3">
                  {/* Price */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/45 mb-1">Starting from</p>
                      <p className="text-xl md:text-2xl font-sans font-black text-secondary leading-none">₹{trip.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-white/45 mb-1">{trip.category}</p>
                      <p className="text-[10px] font-bold text-white/70">{trip.experience}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/trip/${createSlug(trip.title)}`}
                      onClick={() => haptics.medium()}
                      className="inline-flex justify-center items-center gap-1 rounded-full bg-white/10 px-2 py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white hover:bg-white/30 hover:border-white/50 transition-colors"
                      title="More details"
                    >
                      <CircleHelp size={12} />
                      <span className="hidden sm:inline">Details</span>
                      <span className="sm:hidden">View</span>
                    </Link>
                    <a
                      href={getTripWhatsAppLink(trip.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => haptics.medium()}
                      className="inline-flex justify-center items-center gap-1 rounded-full bg-secondary/15 px-2 py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-secondary hover:bg-secondary hover:text-white transition-colors"
                      title="Enquire on WhatsApp"
                    >
                      <MessageCircle size={12} />
                      <span className="hidden sm:inline">Enquire</span>
                      <span className="sm:hidden">Chat</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export { About, Community, Wishlist }
