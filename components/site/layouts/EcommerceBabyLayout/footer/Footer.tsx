'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as per your saved preference
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  PaperAirplaneIcon,
  HeartIcon,
  SparklesIcon
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

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-[#0F1115] text-zinc-400 overflow-hidden">
      {/* Refined Curved Top Divider */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 bg-white dark:bg-zinc-950">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 fill-[#0F1115]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1095.6,14.76,1200,0V0H0Z"></path>
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-12 relative z-10">
        
        {/* Dynamic CTA Section */}
        <div className="relative p-12 md:p-16 rounded-[4rem] bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-xl mb-24 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-64 h-64 blur-[100px] opacity-20 rounded-full" style={{ backgroundColor: primary }} />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700">
                <SparklesIcon className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">The Village Newsletter</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                Join our <span className="italic" style={{ color: primary }}>family circle</span>
              </h2>
              <p className="text-zinc-400 font-medium text-lg max-w-md">Get parenting tips, exclusive offers, and early access to new collections.</p>
            </div>

            <div className="relative flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="mama@example.com" 
                className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-zinc-500 transition-all placeholder:text-zinc-600"
              />
              <button 
                className="px-8 py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:brightness-110 active:scale-95 shadow-xl"
                style={{ backgroundColor: primary }}
              >
                Subscribe
                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
          
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-8">
            <h3 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
              <div className="p-2 rounded-2xl rotate-12" style={{ backgroundColor: primary }}>
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              {name}
            </h3>
            <p className="text-base leading-relaxed text-zinc-500 max-w-sm">
              {description || 'Curating the softest, safest, and most stylish essentials for your little one’s first adventures. Built by parents, for parents.'}
            </p>
            <div className="flex gap-4">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -5, scale: 1.1 }}
                  href={s.url}
                  className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 relative group"
                >
                  <div className="absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: primary }} />
                  {iconMapper[String(s.channel).toLowerCase()] || <HeartIcon className="w-5 h-5" />}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Sets */}
          <div className="lg:col-span-2 lg:pl-4">
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.4em] mb-8">Shop</h4>
            <ul className="space-y-5 text-sm font-bold">
              {['New Arrivals', 'Best Sellers', 'Nursery Decor', 'Gift Cards', 'Baby Wellness'].map((item) => (
                <li key={item}><Link href="#" className="text-zinc-500 hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.4em] mb-8">Company</h4>
            <ul className="space-y-5 text-sm font-bold">
              {['Our Story', 'Sustainability', 'Shipping Policy', 'Returns', 'Privacy'].map((item) => (
                <li key={item}><Link href="#" className="text-zinc-500 hover:text-white transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.4em] mb-8">Visit Us</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                  <MapPinIcon className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                  123 Nursery Lane, Suite 100<br/>Cloud City, Baby 90210
                </p>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                  <EnvelopeIcon className="w-5 h-5 text-zinc-400" />
                </div>
                <a href={`mailto:${contactEmail}`} className="text-sm text-zinc-500 font-bold hover:text-white transition-colors">{contactEmail}</a>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                  <PhoneIcon className="w-5 h-5 text-zinc-400" />
                </div>
                <a href={`tel:${contactPhone}`} className="text-sm text-zinc-500 font-bold hover:text-white transition-colors">{contactPhone}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Final Copyright & Payment */}
        <div className="pt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} {name}. Built for the next generation.
            </p>
            <div className="flex items-center gap-1.5 transition-opacity">
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Powered by</span>
              <a href="https://salesmanpro.site" className="text-[12px] font-black uppercase tracking-widest text-orange-700 hover:text-orange-500 transition-colors">SalesmanPro.site</a>
            </div>
          </div>
          
          <div className="flex items-center gap-4 grayscale opacity-30 hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-default">
            {/* Payment Method Cards */}
            {['Visa', 'MC', 'Amex', 'ApplePay', 'PayPal'].map((pay) => (
              <div key={pay} className="h-8 w-12 bg-zinc-800 rounded-lg flex items-center justify-center text-[8px] font-black text-zinc-500 border border-zinc-700">
                {pay}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}