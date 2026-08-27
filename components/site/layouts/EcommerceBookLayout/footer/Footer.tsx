'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ArrowUpRightIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isPrimary: true
      }];

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: 'FB',
    instagram: 'IG',
    twitter: 'X',
  };

  return (
    <footer className="relative bg-[#FDFDFB] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-400 pt-32 pb-12 border-t border-zinc-100 dark:border-zinc-900">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* TOP: MASSIVE BRAND MARK */}
        <div className="mb-32 overflow-hidden">
          <motion.h1 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[15vw] leading-[0.8] font-serif italic tracking-tighter text-zinc-100 dark:text-zinc-900/40 whitespace-nowrap select-none"
          >
            {name || 'The Collective'}
          </motion.h1>
        </div>

        {/* MIDDLE: INFORMATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-24">
          
          {/* Brand Manifesto */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-400">Status: Online Archive</span>
            </div>
            <p className="text-2xl font-serif italic text-zinc-800 dark:text-zinc-200 leading-snug max-w-md">
              {description || 'Curating essentials for the next generation with a focus on architectural integrity and soft utility.'}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-6 pt-4">
                {socialLinks.map((s, idx) => (
                  <a 
                    key={idx} 
                    href={s.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-1 hover:border-zinc-900 dark:hover:border-white transition-all"
                  >
                    {iconMapper[String(s.channel).toLowerCase()] || s.channel}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Sets - Asymmetric */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700">Explore</h4>
            <ul className="space-y-4 font-mono text-[10px] uppercase tracking-widest">
              {['Inventory', 'New Arrivals', 'Care Guides', 'The Studio'].map((item) => (
                <li key={item}>
                  <Link href={`/bookecommerce/${item.toLowerCase().replace(' ', '-')}`} className="flex items-center gap-2 group text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    {item}
                    <ArrowUpRightIcon className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700">Legal</h4>
            <ul className="space-y-4 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {['Terms', 'Privacy', 'Logistics', 'Cookies'].map((item) => (
                <li key={item}>
                  <Link href={`/bookecommerce/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact - Technical Block */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700">Connectivity</h4>
            <div className="space-y-4 font-mono text-[10px] uppercase tracking-widest">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="block hover:text-zinc-900 dark:hover:text-white transition-colors underline underline-offset-4 decoration-zinc-100 dark:decoration-zinc-900 truncate">
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="block text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  {contactPhone}
                </a>
              )}
              <div className="pt-4 flex items-center gap-3 text-zinc-300 dark:text-zinc-800">
                <GlobeAltIcon className="w-4 h-4" />
                <span>Global Archive Network</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- REGIONAL ARCHIVE LOCATIONS & ADDRESSES SHOWCASE --- */}
        <div className="mb-24 pt-12 border-t border-zinc-100 dark:border-zinc-900">
          <h4 className="font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-300 dark:text-zinc-700 mb-8 flex items-center gap-2">
            <MapPinIcon className="w-3.5 h-3.5 text-zinc-400" />
            Physical Studios & Spaces ({regionalAddresses.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const query = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

              return (
                <div 
                  key={idx} 
                  className="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800">
                        {loc.label || `Studio 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="font-mono text-[8px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">[Primary]</span>
                      )}
                    </div>
                    
                    <p className="font-mono text-xs text-zinc-800 dark:text-zinc-200 leading-snug">
                      {loc.address || 'Address information pending'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                        {[loc.city, loc.country].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2 font-mono text-[10px]">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <PhoneIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}
                    
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 uppercase tracking-widest text-zinc-900 dark:text-white hover:opacity-70 transition-opacity group-hover:translate-x-0.5 transition-transform"
                    >
                      View Map
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BOTTOM: TECHNICAL DATA STRIP */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ShieldCheckIcon className="w-5 h-5 text-zinc-200 dark:text-zinc-800" />
              <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-zinc-400">
                System: Verified / Deployment: {new Date().getFullYear()}
              </p>
            </div>
            <p className="font-mono text-[8px] text-zinc-300 dark:text-zinc-700 uppercase tracking-widest">
              &copy; {name || 'The Collective'} &mdash; All protocols reserved.
            </p>
          </div>

          {/* SalesmanPro Integration Tag */}
          <div className="flex flex-col items-end gap-2">
            <span className="font-mono text-[7px] uppercase tracking-widest text-zinc-400">Infrastructure provided by</span>
            <a 
              href="https://salesmanpro.site" 
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-zinc-900 dark:bg-zinc-800 px-6 py-3 rounded-full hover:bg-orange-600 transition-all"
            >
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-white">SalesmanPro</span>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:bg-white animate-pulse" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}