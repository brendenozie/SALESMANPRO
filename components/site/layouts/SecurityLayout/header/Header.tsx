'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'; 
import { useStoreContext } from '@/contexts/StoreContext';
import type { IconType } from 'react-icons';
import type { SocialChannel as ExternalSocialChannel } from '@/types/typings';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from 'react-icons/fa';

type SocialChannel = ExternalSocialChannel;

const socialIconMap: Record<string, IconType> = {
  FACEBOOK: FaFacebook,
  TWITTER: FaTwitter,
  INSTAGRAM: FaInstagram,
  LINKEDIN: FaLinkedin,
  YOUTUBE: FaYoutube,
};

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Case Studies', href: '#case-studies' },
  { label: 'Contact', href: '#contact' }, 
];

function SocialLink({ channel, url, primaryColor }: { channel: SocialChannel; url: string; primaryColor: string }) {
  const IconComponent = socialIconMap[channel];
  if (!IconComponent) return null;

  return (
    <motion.a
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-[color:var(--primary)] p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      style={{ '--primary': primaryColor } as React.CSSProperties} 
      whileHover={{ scale: 1.05, y: -1 }}
      whileTap={{ scale: 0.95 }}
    >
      {(() => {
        const Icon = IconComponent as unknown as React.ComponentType<{ className?: string }>;
        return <Icon className="w-4 h-4" aria-hidden="true" />;
      })()}
    </motion.a>
  );
}

export default function HeaderLightMode() {
  const { storeFormData } = useStoreContext();

  const name = storeFormData?.name || 'CyberShield';
  const slug = storeFormData?.slug || 'cybershield';
  const logoUrl = storeFormData?.logoUrl || '';
  const socialLinks = storeFormData?.socialLinks || [];
  const themeSettings = storeFormData?.themeSettings || {};

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const primaryColor = themeSettings.primaryColor || '#00A880'; 
  const secondaryColor = themeSettings.secondaryColor || '#3B82F6'; 

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center h-12">
        
        {/* LOGO ARCHITECTURE */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-50">
          {logoUrl ? (
            <Image
              src={logoUrl}
              loader={loader}
              alt={name}
              width={130}
              height={36}
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02] w-auto h-10" 
            />
          ) : (
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                {name}<span style={{ color: primaryColor }}>.</span>
              </span>
            </div>
          )}
        </Link>

        {/* DESKTOP NAV - HIGH PRECISION ACTIVE STATES */}
        <nav 
          className="hidden lg:flex items-center gap-1.5 bg-gray-50/60 p-1.5 rounded-xl border border-gray-100/80 backdrop-blur-sm"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navLinks.map(({ label, href }, index) => (
            <Link
              key={label}
              href={href}
              className="relative px-4 py-2 text-xs font-bold tracking-wide uppercase transition-colors duration-200 rounded-lg text-gray-600 hover:text-gray-900"
              onMouseEnter={() => setHoveredIndex(index)}
            >
              {hoveredIndex === index && (
                <motion.span
                  layoutId="navHover"
                  className="absolute inset-0 bg-white border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {label}
            </Link>
          ))}
        </nav>

        {/* DESKTOP OPERATIONS PANEL */}
        <div className="hidden lg:flex items-center gap-5">
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-50/40 border border-gray-100 px-1.5 py-0.5 rounded-lg">
              {socialLinks.map(({ channel, url }) => (
                <SocialLink 
                  key={String(channel)}
                  channel={channel} 
                  url={url} 
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          )}

          <Link href={`/${slug}/contact`}>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center font-bold tracking-wide text-xs uppercase px-5 py-3 rounded-xl text-white shadow-md transition-shadow duration-300"
              style={{ 
                backgroundColor: primaryColor, 
                boxShadow: `0 6px 20px -4px ${primaryColor}40`,
              }}
            >
              Get Secure Quote
            </motion.button>
          </Link>
        </div>
        
        {/* MOBILE COMMAND BURGER */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2.5 rounded-xl border border-gray-200/60 bg-white shadow-sm hover:bg-gray-50 transition-colors z-50"
          aria-label="Toggle command menu"
        >
          {menuOpen ? <XMarkIcon className="w-5 h-5 text-gray-900" /> : <Bars3Icon className="w-5 h-5 text-gray-900" />}
        </button>
      </div>

      {/* FULL-WINDOW DRAWER FOR MOBILE MATRIX */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop Blur Layer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-white/60 backdrop-blur-md lg:hidden z-40"
            />

            {/* Menu Body */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl px-6 py-8 space-y-6 lg:hidden z-40"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="block font-bold text-sm tracking-wider uppercase text-gray-500 hover:text-gray-900 py-3.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-50 space-y-4">
                <Link href={`/${slug}/contact`} onClick={() => setMenuOpen(false)} className="block w-full">
                  <button
                    className="w-full text-center text-white py-4 rounded-xl font-bold text-sm tracking-wide uppercase shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Get Secure Quote
                  </button>
                </Link>

                {socialLinks.length > 0 && (
                  <div className="flex justify-center gap-4 pt-2">
                    {socialLinks.map(({ channel, url }) => (
                      <SocialLink 
                        key={channel}
                        channel={channel} 
                        url={url} 
                        primaryColor={primaryColor}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}