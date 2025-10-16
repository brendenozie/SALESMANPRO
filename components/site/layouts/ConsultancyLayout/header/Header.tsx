"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// --- Types ---
interface StoreForm {
  slug: string;
  name: string;
  logoUrl?: string;
}

interface HeaderProps {
  storeFormData: StoreForm;
}

// --- Animation Variants ---
const navItemVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.05 + 0.1,
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  }),
};

const mobileMenuVariants = {
  open: {
    clipPath: `circle(150% at 90% 10%)`,
    transition: { type: "spring", stiffness: 40, restDelta: 2 },
  },
  closed: {
    clipPath: "circle(0% at 90% 10%)",
    transition: { delay: 0.1, type: "spring", stiffness: 400, damping: 40 },
  },
};

const mobileLinkVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 50 },
  },
  closed: {
    y: 30,
    opacity: 0,
    transition: { damping: 15 },
  },
};

// --- Dynamic Logo ---
// const DynamicLogo: React.FC<{ formData: StoreForm; isScrolled: boolean }> = ({
//   formData,
//   isScrolled,
// }) => {
//   const { slug, name, logoUrl } = formData;
//   const homeLink = `/site/${slug}`;
//   const displayName = name || "Flourish Johnson";

//   return (
//     <a href={homeLink} className="flex items-center transition-transform hover:scale-[1.02]">
//       {logoUrl ? (
//         <img
//           src={logoUrl}
//           alt={displayName}
//           width={120}
//           height={40}
//           onError={(e: any) => {
//             e.target.onerror = null;
//             e.target.src = `https://placehold.co/120x40/EA580C/FFFFFF?text=${displayName
//               .substring(0, 4)
//               .toUpperCase()}`;
//           }}
//           className={`object-contain transition-all duration-300 w-auto ${
//             isScrolled ? "h-8" : "h-10"
//           }`}
//         />
//       ) : (
//         <span
//           className={`text-2xl font-extrabold ${
//             isScrolled ? "text-gray-900" : "text-gray-900"
//           }`}
//         >
//           <span className="text-orange-600">{displayName}</span>
//         </span>
//       )}
//     </a>
//   );
// };

// --- Main Header Component ---
const ConsultantCoachHeader: React.FC<HeaderProps> = ({ storeFormData }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [handleScroll, mobileMenuOpen]);

  const navItems = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 25 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-xl backdrop-blur-lg border-b border-gray-200/80"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-16" : "h-20"
          }`}
        >
          {/* Logo */}
          <DynamicLogo formData={storeFormData} isScrolled={isScrolled} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navItems.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3 }}
                className="relative"
              >
                <a
                  href={item.href}
                  className={`text-base font-medium relative group py-2 ${
                    isScrolled
                      ? "text-gray-700 hover:text-orange-600"
                      : "text-gray-800 hover:text-orange-600"
                  }`}
                >
                  {item.label}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[3px] w-0 bg-orange-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </a>
              </motion.div>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* CTA */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <a
                href="#contact"
                className="inline-flex items-center px-5 py-2.5 text-base font-semibold rounded-full shadow-lg text-white bg-orange-600 ring-4 ring-orange-300/50 hover:bg-orange-700 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </a>
            </motion.div>

            {/* Mobile Toggle */}
            <div className="md:hidden z-50">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 rounded-full bg-orange-50/70 text-gray-800 hover:bg-orange-100 transition-colors shadow-md border border-orange-200"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <XMarkIcon className="h-6 w-6 text-orange-600" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Bars3BottomRightIcon className="h-6 w-6 text-orange-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed top-0 left-0 w-full h-screen bg-orange-50/98 backdrop-blur-xl origin-top-right z-40"
          >
            <motion.div className="flex flex-col items-center justify-center h-full space-y-10 px-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={mobileLinkVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <a
                    href={item.href}
                    className="text-4xl font-extrabold text-gray-900 hover:text-orange-600 transition-colors block p-4"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
              <motion.div
                variants={mobileLinkVariants}
                initial="closed"
                animate="open"
                exit="closed"
                transition={{ delay: navItems.length * 0.1, duration: 0.5 }}
                className="pt-8"
              >
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center px-10 py-4 text-xl font-bold rounded-full shadow-xl text-white bg-orange-600 hover:bg-orange-700 transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default ConsultantCoachHeader;


const DynamicLogo: React.FC<{ formData: StoreForm; isScrolled: boolean }> = ({
  formData,
  isScrolled,
}) => {
  const { slug, name, logoUrl } = formData;
  const homeLink = `/site/${slug}`;
  const displayName = name || "Flourish Johnson";

  return (
    <a
      href={homeLink}
      className="flex items-center space-x-3 group transition-transform hover:scale-[1.02]"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={displayName}
          width={120}
          height={40}
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/120x40/EA580C/FFFFFF?text=${displayName
              .substring(0, 4)
              .toUpperCase()}`;
          }}
          className={`object-contain transition-all duration-300 ${
            isScrolled ? "h-8" : "h-10"
          }`}
        />
      ) : (
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-orange-600 text-white font-bold ${
            isScrolled ? "text-lg" : "text-xl"
          }`}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name beside logo */}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-extrabold tracking-tight transition-all duration-300 ${
            isScrolled ? "text-xl" : "text-2xl"
          }`}
        >
          <span className="text-orange-600">{displayName.split(" ")[0]}</span>{" "}
          <span className="text-gray-900">{displayName.split(" ")[1] || ""}</span>
        </span>
        <span
          className={`text-sm font-medium text-gray-500 ${
            isScrolled ? "opacity-90" : "opacity-70"
          }`}
        >
          Consultant & Coach
        </span>
      </div>
    </a>
  );
};
