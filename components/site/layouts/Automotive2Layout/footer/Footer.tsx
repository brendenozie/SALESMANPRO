"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
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
  <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
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
  const phone = storeFormData?.contactPhone || storeFormData?.phone || "+254 700 000 000";
  const email = storeFormData?.contactEmail || storeFormData?.email || "info@commercialfleets.co.ke";
  const address = storeFormData?.address || "Nairobi Showroom Yard, Kenya";

  return (
    <footer className="relative bg-slate-900 dark:bg-[#080B10] text-slate-300 border-t border-slate-800 overflow-hidden pt-16 pb-8">
      <GridPattern />

      {/* Ambient Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/5 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Value Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <TruckIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Fleet Transit</h4>
              <p className="text-[11px] text-slate-400">Nationwide Yard Delivery & Transfer</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldCheckIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Verified Inventory</h4>
              <p className="text-[11px] text-slate-400">Inspected Commercial Assets</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <BuildingStorefrontIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Direct Dealership</h4>
              <p className="text-[11px] text-slate-400">Transparent Financing & Leasing</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-slate-800 pb-12">

          {/* Col 1: Store Branding & Description */}
          <div className="lg:col-span-2">
            <Link href="/automotive" className="inline-flex items-center gap-2 mb-4">
              {storeFormData?.logo ? (
                <Image
                  src={storeFormData.logo}
                  alt={storeFormData?.name || "Logo"}
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-black uppercase tracking-tight text-white">
                  {storeFormData?.name || "Commercial Fleets"}
                </span>
              )}
            </Link>

            <p className="text-xs leading-relaxed text-slate-400 mb-6 max-w-sm">
              {storeFormData?.description ||
                "Your trusted hub for heavy commercial vehicles, buses, trucks, and utility equipment. Quality fleets, flexible lease terms, and reliable financing solutions."}
            </p>

            {/* Direct Contact Details */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPinIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <EnvelopeIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>{email}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/automotive/about" className="hover:text-amber-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/automotive/listings" className="hover:text-amber-400 transition-colors">
                  Vehicle Inventory
                </Link>
              </li>
              <li>
                <Link href="/automotive/contact" className="hover:text-amber-400 transition-colors">
                  Contact Showroom
                </Link>
              </li>
              <li>
                <Link href="/automotive/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/automotive/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/automotive/help" className="hover:text-amber-400 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/automotive/financing" className="hover:text-amber-400 transition-colors">
                  Asset Financing
                </Link>
              </li>
              <li>
                <Link href="/automotive/inspections" className="hover:text-amber-400 transition-colors">
                  Yard Inspections
                </Link>
              </li>
              <li>
                <Link href="/automotive/trade-in" className="hover:text-amber-400 transition-colors">
                  Vehicle Trade-In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter Inquiry */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 mb-4">
              Fleet Arrivals
            </h3>
            <p className="text-[11px] text-slate-400 mb-3 leading-normal">
              Subscribe to get instant alerts on newly listed commercial stock.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Subscribe</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </motion.button>
            </form>
          </div>

        </div>

        {/* Bottom Copyright & Branding */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            &copy; {currentYear} <span className="font-bold text-slate-300">{storeFormData?.name || "Commercial Fleets"}</span>. All rights reserved.
          </p>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Powered by
            </span>
            <a
              href="https://salesmanpro.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
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