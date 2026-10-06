'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from '@heroicons/react/24/solid';

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  footerBgColor?: string;
  footerTextColor?: string;
  footerHeadingColor?: string;
}

interface AddressItem {
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface StoreFormData {
  name?: string;
  slug?: string;
  logoUrl?: string;
  themeSettings?: ThemeSettings;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  addresses?: AddressItem[];
  socialLinks?: Array<{ channel?: string; url?: string }> | Record<string, string>;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Footer() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };

  const {
    name = 'Your Company Name',
    slug = '/',
    logoUrl,
    themeSettings = {},
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
    socialLinks,
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy address data if the addresses array is empty.
  const regionalAddresses: AddressItem[] =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: 'Global Headquarters',
            address: legacyAddress || 'Lusingeti Road, Number 31, Industrial Area, Nairobi',
            contactPhone: contactPhone,
            contactEmail: contactEmail,
          },
        ];

  const primaryColor = themeSettings.primaryColor || '#00A880';
  const footerBgColor = themeSettings.footerBgColor || '#ffffff';
  const footerTextColor = themeSettings.footerTextColor || '#6b7280';
  const footerHeadingColor = themeSettings.footerHeadingColor || '#111827';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'linear' } },
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Subscription endpoint initialized successfully.');
  };

  return (
    <motion.footer
      className="relative pt-24 pb-12 px-6 lg:px-12 border-t border-gray-100 overflow-hidden"
      style={{ backgroundColor: footerBgColor, color: footerTextColor }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      variants={containerVariants}
    >
      {/* GLOBAL ARCHITECTURAL GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-16 relative z-20 pb-16 border-b border-gray-100">
        
        {/* COMPONENT LOGO & TELEMETRY IDENTIFIER (4 Columns) */}
        <motion.div className="md:col-span-4 space-y-6" variants={itemVariants}>
          <Link href={`/${slug}`} className="inline-block group">
            {logoUrl ? (
              <Image decoding="async"
                src={logoUrl}
                alt={name}
                width={160}
                height={40}
                className="object-contain filter grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-200"
              />
            ) : (
              <span
                className="text-2xl font-black tracking-tighter uppercase"
                style={{ color: footerHeadingColor }}
              >
                {name}
              </span>
            )}
          </Link>
          <p className="text-xs leading-relaxed font-mono max-w-sm text-gray-400">
            SYS_OPERATIONS // Distributed infrastructure delivering scalable transactional pipelines and precise local execution layers.
          </p>

          {/* SOCIAL LINKS */}
          {socialLinks && (
            <div className="flex flex-wrap gap-2 pt-2">
              {Array.isArray(socialLinks)
                ? socialLinks.map((link, index) => {
                    const platform = link?.channel || `LINK_${index}`;
                    const href = link?.url || '';
                    if (!href) return null;
                    return (
                      <a
                        key={index}
                        href={href.startsWith('http') ? href : `https://${href}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-colors text-[10px] font-mono uppercase font-bold"
                      >
                        {String(platform).slice(0, 2)}
                      </a>
                    );
                  })
                : Object.entries(socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    return (
                      <a
                        key={platform}
                        href={String(url).startsWith('http') ? String(url) : `https://${String(url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-colors text-[10px] font-mono uppercase font-bold"
                      >
                        {platform.slice(0, 2)}
                      </a>
                    );
                  })}
            </div>
          )}
        </motion.div>

        {/* QUICK ROUTING MATRIX (2 Columns) */}
        <motion.div className="md:col-span-2 flex flex-col" variants={itemVariants}>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 mb-6 block">
            01 // INDEX_ROUTING
          </span>
          <ul className="space-y-3 text-xs font-mono">
            <li><Link href={`/${slug}`} className="hover:text-gray-900 transition-colors">/home</Link></li>
            <li><Link href={`/${slug}/services`} className="hover:text-gray-900 transition-colors">/services</Link></li>
            <li><Link href={`/${slug}/about`} className="hover:text-gray-900 transition-colors">/about-us</Link></li>
            <li><Link href={`/${slug}/blog`} className="hover:text-gray-900 transition-colors">/blog</Link></li>
            <li><Link href={`/${slug}/#contact`} className="hover:text-gray-900 transition-colors">/contact</Link></li>
          </ul>
        </motion.div>

        {/* PRIMARY DIRECTORY ENDPOINTS (3 Columns) */}
        <motion.div className="md:col-span-3 flex flex-col" variants={itemVariants}>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 mb-6 block">
            02 // DIRECT_NODES
          </span>
          <ul className="space-y-4 text-xs font-mono">
            {contactEmail && (
              <li>
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-gray-900 transition-colors group">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 flex-shrink-0" />
                  <span className="break-all">{contactEmail}</span>
                </a>
              </li>
            )}
            {contactPhone && (
              <li>
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 hover:text-gray-900 transition-colors group">
                  <PhoneIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 flex-shrink-0" />
                  <span>{contactPhone}</span>
                </a>
              </li>
            )}
          </ul>
        </motion.div>

        {/* DATA INGESTION SUBSCRIBER BLOCK (3 Columns) */}
        <motion.div className="md:col-span-3 flex flex-col" variants={itemVariants}>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 mb-6 block">
            03 // DATA_FEED_SUBSCRIBE
          </span>
          <p className="text-xs font-mono text-gray-400 mb-4 leading-relaxed">
            Register static endpoint to map incoming contextual dispatches.
          </p>
          <form onSubmit={handleSubscribe} className="flex border border-gray-200 bg-white p-1 rounded-xl focus-within:border-gray-900 transition-colors">
            <input
              type="email"
              placeholder="ADDR_STRING"
              className="w-full px-3 py-2 bg-transparent text-xs text-gray-900 placeholder-gray-300 focus:outline-none font-mono"
              aria-label="Email for telemetry dispatch"
              required
            />
            <button
              type="submit"
              className="text-white p-2.5 rounded-lg transition-opacity flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>

      {/* REGIONAL NODES Showcase SECTION */}
      {regionalAddresses.length > 0 && (
        <motion.div className="max-w-7xl mx-auto pt-10 pb-10 border-b border-gray-100" variants={itemVariants}>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 mb-6 block">
            04 // REGIONAL_NODES // LOCATION_TELEMETRY
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const mapsUrl = loc.address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`
                : null;

              return (
                <div
                  key={idx}
                  className="p-5 border border-gray-100 bg-gray-50/50 rounded-xl flex flex-col justify-between space-y-4 hover:border-gray-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-gray-900 flex-shrink-0" />
                      <h6 className="text-xs font-mono font-black uppercase text-gray-900 tracking-wider">
                        {loc.label || `NODE_0${idx + 1}`}
                      </h6>
                    </div>
                    {loc.address && (
                      <p className="text-xs font-mono text-gray-500 leading-relaxed pl-6">
                        {loc.address}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-200/60 font-mono text-xs">
                    {loc.contactPhone && (
                      <a
                        href={`tel:${loc.contactPhone}`}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors uppercase"
                      >
                        <PhoneIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}

                    {loc.contactEmail && (
                      <a
                        href={`mailto:${loc.contactEmail}`}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors uppercase truncate"
                      >
                        <EnvelopeIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-gray-900 hover:text-emerald-600 transition-colors uppercase pt-1 font-bold"
                      >
                        <span>NAVIGATE_TO_NODE</span>
                        <ArrowUpRightIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* METADATA SYSTEM ATTRIBUTION */}
      <div className="max-w-7xl mx-auto pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-mono uppercase tracking-widest text-gray-400">
        <motion.div variants={itemVariants}>
          © CORE_SYS {new Date().getFullYear()} {name}. NO_RIGHTS_RESERVED // OPEN_LOG
        </motion.div>
        
        <motion.div className="flex items-center gap-2 border border-gray-100 px-4 py-2 bg-gray-50/50 rounded-lg" variants={itemVariants}>
          <span className="font-bold text-gray-400">POWERED_BY //</span>
          <a 
            href="https://salesmanpro.site" 
            target="_blank"
            rel="noopener noreferrer"
            className="font-black hover:text-gray-900 transition-colors"
            style={{ color: primaryColor }}
          >
            SalesmanPro.site
          </a>
        </motion.div>
      </div>
    </motion.footer>
  );
}