// File: components/site/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassCircleIcon,
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
  const primary = themeSettings.primaryColor || '#f97316'; // fallback to the banner’s orange
  const secondary = themeSettings.secondaryColor || '#3b82f6'; // fallback to the banner’s blue

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm transition-all">
      {/* Top Info Bar */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}1A`, color: primary }}
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
            <a href={`tel:${contactPhone}`} className="flex items-center hover:underline transition-colors">
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

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center space-x-6">
            <Link href={`/site/${slug}`} className="flex items-center space-x-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={140}
                  height={48}
                  className="object-contain"
                  loader={loader}
                />
              ) : (
                <span className="text-2xl font-bold text-gray-800 dark:text-white">{name}</span>
              )}
            </Link>

            <nav className="hidden lg:flex space-x-8 text-gray-700">
              {['Home', 'Shop', 'Categories'].map((label) => {
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
                    whileHover={{ y: -2 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Link
                      href={href}
                      className="relative text-base font-medium"
                    >
                      {label}
                      <span
                        className="absolute left-0 -bottom-1 h-0.5 bg-transparent transition-all"
                        style={{ width: '100%', backgroundColor: primary }}
                      />
                    </Link>
                    {/* Underline on hover */}
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

          {/* Search (Desktop Only) */}
          <div className="flex-1 mx-6 hidden lg:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm rounded-full py-2 px-4 pl-10 shadow-sm focus:outline-none focus:ring-2"
                style={{ boxShadow: 'none' }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${secondary}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Icons + Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1, color: primary }}
              className="text-gray-600 dark:text-gray-200 transition-colors"
              onClick={() => router.push(`/site/${slug}/profile`)}
              aria-label="Profile"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, color: primary }}
              className="relative text-gray-600 dark:text-gray-200 transition-colors"
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

            <button
              className="lg:hidden text-gray-600 dark:text-gray-200"
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="lg:hidden bg-white/95 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 overflow-hidden"
          >
            <div className="space-y-4">
              {['Home', 'Shop', 'Categories'].map((label) => {
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
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      href={href}
                      className="block text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-opacity-80 transition-colors"
                      style={{ color: '#444' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                    >
                      {label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
