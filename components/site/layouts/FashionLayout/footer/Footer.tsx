'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  ArrowUpRightIcon, 
  EnvelopeIcon, 
  PhoneIcon 
} from '@heroicons/react/24/outline';

const iconMapper: Record<string, React.ReactNode> = {
  facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
  instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
  twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
};

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name = "BOUTIQUE",
    description,
    contactEmail,
    socialLinks = [],
  } = storeFormData || {};

  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-24 pb-12 overflow-hidden border-t border-zinc-900">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        
        {/* Top Section: Branding & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Philosophy */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-white text-3xl font-light tracking-tighter uppercase italic">
              {name} <span className="font-serif lowercase text-zinc-500">— the atelier</span>
            </h2>
            <p className="text-lg leading-relaxed max-w-md font-medium text-zinc-500">
              {description || "Curating a new standard of digital elegance. We believe in the intersection of architectural form and functional beauty."}
            </p>
            
            <div className="flex gap-4">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3, color: '#fff' }}
                  href={s.url}
                  className="p-3 border border-zinc-800 rounded-full transition-colors"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || null}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Newsletter Concept */}
          <div className="lg:col-span-7 flex flex-col justify-end">
            <div className="border-b border-zinc-800 pb-4 mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 block mb-4">
                Join the Inner Circle
              </span>
              <div className="flex items-center justify-between group">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-transparent border-none outline-none text-2xl md:text-4xl font-light tracking-tighter text-white w-full placeholder:text-zinc-800"
                />
                <button className="text-white transform group-hover:translate-x-2 transition-transform duration-500">
                  <ArrowUpRightIcon className="w-10 h-10" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Sitemap Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-12 py-12 border-t border-zinc-900">
          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/shop" className="hover:text-white transition-colors">The Collection</Link></li>
              <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Client Care</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/help" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>
          </div>
          <div className="col-span-2">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8">Contact</h4>
            <div className="space-y-4">
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-lg text-zinc-500 hover:text-white transition-colors">
                <EnvelopeIcon className="w-5 h-5" />
                <span>{contactEmail || "concierge@store.com"}</span>
              </a>
              <p className="text-sm italic font-serif">Available Mon—Fri, 9am—6pm EST</p>
            </div>
          </div>
        </div>

        {/* Massive Signature Brand Name */}
        <div className="pt-12 select-none overflow-hidden">
          <motion.h1 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ duration: 1, ease: "circOut" }}
            className="text-[18vw] leading-none font-black text-zinc-900 uppercase tracking-tighter flex justify-between items-baseline"
          >
            {name.split('').map((char, i) => (
              <span key={i} className={i % 2 === 1 ? 'font-serif italic font-light' : ''}>{char}</span>
            ))}
          </motion.h1>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">
            &copy; {new Date().getFullYear()} {name} Atelier. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-700">
            <Link href="/privacy" className="hover:text-zinc-400">Privacy</Link>
            <Link href="/terms" className="hover:text-zinc-400">Terms</Link>
            <Link href="/cookies" className="hover:text-zinc-400">Cookies</Link>
          </div>
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