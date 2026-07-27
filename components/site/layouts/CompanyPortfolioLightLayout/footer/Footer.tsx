'use client';

import React, { useState } from 'react';
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
  ArrowTopRightOnSquareIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Hero Icon mapping for social channels
const SocialIcon = ({ channel }: { channel: any }) => {
  return <GlobeAltIcon className="w-4 h-4" />;
};

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const {
    name = "IMEVO",
    description,
    socialLinks = [],
    contactEmail,
    contactPhone,
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

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Simulate successful submission feedback
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 4000);
  };

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white pt-24 pb-12 overflow-hidden relative font-sans border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      {/* Background Glow Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-2 rounded-lg text-white shadow-sm">
                <TruckIcon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white">
                {name}.
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm transition-colors">
              {description || "Revolutionizing global supply chains through integrated rail, road, and maritime networks. Precision-driven logistics for the modern era."}
            </p>
            
            {socialLinks.length > 0 && (
              <div className="flex gap-3 pt-2">
                {socialLinks.map((s: any, i: number) => {
                  const url = typeof s === 'string' ? s : s?.url || '#';
                  return (
                    <motion.a 
                      key={i} 
                      href={url} 
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ y: -3 }}
                      aria-label={`Visit our ${s?.channel || 'social'} channel`}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all shadow-sm dark:shadow-none"
                    >
                      <SocialIcon channel={s?.channel || s} />
                    </motion.a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase text-zinc-900 dark:text-zinc-100">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Navigation
            </h4>
            <ul className="space-y-4 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
              {[
                { label: "About Us", href: "/companyprofile/about" },
                { label: "Global Tracking", href: "/companyprofile/track" },
                { label: "Help Center", href: "/companyprofile/help" },
                { label: "Privacy Policy", href: "/companyprofile/privacy" },
                { label: "Terms of Service", href: "/companyprofile/terms" }
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors flex items-center gap-2 group w-fit"
                  >
                    <ArrowRightIcon className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-600 dark:text-orange-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Regional Addresses / Hubs */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase text-zinc-900 dark:text-zinc-100">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Regional Hubs
            </h4>
            <div className="space-y-6">
              {regionalAddresses.map((loc: any, idx: number) => {
                const label = loc?.label || (idx === 0 ? "Headquarters" : `Hub ${idx + 1}`);
                const fullAddress = typeof loc === 'string' ? loc : loc?.address;
                const phone = loc?.contactPhone || contactPhone;
                const emailAddr = loc?.contactEmail || contactEmail;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || '')}`;

                return (
                  <div 
                    key={idx} 
                    className="relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 hover:border-orange-500 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-2">
                        {label}
                        {(loc?.isMain || idx === 0) && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                            HQ
                          </span>
                        )}
                      </h5>
                      
                      {fullAddress && (
                        <a 
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open location in Google Maps"
                          className="text-[10px] text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-0.5 transition-colors"
                        >
                          Directions
                          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <ul className="space-y-2 text-zinc-600 dark:text-zinc-400 text-[13px]">
                      {fullAddress && (
                        <li className="flex gap-2.5 items-start">
                          <MapPinIcon className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                          <span className="leading-snug text-zinc-700 dark:text-zinc-300">{fullAddress}</span>
                        </li>
                      )}
                      
                      {phone && (
                        <li className="flex gap-2.5 items-center">
                          <PhoneIcon className="w-4 h-4 text-orange-600 shrink-0" />
                          <a href={`tel:${phone}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors">{phone}</a>
                        </li>
                      )}
                      
                      {emailAddr && (
                        <li className="flex gap-2.5 items-center">
                          <EnvelopeIcon className="w-4 h-4 text-orange-600 shrink-0" />
                          <a href={`mailto:${emailAddr}`} className="hover:text-zinc-900 dark:hover:text-white transition-colors truncate">{emailAddr}</a>
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 4: Interactive Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase text-zinc-900 dark:text-zinc-100">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Newsletter
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
              Subscribe for the latest industry insights and logistics trends.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="relative group">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Terminal Email Address" 
                className="w-full h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 pr-14 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-600 transition-all outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm dark:shadow-none" 
              />
              <button 
                type="submit" 
                disabled={isSubscribed}
                aria-label="Subscribe to newsletter"
                className="absolute right-2 top-2 h-10 px-3 bg-orange-600 hover:bg-orange-500 disabled:bg-emerald-600 text-white rounded-lg transition-all shadow-sm flex items-center justify-center"
              >
                {isSubscribed ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
              </button>
            </form>

            {isSubscribed && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                ✓ Subscribed to terminal updates.
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 opacity-60">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Network Status: Online
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] text-center md:text-left">
            © {new Date().getFullYear()} {name} Solutions Inc. All Rights Reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <Link href="/companyprofile/faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors">FAQ</Link>
            <Link href="/companyprofile/sitemap.xml" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Sitemap</Link>
            <Link href="/companyprofile/support" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {/* Brand Attribution Footer */}
      <div className="flex items-center gap-1.5 px-4 pt-8 justify-center relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Powered by
        </span>
        <a 
          href="https://salesmanpro.site" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>
    </footer>
  );
}