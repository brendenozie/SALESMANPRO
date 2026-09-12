"use client";

import React from "react";
import Link from "next/link";
import { 
  CpuChipIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  HashtagIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowUpRightIcon
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { EditableElement } from "@/contexts/EditableContentContext";

interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

export default function Footer() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) return null;

  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#f97316";
  const currentYear = new Date().getFullYear();
    
  const {
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isPrimary: true
      }];

  return (
    <footer className="relative bg-neutral-50 dark:bg-neutral-950 pt-20 pb-10 sm:pt-24 sm:pb-12 overflow-hidden border-t border-neutral-200/60 dark:border-neutral-900/40 transition-colors duration-500">
      
      {/* Top Border Dynamic Edge Accent Glow */}
      <div 
        className="absolute top-0 left-0 w-full h-[1px] opacity-40 dark:opacity-60 pointer-events-none" 
        style={{ 
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)` 
        }} 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-x-8 gap-y-12 md:gap-16 mb-16 sm:mb-20">
          
          {/* BRAND COLUMN: Identity & Interactive Status Deck */}
          <div className="md:col-span-4 space-y-6 text-center sm:text-left">
            <div>
              <EditableElement
                targetId="footer.brandName"
                componentKey="Footer"
                elementKey="brandName"
                label="Brand Name"
                defaultValue={storeFormData.name}
                inline
              >
                {(val) => (
                  <h4 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white italic tracking-tighter uppercase mb-3">
                    {val}<span style={{ color: primaryColor }}>.</span>
                  </h4>
                )}
              </EditableElement>

              <EditableElement
                targetId="footer.bio"
                componentKey="Footer"
                elementKey="bio"
                label="Brand Bio / Description"
                type="textarea"
                defaultValue={storeFormData.description || "Architecting elite human performance through neural and physical recalibration."}
              >
                {(val) => (
                  <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium uppercase tracking-widest leading-relaxed max-w-xs mx-auto sm:mx-0">
                    {val}
                  </p>
                )}
              </EditableElement>
            </div>

            {/* Embedded Live Network Diagnostics Grid Module */}
            <div className="p-4 bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-900/60 rounded-xl inline-block shadow-sm text-left">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] font-black text-neutral-800 dark:text-white uppercase tracking-[0.25em]">System Status: Operational</span>
              </div>
              <div className="flex gap-[3px]">
                {[...Array(14)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-3 w-[2px] rounded-full transition-colors duration-500" 
                    style={{ 
                      backgroundColor: i < 11 ? primaryColor : undefined,
                      opacity: i < 11 ? 0.35 : 0.08
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* NAVIGATION LINKS GRID MATRIX */}
          <div className="sm:col-span-2 md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
            
            {/* Core Protocol Modules */}
            <div className="space-y-4 sm:space-y-5">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Protocols</h5>
              <ul className="space-y-3">
                {['Programs', 'Trainers', 'Intelligence', 'Community'].map((item) => (
                  <li key={item}>
                    <Link 
                      href={`/fitness/${item.toLowerCase()}`} 
                      className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 group"
                    >
                      <div 
                        className="h-[1px] w-0 group-hover:w-3 transition-all duration-300 shrink-0" 
                        style={{ backgroundColor: primaryColor }}
                      />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Network Uplinks */}
            <div className="space-y-4 sm:space-y-5">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Network</h5>
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group">
                  <HashtagIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="text-xs font-black uppercase tracking-widest">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group">
                  <GlobeAltIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="text-xs font-black uppercase tracking-widest">Global Link</span>
                </a>
                <a href="#" className="flex items-center gap-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors group">
                  <CpuChipIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="text-xs font-black uppercase tracking-widest">App OS</span>
                </a>
              </div>
            </div>

            {/* Legal Risk Compliance */}
            <div className="space-y-4 sm:space-y-5 col-span-2 sm:col-span-1">
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Compliance</h5>
              <ul className="space-y-3 grid grid-cols-2 sm:grid-cols-1 gap-y-1">
                <li><Link href="/fitness/privacy" className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Privacy</Link></li>
                <li><Link href="/fitness/terms" className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors">Terms</Link></li>
                <li><Link href="/fitness/security" className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" /> Security
                </Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* REGIONAL LOCATIONS & MULTI-ADDRESS SHOWCASE */}
        <div className="py-10 border-t border-neutral-200/60 dark:border-neutral-900/60">
          <div className="flex items-center gap-2 mb-6">
            <MapPinIcon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
            <h5 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
              Locations & Facilities ({regionalAddresses.length})
            </h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const fullQuery = [loc.address, loc.city, loc.country].filter(Boolean).join(', ');
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;

              return (
                <div 
                  key={idx}
                  className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-900/80 bg-white/50 dark:bg-neutral-900/20 hover:bg-white dark:hover:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-800 transition-all duration-300 flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300">
                        {loc.label || `Facility 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>
                          Primary
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed pt-1">
                      {loc.address || "Location available upon request."}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                        {[loc.city, loc.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 space-y-2 text-xs font-medium">
                    {loc.contactPhone && (
                      <a href={`tel:${loc.contactPhone}`} className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                        <PhoneIcon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a href={`mailto:${loc.contactEmail}`} className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors truncate">
                        <EnvelopeIcon className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    <a 
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 pt-2 text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                      style={{ color: primaryColor }}
                    >
                      <span>Get Directions</span>
                      <ArrowUpRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMPLIANCE META FOOTER ROW PLATE */}
        <div className="pt-10 border-t border-neutral-200/60 dark:border-neutral-900/60 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <EditableElement
            targetId="footer.copyrightText"
            componentKey="Footer"
            elementKey="copyrightText"
            label="Copyright Notice"
            defaultValue={`© ${currentYear} ${storeFormData.name} // Neural Dynamics Inc.`}
            inline
          >
            {(val) => (
              <div className="text-[10px] font-black text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.4em]">
                {val}
              </div>
            )}
          </EditableElement>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Encryption:</span>
              <span className="text-[9px] font-black uppercase tracking-widest opacity-80" style={{ color: primaryColor }}>AES-256</span>
            </div>
            
            <div className="flex items-center gap-1.5 group">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600">Powered by</span>
              <a 
                href="https://salesmanpro.site" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                style={{ color: primaryColor }}
              >
                SalesmanPro.site
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Canvas Dynamic Edge Watermark */}
      <div className="absolute bottom-[-10px] sm:bottom-[-2%] left-1/2 -translate-x-1/2 text-[13vw] font-black text-neutral-900/[0.03] dark:text-white/[0.015] whitespace-nowrap pointer-events-none select-none italic tracking-tighter transition-colors">
        PERFORMANCE ARCHITECTURE
      </div>
    </footer>
  );
}