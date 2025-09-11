import React from 'react';
import { motion } from "framer-motion";
import { useStoreContext } from '@/contexts/StoreContext';

// --- MOCK for useStoreContext to make the file self-contained ---
// const useStoreContext = () => {
//   const storeFormData = {
//     heroSlides: [
//       {
//         id: 'hero-legal-1',
//         imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415174?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//         headline: 'Your Trusted Partner in Finance & Legal Matters',
//         subline: 'Navigating complex financial and legal landscapes with clarity, expertise, and personalized solutions.',
//         ctaText: 'Get a Free Consultation',
//         ctaLink: '/contact',
//         order: 1,
//       },
//     ],
//     themeSettings: {
//       primaryColor: "#004085",
//       secondaryColor: "#1F77B4",
//     },
//   };
//   return { storeFormData };
// };

// SVG Icons to replace Heroicons
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-3">
    <path fillRule="evenodd" d="M3 12a.75.75 0 01.75-.75h12.564l-4.78-4.78a.75.75 0 011.06-1.06l6 6a.75.75 0 010 1.06l-6 6a.75.75 0 11-1.06-1.06l4.78-4.78H3.75A.75.75 0 013 12z" clipRule="evenodd" />
  </svg>
);
const ScaleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-3 text-white">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.75 5.25a.75.75 0 00-1.5 0v4.286l-2.062 2.062a.75.75 0 101.06 1.06L12 12.312l1.5-1.5V7.5z" clipRule="evenodd" />
  </svg>
);
const CurrencyDollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-3 text-white">
    <path d="M11.666 4.475a.75.75 0 01.668 0l7.5 4.5a.75.75 0 010 1.25l-7.5 4.5a.75.75 0 01-.668 0L4.166 10.25a.75.75 0 010-1.25l7.5-4.5Z" />
    <path fillRule="evenodd" d="M19.166 10.75l-7.5 4.5a.75.75 0 01-.668 0L4.166 10.75V19.5a.75.75 0 00.75.75h14.25a.75.75 0 00.75-.75v-8.75Zm-5.352 1.332 3.144 1.886a.75.75 0 010 1.25l-3.144 1.886a.75.75 0 01-.668 0l-3.144-1.886a.75.75 0 010-1.25l3.144-1.886a.75.75 0 01.668 0Z" clipRule="evenodd" />
  </svg>
);
const LightBulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-3 text-white">
    <path d="M12 14.25a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />
    <path fillRule="evenodd" d="M5.875 12a6.125 6.125 0 1112.25 0 6.125 6.125 0 01-12.25 0zM12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" clipRule="evenodd" />
  </svg>
);
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-3 text-white">
    <path d="M12 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM12 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75-.75h8.25a.75.75 0 01.75.75v14.25a.75.75 0 01-.75.75H14.5a3.75 3.75 0 00-7.5 0H2.25a.75.75 0 01-.75-.75V1.5a.75.75 0 01.75-.75h8.25a.75.75 0 01.75.75zM11.25 7.5a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v3a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-3z" clipRule="evenodd" />
  </svg>
);

// Framer Motion variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "backOut",
    },
  },
};

const HeroSection = () => {
  const { storeFormData } = useStoreContext();

  // Determine the active hero slide or use defaults
  const activeHeroSlide = storeFormData?.heroSlides?.[0];

  const headline = activeHeroSlide?.headline || "Your Trusted Partner in Finance & Legal Matters";
  const subline = activeHeroSlide?.subline || "Navigating complex financial and legal landscapes with clarity, expertise, and personalized solutions.";
  const ctaText = activeHeroSlide?.ctaText || "Get a Free Consultation";
  const ctaLink = activeHeroSlide?.ctaLink || "/contact";
  const imageUrl = activeHeroSlide?.imageUrl || "https://placehold.co/1920x1080/004085/FFFFFF?text=Financial+%26+Legal";

  const primary = storeFormData?.themeSettings?.primaryColor || "#004085";
  const secondary = storeFormData?.themeSettings?.secondaryColor || "#1F77B4";

  return (
    <section
      className="relative overflow-hidden font-sans text-white py-24 sm:py-32 lg:py-40"
      style={{
        background: `linear-gradient(to right, ${primary}, ${secondary})`,
      }}
    >
      {/* Background patterns for visual interest */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <img
          src="https://placehold.co/1920x1080/004085/FFFFFF?text=Abstract+Pattern"
          alt="background pattern"
          className="object-cover w-full h-full"
          style={{ mixBlendMode: "overlay" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-20">
          {/* Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center md:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-md"
            >
              {headline}
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl mb-8 text-white/95 leading-relaxed"
            >
              {subline}
            </motion.p>
            <motion.a
              variants={itemVariants}
              href={ctaLink}
              className="inline-flex items-center justify-center px-8 py-4 rounded-full font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              {ctaText}
              <ArrowRightIcon />
            </motion.a>

            {/* Added: Key Value Propositions/Features */}
            <motion.div
              variants={containerVariants}
              className="mt-12 grid grid-cols-2 sm:grid-cols-2 gap-6 text-sm sm:text-base"
            >
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <ScaleIcon />
                Expert Legal Counsel
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <CurrencyDollarIcon />
                Strategic Financial Planning
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <LightBulbIcon />
                Innovative Solutions
              </motion.div>
              <motion.div variants={iconVariants} className="flex items-center text-white/90">
                <UsersIcon />
                Client-Centric Approach
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Image Content */}
          {imageUrl && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="hidden md:block relative w-full max-w-lg mx-auto aspect-w-16 aspect-h-9 md:aspect-w-1 md:aspect-h-1 rounded-xl overflow-hidden shadow-2xl"
            >
              <img
                src={imageUrl}
                alt="Empowering your financial and legal future"
                className="object-cover object-center w-full h-full transform hover:scale-105 transition-transform duration-500"
              />
              {/* Image Overlay for a subtle effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black/10"></div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
