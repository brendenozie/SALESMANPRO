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
  } = storeFormData || {};

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 overflow-hidden relative font-sans">
      {/* Subtle Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Column 1: Brand & Bio */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-orange-600 p-2 rounded-lg">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">{name}.</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm">
              {description || "Revolutionizing global supply chains through integrated rail, road, and maritime networks. Precision-driven logistics for the modern era."}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((s, i) => (
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

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Navigation
            </h4>
            <ul className="space-y-4 text-slate-400 text-sm font-medium">
              {[
                { label: "About Us", href: "/ecommerce/about" },
                { label: "Global Tracking", href: "/ecommerce/track" },
                { label: "Help Center", href: "/ecommerce/help" },
                { label: "Privacy Policy", href: "/ecommerce/privacy" },
                { label: "Terms of Service", href: "/ecommerce/terms" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-orange-500 transition-colors flex items-center gap-2 group">
                    <ArrowRightIcon className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Contact Hub
            </h4>
            <ul className="space-y-6 text-slate-400 text-sm">
              <li className="flex gap-4 group">
                <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-orange-500/50 transition-colors">
                  <MapPinIcon className="w-5 h-5 text-orange-600" />
                </div>
                <span className="group-hover:text-slate-200 transition-colors">Lusingeti Road, Number 31,<br />Industrial Area, Nairobi</span>
              </li>
              {contactPhone && (
                <li className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-orange-500/50 transition-colors">
                    <PhoneIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <a href={`tel:${contactPhone}`} className="group-hover:text-slate-200 transition-colors">{contactPhone}</a>
                </li>
              )}
              {contactEmail && (
                <li className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-orange-500/50 transition-colors">
                    <EnvelopeIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <a href={`mailto:${contactEmail}`} className="group-hover:text-slate-200 transition-colors">{contactEmail}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="text-lg font-bold mb-8 flex items-center gap-2 italic uppercase">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              Newsletter
            </h4>
            <p className="text-slate-400 text-sm mb-6">Subscribe for the latest industry insights and logistics trends.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Terminal Email Address" 
                className="w-full h-14 bg-slate-900 border border-white/5 rounded-xl px-4 text-sm focus:ring-2 focus:ring-orange-600 transition-all outline-none placeholder:text-slate-600" 
              />
              <button className="absolute right-2 top-2 h-10 px-4 bg-orange-600 hover:bg-white hover:text-orange-600 rounded-lg text-white transition-all">
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 opacity-50">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-widest">Network Status: Online</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} {name} Solutions Inc. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Link href="/ecommerce/faq" className="hover:text-white transition-colors">FAQ</Link>
            <Link href="/ecommerce/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
            <Link href="/ecommerce/support" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
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