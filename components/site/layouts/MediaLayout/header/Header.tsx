"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';

export default function EnhancedMediaHeader() {
  const { storeFormData } = useStoreContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart } = useStateContext();
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: 'Home', href: `/site/${storeFormData?.slug}` },
    { label: 'Articles', href: `/site/${storeFormData?.slug}#articles` },
    { label: 'Videos', href: `/site/${storeFormData?.slug}#videos` },
    { label: 'Categories', href: `/site/${storeFormData?.slug}#categories` },
    { label: 'About', href: `/site/${storeFormData?.slug}#about` },
  ];

  const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled ? 'bg-black/75 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/site/${storeFormData?.slug}`} className="flex-shrink-0 flex items-center">
            {storeFormData?.logoUrl ? (
              <Image
                loader={loader}
                src={storeFormData.logoUrl}
                alt={storeFormData.name}
                width={140}
                height={48}
                className="object-contain"
                priority
              />
            ) : (
              <span className="text-2xl font-extrabold text-white">{storeFormData?.name}</span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -2, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  href={item.href}
                  className="text-white font-medium hover:text-red-500 transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-white/20 text-sm text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-100" />
            </div>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <BellIcon className="h-6 w-6 text-white" />
            </motion.button>

            {/* Profile */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <UserIcon className="h-6 w-6 text-white" />
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6 text-white" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            className="lg:hidden bg-black/90 backdrop-blur-md border-t border-white/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-white py-2 font-medium hover:text-red-500 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
