"use client";

import React from "react";
import Link from "next/link";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import {
  MegaphoneIcon,
  PhoneIcon,
  MapPinIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    themeSettings,
  } = storeFormData;

  const primary = themeSettings?.primaryColor || "#F97316"; // fallback orange
  const secondary = themeSettings?.secondaryColor || "#3B82F6"; // fallback blue

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
            Serving gourmet dishes with passion. Experience our signature flavors and warm hospitality.
          </p>
          <div className="flex space-x-4 mt-4">
            {socialLinks.map((s) => (
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
                href={`/${slug}`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/menu`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Menu
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/reserve`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Reserve
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/contact`}
                className="flex items-center text-gray-400 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Contact Info ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
          <ul className="space-y-4 text-gray-400">
            {address && (
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 mr-2 mt-1 text-gray-400" />
                <span>{address}</span>
              </li>
            )}
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
          </ul>
        </div>

        {/* ── Newsletter ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-white">Newsletter</h3>
          <p className="text-sm text-gray-400 mb-4">
            Sign up to get updates on new dishes and special offers.
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
          <p>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
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
    </footer>
  );
}
