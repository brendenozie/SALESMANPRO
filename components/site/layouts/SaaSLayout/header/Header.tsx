'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon, // More modern looking menu icon
  XMarkIcon,
  RocketLaunchIcon, // A more engaging icon for "Get Started"
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// Re-using the loader from your SaasSite component for consistency
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function SaasHeader() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fallback colors for theme consistency
  const primary = storeFormData?.themeSettings?.primaryColor || "#6366F1"; // Default Indigo-500
  const secondary = storeFormData?.themeSettings?.secondaryColor || "#8B5CF6"; // Default Purple-500

  // Ensure storeFormData.slug is defined, provide a fallback if not
  const siteSlug = storeFormData?.slug || "default-saas-slug";
  const siteName = storeFormData?.name || "Your SaaS Name";
  const siteLogoUrl = storeFormData?.logoUrl || ""; // Make sure this is "" if not present

  const navItems = [
    { label: "Home", href: `/${siteSlug}` },
    { label: "Features", href: `/${siteSlug}#features` },
    { label: "Pricing", href: `/${siteSlug}#pricing` },
    { label: "Testimonials", href: `/${siteSlug}#testimonials` }, // Added for new section
    { label: "FAQs", href: `/${siteSlug}#faqs` }, // Added for new section
    { label: "Docs", href: `/${siteSlug}/docs` },
    { label: "About", href: `/${siteSlug}/about` },
  ];

  return (
    <header className="sticky top-0 z-50 py-4 backdrop-blur-xl transition-colors duration-300
                       bg-white/70 dark:bg-gray-900/70
                       shadow-sm dark:shadow-lg border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo + Title */}
        <Link href={`/${siteSlug}`} className="flex items-center space-x-3 cursor-pointer group">
          {siteLogoUrl ? (
            <motion.div
              className="relative rounded-full overflow-hidden flex-shrink-0"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image
                src={siteLogoUrl}
                alt={siteName}
                width={40}
                height={40}
                loader={loader}
                className="object-cover"
              />
            </motion.div>
          ) : (
            <span
              className="text-2xl md:text-3xl font-extrabold"
              style={{
                backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {siteName}
            </span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navItems.map((item) => (
            <motion.div
              key={item.label}
              className="relative text-lg" // Larger font for desktop nav
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Link
                href={item.href}
                className="font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group"
              >
                {item.label}
                {/* Underline animation */}
                <span
                  className="absolute left-0 bottom-[-4px] h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: "0%", transition: "width 0.3s ease-out" }}
                  onMouseEnter={(e) => (e.currentTarget.style.width = "100%")}
                  onMouseLeave={(e) => (e.currentTarget.style.width = "0%")}
                ></span>
              </Link>
            </motion.div>
          ))}

          {/* Desktop CTA Button */}
          <motion.button
            onClick={() => router.push(`/${siteSlug}/signup`)}
            className="inline-flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-semibold py-2.5 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RocketLaunchIcon className="h-5 w-5" /> Get Started
          </motion.button>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <motion.button
          className="md:hidden text-gray-700 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
          whileTap={{ scale: 0.9 }}
        >
          <Bars3Icon className="h-8 w-8" /> {/* Larger, more modern icon */}
        </motion.button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl p-6 flex flex-col sm:rounded-l-3xl border-l border-gray-100 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-10">
              {siteLogoUrl ? (
                <Image
                  src={siteLogoUrl}
                  alt={siteName}
                  width={45}
                  height={45}
                  loader={loader}
                  className="rounded-full  h-8 w-32"
                />
              ) : (
                <span
                  className="text-2xl font-bold"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {siteName}
                </span>
              )}
              <motion.button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-600 dark:text-gray-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <XMarkIcon className="h-7 w-7" />
              </motion.button>
            </div>

            <nav className="flex flex-col space-y-7 text-xl flex-grow"> {/* Larger text, expand to fill space */}
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium border-b border-gray-100 dark:border-gray-800 pb-3" // Subtle border
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile CTA Button */}
            <motion.button
              onClick={() => {
                setMobileMenuOpen(false);
                router.push(`/${siteSlug}/signup`);
              }}
              className="mt-10 inline-flex items-center gap-3 justify-center bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-semibold py-3.5 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-400"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RocketLaunchIcon className="h-6 w-6" /> Get Started
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}