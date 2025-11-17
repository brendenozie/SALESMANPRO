'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'; 
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

// --- TYPES & UTILITIES ---
type SocialChannel = ExternalSocialChannel;

const socialIconMap: Record<string, IconType> = {
  FACEBOOK: FaFacebook,
  TWITTER: FaTwitter,
  INSTAGRAM: FaInstagram,
  LINKEDIN: FaLinkedin,
  YOUTUBE: FaYoutube,
};

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const navLinks = [
  { label: 'Services', href: '#services' },
  { label: 'Case Studies', href: '#case-studies' }, // Security firms often feature case studies
  { label: 'FAQs', href: '#security-faqs' },
  { label: 'Contact', href: '#contact' }, 
];

// Helper component for Social Icons (Adapted for Light Mode)
function SocialLink({ channel, url, primaryColor }: { channel: SocialChannel; url: string; primaryColor: string }) {
  const IconComponent = socialIconMap[channel];
  if (!IconComponent) return null;

  return (
    <motion.a
      key={String(channel)}
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-500 hover:text-[color:var(--primary)] transition duration-300 p-2 rounded-full hover:bg-gray-100"
      // Use dynamic color for the icon hover
      style={{ '--primary': primaryColor } as React.CSSProperties} 
      whileHover={{ scale: 1.1, y: -2 }}
    >
      {(() => {
        const Icon = IconComponent as unknown as React.ComponentType<{ className?: string }>;
        return <Icon className="w-5 h-5" aria-hidden="true" />;
      })()}
    </motion.a>
  );
}



export default function HeaderLightMode() {
  const { storeFormData } = useStoreContext();

  const name = storeFormData?.name || 'CyberShield';
  const slug = storeFormData?.slug || 'cybershield';
  const logoUrl = storeFormData?.logoUrl || 'https://placehold.co/140x40/000000/ffffff?text=CS+LOGO';
  const socialLinks = storeFormData?.socialLinks || [];
  const themeSettings = storeFormData?.themeSettings || {};

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Security firm color defaults
  const primaryColor = themeSettings.primaryColor || '#00A880'; 
  const secondaryColor = themeSettings.secondaryColor || '#3B82F6'; 

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Set the theme color as a CSS variable for easy use in Tailwind
  const cssVars = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;

  // Define dynamic class for link text color
  const linkTextColor = scrolled ? 'text-gray-700' : 'text-white';
  const mobileMenuBg = 'bg-white';
  const mobileLinkColor = 'text-gray-700';
  const mobileBorderColor = 'border-gray-100';


  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500`}
      style={cssVars}
    >
      <div 
        className={`w-full transition-all duration-500 ${
          // Light Mode Scroll Logic: White background with sharp shadow
          scrolled
            ? 'bg-white shadow-xl py-4 border-b border-gray-100'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-12">
          
          {/* Logo or Name */}
          <Link href={`/${slug}`} className="flex items-center gap-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                loader={loader}
                alt={name}
                width={140}
                height={40}
                // Light mode: ensure logo contrast against white background
                className={`object-contain h-10 w-auto ${scrolled ? 'filter-none' : 'filter brightness-125'}`} 
              />
            ) : (
              <span
                className={`text-2xl font-extrabold tracking-tight bg-clip-text text-transparent transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}
                style={{
                  // Use gradient text for branding when transparent over the hero
                  backgroundImage: scrolled ? 'none' : `linear-gradient(90deg, white, ${secondaryColor})`,
                  WebkitTextFillColor: scrolled ? 'initial' : 'transparent',
                }}
              >
                {name}
              </span>
            )}
          </Link>

          {/* Desktop Nav - Middle */}
          <nav className="hidden lg:flex gap-10 text-base font-medium">
            {navLinks.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ scale: 1.05, color: primaryColor }}
                className={`${linkTextColor} ${scrolled ? 'text-gray-700' : 'text-white'} hover:text-[color:var(--primary)] transition-colors duration-200`}
                style={{ color: scrolled ? 'inherit' : 'white' }}
              >
                {label}
              </motion.a>
            ))}
          </nav>

          {/* Right Section: Socials & CTA */}
          <div className="hidden lg:flex items-center gap-6">
              
            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ channel, url }) => (
                <SocialLink 
                  key={String(channel)}
                  channel={channel} 
                  url={url} 
                  primaryColor={primaryColor}
                />
              ))}
            </div>

            {/* Separator Line */}
            {(socialLinks.length > 0) && (
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
            )}


            {/* CTA Button - High Visibility */}
            <Link
              href={`/${slug}/contact`}
              className="inline-flex items-center font-semibold px-6 py-2 text-sm rounded-full shadow-lg transition-all duration-300 hover:opacity-90 hover:scale-[1.02] text-white"
              style={{ 
                  backgroundColor: primaryColor, 
                  boxShadow: `0 4px 15px 0 ${primaryColor}40`, // Subtle glow
              }}
            >
              Get a Quote
            </Link>
          </div>
          
          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-md transition ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Light Mode Adapted) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden ${mobileMenuBg} px-6 pt-4 pb-6 space-y-4 border-t ${mobileBorderColor} shadow-lg`}
          >
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={`block ${mobileLinkColor} font-medium py-2 text-lg transition-colors duration-200 hover:text-[color:var(--primary)] border-b ${mobileBorderColor}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            
            {/* Mobile CTA */}
            <Link
              href={`/${slug}/contact`}
              onClick={() => setMenuOpen(false)}
              className="block text-center text-white py-3 rounded-xl font-bold mt-4"
              style={{ backgroundColor: primaryColor }}
            >
              Get a Quote
            </Link>

            {/* Mobile Social Icons */}
            <div className={`flex justify-center gap-6 pt-4 border-t ${mobileBorderColor}`}>
              {socialLinks.map(({ channel, url }) => (
                <SocialLink 
                  key={channel}
                  channel={channel} 
                  url={url} 
                  primaryColor={primaryColor}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}