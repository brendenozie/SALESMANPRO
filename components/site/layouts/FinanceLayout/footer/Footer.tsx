"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import {
  FaceSmileIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";

export default function EnhancedMediaFooter() {
  const { storeFormData } = useStoreContext();
  const year = new Date().getFullYear();

  const primary = storeFormData.themeSettings?.primaryColor || "#2563EB";
  const secondary = storeFormData.themeSettings?.secondaryColor || "#9333EA";

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-t border-gray-700">
        {/* About */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">
            About {storeFormData.name}
          </h3>
          <p className="text-sm leading-relaxed">
            {storeFormData.description ||
              "Your hub for inspiring stories, videos, and insights—stay connected and informed with us."}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={`/${storeFormData.slug}`}
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href={`/${storeFormData.slug}/articles`}
                className="hover:text-white transition-colors"
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                href={`/${storeFormData.slug}/videos`}
                className="hover:text-white transition-colors"
              >
                Videos
              </Link>
            </li>
            <li>
              <Link
                href={`/${storeFormData.slug}/categories`}
                className="hover:text-white transition-colors"
              >
                Categories
              </Link>
            </li>
            <li>
              <Link
                href={`/${storeFormData.slug}/about`}
                className="hover:text-white transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href={`/${storeFormData.slug}/contact`}
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Categories</h3>
          <ul className="space-y-2 text-sm">
            {storeFormData.storeCategories?.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/${storeFormData.slug}/category/${cat.id}`}
                  className="hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            )) || <li className="text-gray-500">No categories available</li>}
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Get in Touch</h3>
          {storeFormData.contactEmail && (
            <div className="flex items-center mb-2 text-sm">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <a
                href={`mailto:${storeFormData.contactEmail}`}
                className="hover:text-white transition-colors"
              >
                {storeFormData.contactEmail}
              </a>
            </div>
          )}
          {storeFormData.contactPhone && (
            <div className="flex items-center mb-4 text-sm">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
              <a
                href={`tel:${storeFormData.contactPhone}`}
                className="hover:text-white transition-colors"
              >
                {storeFormData.contactPhone}
              </a>
            </div>
          )}

          <h3 className="text-xl font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            {storeFormData.socialLinks?.map((s) => (
              <motion.a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                aria-label={s.channel}
              >
                <FaceSmileIcon className="h-5 w-5 text-gray-400" />
              </motion.a>
            )) || <span className="text-gray-500">No social links</span>}
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-6 text-center text-sm text-gray-500">
        &copy; {year} {storeFormData.name}. All rights reserved.
      </div>
    </footer>
  );
}
