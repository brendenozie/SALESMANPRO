'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  FaceFrownIcon, 
  GlobeAltIcon, 
  CpuChipIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
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

  const primary = themeSettings?.primaryColor || '#f97316';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
    linkedin: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11.75 20h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.25 12.268h-3v-5.604c0-1.337-.026-3.059-1.865-3.059-1.865 0-2.151 1.459-2.151 2.967v5.696h-3v-11h2.881v1.507h.041c.401-.761 1.381-1.562 2.841-1.562 3.039 0 3.602 2.001 3.602 4.601v6.454z"/></svg>,
  };

  return (
    <footer className="bg-zinc-50 dark:bg-[#050505] text-black dark:text-white pt-24 pb-12 border-t border-black/5 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 blur-[120px] pointer-events-none opacity-[0.08]" 
        style={{ backgroundColor: primary }} 
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                {name || 'Storefront'}
              </h2>
              <p className="text-black/50 dark:text-white/40 text-sm font-medium leading-relaxed max-w-sm">
                {description || 'Setting the benchmark for high-performance gear and digital architectural standards since 2026.'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              {socialLinks.map((s, idx) => {
                const channel = String(s.channel).toLowerCase();
                const icon = iconMapper[channel] || <FaceFrownIcon className="w-5 h-5" />;
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -3, color: primary }}
                    href={`${s.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-black/20 dark:text-white/20 transition-colors"
                  >
                    {icon}
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* Column 1: Directory */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 dark:text-white/20">Directory</h4>
              <ul className="space-y-4">
                {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map((item) => (
                  <li key={item}>
                    <Link href={`/earphonesecommerce/${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-bold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Logistics */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 dark:text-white/20">Logistics</h4>
              <ul className="space-y-4">
                {['Help Center', 'Returns', 'Shipping', 'Track Order'].map((item) => (
                  <li key={item}>
                    <Link href={`/earphonesecommerce/${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-bold text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Transmission */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 dark:text-white/20">Transmission</h4>
              <div className="space-y-4">
                {contactEmail && (
                  <a href={`mailto:${contactEmail}`} className="block text-xs font-mono text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
                    {contactEmail}
                  </a>
                )}
                {contactPhone && (
                  <a href={`tel:${contactPhone}`} className="block text-xs font-mono text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
                    {contactPhone}
                  </a>
                )}
                <div className="pt-4 flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: primary }} />
                   <span className="text-[8px] font-black uppercase tracking-widest text-black/30 dark:text-white/20">Uplink Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Regional Showcase Section */}
        <div className="mb-16 pt-10 border-t border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2 text-black/40 dark:text-white/40">
              <MapPinIcon className="w-4 h-4" style={{ color: primary }} />
              Locations & Hubs ({regionalAddresses.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const query = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

              return (
                <div 
                  key={idx} 
                  className="bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-black/15 dark:hover:border-white/15 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
                        style={{ color: primary }}
                      >
                        {loc.label || `Hub 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-mono text-black/30 dark:text-white/30 uppercase tracking-widest">[Main HQ]</span>
                      )}
                    </div>
                    
                    <p className="text-xs text-black/70 dark:text-white/70 leading-relaxed font-medium">
                      {loc.address || 'Address provided upon dispatch request'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-xs text-black/40 dark:text-white/40 italic">
                        {[loc.city, loc.country].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 space-y-2 text-xs">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-[11px]">{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate text-[11px]">{loc.contactEmail}</span>
                      </a>
                    )}
                    
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 pt-2 text-[10px] font-bold uppercase tracking-widest hover:brightness-125 transition-all group-hover:translate-x-0.5 transition-transform"
                      style={{ color: primary }}
                    >
                      Locate on Map
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="pt-10 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <CpuChipIcon className="w-5 h-5 text-black/10 dark:text-white/10" />
            <p className="text-[10px] font-bold text-black/30 dark:text-white/20 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} {name || 'Storefront'}. Built on v3.0 Protocol.
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 grayscale opacity-20 hover:opacity-100 transition-opacity cursor-help">
              <GlobeAltIcon className="w-4 h-4 text-black dark:text-white" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-black dark:text-white">Global / EN</span>
            </div>
            <div className="flex gap-4">
               {['Sitemap', 'FAQ', 'Support'].map(link => (
                 <Link key={link} href={`/earphonesecommerce/${link.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-widest text-black/30 dark:text-white/20 hover:text-black dark:hover:text-white transition-colors">
                   {link}
                 </Link>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Powered By Badge */}
      <div className="flex items-center gap-1.5 px-4 py-2 mt-8 border border-black/5 dark:border-stone-800/50 rounded-full bg-black/[0.03] dark:bg-stone-900/50 backdrop-blur-sm text-center mx-auto w-max transition-colors">
        <span className="text-[10px] font-black uppercase tracking-widest text-black/40 dark:text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest transition-colors"
          style={{ color: primary }}
        >
          SalesmanPro.site
        </a>
      </div>
    </footer>
  );
}