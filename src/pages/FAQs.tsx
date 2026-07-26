import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, CircleHelp, MessageCircle, ShieldCheck } from 'lucide-react'
import { getWhatsAppLink } from '../lib/data'
import { haptics } from '../lib/haptics'

const faqs = [
  {
    question: 'How do I book a trip with WayBond?',
    answer: 'You can book directly through our website by selecting your preferred package, filling out the registration form, and making the payment.'
  },
  {
    question: 'Is my booking confirmed immediately?',
    answer: 'Your booking is confirmed only after the required payment is received and a confirmation email or message is sent by our team.'
  },
  {
  question: 'What is included in a WayBond trip?',
    answer: 'The inclusions vary from trip to trip and are mentioned on each package page under the "Includes" section.'
  },
  {
    question: 'What is not included in the WayBond trip?',
    answer: 'Personal expenses, travel insurance, and items not specifically mentioned under "Includes" are generally excluded.'
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, cancellations are allowed as per our Cancellation Policy. Refund eligibility depends on the cancellation timeline.'
  },
  {
    question: 'Are your trips safe?',
    answer: 'Yes. Safety is our top priority, and our trips are planned with experienced coordinators and trusted local partners.'
  },
  {
    question: 'Do I need prior trekking experience?',
    answer: 'Not necessarily. We organize trips for beginners as well as experienced trekkers. The difficulty level of each trip is mentioned in the package details.'
  },
  {
    question: 'What should I carry for the trip?',
    answer: 'A detailed "Things to Carry" list is provided for every package on the website.'
  },
  {
    question: ' Is travel insurance included?',
    answer: 'No, travel insurance is generally not included unless specifically mentioned.'
  },
  {
    question: 'What happens if the trip is cancelled due to bad weather?',
    answer: 'In such situations, refunds or rescheduling will be subject to our Cancellation and Refund Policy and third-party vendor policies'
  },
  {
    question: 'Can I join solo?',
    answer: 'Absolutely! Many of our participants travel solo and become part of our growing travel community.'
  },
  {
    question: 'Are there any age restrictions?',
    answer: 'Age requirements may vary depending on the destination and activity. Please refer to the specific package details.'
  },
  {
    question: 'Can I transfer my booking to another person?',
    answer: 'Booking transfers may be permitted subject to availability and applicable charges.'
  },
    {
    question: 'How can I contact Waybond Experiences?',
    answer: 'You can reach us through our phone number, WhatsApp, email, or social media channels mentioned on the website.'
  },

]

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    haptics.light()
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-40 pb-24 bg-charcoal text-white relative overflow-hidden"
    >
      <Helmet>
        <title>Traveler FAQs | WayBond</title>
        <meta name="description" content="Find answers about booking, safety, cancellations, and travelling with WayBond." />
      </Helmet>

      <div className="absolute top-32 right-[-10%] w-96 h-96 rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        <div className="max-w-4xl mb-16 md:mb-20 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="liquid-glass inline-flex items-center gap-3 px-5 py-2 rounded-full border-white/10 shadow-lg"
          >
            <CircleHelp size={14} className="text-secondary" />
            <span className="text-secondary font-black uppercase tracking-[0.4em] text-[9px]">Travel support</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-[6rem] font-display font-black text-white tracking-tighter uppercase leading-[0.9] liquid-text italic"
          >
            YOUR QUESTIONS,<br /><span className="text-secondary">ANSWERED</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/50 font-medium max-w-2xl italic leading-relaxed"
          >
            Everything you need to know before your next WayBond adventure.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_0.75fr] gap-10 lg:gap-16 items-start">
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className={`liquid-glass-dark rounded-[2rem] border transition-colors duration-500 ${isOpen ? 'border-secondary/40' : 'border-white/10'}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-6 p-6 md:p-8 text-left"
                  >
                    <span className={`font-display font-black text-lg md:text-xl uppercase italic tracking-tight transition-colors ${isOpen ? 'text-secondary' : 'text-white'}`}>
                      {faq.question}
                    </span>
                    <span className={`shrink-0 p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-secondary text-white rotate-180' : 'bg-white/10 text-white/70'}`}>
                      <ChevronDown size={20} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 md:px-8 pb-7 md:pb-8 text-sm text-white/55 leading-relaxed font-medium italic max-w-3xl">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>

          <motion.aside
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="liquid-glass p-8 md:p-10 rounded-[3rem] border border-white/15 shadow-2xl lg:sticky lg:top-28"
          >
            <div className="bg-secondary/20 p-4 rounded-2xl w-fit mb-8">
              <ShieldCheck className="text-secondary" size={28} />
            </div>
            <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-white">Still need a hand?</h2>
            <p className="text-sm text-white/50 leading-relaxed italic font-medium mt-5 mb-8">
              Our team is here to help you plan your next journey with confidence.
            </p>
            <a
              href={getWhatsAppLink("Hi WayBond! I have a question about travelling with you.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => haptics.medium()}
              className="inline-flex items-center justify-center gap-3 w-full bg-secondary text-white px-6 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.22em] hover:bg-white hover:text-charcoal transition-all duration-500 shadow-xl shadow-secondary/20 active:scale-95"
            >
              <MessageCircle size={16} /> Chat with us
            </a>
          </motion.aside>
        </div>
      </div>
    </motion.div>
  )
}

export default FAQs
