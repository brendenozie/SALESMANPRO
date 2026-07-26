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
  GlobeAltIcon
} from '@heroicons/react/24/outline';

// Hero Icon mapping for social channels
const SocialIcon = ({ channel }: { channel: any }) => {
  const name = (typeof channel === 'string' ? channel : channel.name || '').toLowerCase();
  // Using GlobeAlt as a generic high-tech fallback for social links
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
        contactEmail: contactEmail
      }];

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative font-sans">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-2 rounded-lg shadow-lg shadow-orange-900/20">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">{name}.</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              {description || "Revolutionizing global supply chains through integrated rail, road, and maritime networks. Precision-driven logistics for the modern era."}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s: any, i: number) => (
                <motion.a 
                  key={i} 
                  href={s.url} 
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400 hover:bg-orange-600 hover:text-white transition-all shadow-lg hover:shadow-orange-600/20"
                >
                  <SocialIcon channel={s.channel} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Navigation
            </h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              {[
                { label: "About Us", href: "/companyprofile/about" },
                { label: "Global Tracking", href: "/companyprofile/track" },
                { label: "Help Center", href: "/companyprofile/help" },
                { label: "Privacy Policy", href: "/companyprofile/privacy" },
                { label: "Terms of Service", href: "/companyprofile/terms" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-orange-500 transition-colors flex items-center gap-2 group w-fit">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Regional Hubs (Limited to 3) */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Regional Hubs
            </h4>
            <div className="space-y-6">
              {regionalAddresses.map((loc: any, idx: number) => (
                <div 
                  key={idx} 
                  className="relative pl-4 border-l-2 border-slate-800 hover:border-orange-500 transition-colors group"
                >
                  <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-2">
                    {loc.label || `Location ${idx + 1}`}
                    {loc.isMain && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] bg-orange-500/20 text-orange-500">HQ</span>
                    )}
                  </h5>
                  <ul className="space-y-2.5 text-slate-400 text-[13px]">
                    <li className="flex gap-3 items-start">
                      <MapPinIcon className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{loc.address}</span>
                    </li>
                    {loc.contactPhone && (
                      <li className="flex gap-3 items-center">
                        <PhoneIcon className="w-4 h-4 text-orange-600 shrink-0" />
                        <a href={`tel:${loc.contactPhone}`} className="hover:text-white transition-colors">{loc.contactPhone}</a>
                      </li>
                    )}
                    {loc.contactEmail && (
                      <li className="flex gap-3 items-center">
                        <EnvelopeIcon className="w-4 h-4 text-orange-600 shrink-0" />
                        <a href={`mailto:${loc.contactEmail}`} className="hover:text-white transition-colors truncate">{loc.contactEmail}</a>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Newsletter
            </h4>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Subscribe for the latest industry insights and logistics trends.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Terminal Email Address" 
                className="w-full h-14 bg-slate-900 border border-white/5 rounded-xl px-4 pr-14 text-sm focus:ring-2 focus:ring-orange-600 transition-all outline-none placeholder:text-slate-600 text-white" 
              />
              <button className="absolute right-2 top-2 h-10 px-3 bg-orange-600 hover:bg-white hover:text-orange-600 rounded-lg text-white transition-all">
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 opacity-50">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Systems Online</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-center md:text-left">
            © {new Date().getFullYear()} {name} Solutions Inc. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/companyprofile/faq" className="hover:text-orange-500 transition-colors">FAQ</Link>
            <Link href="/companyprofile/sitemap.xml" className="hover:text-orange-500 transition-colors">Sitemap</Link>
            <Link href="/companyprofile/support" className="hover:text-orange-500 transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {/* Powered By Watermark */}
      <div className="flex items-center gap-1.5 px-4 pt-6 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-orange-600/80 hover:text-orange-500 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>
    </footer>
  );
}