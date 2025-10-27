"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  SparklesIcon, // Added an icon for the CTA
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

// --- Dynamic Logo Component (Enhanced) ---
const DynamicLogo: React.FC<{ formData: StoreForm; isScrolled: boolean }> = ({
  formData,
  isScrolled,
}) => {
  const { slug, name, logoUrl } = formData;
  const homeLink = `/site/${slug}`;
  // Default name if none is provided
  const defaultName = "Flourish";
  const displayName = name && name.trim().length > 0 ? name : defaultName;
  const nameParts = displayName.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[1] || "";

  return (
    <a
      href={homeLink}
      className="flex items-center space-x-2.5 group transition-transform hover:scale-[1.02]"
      aria-label="Home"
    >
      {/* Logo/Initials Container */}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={displayName}
          width={120}
          height={40}
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/120x40/EA580C/FFFFFF?text=${firstName.substring(
              0,
              4
            ).toUpperCase()}`;
          }}
          className={`object-contain transition-all duration-300 rounded-full ${
            isScrolled ? "h-8" : "h-10"
          }`}
        />
      ) : (
        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-orange-600 text-white font-bold transition-all duration-300 ${
            isScrolled ? "text-lg w-8 h-8" : "text-xl w-10 h-10"
          }`}
        >
          {firstName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name beside logo */}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-extrabold tracking-tight transition-all duration-300 ${
            isScrolled ? "text-lg" : "text-xl md:text-2xl"
          }`}
        >
          <span className="text-gray-900">{firstName}</span>{" "}
          <span className="text-orange-600">{lastName}</span>
        </span>
        <span
          className={`text-xs font-medium text-gray-500 transition-all duration-300 ${
            isScrolled ? "opacity-100 h-auto" : "opacity-0 h-0 md:opacity-100 md:h-auto"
          }`}
        >
          {/* Professional Coach */}
        </span>
      </div>
    </a>
  );
};


const navItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const mobileMenuVariants = {
  closed: {
    opacity: 0,
    scale: 0.98,
    transition: { when: "afterChildren" },
  },
  open: {
    opacity: 1,
    scale: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.06 },
  },
};

const mobileLinkVariants = {
  closed: { opacity: 0, y: 10 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45 },
  }),
};

// --- Main Header Component ---
const ConsultantCoachHeader: React.FC<HeaderProps> = ({ storeFormData }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 80); // Increased scroll threshold for a more dramatic change
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    // Lock scrolling when mobile menu is open
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [handleScroll, mobileMenuOpen]);

  const navItems = [
    { label: "Home", href: "#hero" },
    { label: "Expertise", href: "#services" }, // Changed to Expertise
    { label: "Method", href: "#about" },       // Changed to Method
    { label: "Success Stories", href: "#testimonials" }, // Changed to Success Stories
    { label: "Book Now", href: "#contact" },         // CTA link
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-2xl backdrop-blur-lg border-b border-orange-100"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-16" : "h-24" // Larger initial height for impact
          }`}
        >
          {/* Logo */}
          <DynamicLogo formData={storeFormData} isScrolled={isScrolled} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
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
                  className={`text-base font-semibold relative group py-2 transition-colors duration-300 ${
                    isScrolled
                      ? "text-gray-700 hover:text-orange-600"
                      : "text-gray-800 hover:text-orange-600"
                  }`}
                >
                  {item.label}
                  {/* Underline hover effect */}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[3px] w-0 bg-orange-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </a>
              </motion.div>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* CTA Button (Outside Nav Links for prominence) */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <a
                href="#contact"
                className="inline-flex items-center px-6 py-3 text-base font-bold rounded-full shadow-xl text-white bg-orange-600 ring-4 ring-orange-300/50 hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 group"
              >
                Start Your Journey
                <SparklesIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:rotate-12" />
              </a>
            </motion.div>

            {/* Mobile Toggle */}
            <div className="md:hidden z-50">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-3 rounded-full text-gray-800 transition-colors shadow-lg border ${
                  mobileMenuOpen
                    ? "bg-white border-gray-200"
                    : "bg-orange-50/80 border-orange-200 hover:bg-orange-100"
                }`}
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
            // Increased backdrop blur and changed background for better visual appeal
            className="md:hidden fixed top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-3xl origin-top-right z-40"
          >
            <motion.div className="flex flex-col items-center justify-center h-full space-y-8 px-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={mobileLinkVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <a
                    href={item.href}
                    className="text-4xl font-extrabold text-gray-900 hover:text-orange-600 transition-colors block p-4 tracking-tight"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
              {/* The main CTA is now the last link in the mobile nav */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default ConsultantCoachHeader;