// File: components/site/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars2Icon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData;

  const primary = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondary = themeSettings?.secondaryColor || '#2563eb'; // blue-600 fallback

  // Change header background on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: `/${slug}` },
    { label: 'Services', href: `/${slug}/services` },
    { label: 'Doctors', href: `/${slug}/doctors` },
    { label: 'About', href: `/${slug}/about` },
    { label: 'Contact', href: `/${slug}/contact` },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? 'bg-white dark:bg-gray-900 shadow-lg py-2'
          : 'bg-transparent py-4'
      }`}
    >
      {/* Top Info Bar */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}20`, color: primary }}
      >
        <div className="flex items-center space-x-6">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-1 hover:underline"
            >
              <EnvelopeIcon className="w-4 h-4" /> <span>{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-1 hover:underline"
            >
              <PhoneIcon className="w-4 h-4" /> <span>{contactPhone}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks.map((s) => (
            <motion.a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              whileHover={{ scale: 1.1 }}
              className="capitalize text-sm"
            >
              {s.channel}
            </motion.a>
          ))}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo / Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push(`/${slug}`)}
        >
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={48}
              height={48}
              className="rounded-full"
              loader={loader}
            />
          ) : (
            <span
              className="text-2xl font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
            >
              {name}
            </span>
          )}
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-8 font-medium text-gray-700 dark:text-gray-200">
          {navItems.map(({ label, href }) => (
            <Link key={label} href={href}
                className="relative hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = '')}
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="ml-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-md transition"
            onClick={() => router.push(`/${slug}/book`)}
          >
            Book Appointment
          </motion.button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-200"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Bars2Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-3/4 bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <span
                className="text-xl font-bold cursor-pointer"
                style={{ color: primary }}
                onClick={() => {
                  router.push(`/${slug}`);
                  setMobileMenuOpen(false);
                }}
              >
                {name}
              </span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <nav className="flex flex-col space-y-6">
              {navItems.map(({ label, href }) => (
                <Link key={label} href={href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-700 dark:text-gray-200 text-lg font-medium hover:text-teal-600 dark:hover:text-teal-400 transition"
                  >
                    {label}
                </Link>
              ))}
            </nav>

            <motion.button
              whileHover={{ scale: 1.05 }}
              className="mt-auto bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-2 rounded-full font-semibold shadow-md transition"
              onClick={() => {
                router.push(`/${slug}/book`);
                setMobileMenuOpen(false);
              }}
            >
              Book Appointment
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
