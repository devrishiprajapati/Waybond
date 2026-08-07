import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { CheckCircle2, ShieldCheck, MapPin, Star, UserCheck, MessageCircle, Heart, Users, Share2, Compass, Calendar, CircleHelp, Download, Trash2 } from 'lucide-react'
import { communityGalleries, loadCommunityGalleries } from '../lib/communityGalleries'
import { useWishlist } from '../lib/wishlist'
import { haptics } from '../lib/haptics'
import { getTripWhatsAppLink } from '../lib/trips'
import { createSlug } from '../lib/dataService'

const PageLayout = ({ children, title, subtitle, seoTitle, seoDescription, className = "" }: { children: React.ReactNode, title: React.ReactNode, subtitle?: string, seoTitle?: string, seoDescription?: string, className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
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
      <div className="mb-20 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass inline-block px-5 py-2 rounded-full border-white/10 shadow-lg"
        >
          <span className="text-secondary font-black uppercase tracking-[0.4em] text-[9px]">CRAFTING MEMORIES</span>
        </motion.div>
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl md:text-7xl lg:text-[7rem] font-display font-black text-white tracking-tighter uppercase leading-[0.9] liquid-text italic"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/50 mt-8 font-medium max-w-2xl italic leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {children}
    </div>
  </motion.div>
)

const About = () => (
  <PageLayout
    seoTitle="About WAYBOND — Ahmedabad's Premier Travel Community"
    seoDescription="Learn about Way Bond's mission to make travel meaningful, accessible, and community-driven for Ahmedabad."
    title={<>THE WAY<br /><span className="text-primary px-4 drop-shadow-2xl" style={{ WebkitTextStroke: '2px white' }}>BOND</span> SPIRIT</>}
    subtitle="Way Bond is Ahmedabad's premier authentic travel community. We don't just book tours; we craft soul-stirring memories that resonate for a lifetime."
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-12"
      >
        <div className="space-y-6">
          <h2 className="text-4xl font-display font-black uppercase italic tracking-tighter text-secondary">Our Manifest</h2>
          <p className="text-lg text-white/60 leading-relaxed font-medium italic">
            Born from a simple desire: to make travel meaningful, accessible, and deeply community-driven for the people of Ahmedabad. We believe that every journey should be an exploration of both the world and the inner self.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: UserCheck, title: "Verified Captains", desc: "Led by Ahmedabad-local experts who live and breathe the terrain." },
            { icon: ShieldCheck, title: "Safety First", desc: "Rigorous safety protocols and 24/7 SOS support for peace of mind." },
            { icon: Users, title: "Community First", desc: "Not just travelers, but a tribe of explorers bound by curiosity." },
            { icon: Compass, title: "Pure Discovery", desc: "Uncovering hidden trails and authentic local stories." }
          ].map((item, i) => (
            <div key={i} className="liquid-glass-dark p-8 rounded-[2.5rem] border border-white/10 space-y-4 hover:border-secondary/30 transition-all shadow-xl group">
              <div className="bg-secondary/20 p-4 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                <item.icon className="text-secondary" size={24} />
              </div>
              <h4 className="font-display font-black text-xl uppercase italic tracking-tighter text-white group-hover:text-secondary transition-all">{item.title}</h4>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest leading-loose">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative rounded-[4rem] overflow-hidden group shadow-2xl h-[600px] lg:h-[700px] border border-white/10"
      >
        <img src="/assets/LBK.jpeg" loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-black/20 to-transparent"></div>
        <div className="absolute bottom-12 left-12 right-12">
          <div className="liquid-glass p-8 rounded-[3rem] border border-white/20 text-center shadow-2xl backdrop-blur-xl">
            <p className="text-4xl lg:text-5xl font-display font-black text-white italic drop-shadow-xl tracking-tighter">"100+ Journeys Crafted"</p>
            <p className="text-[9px] text-white/50 uppercase font-black tracking-[0.4em] mt-3">Founded for the Ahmedabad Spirit</p>
          </div>
        </div>
      </motion.div>
    </div>
  </PageLayout>
)

const Community = () => {
  const [galleries, setGalleries] = React.useState(communityGalleries)

  React.useEffect(() => {
    loadCommunityGalleries().then(setGalleries)
  }, [])

  return (
  <PageLayout
    seoTitle="Community & Socials — Join the WAYBOND Tribe"
    seoDescription="Connect with 45K+ fellow travelers. Share stories, find expedition partners, and access local intel."
    title={<>TRAVELER<br /><span className="text-secondary italic px-4 drop-shadow-2xl" style={{ WebkitTextStroke: '2px white' }}>ELITE</span> HUB</>}
    subtitle="The digital campfire for our global tribe. Connect with fellow explorers, share road-side epiphanies, and find your next expedition partner."
  >
    {/* Moments / Group Images Section */}
    <div className="mb-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-display font-black uppercase italic tracking-tighter text-white">Moments <span className="text-primary">Captured</span></h2>
        <p className="text-white/40 italic mt-4 text-sm font-medium tracking-wide">Real smiles, real connections.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {galleries.map((gallery, index) => (
          <motion.div
            key={gallery.destination}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-[3rem] overflow-hidden group keep-light-text shadow-[0_15px_40px_rgba(0,0,0,0.5)] h-[400px] md:h-[500px] border border-white/10"
          >
            <img src={gallery.images[0].src} alt={`${gallery.destination} travel memories`} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-black/20 to-transparent"></div>
            <Link to={`/community/${gallery.slug}`} aria-label={`View ${gallery.destination} gallery`} className="absolute inset-0 z-10" />
            <div className="absolute bottom-10 left-10">
              <p className="text-3xl font-display font-black text-white italic drop-shadow-xl tracking-tighter">{gallery.destination}</p>
              <p className="text-[10px] text-white uppercase font-black tracking-[0.3em] mt-2">{gallery.label}</p>
            </div>
          </motion.div>
        ))}
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
            <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter text-white group-hover:text-secondary transition-all">{card.title}</h3>
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
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black uppercase italic tracking-tighter text-white mb-16 liquid-text">Our Shared <span className="text-primary">Legacy</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {[
            { value: "45k+", label: "ACTIVE TRIBE" },
            { value: "180+", label: "EXPEDITIONS" },
            { value: "92%", label: "RETURNING SOULS" },
            { value: " #1", label: "RATED IN AHMEDABAD" }
          ].map((stat, i) => (
            <div key={i} className="space-y-3">
              <p className="text-4xl md:text-5xl font-display font-black text-secondary tracking-tighter italic drop-shadow-md">{stat.value}</p>
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
      title={<>YOUR<br /><span className="text-primary italic px-4 drop-shadow-2xl" style={{ WebkitTextStroke: '2px white' }}>DREAMS</span></>}
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
          <h3 className="text-3xl md:text-4xl font-display font-black uppercase italic tracking-tighter text-white/30 mb-10">Your Expedition Vault is Empty</h3>
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent" />
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
                  <h3 className="text-lg md:text-xl font-display font-black tracking-tight text-white leading-snug line-clamp-2 mb-2">
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
                      <p className="text-xl md:text-2xl font-display font-black text-secondary leading-none">₹{trip.price}</p>
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
                      className="inline-flex justify-center items-center gap-1 rounded-full bg-white/10 px-2 py-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white hover:bg-white hover:text-slate-800 transition-colors"
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
