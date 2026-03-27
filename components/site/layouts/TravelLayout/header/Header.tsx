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
import { useSession, signOut } from "next-auth/react";

// Fallback sample data
const sampleData = {
  name: "TravelCo",
  slug: "travelco",
  logoUrl: "https://placehold.co/120x40/000000/FFFFFF?text=Logo",
  themeSettings: { primaryColor: "#10B981", secondaryColor: "#047857" },
};

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { storeFormData } = useStoreContext();

  // AUTH
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signup");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === "admin") {
      router.push("/dashboards");
    } else {
      router.push(`/travel/profile`);
    }
  };

  // Extract final data (fallback-safe)
  const { name, slug, logoUrl, themeSettings } = storeFormData || sampleData;

  const primary = themeSettings?.primaryColor || "#10B981";
  const secondary = themeSettings?.secondaryColor || "#047857";

  const navItems = [
    { label: "Home", href: `/` },
    { label: "Destinations", href: `/#destinations` },
    { label: "Tours", href: `/#tours` },
    { label: "About", href: `/#about` },
    { label: "Contact", href: `/#contact` },
  ];

  return (
    <header className="inset-x-0 top-0 z-50">
      {/* Main top transparent bar */}
      <div className="bg-black bg-opacity-100 backdrop-blur-sm text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={`/`}>
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name}
                    width={120}
                    height={40}
                    loader={loader}
                    className="object-contain cursor-pointer"
                  />
                ) : (
                  <span className="text-2xl font-extrabold">{name}</span>
                )}
              </Link>
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

            {/* Desktop Icons + Auth */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => router.push(`/search`)}
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* Chat */}
              <button
                onClick={() => router.push(`/chat`)}
                className="p-1 rounded-full hover:bg-white/20 transition"
              >
                <ChatBubbleLeftEllipsisIcon className="h-6 w-6" />
              </button>

              {/* Logged in */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleUserAction}
                    className="px-3 py-1 text-sm rounded-md font-medium"
                    style={{ backgroundColor: primary }}
                  >
                    {user.name || "Profile"}
                  </button>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                // Not logged in
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-4 py-1 text-sm font-medium rounded-md text-white"
                    style={{ backgroundColor: primary }}
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="px-4 py-1 text-sm font-medium rounded-md border"
                    style={{ borderColor: primary, color: primary }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
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
              {/* Drawer Header */}
              <div className="flex items-center justify-between mb-8">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name}
                    width={100}
                    height={32}
                    loader={loader}
                  />
                ) : (
                  <span className="text-xl font-bold">{name}</span>
                )}
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-1 hover:bg-white/20 rounded-md transition"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Nav */}
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

              {/* Auth + Icons */}
              <div className="mt-8 border-t border-white/20 pt-6 space-y-4">
                {/* Search */}
                <button
                  onClick={() => {
                    router.push(`/search`);
                    setMobileOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-green-200 transition"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  <span>Search</span>
                </button>

                {/* Chat */}
                <button
                  onClick={() => {
                    router.push(`/chat`);
                    setMobileOpen(false);
                  }}
                  className="flex items-center space-x-2 hover:text-green-200 transition"
                >
                  <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                  <span>Chat</span>
                </button>

                {/* Auth */}
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        handleUserAction();
                        setMobileOpen(false);
                      }}
                      className="flex items-center space-x-2 hover:text-green-200"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </button>

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="text-red-400"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleGoogleSignIn}>Login</button>
                    <button onClick={handleGoogleSignUp}>Register</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
