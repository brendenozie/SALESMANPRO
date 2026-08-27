'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  ArrowUpRightIcon, 
  SparklesIcon 
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
    name = "OPULENCE_OPTICS",
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

  const primary = themeSettings?.primaryColor || '#0D4C4F';
  const accent = '#F3A852'; // Peanut gold accent

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer 
      className="relative text-white pt-24 pb-12 overflow-hidden"
      style={{ backgroundColor: primary }}
    >
      {/* Decorative Brand Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none">
        <h2 className="text-[35vw] font-serif leading-none uppercase tracking-tighter">
          {name?.substring(0, 1) || 'O'}
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & About */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-3xl font-serif tracking-tight">{name}</h2>
            <p className="text-white/60 text-base font-light leading-relaxed max-w-sm">
              {description || 'Redefining the standard of optical luxury. Every frame tells a story of architectural precision and visionary design.'}
            </p>
            
            {/* Social Uplinks */}
            <div className="flex space-x-4">
              {socialLinks.length > 0 ? (
                socialLinks.map((s, idx) => {
                  const channel = String(s.channel).toLowerCase();
                  const icon = iconMapper[channel] || <SparklesIcon className="w-5 h-5" />;
                  return (
                    <motion.a
                      key={idx}
                      whileHover={{ y: -3, borderColor: accent, color: accent }}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center transition-colors"
                    >
                      {icon}
                    </motion.a>
                  );
                })
              ) : (
                <div className="text-xs font-light text-white/40 italic">Social channels offline</div>
              )}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>
                Atelier
              </h4>
              <ul className="space-y-4 text-sm font-light text-white/70">
                <li><Link href="/glassesecommerce/about" className="hover:text-white transition-colors">The Brand</Link></li>
                <li><Link href="/glassesecommerce/contact" className="hover:text-white transition-colors">Visit Us</Link></li>
                <li><Link href="/glassesecommerce/help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>
                Services
              </h4>
              <ul className="space-y-4 text-sm font-light text-white/70">
                <li><Link href="/glassesecommerce/shipping" className="hover:text-white transition-colors">Logistics</Link></li>
                <li><Link href="/glassesecommerce/returns" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link href="/glassesecommerce/track" className="hover:text-white transition-colors">Order Status</Link></li>
              </ul>
            </div>

            <div className="space-y-6 col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: accent }}>
                Direct Contact
              </h4>
              <div className="space-y-4 text-sm font-light text-white/70">
                {contactEmail && (
                  <p className="hover:text-white transition-colors truncate">
                    <a href={`mailto:${contactEmail}`} className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 shrink-0 text-white/40" />
                      <span className="truncate">{contactEmail}</span>
                    </a>
                  </p>
                )}
                {contactPhone && (
                  <p className="hover:text-white transition-colors">
                    <a href={`tel:${contactPhone}`} className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 shrink-0 text-white/40" />
                      <span>{contactPhone}</span>
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Boutiques & Flagship Locations Grid */}
        <div className="mb-20 pt-12 border-t border-white/10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: accent }}>
              <MapPinIcon className="w-4 h-4" />
              Flagships & Boutiques ({regionalAddresses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const query = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

              return (
                <div 
                  key={idx} 
                  className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between hover:border-white/30 transition-all duration-300 group backdrop-blur-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 text-white/90">
                        {loc.label || `Boutique 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] uppercase tracking-widest text-white/40 font-medium">Flagship</span>
                      )}
                    </div>
                    
                    <p className="text-sm font-light text-white/80 leading-relaxed pt-1">
                      {loc.address || 'Address on request'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-xs text-white/50 font-light">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-xs font-light">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0 text-white/30" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0 text-white/30" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}
                    
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 text-[11px] font-medium tracking-wider uppercase transition-colors group-hover:translate-x-1 duration-200"
                      style={{ color: accent }}
                    >
                      <span>Get Directions</span>
                      <ArrowUpRightIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Bottom / Legal & Attribution */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-8 text-[10px] font-medium uppercase tracking-widest text-white/40">
            <span>&copy; {new Date().getFullYear()} {name}. All Rights Reserved.</span>
            <Link href="/glassesecommerce/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/glassesecommerce/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm">
             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Architected by</span>
             <a 
               href="https://salesmanpro.site" 
               target="_blank"
               rel="noopener noreferrer"
               className="text-[10px] font-black uppercase tracking-[0.4em] hover:brightness-125 transition-all"
               style={{ color: accent }}
             >
               SalesmanPro
             </a>
          </div>
        </div>

      </div>
    </footer>
  );
}