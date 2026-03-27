'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { FaceSmileIcon, MapPinIcon, EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

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

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="relative bg-white pt-24 pb-12 overflow-hidden border-t border-gray-100">
      {/* Background Brand Accent */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-black tracking-tighter text-gray-900 italic">
                {name?.split(' ')[0] || 'BRAND'}<span className="font-light text-gray-400">.</span>
              </span>
            </Link>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm font-medium">
              {description || 'Redefining the digital shopping experience through curated excellence and innovative design.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((s, idx) => (
                <motion.a
                  key={idx}
                  whileHover={{ y: -5, scale: 1.1 }}
                  href={s.url}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50 text-gray-400 hover:text-white transition-all border border-gray-100"
                  style={{ '--hover-bg': primary } as any}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = primary)}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.backgroundColor = '')}
                >
                  {iconMapper[String(s.channel).toLowerCase()] || <FaceSmileIcon className="w-5 h-5" />}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Company</h4>
              <ul className="space-y-4">
                {['About', 'Contact', 'Privacy Policy', 'Terms'].map((item) => (
                  <li key={item}>
                    <Link href={`/groceriesecommerce/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-600 font-bold hover:text-gray-900 transition-colors text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Experience</h4>
              <ul className="space-y-4">
                {['Help Center', 'Returns', 'Shipping', 'Track Order'].map((item) => (
                  <li key={item}>
                    <Link href={`/groceriesecommerce/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-600 font-bold hover:text-gray-900 transition-colors text-sm">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Get in Touch</h4>
            <div className="space-y-4">
              <a href={`mailto:${contactEmail}`} className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:border-gray-200 transition-all bg-gray-50/30">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{contactEmail}</span>
              </a>
              <a href={`tel:${contactPhone}`} className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:border-gray-200 transition-all bg-gray-50/30">
                <PhoneIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-900" />
                <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{contactPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {name}. Built for the <span className="text-gray-900">Future</span>.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex gap-4">
              {/* Payment Icon Placeholders */}
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-5 bg-gray-100 rounded-sm" />
              ))}
            </div>
            <Link href="/groceriesecommerce/sitemap.xml" className="text-xs font-bold text-gray-400 hover:text-gray-900 uppercase tracking-widest">
              Sitemap
            </Link>
          </div>
        </div>

        
      <div className="flex items-center gap-1.5 px-4 py-2 mt-8 text-center mx-auto w-max">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
    </div>
      </div>

    </footer>
  );
}