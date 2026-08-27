"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShareIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";
import { StoreForm } from "../../../../../types/typings";

interface FooterProps {
  storeFormData: StoreForm;
}

const Footer: React.FC<FooterProps> = ({ storeFormData }) => {
  const {
    contactEmail,
    contactPhone,
    address: legacyAddress,
    addresses = [],
    socialLinks = [],
  } = storeFormData || {};

  // Global default contact details
  const primaryPhone = contactPhone || storeFormData?.phone || "+254 700 000 000";
  const primaryEmail = contactEmail || storeFormData?.email || "info@commercialfleets.co.ke";

  // Extract up to 3 addresses or fallback to legacy/default headquarters
  const regionalAddresses =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: "Global Headquarters",
            address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
            contactPhone: primaryPhone,
            contactEmail: primaryEmail,
          },
        ];

  // Active branch location state
  const [activeBranchIdx, setActiveBranchIdx] = useState(0);
  const selectedBranch = regionalAddresses[activeBranchIdx] || regionalAddresses[0];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 border-b border-gray-800 pb-12">
        
        {/* Col 1: About Us & Branding */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white tracking-tight">
            {storeFormData?.name || "Commercial Fleets"}
          </h3>
          <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
            {storeFormData?.description ||
              "Discover everything you need from our trusted marketplace. Fast delivery, great deals, and top-notch service—trusted by thousands every day."}
          </p>

          {/* Quick Contact Links */}
          <div className="space-y-2 text-xs pt-2">
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors"
            >
              <PhoneIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{primaryPhone}</span>
            </a>
            <a
              href={`mailto:${primaryEmail}`}
              className="flex items-center gap-2 text-gray-300 hover:text-orange-500 transition-colors"
            >
              <EnvelopeIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span>{primaryEmail}</span>
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500 mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/automotive/about" className="hover:text-white transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/automotive/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/automotive/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/automotive/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Multi-Branch Addresses */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500 mb-4 flex items-center gap-1.5">
            <BuildingOffice2Icon className="w-4 h-4" />
            <span>Locations</span>
          </h3>

          {/* Interactive Location Switcher */}
          {regionalAddresses.length > 1 && (
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
              {regionalAddresses.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBranchIdx(idx)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                    activeBranchIdx === idx
                      ? "bg-orange-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {loc.label || `Branch ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Location Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBranchIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="p-3.5 bg-gray-800/80 border border-gray-700/60 rounded-xl space-y-2 text-xs"
            >
              <div className="flex items-start gap-2 text-gray-200">
                <MapPinIcon className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {selectedBranch?.address || selectedBranch?.location || legacyAddress}
                </span>
              </div>

              {(selectedBranch?.contactPhone || primaryPhone) && (
                <a
                  href={`tel:${selectedBranch?.contactPhone || primaryPhone}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[11px]"
                >
                  <PhoneIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span>{selectedBranch?.contactPhone || primaryPhone}</span>
                </a>
              )}

              {(selectedBranch?.contactEmail || primaryEmail) && (
                <a
                  href={`mailto:${selectedBranch?.contactEmail || primaryEmail}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[11px]"
                >
                  <EnvelopeIcon className="w-3.5 h-3.5 text-gray-500" />
                  <span className="truncate">
                    {selectedBranch?.contactEmail || primaryEmail}
                  </span>
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Col 4: Follow Us / Socials */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-500 mb-4">
            Connect With Us
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Follow our official social platforms for latest inventory updates and service announcements.
          </p>

          <div className="flex flex-wrap gap-2">
            {socialLinks?.length > 0 ? (
              socialLinks.map((s: any, idx: number) => (
                <motion.a
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={s?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white bg-gray-800 border border-gray-700 p-2.5 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ShareIcon className="h-4 w-4" />
                </motion.a>
              ))
            ) : (
              <div className="flex gap-2">
                {["Facebook", "Twitter", "Instagram", "LinkedIn"].map((platform, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 bg-gray-800 text-gray-400 rounded-md border border-gray-700"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Legal & Attribution */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 gap-4">
        <p className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-gray-300">{storeFormData?.name || "Commercial Fleets"}</span>. All rights reserved.
        </p>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Powered by
          </span>
          <a
            href="https://salesmanpro.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-500 transition-colors"
          >
            SalesmanPro.site
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;