"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3CenterLeftIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const defaultStoreData = {
  name: "YourBrand",
  slug: "yourbrand",
  logoUrl: "",
  contactPhone: "",
  contactEmail: "",
  socialLinks: [],
  themeSettings: {
    primaryColor: "#0d9488",
    secondaryColor: "#0f766e",
  },
};

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const data = { ...defaultStoreData, ...storeFormData };

  const {
    name,
    slug,
    logoUrl,
    contactPhone,
    contactEmail,
    socialLinks,
    themeSettings,
  } = data;

  const primaryColor = themeSettings?.primaryColor || "#0d9488";

  // Auth session
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  // UI
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Theme effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const navLinks = [
    { name: "Home", href: "" },
    { name: "Programs", href: "#programs" },
    { name: "Trainers", href: "#trainers" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const handleGoogleSignIn = () => {
    const url = new URL("https://auth.salesmanpro.site/signin");
    url.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = url.toString();
  };

  const handleGoogleSignUp = () => {
    const url = new URL("https://auth.salesmanpro.site/signup");
    url.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = url.toString();
  };

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    router.push(user.role === "admin" ? "/dashboards" : "/profile");
  };

  return (
    <header className=" top-0 inset-x-0 z-50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-lg font-sans border-b border-gray-200 dark:border-gray-700">
      {/* ---------- TOP BAR ---------- */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 bg-gray-50 dark:bg-gray-800 text-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-300">
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="flex items-center space-x-2 hover:text-teal-600">
              <PhoneIcon className="w-4 h-4" />
              <span>{contactPhone}</span>
            </a>
          )}

          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center space-x-2 hover:text-teal-600">
              <EnvelopeIcon className="w-4 h-4" />
              <span>{contactEmail}</span>
            </a>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {socialLinks?.map((s, i) => (
            <Link key={i} href={s.url} target="_blank">
              <GlobeAltIcon className="w-5 h-5 hover:text-teal-600 text-gray-600 dark:text-gray-300" />
            </Link>
          ))}
        </div>
      </div>

      {/* ---------- MAIN NAVBAR ---------- */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link href={`/${slug}`}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={140}
              height={40}
              loader={loader}
              className="object-contain max-h-[45px]"
            />
          ) : (
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {name}
            </span>
          )}
        </Link>

        {/* DESKTOP LINKS */}
        <nav className="hidden md:flex items-center space-x-8 text-gray-800 dark:text-gray-100">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={`/${slug}${link.href}`}
              className="relative text-lg font-medium group"
            >
              {link.name}
              <span className="absolute left-0 bottom-[-4px] w-0 h-[3px] bg-teal-600 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}

          {/* SEARCH */}
          <div className="relative">
            <button
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
              onClick={() => setShowSearch(!showSearch)}
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            <AnimatePresence>
              {showSearch && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  placeholder="Search..."
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full"
                />
              )}
            </AnimatePresence>
          </div>

          {/* THEME TOGGLE */}
          <button
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </nav>

        {/* AUTH + MOBILE TOGGLE */}
        <div className="flex items-center space-x-4">
          {/* AUTH */}
          {user ? (
            <button onClick={handleUserAction} className="font-medium">
              {user.name || "Profile"}
            </button>
          ) : (
            <>
              <button
                onClick={handleGoogleSignIn}
                className="px-4 py-2 rounded-full text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Login
              </button>
              <button
                onClick={handleGoogleSignUp}
                className="px-4 py-2 rounded-full font-medium border"
                style={{ color: primaryColor, borderColor: primaryColor }}
              >
                Register
              </button>
            </>
          )}

          {/* MOBILE ICON */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3CenterLeftIcon className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* ---------- MOBILE DRAWER ---------- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-900 shadow-xl p-6 flex flex-col z-50"
          >
            <button onClick={() => setMobileOpen(false)} className="mb-6">
              <XMarkIcon className="w-6 h-6" />
            </button>

            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  onClick={() => setMobileOpen(false)}
                  href={`/${slug}${link.href}`}
                  className="text-lg font-semibold"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t dark:border-gray-700">
              {user ? (
                <>
                  <button onClick={handleUserAction} className="block w-full text-left py-2">
                    Profile
                  </button>
                  <button onClick={() => signOut()} className="block w-full text-left py-2 text-red-600">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleGoogleSignIn} className="block w-full text-left py-2">
                    Login
                  </button>
                  <button onClick={handleGoogleSignUp} className="block w-full text-left py-2">
                    Register
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
