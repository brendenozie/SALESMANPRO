"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChevronRightIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) return null;

  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks,
    StoreCategory,
    themeSettings,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail,
        isMain: true
      }];

  const primaryColor = themeSettings?.primaryColor || '#1e3a8a';

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      {/* ── Pre-Footer: Brand Statement ── */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center pb-16 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-4">
              {name}<span style={{ color: primaryColor }}>.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {description || "Empowering the next generation of leaders through world-class education and curated academic experiences."}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 lg:justify-end">
            {socialLinks?.map((s: any) => (
              <a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:scale-105 transition-all"
              >
                {s.channel}
              </a>
            ))}
          </div>
        </div>

        {/* ── Main Footer Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 py-16">
          
          {/* Column 1: Navigation */}
          <div className="col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Navigation</h3>
            <ul className="space-y-4">
              {['Home', 'Courses', 'FAQs', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`${item === 'Home' ? '' : `/courses/${item.toLowerCase()}`}`}
                    className="group flex items-center text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <ChevronRightIcon className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" style={{ color: primaryColor }} />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Academic Categories */}
          <div className="col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Specializations</h3>
            <ul className="space-y-4">
              {StoreCategory?.slice(0, 4).map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    href={`/courses/products?category=${cat.id}`}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {cat.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 & 4: Regional Locations & Contact Hub */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Our Locations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {regionalAddresses.map((loc: any, idx: number) => {
                const label = loc?.label || (idx === 0 ? "Headquarters" : `Branch ${idx + 1}`);
                const fullAddress = typeof loc === "string" ? loc : loc?.address;
                const phone = loc?.contactPhone || contactPhone;
                const emailAddr = loc?.contactEmail || contactEmail;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || "")}`;

                return (
                  <div 
                    key={idx} 
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        {label}
                        {(loc?.isMain || idx === 0) && (
                          <span 
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                            style={{ backgroundColor: primaryColor }}
                          >
                            HQ
                          </span>
                        )}
                      </span>
                      {fullAddress && (
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
                          title="View on Google Maps"
                        >
                          Map <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {fullAddress && (
                      <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <MapPinIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                        <span className="line-clamp-2">{fullAddress}</span>
                      </div>
                    )}

                    {phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                        <a href={`tel:${phone}`} className="hover:underline truncate">{phone}</a>
                      </div>
                    )}

                    {emailAddr && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                        <a href={`mailto:${emailAddr}`} className="hover:underline truncate">{emailAddr}</a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 5: Bento Status Box */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admissions Active</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">Current response time for inquiries is under 24 hours.</p>
              <Link href={`/courses/contact`} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline" style={{ color: primaryColor }}>
                Apply Now <ChevronRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── Sub-Footer ── */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} {name}. Built for Future Leaders.
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</span>
              <a 
                href="https://salesmanpro.site" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
              >
                SalesmanPro
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}