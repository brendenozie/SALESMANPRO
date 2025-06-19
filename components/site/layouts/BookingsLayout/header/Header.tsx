'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { storeFormData } = useStoreContext();
  const { name, logoUrl, themeSettings } = storeFormData;
  const primary = themeSettings?.primaryColor || '#10b981';
  const secondary = themeSettings?.secondaryColor || '#6366f1';

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 backdrop-blur-lg  py-4 ${
          scrolled ? 'bg-black/60 shadow-lg ring-1 ring-white/10' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo or Brand */}
          <Link href="#hero" className="flex items-center gap-3 group">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={`${name} Logo`}
                width={40}
                height={40}
                className="rounded-full object-cover ring-2 ring-white/20"
                loader={loader}
              />
            )}
            <span
              className="text-2xl font-bold tracking-tight text-white group-hover:text-teal-400 transition"
            >
              {name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-white/80 hover:text-white font-medium transition"
              >
                {item.label}
              </a>
            ))}
            <motion.a
              href="#booking"
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 12px ${primary}`,
              }}
              transition={{ type: 'spring', stiffness: 250 }}
              className="ml-4 px-5 py-2 rounded-full font-semibold text-white text-sm bg-gradient-to-r from-[var(--tw-gradient-stops)] to-[var(--tw-gradient-stops)]"
              style={{
                backgroundImage: `linear-gradient(90deg, ${primary}, ${primary})`,
              }}
            >
              Book Now
            </motion.a>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-7 w-7" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-y-0 right-0 z-50 w-3/4 max-w-sm bg-black/90 backdrop-blur-lg p-6 flex flex-col shadow-xl"
          >
            <div className="flex justify-between items-center mb-8">
              <Link href="#hero" className="flex items-center space-x-2">
                {logoUrl && (
                  <Image
                    src={logoUrl}
                    alt={`${name} Logo`}
                    width={32}
                    height={32}
                    className="rounded-full object-contain"
                  />
                )}
                <span className="text-lg font-bold text-white">{name}</span>
              </Link>
              <button onClick={() => setIsOpen(false)} aria-label="Close menu">
                <XMarkIcon className="h-6 w-6 text-white/80" />
              </button>
            </div>

            <nav className="flex flex-col space-y-5">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 text-base font-medium hover:text-white transition"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <motion.a
              href="#booking"
              onClick={() => setIsOpen(false)}
              className="mt-auto text-center py-3 rounded-full font-medium text-white bg-gradient-to-r from-[var(--tw-gradient-stops)] to-[var(--tw-gradient-stops)]"
              style={{
                backgroundImage: `linear-gradient(90deg, ${secondary}, ${primary})`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 12px ${secondary}`,
              }}
              transition={{ type: 'spring', stiffness: 250 }}
            >
              Book Now
            </motion.a>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
