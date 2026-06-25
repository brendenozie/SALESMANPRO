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
} from '@heroicons/react/24/outline';

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  footerBgColor?: string;
  footerTextColor?: string;
  footerHeadingColor?: string;
}

interface StoreFormData {
  name?: string;
  slug?: string;
  logoUrl?: string;
  themeSettings?: ThemeSettings;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
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
    address,
    socialLinks,
  } = storeFormData;

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
              <Image
                src={logoUrl}
                alt={name}
                width={160}
                height={40}
                loader={loader}
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
          
          {socialLinks && (
            <div className="flex space-x-3 pt-2">
              {Object.entries(socialLinks).map(([platform, url]) => {
                if (!url) return null;
                return (
                  <Link
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="w-7 h-7 flex items-center justify-center border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-colors text-[10px] font-mono uppercase font-bold"
                  >
                    {platform.slice(0, 2)}
                  </Link>
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

        {/* PHYSICAL DIRECTORY TARGETS (3 Columns) */}
        <motion.div className="md:col-span-3 flex flex-col" variants={itemVariants}>
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-gray-400 mb-6 block">
            02 // DIRECT_NODES
          </span>
          <ul className="space-y-4 text-xs font-mono">
            {contactEmail && (
              <li>
                <Link href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-gray-900 transition-colors group">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                  <span className="break-all">{contactEmail}</span>
                </Link>
              </li>
            )}
            {contactPhone && (
              <li>
                <Link href={`tel:${contactPhone}`} className="flex items-center gap-3 hover:text-gray-900 transition-colors group">
                  <PhoneIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                  <span>{contactPhone}</span>
                </Link>
              </li>
            )}
            {address && (
              <li className="flex items-start gap-3">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="leading-tight text-gray-500">{address}</span>
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
          <form className="flex border border-gray-200 bg-white p-1 rounded-xl focus-within:border-gray-900 transition-colors">
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

      {/* METADATA SYSTEM ATTRIBUTION */}
      <div className="max-w-7xl mx-auto pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-mono uppercase tracking-widest text-gray-400">
        <motion.div variants={itemVariants}>
          © CORE_SYS {new Date().getFullYear()} {name}. NO_RIGHTS_RESERVED // OPEN_LOG
        </motion.div>
        
        <motion.div className="flex items-center gap-2 border border-gray-100 px-4 py-2 bg-gray-50/50 rounded-lg" variants={itemVariants}>
          <span className="font-bold text-gray-400">POWERED_BY //</span>
          <a 
            href="https://salesmanpro.site" 
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