'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
// Using Hero Icons as per saved preferences
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ArrowUpRightIcon,
  GlobeAltIcon
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

  const primary = themeSettings?.primaryColor || '#D97706';

  // Elegant Social Icon Mapper
  const iconMapper: Record<string, React.ReactNode> = {
    facebook: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>,
    instagram: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    twitter: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z"/></svg>,
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Pillar */}
          <div className="md:col-span-5 space-y-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-4 italic">
                {name || 'The Cake Shop'}
              </h2>
              <p className="text-lg leading-relaxed font-medium italic pr-12">
                {description || 'Crafting artisan moments through flour, sugar, and soul since 2026.'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-amber-500/10 transition-colors">
                  <EnvelopeIcon className="w-5 h-5 text-amber-500" />
                </div>
                <a href={`mailto:${contactEmail}`} className="text-sm font-bold text-white hover:text-amber-500 transition-colors">
                  {contactEmail || 'hello@artisanbakery.com'}
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-amber-500/10 transition-colors">
                  <PhoneIcon className="w-5 h-5 text-amber-500" />
                </div>
                <a href={`tel:${contactPhone}`} className="text-sm font-bold text-white hover:text-amber-500 transition-colors">
                  {contactPhone || '+1 (555) 000-BAKE'}
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-8">Boutique</h4>
              <ul className="space-y-4 text-sm font-bold">
                {['Shop All', 'Signature Cakes', 'Wedding Studio', 'Gift Cards'].map((item) => (
                  <li key={item}>
                    <Link href={item === 'Shop All' ? '/cakeecommerce/products' : `/cakeecommerce/products?name=${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors flex items-center gap-2 group">
                      {item}
                      <ArrowUpRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-y-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-8">Company</h4>
              <ul className="space-y-4 text-sm font-bold">
                {['Our Story', 'Visit Us', 'Work with Us', 'Contact'].map((item) => (
                  <li key={item}>
                    <Link href={item === 'Our Story' ? '/cakeecommerce/about' : item === 'Visit Us' ? '/cakeecommerce/visit' : item === 'Work with Us' ? '/cakeecommerce/careers' : '/cakeecommerce/contact'} className="hover:text-white transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-8">Socials</h4>
              <div className="flex gap-3">
                {socialLinks.length > 0 ? socialLinks.map((s, idx) => (
                   <motion.a
                    key={idx}
                    whileHover={{ y: -5 }}
                    href={s.url}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-amber-500 transition-all"
                  >
                    {iconMapper[String(s.channel).toLowerCase()] || <GlobeAltIcon className="w-5 h-5" />}
                  </motion.a>
                )) : (
                  ['instagram', 'facebook', 'twitter'].map((platform) => (
                    <motion.a
                      key={platform}
                      whileHover={{ y: -5 }}
                      href="#"
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white hover:bg-amber-500 transition-all"
                    >
                      {iconMapper[platform]}
                    </motion.a>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              &copy; {new Date().getFullYear()} {name}. Artisanally Crafted.
            </p>
          </div>
          
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <Link href="/cakeecommerce/privacy" className="hover:text-amber-500 transition-colors">Privacy</Link>
            <Link href="/cakeecommerce/terms" className="hover:text-amber-500 transition-colors">Terms</Link>
            <Link href="/cakeecommerce/sitemap" className="hover:text-amber-500 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 justify-center w-full">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
    </div>


      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] -mr-64 -mb-64 pointer-events-none" />
    </footer>
  );
}