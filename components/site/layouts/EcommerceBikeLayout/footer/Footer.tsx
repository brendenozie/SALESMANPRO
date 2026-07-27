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
  ShieldCheckIcon,
  ArrowUpRightIcon
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
    name = 'Horology Excellence',
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},  
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

  const gold = themeSettings?.primaryColor || '#c5a059'; // Champagne Gold Accent

  return (
    <footer className="bg-[#050505] text-zinc-400 pt-24 pb-12 overflow-hidden border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* --- Brand Statement --- */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-serif text-white tracking-widest uppercase italic">
              {name}
            </h2>
            <p className="text-sm leading-relaxed font-light max-w-sm text-zinc-400">
              {description ||
                'Preserving the art of time since the dawn of the mechanical era. We curate only the finest complications for the discerning collector.'}
            </p>
            <div className="flex items-center gap-3 py-2 border-l-2 pl-4" style={{ borderColor: gold }}>
              <ShieldCheckIcon className="w-5 h-5" style={{ color: gold }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Authorized Official Dealer</span>
            </div>
          </div>

          {/* --- Navigation Columns --- */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Navigation</h3>
              <ul className="space-y-4 text-xs tracking-wider">
                <li><Link href="/bikeecommerce/about" className="hover:text-amber-500 transition-colors">The Atelier</Link></li>
                <li><Link href="/bikeecommerce/collections" className="hover:text-amber-500 transition-colors">Collections</Link></li>
                <li><Link href="/bikeecommerce/bespoke" className="hover:text-amber-500 transition-colors">Bespoke Service</Link></li>
                <li><Link href="/bikeecommerce/contact" className="hover:text-amber-500 transition-colors">Private Viewing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Client Care</h3>
              <ul className="space-y-4 text-xs tracking-wider">
                <li><Link href="/bikeecommerce/shipping" className="hover:text-amber-500 transition-colors">Insured Shipping</Link></li>
                <li><Link href="/bikeecommerce/warranty" className="hover:text-amber-500 transition-colors">Lifetime Warranty</Link></li>
                <li><Link href="/bikeecommerce/authentication" className="hover:text-amber-500 transition-colors">Authentication</Link></li>
                <li><Link href="/bikeecommerce/faq" className="hover:text-amber-500 transition-colors">Collector FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* --- Direct Contact & Social --- */}
          <div className="lg:col-span-3 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Concierge Direct</h3>
            <div className="space-y-4 text-xs">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <EnvelopeIcon className="w-4 h-4 stroke-[1.5] text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  <span className="truncate">{contactEmail}</span>
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <PhoneIcon className="w-4 h-4 stroke-[1.5] text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  <span className="font-mono">{contactPhone}</span>
                </a>
              )}
            </div>

            {/* Refined Social Row */}
            {socialLinks.length > 0 && (
              <div className="pt-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600 block mb-3">Follow The Manufacture</span>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((s, idx) => (
                    <motion.a
                      key={idx}
                      whileHover={{ y: -2 }}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-amber-500 transition-colors"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">{s.channel}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- REGIONAL SALONS & BOUTIQUES SHOWCASE --- */}
        <div className="mb-20 pt-12 border-t border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 stroke-[1.5]" style={{ color: gold }} />
              International Salons & Boutiques
            </h3>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
              {regionalAddresses.length} {regionalAddresses.length === 1 ? 'Location' : 'Locations'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const query = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

              return (
                <div 
                  key={idx} 
                  className="bg-zinc-950/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-white/10 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-zinc-900 border border-white/5"
                        style={{ color: gold }}
                      >
                        {loc.label || `Salon 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">[Flagship]</span>
                      )}
                    </div>
                    
                    <p className="text-xs font-medium text-zinc-300 leading-relaxed">
                      {loc.address || 'Address details available upon booking.'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-[11px] font-serif italic text-zinc-500">
                        {[loc.city, loc.country].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-xs">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-[11px]">{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate text-[11px]">{loc.contactEmail}</span>
                      </a>
                    )}
                    
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-bold uppercase tracking-widest transition-colors group-hover:translate-x-0.5 transition-transform"
                      style={{ color: gold }}
                    >
                      Locate Salon
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
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
            <Link href="/bikeecommerce/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/bikeecommerce/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/bikeecommerce/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
      
      {/* Visual Endcap: Faded Brand Monogram */}
      <div className="mt-12 flex justify-center opacity-[0.03] pointer-events-none select-none">
        <h1 className="text-[12vw] font-serif italic leading-none uppercase">Horology</h1>
      </div>

      {/* Powered By Attribution */}
      <div className="flex items-center gap-1.5 px-4 py-2 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-500 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>
    </footer>
  );
}