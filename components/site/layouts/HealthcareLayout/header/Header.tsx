// File: components/site/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Ensure Next.js Image is properly configured
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3BottomRightIcon, // More modern icon for menu
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon, // Icon for booking
} from '@heroicons/react/24/solid'; // Using solid icons for prominence
import { useStoreContext } from '@/contexts/StoreContext';

// You might not need this customLoader if Next.js Image is properly configured for your deployment
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Default values for cases where storeFormData might be incomplete
const DEFAULT_NAME = "CareClinic";
const DEFAULT_SLUG = "care-clinic";
const DEFAULT_LOGO_URL = "/path/to/default-logo.png"; // Provide a path to a default logo image
const DEFAULT_CONTACT_EMAIL = "info@careclinic.com";
const DEFAULT_CONTACT_PHONE = "+1 (555) 123-4567";
const DEFAULT_SOCIAL_LINKS = [
  { channel: 'facebook', url: 'https://facebook.com/yourclinic' },
  { channel: 'instagram', url: 'https://instagram.com/yourclinic' },
];
const DEFAULT_PRIMARY_COLOR = '#0ea5e9'; // sky-500
const DEFAULT_SECONDARY_COLOR = '#8b5cf6'; // violet-500

export default function Header() {
  // Assuming StoreContext provides comprehensive data
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    name = DEFAULT_NAME,
    slug = DEFAULT_SLUG,
    logoUrl = DEFAULT_LOGO_URL,
    contactEmail = DEFAULT_CONTACT_EMAIL,
    contactPhone = DEFAULT_CONTACT_PHONE,
    socialLinks = DEFAULT_SOCIAL_LINKS,
    themeSettings,
  } = storeFormData || {}; // Ensure storeFormData is not null/undefined

  // Use dynamic colors from themeSettings or fallbacks
  const primary = themeSettings?.primaryColor || DEFAULT_PRIMARY_COLOR;
  const secondary = themeSettings?.secondaryColor || DEFAULT_SECONDARY_COLOR;

  // Change header background, shadow, and text color on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80); // Increased scroll threshold for more dramatic change
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: `/${slug}` },
    { label: 'Services', href: `/${slug}/services` },
    { label: 'Doctors', href: `/${slug}/doctors` },
    { label: 'About Us', href: `/${slug}/about` }, // Changed to 'About Us' for clarity
    { label: 'FAQs', href: `/${slug}/faqs` }, // Added FAQs to main nav
    { label: 'Contact', href: `/${slug}/contact` },
  ];

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.2 } },
  };

  const mobileMenuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
    exit: { x: '100%', opacity: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-xl py-3 border-b border-gray-100 dark:border-gray-800' // Added backdrop blur and border
          : 'bg-transparent py-5' // Slightly more padding when not scrolled
      }`}
    >
      {/* Top Info Bar - Enhanced with motion for subtlety */}
      <motion.div
        className={`hidden md:flex justify-center items-center text-sm font-medium transition-all duration-300 ${
            scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto py-2'
        }`}
        style={{ backgroundColor: `${primary}15`, color: primary }} // More subtle background color
      >
        <div className="max-w-7xl w-full flex justify-between items-center px-6">
            <div className="flex items-center space-x-6">
                {contactEmail && (
                    <motion.a
                        href={`mailto:${contactEmail}`}
                        className="flex items-center space-x-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                    >
                        <EnvelopeIcon className="w-4 h-4" /> <span>{contactEmail}</span>
                    </motion.a>
                )}
                {contactPhone && (
                    <motion.a
                        href={`tel:${contactPhone}`}
                        className="flex items-center space-x-2 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                    >
                        <PhoneIcon className="w-4 h-4" /> <span>{contactPhone}</span>
                    </motion.a>
                )}
            </div>
            <div className="flex space-x-4">
                {socialLinks.map((s) => (
                    <motion.a
                        key={s.channel}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener" // Added noopener for security
                        whileHover={{ scale: 1.2, color: secondary }} // More distinct hover for social icons
                        className="capitalize text-sm transition-colors"
                    >
                        {s.channel} {/* Consider using actual icons for social links */}
                    </motion.a>
                ))}
            </div>
        </div>
      </motion.div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo / Brand */}
        <motion.div
          className="flex items-center space-x-3 cursor-pointer select-none" // Added select-none
          onClick={() => router.push(`/${slug}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {logoUrl !== DEFAULT_LOGO_URL ? ( // Check if a custom logo is provided
            <Image
              src={logoUrl}
              alt={name}
              width={56} // Slightly larger logo
              height={56}
              className="rounded-full shadow-lg border border-gray-100 dark:border-gray-700" // Added subtle border/shadow
              loader={loader} // Only if you have a custom loader, otherwise remove
            />
          ) : (
            <motion.span
              className="text-3xl font-extrabold bg-clip-text text-transparent" // Larger font
              style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {name}
            </motion.span>
          )}
        </motion.div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-8 font-semibold text-lg text-gray-700 dark:text-gray-200"> {/* Increased font size */}
          {navItems.map(({ label, href }) => (
            <Link key={label} href={href}
                className="relative group hover:text-gray-900 dark:hover:text-white transition-colors duration-200" // Group for underline
            >
                {label}
                <motion.span
                    className="absolute left-0 bottom-[-8px] h-1 rounded-full bg-gradient-to-r" // Thicker, rounded underline
                    style={{ backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                />
            </Link>
          ))}
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0px 8px 20px rgba(0,0,0,0.2)" }} // More pronounced hover effect
            whileTap={{ scale: 0.95 }}
            className="ml-6 flex items-center bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all duration-300
                       hover:from-teal-600 hover:to-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400"
            onClick={() => router.push(`/${slug}/book`)}
            aria-label="Book your appointment"
          >
            <CalendarDaysIcon className="w-5 h-5 mr-2" /> Book Appointment
          </motion.button>
        </nav>

        {/* Mobile Menu Toggle */}
        <motion.button
          className="md:hidden text-gray-700 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bars3BottomRightIcon className="w-8 h-8" /> {/* Larger icon */}
        </motion.button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl p-8 flex flex-col justify-between" // Higher z-index, wider for better usability
          >
            <div className="flex justify-between items-center mb-10">
              {logoUrl !== DEFAULT_LOGO_URL ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={60}
                  height={60}
                  className="rounded-full shadow-lg"
                  // loader={loader}
                />
              ) : (
                <span
                  className="text-3xl font-extrabold bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
                >
                  {name}
                </span>
              )}
              <motion.button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ rotate: 90 }} // X-mark rotates on close
              >
                <XMarkIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>

            <nav className="flex flex-col space-y-6 flex-grow"> {/* Flex-grow to push button to bottom */}
              {navItems.map(({ label, href }) => (
                <Link key={label} href={href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-800 dark:text-gray-100 text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 py-2 border-b border-gray-100 dark:border-gray-800 last:border-b-0" // Larger text, border
                >
                    {label}
                </Link>
              ))}
            </nav>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-10 w-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-blue-600 text-white px-6 py-4 rounded-full font-bold shadow-lg transition-all duration-300
                         hover:from-teal-600 hover:to-blue-700"
              onClick={() => {
                router.push(`/${slug}/book`);
                setMobileMenuOpen(false);
              }}
              aria-label="Book appointment from mobile menu"
            >
              <CalendarDaysIcon className="w-6 h-6 mr-3" /> Book Appointment
            </motion.button>

            {/* Mobile Contact Info (optional, but good for mobile) */}
            <div className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm space-y-2">
                {contactPhone && (
                    <a href={`tel:${contactPhone}`} className="flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <PhoneIcon className="w-5 h-5" /> <span>{contactPhone}</span>
                    </a>
                )}
                {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="flex items-center justify-center space-x-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <EnvelopeIcon className="w-5 h-5" /> <span>{contactEmail}</span>
                    </a>
                )}
            </div>

          </motion.aside>
        )}
      </AnimatePresence>
    </motion.header>
  );
}