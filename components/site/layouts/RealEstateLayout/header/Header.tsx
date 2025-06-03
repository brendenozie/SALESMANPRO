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
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const [mobileMenu, setMobileMenu] = useState(false);

  const {
    name,
    slug,
    logoUrl,
    contactPhone,
    contactEmail,
    socialLinks,
    themeSettings,
  } = storeFormData;

  const primary = themeSettings?.primaryColor || "#10B981"; // emerald-500
  const secondary = themeSettings?.secondaryColor || "#F59E0B"; // amber-500

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      {/* ── Top Bar with Contact (desktop) ── */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 bg-emerald-50 dark:bg-gray-800">
        <div className="flex items-center space-x-4 text-gray-700 dark:text-gray-300">
          {contactPhone && (
            <a
              href={`tel:${contactPhone}`}
              className="flex items-center space-x-1 hover:text-emerald-600 transition"
            >
              📞<span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-1 hover:text-emerald-600 transition"
            >
              📧<span>{contactEmail}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {socialLinks.map((link: any) => (
            <Link key={link.channel} href={link.url} target="_blank">
              <span className="capitalize text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition">
                {link.channel}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Navigation ── */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-4"
        >
          <Link href={`/${slug}`}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={120}
                height={40}
                loader={loader}
                className="object-contain"
              />
            ) : (
              <span
                className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400"
                style={{ textShadow: "1px 1px rgba(0,0,0,0.1)" }}
              >
                {name}
              </span>
            )}
          </Link>
        </motion.div>

        {/* Desktop Links & Search */}
        <nav className="hidden lg:flex items-center space-x-8">
          {["Home", "Listings", "About", "Contact"].map((label) => (
            <motion.div key={label} whileHover={{ y: -2 }} className="relative">
              <Link
                href={`/${slug}${
                  label.toLowerCase() === "home"
                    ? ""
                    : `/${label.toLowerCase()}`
                }`}
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            aria-label="Profile"
            onClick={() =>
              router.push(`/${slug}/profile`)
            }
          >
            <UserCircleIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="relative"
            aria-label="Cart"
            onClick={() =>
              router.push(`/${slug}/checkout`)
            }
          >
            <ShoppingBagIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            {cart.length > 0 && (
              <motion.span
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                {cart.length}
              </motion.span>
            )}
          </motion.button>
          <button
            className="lg:hidden p-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle menu"
          >
            {mobileMenu ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3BottomLeftIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 backdrop-blur-sm p-6"
          >
            <nav className="flex flex-col space-y-4">
              {["Home", "Listings", "About", "Contact"].map(
                (label) => (
                  <Link
                    key={label}
                    href={`/${slug}${
                      label.toLowerCase() === "home"
                        ? ""
                        : `/${label.toLowerCase()}`
                    }`}
                    className="text-gray-700 dark:text-gray-200 uppercase font-medium hover:text-emerald-600 transition"
                  >
                    {label}
                  </Link>
                )
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
