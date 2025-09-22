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
  PhoneIcon, // Added for contact phone
  EnvelopeIcon, // Added for contact email
  GlobeAltIcon, // Generic icon for social links
} from "@heroicons/react/24/solid"; // Changed to solid for consistency with other sections
import { useStateContext } from "@/contexts/ContextProvider"; // Assuming this handles cart
import { useStoreContext } from "@/contexts/StoreContext";
import { useRouter } from "next/navigation";

// Sample data for development/fallback if storeFormData is empty
const defaultStoreData = {
  name: "DreamNest Realty",
  slug: "dreamnest",
  logoUrl: "/logos/dreamnest-logo.png", // Ensure you have this path or remove if using text logo
  contactPhone: "+254 712 345 678",
  contactEmail: "info@dreamnest.com",
  socialLinks: [
    { channel: "facebook", url: "https://facebook.com/dreamnestrealty" },
    { channel: "twitter", url: "https://twitter.com/dreamnestrealty" },
    { channel: "instagram", url: "https://instagram.com/dreamnestrealty" },
  ],
  themeSettings: {
    primaryColor: "#10B981", // emerald-500
    secondaryColor: "#F59E0B", // amber-500
  },
};

const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const { cart } = useStateContext(); // Assuming cart is managed here
  const { storeFormData } = useStoreContext();

  // Use default data if storeFormData is not fully populated
  const {
    name,
    slug,
    logoUrl,
    contactPhone,
    contactEmail,
    socialLinks,
    themeSettings,
  } = { ...defaultStoreData, ...storeFormData }; // Merge to ensure all properties exist

  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false); // State for search input visibility

  // Define dynamic colors from themeSettings (though static in this example)
  const primaryColor = themeSettings?.primaryColor || "#10B981"; // emerald-500
  const secondaryColor = themeSettings?.secondaryColor || "#F59E0B"; // amber-500

  // Animation variants for navigation links underline
  const linkVariants = {
    hover: {
      width: "100%",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    initial: {
      width: "0%",
    },
  };

  const handleLinkClick = (path: string) => {
    setMobileMenu(false); // Close mobile menu on link click
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-800">
      {/* ── Top Bar with Contact & Social (desktop) ── */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-gray-850 dark:to-gray-800 text-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-300">
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200"
            >
              <EnvelopeIcon className="w-4 h-4" />
              <span>{contactEmail}</span>
            </a>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-gray-400">Follow Us:</span>
          {socialLinks && socialLinks.map((link: any) => (
            <Link
              key={link.channel}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200"
              aria-label={`Follow us on ${link.channel}`}
            >
              {/* Using GlobeAltIcon as a placeholder for specific social icons */}
              <GlobeAltIcon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo/Site Name */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href={`/site/${slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={160} // Increased size for prominence
                height={50} // Adjust height proportionally
                loader={loader}
                className="object-contain h-auto max-h-[50px]" // Ensure image scales
                priority // Preload the logo
              />
            ) : (
              <span
                className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400"
                style={{ textShadow: "1px 1px rgba(0,0,0,0.1)" }}
              >
                {name || "Your Brand"}
              </span>
            )}
          </Link>
        </motion.div>

        {/* Desktop Navigation Links and Search */}
        <nav className="hidden lg:flex items-center space-x-8">
          {[
            { label: "Home", path: "" },
            { label: "Listings", path: `/site/${slug}#listings` },
            { label: "Agents", path: `/site/${slug}#agents` }, // Added Agents as a top-level nav item
            { label: "About", path: `/site/${slug}#about` },
            { label: "Blog", path: `/site/${slug}#blog` }, // Added Blog as a top-level nav item
            { label: "Contact", path: `/site/${slug}#contact` },
          ].map((item) => (
            <Link
              key={item.label}
              href={`/${slug}${item.path}`}
              className="relative text-gray-700 dark:text-gray-200 uppercase tracking-wide font-medium text-lg group
                         hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
              aria-label={`Maps to ${item.label} page`}
            >
              {item.label}
              <motion.span
                className="absolute left-0 bottom-[-4px] h-[3px] bg-emerald-600 dark:bg-emerald-400"
                variants={linkVariants}
                initial="initial"
                whileHover="hover"
              />
            </Link>
          ))}

          {/* Search Toggle Button and Input */}
          <div className="relative">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                         hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Toggle search input"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
            <AnimatePresence>
              {showSearchInput && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Search listings..."
                    className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                               focus:outline-none focus:ring-2 focus:ring-amber-500 transition border border-gray-200 dark:border-gray-700"
                    // Add an actual search handler for this input
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        router.push(`/${slug}/listings?q=${e.currentTarget.value.trim()}`);
                        setShowSearchInput(false); // Hide after search
                      }
                    }}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Icons & Mobile Toggle */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200
                       hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
            aria-label="Profile"
            onClick={() => router.push(`/${slug}/profile`)}
          >
            <UserCircleIcon className="w-7 h-7" />
          </motion.button>
          
          <button
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenu ? (
              <XMarkIcon className="w-7 h-7" />
            ) : (
              <Bars3BottomLeftIcon className="w-7 h-7" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ x: "100%" }} // Slide in from right for mobile
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-2xl z-50 p-6 flex flex-col"
          >
            <div className="flex justify-end mb-6">
              <button
                className="p-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
                onClick={() => setMobileMenu(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="w-7 h-7" />
              </button>
            </div>
            <nav className="flex flex-col space-y-6">
              {[
                { label: "Home", path: "" },
                { label: "Listings", path: "listings" },
                { label: "Agents", path: "agents" },
                { label: "About", path: "about" },
                { label: "Blog", path: "blog" },
                { label: "Contact", path: "contact" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={`/${slug}${item.path}`}
                  className="text-gray-800 dark:text-gray-100 uppercase font-semibold text-lg
                             hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded py-2"
                  onClick={() => handleLinkClick(`/site/${slug}#${item.path}`)} // Close menu on click
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Search Input */}
            {/* <div className="relative mt-8">
              <input
                type="text"
                placeholder="Search listings..."
                className="pl-10 pr-4 py-3 w-full rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-amber-500 transition border border-gray-200 dark:border-gray-600"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    router.push(`/${slug}/listings?q=${e.currentTarget.value.trim()}`);
                    setMobileMenu(false); // Close menu after search
                  }
                }}
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div> */}

            {/* Mobile Contact Info (Optional: if needed in drawer) */}
            <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center space-y-4 text-gray-700 dark:text-gray-300">
              {contactPhone && (
                <a href={`tel:${contactPhone}`} className="flex items-center space-x-2 text-md hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <PhoneIcon className="w-5 h-5" />
                  <span>{contactPhone}</span>
                </a>
              )}
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="flex items-center space-x-2 text-md hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  <EnvelopeIcon className="w-5 h-5" />
                  <span>{contactEmail}</span>
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}