'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  GlobeAltIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ArrowUpRightIcon,
  QuestionMarkCircleIcon
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

  const primary = themeSettings?.primaryColor || '#ef4444';

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z"/></svg>,
    twitter: <svg className='w-5 h-5' fill='currentColor' viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 pt-24 border-t border-gray-100 dark:border-zinc-900 overflow-hidden">
      
      {/* Brand Watermark Overlay */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none opacity-[0.03] dark:opacity-[0.05] select-none">
        <span className="text-[20vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap">
          {name || 'STOREFRONT'}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand & Manifesto */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">
              {name}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              {description || 'Redefining the pace of modern performance and street aesthetics. Join the evolution of elite footwear.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -3 }}
                  href={s.url}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-600 dark:text-zinc-400 hover:text-white transition-all shadow-sm"
                  style={{ '--hover-bg': primary } as any}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = primary)}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = '')}
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <GlobeAltIcon className="w-5 h-5" />}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Dynamic Links Grid */}
          {[
            {
              title: 'Exploration',
              links: [
                { name: 'Latest Drops', href: '/shop' },
                { name: 'Best Sellers', href: '/trending' },
                { name: 'About the Lab', href: '/about' },
                { name: 'Our Athletes', href: '/athletes' },
              ]
            },
            {
              title: 'Support Desk',
              links: [
                { name: 'Shipping & Logistics', href: '/shipping' },
                { name: 'Returns Portal', href: '/returns' },
                { name: 'Order Tracking', href: '/track' },
                { name: 'FAQ', href: '/faq' },
              ]
            }
          ].map((column, i) => (
            <div key={i} className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500">
                {column.title}
              </h4>
              <ul className="space-y-4">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href} 
                      className="text-sm font-bold text-gray-700 dark:text-zinc-300 hover:opacity-50 transition-opacity flex items-center group"
                    >
                      {link.name}
                      <ArrowUpRightIcon className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Status */}
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-500">
              Get in Touch
            </h4>
            <div className="space-y-4">
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 group-hover:bg-primary transition-colors">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{contactEmail}</span>
              </a>
              <a href={`tel:${contactPhone}`} className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400">
                  <PhoneIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">{contactPhone}</span>
              </a>
              <div className="pt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">All systems operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              &copy; {new Date().getFullYear()} {name}
            </p>
            <div className="hidden md:flex gap-4">
              <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white">Privacy</Link>
              <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white">Terms</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 grayscale opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Powered by</span>
                <a href="https://salesmanpro.site" className="text-[10px] font-black uppercase tracking-widest text-orange-600">SalesmanPro</a>
             </div>
             <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800" />
             <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1 group">
               <QuestionMarkCircleIcon className="w-3 h-3" />
               Support
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
}