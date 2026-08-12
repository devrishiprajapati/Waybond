import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { BadgeIndianRupee, CalendarDays, FileText, MessageCircle, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { getWhatsAppLink } from '../lib/data'
import { haptics } from '../lib/haptics'

const cancellationCharges = [
  ['More than 30 days', '25% of the total trip cost'],
  ['15–30 days', '50% of the total trip cost'],
  ['7–14 days', '75% of the total trip cost'],
  ['Less than 7 days or no show', '100% of the total trip cost']
]

const CancellationRefunds = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-screen pt-40 pb-24 bg-white text-white relative overflow-hidden"
  >
    <Helmet>
      <title>Cancellation & Refunds Policy | WayBond</title>
      <meta name="description" content="Read WayBond's booking, cancellation, and refund policy." />
    </Helmet>

    <div className="absolute -top-32 right-[-8%] h-[34rem] w-[34rem] rounded-full bg-secondary/10 blur-[140px] pointer-events-none" />
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
      <div className="max-w-4xl mb-16 md:mb-20 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass inline-flex items-center gap-3 px-5 py-2 rounded-full border-white/10 shadow-lg"
        >
          <ShieldCheck size={14} className="text-secondary" />
          <span className="text-secondary font-black uppercase tracking-[0.4em] text-[9px]">Travel with clarity</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl lg:text-[6rem] font-bungee font-black text-white tracking-tighter uppercase leading-[0.9] liquid-text italic"
        >
          CANCELLATION<br />& <span className="text-secondary">REFUNDS</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-white/50 font-medium max-w-2xl italic leading-relaxed"
        >
          Please read these terms before confirming your WayBond Experiences journey.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_0.75fr] gap-10 lg:gap-16 items-start">
        <div className="space-y-8">
          <PolicyCard icon={FileText} title="Booking & Payments" number="01">
            <PolicyList items={[
              'All bookings are confirmed only after receiving the required booking amount or full payment.',
              'The remaining balance, if any, must be paid before the departure date as communicated by WayBond Experiences.',
              'Failure to complete the payment within the specified timeline may result in cancellation of the booking.'
            ]} />
          </PolicyCard>

          <PolicyCard icon={CalendarDays} title="Cancellation Policy" number="02">
            <PolicyList items={[
              'All cancellation requests must be made in writing via email or WhatsApp to WayBond Experiences.',
              'The booking amount is non-refundable unless otherwise specified for a particular trip.'
            ]} />
            <div className="mt-7 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-2 bg-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-[0.16em] text-secondary">
                <div className="p-4">Cancellation before departure</div>
                <div className="p-4 border-l border-white/10">Cancellation charges</div>
              </div>
              {cancellationCharges.map(([period, charge]) => (
                <div key={period} className="grid grid-cols-2 border-t border-white/10 text-xs md:text-sm text-white/60 font-medium">
                  <div className="p-4">{period}</div>
                  <div className="p-4 border-l border-white/10">{charge}</div>
                </div>
              ))}
            </div>
            <PolicyList className="mt-7" items={[
              'Any non-refundable expenses already incurred for permits, transportation, accommodations, flights, or entry tickets will be deducted from the refund amount.',
              'No refund will be provided for unused services, voluntary withdrawal from the trip, or early departure during the trip.',
              'A replacement participant may be allowed if a traveller cannot attend, subject to feasibility and applicable charges.',
              'If WayBond Experiences cancels a trip due to insufficient participants or operational reasons, participants will receive either a full refund or the option to transfer the amount to another trip.',
              'For natural disasters, adverse weather, government restrictions, pandemics, road closures, or other force majeure events, refunds are subject to the policies of hotels, transport providers, and other third-party vendors.',
              'Applicable refunds will be processed within 7–14 working days from cancellation approval.',
              'WayBond Experiences may amend the cancellation policy for specific trips, events, or special departures. Any changes will be communicated before booking confirmation.'
            ]} />
          </PolicyCard>

          <PolicyCard icon={BadgeIndianRupee} title="Refund Policy" number="03">
            <PolicyList items={[
              'Refunds, wherever applicable, will be processed in accordance with the Cancellation Policy of the respective trip or package.',
              'Eligible refunds will be credited to the original payment method or bank account provided by the participant within 7–14 working days after approval.',
              'The booking amount, processing fees, taxes, and non-refundable expenses for permits, transportation, accommodations, or third-party services may be deducted from the refund amount.',
              'No refund will be provided for no-shows, unused services, voluntary withdrawal from the trip, or early departure from the tour.',
              'Refund requests arising from natural disasters, government restrictions, adverse weather conditions, or other force majeure events are subject to the policies of hotels, transport providers, and other third-party vendors.'
            ]} />
          </PolicyCard>
        </div>

        <motion.aside
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="liquid-glass p-8 md:p-10 rounded-[3rem] border border-white/15 shadow-2xl lg:sticky lg:top-28"
        >
          <MessageCircle className="text-secondary mb-8" size={32} />
          <h2 className="text-3xl font-bungee font-black uppercase italic tracking-tighter text-white">Need help with a refund?</h2>
          <p className="text-sm text-white/50 leading-relaxed italic font-medium mt-5 mb-8">Contact our team through our official support channels for refund-related queries.</p>
          <a
            href={getWhatsAppLink(`Hi WayBond! I'd like to cancel or reschedule my trip. Can you assist me with this?`)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => haptics.medium()}
            className="inline-flex items-center justify-center gap-3 w-full bg-secondary text-white px-6 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.18em] hover:bg-white hover:text-slate-800 transition-all duration-500 shadow-xl shadow-secondary/20 active:scale-95"
          >
            Contact support
          </a>
        </motion.aside>
      </div>
    </div>
  </motion.div>
)

const PolicyCard = ({ icon: Icon, title, number, children }: { icon: typeof FileText, title: string, number: string, children: ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="liquid-glass-dark p-7 md:p-10 rounded-[2.5rem] border border-white/10 shadow-xl"
  >
    <div className="flex items-start gap-5 mb-8">
      <div className="bg-secondary/20 p-4 rounded-2xl"><Icon size={24} className="text-secondary" /></div>
      <div>
        <p className="text-[9px] font-black tracking-[0.3em] text-secondary uppercase mb-2">Policy {number}</p>
        <h2 className="text-3xl font-bungee font-black uppercase italic tracking-tighter text-white">{title}</h2>
      </div>
    </div>
    {children}
  </motion.section>
)

const PolicyList = ({ items, className = '' }: { items: string[], className?: string }) => (
  <ul className={`space-y-4 ${className}`}>
    {items.map((item) => <li key={item} className="flex gap-3 text-sm text-white/60 leading-relaxed font-medium"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />{item}</li>)}
  </ul>
)

export default CancellationRefunds
