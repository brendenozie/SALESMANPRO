'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';

// Helper for image loader
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleButtonRef = useRef<HTMLButtonElement>(null); // Ref for the toggle button

  // Destructure relevant fields with default empty objects for safety
  const {
    slug,
    name,
    logoUrl,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  // Fallback to emerald/blue if no colors are provided
  const primaryColor = themeSettings?.primaryColor || '#10B981';   // Emerald
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; // Blue

  // Handle outside clicks for closing search and mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close search if clicked outside
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
          !document.querySelector('.search-toggle-button')?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      // Close mobile menu if clicked outside, but not on the toggle button itself
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) &&
          !mobileMenuToggleButtonRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen, mobileMenuOpen]);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  // Handle body scroll locking when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // We’ll hide the header shadow when the page is at top,
  // and add a tiny shadow once you scroll down a bit.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Define navigation links as constants
  const navLinks = [
    { label: 'Home', href: `/site/${slug}` },
    { label: 'Shop', href: `/site/${slug}/ecommerceshoes/products` },
    { label: 'Categories', href: `/site/${slug}/ecommerceshoes/categories` },
  ];

  // Debounced search handler (simulate API call)
  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) { // Only search if query is at least 3 characters
        console.log('Performing search for:', query);
        // In a real application, you would dispatch an action or fetch data here
        // e.g., router.push(`/site/${slug}/ecommerceshoes/search?q=${query}`);
        // Or fetch suggestions and display them in a dropdown.
      }
    }, 300),
    [slug]
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    // Optionally close search or keep it open for new input
    // setSearchOpen(false);
  };

  const toggleMobileMenu = () => {
    const wasOpen = mobileMenuOpen; // Capture current state before updating
    setMobileMenuOpen((prev) => !prev);

    // When menu closes, return focus to the toggle button
    if (wasOpen) { // Check if it *was* open, meaning it's now closing
      mobileMenuToggleButtonRef.current?.focus(); // Use the ref for focus
    }
  };

  return (
    <>
      {/* Set CSS variables for dynamic colors and global styles */}
      <style jsx global>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        /* Style for the underline on hover for nav links */
        .nav-link-hover-underline a:hover + span {
          height: 2px;
        }
      `}</style>

      <header
        className={`
          fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-7xl 
          px-6 md:px-8 lg:px-16 py-4 
          bg-white/60 backdrop-blur-lg 
          ${scrolled ? 'shadow-lg' : 'shadow-none'} 
          rounded-b-3xl 
          z-50
          transition-shadow duration-300
        `}
      >
        <div className="flex items-center justify-between">
          {/* ===== LOGO + NAV ===== */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href={`/site/${slug}`} className="flex items-center" aria-label={`${name} home`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex items-center"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`${name} logo`}
                    width={100}
                    height={48}
                    className="object-contain w-16 h-16"
                    loader={imageLoader}
                  />
                ) : (
                  <span className="text-gray-900 text-2xl font-bold">{name}</span>
                )}
              </motion.div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex space-x-10">
              {navLinks.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={item.href}
                    className="relative font-medium text-base text-gray-900 hover:text-[var(--primary-color)] nav-link-hover-underline"
                    style={{ transition: 'color 0.2s ease' }}
                  >
                    {item.label}
                    {/* Bottom-border highlight on hover */}
                    <span
                      className="absolute left-0 -bottom-1 h-0.5 bg-transparent w-full transition-all"
                      style={{ backgroundColor: `var(--primary-color)` }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* ===== SEARCH + ICONS + MOBILE TOGGLE ===== */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, color: primaryColor }}
                className="transition-colors text-gray-900 search-toggle-button" // Added class for click outside
                onClick={() => setSearchOpen((p) => !p)}
                aria-label="Toggle search input"
                aria-expanded={searchOpen}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </motion.button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="
                      absolute right-0 mt-2 w-64
                      bg-white rounded-xl shadow-lg
                      ring-1 ring-gray-200 overflow-hidden z-50
                      flex items-center
                    "
                    ref={searchInputRef}
                  >
                    <input
                      type="search"
                      autoFocus
                      placeholder="Search products..."
                      className="w-full py-2 px-4 text-gray-800 placeholder-gray-400 text-sm focus:outline-none"
                      value={searchQuery}
                      onChange={onSearchInputChange}
                      aria-label="Search products"
                    />
                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Clear search"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <motion.button
              whileHover={{ scale: 1.1, color: primaryColor }}
              className="transition-colors text-gray-900"
              onClick={() => router.push(`/site/${slug}/ecommerceshoes/profile`)}
              aria-label="Profile page"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1, color: primaryColor }}
              className="relative transition-colors text-gray-900"
              onClick={() => router.push(`/site/${slug}/ecommerceshoes/checkout`)}
              aria-label={`Shopping cart with ${cart.length} items`}
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden transition-colors text-gray-900 mobile-menu-toggle-button"
              onClick={toggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              ref={mobileMenuToggleButtonRef} // Attach ref to the button
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3BottomLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE SLIDE-DOWN MENU ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="
              fixed top-0 left-0 w-full
              bg-white/90 backdrop-blur-lg
              ring-1 ring-gray-200
              rounded-b-3xl
              overflow-hidden z-40
              md:hidden
            "
            id="mobile-menu"
            ref={mobileMenuRef}
          >
            <div className="pt-20 pb-8 px-6 space-y-6">
              {/* Nav Links */}
              {navLinks.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="block text-lg font-medium text-gray-900 hover:text-[var(--primary-color)]"
                    style={{ transition: 'color 0.2s ease' }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Separator */}
              <div className="border-t border-gray-200" />

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((s: any) => (
                  <a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="capitalize text-gray-900 transition-colors"
                    style={{ transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = secondaryColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
                  >
                    {s.channel}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}