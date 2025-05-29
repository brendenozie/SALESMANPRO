"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useStateContext } from '../../../../../contexts/ContextProvider';

export default function EnhancedMediaHeader({ store }:any) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart } = useStateContext();

  const navItems = [
    { label: 'Home', href: `/site/${store.slug}` },
    { label: 'Articles', href: `/site/${store.slug}/articles` },
    { label: 'Videos', href: `/site/${store.slug}/videos` },
    { label: 'Categories', href: `/site/${store.slug}/categories` },
    { label: 'About', href: `/site/${store.slug}/about` },
  ];

  const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/site/${store.slug}`} className="flex-shrink-0 flex items-center">
            {store.logoUrl ? (
              <Image
                loader={loader}
                src={store.logoUrl}
                alt={store.name}
                width={140}
                height={48}
                className="object-contain"
                priority
              />
            ) : (
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {store.name}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Link
                  href={item.href}
                  className="text-gray-700 dark:text-gray-200 font-medium hover:text-red-600 dark:hover:text-red-500 transition-colors"
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
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Notifications */}
            <motion.button whileHover={{ scale: 1.1 }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
            </motion.button>

            {/* Profile */}
            <motion.button whileHover={{ scale: 1.1 }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
              <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.nav
          className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-gray-700 dark:text-gray-200 py-2 font-medium hover:text-red-600 dark:hover:text-red-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </motion.nav>
      )}
    </header>
  );
}
