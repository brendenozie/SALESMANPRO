'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ArrowUpRightIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  BuildingOffice2Icon
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

const iconMapper: Record<string, React.ReactNode> = {
  facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
  instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
  twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
};

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';
  const {
    name = "BOUTIQUE",
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
    <footer className="bg-white dark:bg-zinc-950 text-zinc-500 transition-colors duration-500 pt-24 pb-8 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* --- Top Section: Branding & Newsletter --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          <div className="lg:col-span-5 space-y-10">
            <h2 className="text-zinc-900 dark:text-white text-4xl font-black tracking-tighter uppercase italic leading-none">
              {name} <br />
              <span className="font-serif lowercase font-light text-zinc-400 dark:text-zinc-600">— the atelier</span>
            </h2>
            <p className="text-base leading-relaxed max-w-sm font-medium text-zinc-500 dark:text-zinc-400">
              {description || "Curating a new standard of digital elegance. We believe in the intersection of architectural form and functional beauty."}
            </p>
            
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -4, color: primaryColor, borderColor: primaryColor }}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-full transition-all text-zinc-400 dark:text-zinc-500"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || null}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-end">
            <div className="border-b-2 border-zinc-100 dark:border-zinc-900 pb-6 mb-8 group focus-within:border-zinc-900 dark:focus-within:border-white transition-colors">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600 block mb-4">
                Newsletter Access
              </span>
              <div className="flex items-center justify-between gap-4">
                <input 
                  type="email" 
                  placeholder="SUBSCRIBE@EMAIL.COM" 
                  className="bg-transparent border-none outline-none text-2xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white w-full placeholder:text-zinc-200 dark:placeholder:text-zinc-800 uppercase"
                />
                <button 
                  className="p-2 transition-transform duration-500 hover:rotate-45 shrink-0"
                  style={{ color: primaryColor }}
                  aria-label="Subscribe"
                >
                  <ArrowUpRightIcon className="w-10 h-10 md:w-14 md:h-14 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Navigation & Direct Contact Section --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 py-16 border-t border-zinc-100 dark:border-zinc-900">
          <div>
            <h4 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Collections</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li><Link href="/fashionecommerce/products" className="hover:opacity-50 transition-opacity">Ready to Wear</Link></li>
              <li><Link href="/fashionecommerce/categories" className="hover:opacity-50 transition-opacity">Limited Drop</Link></li>
              <li><Link href="/fashionecommerce/about" className="hover:opacity-50 transition-opacity">Archives</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Concierge</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li><Link href="/fashionecommerce/shipping" className="hover:opacity-50 transition-opacity">Shipping</Link></li>
              <li><Link href="/fashionecommerce/help" className="hover:opacity-50 transition-opacity">Assistance</Link></li>
              <li><Link href="/fashionecommerce/track" className="hover:opacity-50 transition-opacity">Tracking</Link></li>
            </ul>
          </div>
          <div className="col-span-2 space-y-4">
            <h4 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Direct Line</h4>
            <div className="space-y-3">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="block text-xl md:text-2xl font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors tracking-tighter uppercase truncate">
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="block text-base md:text-lg font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors tracking-tighter uppercase">
                  {contactPhone}
                </a>
              )}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 pt-2">
                EST. {new Date().getFullYear()} — Global Studio
              </p>
            </div>
          </div>
        </div>

        {/* --- Regional Atelier & Showroom Locations Showcase --- */}
        <div className="py-16 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2 mb-8">
            <BuildingOffice2Icon className="w-4 h-4 text-zinc-900 dark:text-white" />
            <h4 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em]">
              Atelier Locations ({regionalAddresses.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regionalAddresses.map((loc, idx) => {
              const locationQuery = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;

              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white">
                        {loc.label || `Studio 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: primaryColor }}>
                          Flagship
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed pt-2">
                      {loc.address || "Address available via private consultation."}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-2 text-xs">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    <a 
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                      style={{ color: primaryColor }}
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

        {/* --- Massive Typographic Signature --- */}
        <div className="pt-8 select-none overflow-hidden cursor-default group">
          <motion.h1 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[19vw] leading-[0.8] font-black uppercase tracking-tighter flex justify-between items-baseline text-zinc-100 dark:text-zinc-900 transition-colors duration-700 group-hover:text-zinc-200 dark:group-hover:text-zinc-800"
          >
            {name.split('').map((char, i) => (
              <span 
                key={i} 
                className={i % 2 === 1 ? 'font-serif italic font-light' : ''}
                style={i % 2 === 0 ? { WebkitTextStroke: '1px rgba(0,0,0,0.05)' } : {}}
              >
                {char}
              </span>
            ))}
          </motion.h1>
        </div>

        {/* --- Bottom Legal Bar --- */}
        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between gap-6 items-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            &copy; {name} Atelier / All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-1.5 transition-opacity">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">Powered by</span>
            <a 
              href="https://salesmanpro.site" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[12px] font-black uppercase tracking-[0.3em] text-orange-600 hover:text-orange-500 transition-colors"
            >
              SalesmanPro.site
            </a>
          </div>

          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-600">
            <Link href="/fashionecommerce/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Privacy</Link>
            <Link href="/fashionecommerce/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}