"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  ChevronDownIcon, // Added an icon for the dropdown/Our Team
} from "@heroicons/react/24/outline";

// --- Types ---
interface StoreForm {
  slug: string;
  name: string;
  logoUrl?: string; // We'll assume this is the URL for the Africa/ACPS logo
}

interface HeaderProps {
  storeFormData: StoreForm;
}

// --- Constants (Based on Image Colors: Maroon/Dark Red and Gray) ---
const PRIMARY_COLOR_CLASS = "text-[#800000]"; // Deep Maroon/Dark Red (Approximation)
const HOVER_COLOR_CLASS = "text-[#600000]"; // Darker Maroon for hover
const ACCENT_COLOR_CLASS = "text-gray-900";

// --- Dynamic Logo Component (Adapted to match image) ---
const DynamicLogo: React.FC<{ formData: StoreForm; isScrolled: boolean }> = ({
  formData,
  isScrolled,
}) => {
  const { slug, name, logoUrl } = formData;
  const homeLink = `/site/${slug}`;
  const defaultName = "The African Centre for Public Speaking";
  const displayName = name && name.trim().length > 0 ? name : defaultName;
  const nameLines = displayName.split(" for "); // Splitting for a two-line layout similar to the image

  const topName = nameLines[0]; // "The African Centre"
  const bottomName = nameLines[1] ? `for ${nameLines[1]}` : ""; // "for Public Speaking"

  return (
    <a
      href={homeLink}
      className="flex items-start space-x-3 group transition-transform hover:scale-[1.01] max-w-xs"
      aria-label="Home"
    >
      {/* Logo Container (Assumes a placeholder/actual logo URL) */}
      <img
        src={logoUrl || "/placeholder-logo.png"} // Use provided logoUrl or a placeholder
        alt={displayName}
        width={isScrolled ? 48 : 60}
        height={isScrolled ? 48 : 60}
        className={`object-contain transition-all duration-300 ${
          isScrolled ? "h-12 w-12" : "h-16 w-16"
        }`}
      />

      {/* Name below the Logo in the image, but beside in this modern layout. 
          Adjusted to reflect the two-line text from the image, placed below the logo image itself 
          in the image's design. We'll use a responsive layout here. */}
      <div className="flex flex-col justify-center leading-tight">
        <span
          className={`font-semibold tracking-tight transition-all duration-300 ${ACCENT_COLOR_CLASS} ${
            isScrolled ? "text-lg" : "text-xl md:text-2xl"
          }`}
        >
          {topName}
        </span>
        <span
          className={`font-normal tracking-tight transition-all duration-300 ${
            isScrolled ? "text-sm text-gray-600" : "text-base text-gray-700"
          }`}
        >
          {bottomName}
        </span>
      </div>
    </a>
  );
};

// --- Framer Motion Variants (Kept for animation) ---
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

// --- Main Header Component (Renamed and Adapted) ---
const PublicSpeakingHeader: React.FC<HeaderProps> = ({ storeFormData }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [handleScroll, mobileMenuOpen]);

  // Navigation Items based on the image: Home, About, Services, Our Team (Dropdown), Contact
  const navItems = [
    { label: "Home", href: "#home", isDropdown: false },
    { label: "About", href: "#about", isDropdown: false },
    { label: "Services", href: "#services", isDropdown: false },
    { label: "Our Team", href: "#team", isDropdown: true }, // Indicates a dropdown
    { label: "Contact", href: "#contact", isDropdown: false },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-lg backdrop-blur-lg border-b border-gray-100"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-20" : "h-24" // Adjusted height
          }`}
        >
          {/* Logo */}
          <DynamicLogo formData={storeFormData} isScrolled={isScrolled} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -2 }}
                className="relative"
                onMouseEnter={() => item.isDropdown && setIsDropdownOpen(true)}
                onMouseLeave={() => item.isDropdown && setIsDropdownOpen(false)}
              >
                <a
                  href={item.href}
                  className={`flex items-center text-base font-medium relative group py-2 transition-colors duration-300 ${ACCENT_COLOR_CLASS} hover:${PRIMARY_COLOR_CLASS} ${
                    item.label === 'Home' ? PRIMARY_COLOR_CLASS : '' // Home is highlighted in the image
                  }`}
                >
                  {item.label}
                  {item.isDropdown && (
                    <ChevronDownIcon
                      className={`w-3 h-3 ml-1 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  )}
                  {/* Underline hover effect */}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-0 ${PRIMARY_COLOR_CLASS} rounded-full transition-all duration-300 group-hover:w-full`}
                  ></span>
                </a>
                
                {/* Simple Dropdown for 'Our Team' (Placeholder) */}
                {item.isDropdown && isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full -left-4 mt-2 w-48 bg-white shadow-xl rounded-lg py-2 border border-gray-100 z-50"
                  >
                    <a
                      href="#leadership"
                      className={`block px-4 py-2 text-sm ${ACCENT_COLOR_CLASS} hover:bg-gray-50 hover:${PRIMARY_COLOR_CLASS}`}
                    >
                      Leadership
                    </a>
                    <a
                      href="#advisors"
                      className={`block px-4 py-2 text-sm ${ACCENT_COLOR_CLASS} hover:bg-gray-50 hover:${PRIMARY_COLOR_CLASS}`}
                    >
                      Advisory Board
                    </a>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden z-50">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-3 rounded-full ${ACCENT_COLOR_CLASS} transition-colors shadow-lg border ${
                mobileMenuOpen
                  ? "bg-white border-gray-200"
                  : "bg-gray-50/80 border-gray-200 hover:bg-gray-100"
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
                    <XMarkIcon className={`h-6 w-6 ${PRIMARY_COLOR_CLASS}`} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Bars3BottomRightIcon className={`h-6 w-6 ${PRIMARY_COLOR_CLASS}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
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
            className="md:hidden fixed top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-3xl origin-top-right z-40"
          >
            <motion.div className="flex flex-col items-center justify-center h-full space-y-6 px-6 pt-24">
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
                    className={`text-3xl font-extrabold ${ACCENT_COLOR_CLASS} hover:${PRIMARY_COLOR_CLASS} transition-colors block p-3 tracking-tight ${
                       item.label === 'Home' ? PRIMARY_COLOR_CLASS : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PublicSpeakingHeader;