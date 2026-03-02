"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStoreContext } from "@/contexts/StoreContext";
import {
  MegaphoneIcon,
  PhoneIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function Footer() {
  const { storeFormData } = useStoreContext();

  if (!storeFormData) {
    return null;
  }

  const {
    name,
    slug,
    description,
    contactEmail,
    contactPhone,
    socialLinks,
    StoreCategory,
  } = storeFormData;

  return (
    <footer className="bg-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* ── About & Logo ── */}
        <div className="space-y-4">
          <Link href={`/${slug}`} className="inline-flex items-center space-x-2">
            {/* If you have a logo, swap in an <Image> here */}
            <span className="text-xl font-bold">{name}</span>
          </Link>
          {description && (
            <p className="text-sm text-gray-200 h-20 overflow-hidden">{description}</p>
          )}
          <div className="flex space-x-4 mt-4">
            {socialLinks.map((s) => (
              <a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-300 hover:text-white transition-colors"
              >
                {String(s.channel).charAt(0).toUpperCase() + String(s.channel).slice(1)}
              </a>
            ))}
          </div>
        </div>

        {/* ── Quick Links ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${slug}`}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/courses`}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Courses
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/faqs`}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href={`/${slug}/contact`}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ChevronRightIcon className="h-4 w-4 mr-2" />
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* ── Categories ── */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <ul className="space-y-2">
            {StoreCategory.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/${slug}/category/${cat.id}`}
                  className="flex items-center text-gray-300 hover:text-white transition-colors"
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
          <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
          <ul className="space-y-4 text-gray-300">
            {contactEmail && (
              <li className="flex items-center">
                <MegaphoneIcon className="h-5 w-5 mr-2" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                  {contactEmail}
                </a>
              </li>
            )}
            {contactPhone && (
              <li className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                  {contactPhone}
                </a>
              </li>
            )}
            <li>
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} {name}. All rights reserved.
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
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
