// File: components/site/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassCircleIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
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
    { label: 'Shop', href: `/site/${slug}/products` },
    { label: 'Categories', href: `/site/${slug}/categories` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-shadow">
      {/* Top Info Bar */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}1A`, color: primary }}
      >
        <div className="flex items-center space-x-6">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex text-sm items-center uppercase hover:underline"
            >
              📧 <span className="ml-1">{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="flex items-center hover:underline">
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
              rel="noreferrer"
              style={{ color: primary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
              className="capitalize transition-colors"
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => router.push(`/site/${slug}`)}
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={120}
                  height={40}
                  className="object-contain"
                  loader={loader}
                />
              ) : (
                <span className="text-xl font-bold text-gray-800 dark:text-white">{name}</span>
              )}
            </div>
            <nav className="hidden lg:flex space-x-6 font-medium text-gray-700 dark:text-gray-200">
              {navItems.map(({ label, href }) => (
                <Link key={label} href={href} 
                    className="hover:underline"
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
          <div className="flex-1 mx-6 hidden lg:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm rounded-full py-2 px-4 pl-10 shadow-sm focus:outline-none"
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${primary}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
              />
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Icons + Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/site/${slug}/profile`)}
              className="text-gray-600 dark:text-gray-200"
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/site/${slug}/checkout`)}
              className="relative text-gray-600 dark:text-gray-200"
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 shadow-md">
          <div className="space-y-3">
            {navItems.map(({ label, href }) => (
              <Link key={label} href={href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:underline"
                  style={{ color: '#444' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                >
                  {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
