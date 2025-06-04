'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";

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

  const primary = storeFormData.themeSettings?.primaryColor || "#4F46E5";
  const secondary = storeFormData.themeSettings?.secondaryColor || "#3B82F6";

  const navItems = [
    { label: "Home", href: `/${storeFormData.slug}` },
    { label: "Features", href: `/${storeFormData.slug}#features` },
    { label: "Pricing", href: `/${storeFormData.slug}#pricing` },
    { label: "Docs", href: `/${storeFormData.slug}/docs` },
    { label: "About", href: `/${storeFormData.slug}/about` },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-white/50 backdrop-blur-md border-b border-gray-200`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <Link href={`/${storeFormData.slug}`} className="flex items-center space-x-2 cursor-pointer">
          {storeFormData.logoUrl ? (
            <Image
              src={storeFormData.logoUrl}
              alt={storeFormData.name}
              width={40}
              height={40}
              loader={loader}
              className="rounded-full"
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
              {storeFormData.name}
            </span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Link
                href={item.href}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                {item.label}
              </Link>
              <motion.span
                className="absolute left-0 bottom-[-4px] h-0.5 bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}

          <motion.button
            onClick={() => router.push(`/${storeFormData.slug}/signup`)}
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-xl transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" /> Get Started
          </motion.button>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Bars3BottomLeftIcon className="h-7 w-7" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-3/4 bg-white shadow-lg p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <span
                className="text-xl font-bold"
                style={{
                  backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {storeFormData.name}
              </span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <nav className="flex flex-col space-y-6 text-lg">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <motion.button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push(`/${storeFormData.slug}/signup`);
                }}
                whileHover={{ scale: 1.05 }}
                className="mt-8 inline-flex items-center gap-2 justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-xl transition"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" /> Get Started
              </motion.button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>
    </header>
  );
}
