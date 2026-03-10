'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  GlobeAltIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#6366f1';
  const secondary = themeSettings?.secondaryColor || '#a855f7';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.011 3.585-.069 4.85c-.149 3.248-1.666 4.77-4.919 4.918-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.254-.149-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.849s.011-3.585.069-4.85c.149-3.249 1.666-4.77 4.919-4.919 1.266-.058 1.645-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-white dark:bg-black pt-24 pb-12 transition-colors duration-300">
      {/* Dynamic Top Border Accent */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${primary}44, transparent)` }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">
              {name}
            </h3>
            <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
              {description || 'Redefining the digital marketplace with premium curation and world-class service.'}
            </p>
            <div className="space-y-4">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <EnvelopeIcon className="w-4 h-4" />
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <PhoneIcon className="w-4 h-4" />
                  {contactPhone}
                </a>
              )}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 mb-8">
              Experience
            </h4>
            <ul className="space-y-4">
              {['About', 'Contact', 'Privacy', 'Terms'].map((item) => (
                <li key={item}>
                  <Link href={`/ecommerce/${item.toLowerCase()}`} className="text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 mb-8">
              Client Care
            </h4>
            <ul className="space-y-4">
              {['Help Center', 'Returns', 'Shipping', 'Track Order'].map((item) => (
                <li key={item}>
                  <Link href={`/ecommerce/${item.toLowerCase().replace(' ', '-')}`} className="text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Language Column */}
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-gray-500 mb-8">
              Connect With Us
            </h4>
            <div className="flex gap-3 mb-10">
              {socialLinks.map((s, idx) => {
                const channel = String(s.channel).toLowerCase();
                const icon = iconMapper[channel] || <GlobeAltIcon className="w-5 h-5" />;
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -4 }}
                    href={`${s.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-800 text-slate-400 hover:text-white transition-all shadow-sm"
                    style={{ '--hover-bg': primary } as any}
                  >
                    <span className="group-hover:text-white transition-colors">
                      {icon}
                    </span>
                  </motion.a>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Global Server: Active
            </div>
          </div>
        </div>

        {/* Legal Bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {name}. Built for the future.
          </p>
          
          <div className="flex items-center gap-8">
            <Link href="/ecommerce/faq" className="text-[11px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors">FAQ</Link>
            <Link href="/ecommerce/support" className="text-[11px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors">Support</Link>
          </div>
        </div>

        {/* SalesmanPro Attribution */}
        <div className="mt-12 flex items-center justify-center gap-2 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Platform by</span>
          <a 
            href="https://salesmanpro.site" 
            className="text-[9px] font-black uppercase tracking-[0.3em] text-orange-600"
          >
            SalesmanPro.site
          </a>
        </div>
      </div>
    </footer>
  );
}