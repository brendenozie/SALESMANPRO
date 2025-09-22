'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { storeFormData } = useStoreContext();
  // Ensure default values are consistent with our light theme's primary accent
  const { name, logoUrl, themeSettings } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#00A880'; // Using #00A880 (emerald green) as our primary light-mode accent

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'benefits', label: 'Why Us' }, // Added from BenefitsSection
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50); // Increased scroll threshold slightly
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 py-4 ${
          scrolled
            ? 'bg-white/90 shadow-lg ring-1 ring-gray-200 backdrop-blur-md' // Light background, subtle shadow & ring
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-2 flex items-center justify-between"> {/* Adjusted vertical padding */}
          {/* Logo or Brand */}
          <Link href="#hero" className="flex items-center gap-3 group">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={`${name || 'Brand'} Logo`} // Improved alt text
                width={48} // Slightly larger logo
                height={48}
                className="rounded-full object-cover border-2 border-emerald-300 shadow-sm transition-all group-hover:scale-105" // Lighter ring, subtle shadow, hover effect
                loader={loader}
              />
            )}
            <span
              className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors duration-300" // Dark text, emerald hover
            >
              {name || 'Your Brand'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7"> {/* Increased gap for cleaner look */}
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 relative group" // Dark link text, hover to darker
              >
                {item.label}
                <span
                  style={{ backgroundColor: primaryColor }}
                  className="absolute bottom-0 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full" // Underline on hover
                ></span>
              </a>
            ))}
            <motion.a
              href="#booking"
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 18px ${primaryColor}66`, // More prominent hover shadow with primary color
              }}
              transition={{ type: 'spring', stiffness: 250 }}
              className="ml-6 px-6 py-2.5 rounded-full font-semibold text-white text-md shadow-lg" // Larger, bolder button
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, #10B981)`, // Primary color gradient
              }}
            >
              Book Now
            </motion.a>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gray-800 hover:text-gray-900 transition-colors" // Dark icon for light mode
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-8 w-8" /> {/* Slightly larger icon */}
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-[100] w-3/4 max-w-sm bg-white/95 backdrop-blur-xl p-8 flex flex-col shadow-2xl border-l border-gray-100" // Light background, stronger shadow, border
          >
            <div className="flex justify-between items-center mb-10"> {/* Increased margin */}
              <Link href="#hero" className="flex items-center space-x-3">
                {logoUrl && (
                  <Image
                    src={logoUrl}
                    alt={`${name || 'Brand'} Logo`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-emerald-300" // Light border
                    loader={loader}
                  />
                )}
                <span className="text-xl font-bold text-gray-900">{name || 'Your Brand'}</span> {/* Dark text */}
              </Link>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="text-gray-600 hover:text-gray-800 transition-colors"> {/* Dark close icon */}
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            <nav className="flex flex-col space-y-7"> {/* Increased spacing */}
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-800 text-lg font-semibold hover:text-emerald-600 transition-colors block py-1" // Darker text, larger font, primary hover
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <motion.a
              href="#booking"
              onClick={() => setIsOpen(false)}
              className="mt-auto text-center py-4 rounded-full font-bold text-white text-lg shadow-xl" // Larger, bolder button
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, #10B981)`, // Consistent primary gradient
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 20px ${primaryColor}66`, // Stronger hover shadow
              }}
              transition={{ type: 'spring', stiffness: 250 }}
            >
              Book Your Session
            </motion.a>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}