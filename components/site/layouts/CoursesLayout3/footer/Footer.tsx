"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChevronRightIcon,
  MapPinIcon,
  PaperAirplaneIcon
} from "@heroicons/react/24/solid"; // Using Solid Hero Icons

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

  const primaryColor = themeSettings?.primaryColor || '#fd2121';

  return (
    <footer className="relative bg-gray-950 text-white overflow-hidden">
      {/* Decorative background glow */}
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* 1. Brand Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href={``} className="group flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter transition-colors group-hover:text-gray-300">
                {name}<span style={{ color: primaryColor }}>.</span>
              </span>
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {description || "Transforming the future of education through innovative learning paths and community-driven excellence."}
            </p>

            <div className="flex gap-3">
              {socialLinks?.map((s: any) => (
                <motion.a
                  key={s.channel}
                  href={s.url}
                  whileHover={{ y: -3, backgroundColor: primaryColor }}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors shadow-lg"
                >
                  <span className="text-[10px] font-black uppercase">{s.channel.slice(0, 2)}</span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* 2. Quick Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Links</h3>
            <ul className="space-y-4">
              {['Home', 'Courses', 'FAQs', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={item === 'Home' ? `/` : `/courses/${item.toLowerCase()}`}
                    className="group flex items-center text-gray-300 hover:text-white transition-all text-sm font-medium"
                  >
                    <ChevronRightIcon className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" style={{ color: primaryColor }} />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Categories (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Explore</h3>
            <ul className="space-y-4">
              {StoreCategory?.slice(0, 4).map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    href={`/courses/category/${cat.id}`}
                    className="group flex items-center text-gray-300 hover:text-white transition-all text-sm font-medium"
                  >
                    <ChevronRightIcon className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" style={{ color: primaryColor }} />
                    {cat.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Newsletter/Contact (4 cols) */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-gray-500">Updates</h3>
            <div className="p-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center backdrop-blur-md mb-8">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent border-none focus:ring-0 text-sm px-4 flex-grow text-white placeholder:text-gray-600"
              />
              <button 
                className="p-3 rounded-xl transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <PaperAirplaneIcon className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              {contactEmail && (
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                    <EnvelopeIcon className="h-4 w-4" style={{ color: primaryColor }} />
                  </div>
                  <a href={`mailto:${contactEmail}`} className="text-sm text-gray-400 group-hover:text-white transition-colors">{contactEmail}</a>
                </div>
              )}
              {contactPhone && (
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                    <PhoneIcon className="h-4 w-4" style={{ color: primaryColor }} />
                  </div>
                  <a href={`tel:${contactPhone}`} className="text-sm text-gray-400 group-hover:text-white transition-colors">{contactPhone}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {name} <span className="mx-2">•</span> All Rights Reserved
          </p>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Powered by</span>
            <a 
              href="https://salesmanpro.site" 
              className="text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
              style={{ color: '#ea580c' }} // SalesmanPro orange
            >
              SalesmanPro
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}