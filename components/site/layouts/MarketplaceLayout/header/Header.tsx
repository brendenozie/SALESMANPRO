"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassCircleIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "@/contexts/ContextProvider";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";

// Image loader for optimization
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { storeFormData } = useStoreContext();
  const { cart } = useStateContext();
  const router = useRouter();

  // Store fields with safe fallbacks
  const {
    slug,
    name,
    logoUrl,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || "#6366f1"; // indigo fallback
  const secondary = themeSettings?.secondaryColor || "#ec4899"; // pink fallback

  // UI state
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Nav links (driven by store slug)
  const navLinks = [
    { label: "Home", href: `/site/${slug}/ecommerce` },
    { label: "Shop", href: `/site/${slug}/ecommerce/products` },
    { label: "Categories", href: `/site/${slug}/ecommerce/categories` },
    { label: "Deals", href: `/site/${slug}/ecommerce/deals` },
    { label: "Contact", href: `/site/${slug}/ecommerce/contact` },
  ];

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-shadow backdrop-blur-sm 
        ${hasScrolled ? "shadow-xl bg-white/70 dark:bg-gray-900/70" : "bg-transparent"}
        py-6`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Brand & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenu(true)}
            className="lg:hidden p-2 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
          >
            <Bars3BottomLeftIcon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
          </button>

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className="flex items-center cursor-pointer"
            onClick={() => router.push(`/site/${slug}`)}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                loader={loader}
                width={40}
                height={40}
                alt={`${name} logo`}
                className="object-contain"
              />
            ) : (
              <span
                style={{ color: primary }}
                className="ml-2 text-2xl font-extrabold"
              >
                {name || "Store"}
              </span>
            )}
          </motion.div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-8">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.label}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={link.href}
                className="relative text-gray-800 dark:text-gray-100 font-medium"
              >
                {link.label}
                <motion.span
                  className="absolute bottom-0 left-0 h-0.5"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
                  }}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                />
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Search & Icons */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Search input */}
          <motion.div whileFocus={{ scale: 1.02 }} className="relative">
            <input
              type="search"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-48 focus:w-64 transition-all duration-300 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1"
            />
            <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
          </motion.div>

          {/* Cart & Notifications */}
          {[
            { icon: ShoppingBagIcon, count: cart.length, action: () => router.push(`/site/${slug}/ecommerce/checkout`) },
            { icon: BellIcon, count: 3, action: () => console.log("Open notifications") },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              whileHover={{ rotate: 10 }}
              onClick={item.action}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none"
            >
              <item.icon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              {item.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {item.count}
                </span>
              )}
            </motion.button>
          ))}

          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => router.push(`/site/${slug}/ecommerce/profile`)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none"
          >
            <UserCircleIcon className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg z-50 p-6 flex flex-col"
          >
            <button
              onClick={() => setMobileMenu(false)}
              className="self-end mb-4 p-2"
            >
              <XMarkIcon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
            </button>

            {/* Mobile Nav */}
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenu(false)}
                  className="text-lg font-medium text-gray-800 dark:text-gray-100 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Social links */}
            {socialLinks?.length > 0 && (
              <div className="mt-6 flex space-x-4">
                {socialLinks.map((s: any) => (
                  <a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="capitalize text-gray-800 dark:text-gray-100 hover:text-indigo-600 transition-colors"
                  >
                    {s.channel}
                  </a>
                ))}
              </div>
            )}

            {/* Account quick link */}
            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href={`/site/${slug}/ecommerce/profile`}
                className="flex items-center gap-2 text-gray-800 dark:text-gray-100 py-2 hover:text-indigo-600 transition-colors"
              >
                <UserCircleIcon className="h-5 w-5" /> <span>Account</span>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
