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
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData } || {};
  const {
    name = 'Your Company Name',
    slug = '/',
    logoUrl,
    themeSettings = {},
    contactEmail,
    contactPhone,
    address,
    socialLinks,
  } = storeFormData || {};

  const primaryColor = themeSettings.primaryColor || '#0f172a';
  const footerBgColor = themeSettings.footerBgColor || '#090d16'; 
  const footerTextColor = themeSettings.footerTextColor || '#94a3b8'; 
  const footerHeadingColor = themeSettings.footerHeadingColor || '#f8fafc';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 100, damping: 15 } 
    },
  };

  return (
    <motion.footer
      className="relative border-t border-slate-200 dark:border-slate-800/80 pt-20 pb-12 px-6 lg:px-8 z-10 overflow-hidden"
      style={{ backgroundColor: footerBgColor, color: footerTextColor }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.05 }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 relative z-20">
        
        {/* Brand Core Column */}
        <motion.div className="space-y-5" variants={itemVariants}>
          <Link href={`/${slug}`} className="inline-block group">
            {logoUrl && logoUrl !== 'https://placehold.co/140x40/png/gray/white?text=Logo' ? (
              <Image
                src={logoUrl}
                alt={name}
                width={140}
                height={36}
                loader={loader}
                className="object-contain dark:brightness-200 transition-all duration-300"
              />
            ) : (
              <span
                className="text-lg font-black tracking-wider uppercase"
                style={{ color: footerHeadingColor }}
              >
                {name}
              </span>
            )}
          </Link>
          <p className="text-xs font-medium leading-relaxed text-slate-400 dark:text-slate-400 max-w-xs">
            Engineered with high-performance frameworks and structured design logic to optimize digital scaling architectures.
          </p>
          
          {socialLinks && (
            <div className="flex space-x-2 pt-1 text-slate-400 dark:text-slate-500">
              {socialLinks.facebook && (
                <Link href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800 hover:border-slate-700 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.811c-3.27 0-3.589 2.508-3.589 4.332v2.668z"></path></svg>
                </Link>
              )}
              {socialLinks.twitter && (
                <Link href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800 hover:border-slate-700 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.447 0-6.227 2.78-6.227 6.228 0 .486.052.958.148 1.413-5.18-.259-9.754-2.744-12.898-6.518-.535.91-.843 1.961-.843 3.064 0 2.153 1.096 4.053 2.766 5.158-.808-.026-1.566-.247-2.229-.616v.081c0 3.016 2.144 5.534 4.99 6.09-.44.12-.91.182-1.394.182-.343 0-.676-.034-.999-.101.794 2.479 3.078 4.292 5.798 4.341-2.132 1.684-4.811 2.697-7.721 2.697-.502 0-.997-.03-1.48-.086 2.756 1.764 6.035 2.796 9.531 2.796 11.422 0 17.618-9.49 17.618-17.619 0-.267-.015-.534-.04-.795z"></path></svg>
                </Link>
              )}
              {socialLinks.linkedin && (
                <Link href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800 hover:border-slate-700 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38-.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.962v16h4.962v-8.399c0-4.67 6.021-4.237 6.021 0v8.399h4.938v-8.59c0-7.223-4.385-8.25-8.28-4.701z"></path></svg>
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Directory Matrices */}
        <motion.div variants={itemVariants}>
          <h4 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: footerHeadingColor }}>Navigation</h4>
          <ul className="space-y-3 text-xs font-bold uppercase tracking-wider">
            <li><Link href={`/${slug}`} className="text-slate-400 hover:text-white transition-colors">Home Array</Link></li>
            <li><Link href={`/${slug}/services`} className="text-slate-400 hover:text-white transition-colors">Services Terminal</Link></li>
            <li><Link href={`/${slug}/about`} className="text-slate-400 hover:text-white transition-colors">About System</Link></li>
            <li><Link href={`/${slug}/#contact`} className="text-slate-400 hover:text-white transition-colors">Secure Contact</Link></li>
          </ul>
        </motion.div>

        {/* Node Verification Vectors */}
        <motion.div variants={itemVariants}>
          <h4 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: footerHeadingColor }}>Communications</h4>
          <ul className="space-y-4 text-xs font-bold uppercase tracking-wider">
            {contactEmail && (
              <li>
                <Link href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <EnvelopeIcon className="w-4 h-4 flex-shrink-0 text-slate-500" />
                  <span className="break-all lowercase tracking-normal font-medium">{contactEmail}</span>
                </Link>
              </li>
            )}
            {contactPhone && (
              <li>
                <Link href={`tel:${contactPhone}`} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <PhoneIcon className="w-4 h-4 flex-shrink-0 text-slate-500" />
                  <span>{contactPhone}</span>
                </Link>
              </li>
            )}
            {address && (
              <li>
                <Link href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-slate-400 hover:text-white transition-colors">
                  <MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-500" />
                  <span className="normal-case tracking-normal font-medium leading-relaxed">{address}</span>
                </Link>
              </li>
            )}
          </ul>
        </motion.div>

        {/* Newsletter Data Ingestion Pipeline */}
        <motion.div variants={itemVariants}>
          <h4 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: footerHeadingColor }}>Data Pipeline</h4>
          <p className="text-xs font-medium leading-relaxed text-slate-400 mb-5">
            Subscribe to sync raw security logs, visual design system updates, and architecture patch releases.
          </p>
          <form className="flex gap-2 w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
            <div className="relative flex-grow">
              <input
                type="email"
                placeholder="Secure email sequence"
                className="w-full px-4 py-3 bg-slate-900/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium placeholder-slate-500 text-white focus:outline-none focus:border-slate-400 transition-colors"
                aria-label="Secure newsletter subscription"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-3 bg-white dark:bg-white text-slate-950 dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 shadow-sm"
            >
              <ArrowRightIcon className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </form>
        </motion.div>
      </div>

      {/* Grid Anchor System Terminal Validation */}
      <motion.div
        className="border-t border-slate-200 dark:border-slate-800/60 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20"
        variants={itemVariants}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          © {new Date().getFullYear()} {name}. System Matrix Active.
        </span>

        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl bg-slate-900/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">CORE NODE:</span>
          <a 
            href="https://salesmanpro.site" 
            className="text-[10px] font-black uppercase tracking-widest text-slate-200 hover:text-white transition-colors"
          >
            SalesmanPro.site
          </a>
        </div>
      </motion.div>
    </motion.footer>
  );
}