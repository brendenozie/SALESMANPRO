"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { StoreForm } from "../../../../../types/typings";

/* -------------------------------------------------------------------------- */
/* Props Interface */
/* -------------------------------------------------------------------------- */
interface FooterProps {
  storeFormData: StoreForm;
}

/* -------------------------------------------------------------------------- */
/* Background Technical Grid Overlay */
/* -------------------------------------------------------------------------- */
const GridPattern = () => (
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-slate-900 dark:text-amber-400">
    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="footer-grid" width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M0 32L32 0H16L0 16M32 32V16L16 32" stroke="currentColor" strokeWidth="1" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#footer-grid)" />
    </svg>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main Footer Component */
/* -------------------------------------------------------------------------- */
const Footer: React.FC<FooterProps> = ({ storeFormData }) => {
  const currentYear = new Date().getFullYear();

  // Primary fallbacks
  const globalPhone = storeFormData?.contactPhone || storeFormData?.phone || "+254 700 000 000";
  const globalEmail = storeFormData?.contactEmail || storeFormData?.email || "info@commercialfleets.co.ke";
  const legacyAddress = storeFormData?.address || storeFormData?.location || "Lusingeti Road, Number 31, Industrial Area, Nairobi";

  // Destructure array of multi-addresses from store data
  const { addresses = [] } = storeFormData || {};

  // Extract regional addresses or construct fallback
  const regionalAddresses = addresses.length > 0
    ? addresses.slice(0, 3)
    : [
        {
          label: "Global Headquarters",
          address: legacyAddress,
          contactPhone: globalPhone,
          contactEmail: globalEmail,
        },
      ];

  // Active location selection state for interactive tab toggle
  const [activeLocation, setActiveLocation] = useState(0);

  // Newsletter state
  const [emailInput, setEmailInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmailInput("");
    }, 1000);
  };

  const selectedBranch = regionalAddresses[activeLocation] || regionalAddresses[0];

  return (
    <footer className="relative bg-slate-100 dark:bg-[#080B10] text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300 overflow-hidden pt-16 pb-8">
      <GridPattern />

      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 dark:bg-amber-600/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Value Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 shadow-sm dark:shadow-none backdrop-blur-sm transition-colors">
            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <TruckIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Fleet Transit</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Nationwide Yard Delivery & Transfer</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 shadow-sm dark:shadow-none backdrop-blur-sm transition-colors">
            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Verified Inventory</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Inspected Commercial Assets</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/50 shadow-sm dark:shadow-none backdrop-blur-sm transition-colors">
            <div className="p-3 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <BuildingStorefrontIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Direct Dealership</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Transparent Financing & Leasing</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-slate-200 dark:border-slate-800 pb-12">

          {/* Col 1: Store Branding & Description */}
          <div className="space-y-4">
            <Link href="/automotive" className="inline-flex items-center gap-2">
              {storeFormData?.logo ? (
                <Image
                  src={storeFormData.logo}
                  alt={storeFormData?.name || "Logo"}
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {storeFormData?.name || "Commercial Fleets"}
                </span>
              )}
            </Link>

            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {storeFormData?.description ||
                "Your trusted hub for heavy commercial vehicles, buses, trucks, and utility equipment. Quality fleets, flexible lease terms, and reliable financing solutions."}
            </p>

            {/* Quick Primary Contact */}
            <div className="space-y-2 text-xs pt-2">
              <a 
                href={`tel:${globalPhone}`} 
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <PhoneIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{globalPhone}</span>
              </a>
              <a 
                href={`mailto:${globalEmail}`} 
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                <EnvelopeIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{globalEmail}</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Navigation */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4">
              Navigation & Support
            </h3>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <li>
                <Link href="/automotive/about" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/automotive/listings" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Vehicle Inventory
                </Link>
              </li>
              <li>
                <Link href="/automotive/financing" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Asset Financing & Leasing
                </Link>
              </li>
              <li>
                <Link href="/automotive/contact" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Contact Showroom
                </Link>
              </li>
              <li>
                <Link href="/automotive/privacy" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Interactive Regional Locations Showcase */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4">
              Our Locations
            </h3>

            {/* Multi-address Switcher Tabs */}
            {regionalAddresses.length > 1 && (
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-none">
                {regionalAddresses.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveLocation(idx)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                      activeLocation === idx
                        ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {item.label || `Branch ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Active Address Details Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLocation}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 rounded-xl bg-white/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-2.5 text-xs"
              >
                <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <MapPinIcon className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    {selectedBranch?.address || selectedBranch?.location || legacyAddress}
                  </span>
                </div>

                {(selectedBranch?.contactPhone || globalPhone) && (
                  <a
                    href={`tel:${selectedBranch?.contactPhone || globalPhone}`}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-[11px]"
                  >
                    <PhoneIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span>{selectedBranch?.contactPhone || globalPhone}</span>
                  </a>
                )}

                {(selectedBranch?.contactEmail || globalEmail) && (
                  <a
                    href={`mailto:${selectedBranch?.contactEmail || globalEmail}`}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-[11px]"
                  >
                    <EnvelopeIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{selectedBranch?.contactEmail || globalEmail}</span>
                  </a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Col 4: Newsletter Inquiry */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-4">
              Fleet Arrivals
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3 leading-normal">
              Subscribe to get instant alerts on newly listed commercial stock and clearance deals.
            </p>

            {isSubscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
              >
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                <span>You are subscribed to stock alerts!</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>{isSubmitting ? "Submitting..." : "Subscribe"}</span>
                  {!isSubmitting && <ArrowRightIcon className="w-3.5 h-3.5" />}
                </motion.button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Branding */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p className="text-center sm:text-left">
            &copy; {currentYear} <span className="font-bold text-slate-800 dark:text-slate-200">{storeFormData?.name || "Commercial Fleets"}</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Powered by
            </span>
            <a
              href="https://salesmanpro.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-500 hover:text-amber-500 transition-colors"
            >
              SalesmanPro.site
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;