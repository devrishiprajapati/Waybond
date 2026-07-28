import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { heroSlides as staticHeroSlides, getWhatsAppLink } from "../../lib/data";
import { getHeroSlides, optimizeImageUrl } from "../../lib/dataService";
import { haptics } from "../../lib/haptics";

export default function HeroSection() {
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  // Load slides and preload first two images
  useEffect(() => {
    getHeroSlides().then((slides) => {
      setHeroSlides(slides);

      // Preload only the first two images initially for faster FCP
      slides.slice(0, 2).forEach((slide: any) => {
        const img = new Image();
        img.src = optimizeImageUrl(slide.image, 1920, 85);
      });
    });
  }, []);

  // Simplified auto-play logic
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    // Preload next image in sequence
    const nextIndex = (index + 1) % heroSlides.length;
    if (heroSlides[nextIndex]) {
      const img = new Image();
      img.src = optimizeImageUrl(heroSlides[nextIndex].image, 1920, 85);
    }

    return () => clearInterval(timer);
  }, [heroSlides.length, index]);

  const goTo = (i: number) => {
    setIndex(i);
  };

  const slide = heroSlides[index] || { image: "", title: "", subtitle: "" };

  return (
    <section className="keep-light-text relative h-[68svh] sm:h-[82vh] min-h-[500px] sm:min-h-[680px] overflow-hidden bg-white">
      <Helmet>
        {heroSlides.slice(0, 2).map((s, i) => (
          <link key={`preload-${i}`} rel="preload" as="image" href={s.image} />
        ))}
      </Helmet>
      {/* Background Images — Optimized to render only active and adjacent slides for performance */}
      {heroSlides.map((s, i) => {
        const isActive = i === index;
        const isPrev = i === (index - 1 + heroSlides.length) % heroSlides.length;

        // Only render current and previous (for exit animation) to save DOM/memory
        if (!isActive && !isPrev) return null;

        return (
          <motion.div
            key={`bg-${i}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 1.05
            }}
            transition={{
              opacity: { duration: 1.2, ease: "easeInOut" },
              scale: { duration: 6, ease: "easeOut" }
            }}
            className="absolute inset-0"
            style={{ zIndex: isActive ? 1 : 0 }}
          >
            <img
              src={optimizeImageUrl(s.image, 1920, 85)}
              alt={s.title}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </motion.div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/55 to-black/10 z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/20 z-10" />

      {/* Text Content — Dynamic but synchronized */}
      <div className="absolute inset-0 flex items-center z-20 pt-20 pb-20 sm:pb-0">
        <div className="max-w-[1920px] mx-auto w-full px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <p className="text-secondary font-black text-[10px] sm:text-xs uppercase tracking-[0.35em] mb-5"></p>
                <h1 className="font-display font-black text-[2.5rem] sm:text-5xl lg:text-7xl xl:text-8xl text-white mb-5 leading-[0.95] uppercase tracking-tighter liquid-text">
                  {slide.title}
                </h1>
                <p className="text-white/80 text-base sm:text-lg lg:text-xl mb-9 font-medium max-w-2xl leading-relaxed">
                  {slide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4"
            >
              <Link
                to="/discover"
                onClick={() => haptics.medium()}
                className="w-full max-w-[280px] sm:w-auto sm:max-w-none px-6 sm:px-10 py-4 bg-secondary text-white rounded-full font-black text-[11px] sm:text-xs uppercase tracking-widest text-center transition-all duration-300 hover:scale-105 shadow-2xl shadow-secondary/30 sm:min-w-[220px]"
              >
                Explore Packages
              </Link>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => haptics.medium()}
                className="w-full max-w-[280px] sm:w-auto sm:max-w-none px-6 sm:px-10 py-4 liquid-glass text-white font-black text-[11px] sm:text-xs uppercase tracking-widest text-center transition-all duration-300 hover:scale-105 sm:min-w-[220px] !rounded-full before:!rounded-full after:!rounded-full"
              >
                Contact Us
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dot Navigation */}
      <div className="absolute bottom-5 sm:bottom-9 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 lg:left-20 flex gap-3 z-30">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              haptics.light();
              goTo(i);
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-10 bg-secondary" : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
          />
        ))}
      </div>

    </section>
  );
}
