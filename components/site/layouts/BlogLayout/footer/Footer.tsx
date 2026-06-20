'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export default function Footer() {
  const { storeFormData } = useStoreContext() || {};
  const { name, description, socialLinks, themeSettings } = storeFormData || {
    name: 'GLOBAL INSIGHTS',
    description: '',
    socialLinks: [],
    themeSettings: null
  };
  
  const [email, setEmail] = useState('');

  const primaryColor = themeSettings?.primaryColor || "#f97316";

  const navItems = [
    { label: 'Home', href: `/` },
    { label: 'Blog', href: `/blog/listings` },
    { label: 'About', href: `/blog/about` },
    { label: 'Contact', href: `/blog/contact` },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Pipeline subscription request logged for node: ${email}`);
    setEmail('');
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-900 font-sans relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ===== STRUCTURAL COLUMNS MATRIX ===== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-slate-900">
          
          {/* Column 1: Core Platform Profile (4/12 Span) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              About {name}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {description ||
                'Delivering quality high-density insights, architecture reviews, and production-ready system patterns to keep your platform optimized.'}
            </p>
          </div>

          {/* Column 2: Explicit Navigation Links (3/12 Span) */}
          <div className="md:col-span-3 flex flex-col items-start">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              Index Tree
            </h3>
            <ul className="space-y-2.5 text-xs">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href} 
                    className="hover:text-white transition-colors tracking-wide font-medium"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Ingestion Pipeline & Channel Links (4/12 Span) */}
          <div className="md:col-span-4 flex flex-col items-start">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              Data Subscription
            </h3>
            <form onSubmit={handleSubscribe} className="flex flex-col w-full gap-2 mb-6">
              <div className="relative w-full">
                <EnvelopeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Enter secure email token"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 bg-slate-950 text-slate-200 placeholder-slate-600 pl-10 pr-4 text-xs border border-slate-800 rounded focus:outline-none focus:border-slate-700 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full h-10 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs uppercase tracking-wider border border-slate-800 rounded flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
              >
                Connect Endpoint
                <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </form>

            {/* Platform Node Integrations (Social Vectors) */}
            {Array.isArray(socialLinks) && socialLinks.length > 0 && (
              <div className="w-full">
                <div className="text-[10px] font-mono tracking-widest text-slate-600 uppercase mb-3">
                  External Channels
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {socialLinks.map((link: any, index: number) => (
                    <a
                      key={link.channel || index}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded border border-slate-900 bg-slate-950 hover:border-slate-800 text-xs font-mono text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      {link.channel ? link.channel.toUpperCase() : 'NODE'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ===== METADATA ATTRIBUTION GRID ROW ===== */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[11px] font-mono text-slate-600 tracking-wide order-2 sm:order-1">
            &copy; {new Date().getFullYear()} {name.toUpperCase()}. DATA ENGINE SECURED.
          </div>
          
          <div className="flex items-center gap-2 px-3 h-7 border border-slate-900 bg-slate-950 rounded text-center order-1 sm:order-2">
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
              Powered by
            </span>
            <a 
              href="https://salesmanpro.site" 
              className="text-[9px] font-bold tracking-wider uppercase transition-colors"
              style={{ color: primaryColor }}
            >
              SalesmanPro.site
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}