"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChevronRightIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"; // Using Hero Icons as requested

export default function Footer() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) return null;

  const {
    name,
    slug,
    description,
    contactEmail,
    contactPhone,
    socialLinks,
    StoreCategory,
    themeSettings
  } = storeFormData;

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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 py-16">
          
          {/* Column 1: Navigation */}
          <div className="col-span-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Navigation</h3>
            <ul className="space-y-4">
              {['Home', 'Courses', 'FAQs', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${slug}${item === 'Home' ? '' : `/courses/${item.toLowerCase()}`}`}
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
                    href={`/${slug}/courses/category/${cat.id}`}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {cat.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="col-span-2 lg:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Connect</h3>
            <div className="space-y-6">
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{contactEmail}</span>
                </a>
              )}
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
                    <PhoneIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{contactPhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Column 4: Newsletter/System Status (Bento Style) */}
          <div className="col-span-2 lg:col-span-1">
             <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Admissions Active</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Current response time for inquiries is under 24 hours.</p>
                <Link href={`/${slug}/courses/contact`} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: primaryColor }}>
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
            <div className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</span>
              <a 
                href="https://salesmanpro.site" 
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