'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ArrowUpRightIcon, 
  EnvelopeIcon, 
} from '@heroicons/react/24/outline';

const iconMapper: Record<string, React.ReactNode> = {
  facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
  instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
  twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
};

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#ef4444';
  const {
    name = "BOUTIQUE",
    description,
    contactEmail,
    socialLinks = [],
  } = storeFormData || {};

  return (
    <footer className="bg-white dark:bg-zinc-950 text-zinc-500 transition-colors duration-500 pt-24 pb-8 overflow-hidden border-t border-zinc-100 dark:border-zinc-900">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* --- Top Section: Branding & Newsletter --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          <div className="lg:col-span-5 space-y-10">
            <h2 className="text-zinc-900 dark:text-white text-4xl font-black tracking-tighter uppercase italic leading-none">
              {name} <br />
              <span className="font-serif lowercase font-light text-zinc-400 dark:text-zinc-600">— the atelier</span>
            </h2>
            <p className="text-base leading-relaxed max-w-sm font-medium text-zinc-500 dark:text-zinc-400">
              {description || "Curating a new standard of digital elegance. We believe in the intersection of architectural form and functional beauty."}
            </p>
            
            <div className="flex gap-3">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -4, color: primaryColor, borderColor: primaryColor }}
                  href={s.url}
                  className="p-3.5 border border-zinc-200 dark:border-zinc-800 rounded-full transition-all text-zinc-400 dark:text-zinc-500"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || null}
                </motion.a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-end">
            <div className="border-b-2 border-zinc-100 dark:border-zinc-900 pb-6 mb-8 group focus-within:border-zinc-900 dark:focus-within:border-white transition-colors">
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400 dark:text-zinc-600 block mb-4">
                Newsletter Access
              </span>
              <div className="flex items-center justify-between">
                <input 
                  type="email" 
                  placeholder="SUBSCRIBE@EMAIL.COM" 
                  className="bg-transparent border-none outline-none text-2xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-white w-full placeholder:text-zinc-100 dark:placeholder:text-zinc-900 uppercase"
                />
                <button 
                  className="p-2 transition-transform duration-500 hover:rotate-45"
                  style={{ color: primaryColor }}
                >
                  <ArrowUpRightIcon className="w-10 h-10 md:w-14 md:h-14 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Middle Section: Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 py-16 border-t border-zinc-100 dark:border-zinc-900">
          <div>
            <h4 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Collections</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li><Link href="/fashionecommerce/products" className="hover:opacity-50 transition-opacity">Ready to Wear</Link></li>
              <li><Link href="/fashionecommerce/categories" className="hover:opacity-50 transition-opacity">Limited Drop</Link></li>
              <li><Link href="/fashionecommerce/about" className="hover:opacity-50 transition-opacity">Archives</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Concierge</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li><Link href="/fashionecommerce/shipping" className="hover:opacity-50 transition-opacity">Shipping</Link></li>
              <li><Link href="/fashionecommerce/help" className="hover:opacity-50 transition-opacity">Assistance</Link></li>
              <li><Link href="/fashionecommerce/track" className="hover:opacity-50 transition-opacity">Tracking</Link></li>
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Location</h4>
            <div className="space-y-4">
              <a href={`mailto:${contactEmail}`} className="block text-xl md:text-2xl font-black text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors tracking-tighter uppercase">
                {contactEmail || "concierge@atelier.com"}
              </a>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">EST. {new Date().getFullYear()} — Global Studio</p>
            </div>
          </div>
        </div>

        {/* --- Massive Signature --- */}
        <div className="pt-8 select-none overflow-hidden cursor-default group">
          <motion.h1 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[19vw] leading-[0.8] font-black uppercase tracking-tighter flex justify-between items-baseline text-zinc-100 dark:text-zinc-900 transition-colors duration-700 group-hover:text-zinc-200 dark:group-hover:text-zinc-800"
          >
            {name.split('').map((char, i) => (
              <span 
                key={i} 
                className={i % 2 === 1 ? 'font-serif italic font-light' : ''}
                style={i % 2 === 0 ? { WebkitTextStroke: '1px rgba(0,0,0,0.05)' } : {}}
              >
                {char}
              </span>
            ))}
          </motion.h1>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between gap-6 items-center">
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700">
            &copy; {name} Atelier / All Rights Reserved.
          </p>
          
          <div className="flex items-center gap-1.5 transition-opacity">
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">Powered by</span>
            <a href="https://salesmanpro.site" className="text-[12px] font-black uppercase tracking-[0.3em] text-orange-600">
              SalesmanPro.site
            </a>
          </div>

          <div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-300 dark:text-zinc-700">
            <Link href="/fashionecommerce/privacy" className="hover:text-zinc-900 dark:hover:text-white">Privacy</Link>
            <Link href="/fashionecommerce/terms" className="hover:text-zinc-900 dark:hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}