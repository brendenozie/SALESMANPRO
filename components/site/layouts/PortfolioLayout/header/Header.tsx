'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, FaceFrownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { IconType } from 'react-icons';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';


type SocialChannel = 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN' | 'YOUTUBE';

const socialIconMap: Record<SocialChannel, typeof FaFacebook> = {
  FACEBOOK: FaFacebook,
  TWITTER: FaTwitter,
  INSTAGRAM: FaInstagram,
  LINKEDIN: FaLinkedin,
  YOUTUBE: FaYoutube,
};

 // Loader for next/image
 const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  // { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData;

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

 
  const primaryColor = themeSettings.primaryColor || '#3b82f6';
  const secondaryColor = themeSettings.secondaryColor || '#2563eb';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 py-8 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 shadow-sm backdrop-blur-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo or Name */}
        <Link href={`/${slug}`} className="flex items-center gap-3">
          {logoUrl ? (
            <Image
              src={logoUrl}
              loader={loader}
              alt={name}
              width={140}
              height={40}
              className="object-contain h-10 w-auto"
            />
          ) : (
            <span
              className="text-2xl font-bold tracking-tight bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              {name}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-700 dark:text-gray-200">
          {navLinks.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              whileHover={{ scale: 1.05 }}
              className="hover:text-[color:var(--primary)] transition"
            >
              {label}
            </motion.a>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="hidden md:flex items-center gap-4">
          {socialLinks.map(({ channel, url }) => {
            const IconComponent = socialIconMap[channel as SocialChannel];
            if (!IconComponent) return null;

            return (
              <a
                key={channel}
                href={`https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
              >
                <FaceFrownIcon className="w-5 h-5" />
              </a>
            );
          })}

        </div>

        {/* CTA */}
        <div className="hidden md:flex">
          <Link
            href={`/${slug}/contact`}
            className="bg-[color:var(--primary)] text-white px-4 py-2 rounded-full font-medium text-sm hover:opacity-90 transition"
            style={{ backgroundColor: primaryColor }}
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle menu"
        >
          {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 px-6 pt-4 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700"
          >
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="block text-gray-900 dark:text-gray-100 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href={`/${slug}/contact`}
              onClick={() => setMenuOpen(false)}
              className="block text-center bg-[color:var(--primary)] text-white py-2 rounded-full font-medium mt-2"
              style={{ backgroundColor: primaryColor }}
            >
              Contact Us
            </Link>

            {/* Mobile Social Icons */}
            <div className="flex justify-center gap-4 mt-4">
            {socialLinks.map(({ channel, url }) => {
            const IconComponent = socialIconMap[channel as SocialChannel];
            if (!IconComponent) return null;

            return (
              <a
                key={channel}
                href={`https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-primary transition"
              >
                <FaceFrownIcon className="w-5 h-5" />
              </a>
            );
          })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
