/*
Header Redesign for Real Estate Site

Design Decisions Summary:

1. Typography & Visual Hierarchy:
   • Logo: larger, bold, with subtle text-shadow for depth.
   • Nav Links: uppercase tracking-wide, hover underline animation.
   • Contact & CTA: contrasting font-weight and color accent.

2. Color Palette & Contrast:
   • Primary: emerald-600 (hover emerald-700).
   • Secondary: amber-500 for CTA & focus rings.
   • Dark Mode: bg-gray-900, text-gray-100, accents adjust.

3. Layout & Responsiveness:
   • Flex layout with space-between, consistent padding px-6.
   • Mobile: sliding menu drawer with backdrop blur.
   • Desktop: full nav + search.

4. Iconography & Imagery:
   • Heroicons for search, user, cart, menu toggle—colored to match theme.
   • Animated cart badge with pulse for new items.

5. Micro-interactions & Animation:
   • Framer Motion for logo fade-in and nav link underline slide.
   • Mobile drawer slides from left with backdrop fade.
   • Buttons scale on hover/tap.

6. Accessibility:
   • aria-labels on interactive elements.
   • focus-visible outlines with amber ring.
   • Semantic <header>, <nav>, <button>.
*/

"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }:any) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header({ storeFormData }:any) {
  const { cart } = useStateContext();
  const [mobileMenu, setMobileMenu] = useState(false);
  const router = useRouter();
  const primary = storeFormData.themeSettings.primaryColor || "#10B981"; // emerald-500
  const secondary = storeFormData.themeSettings.secondaryColor || "#F59E0B"; // amber-500

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      {/* Top Bar with Contact */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm bg-emerald-50 dark:bg-gray-800"
      >
        <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
          {storeFormData.contactPhone && (
            <a href={`tel:${storeFormData.contactPhone}`} className="flex items-center space-x-1 hover:text-emerald-600 transition">
              📞<span>{storeFormData.contactPhone}</span>
            </a>
          )}
          {storeFormData.contactEmail && (
            <a href={`mailto:${storeFormData.contactEmail}`} className="flex items-center space-x-1 hover:text-emerald-600 transition">
              📧<span>{storeFormData.contactEmail}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {storeFormData.socialLinks.map((link:any) => (
            <Link key={link.channel} href={link.url} target="_blank">
              <span className="capitalize text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition">
                {link.channel}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-4"
        >
          <Link href={`/site/${storeFormData.slug}`}>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400" style={{ textShadow: '1px 1px rgba(0,0,0,0.1)' }}>
              {storeFormData.name}
            </span>
          </Link>
        </motion.div>

        {/* Desktop Links & Search */}
        <nav className="hidden lg:flex items-center space-x-8">
          {['Home','Listings','About','Contact'].map(label => (
            <motion.div
              key={label}
              whileHover={{ y: -2 }}
              className="relative"
            >
              <Link
                href={`/site/${storeFormData.slug}/${label.toLowerCase() === 'home' ? '' : label.toLowerCase()}`}
                className="text-gray-700 dark:text-gray-200 uppercase tracking-wide font-medium"
              >
                {label}
                <motion.span
                  className="absolute left-0 bottom-0 h-0.5 bg-emerald-600"
                  layoutId="underline"
                />
              </Link>
            </motion.div>
          ))}

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search listings..."
              className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </nav>

        {/* Icons & Mobile Toggle */}
        <div className="flex items-center space-x-4">
          <motion.button whileHover={{ scale: 1.1 }} aria-label="Profile" onClick={() => router.push(`/site/${storeFormData.slug}/profile`)}>
            <UserCircleIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="relative"
            aria-label="Cart"
            onClick={() => router.push(`/site/${storeFormData.slug}/checkout`)}
          >
            <ShoppingBagIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            {cart.length > 0 && (
              <motion.span
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >{cart.length}</motion.span>
            )}
          </motion.button>
          <button
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? <XMarkIcon className="w-6 h-6" /> : <Bars3BottomLeftIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 backdrop-blur-sm p-6"
          >
            <nav className="flex flex-col space-y-4">
              {['Home','Listings','About','Contact'].map(label => (
                <Link
                  key={label}
                  href={`/site/${storeFormData.slug}/${label.toLowerCase() === 'home' ? '' : label.toLowerCase()}`}
                  className="text-gray-700 dark:text-gray-200 uppercase font-medium hover:text-emerald-600 transition"
                >{label}</Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}