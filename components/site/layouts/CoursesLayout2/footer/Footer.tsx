'use client';

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  EnvelopeIcon,
  PhoneIcon,
  ArrowUpRightIcon,
  GlobeAltIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function MoriahFooter() {
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
  } = storeFormData;

  return (
    <footer className="bg-slate-950 text-slate-400 pt-24 pb-12 border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* --- Brand Column: 4/12 --- */}
          <div className="lg:col-span-4">
            <Link href={`/${slug}`} className="group flex items-center gap-3 mb-8">
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
                    href={item === 'Home' ? `/${slug}` : `/${slug}/${item.toLowerCase()}`}
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
                  href={`/${slug}/category/${cat.id}`}
                  className="px-4 py-2 rounded-full border border-white/10 text-xs font-medium hover:bg-white/5 hover:border-white/30 transition-all"
                >
                  {cat.displayName}
                </Link>
              ))}
            </div>
          </div>

          {/* --- Contact & Reach: 3/12 --- */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-8">Support</h4>
            <div className="space-y-6">
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Us</p>
                  <p className="text-sm text-slate-200">{contactEmail}</p>
                </div>
              </a>

              <a href={`tel:${contactPhone}`} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                  <PhoneIcon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Call Directly</p>
                  <p className="text-sm text-slate-200">{contactPhone}</p>
                </div>
              </a>
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