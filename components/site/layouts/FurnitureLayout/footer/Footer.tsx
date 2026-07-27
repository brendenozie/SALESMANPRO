'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  FaceSmileIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
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
    name,
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

  const primary = themeSettings?.primaryColor || '#18181b';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-4 h-4' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-white dark:bg-zinc-950 pt-24 pb-12 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      
      {/* Background Brand Ghosting */}
      <div className="absolute -bottom-10 left-0 w-full overflow-hidden pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none">
        <h1 className="text-[25vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
          {name || 'CURATED'}
        </h1>
      </div>

      <div className="max-w-[1700px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          
          {/* Column 1: The Brand Statement */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-2xl font-light tracking-tighter uppercase text-zinc-900 dark:text-white">
              {name}<span className="font-serif italic lowercase text-zinc-400">.studio</span>
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm">
              {description || 'Crafting living spaces through architectural precision and generational materiality. Every piece is a dialogue between form and function.'}
            </p>
            <div className="space-y-2 pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 underline decoration-zinc-200 underline-offset-8">Inquiries</p>
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-zinc-500 transition-colors">
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 hover:text-zinc-500 transition-colors">
                  {contactPhone}
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Navigation</h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-300">
              <li><Link href="/furnitureecommerce/about" className="hover:text-zinc-400 transition-colors duration-300">About the Studio</Link></li>
              <li><Link href="/furnitureecommerce/contact" className="hover:text-zinc-400 transition-colors duration-300">Contact</Link></li>
              <li><Link href="/furnitureecommerce/privacy" className="hover:text-zinc-400 transition-colors duration-300">Privacy Policy</Link></li>
              <li><Link href="/furnitureecommerce/terms" className="hover:text-zinc-400 transition-colors duration-300">Terms</Link></li>
            </ul>
          </div>

          {/* Column 3: Logistics Links */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Logistics</h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-300">
              <li><Link href="/furnitureecommerce/shipping" className="hover:text-zinc-400 transition-colors duration-300">White-Glove Shipping</Link></li>
              <li><Link href="/furnitureecommerce/returns" className="hover:text-zinc-400 transition-colors duration-300">Return Policy</Link></li>
              <li><Link href="/furnitureecommerce/track" className="hover:text-zinc-400 transition-colors duration-300">Track Shipment</Link></li>
              <li><Link href="/furnitureecommerce/help" className="hover:text-zinc-400 transition-colors duration-300">Support Center</Link></li>
            </ul>
          </div>

          {/* Column 4: Social & Region */}
          <div className="lg:col-span-4 space-y-8 lg:text-right flex flex-col lg:items-end">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Connect</h3>
            <div className="flex gap-4">
              {socialLinks.map((s: { channel: string; url: string }, idx: number) => {
                const channel = String(s.channel).toLowerCase();
                const icon = iconMapper[channel] || <FaceSmileIcon className="w-4 h-4" />;
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -3 }}
                    href={`${s.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500 rounded-full"
                  >
                    {icon}
                  </motion.a>
                );
              })}
            </div>
            <div className="pt-8">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                Local time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} GMT
              </p>
            </div>
          </div>
        </div>

        {/* Global Showrooms & Locations Showcase */}
        <div className="py-12 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2 mb-8">
            <MapPinIcon className="w-4 h-4 text-zinc-400" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
              Showrooms & Studios ({regionalAddresses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {regionalAddresses.map((loc, idx) => {
              const fullQuery = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;

              return (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-white dark:hover:bg-zinc-900/60 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-zinc-200/50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300">
                        {loc.label || `Studio 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                          Main Studio
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed pt-2">
                      {loc.address || "Studio location available on appointment."}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60 space-y-2.5 text-xs font-medium">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    <a 
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-zinc-900 dark:text-white hover:text-zinc-500 transition-colors"
                    >
                      <span>Directions</span>
                      <ArrowUpRightIcon className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar: The Fine Print */}
        <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            &copy; {new Date().getFullYear()} {name}. Built for permanence.
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            <Link href="/furnitureecommerce/faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors">FAQ</Link>
            <Link href="/furnitureecommerce/sitemap.xml" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>

        {/* System Credits */}
        <div className="flex items-center gap-1.5 px-4 py-2 mt-6 justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Powered by</span>
          <a 
            href="https://salesmanpro.site" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
          >
            SalesmanPro.site
          </a>
        </div>
      </div>

    </footer>
  );
}