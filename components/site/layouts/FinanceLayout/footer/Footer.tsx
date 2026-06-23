"use client";

import React from 'react';
import { motion } from 'framer-motion';

// --- STABLE MOCK HOOK FOR PRODUCTION AUTONOMY ---
const useStoreContext = () => {
  const storeFormData = {
    name: "CapitalEdge",
    description: "Your partner in navigating the complexities of modern business with unparalleled legal and financial expertise.",
    contactEmail: "info@capitaledge.com",
    contactPhone: "+254 (123) 456-7890",
    address: "123 Lumina Tower, Suite 500, Strategic Avenue, Nairobi, Kenya",
    socialLinks: [
      { channel: "Facebook", url: "https://www.facebook.com/capitaledge" },
      { channel: "Twitter", url: "https://www.twitter.com/capitaledge" },
      { channel: "LinkedIn", url: "https://www.linkedin.com/company/capitaledge" },
    ],
    themeSettings: {
      primaryColor: "#2563EB", // Production Deep Blue
      darkBackground: "#FFFFFF", // High-Contrast Light Mode Identity
    },
  };
  return { storeFormData };
};

// --- PREMIUM MINIMALIST MONOCHROME VECTOR ASSETS ---
const PhoneIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.557-5.145-3.877-6.702-6.7l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const EnvelopeIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const LocationIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
  </svg>
);

type SocialChannel = "Facebook" | "Twitter" | "LinkedIn";

const SocialIcons: Record<SocialChannel, ({ className }: { className: string }) => JSX.Element> = {
  Facebook: ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  ),
  Twitter: ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  LinkedIn: ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
};

export default function CorporateAppFooter() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    themeSettings,
  } = storeFormData;
  
  const currentYear = 2026;
  const primaryColor = themeSettings?.primaryColor || '#2563EB';

  return (
    <footer className="bg-white border-t border-slate-100 font-sans relative overflow-hidden pt-20 pb-12">
      {/* Light Abstract Grid Structure Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16">
          
          {/* Column 1: Brand & Charter Statement */}
          <div className="lg:col-span-4 space-y-5">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              {name}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm font-normal">
              {description}
            </p>
          </div>

          {/* Column 2: Structural Navigation Directory */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
              Enterprise
            </h4>
            <ul className="space-y-3.5 text-sm font-medium">
              {['About Us', 'Services', 'Testimonials', 'Contact'].map((item) => (
                <li key={item}>
                  <a 
                    href={`/finance/${item.toLowerCase().replace(' ', '')}`} 
                    className="text-slate-600 hover:text-slate-900 transition-colors duration-200 block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Communication & Touchpoints */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
              Touchpoints
            </h4>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              {contactPhone && (
                <li className="flex items-center gap-3 group">
                  <PhoneIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <a href={`tel:${contactPhone}`} className="hover:text-slate-900 transition-colors duration-200">
                    {contactPhone}
                  </a>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-center gap-3 group">
                  <EnvelopeIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-slate-900 transition-colors duration-200">
                    {contactEmail}
                  </a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <LocationIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-500 font-normal leading-relaxed">{address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Channels of Engagement */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">
              Channels
            </h4>
            <div className="flex gap-3">
              {socialLinks.map((s, idx) => {
                const Icon = SocialIcons[s.channel as SocialChannel];
                if (!Icon) return null;

                return (
                  <motion.a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.channel}
                    whileHover={{ y: -2 }}
                    className="w-9 h-9 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm bg-white transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

        </div>

        {/* --- SYSTEM CREDITS & ATTRIBUTION FLOOR --- */}
        <div className="pt-8 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono font-bold text-slate-400">
          <div>
            &copy; {currentYear} {name}. All Rights Reserved.
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl shadow-inner shadow-slate-100/50">
            <span className="uppercase text-[9px] tracking-widest text-slate-400 font-black">Powered by</span>
            <a 
              href="https://salesmanpro.site" 
              className="uppercase text-[9px] tracking-widest text-orange-600 hover:text-orange-700 transition-colors font-black"
            >
              SalesmanPro.site
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}