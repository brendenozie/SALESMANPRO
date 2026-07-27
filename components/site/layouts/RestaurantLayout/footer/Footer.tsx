"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface StoreAddress {
  id?: string | number;
  label?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

interface SocialLink {
  channel: string;
  url: string;
}

export default function Footer() {
  const { storeFormData } = useStoreContext() || {};
  const {
    name,
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

  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5"; // Indigo
  const baseSlug = slug || "restaurant";

  // Dynamic navigation links based on current tenant slug
  const navLinks = [
    { label: "Home", href: `/${baseSlug}` },
    { label: "Menu", href: `/${baseSlug}/products` },
    { label: "Reserve", href: `/${baseSlug}/reserve` },
    { label: "About Us", href: `/${baseSlug}/about` },
    { label: "Contact", href: `/${baseSlug}#contact` },
    { label: "Gallery", href: `/${baseSlug}/gallery` },
  ];

  // Dynamic menu categories
  const menuCategories = [
    { label: "Appetizers", href: `/${baseSlug}/products?category=appetizers` },
    { label: "Main Courses", href: `/${baseSlug}/products?category=main-courses` },
    { label: "Desserts", href: `/${baseSlug}/products?category=desserts` },
    { label: "Drinks", href: `/${baseSlug}/products?category=drinks` },
  ];

  return (
    <footer className="bg-gray-950 text-gray-300 py-16 relative overflow-hidden font-sans">
      {/* Subtle background texture overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'url("/images/footer-texture.png")', backgroundSize: "cover" }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* ── Column 1: About & Logo ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Link href={`/${baseSlug}`} className="inline-flex items-center space-x-2">
              <span
                className="text-3xl font-extrabold text-white tracking-wide"
                style={{ textShadow: "2px 2px rgba(0,0,0,0.3)" }}
              >
                {name || "Unbite"}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Serving gourmet dishes with passion. Experience our signature flavors, warm hospitality, and a culinary journey you won't forget.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              {socialLinks &&
                socialLinks.map((s) => (
                  <motion.a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-semibold capitalize"
                    style={{ color: primaryColor }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) =>
                      (e.currentTarget.style.color = secondaryColor)
                    }
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) =>
                      (e.currentTarget.style.color = primaryColor)
                    }
                    whileHover={{ scale: 1.1 }}
                  >
                    {s.channel}
                  </motion.a>
                ))}
            </div>
          </motion.div>

          {/* ── Column 2: Quick Links ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white border-b-2 border-orange-500 pb-2 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-400 hover:text-white transition-colors group text-sm"
                  >
                    <ChevronRightIcon className="h-4 w-4 mr-2 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Column 3: Main Contact Info ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white border-b-2 border-orange-500 pb-2 inline-block">
              Get In Touch
            </h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              {legacyAddress && (
                <li className="flex items-start">
                  <MapPinIcon className="h-5 w-5 mr-3 mt-0.5 text-orange-400 flex-shrink-0" />
                  <span>{legacyAddress}</span>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
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
                  <PhoneIcon className="h-5 w-5 mr-3 text-orange-400 flex-shrink-0" />
                  <a
                    href={`tel:${contactPhone}`}
                    className="hover:text-white transition-colors"
                  >
                    {contactPhone}
                  </a>
                </li>
              )}
            </ul>
          </motion.div>

          {/* ── Column 4: Newsletter & Highlights ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-6 text-white border-b-2 border-orange-500 pb-2 inline-block">
              Stay Updated
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Sign up for exclusive offers, new menu alerts, and event invitations directly to your inbox.
            </p>
            <form className="flex flex-col space-y-3 mb-8" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2.5 rounded-md bg-gray-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-700 text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors shadow-lg text-sm"
              >
                Subscribe Now
              </button>
            </form>

            <h3 className="text-xl font-bold mb-4 text-white border-b-2 border-orange-500 pb-2 inline-block">
              Menu Highlights
            </h3>
            <ul className="space-y-2">
              {menuCategories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="flex items-center text-gray-400 hover:text-white transition-colors group text-sm"
                  >
                    <ChevronRightIcon className="h-4 w-4 mr-2 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Multi-Location Showcase ── */}
        {regionalAddresses.length > 0 && (
          <div className="pt-10 border-t border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
              Our Locations & Branches
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regionalAddresses.map((office, idx) => (
                <div
                  key={office.id || idx}
                  className="bg-gray-900/60 border border-gray-800 p-5 rounded-xl space-y-3 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider">
                    <BuildingOfficeIcon className="w-4 h-4 text-orange-500 shrink-0" />
                    <span>{office.label || `Branch ${idx + 1}`}</span>
                  </div>

                  {office.address && (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(office.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start space-x-2 text-xs text-gray-400 hover:text-white transition-colors group"
                    >
                      <MapPinIcon className="w-4 h-4 text-gray-500 shrink-0 mt-0.5 group-hover:text-orange-400 transition-colors" />
                      <span className="leading-relaxed">{office.address}</span>
                    </a>
                  )}

                  {office.contactPhone && (
                    <a
                      href={`tel:${office.contactPhone}`}
                      className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors group"
                    >
                      <PhoneIcon className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-orange-400 transition-colors" />
                      <span>{office.contactPhone}</span>
                    </a>
                  )}

                  {office.contactEmail && (
                    <a
                      href={`mailto:${office.contactEmail}`}
                      className="flex items-center space-x-2 text-xs text-gray-400 hover:text-white transition-colors group"
                    >
                      <EnvelopeIcon className="w-4 h-4 text-gray-500 shrink-0 group-hover:text-orange-400 transition-colors" />
                      <span className="truncate">{office.contactEmail}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Bar (Copyright & Policies) ── */}
      <div className="border-t border-gray-800 mt-16 pt-8 pb-4 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm gap-4">
          <p>© {new Date().getFullYear()} {name || "Unbite"}. All rights reserved.</p>
          <div className="flex flex-wrap justify-center space-x-6">
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
            <Link
              href={`/${baseSlug}/sitemap`}
              className="hover:text-white transition-colors"
            >
              Sitemap
            </Link>
          </div>
        </div>

        {/* Powered By Badge */}
        <div className="flex items-center gap-1.5 pt-6 justify-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Powered by
          </span>
          <a
            href="https://salesmanpro.site"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors"
          >
            SalesmanPro.site
          </a>
        </div>
      </div>
    </footer>
  );
}