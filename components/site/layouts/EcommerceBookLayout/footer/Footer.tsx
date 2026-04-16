'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ArrowUpRightIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
  } = storeFormData || {};

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 mb-32">
          
          {/* Brand Manifesto */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-400">Status: Online Archive</span>
            </div>
            <p className="text-2xl font-serif italic text-zinc-800 dark:text-zinc-200 leading-snug max-w-md">
              {description || 'Curating essentials for the next generation with a focus on architectural integrity and soft utility.'}
            </p>
            <div className="flex gap-6 pt-4">
              {socialLinks.map((s, idx) => (
                <a 
                  key={idx} 
                  href={s.url} 
                  className="font-mono text-[10px] uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-800 pb-1 hover:border-zinc-900 dark:hover:border-white transition-all"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || s.channel}
                </a>
              ))}
            </div>
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
              <a href={`mailto:${contactEmail}`} className="block hover:text-zinc-900 dark:hover:text-white transition-colors underline underline-offset-4 decoration-zinc-100 dark:decoration-zinc-900">
                {contactEmail}
              </a>
              <p className="text-zinc-500">{contactPhone}</p>
              <div className="pt-4 flex items-center gap-3 text-zinc-300 dark:text-zinc-800">
                <GlobeAltIcon className="w-4 h-4" />
                <span>Nairobi HQ / Global Sync</span>
              </div>
            </div>
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
              &copy; {name} &mdash; All protocols reserved.
            </p>
          </div>

          {/* SalesmanPro Integration Tag */}
          <div className="flex flex-col items-end gap-2">
            <span className="font-mono text-[7px] uppercase tracking-widest text-zinc-400">Infrastructure provided by</span>
            <a 
              href="https://salesmanpro.site" 
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