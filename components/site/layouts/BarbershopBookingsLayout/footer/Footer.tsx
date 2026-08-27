"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  ArrowUpRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    description,
    socialLinks = [],
    themeSettings,
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Primary fallbacks
  const globalPhone = contactPhone || storeFormData?.phone || "+1 (555) 000-0000";
  const globalEmail = contactEmail || storeFormData?.email || "hello@thecraft.com";
  const defaultLegacyAddress = legacyAddress || "123 Master Way, Luxury District, NY";

  // Extract up to 3 addresses or fallback to legacy/default data
  const regionalAddresses =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: "Global Headquarters",
            address: defaultLegacyAddress,
            contactPhone: globalPhone,
            contactEmail: globalEmail,
          },
        ];

  // Active location selection state for interactive branch switcher
  const [activeBranchIdx, setActiveBranchIdx] = useState(0);
  const selectedBranch = regionalAddresses[activeBranchIdx] || regionalAddresses[0];

  const primaryColor = themeSettings?.primaryColor || "#D4AF37";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const iconMapper: Record<string, React.ReactNode> = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54v-2.89h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.5A4.25 4.25 0 003.5 7.75v8.5A4.25 4.25 0 007.75 20.5h8.5a4.25 4.25 0 004.25-4.25v-8.5A4.25 4.25 0 0016.25 3.5h-8.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 1.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm4.75-.88a1.12 1.12 0 11-2.24 0 1.12 1.12 0 012.24 0z" />
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.142 0 14.307-7.721 13.995-14.646a9.936 9.936 0 002.411-2.659z" />
      </svg>
    ),
  };

  return (
    <footer className="relative bg-white dark:bg-[#050505] text-zinc-900 dark:text-white pt-32 pb-12 overflow-hidden transition-colors duration-500">
      {/* 1. MASSIVE BACKGROUND MARQUEE */}
      <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.05] dark:opacity-[0.03] select-none pointer-events-none">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="text-[20vw] font-black uppercase whitespace-nowrap leading-none text-zinc-200 dark:text-white"
        >
          {name || "THE CRAFT"} • THE ELITE STANDARD • {name || "THE CRAFT"} • THE ELITE STANDARD •
        </motion.div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 relative z-10">
        {/* 2. TOP CTA SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32 border-b border-zinc-200 dark:border-white/10 pb-20">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase leading-[0.9] mb-8">
              Ready for the <br />
              <span className="italic font-serif font-light" style={{ color: primaryColor }}>
                Next Level?
              </span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-light max-w-md">
              {description ||
                "Join the ranks of the well-groomed. Experience architectural precision and timeless style."}
            </p>
          </div>
          <Link
            href="/booking"
            className="group flex items-center gap-4 bg-zinc-950 dark:bg-white px-10 py-6 rounded-full text-white dark:text-black font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: scrolled ? undefined : "var(--cta-bg)" } as any}
          >
            <style jsx>{`
              :global(.dark) {
                --cta-bg: white;
                --cta-text: black;
              }
              :global(:not(.dark)) {
                --cta-bg: #18181b;
                --cta-text: white;
              }
            `}</style>
            Book the Chair
            <ArrowUpRightIcon className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>

        {/* 3. MAIN LINKS & LOCATIONS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Info & Interactive Locations Showcase */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-4">{name || "THE CRAFT"}</h3>
              <div className="flex items-center gap-2 mb-6">
                <span className="h-[1px] w-8" style={{ backgroundColor: primaryColor }} />
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: primaryColor }}>
                  Bespoke Grooming
                </span>
              </div>
            </div>

            {/* Interactive Location Showcase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-white/40 flex items-center gap-1.5">
                  <BuildingOffice2Icon className="w-4 h-4" style={{ color: primaryColor }} />
                  Our Locations
                </span>

                {/* Branch Switcher Pills */}
                {regionalAddresses.length > 1 && (
                  <div className="flex gap-1.5">
                    {regionalAddresses.map((loc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBranchIdx(idx)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                          activeBranchIdx === idx
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                            : "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                      >
                        {loc.label || `Branch ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Location Display Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeBranchIdx}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 space-y-3.5"
                >
                  <div className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                    <MapPinIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                    <span className="text-sm font-medium leading-snug">
                      {selectedBranch?.address || selectedBranch?.location || defaultLegacyAddress}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-zinc-200/60 dark:border-white/5 text-xs">
                    {(selectedBranch?.contactPhone || globalPhone) && (
                      <a
                        href={`tel:${selectedBranch?.contactPhone || globalPhone}`}
                        className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <PhoneIcon className="h-4 w-4" style={{ color: primaryColor }} />
                        <span className="font-medium">{selectedBranch?.contactPhone || globalPhone}</span>
                      </a>
                    )}

                    {(selectedBranch?.contactEmail || globalEmail) && (
                      <a
                        href={`mailto:${selectedBranch?.contactEmail || globalEmail}`}
                        className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        <EnvelopeIcon className="h-4 w-4" style={{ color: primaryColor }} />
                        <span className="font-medium truncate">{selectedBranch?.contactEmail || globalEmail}</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Social Icons */}
            {socialLinks?.length > 0 && (
              <div className="flex space-x-6 pt-2">
                {socialLinks.map((s, idx) => (
                  <motion.a
                    key={idx}
                    whileHover={{ y: -4, color: primaryColor }}
                    href={s?.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 dark:text-white/40 transition-colors"
                  >
                    {iconMapper[String(s?.channel).toLowerCase()] || <span className="text-xs">{s?.channel}</span>}
                  </motion.a>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
                Experience
              </h4>
              <ul className="space-y-5 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                <li>
                  <Link href="/services" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    The Barbers
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/academy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Academy
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
                Shop
              </h4>
              <ul className="space-y-5 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40">
                <li>
                  <Link href="/ecommerce/products" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Pomades
                  </Link>
                </li>
                <li>
                  <Link href="/ecommerce/products" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Beard Care
                  </Link>
                </li>
                <li>
                  <Link href="/ecommerce/products" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Apparel
                  </Link>
                </li>
                <li>
                  <Link href="/gift-cards" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Gift Cards
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-8 col-span-2 md:col-span-1">
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>
                Hours
              </h4>
              <div className="space-y-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-white/40">
                <div className="flex justify-between border-b border-zinc-200 dark:border-white/5 pb-2">
                  <span>Mon - Fri</span>
                  <span className="text-zinc-900 dark:text-white">9am - 8pm</span>
                </div>
                <div className="flex justify-between border-b border-zinc-200 dark:border-white/5 pb-2">
                  <span>Saturday</span>
                  <span className="text-zinc-900 dark:text-white">10am - 6pm</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-zinc-900 dark:text-white">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FOOTER BOTTOM */}
        <div className="pt-12 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-wrap justify-center md:justify-start gap-10 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-white/20">
            <span>&copy; {new Date().getFullYear()} {name || "THE CRAFT"}</span>
            <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>

          <motion.a
            href="https://salesmanpro.site"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-zinc-100 dark:bg-white/[0.03] px-6 py-3 rounded-full border border-zinc-200 dark:border-white/10"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-white/30">
              Crafted by
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: primaryColor }}>
              SalesmanPro
            </span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}