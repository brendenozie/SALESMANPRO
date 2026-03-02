'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name = 'The Atelier',
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#10B981';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    twitter: <svg className='w-5 h-5' fill='none' stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>,
    linkedin: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  };

  return (
    <footer className="relative bg-[#1A1C1A] text-slate-400 pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Background Watermark */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-[0.02]">
        <h1 className="text-[20vw] font-serif italic whitespace-nowrap text-white">{name}</h1>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Intro */}
          <div className="lg:col-span-4 space-y-8">
            <h2 className="text-3xl font-serif italic text-white tracking-tight">{name}</h2>
            <p className="text-sm leading-relaxed max-w-sm">
              {description || 'Curating rare botanical wonders and artisanal arrangements for the modern collector. Every stem tells a story of elegance and preservation.'}
            </p>
            <div className="flex space-x-5">
              {socialLinks.map((s, idx) => {
                const channel = String(s.channel).toLowerCase();
                const icon = iconMapper[channel] || <FaceSmileIcon className="w-5 h-5" />;
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -3 }}
                    href={`${s.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    {icon}
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Curations</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/ecommerce/about" className="hover:text-white transition-colors">The Story</Link></li>
              <li><Link href="/ecommerce/contact" className="hover:text-white transition-colors">Atelier Access</Link></li>
              <li><Link href="/ecommerce/products" className="hover:text-white transition-colors">The Library</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Service</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/ecommerce/shipping" className="hover:text-white transition-colors">White Glove Delivery</Link></li>
              <li><Link href="/ecommerce/returns" className="hover:text-white transition-colors">Care & Returns</Link></li>
              <li><Link href="/ecommerce/faq" className="hover:text-white transition-colors">Enquiries</Link></li>
            </ul>
          </div>

          {/* Contact Block */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">Visit Us</h4>
            <div className="space-y-4 text-sm font-medium">
              <p className="text-white italic font-serif">Available for private consultations.</p>
              {contactEmail && <a href={`mailto:${contactEmail}`} className="block hover:text-white transition-colors border-b border-white/10 pb-2 w-max">{contactEmail}</a>}
              {contactPhone && <a href={`tel:${contactPhone}`} className="block hover:text-white transition-colors">{contactPhone}</a>}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link href="/ecommerce/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/ecommerce/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          
          <p className="text-[10px] font-medium tracking-[0.1em] text-slate-600">
            &copy; {new Date().getFullYear()} {name}. Curated with intention.
          </p>

          <div 
            className="h-1 w-24 rounded-full" 
            style={{ backgroundColor: primary, opacity: 0.3 }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
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