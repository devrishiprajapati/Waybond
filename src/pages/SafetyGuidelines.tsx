import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { AlertTriangle, HeartPulse, MapPinned, ShieldCheck, UsersRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const guidelines: { icon: LucideIcon, title: string, description: string }[] = [
  { icon: ShieldCheck, title: 'Follow your trip leader', description: 'Please follow all instructions shared by your trip leader and local guides. They are there to keep the group informed, comfortable, and safe.' },
  { icon: MapPinned, title: 'Stay with the group', description: 'Do not leave the group or change the planned route without informing your trip leader. Keep your phone charged and save the team contact details.' },
  { icon: HeartPulse, title: 'Share medical information', description: 'Tell us in advance about allergies, medical conditions, dietary needs, or medication requirements that may affect your travel experience.' },
  { icon: AlertTriangle, title: 'Respect weather and terrain', description: 'Mountain roads, water activities, and changing weather need care. Wear suitable footwear, carry essentials, and follow weather-related decisions from the team.' },
  { icon: UsersRound, title: 'Travel responsibly', description: 'Respect local communities, fellow travellers, and the environment. Avoid risky behaviour, keep shared spaces clean, and help create a positive group experience.' }
]

const SafetyGuidelines = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen pt-40 pb-24 bg-white text-white relative overflow-hidden">
    <Helmet>
      <title>Trip Safety Guidelines | WayBond</title>
      <meta name="description" content="Essential safety guidelines for travelling with WayBond Experiences." />
    </Helmet>
    <div className="absolute top-24 left-[-12%] h-[32rem] w-[32rem] rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
      <div className="max-w-4xl mb-16 md:mb-20 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="liquid-glass inline-flex items-center gap-3 px-5 py-2 rounded-full border-white/10 shadow-lg">
          <ShieldCheck size={14} className="text-secondary" />
          <span className="text-secondary font-black uppercase tracking-[0.4em] text-[9px]">Your wellbeing matters</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl lg:text-[6rem] font-sans font-black text-white tracking-tighter uppercase leading-[0.9] liquid-text italic">
          TRIP SAFETY<br /><span className="text-secondary">GUIDELINES</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-white/50 font-medium max-w-2xl italic leading-relaxed">
          A few simple practices help every WayBond journey stay safe, respectful, and memorable for everyone.
        </motion.p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {guidelines.map((guideline, index) => {
          const Icon = guideline.icon
          return <motion.article key={guideline.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className={`liquid-glass-dark p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-xl group hover:border-secondary/30 transition-colors ${index === guidelines.length - 1 ? 'md:col-span-2' : ''}`}>
            <div className="flex gap-6 items-start">
              <div className="shrink-0 bg-secondary/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500"><Icon className="text-secondary" size={26} /></div>
              <div><p className="text-[9px] font-black tracking-[0.3em] text-secondary uppercase mb-2">Guideline {String(index + 1).padStart(2, '0')}</p><h2 className="text-2xl md:text-3xl font-sans font-black uppercase italic tracking-tighter text-white">{guideline.title}</h2><p className="text-sm text-white/55 leading-relaxed font-medium italic mt-4 max-w-2xl">{guideline.description}</p></div>
            </div>
          </motion.article>
        })}
      </div>
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-10 liquid-glass p-8 md:p-12 rounded-[3rem] border border-white/15 shadow-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-sans font-black uppercase italic tracking-tighter text-white">In an emergency</h2>
        <p className="text-sm text-white/55 leading-relaxed italic font-medium mt-4 max-w-2xl mx-auto">Inform your trip leader immediately. If urgent medical help is needed, contact local emergency services first, then reach the WayBond team through the support contact shared for your trip.</p>
      </motion.section>
    </div>
  </motion.div>
)

export default SafetyGuidelines
