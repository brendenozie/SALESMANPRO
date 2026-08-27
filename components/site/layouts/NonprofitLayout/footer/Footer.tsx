"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BuildingOfficeIcon 
} from "@heroicons/react/24/outline";

interface StoreAddress {
  id?: string | number;
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

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
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for regional showcase with fallback to legacy single address
  const regionalAddresses: StoreAddress[] = addresses?.length > 0 
    ? addresses.slice(0, 3) 
    : [{
        id: "primary-fallback",
        label: "Global Headquarters",
        address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
        contactPhone: contactPhone,
        contactEmail: contactEmail
      }];

  const primaryColor = themeSettings?.primaryColor || "#10B981";
  const currentYear = new Date().getFullYear();
  const baseSlug = slug || "non-profit";

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-12 border-b border-slate-900">
          
          {/* Brand Column */}
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

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {socialLinks.map((s: { channel: string; url: string }) => (
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

          {/* Navigation Matrix */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10 lg:pl-8">
            
            {/* Navigation Links */}
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

            {/* Focus Areas / Categories */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-5">
                Focus Areas
              </h4>
              <ul className="space-y-3 text-sm max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {StoreCategory && StoreCategory.length > 0 ? (
                  StoreCategory.map((cat: { id: string | number; displayName?: string; name?: string }) => (
                    <li key={cat.id}>
                      <Link
                        href={`/${baseSlug}/nonprofit/products?category=${cat.id}`}
                        className="hover:text-white transition-colors block truncate"
                      >
                        {cat.displayName || cat.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-600 italic text-xs">No active categories mapped</li>
                )}
              </ul>
            </div>

          </div>
        </div>

        {/* Dynamic Multi-Address Showcase */}
        {regionalAddresses.length > 0 && (
          <div className="py-10 border-b border-slate-900">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">
              Our Locations & Support Offices
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regionalAddresses.map((office, idx) => (
                <div
                  key={office.id || idx}
                  className="bg-slate-900/60 border border-slate-900 p-5 rounded-xl space-y-3 hover:border-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider">
                    <BuildingOfficeIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{office.label || `Office ${idx + 1}`}</span>
                  </div>

                  {office.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(office.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-2.5 text-xs text-slate-400 hover:text-white transition-colors group"
                    >
                      <MapPinIcon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                      <span className="leading-relaxed">{office.address}</span>
                    </a>
                  )}

                  {office.contactPhone && (
                    <a
                      href={`tel:${office.contactPhone}`}
                      className="flex items-center space-x-2.5 text-xs text-slate-400 hover:text-white transition-colors group"
                    >
                      <PhoneIcon className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-white transition-colors" />
                      <span>{office.contactPhone}</span>
                    </a>
                  )}

                  {office.contactEmail && (
                    <a
                      href={`mailto:${office.contactEmail}`}
                      className="flex items-center space-x-2.5 text-xs text-slate-400 hover:text-white transition-colors group"
                    >
                      <EnvelopeIcon className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-white transition-colors" />
                      <span className="truncate">{office.contactEmail}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Footer Meta Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600">
          <p>
            &copy; {currentYear} {name || "Organization"}. Built with system transparency.
          </p>
          
          <div className="flex items-center gap-1.5 bg-slate-900/50 border border-slate-900 px-3 py-1.5 rounded-lg">
            <span className="text-[10px] uppercase tracking-widest text-slate-500">Powered By: </span>
            <a 
              href="https://salesmanpro.site" 
              target="_blank"
              rel="noopener noreferrer"
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