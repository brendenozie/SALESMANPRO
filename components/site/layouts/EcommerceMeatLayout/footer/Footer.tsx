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
    contactEmail,
    contactPhone,
    socialLinks = [],
  } = storeFormData || {};

  return (
    <footer className="bg-stone-950 text-stone-400 pt-32 pb-16 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* --- TOP: Newsletter --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24 items-start">
          <div className="lg:col-span-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
              The Butcher’s <br /> 
              <span className="text-red-600 italic font-serif font-light">Confidential.</span>
            </h2>
            <p className="text-stone-500 mb-10 max-w-sm font-medium text-lg">
              Receive notifications on rare cuts, dry-aging cycles, and exclusive weekend bundles.
            </p>
            <form className="relative max-w-md group">
              <input 
                type="email" 
                placeholder="connoisseur@email.com"
                className="w-full bg-stone-900 border border-stone-800 rounded-2xl py-6 px-8 text-white focus:outline-none focus:border-red-600 transition-all placeholder:text-stone-700"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-red-600 hover:bg-red-700 text-white px-8 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all">
                Join
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.4em]">The Counter</h3>
              <ul className="space-y-5 text-[13px] font-bold uppercase tracking-wider">
                <li><Link href="/meatecommerce/products" className="hover:text-red-600 transition-colors">Prime Cuts</Link></li>
                <li><Link href="/meatecommerce/products" className="hover:text-red-600 transition-colors">Dry-Aged Room</Link></li>
                <li><Link href="/meatecommerce/products" className="hover:text-red-600 transition-colors">Charcuterie</Link></li>
                <li><Link href="/meatecommerce/products" className="hover:text-red-600 transition-colors">Wholesale</Link></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.4em]">Heritage</h3>
              <ul className="space-y-5 text-[13px] font-bold uppercase tracking-wider">
                <li><Link href="/meatecommerce/about" className="hover:text-red-600 transition-colors">Our Ranches</Link></li>
                <li><Link href="/meatecommerce/contact" className="hover:text-red-600 transition-colors">Master Butcher</Link></li>
                <li><Link href="/meatecommerce/shipping" className="hover:text-red-600 transition-colors">Cold Chain</Link></li>
                <li><Link href="/meatecommerce/faq" className="hover:text-red-600 transition-colors">Support</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1 space-y-8 border-t border-stone-900 md:border-none pt-10 md:pt-0">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.4em]">Contact</h3>
              <div className="space-y-6 text-sm">
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 hover:text-white transition-colors group">
                  <div className="p-2 rounded-lg bg-stone-900 group-hover:bg-red-600/10 group-hover:text-red-600 transition-all">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{contactEmail || 'office@butchery.com'}</span>
                </a>
                <a href={`tel:${contactPhone}`} className="flex items-center gap-4 hover:text-white transition-colors group font-mono">
                  <div className="p-2 rounded-lg bg-stone-900 group-hover:bg-red-600/10 group-hover:text-red-600 transition-all">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{contactPhone || '+254 700 000 000'}</span>
                </a>
                <div className="flex items-center gap-4 italic text-stone-500">
                  <div className="p-2 rounded-lg bg-stone-900">
                    <MapPinIcon className="w-4 h-4" />
                  </div>
                  <span>Nairobi Industrial Area</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MIDDLE: Brand Banner --- */}
        <div className="py-16 border-y border-stone-900/50 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                {name?.charAt(0) || 'B'}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                  {name || 'The Butchery'}
                </h2>
                <p className="text-[10px] font-black text-stone-600 uppercase tracking-[0.5em] mt-1">Prime Grade Selection</p>
              </div>
           </div>

           <div className="flex gap-5">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -5, borderColor: '#dc2626', color: '#dc2626' }}
                  href={s.url}
                  className="w-14 h-14 rounded-2xl border border-stone-800 flex items-center justify-center transition-all bg-stone-900/30 backdrop-blur-sm"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <GlobeAltIcon className="w-6 h-6" />}
                </motion.a>
              ))}
           </div>
        </div>

        {/* --- BOTTOM: Copyright & Legal --- */}
        <div className="pt-16 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black text-stone-700 uppercase tracking-[0.3em]">
            &copy; {new Date().getFullYear()} {name}. Sourced Ethically. Delivered Fresh.
          </p>
          <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em]">
            <Link href="/meatecommerce/privacy" className="hover:text-red-600 transition-colors">Privacy</Link>
            <Link href="/meatecommerce/terms" className="hover:text-red-600 transition-colors">Terms</Link>
            <Link href="/meatecommerce/sitemap.xml" className="hover:text-red-600 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>

      {/* SalesmanPro Branding */}
      <div className="flex items-center gap-2 px-4 py-8 mt-12 justify-center border-t border-stone-900/30">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-800">Engineered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-500 hover:text-red-600 transition-all"
        >
          SalesmanPro
        </a>
      </div>
    </footer>
  );
}