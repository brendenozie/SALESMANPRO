"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function EnhancedHeader({ storeFormData }:any) {
  const { cart } = useStateContext();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const primary = storeFormData?.themeSettings?.primaryColor || "#6366F1"; // indigo
  const secondary = storeFormData?.themeSettings?.secondaryColor || "#10B981"; // emerald

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      {/* Top Promo Bar */}
      <motion.div
        className="flex justify-center items-center bg-gradient-to-r from-indigo-500 to-emerald-500 text-white text-sm py-1 px-6"
        initial={{ y: -30 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="flex items-center space-x-2">
          <span>🚀 New Features Live!</span>
          <Link href="#features" className="underline font-semibold">
            Learn More
          </Link>
        </p>
      </motion.div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Menu */}
          <div className="flex items-center space-x-8">
            <Link href={`/site/${storeFormData.slug}`} className="flex items-center">
              {storeFormData.logoUrl ? (
                <Image
                  src={storeFormData.logoUrl}
                  alt={storeFormData.name}
                  width={140}
                  height={48}
                  className="object-contain"
                  priority
                  loader={loader}
                />
              ) : (
                <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                  {storeFormData.name}
                </span>
              )}
            </Link>

            <nav className="hidden lg:flex space-x-6">
              {[
                { label: "Home", href: "" },
                { label: "Products", href: "products" },
                { label: "Categories", href: "categories" },
                { label: "About", href: "about" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Link
                    href={`/site/${storeFormData.slug}/${item.href}`}
                    className="text-gray-700 dark:text-gray-200 font-medium hover:text-indigo-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* Search & Icons */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/site/${storeFormData.slug}/profile`)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="Profile"
            >
              <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/site/${storeFormData.slug}/checkout`)}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBagIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </motion.button>

            <button
              className="lg:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? (
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <motion.div
          className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <nav className="flex flex-col px-4 py-4 space-y-2">
            {[
              { label: "Home", href: "" },
              { label: "Products", href: "products" },
              { label: "Categories", href: "categories" },
              { label: "About", href: "about" },
            ].map((item) => (
              <Link
                key={item.label}
                href={`/site/${storeFormData.slug}/${item.href}`}
                className="block text-gray-700 dark:text-gray-200 py-2 font-medium hover:text-indigo-600 dark:hover:text-emerald-400 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      )}
    </header>
  );
}
