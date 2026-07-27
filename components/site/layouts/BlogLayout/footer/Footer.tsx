'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ArrowRightIcon, 
  MapPinIcon, 
  PhoneIcon, 
  CheckCircleIcon,
  BuildingOfficeIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

export default function Footer() {
  const { storeFormData } = useStoreContext() || {};
  const { 
    name = 'GLOBAL INSIGHTS', 
    description = '', 
    socialLinks = [], 
    themeSettings = null,
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  const globalPhone = contactPhone || storeFormData?.phone || '+254 700 000 000';
  const globalEmail = contactEmail || storeFormData?.email || 'info@globalinsights.io';
  const fallbackAddress = legacyAddress || 'Lusingeti Road, Number 31, Industrial Area, Nairobi';

  // Extract up to 3 addresses for the regional showcase. 
  const regionalAddresses = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: fallbackAddress,
        contactPhone: globalPhone,
        contactEmail: globalEmail
      }];

  // State management
  const [activeNodeIdx, setActiveNodeIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const selectedBranch = regionalAddresses[activeNodeIdx] || regionalAddresses[0];
  const primaryColor = themeSettings?.primaryColor || "#f97316";

  const navItems = [
    { label: 'Home', href: `/` },
    { label: 'Blog', href: `/blog/listings` },
    { label: 'About', href: `/blog/about` },
    { label: 'Contact', href: `/blog/contact` },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    console.log(`Pipeline subscription request logged for node: ${email}`);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="w-full bg-slate-950 text-slate-400 pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-900 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* ===== STRUCTURAL COLUMNS MATRIX ===== */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-16 border-b border-slate-900">
          
          {/* Column 1: Core Platform Profile (3/12 Span) */}
          <div className="md:col-span-3 flex flex-col items-start">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              About {name}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              {description ||
                'Delivering quality high-density insights, architecture reviews, and production-ready system patterns to keep your platform optimized.'}
            </p>

            {/* Quick Contact Info */}
            <div className="space-y-2 text-xs font-mono">
              <a 
                href={`tel:${globalPhone}`} 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <PhoneIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>{globalPhone}</span>
              </a>
              <a 
                href={`mailto:${globalEmail}`} 
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <EnvelopeIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                <span>{globalEmail}</span>
              </a>
            </div>
          </div>

          {/* Column 2: Index Tree Navigation (2/12 Span) */}
          <div className="md:col-span-2 flex flex-col items-start">
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

          {/* Column 3: Regional Addresses / System Nodes Showcase (3/12 Span) */}
          <div className="md:col-span-3 flex flex-col items-start">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-4 flex items-center gap-1.5">
              <BuildingOfficeIcon className="w-4 h-4" style={{ color: primaryColor }} />
              <span>System Nodes</span>
            </h3>

            {/* Node Switcher Tabs */}
            {regionalAddresses.length > 1 && (
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 max-w-full">
                {regionalAddresses.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveNodeIdx(idx)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer whitespace-nowrap ${
                      activeNodeIdx === idx
                        ? 'bg-slate-800 text-white border-slate-700'
                        : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-300'
                    }`}
                  >
                    [{loc.label || `NODE-0${idx + 1}`}]
                  </button>
                ))}
              </div>
            )}

            {/* Node Details Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNodeIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="w-full p-3 bg-slate-900/60 border border-slate-850 rounded space-y-2 text-xs"
              >
                <div className="flex items-start gap-2 text-slate-300">
                  <MapPinIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <span className="leading-relaxed font-mono text-[11px]">
                    {selectedBranch?.address || selectedBranch?.location || fallbackAddress}
                  </span>
                </div>

                {(selectedBranch?.contactPhone || globalPhone) && (
                  <a
                    href={`tel:${selectedBranch?.contactPhone || globalPhone}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-[11px] font-mono"
                  >
                    <PhoneIcon className="w-3.5 h-3.5 text-slate-600" />
                    <span>{selectedBranch?.contactPhone || globalPhone}</span>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Column 4: Ingestion Pipeline & Channel Links (4/12 Span) */}
          <div className="md:col-span-4 flex flex-col items-start">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              Data Subscription
            </h3>

            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full p-3 bg-slate-900 border border-emerald-500/30 rounded flex items-center gap-2.5 text-emerald-400 text-xs mb-6 font-mono"
              >
                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                <span>Endpoint linked successfully.</span>
              </motion.div>
            ) : (
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
                  className="w-full h-10 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs uppercase tracking-wider border border-slate-800 rounded flex items-center justify-center gap-2 transition-colors active:scale-[0.99] cursor-pointer"
                >
                  Connect Endpoint
                  <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
                </button>
              </form>
            )}

            {/* External Social Nodes */}
            {Array.isArray(socialLinks) && socialLinks.length > 0 && (
              <div className="w-full">
                <div className="text-[10px] font-mono tracking-widest text-slate-600 uppercase mb-3">
                  External Channels
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {socialLinks.map((link: any, index: number) => (
                    <a
                      key={link?.channel || index}
                      href={link?.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded border border-slate-900 bg-slate-950 hover:border-slate-800 text-xs font-mono text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      {link?.channel ? String(link.channel).toUpperCase() : 'NODE'}
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
            &copy; {new Date().getFullYear()} {String(name).toUpperCase()}. DATA ENGINE SECURED.
          </div>
          
          <div className="flex items-center gap-2 px-3 h-7 border border-slate-900 bg-slate-950 rounded text-center order-1 sm:order-2">
            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
              Powered by
            </span>
            <a 
              href="https://salesmanpro.site" 
              target="_blank"
              rel="noopener noreferrer"
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