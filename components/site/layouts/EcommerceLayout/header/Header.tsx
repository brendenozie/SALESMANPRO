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
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Destructure relevant fields
  const {
    slug,
    name,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  // Fallback to emerald/blue if no colors are provided
  const primary = themeSettings.primaryColor || '#10B981';    // Emerald
  const secondary = themeSettings.secondaryColor || '#3B82F6'; // Blue

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

  // Text color (dark) vs. Icon color (dark) – always dark, because our hero background is white behind the header
  const textColor = 'text-gray-900';
  const iconColor = 'text-gray-900';

  return (
    <>
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
                  <span className={`${textColor} text-2xl font-bold`}>{name}</span>
                )}
              </motion.div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex space-x-10">
              {[
                { label: 'Home', href: `/site/${slug}` },
                { label: 'Shop', href: `/site/${slug}/ecommerce/products` },
                { label: 'Categories', href: `/site/${slug}/ecommerce/categories` },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={item.href}
                    className={`relative font-medium text-base ${textColor} hover:text-${primary}`}
                  >
                    {item.label}
                    {/* Bottom‐border highlight on hover */}
                    <span
                      className="absolute left-0 -bottom-1 h-0.5 bg-transparent w-full transition-all"
                      style={{ backgroundColor: primary }}
                    />
                    <style jsx>{`
                      a:hover + span {
                        height: 2px;
                      }
                    `}</style>
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
                whileHover={{ scale: 1.1, color: primary }}
                className={`transition-colors ${iconColor}`}
                onClick={() => setSearchOpen((p) => !p)}
                aria-label="Search"
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
                    "
                  >
                    <input
                      type="search"
                      autoFocus
                      placeholder="Search products..."
                      className="w-full py-2 px-4 text-gray-800 placeholder-gray-400 text-sm focus:outline-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <motion.button
              whileHover={{ scale: 1.1, color: primary }}
              className={`transition-colors ${iconColor}`}
              onClick={() => router.push(`/site/${slug}/ecommerce/profile`)}
              aria-label="Profile"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1, color: primary }}
              className={`relative transition-colors ${iconColor}`}
              onClick={() => router.push(`/site/${slug}/ecommerce/checkout`)}
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
              className={`md:hidden transition-colors ${iconColor}`}
              onClick={() => setMobileMenuOpen((p) => !p)}
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
      </header>

      {/* ===== MOBILE SLIDE‐DOWN MENU ===== */}
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
              bg-white/60 backdrop-blur-lg 
              ring-1 ring-gray-200 
              rounded-b-3xl
              overflow-hidden z-40
            "
          >
            <div className="pt-20 pb-8 px-6 space-y-6">
              {/* Nav Links */}
              {[
                { label: 'Home', href: `/site/${slug}/ecommerce/` },
                { label: 'Shop', href: `/site/${slug}/ecommerce/products` },
                { label: 'Categories', href: `/site/${slug}/ecommerce/categories` },
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={item.href}
                    className="block text-lg font-medium text-gray-900 hover:text-[primary]"
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
                    onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
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
    </>
  );
}
