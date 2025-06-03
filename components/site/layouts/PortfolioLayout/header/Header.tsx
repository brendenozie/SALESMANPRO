// File: components/site/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bars3BottomLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '../../../../../contexts/StoreContext';


const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { storeFormData } = useStoreContext();
  const { name, slug, logoUrl, themeSettings } = storeFormData;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

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
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? 'bg-white/10 dark:bg-gray-900/70 backdrop-blur-lg shadow-md py-4'
          : 'bg-transparent dark:bg-transparent backdrop-blur-none shadow-none py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Branding */}
        <Link href={`/#hero`} className="flex items-center space-x-3">
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
              <span
                className="text-2xl font-bold tracking-tight bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                {name}
              </span>
            )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6">
          {links.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
            >
              {label}
            </motion.a>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-600 dark:text-gray-300"
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

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="md:hidden px-6 pb-4 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
        >
          {links.map(({ label, href }) => (
            <Link key={label} href={href} className="block text-gray-700 dark:text-gray-300 font-medium hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
            </Link>
          ))}
        </motion.div>
      )}
    </header>
  );
}
