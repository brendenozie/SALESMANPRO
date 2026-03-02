'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const iconMapper: Record<string, React.ReactNode> = {
  facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
  instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.012-3.584.07-4.849c.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
};

export default function RootFooter() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
  } = storeFormData || {};

  return (
    <footer className="bg-slate-950 text-slate-400 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- TOP: Newsletter & Brand --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-5">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-6">
              Subscribe to <span className="text-emerald-500 italic font-serif font-light">Yield Updates.</span>
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm font-medium">
              Get seasonal planting guides, livestock health tips, and exclusive pricing directly in your inbox.
            </p>
            <form className="relative max-w-md">
              <input 
                type="email" 
                placeholder="farmer@example.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-xl font-bold transition-all">
                Join
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Supply Chain</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/ecommerce/shop" className="hover:text-emerald-400 transition-colors">Agrochemicals</Link></li>
                <li><Link href="/ecommerce/shop" className="hover:text-emerald-400 transition-colors">Certified Seeds</Link></li>
                <li><Link href="/ecommerce/shop" className="hover:text-emerald-400 transition-colors">Animal Health</Link></li>
                <li><Link href="/ecommerce/shop" className="hover:text-emerald-400 transition-colors">Bulk Equipment</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Partnership</h3>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link href="/ecommerce/about" className="hover:text-emerald-400 transition-colors">Our Story</Link></li>
                <li><Link href="/ecommerce/contact" className="hover:text-emerald-400 transition-colors">Vet Consultation</Link></li>
                <li><Link href="/ecommerce/shipping" className="hover:text-emerald-400 transition-colors">Logistics</Link></li>
                <li><Link href="/ecommerce/faq" className="hover:text-emerald-400 transition-colors">Help Desk</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-6 border-t border-slate-900 md:border-none pt-8 md:pt-0">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.3em]">Direct Contact</h3>
              <div className="space-y-4 text-sm">
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 hover:text-white transition-colors">
                  <EnvelopeIcon className="w-4 h-4 text-emerald-500" />
                  {contactEmail || 'office@agrovet.com'}
                </a>
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 hover:text-white transition-colors font-mono">
                  <PhoneIcon className="w-4 h-4 text-emerald-500" />
                  {contactPhone || '+254 700 000 000'}
                </a>
                <div className="flex items-center gap-3 italic">
                  <MapPinIcon className="w-4 h-4 text-emerald-500" />
                  Headquarters, Nairobi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MIDDLE: Brand Banner --- */}
        <div className="py-12 border-y border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl font-black">
                {name?.charAt(0) || 'A'}
              </div>
              <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                {name || 'Agrovet'}
              </h2>
           </div>

           <div className="flex gap-4">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3, color: '#10b981' }}
                  href={s.url}
                  className="w-12 h-12 rounded-full border border-slate-800 flex items-center justify-center transition-colors"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <GlobeAltIcon className="w-5 h-5" />}
                </motion.a>
              ))}
           </div>
        </div>

        {/* --- BOTTOM: Copyright & Legal --- */}
        <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-slate-600 tracking-wider">
            &copy; {new Date().getFullYear()} {name}. Built for the Modern Farmer.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <Link href="/ecommerce/privacy" className="hover:text-emerald-500 transition-colors">Privacy</Link>
            <Link href="/ecommerce/terms" className="hover:text-emerald-500 transition-colors">Terms</Link>
            <Link href="/ecommerce/sitemap.xml" className="hover:text-emerald-500 transition-colors">Sitemap</Link>
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