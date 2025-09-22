"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";


const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fallback colors if not provided
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#ffffff";
  const accentColor = storeFormData?.themeSettings?.secondaryColor || "#10B981";

  const navItems = [
    { label: "Home", href: `/${storeFormData?.slug}` },
    { label: "Destinations", href: `/site/${storeFormData?.slug}#destinations` },
    { label: "Tours", href: `/site/${storeFormData?.slug}#tours` },
    { label: "About", href: `/site/${storeFormData?.slug}#about` },
    { label: "Contact", href: `/site/${storeFormData?.slug}#contact` },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Transparent bar over banner */}
      <div className="bg-black bg-opacity-40 backdrop-blur-sm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Site Name */}
            <div className="flex items-center">
              {storeFormData?.logoUrl ? (
                <Link href={`/site/${storeFormData.slug}`}>
                  <Image
                    src={storeFormData.logoUrl}
                    alt={storeFormData.name}
                    width={120}
                    height={40}
                    loader={loader}
                    className="object-contain cursor-pointer"
                  />
                </Link>
              ) : (
                <Link href={`/site/${storeFormData?.slug}`}>
                  <span className="text-2xl font-extrabold cursor-pointer">
                    {storeFormData?.name}
                  </span>
                </Link>
              )}
            </div>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative px-1 text-base font-medium hover:text-green-200 transition"
                >
                  {item.label}
                  <motion.span
                    layoutId="underline"
                    className="absolute left-0 -bottom-1 h-0.5 bg-green-200 w-0"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              ))}
            </nav>

            {/* Search, Profile, Chat Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => router.push(`/site/${storeFormData?.slug}/search`)}
                aria-label="Search"
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => router.push(`/site/${storeFormData?.slug}/profile`)}
                aria-label="Profile"
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <UserCircleIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => router.push(`/${storeFormData?.slug}/chat`)}
                aria-label="Chat"
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
                className="p-1 rounded-md hover:bg-white/20 transition"
              >
                {mobileOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3BottomLeftIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-64 bg-black bg-opacity-90 backdrop-blur-md text-white shadow-lg z-50"
          >
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-8">
                {storeFormData?.logoUrl ? (
                  <Image
                    src={storeFormData.logoUrl}
                    alt={storeFormData.name}
                    width={100}
                    height={32}
                    loader={loader}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold">{storeFormData?.name}</span>
                )}
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-1 hover:bg-white/20 rounded-md transition"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium hover:text-green-200 transition"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-8 border-t border-white/20 pt-6 space-y-4">
                <button
                  onClick={() => {
                    router.push(`/site/${storeFormData?.slug}/search`);
                    setMobileOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-green-200 transition"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  <span>Search</span>
                </button>
                <button
                  onClick={() => {
                    router.push(`/${storeFormData?.slug}/profile`);
                    setMobileOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-green-200 transition"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    router.push(`/site/${storeFormData?.slug}/chat`);
                    setMobileOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-green-200 transition"
                >
                  <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
