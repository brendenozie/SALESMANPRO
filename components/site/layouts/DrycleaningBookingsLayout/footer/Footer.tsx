"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ArrowUpRightIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon 
} from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
  } = storeFormData || {};

  const tealAccent = '#0D9488';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-white dark:bg-[#080a0c] text-slate-900 dark:text-white pt-32 pb-12 overflow-hidden border-t border-slate-100 dark:border-white/5 transition-colors duration-500">
      
      {/* 1. AMBIENT BACKGROUND MARQUEE */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.04] dark:opacity-[0.02] select-none pointer-events-none">
        <motion.div 
          animate={{ x: [0, -1200] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="text-[18vw] font-black uppercase whitespace-nowrap leading-none tracking-tighter"
        >
          {name || 'PRISTINE'} • ARTISAN CARE • {name || 'PRISTINE'} • ARTISAN CARE •
        </motion.div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 md:px-12 relative z-10">
        
        {/* 2. TOP CTA SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mb-32 border-b border-slate-100 dark:border-white/5 pb-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-teal-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-teal-600">The Next Chapter</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.85] mb-8 uppercase text-slate-900 dark:text-white">
              Revive your <br />
              <span className="italic font-serif font-light text-slate-300 dark:text-slate-700">Wardrobe.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-light max-w-md leading-relaxed">
              {description || 'Experience the fusion of tradition and technology. Your garments deserve the Atelier standard.'}
            </p>
          </div>
          
          <Link href="/booking" className="group relative flex items-center gap-6 bg-slate-900 dark:bg-white px-12 py-7 rounded-[2.5rem] text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] transition-all shadow-2xl shadow-teal-900/10">
            Schedule Collection
            <div className="bg-teal-600 p-2 rounded-full">
              <ArrowUpRightIcon className="h-4 w-4 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform stroke-[3]" />
            </div>
          </Link>
        </div>

        {/* 3. MAIN LINKS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          
          <div className="lg:col-span-4 space-y-12">
            <div className="flex flex-col gap-2">
              <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
                {name || 'PRISTINE'}
              </h3>
              <span className="text-[9px] uppercase tracking-[0.5em] text-teal-600 font-black">Atelier & Care</span>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400 hover:text-teal-600 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-50 dark:group-hover:bg-teal-500/10 transition-colors">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold tracking-tight">{contactEmail || 'concierge@pristine.com'}</span>
              </div>
              <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400 hover:text-teal-600 transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-teal-50 dark:group-hover:bg-teal-500/10 transition-colors">
                  <PhoneIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold tracking-tight">{contactPhone || '+1 (800) PRISTINE'}</span>
              </div>
            </div>

            <div className="flex space-x-4">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -5, backgroundColor: tealAccent, color: '#fff' }}
                  href={s.url}
                  className="w-12 h-12 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 transition-all"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <span className="text-[10px] font-black">{s.channel}</span>}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600">The Menu</h4>
              <ul className="space-y-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                <li><Link href="/services" className="hover:text-slate-900 dark:hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tiers</Link></li>
                <li><Link href="/gallery" className="hover:text-slate-900 dark:hover:text-white transition-colors">Portfolio</Link></li>
                <li><Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">Our Story</Link></li>
              </ul>
            </div>

            <div className="space-y-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600">E-Shop</h4>
              <ul className="space-y-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                <li><Link href="/ecommerce/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">Eco-Detergents</Link></li>
                <li><Link href="/ecommerce/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">Fabric Mist</Link></li>
                <li><Link href="/ecommerce/products" className="hover:text-slate-900 dark:hover:text-white transition-colors">Care Kits</Link></li>
                <li><Link href="/gift-cards" className="hover:text-slate-900 dark:hover:text-white transition-colors">Gifting</Link></li>
              </ul>
            </div>

            <div className="space-y-10 col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600">Availability</h4>
              <div className="space-y-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                <div className="flex justify-between border-b border-slate-50 dark:border-white/5 pb-3">
                  <span>Mon — Fri</span>
                  <span className="text-slate-900 dark:text-white">08:00 — 20:00</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 dark:border-white/5 pb-3">
                  <span>Sat</span>
                  <span className="text-slate-900 dark:text-white">10:00 — 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sun</span>
                  <span className="text-teal-600">By Request</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FOOTER BOTTOM */}
        <div className="pt-12 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-wrap justify-center md:justify-start gap-10 text-[9px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700">
            <span>&copy; {new Date().getFullYear()} {name || 'PRISTINE'}</span>
            <Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-teal-600 transition-colors">Terms of Service</Link>
          </div>

          <motion.a 
            href="https://salesmanpro.site" 
            target="_blank"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 px-8 py-4 rounded-2xl border border-slate-100 dark:border-white/10"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Powered by</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-600">SalesmanPro</span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}