'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassCircleIcon,
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
  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  const navItems = [
    { label: 'Home', href: `/site/${slug}` },
    { label: 'Listings', href: `/site/${slug}/listings` },
    { label: 'Categories', href: `/site/${slug}/categories` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-white dark:bg-gray-900 transition-all">
      {/* Info Bar */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 text-sm bg-opacity-10" style={{ backgroundColor: primary }}>
        <div className="flex items-center space-x-6 text-gray-700 dark:text-white">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="hover:underline flex items-center">
              📧 <span className="ml-1">{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="hover:underline flex items-center">
              📞 <span className="ml-1">{contactPhone}</span>
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
              className="capitalize transition-colors hover:text-blue-600"
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
          {/* Logo + Nav */}
          <div className="flex items-center space-x-6">
            <div onClick={() => router.push(`/site/${slug}`)} className="cursor-pointer">
              {logoUrl ? (
                <Image
                src={logoUrl}
                alt={name}
                width={100}
                height={32}
                className="object-contain max-h-8 sm:max-h-9 lg:max-h-10"
                loader={loader}
              />
              
              ) : (
                <span className="text-xl font-bold text-gray-800 dark:text-white">{name}</span>
              )}
            </div>
            <nav className="hidden lg:flex space-x-6 font-medium text-gray-700 dark:text-gray-200">
              {navItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="hover:text-blue-600 transition-colors"
                  style={{ color: '#444' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search */}
          <div className="hidden lg:flex flex-1 mx-6">
            <div className="relative w-full max-w-md">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2 text-sm shadow-sm focus:ring-2 focus:ring-offset-1 focus:outline-none"
                style={{ caretColor: primary }}
              />
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/site/${slug}/profile`)}
              className="text-gray-600 dark:text-gray-200"
              aria-label="Profile"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/site/${slug}/checkout`)}
              className="relative text-gray-600 dark:text-gray-200"
              aria-label="Cart"
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </motion.button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-600 dark:text-gray-200"
              aria-label="Toggle Menu"
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
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
          <nav className="space-y-3">
            {navItems.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 dark:text-gray-200 hover:text-blue-500 transition-colors"
                style={{ color: '#444' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
