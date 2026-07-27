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
  PaperAirplaneIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";

export default function Footer() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) return null;

  const {
    name,
    description,
    contactEmail,
    contactPhone,
    socialLinks,
    StoreCategory,
    themeSettings,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            label: "Global Headquarters",
            address:
              legacyAddress ||
              "Lusingeti Road, Number 31, Industrial Area, Nairobi",
            contactPhone: contactPhone,
            contactEmail: contactEmail,
            isMain: true,
          },
        ];

  const primaryColor = themeSettings?.primaryColor || "#fd2121";

  return (
    <footer className="relative bg-gray-950 text-white overflow-hidden">
      {/* Decorative background glow */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
          {/* 1. Brand Identity (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <Link href="/" className="group flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter transition-colors group-hover:text-gray-300">
                {name}
                <span style={{ color: primaryColor }}>.</span>
              </span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {description ||
                "Transforming the future of education through innovative learning paths and community-driven excellence."}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {socialLinks?.map((s: any) => (
                <motion.a
                  key={s.channel}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, backgroundColor: primaryColor }}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-colors shadow-lg"
                >
                  <span className="text-[10px] font-black uppercase">
                    {s.channel.slice(0, 2)}
                  </span>
                </motion.a>
              ))}
            </div>
          </div>

          {/* 2. Quick Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">
              Links
            </h3>
            <ul className="space-y-3.5">
              {["Home", "Courses", "FAQs", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={
                      item === "Home"
                        ? `/`
                        : `/courses/${item.toLowerCase()}`
                    }
                    className="group flex items-center text-gray-300 hover:text-white transition-all text-sm font-medium"
                  >
                    <ChevronRightIcon
                      className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all"
                      style={{ color: primaryColor }}
                    />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Categories (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">
              Explore
            </h3>
            <ul className="space-y-3.5">
              {StoreCategory?.slice(0, 4).map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    href={`/courses/category/${cat.id}`}
                    className="group flex items-center text-gray-300 hover:text-white transition-all text-sm font-medium"
                  >
                    <ChevronRightIcon
                      className="h-3 w-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all"
                      style={{ color: primaryColor }}
                    />
                    {cat.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Newsletter Updates (2 cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">
              Updates
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Subscribe for the latest courses, webinars, and news.
            </p>
            <div className="p-1 rounded-xl bg-white/5 border border-white/10 flex items-center backdrop-blur-md">
              <input
                type="email"
                placeholder="Email address"
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs px-3 w-full text-white placeholder:text-gray-500"
              />
              <button
                aria-label="Subscribe"
                className="p-2.5 rounded-lg transition-transform hover:scale-105 active:scale-95 shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <PaperAirplaneIcon className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* 5. Regional Hubs & Contact (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-500">
              Locations & Contact
            </h3>
            <div className="space-y-3">
              {regionalAddresses.map((loc: any, idx: number) => {
                const label =
                  loc?.label || (idx === 0 ? "Global HQ" : `Location ${idx + 1}`);
                const fullAddress =
                  typeof loc === "string" ? loc : loc?.address;
                const phone = loc?.contactPhone || contactPhone;
                const emailAddr = loc?.contactEmail || contactEmail;
                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  fullAddress || ""
                )}`;

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                          {label}
                        </span>
                        {(loc?.isMain || idx === 0) && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest text-white uppercase"
                            style={{ backgroundColor: primaryColor }}
                          >
                            HQ
                          </span>
                        )}
                      </div>
                      {fullAddress && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                          title="View on Google Maps"
                        >
                          <span>Map</span>
                          <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {fullAddress && (
                      <div className="flex items-start gap-2 text-xs text-gray-400">
                        <MapPinIcon
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: primaryColor }}
                        />
                        <span className="line-clamp-2">{fullAddress}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1 pt-1.5 border-t border-white/5 text-[11px] text-gray-400">
                      {phone && (
                        <a
                          href={`tel:${phone}`}
                          className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                          <PhoneIcon
                            className="w-3 h-3 shrink-0"
                            style={{ color: primaryColor }}
                          />
                          <span>{phone}</span>
                        </a>
                      )}
                      {emailAddr && (
                        <a
                          href={`mailto:${emailAddr}`}
                          className="flex items-center gap-2 hover:text-white transition-colors truncate"
                        >
                          <EnvelopeIcon
                            className="w-3 h-3 shrink-0"
                            style={{ color: primaryColor }}
                          />
                          <span className="truncate">{emailAddr}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {name} <span className="mx-2">•</span> All Rights Reserved
          </p>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Powered by
            </span>
            <a
              href="https://salesmanpro.site"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
              style={{ color: "#ea580c" }} // SalesmanPro orange
            >
              SalesmanPro
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}