'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as requested
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PaperAirplaneIcon,
  HeartIcon
} from '@heroicons/react/24/solid';

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

  const primary = themeSettings?.primaryColor || '#F472B6';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  // Custom Social Icons with Hero Icon fallback
  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-slate-900 text-slate-300 overflow-hidden">
      {/* Curved Top Shape */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 bg-white">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-20 fill-slate-900">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-12 relative z-10">
        {/* Newsletter / CTA Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20 pb-16 border-b border-slate-800">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Join our <span style={{ color: primary }}>family circle</span>
            </h2>
            <p className="text-slate-400 font-medium">Get parenting tips, exclusive offers, and early access to new collections.</p>
          </div>
          <div className="relative group">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-5 px-6 text-white focus:outline-none focus:ring-2 transition-all"
              style={{ '--tw-ring-color': primary } as React.CSSProperties}
            />
            <button 
              className="absolute right-2 top-2 bottom-2 px-6 rounded-xl text-white font-bold flex items-center gap-2 transition-transform active:scale-95"
              style={{ backgroundColor: primary }}
            >
              <span className="hidden sm:inline">Subscribe</span>
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
              <HeartIcon className="w-6 h-6" style={{ color: primary }} />
              {name}
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              {description || 'Curating the softest, safest, and most stylish essentials for your little one’s first adventures.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3 }}
                  href={s.url}
                  className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all duration-300"
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <HeartIcon className="w-5 h-5" />}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:pl-8">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6">Explore</h4>
            <ul className="space-y-4 text-sm font-bold">
              {['About Us', 'New Arrivals', 'Best Sellers', 'Gift Cards'].map((item) => (
                <li key={item}><Link href="#" className="text-slate-500 hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-bold">
              {['Shipping Policy', 'Returns & Exchanges', 'Privacy Policy', 'FAQs'].map((item) => (
                <li key={item}><Link href="#" className="text-slate-500 hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-6">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 mt-0.5" style={{ color: secondary }} />
                <p className="text-sm text-slate-400">123 Nursery Lane, Suite 100<br/>Cloud City, Baby 90210</p>
              </div>
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5" style={{ color: secondary }} />
                <a href={`mailto:${contactEmail}`} className="text-sm text-slate-400 hover:text-white transition-colors">{contactEmail}</a>
              </div>
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-5 h-5" style={{ color: secondary }} />
                <a href={`tel:${contactPhone}`} className="text-sm text-slate-400 hover:text-white transition-colors">{contactPhone}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-500 tracking-wide">
            &copy; {new Date().getFullYear()} {name}. Made with love for little ones.
          </p>
          <div className="flex items-center gap-8 grayscale opacity-50">
            {/* Payment Icons Placeholder */}
            <div className="h-6 w-10 bg-slate-700 rounded-sm" />
            <div className="h-6 w-10 bg-slate-700 rounded-sm" />
            <div className="h-6 w-10 bg-slate-700 rounded-sm" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 mt-4 justify-center">
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