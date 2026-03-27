'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
  } = storeFormData || {};

  const gold = '#F3A852';
  const cocoa = '#3E2723';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-[#3E2723] text-stone-300 pt-20 pb-10 overflow-hidden">
      {/* Organic Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Story */}
          <div className="space-y-6">
            <h3 className="text-white font-black text-2xl tracking-tighter uppercase italic">
              {name || 'The Pantry'}
            </h3>
            <p className="text-sm leading-relaxed text-stone-400 font-medium">
              {description || 'Crafting small-batch, artisanal roasted delights for your daily rituals. From our pantry to yours, since 2026.'}
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3, color: gold }}
                  href={s.url}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 transition-colors"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <FaceSmileIcon className="w-5 h-5" />}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Navigation</h4>
            <ul className="space-y-4 text-sm font-bold">
              {['About', 'Contact', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <Link href={`/peanutecommerce/${item.toLowerCase()}`} className="hover:text-[#F3A852] transition-colors uppercase tracking-widest text-[11px]">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Service</h4>
            <ul className="space-y-4 text-sm font-bold">
              {['Help Center', 'Returns', 'Shipping', 'Track Order'].map((item) => (
                <li key={item}>
                  <Link href={`/peanutecommerce/${item.replace(' ', '-').toLowerCase()}`} className="hover:text-[#F3A852] transition-colors uppercase tracking-widest text-[11px]">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] mb-8">Reach Out</h4>
            <div className="space-y-4 font-medium text-sm">
              <p className="flex flex-col">
                <span className="text-[10px] uppercase text-stone-500 tracking-widest mb-1">Email Us</span>
                <a href={`mailto:${contactEmail}`} className="text-white hover:text-[#F3A852] transition-colors">{contactEmail || 'hello@pantry.com'}</a>
              </p>
              <p className="flex flex-col">
                <span className="text-[10px] uppercase text-stone-500 tracking-widest mb-1">Call Us</span>
                <a href={`tel:${contactPhone}`} className="text-white hover:text-[#F3A852] transition-colors">{contactPhone || '+1 (555) 000-1234'}</a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
            &copy; {new Date().getFullYear()} {name}. Built for the roast.
          </p>
          
          <div className="flex items-center gap-8">
            <Link href="/peanutecommerce/sitemap.xml" className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 hover:text-white transition-colors">Sitemap</Link>
            <div className="flex gap-2">
               <div className="w-12 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-stone-600 italic">VISA</div>
               <div className="w-12 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-stone-600 italic">AMEX</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Large Decorative Text for depth */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[15vw] font-black text-white/[0.02] whitespace-nowrap pointer-events-none uppercase">
        Small Batch • Real Food
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 mt-8 border border-stone-800/50 rounded-full bg-stone-900/50 backdrop-blur-sm text-center mx-auto w-max">
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