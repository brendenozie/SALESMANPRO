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
  ArrowUpRightIcon,
} from '@heroicons/react/24/solid';

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
}

interface AddressItem {
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface StoreFormData {
  name?: string;
  slug?: string;
  logoUrl?: string;
  themeSettings?: ThemeSettings;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  addresses?: AddressItem[];
  socialLinks?: Array<{ channel?: string; url?: string }> | Record<string, string>;
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
    address: legacyAddress,
    addresses = [],
    socialLinks,
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: 'Global Headquarters',
            address: legacyAddress || 'Lusingeti Road, Number 31, Industrial Area, Nairobi',
            contactPhone: contactPhone,
            contactEmail: contactEmail,
          },
        ];

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
            {socialLinks && (
              <div className="flex flex-wrap gap-2 pt-8 border-t border-gray-100 mt-8">
                {Array.isArray(socialLinks)
                  ? socialLinks.map((link: any, index: number) => {
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
                    })
                  : Object.entries(socialLinks).map(([platform, href]) => {
                      if (!href) return null;
                      return (
                        <a
                          key={platform}
                          href={String(href).startsWith('http') ? String(href) : `https://${href}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono font-bold uppercase border border-gray-200 px-2.5 py-1 text-gray-400 hover:text-gray-950 hover:border-gray-950 transition-colors"
                        >
                          {platform.slice(0, 3)}//
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
                { label: 'CONTACT', href: '#contact-routing' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs font-mono font-bold text-gray-500 hover:text-gray-950 transition-colors uppercase block tracking-wider">
                    // {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: PRIMARY ENDPOINT & QUICK CONTACT (3/12 width) */}
          <div className="md:col-span-3 p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-6">[SYS_ENDPOINT]</span>
            <ul className="space-y-4">
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="group flex items-start gap-2.5 text-gray-500 hover:text-gray-950 transition-colors">
                    <EnvelopeIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:text-gray-950 flex-shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-tight break-all">{contactEmail}</span>
                  </a>
                </li>
              )}
              {contactPhone && (
                <li>
                  <a href={`tel:${contactPhone}`} className="group flex items-start gap-2.5 text-gray-500 hover:text-gray-950 transition-colors">
                    <PhoneIcon className="w-3.5 h-3.5 mt-0.5 text-gray-400 group-hover:text-gray-950 flex-shrink-0" />
                    <span className="text-xs font-mono font-bold uppercase tracking-tight">{contactPhone}</span>
                  </a>
                </li>
              )}
              {!contactEmail && !contactPhone && (
                <li className="text-xs font-mono text-gray-300 font-bold uppercase">// NO_DEFAULT_ENDPOINT</li>
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

        {/* REGIONAL LOCATIONS SHOWCASE MATRIX */}
        {regionalAddresses.length > 0 && (
          <div className="mt-8 border border-gray-200 bg-white p-6 md:p-8">
            <span className="block text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-6">
              [REGIONAL_NODES // LOCATION_TELEMETRY]
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regionalAddresses.map((loc, idx) => {
                const mapsUrl = loc.address
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`
                  : null;

                return (
                  <div
                    key={idx}
                    className="p-5 border border-gray-100 bg-gray-50/30 flex flex-col justify-between space-y-4 hover:border-gray-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinIcon className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                        <h6 className="text-xs font-mono font-black uppercase text-gray-900 tracking-wider">
                          {loc.label || `NODE_0${idx + 1}`}
                        </h6>
                      </div>
                      {loc.address && (
                        <p className="text-[11px] font-mono text-gray-500 uppercase leading-normal tracking-tight pl-5">
                          {loc.address}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-100 font-mono text-[10px] font-bold">
                      {loc.contactPhone && (
                        <a
                          href={`tel:${loc.contactPhone}`}
                          className="flex items-center gap-2 text-gray-500 hover:text-gray-950 transition-colors uppercase"
                        >
                          <PhoneIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span>{loc.contactPhone}</span>
                        </a>
                      )}

                      {loc.contactEmail && (
                        <a
                          href={`mailto:${loc.contactEmail}`}
                          className="flex items-center gap-2 text-gray-500 hover:text-gray-950 transition-colors uppercase truncate"
                        >
                          <EnvelopeIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{loc.contactEmail}</span>
                        </a>
                      )}

                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-gray-900 hover:text-emerald-600 transition-colors uppercase pt-1 font-black"
                        >
                          <span>NAVIGATE_TO_NODE</span>
                          <ArrowUpRightIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM TERMINAL FOOTER LINE */}
        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-mono font-bold tracking-widest text-gray-400 uppercase">
          <div>
            © {new Date().getFullYear()} {name.toUpperCase()}. CORE_SYS_ALL_RIGHTS_RESERVED.
          </div>
          <div className="flex items-center gap-1.5 border border-gray-200 px-3 py-1 bg-gray-50">
            <span>POWERED_BY //</span>
            <a
              href="https://salesmanpro.site"
              target="_blank"
              rel="noopener noreferrer"
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