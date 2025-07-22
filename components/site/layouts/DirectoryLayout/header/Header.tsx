'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon, // Changed to MagnifyingGlassIcon for consistency with Hero
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import { useStateContext } from '../../../../../contexts/ContextProvider';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const { slug, name, logoUrl, contactEmail, contactPhone, socialLinks, themeSettings } = storeFormData;
  // Use more vibrant defaults if themeSettings are not provided, to match the hero
  const primaryColor = themeSettings?.primaryColor || '#f97316'; // Orange 500-600
  const secondaryColor = themeSettings?.secondaryColor || '#14b8a6'; // Teal 500-600

  const navItems = [
    { label: 'Home', href: `/site/${slug}` },
    { label: 'Listings', href: `/site/${slug}/listings` },
    { label: 'Categories', href: `/site/${slug}/categories` },
    // Optionally add 'About Us', 'Contact Us', or 'Add Listing'
    // { label: 'Add Listing', href: `/site/${slug}/add-listing` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg bg-white dark:bg-gray-900 transition-all duration-300">
      {/* Info Bar - Dynamic background and text for better visual appeal */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 text-sm text-white" style={{ backgroundColor: primaryColor }}>
        <div className="flex items-center space-x-6">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="hover:underline flex items-center group">
              <span className="text-white/80 group-hover:text-white transition-colors duration-200">📧 <span className="ml-1">{contactEmail}</span></span>
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="hover:underline flex items-center group">
              <span className="text-white/80 group-hover:text-white transition-colors duration-200">📞 <span className="ml-1">{contactPhone}</span></span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks.map((s) => (
            <a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="capitalize transition-colors duration-200 text-white/80 hover:text-white"
              // Removed inline style onMouseEnter/Leave for a cleaner approach with Tailwind classes
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Nav */}
          <div className="flex items-center space-x-8"> {/* Increased space-x for better separation */}
            <div onClick={() => router.push(`/site/${slug}`)} className="cursor-pointer flex-shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || "Site Logo"} // Add fallback alt text
                  width={120} // Slightly larger logo
                  height={40} // Maintain aspect ratio
                  className="object-contain max-h-10 sm:max-h-11 lg:max-h-12" // Responsive height
                  loader={loader}
                  priority // Prioritize loading for LCP
                />
              ) : (
                <span className="text-2xl font-extrabold text-gray-800 dark:text-white whitespace-nowrap">{name || "Your Directory"}</span> // Larger and bolder default name
              )}
            </div>
            <nav className="hidden lg:flex space-x-8 font-semibold text-gray-700 dark:text-gray-200"> {/* Stronger font-weight */}
              {navItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="relative group transition-colors duration-300 pb-1" // Added group and padding for underline
                  style={{ color: '#4a5568' }} // Default text-gray-700 (dark mode needs adjustment)
                  onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4a5568')} // Reset to original color
                >
                  {label}
                  {/* Animated Underline */}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: secondaryColor }} // Use secondary color for underline
                  ></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar - More integrated and prominent for directory context */}
          <div className="hidden lg:flex flex-1 mx-8 justify-center"> {/* Centered search in available space */}
            <div className="relative w-full max-w-lg"> {/* Increased max-width */}
              <input
                type="search"
                placeholder="Search for businesses, services..." // More specific placeholder
                className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 pl-12 pr-4 py-2.5 text-base shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none focus:ring-opacity-70" // Slightly larger, different background
                style={{ caretColor: primaryColor, borderColor: secondaryColor }} // Dynamic border color on focus
                // Added focus state for ring color
                onFocus={(e) => e.currentTarget.style.setProperty('--tw-ring-color', secondaryColor)}
                onBlur={(e) => e.currentTarget.style.removeProperty('--tw-ring-color')}
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" /> {/* Icon left-aligned, slightly larger */}
            </div>
          </div>

          {/* Icons and Mobile Toggle */}
          <div className="flex items-center space-x-5"> {/* Increased space-x */}
            <motion.button
              whileHover={{ scale: 1.1, color: primaryColor }} // Animate color on hover
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(`/site/${slug}/profile`)}
              className="text-gray-600 dark:text-gray-300 transition-colors duration-200"
              aria-label="User Profile"
            >
              <UserIcon className="h-7 w-7" /> {/* Larger icon */}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, color: primaryColor }} // Animate color on hover
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(`/site/${slug}/checkout`)}
              className="relative text-gray-600 dark:text-gray-300 transition-colors duration-200"
              aria-label="Shopping Cart"
            >
              <ShoppingBagIcon className="h-7 w-7" /> {/* Larger icon */}
              {cart.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white dark:ring-gray-900" // Ring for better visibility
                >
                  {cart.length}
                </motion.span>
              )}
            </motion.button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ focusRingColor: primaryColor }} // Dynamic ring color
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7" /> // Larger icon
              ) : (
                <Bars3BottomLeftIcon className="h-7 w-7" /> // Larger icon
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Enhanced with Framer Motion for smooth animation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="lg:hidden px-4 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md"
        >
          <nav className="space-y-3">
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors py-2 px-3 rounded-md" // Added padding and rounded corners
                style={{ color: '#4a5568' }} // Default text-gray-700
                onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4a5568')} // Reset to original color
              >
                {label}
              </Link>
            ))}
            {/* Mobile Search Bar - if needed in mobile menu */}
            <div className="relative mt-4 block lg:hidden">
              <input
                type="search"
                placeholder="Search..."
                className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 pl-10 pr-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-offset-1 focus:outline-none"
                style={{ caretColor: primaryColor }}
                // Added focus state for ring color
                onFocus={(e) => e.currentTarget.style.setProperty('--tw-ring-color', secondaryColor)}
                onBlur={(e) => e.currentTarget.style.removeProperty('--tw-ring-color')}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </nav>
        </motion.div>
      )}
    </header>
  );
}