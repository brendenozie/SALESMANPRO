"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  TicketIcon,
  UserGroupIcon,
  MapPinIcon,
  TagIcon,
  BuildingOffice2Icon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

interface AddressItem {
  label?: string;
  address?: string;
  city?: string;
  country?: string;
  contactPhone?: string;
  contactEmail?: string;
  isPrimary?: boolean;
}

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name = "EventHub",
    slug,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
    address: legacyAddress,
    addresses = [],
  } = storeFormData || {};

  // Extract up to 3 addresses for the regional showcase.
  // Fallback to legacy data if the addresses array is empty.
  const regionalAddresses: AddressItem[] =
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
            isPrimary: true,
          },
        ];

  const primary = themeSettings?.primaryColor || "#4F46E5"; // indigo-600
  const secondary = themeSettings?.secondaryColor || "#6366F1"; // indigo-500

  return (
    <footer className="bg-gray-900 text-gray-200 border-t border-gray-800">
      {/* Main Navigation & Info Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About & Logo */}
        <div className="space-y-4">
          <Link href={`/`} className="inline-flex items-center space-x-2">
            <span
              className="text-2xl font-extrabold text-white tracking-tight"
              style={{ textShadow: "1px 1px rgba(0,0,0,0.2)" }}
            >
              {name}
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Bringing you the hottest events—music, art, tech, and more.
            Discover, book, and enjoy seamless experiences.
          </p>

          {/* Social Links */}
          {socialLinks?.length > 0 && (
            <div className="flex flex-wrap gap-4 pt-2">
              {socialLinks.map((s, idx) => (
                <a
                  key={s.channel || idx}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                  style={{ color: primary }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = secondary)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = primary)
                  }
                >
                  {s?.channel?.toString().charAt(0).toUpperCase() +
                    s.channel.toString().slice(1)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Quick Links
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href={`/`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <HomeIcon className="h-4 w-4 mr-2.5 shrink-0" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/events/products`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <TicketIcon className="h-4 w-4 mr-2.5 shrink-0" />
                Events
              </Link>
            </li>
            <li>
              <Link
                href={`/events/about`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <InformationCircleIcon className="h-4 w-4 mr-2.5 shrink-0" />
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/events/contact`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <MapPinIcon className="h-4 w-4 mr-2.5 shrink-0" />
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Organizer Resources */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Organizer
          </h3>
          <ul className="space-y-3">
            <li>
              <Link
                href={`/events/host`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <UserGroupIcon className="h-4 w-4 mr-2.5 shrink-0" />
                Host Event
              </Link>
            </li>
            <li>
              <Link
                href={`/events/pricing`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <TagIcon className="h-4 w-4 mr-2.5 shrink-0" />
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href={`/events/privacy`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2.5 shrink-0" />
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href={`/events/terms`}
                className="flex items-center text-gray-400 hover:text-white transition-colors text-sm"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2.5 shrink-0" />
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* General Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">
            Get in Touch
          </h3>
          <ul className="space-y-4 text-gray-400 text-sm">
            {contactEmail && (
              <li className="flex items-center">
                <EnvelopeIcon
                  className="h-4 w-4 mr-2.5 shrink-0"
                  style={{ color: primary }}
                />
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
                <PhoneIcon
                  className="h-4 w-4 mr-2.5 shrink-0"
                  style={{ color: primary }}
                />
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
      </div>

      {/* Regional Venues & Hubs Showcase */}
      <div className="border-t border-gray-800 bg-gray-950/40 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 mb-6">
            <BuildingOffice2Icon
              className="h-5 w-5"
              style={{ color: primary }}
            />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Regional Hubs & Outlets ({regionalAddresses.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {regionalAddresses.map((loc, idx) => {
              const locationQuery = [loc.address, loc.city, loc.country]
                .filter(Boolean)
                .join(", ");
              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                locationQuery
              )}`;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-lg bg-gray-800/40 border border-gray-800 flex flex-col justify-between hover:border-gray-700 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-900 border border-gray-700"
                        style={{ color: primary }}
                      >
                        {loc.label || `Location 0${idx + 1}`}
                      </span>
                      {loc.isPrimary && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                          Main HQ
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 pt-1 leading-snug">
                      {loc.address || "Address available upon request."}
                    </p>

                    {(loc.city || loc.country) && (
                      <p className="text-xs text-gray-400">
                        {[loc.city, loc.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-800/60 space-y-1.5 text-xs">
                    {loc.contactPhone && (
                      <a
                        href={`tel:${loc.contactPhone}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <PhoneIcon className="h-3.5 w-3.5 shrink-0" />
                        <span>{loc.contactPhone}</span>
                      </a>
                    )}
                    {loc.contactEmail && (
                      <a
                        href={`mailto:${loc.contactEmail}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors truncate"
                      >
                        <EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{loc.contactEmail}</span>
                      </a>
                    )}

                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 pt-2 text-xs font-semibold hover:underline transition-all"
                      style={{ color: primary }}
                    >
                      <MapPinIcon className="h-3.5 w-3.5" />
                      <span>Get Directions</span>
                      <ArrowUpRightIcon className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href={`/events/privacy`}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href={`/events/terms`}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center gap-1.5 px-4 py-3 justify-center bg-gray-950 border-t border-gray-900">
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
    </footer>
  );
}