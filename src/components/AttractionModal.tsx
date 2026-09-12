import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin } from 'lucide-react'
import { Attraction } from '../lib/trips'

interface Props {
    attraction: Attraction | null
    onClose: () => void
}

const AttractionModal: React.FC<Props> = ({ attraction, onClose }) => {
    useEffect(() => {
        if (!attraction) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [attraction, onClose])

    return (
        <AnimatePresence>
            {attraction && (
                <motion.div
                    key="attraction-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4"
                    onClick={onClose}
                >
                    {/* Blurred backdrop */}
                    <div className="absolute inset-0 bg-black/35 backdrop-blur-xl" />

                    <motion.div
                        key="attraction-panel"
                        initial={{ opacity: 0, y: 70, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 70, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
                        onClick={e => e.stopPropagation()}
                        className="relative w-full sm:max-w-lg overflow-hidden rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col border border-white"
                        style={{ background: '#ffffff' }}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center bg-white/85 hover:bg-white text-gray-700 hover:text-gray-950 border border-white/60 transition-all backdrop-blur-sm"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>

                        {/* Image — full width, no rounded corners at top on mobile */}
                        {attraction.image ? (
                            <div className="w-full aspect-[16/9] overflow-hidden shrink-0 relative">
                                <img
                                    src={attraction.image}
                                    alt={attraction.name}
                                    className="w-full h-full object-cover"
                                />
                                {/* Very subtle bottom fade so image blends into content */}
                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                            </div>
                        ) : (
                            <div className="w-full aspect-[16/9] flex items-center justify-center bg-gray-100">
                                <MapPin size={40} className="text-gray-300" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="px-6 pb-8 pt-2 md:px-8 md:pb-10 space-y-3">
                            {attraction.location && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700 text-[10px] font-black uppercase tracking-[0.22em]">
                                    <MapPin size={10} />
                                    {attraction.location}
                                </div>
                            )}
                            <h2 className="text-2xl md:text-3xl font-bungee font-black uppercase italic tracking-tighter leading-tight text-gray-950">
                                {attraction.name}
                            </h2>
                            {attraction.description && (
                                <p className="text-sm md:text-base leading-relaxed font-medium text-gray-700">
                                    {attraction.description}
                                </p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default AttractionModal
