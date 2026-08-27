'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  FaceSmileIcon, 
  ArrowUpIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  ArrowUpRightIcon,
  BuildingStorefrontIcon 
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
    name = "The Golden Reserve",
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

  const goldAccent = '#F3A852';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>,
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-[#1A1612] text-stone-400 pt-20 pb-10 overflow-hidden border-t border-stone-800/50">
      {/* Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/topography.png')]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Pillar */}
          <div className="md:col-span-5">
            <h2 className="text-3xl font-serif italic text-white mb-6">
              {name}
            </h2>
            <p className="text-sm leading-relaxed mb-8 max-w-sm">
              {description || 'Crafting the finest raw, unfiltered honey since the turn of the decade. Our mission is to preserve the ancient link between bees, blossom, and your table.'}
            </p>
            <div className="flex flex-col gap-3">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                    <EnvelopeIcon className="w-4 h-4 text-stone-500 group-hover:text-amber-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500 group-hover:text-white transition-colors truncate">{contactEmail}</span>
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full border border-stone-800 flex items-center justify-center group-hover:border-amber-500 transition-colors">
                    <PhoneIcon className="w-4 h-4 text-stone-500 group-hover:text-amber-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500 group-hover:text-white transition-colors">{contactPhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8">Navigation</h4>
            <ul className="space-y-4">
              {['Shop', 'Our Story', 'Wholesale', 'Sustainability'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium hover:text-white transition-all hover:pl-2">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8">Guidance</h4>
            <ul className="space-y-4">
              {['Shipping', 'Returns', 'Storage Guide', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm font-medium hover:text-white transition-all hover:pl-2">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Back to Top */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between">
            <div className="flex gap-4">
              {socialLinks.length > 0 ? socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -5 }}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-all shadow-xl"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <FaceSmileIcon className="w-5 h-5" />}
                </motion.a>
              )) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-700 italic">Follow our harvest online</span>
              )}
            </div>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="mt-12 md:mt-0 group flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-[#1A1612] shadow-2xl shadow-amber-500/20 group-hover:bg-white transition-colors">
                <ArrowUpIcon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-600 group-hover:text-amber-500 transition-colors">Top</span>
            </motion.button>
          </div>
        </div>

        {/* Store Addresses Grid */}
        <div className="mb-16 pt-12 border-t border-stone-800/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 flex items-center gap-2">
              <BuildingStorefrontIcon className="w-4 h-4 text-amber-500" />
              Our Locations ({regionalAddresses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const query = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

              return (
                <div 
                  key={idx} 
                  className="bg-stone-900/60 border border-stone-800 p-6 rounded-2xl flex flex-col justify-between hover:border-stone-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-stone-800 text-amber-400 border border-stone-700/50">
                        {loc.label || `Reserve Branch 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Main Location</span>
                      )}
                    </div>
                    
                    <p className="text-xs font-serif text-stone-300 leading-relaxed pt-1">
                      {loc.address || 'Location details available upon request'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-[11px] text-stone-500 font-medium">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-800/80 space-y-2 text-xs">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-stone-500" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0 text-stone-500" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}
                    
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors group-hover:translate-x-1 duration-200"
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <span>Directions</span>
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legal & Final Stamp */}
        <div className="pt-10 border-t border-stone-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
              &copy; {new Date().getFullYear()} {name}. Built by Nature.
            </p>
          </div>

          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-stone-600">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Accessibility</Link>
          </div>
        </div>

        {/* Powered by SalesmanPro */}
        <div className="flex items-center gap-1.5 px-4 py-2 mt-8 border border-stone-800/50 rounded-full bg-stone-900/50 backdrop-blur-sm text-center mx-auto w-max">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">Powered by</span>
          <a 
            href="https://salesmanpro.site" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
          >
            SalesmanPro.site
          </a>
        </div>
      </div>
    </footer>
  );
}