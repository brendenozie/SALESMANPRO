"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import { EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    contactEmail,
    contactPhone,
    socialLinks,
    StoreCategory,
    themeSettings,
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || "#10B981";
  const currentYear = new Date().getFullYear();
  const baseSlug = slug || "non-profit";

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-16 border-b border-slate-900">
          
          {/* Brand Column (5 Columns Wide) */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-xl font-black tracking-tight text-white uppercase">
                {name || "Platform"}
              </span>
            </Link>
            
            {description && (
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                {description}
              </p>
            )}

            {/* Structured Minimal Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {socialLinks.map((s: any) => (
                  <a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white transition-colors"
                  >
                    {s.channel}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Matrix (7 Columns Wide Split into 3 Sub-columns) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-10 lg:pl-8">
            
            {/* Quick Navigation Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
                Navigation
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href={`/${baseSlug}/nonprofit/programs`} className="hover:text-white transition-colors">
                    Programs
                  </Link>
                </li>
                <li>
                  <Link href={`/${baseSlug}/nonprofit/donate`} className="hover:text-white transition-colors">
                    Donate
                  </Link>
                </li>
                <li>
                  <Link href={`/${baseSlug}/nonprofit/contact`} className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categorized Impact Initiatives */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
                Focus Areas
              </h4>
              <ul className="space-y-3 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {StoreCategory && StoreCategory.length > 0 ? (
                  StoreCategory.map((cat: any) => (
                    <li key={cat.id}>
                      <Link
                        href={`/${baseSlug}/nonprofit/products?category=${cat.id}`}
                        className="hover:text-white transition-colors block truncate"
                      >
                        {cat.displayName}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-600 italic text-xs">No active categories mapped</li>
                )}
              </ul>
            </div>

            {/* Operational Communications Access Points */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
                Contact Office
              </h4>
              <ul className="space-y-4 text-sm">
                {contactEmail && (
                  <li className="flex items-center gap-2 group">
                    <EnvelopeIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />
                    <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors truncate">
                      {contactEmail}
                    </a>
                  </li>
                )}
                {contactPhone && (
                  <li className="flex items-center gap-2 group">
                    <PhoneIcon className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />
                    <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                      {contactPhone}
                    </a>
                  </li>
                )}
              </ul>
            </div>

          </div>
        </div>

        {/* Sub-Footer Meta Operations Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <p>
            &copy; {currentYear} {name || "Organization"}. Built with system transparency.
          </p>
          
          <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-900 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Design By: </span>
            <a 
              href="https://salesmanpro.site" 
              className="text-[10px] font-black uppercase tracking-widest transition-colors"
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