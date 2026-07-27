'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  GlobeAltIcon,
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

const iconMapper: Record<string, React.ReactNode> = {
  facebook: (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  ),
  instagram: (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
};

export default function RootFooter() {
  const { storeFormData } = useStoreContext();
  
  const {
    name = 'Agrovet',
    description,
    contactEmail: globalEmail,
    contactPhone: globalPhone,
    socialLinks = [],
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Normalize addresses array with fallback to legacy field
  const regionalAddresses: AddressItem[] = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: globalPhone,
        contactEmail: globalEmail,
        isPrimary: true
      }];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for newsletter signup
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- TOP: Newsletter & Links --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-6">
              Subscribe to <span className="text-emerald-500 italic font-serif font-light">Yield Updates.</span>
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm font-medium">
              Get seasonal planting guides, livestock health tips, and exclusive pricing directly in your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="relative max-w-md">
              <input 
                type="email" 
                required
                placeholder="farmer@example.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 px-6 pr-28 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-xl font-bold transition-all"
              >
                Join
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Supply Chain</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/agrovetecommerce/products" className="hover:text-emerald-400 transition-colors">Agrochemicals</Link></li>
                <li><Link href="/agrovetecommerce/products" className="hover:text-emerald-400 transition-colors">Certified Seeds</Link></li>
                <li><Link href="/agrovetecommerce/products" className="hover:text-emerald-400 transition-colors">Animal Health</Link></li>
                <li><Link href="/agrovetecommerce/products" className="hover:text-emerald-400 transition-colors">Bulk Equipment</Link></li>
              </ul>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Partnership</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/agrovetecommerce/about" className="hover:text-emerald-400 transition-colors">Our Story</Link></li>
                <li><Link href="/agrovetecommerce/contact" className="hover:text-emerald-400 transition-colors">Vet Consultation</Link></li>
                <li><Link href="/agrovetecommerce/shipping" className="hover:text-emerald-400 transition-colors">Logistics</Link></li>
                <li><Link href="/agrovetecommerce/faq" className="hover:text-emerald-400 transition-colors">Help Desk</Link></li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1 space-y-6 border-t border-slate-900 md:border-none pt-8 md:pt-0">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Direct Dispatch</h3>
              <div className="space-y-4 text-sm">
                {globalEmail && (
                  <a href={`mailto:${globalEmail}`} className="flex items-center gap-3 hover:text-white transition-colors truncate">
                    <EnvelopeIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">{globalEmail}</span>
                  </a>
                )}
                {globalPhone && (
                  <a href={`tel:${globalPhone}`} className="flex items-center gap-3 hover:text-white transition-colors font-mono">
                    <PhoneIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{globalPhone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- REGIONAL ADDRESSES SHOWCASE --- */}
        <div className="mb-16 pt-12 border-t border-slate-900">
          <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-8 flex items-center gap-2">
            <MapPinIcon className="w-4 h-4 text-emerald-500" />
            Regional Service Centers ({regionalAddresses.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const query = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

              return (
                <div 
                  key={idx} 
                  className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {loc.label || `Branch 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[10px] font-mono text-slate-500 uppercase">[Main HQ]</span>
                      )}
                    </div>
                    
                    <p className="text-sm font-bold text-slate-200 leading-snug">
                      {loc.address || 'Address information pending'}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-xs font-medium text-slate-500">
                        {[loc.city, loc.country].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 space-y-2 text-xs">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-mono">{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}
                    
                    <a 
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 pt-2 text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors group-hover:translate-x-0.5 transition-transform"
                    >
                      Get Directions
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- MIDDLE: Brand Banner --- */}
        <div className="py-12 border-y border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl font-black">
              {name?.charAt(0) || 'A'}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                {name}
              </h2>
              {description && (
                <p className="text-xs text-slate-500 max-w-md line-clamp-1">{description}</p>
              )}
            </div>
          </div>

          {socialLinks.length > 0 && (
            <div className="flex gap-3">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3, color: '#10b981' }}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full border border-slate-800 flex items-center justify-center text-slate-400 hover:border-emerald-500/50 transition-colors"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <GlobeAltIcon className="w-5 h-5" />}
                </motion.a>
              ))}
            </div>
          )}
        </div>

        {/* --- BOTTOM: Copyright & Legal --- */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-slate-600 tracking-wider">
            &copy; {new Date().getFullYear()} {name}. Built for the Modern Farmer.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <Link href="/agrovetecommerce/privacy" className="hover:text-emerald-500 transition-colors">Privacy</Link>
            <Link href="/agrovetecommerce/terms" className="hover:text-emerald-500 transition-colors">Terms</Link>
            <Link href="/agrovetecommerce/sitemap.xml" className="hover:text-emerald-500 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-4 py-2 mt-8 justify-center border-t border-slate-900/60">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>
    </footer>
  );
}