"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon, // Added for a cart/booking link
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '../../../../../contexts/ContextProvider'; // Assuming this provides cart and other global states

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

interface HeaderProps {
  storeFormData: any;
}

const Header: React.FC<HeaderProps> = ({ storeFormData }) => {
  const { cartItems } = useStateContext(); // Assuming you have a cartItems state for count
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fallback colors from storeFormData or default Tailwind colors
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // teal-600
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // orange-500
  const textColor = scrolled ? 'text-gray-800 dark:text-gray-100' : 'text-white';
  const logoTextColor = scrolled ? 'text-gray-900 dark:text-gray-100' : 'text-white';

  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'featured', label: 'Packages' }, // Changed 'Featured' to 'Packages' for clarity
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQs' }, // Changed 'FAQ' to 'FAQs'
    { id: 'blog', label: 'Blog', href: `/${storeFormData.slug}/blog` }, // Added a blog link
    { id: 'contact', label: 'Contact', href: `/${storeFormData.slug}/contact` }, // Added a contact link
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80); // Increased scroll threshold slightly
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    router.events?.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${storeFormData.slug}/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  if (!storeFormData) {
    return (
      <header className="fixed w-full z-50 top-0 left-0 bg-gray-900/80 backdrop-blur-md h-20 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading header...</p>
      </header>
    );
  }

  return (
    <header className="fixed w-full z-50 top-0 left-0" style={{ '--primary': primaryColor, '--secondary': secondaryColor } as React.CSSProperties}>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }} // Spring animation for a smoother feel
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-lg'
            : 'bg-transparent'
        } py-4`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Link href={`/${storeFormData.slug}`} className="flex items-center space-x-2 relative z-20">
              {storeFormData.logoUrl ? (
                <Image
                  src={storeFormData.logoUrl}
                  loader={loader}
                  alt={storeFormData.name}
                  width={140} // Slightly larger logo
                  height={50}
                  className="object-contain"
                />
              ) : (
                <span className={`text-3xl font-extrabold ${logoTextColor}`}>
                  {storeFormData.name}
                </span>
              )}
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6 relative z-10">
            {sections.map(({ id, label, href }) => (
              <Link
                key={id}
                href={href || `#${id}`} // Use href if provided, otherwise scroll to ID
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                  ${textColor}
                  ${scrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'hover:bg-white/20'}
                  ${currentPath === (href || `/#${id}`) || (currentPath === `/${storeFormData.slug}` && id === 'hero')
                    ? 'font-bold bg-white/20 dark:bg-gray-700' // More subtle active state
                    : ''
                  }
                `}
                style={{
                  color: scrolled ? primaryColor : 'white', // Text color changes on scroll
                  borderColor: scrolled ? 'transparent' : 'rgba(255,255,255,0.2)',
                  backgroundColor: scrolled && (currentPath === (href || `/#${id}`) || (currentPath === `/${storeFormData.slug}` && id === 'hero')) ? `${primaryColor}1A` : '', // Active background on scroll
                }}
              >
                {label}
                {/* Active link underline indicator */}
                {((currentPath === href && href) || (currentPath === `/${storeFormData.slug}` && id === 'hero')) && (
                  <motion.span
                    layoutId="underline"
                    className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
                    style={{ backgroundColor: scrolled ? primaryColor : secondaryColor }}
                  />
                )}
              </Link>
            ))}

            {/* Search and Cart/Booking Icon */}
            <div className="flex items-center space-x-4 ml-6">
              {/* Search */}
              <motion.button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`relative p-2 rounded-full transition-all duration-300 ${scrolled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/20'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MagnifyingGlassIcon className={`w-6 h-6 ${textColor}`} />
              </motion.button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative ml-2"
                  >
                    <input
                      type="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-full ${scrolled ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600' : 'bg-white/30 text-white placeholder-white border border-white/20'} focus:outline-none focus:ring-2`}
                      style={{ focusRingColor: primaryColor }}
                    />
                    <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-2.5 ${scrolled ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`} />
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Cart/Booking Link (replace with actual cart logic if needed) */}
              <Link href={`/${storeFormData.slug}/booking`} passHref>
                <motion.button
                  className="relative p-2 rounded-full transition-all duration-300"
                  style={{ backgroundColor: primaryColor }} // Primary color for action button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShoppingCartIcon className="w-6 h-6 text-white" />
                  {/* Optional: Cart item count badge */}
                  {cartItems && cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="lg:hidden relative z-20">
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className={`p-2 rounded-full transition-all duration-300 ${scrolled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/20'}`}
              style={{ color: scrolled ? primaryColor : 'white' }}
            >
              {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }} // Slide down slightly
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl z-40 flex flex-col items-center justify-center py-20"
            >
              <nav className="flex flex-col items-center space-y-8">
                {sections.map(({ id, label, href }) => (
                  <Link
                    key={id}
                    href={href || `#${id}`}
                    className="text-3xl font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    onClick={() => setMobileOpen(false)} // Close menu on click
                    style={{ color: primaryColor }} // Mobile links also use primary color
                  >
                    {label}
                  </Link>
                ))}
                {/* Mobile Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs mt-8">
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2"
                    style={{ focusRingColor: primaryColor }}
                  />
                  <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-3 text-gray-500 dark:text-gray-400" />
                </form>

                {/* Mobile Cart/Booking Button */}
                <Link href={`/${storeFormData.slug}/booking`} passHref>
                  <motion.button
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300 mt-6"
                    style={{ backgroundColor: secondaryColor, color: 'white' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Book Now
                    <ShoppingCartIcon className="w-5 h-5 ml-2" />
                  </motion.button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

export default Header;