'use client';

import React, { useState, useEffect } from 'react';
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
import { useStateContext } from '../../../../../contexts/ContextProvider';
import { useStoreContext } from '../../../../../contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const {
    slug,
    name,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings.primaryColor || '#f97316';  
  const secondary = themeSettings.secondaryColor || '#3b82f6'; 

  // Listen for scroll to toggle solid header background
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white dark:bg-gray-900 backdrop-filter backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      {/* Top Info Bar (only on desktop) */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{
          background: `linear-gradient(90deg, ${primary}1A, ${secondary}1A)`,
          color: primary,
        }}
      >
        <div className="flex items-center space-x-6">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center uppercase hover:underline transition-colors"
            >
              <span className="mr-1">📧</span>
              <span>{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center hover:underline transition-colors"
            >
              <span className="mr-1">📞</span>
              <span>{contactPhone}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks.map((s: any) => (
            <a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="capitalize transition-colors"
              style={{ color: primary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 md:h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center space-x-8">
            <Link href={`/site/${slug}`} className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex items-center"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name}
                    width={100}
                    height={48}
                    className="object-contain w-16 h-16"
                    loader={loader}
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-800 dark:text-white">
                    {name}
                  </span>
                )}
              </motion.div>
            </Link>

            <nav className="hidden lg:flex space-x-8">
              {['Home', 'Shop', 'Categories'].map((label, idx) => {
                const href =
                  label === 'Home'
                    ? `/site/${slug}`
                    : label === 'Shop'
                    ? `/site/${slug}/products`
                    : `/site/${slug}/categories`;

                return (
                  <motion.div
                    key={label}
                    initial={{ y: 0 }}
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Link
                      href={href}
                      className={`relative text-base font-medium ${
                        scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'
                      }`}
                    >
                      {label}
                      <span
                        className="absolute left-0 -bottom-1 h-0.5 bg-transparent transition-all"
                        style={{ width: '100%', backgroundColor: primary }}
                      />
                    </Link>
                    <style jsx>{`
                      a:hover + span {
                        background-color: ${primary};
                        height: 2px;
                      }
                    `}</style>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Search + User + Cart + Mobile Toggle */}
          <div className="flex items-center space-x-6">
            {/* Search Icon */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1, color: primary }}
                className={`transition-colors ${
                  scrolled ? 'text-gray-600 dark:text-gray-200' : 'text-white'
                }`}
                aria-label="Search"
                onClick={() => setSearchOpen((prev) => !prev)}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </motion.button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-8 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20"
                  >
                    <input
                      type="search"
                      autoFocus
                      placeholder="Search products..."
                      className="w-full bg-transparent text-gray-800 dark:text-gray-100 text-sm rounded-none py-2 px-4 focus:outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Icon */}
            <motion.button
              whileHover={{ scale: 1.1, color: primary }}
              className={`transition-colors ${
                scrolled ? 'text-gray-600 dark:text-gray-200' : 'text-white'
              }`}
              onClick={() => router.push(`/site/${slug}/profile`)}
              aria-label="Profile"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            {/* Cart Icon */}
            <motion.button
              whileHover={{ scale: 1.1, color: primary }}
              className={`relative transition-colors ${
                scrolled ? 'text-gray-600 dark:text-gray-200' : 'text-white'
              }`}
              onClick={() => router.push(`/site/${slug}/checkout`)}
              aria-label="Cart"
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
              className={`lg:hidden transition-colors ${
                scrolled ? 'text-gray-600 dark:text-gray-200' : 'text-white'
              }`}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3BottomLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide‐Down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`lg:hidden ${
              scrolled
                ? 'bg-white dark:bg-gray-900'
                : `bg-gradient-to-b from-transparent to-white/90 dark:to-gray-800/90`
            } border-t border-gray-200 dark:border-gray-700 px-6 py-6`}
            style={{ backdropFilter: 'saturate(180%) blur(10px)' }}
          >
            <nav className="space-y-5">
              {['Home', 'Shop', 'Categories'].map((label, idx) => {
                const href =
                  label === 'Home'
                    ? `/site/${slug}`
                    : label === 'Shop'
                    ? `/site/${slug}/products`
                    : `/site/${slug}/categories`;

                return (
                  <motion.div
                    key={label}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Link
                      href={href}
                      className="block text-lg font-medium transition-colors"
                      style={{
                        color: scrolled ? '#444' : 'white',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = scrolled ? '#444' : 'white')
                      }
                    >
                      {label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((s: any) => (
                <a
                  key={s.channel}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`capitalize transition-colors ${
                    scrolled ? 'text-gray-600 dark:text-gray-200' : 'text-white'
                  }`}
                  onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = scrolled ? primary : 'white')
                  }
                >
                  {s.channel}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
