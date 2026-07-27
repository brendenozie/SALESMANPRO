'use client';

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  EnvelopeIcon,
  PhoneIcon,
  ArrowUpRightIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export default function MoriahFooter() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) return null;

  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks,
    StoreCategory,
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
        isMain: true,
      }];

  return (
    <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* --- Brand Column: 4/12 --- */}
          <div className="lg:col-span-4">
            <Link href={`/`} className="group flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <AcademicCapIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">{name}</span>
            </Link>
            
            <p className="text-sm leading-relaxed mb-10 max-w-sm">
              {description || "Empowering the next generation of industry leaders through curated knowledge and expert-led live experiences."}
            </p>

            <div className="flex flex-wrap gap-3">
              {socialLinks?.map((s: any) => (
                <a
                  key={s.channel}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-slate-950 hover:border-white transition-all duration-300"
                >
                  <span className="sr-only">{s.channel}</span>
                  <GlobeAltIcon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* --- Quick Navigation: 2/12 --- */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Platform</h4>
            <ul className="space-y-4">
              {['Home', 'Courses', 'Events', 'FAQs', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === 'Home' ? `` : `/courses/${item.toLowerCase()}`}
                    className="text-sm hover:text-blue-500 transition-colors flex items-center group"
                  >
                    {item}
                    <ArrowUpRightIcon className="w-3 h-3 ml-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Categories Cloud: 3/12 --- */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Disciplines</h4>
            <div className="flex flex-wrap gap-2">
              {StoreCategory?.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/courses/products?category=${cat.id}`}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-medium hover:bg-white/5 hover:border-white/30 transition-all text-slate-300"
                >
                  {cat.displayName}
                </Link>
              ))}
            </div>
          </div>

          {/* --- Dynamic Locations & Reach: 3/12 --- */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Locations & Reach</h4>
            <div className="space-y-6">
              {regionalAddresses.map((loc: any, idx: number) => {
                const label = loc?.label || (idx === 0 ? "Headquarters" : `Branch ${idx + 1}`);
                const fullAddress = typeof loc === "string" ? loc : loc?.address;
                const phone = loc?.contactPhone || contactPhone;
                const emailAddr = loc?.contactEmail || contactEmail;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || "")}`;

                return (
                  <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] space-y-2 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        {label}
                        {(loc?.isMain || idx === 0) && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            HQ
                          </span>
                        )}
                      </span>
                      {fullAddress && (
                        <a 
                          href={mapsUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                          title="View on Google Maps"
                        >
                          Map <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {fullAddress && (
                      <div className="flex items-start gap-2 text-xs text-slate-400">
                        <MapPinIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{fullAddress}</span>
                      </div>
                    )}

                    {phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <PhoneIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <a href={`tel:${phone}`} className="hover:text-blue-400 transition-colors truncate">{phone}</a>
                      </div>
                    )}

                    {emailAddr && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <EnvelopeIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <a href={`mailto:${emailAddr}`} className="hover:text-blue-400 transition-colors truncate">{emailAddr}</a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-slate-500">
            &copy; {new Date().getFullYear()} {name}. Built for the future of learning.
          </p>
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Powered by</span>
                <a 
                  href="https://salesmanpro.site" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-500 transition-colors border-b border-orange-600/20"
                >
                  SalesmanPro.site
                </a>
             </div>
             <div className="h-4 w-px bg-white/10 hidden md:block" />
             <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}