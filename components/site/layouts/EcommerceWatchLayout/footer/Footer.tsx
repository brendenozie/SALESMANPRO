'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name = 'Horology Excellence',
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const gold = '#c5a059'; // Champagne Gold Accent

  return (
    <footer className="bg-[#050505] text-zinc-400 pt-24 pb-12 overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* --- Brand Statement --- */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-serif text-white tracking-widest uppercase italic">
              {name}
            </h2>
            <p className="text-sm leading-relaxed font-light max-w-sm">
              {description ||
                'Preserving the art of time since the dawn of the mechanical era. We curate only the finest complications for the discerning collector.'}
            </p>
            <div className="flex items-center gap-4 py-2">
              <ShieldCheckIcon className="w-5 h-5 text-amber-600/50" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Authorized Dealer</span>
            </div>
          </div>

          {/* --- Navigation Columns --- */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Navigation</h3>
              <ul className="space-y-4 text-xs tracking-wider">
                <li><Link href="/about" className="hover:text-amber-600 transition-colors">The Atelier</Link></li>
                <li><Link href="/collections" className="hover:text-amber-600 transition-colors">Collections</Link></li>
                <li><Link href="/bespoke" className="hover:text-amber-600 transition-colors">Bespoke Service</Link></li>
                <li><Link href="/contact" className="hover:text-amber-600 transition-colors">Private Viewing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Client Care</h3>
              <ul className="space-y-4 text-xs tracking-wider">
                <li><Link href="/shipping" className="hover:text-amber-600 transition-colors">Insured Shipping</Link></li>
                <li><Link href="/warranty" className="hover:text-amber-600 transition-colors">Lifetime Warranty</Link></li>
                <li><Link href="/authentication" className="hover:text-amber-600 transition-colors">Authentication</Link></li>
                <li><Link href="/faq" className="hover:text-amber-600 transition-colors">Collector FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* --- Contact & Social --- */}
          <div className="lg:col-span-3 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Connect</h3>
            <div className="space-y-4 text-xs">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-white transition-colors">
                  <EnvelopeIcon className="w-4 h-4 stroke-[1.5]" />
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 hover:text-white transition-colors">
                  <PhoneIcon className="w-4 h-4 stroke-[1.5]" />
                  {contactPhone}
                </a>
              )}
              <div className="flex items-center gap-3">
                <MapPinIcon className="w-4 h-4 stroke-[1.5]" />
                <span>Geneva • London • New York</span>
              </div>
            </div>

            {/* Refined Social Row */}
            <div className="flex gap-6 pt-4">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3 }}
                  href={s.url}
                  className="text-zinc-500 hover:text-amber-600 transition-colors"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{s.channel}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* --- Bottom Legal Bar --- */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-4 h-4 text-zinc-700" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              International Edition &copy; {new Date().getFullYear()} {name}
            </p>
          </div>
          
          <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
      
      {/* Visual Endcap: Faded Brand Monogram */}
      <div className="mt-12 flex justify-center opacity-[0.02]">
        <h1 className="text-[12vw] font-serif italic select-none leading-none">Horology</h1>
      </div>
    </footer>
  );
}