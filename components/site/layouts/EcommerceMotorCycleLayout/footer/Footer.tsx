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
  BuildingOfficeIcon,
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
              <ShieldCheckIcon className="w-5 h-5 text-amber-600/70" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Authorized Dealer</span>
            </div>
          </div>

          {/* --- Navigation Columns --- */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Navigation</h3>
              <ul className="space-y-4 text-xs tracking-wider">
                <li><Link href="/motorcycleecommerce/about" className="hover:text-amber-600 transition-colors">The Atelier</Link></li>
                <li><Link href="/motorcycleecommerce/collections" className="hover:text-amber-600 transition-colors">Collections</Link></li>
                <li><Link href="/motorcycleecommerce/bespoke" className="hover:text-amber-600 transition-colors">Bespoke Service</Link></li>
                <li><Link href="/motorcycleecommerce/contact" className="hover:text-amber-600 transition-colors">Private Viewing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Client Care</h3>
              <ul className="space-y-4 text-xs tracking-wider">
                <li><Link href="/motorcycleecommerce/shipping" className="hover:text-amber-600 transition-colors">Insured Shipping</Link></li>
                <li><Link href="/motorcycleecommerce/warranty" className="hover:text-amber-600 transition-colors">Lifetime Warranty</Link></li>
                <li><Link href="/motorcycleecommerce/authentication" className="hover:text-amber-600 transition-colors">Authentication</Link></li>
                <li><Link href="/motorcycleecommerce/faq" className="hover:text-amber-600 transition-colors">Collector FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* --- Contact & Social --- */}
          <div className="lg:col-span-3 space-y-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-8">Connect</h3>
            <div className="space-y-4 text-xs">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <EnvelopeIcon className="w-4 h-4 stroke-[1.5] text-amber-600/80 group-hover:text-amber-600 shrink-0" />
                  <span className="truncate">{contactEmail}</span>
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 hover:text-white transition-colors group">
                  <PhoneIcon className="w-4 h-4 stroke-[1.5] text-amber-600/80 group-hover:text-amber-600 shrink-0" />
                  <span>{contactPhone}</span>
                </a>
              )}
            </div>

            {/* Refined Social Row */}
            <div className="flex flex-wrap gap-6 pt-4">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3 }}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-amber-600 transition-colors"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest">{s.channel}</span>
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* --- Regional Salons Showcase --- */}
        <div className="py-12 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <BuildingOfficeIcon className="w-4 h-4 text-amber-600" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">
              Regional Salons ({regionalAddresses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const locationQuery = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;

              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col justify-between hover:border-amber-600/40 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-zinc-900 border border-white/10 text-amber-500">
                        {loc.label || `Salon 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                          Main Flagship
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-light text-zinc-300 leading-relaxed pt-1">
                      {loc.address || 'Address available by appointment.'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-[11px] font-medium text-zinc-500">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-xs">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    <a 
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-500 transition-colors"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                      <ArrowUpRightIcon className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
            <Link href="/motorcycleecommerce/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/motorcycleecommerce/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/motorcycleecommerce/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
      
      {/* Visual Endcap: Faded Brand Monogram */}
      <div className="mt-12 flex justify-center opacity-[0.02]">
        <h1 className="text-[12vw] font-serif italic select-none leading-none">Horology</h1>
      </div>

      <div className="flex items-center gap-1.5 px-4 py-2 mt-4 justify-center">
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