'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  CommandLineIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowUpRightIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/solid';

interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

export default function CommandFooter() {
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
        label: "Global Headquarters Node",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isPrimary: true
      }];

  const primary = themeSettings?.primaryColor || '#F59E0B'; // Tactical Amber

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-[#050505] text-zinc-500 overflow-hidden border-t-2 border-zinc-900">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 pt-40 pb-12 relative z-10">
        
        {/* Massive Kinetic Header */}
        <div className="mb-32 overflow-hidden select-none pointer-events-none">
          <motion.h1 
            initial={{ x: '-10%' }}
            animate={{ x: '0%' }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-[15vw] font-black text-white/5 uppercase italic leading-none whitespace-nowrap tracking-tighter"
          >
            {name} • SalesmanPro OS • Digital Procurement • {name} •
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24">
          {/* Brand & Dispatch */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                 <CommandLineIcon className="w-8 h-8" style={{ color: primary }} />
                 <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">{name}</h3>
               </div>
               <p className="text-xl font-bold text-zinc-400 leading-tight uppercase tracking-tighter max-w-md">
                 {description || 'Next-generation industrial operating system for the Kenyan market. Real-time logistics, automated sales, and regional scaling.'}
               </p>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: primary }}>Social Uplink</span>
              <div className="flex gap-4">
                {socialLinks.map((s, idx) => (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -5, color: '#FFF' }}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-zinc-900 border-2 border-zinc-800 flex items-center justify-center transition-all group relative"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: primary }} />
                    {iconMapper[String(s.channel).toLowerCase()] || <GlobeAltIcon className="w-6 h-6" />}
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.5em] border-l-2 pl-4" style={{ borderColor: primary }}>Operations</h4>
              <ul className="space-y-4 text-xs font-black uppercase tracking-widest">
                {['Direct API', 'Storefronts', 'Logistics', 'Procurement', 'Security'].map((item) => (
                  <li key={item}>
                    <Link href={`/hardwareecommerce/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-amber-500 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.5em] border-l-2 pl-4" style={{ borderColor: primary }}>Network</h4>
              <ul className="space-y-4 text-xs font-black uppercase tracking-widest">
                {['Documentation', 'Developer Hub', 'Regional Nodes', 'Cloud Status', 'Support'].map((item) => (
                  <li key={item}>
                    <Link href={`/hardwareecommerce/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-amber-500 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1 space-y-8">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.5em] border-l-2 pl-4" style={{ borderColor: primary }}>HQ_Dispatch</h4>
              <div className="space-y-6 font-mono text-[11px] font-bold uppercase tracking-tighter">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primary }} />
                  <p className="text-zinc-300">
                    {regionalAddresses[0]?.address || 'Nairobi Industrial HQ, Kenya'}
                  </p>
                </div>
                {contactEmail && (
                  <div className="flex items-center gap-3">
                    <EnvelopeIcon className="w-4 h-4 shrink-0" style={{ color: primary }} />
                    <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors truncate">{contactEmail}</a>
                  </div>
                )}
                {contactPhone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="w-4 h-4 shrink-0" style={{ color: primary }} />
                    <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">{contactPhone}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Regional Network Address Grid */}
        <div className="mb-20 pt-12 border-t border-zinc-900">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
              <BuildingOfficeIcon className="w-4 h-4" style={{ color: primary }} />
              Active Address Nodes ({regionalAddresses.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const query = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

              return (
                <div 
                  key={idx} 
                  className="bg-zinc-950 border border-zinc-900 p-6 rounded-none flex flex-col justify-between hover:border-zinc-700 transition-all group relative"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {loc.label || `NODE 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-500">PRIMARY NODE</span>
                      )}
                    </div>

                    <p className="text-xs font-mono font-bold text-zinc-300 leading-relaxed uppercase">
                      {loc.address || 'Address details classified'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">
                        {[loc.city, loc.country].filter(Boolean).join(' // ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-900 space-y-3 font-mono text-[10px]">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 text-[10px] font-black uppercase tracking-widest transition-transform group-hover:translate-x-1 duration-200"
                      style={{ color: primary }}
                    >
                      <MapPinIcon className="w-3.5 h-3.5" />
                      <span>GPS Coordinates</span>
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Bar */}
        <div className="pt-12 border-t border-zinc-900 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900 border border-zinc-800">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Status: Operational</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
              &copy; {new Date().getFullYear()} {name} Core. Unauthorized access is prohibited.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700 italic">Developed by</span>
              <a 
                href="https://salesmanpro.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[14px] font-black uppercase tracking-widest text-white hover:text-amber-500 transition-colors"
              >
                SalesmanPro<span style={{ color: primary }}>.site</span>
              </a>
            </div>
            <div className="flex items-center gap-4 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
              <ShieldCheckIcon className="w-5 h-5" />
              <CommandLineIcon className="w-5 h-5" />
              <GlobeAltIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}