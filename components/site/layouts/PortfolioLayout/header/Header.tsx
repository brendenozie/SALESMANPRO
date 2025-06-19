'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3BottomLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { storeFormData } = useStoreContext();
  const { name, slug, logoUrl, themeSettings } = storeFormData;

  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const primaryColor = themeSettings?.primaryColor || '#f97316';
  const secondaryColor = themeSettings?.secondaryColor || '#10b981';

  const links = [
    { label: 'Home', href: `/${slug}` },
    { label: 'Projects', href: `/${slug}/projects` },
    { label: 'About', href: `/${slug}/about` },
    { label: 'Contact', href: `/${slug}/#contact` },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent dark:bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Branding */}
        <Link href={`/${slug}`} className="flex items-center space-x-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={120}
              height={40}
              className="object-contain"
              loader={loader}
              priority
            />
          ) : (
            <span
              className="text-2xl font-extrabold bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {name}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium transition"
              whileHover={{ scale: 1.05 }}
            >
              {label}
            </motion.a>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden text-gray-600 dark:text-gray-300"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3BottomLeftIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden px-6 pt-2 pb-4 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {links.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="block text-gray-800 dark:text-gray-200 font-medium hover:text-teal-500 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
