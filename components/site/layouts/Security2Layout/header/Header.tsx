'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'; 
import { useStoreContext } from '@/contexts/StoreContext';
import { StoreHeaderSearch } from '@/components/search/StoreHeaderSearch';
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
  { label: 'SERVICES', href: '#services', index: '01' },
  { label: 'CASE STUDIES', href: '#case-studies', index: '02' },
  { label: 'FAQS', href: '#security-faqs', index: '03' },
  { label: 'CONTACT', href: '#contact-routing', index: '04' }, 
];

function SocialLink({ channel, url }: { channel: SocialChannel; url: string }) {
  const IconComponent = socialIconMap[channel];
  if (!IconComponent) return null;

  return (
    <a
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-gray-950 p-2 border border-transparent hover:border-gray-200 transition-colors"
    >
      {(() => {
        const Icon = IconComponent as unknown as React.ComponentType<{ className?: string }>;
        return <Icon className="w-3.5 h-3.5" aria-hidden="true" />;
      })()}
    </a>
  );
}

export default function HeaderIndustrialGrid() {
  const { storeFormData } = useStoreContext();

  const name = storeFormData?.name || 'CyberShield';
  const slug = storeFormData?.slug || 'cybershield';
  const logoUrl = storeFormData?.logoUrl || '';
  const socialLinks = storeFormData?.socialLinks || [];
  const themeSettings = storeFormData?.themeSettings || {};

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryColor = themeSettings.primaryColor || '#00A880'; 

  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white border-b border-gray-200' : 'bg-white/90 backdrop-blur-md border-b border-gray-100'
      }`}
    >
      {/* GLOBAL SYSTEM STATUS BAR */}
      <div className="w-full bg-gray-950 text-[9px] font-mono text-gray-400 px-6 py-1.5 flex justify-between items-center tracking-widest border-b border-gray-900">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SYS_SECURE // ONLINE
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="hidden sm:inline text-gray-500">SRC_NODE: {slug.toUpperCase()}</span>
        </div>
        <div className="font-bold text-gray-500">
          [SECURE_CHANNEL_v4.11]
        </div>
      </div>

      {/* CORE STRUCTURAL ROUTING MATRIX */}
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center relative">
        
        {/* BRAND IDENTITY NODE */}
        <Link href={`/${slug}`} className="flex items-center h-full border-r border-gray-100 pr-8">
          {logoUrl ? (
            <Image decoding="async"
              src={logoUrl}
              alt={name}
              width={130}
              height={36}
              className="object-contain grayscale contrast-125 mix-blend-multiply max-h-9" 
            />
          ) : (
            <span className="text-lg font-mono font-black uppercase tracking-tighter text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5" style={{ backgroundColor: primaryColor }} />
              {name}
            </span>
          )}
        </Link>

        {/* DESKTOP MATRIX SYSTEM ROUTING LINKS */}
        <nav className="hidden lg:flex items-center h-full flex-1 px-12 gap-8">
          {navLinks.map(({ label, href, index }) => (
            <a
              key={label}
              href={href}
              className="group flex items-baseline gap-1.5 text-xs font-mono font-bold tracking-wider text-gray-500 hover:text-gray-950 transition-colors py-2 relative"
            >
              <span className="text-[9px] font-medium text-gray-300 group-hover:text-gray-900 transition-colors">{index}</span>
              {label}
            </a>
          ))}
        </nav>

        {/* RIGHT PANEL: TELEMETRY SOCIALS & SYSTEM ACTION BUTTON */}
        <div className="hidden lg:flex items-center h-full gap-6 pl-6 border-l border-gray-100">
          <StoreHeaderSearch variant="button" />

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1 border-r border-gray-100 pr-4">
              {socialLinks.map(({ channel, url }) => (
                <SocialLink 
                  key={String(channel)}
                  channel={channel} 
                  url={url} 
                />
              ))}
            </div>
          )}

          <Link
            href={`/${slug}/contact`}
            className="inline-flex items-center text-xs font-mono font-black uppercase tracking-wider text-white bg-gray-950 hover:bg-gray-900 transition-colors py-3 px-5 border border-transparent"
          >
            INITIALIZE_ROUTINE
          </Link>
        </div>
        
        {/* MOBILE INTERFACE TRIGGER */}
        <div className="lg:hidden flex items-center gap-2">
          <StoreHeaderSearch variant="button" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-900 hover:bg-gray-50 border border-gray-200 transition"
            aria-label="Toggle system interface"
          >
            {menuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANSION OVERLAY MODULE */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'linear' }}
            className="absolute top-full left-0 w-full bg-white border-b border-gray-300 shadow-2xl flex flex-col md:hidden z-50"
          >
            <div className="p-6 space-y-3 bg-white">
              {navLinks.map(({ label, href, index }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-baseline gap-3 text-xs font-mono font-bold tracking-widest text-gray-500 hover:text-gray-950 py-3 border-b border-gray-100 uppercase"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-[9px] font-medium text-gray-300">{index} //</span>
                  {label}
                </Link>
              ))}
              
              {/* MOBILE CALL TO ACTION */}
              <Link
                href={`/${slug}/contact`}
                onClick={() => setMenuOpen(false)}
                className="block text-center text-xs font-mono font-black uppercase tracking-wider text-white bg-gray-950 hover:bg-gray-900 transition-colors py-4 w-full mt-4"
              >
                INITIALIZE_ROUTINE
              </Link>

              {/* MOBILE INTEGRATION LINKS */}
              {socialLinks.length > 0 && (
                <div className="flex justify-center gap-4 pt-4 border-t border-gray-100 mt-4">
                  {socialLinks.map(({ channel, url }) => (
                    <SocialLink 
                      key={channel}
                      channel={channel} 
                      url={url} 
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}