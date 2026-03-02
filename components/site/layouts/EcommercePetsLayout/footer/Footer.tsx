'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  HeartIcon
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

  const primary = themeSettings?.primaryColor || '#10B981';
  const secondary = themeSettings?.secondaryColor || '#3B82F6';

  // Social Icon mapping using paths for standard brands
  const socialIcons: Record<string, React.ReactNode> = {
    facebook: <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/>,
    instagram: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>,
    twitter: <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/>,
  };

  return (
    <footer className="relative bg-zinc-950 text-zinc-400 pt-24 pb-12 overflow-hidden border-t border-white/5">
      {/* Dynamic Background Accents */}
      <div 
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
        style={{ backgroundColor: primary }}
      />
      <div 
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[100px] opacity-5"
        style={{ backgroundColor: secondary }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* Brand Identity Section */}
          <div className="lg:col-span-4">
            <h2 className="text-3xl font-black text-white tracking-tighter mb-6 uppercase italic">
              {name || 'PetShop'}
            </h2>
            <p className="text-sm leading-relaxed mb-8 max-w-sm">
              {description || 'Providing world-class care and premium supplies for your furry family members since 2026. Every paw matters to us.'}
            </p>
            
            {/* Contact Grid */}
            <div className="space-y-4">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <EnvelopeIcon className="w-4 h-4" style={{ color: primary }} />
                  </div>
                  {contactEmail}
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-3 text-sm hover:text-white transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <PhoneIcon className="w-4 h-4" style={{ color: secondary }} />
                  </div>
                  {contactPhone}
                </a>
              )}
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <MapPinIcon className="w-4 h-4 text-zinc-500" />
                </div>
                Global Shipping Available
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">Navigation</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['About', 'Contact', 'Privacy Policy', 'Terms of Service'].map((link) => (
                  <li key={link}>
                    <Link href={`/ecommerce/${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">Customer Care</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['Help Center', 'Returns', 'Shipping', 'Track Order'].map((link) => (
                  <li key={link}>
                    <Link href={`/ecommerce/${link.toLowerCase().replace(/ /g, '-')}`} className="hover:text-white hover:translate-x-1 transition-all inline-block">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social & Badge Section */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white mb-8">Connect With Us</h3>
            <div className="flex flex-wrap gap-3 mb-10">
              {socialLinks.length > 0 ? socialLinks.map((s, idx) => {
                const channel = String(s.channel).toLowerCase();
                return (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -5, scale: 1.1 }}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      {socialIcons[channel] || <circle cx="12" cy="12" r="10" />}
                    </svg>
                  </motion.a>
                );
              }) : (
                <p className="text-xs italic text-zinc-600">Follow us on social for pet tips!</p>
              )}
            </div>

            {/* Quality Badge */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <HeartIcon className="w-5 h-5 text-rose-500 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-tighter">100% Pet-Approved</span>
              </div>
              <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Cruelty Free & Sustainable</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
            &copy; {new Date().getFullYear()} {name}. Built for the love of pets.
          </p>
          
          <div className="flex items-center gap-8">
            <Link href="/ecommerce/faq" className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">FAQ</Link>
            <Link href="/ecommerce/support" className="text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Support</Link>
            {/* Payment Icons Placeholder */}
            <div className="flex gap-2 opacity-30 grayscale">
              <div className="w-8 h-5 bg-zinc-800 rounded-sm" />
              <div className="w-8 h-5 bg-zinc-800 rounded-sm" />
              <div className="w-8 h-5 bg-zinc-800 rounded-sm" />
            </div>
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