"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

interface StoreAddress {
  id?: string | number;
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

interface SocialLink {
  channel: string;
  url: string;
}

export default function Footer() {
  const { storeFormData } = useStoreContext() || {};
  const {
    name = "Your Business Name",
    slug,
    contactEmail,
    contactPhone,
    socialLinks = [] as SocialLink[],
    themeSettings,
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase. 
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: StoreAddress[] =
    addresses?.length > 0
      ? addresses.slice(0, 3)
      : [
          {
            id: "primary-fallback",
            label: "Global Headquarters",
            address: legacyAddress || "Lusingeti Road, Number 31, Industrial Area, Nairobi",
            contactPhone: contactPhone,
            contactEmail: contactEmail,
          },
        ];

  const primary = themeSettings?.primaryColor || "#10B981"; // emerald-500
  const secondary = themeSettings?.secondaryColor || "#F59E0B"; // amber-500
  const baseSlug = slug || "realestate";

  return (
    <footer className="bg-gray-900 text-gray-200 border-t border-gray-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ── About & Logo ── */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span
                className="text-2xl font-extrabold text-white uppercase tracking-tight"
                style={{ textShadow: "1px 1px rgba(0,0,0,0.2)" }}
              >
                {name}
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Delivering exceptional properties and personalized service to help you find your dream home.
            </p>
            
            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {socialLinks.map((s: SocialLink) => (
                  <a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold uppercase tracking-wider transition-colors"
                    style={{ color: primary }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
                  >
                    {s.channel}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <HomeIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={`/${baseSlug}/listings`}
                  className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Listings
                </Link>
              </li>
              <li>
                <Link
                  href={`/${baseSlug}/about`}
                  className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <InformationCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                  About
                </Link>
              </li>
              <li>
                <Link
                  href={`/${baseSlug}/contact`}
                  className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Direct Contact Info ── */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              {contactEmail && (
                <li className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500 shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-white transition-colors truncate"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2 text-gray-500 shrink-0" />
                  <a
                    href={`tel:${contactPhone}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* ── Newsletter ── */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Sign up to receive updates on new listings and market insights.
            </p>
            <form className="flex flex-col space-y-3" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm border border-gray-700"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-4 py-2 text-gray-900 font-semibold rounded-md hover:opacity-90 transition-opacity text-sm"
                style={{ backgroundColor: secondary }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* ── Dynamic Multi-Office Regional Locations ── */}
        {regionalAddresses.length > 0 && (
          <div className="pt-8 border-t border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
              Our Regional Offices
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regionalAddresses.map((office, idx) => (
                <div
                  key={office.id || idx}
                  className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl space-y-3 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider">
                    <BuildingOfficeIcon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{office.label || `Office Hub ${idx + 1}`}</span>
                  </div>

                  {office.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(office.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-2.5 text-xs text-gray-400 hover:text-white transition-colors group"
                    >
                      <MapPinIcon className="w-4 h-4 text-gray-500 shrink-0 mt-0.5 group-hover:text-amber-500 transition-colors" />
                      <span className="leading-relaxed">{office.address}</span>
                    </a>
                  )}

                  {office.contactPhone && (
                    <a
                      href={`tel:${office.contactPhone}`}
                      className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white transition-colors group"
                    >
                      <PhoneIcon className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-amber-500 transition-colors" />
                      <span>{office.contactPhone}</span>
                    </a>
                  )}

                  {office.contactEmail && (
                    <a
                      href={`mailto:${office.contactEmail}`}
                      className="flex items-center space-x-2.5 text-xs text-gray-400 hover:text-white transition-colors group"
                    >
                      <EnvelopeIcon className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-amber-500 transition-colors" />
                      <span className="truncate">{office.contactEmail}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link
              href={`/${baseSlug}/privacy`}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href={`/${baseSlug}/terms`}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Powered By Badge */}
        <div className="flex items-center gap-1.5 pt-4 justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
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
    </footer>
  );
}