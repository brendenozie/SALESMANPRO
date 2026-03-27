"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  MegaphoneIcon,
  PhoneIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    contactEmail,
    contactPhone,
    socialLinks,
    StoreCategory,
    themeSettings,
  } = storeFormData || {};

  // Use nonprofit’s primary color (or fallback green)
  const primary = themeSettings?.primaryColor || "#10B981";
  const secondary = themeSettings?.secondaryColor || "#047857";

  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* ── About & Logo ── */}
        <div className="space-y-4">
          <Link href={`/`} className="inline-flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">{name}</span>
          </Link>
          {description && (
            <p className="text-sm text-gray-300">{description}</p>
          )}
          <div className="flex space-x-4 mt-4">
            {socialLinks?.map((s:any) => (
              <a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                style={{ color: primary }}
                onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
              >
                {s.channel.charAt(0).toUpperCase() + s.channel.slice(1)}
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/nonprofit/programs`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Programs
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/nonprofit/donate`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Donate
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/nonprofit/contact`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Categories (Programs as “categories”) ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Programs</h3>
          <ul className="space-y-2 max-h-48 overflow-auto">
            {StoreCategory?.map((cat : any) => (
              <li key={cat.id}>
                <Link
                  href={`/${slug}/nonprofit/products?category=${cat.id}`}
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <ChevronRightIcon className="h-4 w-4 mr-2" />
                  {cat.displayName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Contact Info ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
          <ul className="space-y-4 text-gray-400">
            {contactEmail && (
              <li className="flex items-center">
                <MegaphoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-white transition-colors"
                >
                  {contactEmail}
                </a>
              </li>
            )}
            {contactPhone && (
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                <a
                  href={`tel:${contactPhone}`}
                  className="hover:text-white transition-colors"
                >
                  {contactPhone}
                </a>
              </li>
            )}
            <li>
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} {name}. All rights reserved.
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 mt-4 justify-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Powered by</span>
        <a 
          href="https://salesmanpro.site" 
          className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
        >
          SalesmanPro.site
        </a>
    </div>

    </footer>
  );
}
