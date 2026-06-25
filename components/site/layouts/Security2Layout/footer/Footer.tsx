'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStoreContext } from '@/contexts/StoreContext';
import {
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
}

interface StoreFormData {
  name?: string;
  slug?: string;
  logoUrl?: string;
  themeSettings?: ThemeSettings;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Footer() {
  const { storeFormData } = useStoreContext() as { storeFormData: StoreFormData };
  const {
    name = 'CyberShield',
    slug = 'cybershield',
    logoUrl,
    themeSettings = {},
    contactEmail,
    contactPhone,
    address,
    socialLinks,
  } = storeFormData;

  const primaryColor = themeSettings.primaryColor || '#00A880';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Telemetry channel established. System alerts will route here.');
  };

  return (
    <footer className="relative bg-white text-gray-900 border-t border-gray-200 overflow-hidden">
      
      {/* BACKGROUND TELEMETRY STRUCTURAL GRID */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none border-x border-gray-900 max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-12 gap-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="border-r border-gray-900 h-full" />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 pt-20 pb-12">
        
        {/* CORE FLAT MATRIX LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-12 border border-gray-200 bg-white">
          
          {/* COLUMN 1: CORPORATE BOUNDARY RECORD (4/12 width) */}
          <div className="md:col-span-4 p-8 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col justify-between">
            <div className="space-y-6">
              <Link href={`/${slug}`} className="inline-block">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name}
                    width={130}
                    height={36}
                    loader={loader}
                    className="object-contain grayscale contrast-125 mix-blend-multiply max-h-9"
                  />
                ) : (
                  <span className="text-lg font-mono font-black uppercase tracking-tighter text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5" style={{ backgroundColor: primaryColor }} />
                    {name}
                  </span>
                )}
              </Link>
              <p className="text-xs font-mono text-gray-500 uppercase leading-relaxed tracking-tight">
                Critical asset management, network telemetry protection, and enterprise infrastructure fortification routines assigned under operational node {slug.toUpperCase()}.
              </p>
            </div>

            {/* SOCIAL TELEMETRY MATRIX */}
            {socialLinks && Array.isArray(socialLinks) && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100 mt-8">
                {socialLinks.map((link: any, index: number) => {
                  // Handle either array of objects [{channel, url}] or protect against null formats
                  const platform = link?.channel || `LINK_${index}`;
                  const href = link?.url || '';
                  
                  if (!href) return null;

                  return (
                    <a
                      key={index}
                      href={href.startsWith('http') ? href : `https://${href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-mono font-bold uppercase border border-gray-200 px-2.5 py-1 text-gray-400 hover:text-gray-950 hover:border-gray-950 transition-colors"
                    >
                      {String(platform).slice(0, 3)}//
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* COLUMN 2: INTERNAL ROUTING SYSTEM (2/12 width) */}
          <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-6">[SYS_LINKS]</span>
            <ul className="space-y-3">
              {[
                { label: 'HOME', href: `/${slug}` },
                { label: 'SERVICES', href: '#services' },
                { label: 'CASE STUDIES', href: '#case-studies' },
                { label: 'FAQS', href: '#security-faqs' },
                { label: 'CONTACT', href: '#contact-routing' }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs font-mono font-bold text-gray-500 hover:text-gray-950 transition-colors uppercase block tracking-wider">
                    // {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: DIRECT DATA CHANNELS (3/12 width) */}
          <div className="md:col-span-3 p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-6">[SYS_ENDPOINT]</span>
            <ul className="space-y-4">
              {contactEmail && (
                <li>
                  <Link href={`mailto:${contactEmail}`} className="group flex items-start gap-2.5 text-gray-500 hover:text-gray-950 transition-colors">
                    <EnvelopeIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:text-gray-950" />
                    <span className="text-xs font-mono font-bold uppercase tracking-tight break-all">{contactEmail}</span>
                  </Link>
                </li>
              )}
              {contactPhone && (
                <li>
                  <Link href={`tel:${contactPhone}`} className="group flex items-start gap-2.5 text-gray-500 hover:text-gray-950 transition-colors">
                    <PhoneIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:text-gray-950" />
                    <span className="text-xs font-mono font-bold uppercase tracking-tight">{contactPhone}</span>
                  </Link>
                </li>
              )}
              {address && (
                <li>
                  <div className="flex items-start gap-2.5 text-gray-500">
                    <MapPinIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-tight leading-tight">{address}</span>
                  </div>
                </li>
              )}
              {!contactEmail && !contactPhone && !address && (
                <li className="text-xs font-mono text-gray-300 font-bold uppercase">// NO_ENDPOINT_DATA</li>
              )}
            </ul>
          </div>

          {/* COLUMN 4: TRANSMISSION BROADCAST INBOUNDS (3/12 width) */}
          <div className="md:col-span-3 p-8 bg-gray-50/50 flex flex-col justify-between">
            <div>
              <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-4">[BROADCAST_FEED]</span>
              <p className="text-xs font-mono text-gray-400 uppercase tracking-tight leading-normal mb-6">
                Establish an immediate operational socket to capture incoming threat matrix intelligence briefs.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="relative border border-gray-200 bg-white">
              <input
                type="email"
                placeholder="EMAIL_SOCKET"
                required
                className="w-full bg-transparent text-xs font-mono p-3 pr-10 text-gray-900 placeholder-gray-300 uppercase tracking-tight focus:outline-none"
                aria-label="Secure email communication socket"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-950 transition-colors flex items-center justify-center border-l border-gray-100 bg-gray-50"
              >
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* BOTTOM TERMINAL FOOTER LINE */}
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase">
          <div>
            © {new Date().getFullYear()} {name.toUpperCase()}. CORE_SYS_ALL_RIGHTS_RESERVED.
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 px-3 py-1 bg-gray-50">
            <span>POWERED_BY //</span>
            <a 
              href="https://salesmanpro.site" 
              className="text-orange-600 hover:text-orange-700 font-black transition-colors"
            >
              SALESMANPRO.SITE
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}