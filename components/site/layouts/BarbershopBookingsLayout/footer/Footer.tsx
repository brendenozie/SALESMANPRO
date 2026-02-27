'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  PaperAirplaneIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    socialLinks,
    contactPhone,
    contactEmail,
    themeSettings,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#059669';

  const navLinks = [
    { label: 'Explore', links: [
      { name: 'Services', href: '#services' },
      { name: 'Why Us', href: '#benefits' },
      { name: 'Stories', href: '#testimonials' },
      { name: 'FAQs', href: '#faq' }
    ]},
    { label: 'Support', links: [
      { name: 'Help Center', href: '#livechat' },
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms', href: '/terms-of-service' },
      { name: 'Contact', href: '#contact' }
    ]}
  ];

  return (
    <footer className="relative bg-white pt-24 pb-12 overflow-hidden border-t border-slate-100">
      {/* Visual Decor: Large Background Text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 select-none pointer-events-none">
        <h2 className="text-[18vw] font-black text-slate-50/80 leading-none tracking-tighter uppercase whitespace-nowrap">
          {name || 'SwiftServe'}
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-start mb-20">
          
          {/* Brand & Newsletter Column */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black tracking-tighter text-slate-900">
                {name || 'SwiftServe'}
              </span>
            </Link>
            <p className="text-lg text-slate-500 font-medium mb-10 max-w-md leading-relaxed">
              {description || `Elevating your experience with seamless bookings and world-class service. Your journey to wellness starts here.`}
            </p>

            <div className="relative max-w-md group">
              <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-500" />
              <form className="relative flex items-center bg-white p-2 rounded-[1.8rem] border border-slate-200 shadow-sm">
                <input
                  type="email"
                  placeholder="Join our newsletter"
                  className="flex-grow px-6 py-3 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none font-bold"
                />
                <button
                  type="submit"
                  className="p-4 rounded-full text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-200/50"
                  style={{ backgroundColor: primaryColor }}
                >
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                </button>
              </form>
            </div>
          </div>

          {/* Nav Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            {navLinks.map((column) => (
              <div key={column.label}>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
                  {column.label}
                </h4>
                <ul className="space-y-4">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-slate-600 font-bold hover:text-slate-900 transition-colors inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Details Column */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
              Get in touch
            </h4>
            <div className="space-y-6">
              <ContactLink icon={<PhoneIcon />} label={contactPhone || '+1 (555) 000-0000'} href={`tel:${contactPhone}`} />
              <ContactLink icon={<EnvelopeIcon />} label={contactEmail || 'hello@swiftserve.com'} href={`mailto:${contactEmail}`} />
              <ContactLink icon={<ChatBubbleLeftRightIcon />} label="Live Support" href="#livechat" />
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
            <span className="text-sm font-bold text-slate-400">
              © {year} {name}. 
            </span>
            <div className="flex items-center gap-4 text-slate-400">
               {/* Hero Icons used as placeholders for social visual spacing */}
               <div className="w-2 h-2 rounded-full bg-slate-200" />
               <Link href="/privacy" className="text-xs font-black hover:text-slate-900">PRIVACY</Link>
               <div className="w-2 h-2 rounded-full bg-slate-200" />
               <Link href="/terms" className="text-xs font-black hover:text-slate-900">TERMS</Link>
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
        </div>
      </div>
    </footer>
  );
}

const ContactLink = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
  <a href={href} className="flex items-center gap-4 group">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-slate-900 group-hover:shadow-md transition-all">
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
    </div>
    <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
      {label}
    </span>
  </a>
);