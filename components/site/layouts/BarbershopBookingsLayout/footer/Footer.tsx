'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';
import { 
  PaperAirplaneIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function SiteFooter() {
  const year = new Date().getFullYear();
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactPhone,
    contactEmail,
    themeSettings,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#C5A267';

  const navLinks = [
    { label: 'The Collection', links: [
      { name: 'Rituals', href: '#services' },
      { name: 'Our Philosophy', href: '#benefits' },
      { name: 'The Collective', href: '#testimonials' },
      { name: 'Intelligence', href: '#faq' }
    ]},
    { label: 'Legal & Privacy', links: [
      { name: 'Privacy Protocol', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-of-service' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Contact Concierge', href: '#contact' }
    ]}
  ];

  return (
    <footer className="relative bg-[#050505] pt-32 pb-12 overflow-hidden">
      {/* Cinematic Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02]">
        <h2 className="text-[25vw] font-black text-white leading-none tracking-tighter uppercase whitespace-nowrap">
          {name || 'RITUAL'}
        </h2>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start mb-32">
          
          {/* Brand & Elite Newsletter */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <Link href="/" className="inline-block mb-6">
                <span className="text-4xl font-black tracking-tighter text-white">
                  {name || 'SwiftServe'}<span className="text-[#C5A267]">.</span>
                </span>
              </Link>
              <p className="text-xl text-zinc-500 font-light leading-relaxed max-w-sm">
                {description || `Defining the new standard of precision and luxury in service curation.`}
              </p>
            </div>

            <div className="relative group max-w-md">
              <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-600 mb-4 block">Newsletter Membership</label>
              <form className="relative flex items-center bg-zinc-900/50 backdrop-blur-xl p-2 rounded-2xl border border-white/5 focus-within:border-[#C5A267]/50 transition-all duration-500">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-6 py-3 bg-transparent text-white placeholder-zinc-700 focus:outline-none font-medium"
                />
                <button
                  type="submit"
                  className="p-4 rounded-xl text-black transition-all hover:scale-105 active:scale-95 shadow-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                </button>
              </form>
            </div>
          </div>

          {/* Navigation Architecture */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            {navLinks.map((column) => (
              <div key={column.label}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A267] mb-10">
                  {column.label}
                </h4>
                <ul className="space-y-5">
                  {column.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        className="text-zinc-500 text-sm font-medium hover:text-white transition-all duration-300 flex items-center group"
                      >
                        <span className="w-0 group-hover:w-4 h-px bg-[#C5A267] transition-all duration-300 mr-0 group-hover:mr-3" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Monolith */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C5A267] mb-10">
              The Concierge
            </h4>
            <div className="space-y-6">
              <ContactLink icon={<PhoneIcon />} label={contactPhone || '+1 (555) 000-0000'} href={`tel:${contactPhone}`} />
              <ContactLink icon={<EnvelopeIcon />} label={contactEmail || 'hello@ritual.com'} href={`mailto:${contactEmail}`} />
              <div className="pt-6">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-3 px-6 py-4 rounded-full border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Live Consultation
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Closing Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              © {year} {name}. All Rights Reserved.
            </span>
            <div className="hidden md:block h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-6">
               <Link href="/privacy" className="text-[10px] font-black text-zinc-500 hover:text-[#C5A267] tracking-widest">PRIVACY</Link>
               <Link href="/terms" className="text-[10px] font-black text-zinc-500 hover:text-[#C5A267] tracking-widest">TERMS</Link>
            </div>
          </div>

          <div className="flex items-center gap-3 group px-5 py-2.5 rounded-full bg-zinc-900/50 border border-white/5 shadow-2xl">
            <SparklesIcon className="w-3 h-3 text-[#C5A267]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Curated by</span>
            <a 
              href="https://salesmanpro.site" 
              className="text-[9px] font-black uppercase tracking-[0.2em] text-white hover:text-[#C5A267] transition-colors"
            >
              SalesmanPro
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const ContactLink = ({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) => (
  <a href={href} className="flex items-center gap-4 group">
    <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-zinc-600 group-hover:border-[#C5A267] group-hover:text-[#C5A267] transition-all duration-500">
      {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4" })}
    </div>
    <span className="text-sm font-light text-zinc-400 group-hover:text-white transition-colors">
      {label}
    </span>
  </a>
);