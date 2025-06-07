'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '../../../../../contexts/ContextProvider';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface HeaderProps {
  storeFormData: any;
}

const Header: React.FC<HeaderProps> = ({ storeFormData }) => {
  const { cart } = useStateContext();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const primary = storeFormData.themeSettings?.primaryColor || '#f97316';

  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'featured', label: 'Featured' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQ' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed w-full z-50 top-0 left-0" style={{ '--primary': primary } as React.CSSProperties}>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`transition-all duration-300 ${
          scrolled ? 'bg-white/30 backdrop-blur-lg border-b border-white/20 shadow-md' : 'bg-transparent'
        } py-4`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Link href={`/${storeFormData.slug}`} className="flex items-center space-x-2">
              {storeFormData.logoUrl ? (
                <Image
                  src={storeFormData.logoUrl}
                  loader={loader}
                  alt={storeFormData.name}
                  width={120}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-white">{storeFormData.name}</span>
              )}
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all"
              >
                {label}
              </a>
            ))}

            {/* Search Input */}
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/20 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-white/80" />
            </div>
          </div>

          {/* Hamburger */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden bg-white/20 backdrop-blur-xl border-t border-white/20 shadow-md"
            >
              <nav className="flex flex-col p-6 space-y-4">
                {sections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="text-white font-medium hover:text-white/80"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

export default Header;
