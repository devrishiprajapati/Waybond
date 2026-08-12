import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#003d6a] via-[#005a9e] to-[#003d6a] overflow-hidden"
    >
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.15),transparent_70%)]"></div>
        
        {/* Animated floating orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.5, 0.3, 0.5],
            x: [0, -30, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
        ></motion.div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6">
        {/* Animated Camper with Glow Effect */}
        <div className="relative mb-8 flex justify-center">
          {/* Glow background */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 blur-3xl bg-white/20 rounded-full scale-150"
          ></motion.div>
          
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1, 1.05, 1],
              opacity: 1
            }}
            transition={{
              scale: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
              opacity: { duration: 0.5 }
            }}
            className="relative w-48 h-48 md:w-64 md:h-64"
          >
            <img
              src="/camper-van.svg"
              alt="WayBond camper van"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        {/* Brand Name with Stagger Animation */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-4"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-sans font-black tracking-tighter">
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
              className="inline-block text-white"
            >
              WAY
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
              className="inline-block text-secondary ml-2"
            >
              BOND
            </motion.span>
          </h1>
        </motion.div> */}

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-white/70 text-sm md:text-base font-medium max-w-md mx-auto mb-8 italic"
        >
          Your Journey, Our Passion
        </motion.p>

        {/* Loading Bar Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="w-64 max-w-full mx-auto"
        >
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="h-full w-1/2 bg-gradient-to-r from-transparent via-secondary to-transparent"
            ></motion.div>
          </div>
          
          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-white/50 text-xs uppercase tracking-widest font-black mt-3"
          >
            Loading Adventure
          </motion.p>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ 
              x: Math.random() * 200 - 100,
              y: Math.random() * 200 - 100,
              opacity: 0 
            }}
            animate={{
              y: [Math.random() * 200 - 100, Math.random() * -200 + 100],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
            className="absolute w-1 h-1 bg-secondary rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`
            }}
          ></motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SplashScreen;
