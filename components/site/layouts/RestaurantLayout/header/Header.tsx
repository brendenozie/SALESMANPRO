"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassCircleIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MegaphoneIcon,
  ShoppingCartIcon, // Added for potential order functionality
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { useRouter } from "next/navigation";

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
  const { storeFormData } = useStoreContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData;

  // Use restaurant’s theme settings or fallbacks
  // Using a more vibrant orange for primary and a deep blue/indigo for secondary
  const primaryColor = themeSettings?.primaryColor || "#FF5722"; // Deep Orange
  const secondaryColor = themeSettings?.secondaryColor || "#3F51B5"; // Indigo

  // Effect to handle scroll for header background change
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // Change background after scrolling 50px
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Define navigation items dynamically
  const navItems = [
    { label: "Home", href: `/${slug}` },
    { label: "Menu", href: `/${slug}/menu` },
    { label: "Reserve", href: `/${slug}/reserve` },
    { label: "About", href: `/${slug}/about` }, // Added About page
    { label: "Contact", href: `/${slug}/contact` },
  ];

  return (
    <motion.header
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
      initial={false} // Disable initial animation as it's controlled by `scrolled`
      animate={{
        backgroundColor: scrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0)",
        boxShadow: scrolled ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Top Info Bar (Desktop) ── */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-xs font-medium text-gray-700"
        style={{ backgroundColor: scrolled ? "#f8f8f8" : `${primaryColor}1A` }} // Lighter on scroll
      >
        <div className="flex items-center space-x-6">
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-1 hover:text-opacity-80 transition-colors"
              style={{ color: primaryColor }}
            >
              <PhoneIcon className="h-4 w-4" />
              <span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-1 hover:text-opacity-80 transition-colors"
              style={{ color: primaryColor }}
            >
              <MegaphoneIcon className="h-4 w-4" />
              <span>{contactEmail}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks && socialLinks.map((s) => (
            <Link key={s.channel} href={s.url} target="_blank" rel="noopener noreferrer">
              <span
                className="capitalize transition-colors hover:scale-110 transform"
                style={{ color: primaryColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = secondaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = primaryColor)}
              >
                {s.channel}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Header Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href={`/${slug}`} className="flex items-center space-x-3 flex-shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name || "Restaurant Logo"}
                width={150} // Increased size for prominence
                height={50}
                className="object-contain w-6 h-6"
                loader={loader}
                priority
              />
            ) : (
              <span className={`text-2xl font-extrabold ${scrolled ? 'text-gray-800' : 'text-white'} transition-colors duration-300`}>
                {name || "Restaurant Name"}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-grow justify-center space-x-8 font-medium text-lg">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative text-gray-700 hover:text-opacity-90 transition-colors duration-300 group ${
                    scrolled ? 'text-gray-700' : 'text-white' // Text color changes on scroll
                }`}
                style={{ color: scrolled ? '#4a4a4a' : 'white' }} // Explicit color for clarity
                onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = scrolled ? '#4a4a4a' : 'white')}
              >
                {item.label}
                <motion.span
                  className="absolute left-0 -bottom-1 h-0.5 bg-current" // Use current color for underline
                  layoutId="underline" // For smooth underline animation
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </Link>
            ))}
          </nav>

          {/* Right Section: Search, User, Cart, Mobile Toggle */}
          <div className="flex items-center space-x-4">
            {/* Search (Desktop) */}
            <div className="relative hidden md:block">
              <input
                type="search"
                placeholder="Search dishes..."
                className={`w-48 bg-white border rounded-full py-2 px-4 pl-10 shadow-sm focus:outline-none focus:ring-2 transition-all duration-300
                  ${scrolled ? 'border-gray-300 text-gray-800' : 'border-white/50 bg-white/20 text-white placeholder-white/70'}
                  focus:ring-[${primaryColor}] focus:border-[${primaryColor}]`}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${primaryColor}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <MagnifyingGlassCircleIcon
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  scrolled ? 'text-gray-500' : 'text-white'
                }`}
              />
            </div>

            {/* User Profile Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              aria-label="Profile"
              onClick={() => router.push(`/${slug}/profile`)}
              className={`p-2 rounded-full transition-colors duration-300 ${
                scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'
              }`}
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            {/* Order Online / Cart Button */}
            <Link
              href={`/${slug}/order`} // Assuming an order page
              className="hidden md:flex items-center space-x-2 px-5 py-2 rounded-full font-semibold transition-all duration-300 shadow-md"
              style={{ backgroundColor: primaryColor, color: 'white' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = secondaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Order Online</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className={`lg:hidden p-2 rounded-md transition-colors duration-300 ${
                scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/20'
              }`}
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
      </div>

      {/* ── Mobile Menu (Overlay) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="lg:hidden fixed inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md z-40 flex flex-col items-center justify-center py-10"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 text-gray-800 dark:text-gray-200 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <nav className="space-y-6 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-center hover:text-opacity-80 transition-colors"
                  style={{ color: primaryColor }}
                  onClick={() => setMobileMenuOpen(false)} // Close menu on item click
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={`/${slug}/order`}
                className="block text-center px-6 py-3 rounded-full font-bold text-lg shadow-md mt-8"
                style={{ backgroundColor: primaryColor, color: 'white' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Order Online
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
