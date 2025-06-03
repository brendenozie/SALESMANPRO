"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData;

  const primary = themeSettings?.primaryColor || "#4F46E5"; // indigo-600
  const secondary = themeSettings?.secondaryColor || "#6366F1"; // indigo-500

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      {/* Top Info Bar (desktop) */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 text-sm bg-indigo-50 dark:bg-gray-800">
        <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-300">
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-1 hover:text-indigo-600 transition"
            >
              📞<span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-1 hover:text-indigo-600 transition"
            >
              📧<span>{contactEmail}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks.map((s) => (
            <Link key={s.channel} href={s.url} target="_blank">
              <span
                className="capitalize text-gray-700 dark:text-gray-300 transition-colors hover:text-indigo-600"
              >
                {s.channel}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-3"
        >
          <Link href={`/${slug}`}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="h-10 object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {name}
              </span>
            )}
          </Link>
        </motion.div>

        {/* Desktop Links + Search */}
        <nav className="hidden lg:flex items-center space-x-8">
          {["Home", "Events", "About", "Contact"].map((label) => {
            let href = `/${slug}`;
            if (label === "Events") href = `/${slug}/events`;
            if (label === "About") href = `/${slug}/about`;
            if (label === "Contact") href = `/${slug}/contact`;
            return (
              <motion.div key={label} whileHover={{ y: -2 }} className="relative">
                <Link
                  href={href}
                  className="text-gray-700 dark:text-gray-200 uppercase tracking-wide font-medium"
                >
                  {label}
                  <motion.span
                    className="absolute left-0 bottom-0 h-0.5 bg-indigo-600"
                    layoutId="underline"
                  />
                </Link>
              </motion.div>
            );
          })}

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </nav>

        {/* Icons & Mobile Toggle */}
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            aria-label="Profile"
            onClick={() => router.push(`/${slug}/profile`)}
            className="text-gray-700 dark:text-gray-200"
          >
            <UserCircleIcon className="h-6 w-6" />
          </motion.button>
          <button
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3BottomLeftIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 backdrop-blur-sm p-6"
          >
            <nav className="flex flex-col space-y-4">
              {["Home", "Events", "About", "Contact"].map((label) => {
                let href = `/${slug}`;
                if (label === "Events") href = `/${slug}/events`;
                if (label === "About") href = `/${slug}/about`;
                if (label === "Contact") href = `/${slug}/contact`;
                return (
                  <Link
                    key={label}
                    href={href}
                    className="text-gray-700 dark:text-gray-200 uppercase font-medium hover:text-indigo-600 transition"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
