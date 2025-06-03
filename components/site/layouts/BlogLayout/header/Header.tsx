// File: components/site/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { storeFormData } = useStoreContext();
  const { slug, name, logoUrl, themeSettings } = storeFormData;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  const navItems = [
    { label: 'Home', href: `/${slug}` },
    { label: 'Blog', href: `/${slug}/blog` },
    { label: 'About', href: `/${slug}/about` },
    { label: 'Contact', href: `/${slug}/contact` },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 backface-hidden transition-all ${
        scrolled
          ? 'bg-white/60 dark:bg-gray-900/70 backdrop-blur-lg shadow-md py-3'
          : 'bg-transparent backdrop-blur-none shadow-none py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push(`/${slug}`)}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={40}
              height={40}
              className="rounded-full"
              loader={loader}
            />
          ) : (
            <span
              className="text-2xl font-extrabold bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
              }}
            >
              {name}
            </span>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-gray-700 dark:text-gray-300 font-medium">
          {navItems.map(({ label, href }) => (
            <Link key={label} href={href} 
                className="relative hover:text-indigo-600 transition-colors duration-200"
                style={{ color: '#444' }}
              >
                {label}
                <motion.span
                  className="absolute left-0 bottom-[-4px] h-0.5 bg-gradient-to-r"
                  style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
            </Link>
          ))}
        </nav>

        {/* Icons + Mobile Toggle */}
        <div className="flex items-center space-x-5">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-indigo-600 transition" />
          <UserIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer hover:text-indigo-600 transition" />
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="md:hidden absolute top-0 left-0 w-full bg-white dark:bg-gray-900 z-50 shadow-xl"
          >
            <div className="p-5 flex flex-col space-y-4 text-lg">
              <div className="flex justify-between items-center">
                <span
                  className="text-xl font-bold"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {name}
                </span>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              {navItems.map(({ label, href }) => (
                <Link key={label} href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
