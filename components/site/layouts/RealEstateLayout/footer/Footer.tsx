"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  MegaphoneIcon,
  PhoneIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || "#10B981"; // emerald-500
  const secondary = themeSettings?.secondaryColor || "#F59E0B"; // amber-500

  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* ── About & Logo ── */}
        <div className="space-y-4">
          <Link href={`/${slug}`} className="inline-flex items-center space-x-2">
            <span
              className="text-2xl font-extrabold text-white"
              style={{ textShadow: "1px 1px rgba(0,0,0,0.2)" }}
            >
              {name}
            </span>
          </Link>
          <p className="text-sm text-gray-400">
            Delivering exceptional properties and personalized service to help you find your dream home.
          </p>
          <div className="flex space-x-4 mt-4">
            {socialLinks?.map((s) => (
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
                {s.channel.toString().charAt(0).toUpperCase() + s.channel.toString().slice(1)}
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <Link
                href={`/${slug}`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/listings`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Listings
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/about`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                About
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/contact`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Contact Info ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Get in Touch</h3>
          <ul className="space-y-4 text-gray-400">
            {contactEmail && (
              <li className="flex items-center">
                <MegaphoneIcon className="h-5 w-5 mr-2" />
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
                <PhoneIcon className="h-5 w-5 mr-2" />
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

        {/* ── Address / Newsletter ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Newsletter</h3>
          <p className="text-sm text-gray-400 mb-4">
            Sign up to receive updates on new listings and market insights.
          </p>
          <form className="flex flex-col space-y-3">
            <input
              type="email"
              placeholder="Your email"
              className="px-4 py-2 rounded-md bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded-md hover:bg-amber-600 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-gray-700 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href={`/${slug}/privacy`}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href={`/${slug}/terms`}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
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
