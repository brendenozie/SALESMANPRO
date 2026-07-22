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
  const name = (typeof channel === 'string' ? channel : channel?.name || '').toLowerCase();
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
    address = "Lusingeti Road, Number 31, Industrial Area, Nairobi",
  } = storeFormData || {};

  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white pt-24 pb-12 overflow-hidden relative font-sans border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
      {/* Subtle Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
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
            <div className="flex gap-4">
              {socialLinks.map((s: any, i: number) => (
                <motion.a 
                  key={i} 
                  href={s.url} 
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white dark:hover:text-white transition-all shadow-sm dark:shadow-none"
                >
                  <SocialIcon channel={s.channel} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
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
                    className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRightIcon className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-600 dark:text-orange-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase text-zinc-900 dark:text-zinc-100">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Contact Hub
            </h4>
            <ul className="space-y-6 text-zinc-600 dark:text-zinc-400 text-sm">
              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-orange-500/50 transition-colors shadow-sm dark:shadow-none">
                  <MapPinIcon className="w-5 h-5 text-orange-600" />
                </div>
                <span className="group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">{address}</span>
              </li>
              {contactPhone && (
                <li className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-orange-500/50 transition-colors shadow-sm dark:shadow-none">
                    <PhoneIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <a href={`tel:${contactPhone}`} className="group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                    {contactPhone}
                  </a>
                </li>
              )}
              {contactEmail && (
                <li className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-orange-500/50 transition-colors shadow-sm dark:shadow-none">
                    <EnvelopeIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <a href={`mailto:${contactEmail}`} className="group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors">
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase text-zinc-900 dark:text-zinc-100">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Newsletter
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
              Subscribe for the latest industry insights and logistics trends.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Terminal Email Address" 
                className="w-full h-14 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-orange-600 transition-all outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-sm dark:shadow-none" 
              />
              <button 
                aria-label="Subscribe to newsletter"
                className="absolute right-2 top-2 h-10 px-4 bg-orange-600 hover:bg-zinc-900 dark:hover:bg-white dark:hover:text-zinc-900 rounded-lg text-white transition-all shadow-sm"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 opacity-60">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Network Status: Online
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-zinc-200 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {name} Solutions Inc. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <Link href="/companyprofile/faq" className="hover:text-zinc-900 dark:hover:text-white transition-colors">FAQ</Link>
            <Link href="/companyprofile/sitemap.xml" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Sitemap</Link>
            <Link href="/companyprofile/support" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {/* Brand Attribution Footer */}
      <div className="flex items-center gap-1.5 px-4 pt-8 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          Powered by
        </span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
      </div>

    </footer>
  );
}