'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  TruckIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ArrowRightIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

// Hero Icon mapping for social channels
const SocialIcon = ({ channel }: { channel: any }) => {
  const name = (typeof channel === 'string' ? channel : channel?.name || '').toLowerCase();
  return <GlobeAltIcon className="w-4 h-4" />;
};

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name = "IMEVO",
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isMain: true
      }];

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative font-sans">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Column 1: Brand & Bio (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-2 rounded-lg">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">{name}.</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              {description || "Revolutionizing global supply chains through integrated rail, road, and maritime networks. Precision-driven logistics for the modern era."}
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s: any, i: number) => (
                <motion.a 
                  key={i} 
                  href={s.url} 
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-orange-600 hover:text-white transition-all shadow-lg"
                >
                  <SocialIcon channel={s.channel} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-black mb-8 flex items-center gap-2 italic uppercase text-slate-300 tracking-wider">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Navigation
            </h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              {[
                { label: "About Us", href: "/logistics/about" },
                { label: "Global Tracking", href: "/logistics/track" },
                { label: "Help Center", href: "/logistics/help" },
                { label: "Privacy Policy", href: "/logistics/privacy" },
                { label: "Terms of Service", href: "/logistics/terms" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Regional Hubs & Contact (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-black mb-8 flex items-center gap-2 italic uppercase text-slate-300 tracking-wider">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Regional Hubs
            </h4>

            <div className="space-y-3">
              {regionalAddresses.map((loc: any, idx: number) => {
                const label = loc?.label || (idx === 0 ? "Global HQ" : `Terminal Hub ${idx + 1}`);
                const fullAddress = typeof loc === "string" ? loc : loc?.address;
                const phone = loc?.contactPhone || contactPhone;
                const emailAddr = loc?.contactEmail || contactEmail;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || "")}`;

                return (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 hover:border-orange-500/30 transition-all space-y-2 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                          {label}
                        </span>
                        {(loc?.isMain || idx === 0) && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest bg-orange-600/20 text-orange-400 border border-orange-500/30 uppercase">
                            HQ
                          </span>
                        )}
                      </div>
                      {fullAddress && (
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
                          title="Open in Google Maps"
                        >
                          <span>Map</span>
                          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {fullAddress && (
                      <div className="flex items-start gap-2 text-xs text-slate-400">
                        <MapPinIcon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{fullAddress}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-white/5 text-[11px] text-slate-400">
                      {phone && (
                        <a href={`tel:${phone}`} className="flex items-center gap-1.5 hover:text-orange-400 transition-colors">
                          <PhoneIcon className="w-3 h-3 text-orange-500 shrink-0" />
                          <span>{phone}</span>
                        </a>
                      )}
                      {emailAddr && (
                        <a href={`mailto:${emailAddr}`} className="flex items-center gap-1.5 hover:text-orange-400 transition-colors truncate">
                          <EnvelopeIcon className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">{emailAddr}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 4: Newsletter (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-black mb-8 flex items-center gap-2 italic uppercase text-slate-300 tracking-wider">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Newsletter
            </h4>
            <p className="text-slate-400 text-sm mb-6">Subscribe for the latest industry insights and logistics trends.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Terminal Email Address" 
                className="w-full h-12 bg-slate-900 border border-white/5 rounded-xl pl-4 pr-12 text-sm focus:ring-2 focus:ring-orange-600 transition-all outline-none placeholder:text-slate-600 text-white" 
              />
              <button 
                aria-label="Subscribe"
                className="absolute right-1.5 top-1.5 h-9 px-3 bg-orange-600 hover:bg-white hover:text-orange-600 rounded-lg text-white transition-all flex items-center justify-center"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 opacity-70">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Network Status: Online</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {name} Solutions Inc. All Rights Reserved.
          </p>
          
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/logistics/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/logistics/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
            <Link href="/logistics/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>

        {/* Powered By Branding */}
        <div className="mt-8 pt-4 flex items-center gap-1.5 justify-center border-t border-white/5">
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

      </div>
    </footer>
  );
}