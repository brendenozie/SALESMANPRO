"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";

export default function FinanceHeader() {
  const { storeFormData } = useStoreContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const primary = storeFormData.themeSettings?.primaryColor || "#2563EB";
  const secondary = storeFormData.themeSettings?.secondaryColor || "#9333EA";

  const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

  const navItems = [
    { label: "Home", href: `/${storeFormData.slug}` },
    { label: "Services", href: `/${storeFormData.slug}#services` },
    { label: "Why Us", href: `/${storeFormData.slug}#usps` },
    { label: "Testimonials", href: `/${storeFormData.slug}#testimonials` },
    { label: "Contact", href: `/${storeFormData.slug}#contact` },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Transparent overlay to sit over banner */}
      <div
        className="h-20"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)`,
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-20"
        style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href={`/${storeFormData.slug}`} className="flex items-center space-x-2">
            {storeFormData.logoUrl ? (
              <Image
                loader={loader}
                src={storeFormData.logoUrl}
                alt={storeFormData.name}
                width={140}
                height={48}
                className="object-contain"
                priority
              />
            ) : (
              <span className="text-2xl font-extrabold text-gray-900">
                {storeFormData.name}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex space-x-8">
            {navItems.map((item) => (
              <motion.div key={item.label} whileHover={{ y: -2 }}>
                <Link
                  href={item.href}
                  className="text-gray-700 font-medium hover:text-white transition-colors"
                  style={{ position: "relative" }}
                >
                  {item.label}
                  <span
                    className="absolute left-0 -bottom-1 h-0.5 bg-gradient-to-r"
                    style={{ width: 0, backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})` }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Actions + Mobile Button */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <div className="relative hidden md:block">
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Scroll-Down Indicator */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="hidden md:flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronDownIcon className="h-5 w-5" />
              <span className="text-sm">Scroll</span>
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-700" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="lg:hidden bg-white shadow-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-gray-700 font-medium py-2 hover:text-gray-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
