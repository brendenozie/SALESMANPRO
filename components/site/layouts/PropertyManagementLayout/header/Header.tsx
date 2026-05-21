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
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/solid";
import { useStateContext } from "@/contexts/ContextProvider";
import { useStoreContext } from "@/contexts/StoreContext";
import { useRouter } from "next/navigation";

// AUTH
import { useSession, signOut } from "next-auth/react";

// Fallback sample
const defaultStoreData = {
  name: "DreamNest Realty",
  slug: "dreamnest",
  logoUrl: "/logos/dreamnest-logo.png",
  contactPhone: "+254 712 345 678",
  contactEmail: "info@dreamnest.com",
  socialLinks: [
    { channel: "facebook", url: "https://facebook.com/dreamnestrealty" },
    { channel: "twitter", url: "https://twitter.com/dreamnestrealty" },
    { channel: "instagram", url: "https://instagram.com/dreamnestrealty" },
  ],
  themeSettings: {
    primaryColor: "#10B981",
    secondaryColor: "#F59E0B",
  },
};

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();

  const {
    name,
    slug,
    logoUrl,
    contactPhone,
    contactEmail,
    socialLinks,
    themeSettings,
  } = { ...defaultStoreData, ...storeFormData };

  const primaryColor = themeSettings?.primaryColor || "#10B981";
  const secondaryColor = themeSettings?.secondaryColor || "#F59E0B";

  // AUTH SESSION
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

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
      router.push(`/dashboards`);
    } else {
      router.push(`/realestate/profile`);
    }
  };

  // UI STATE
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const linkVariants = {
    hover: { width: "100%", transition: { duration: 0.3 } },
    initial: { width: "0%" },
  };

  const handleLinkClick = (path: string) => {
    setMobileMenu(false);
    router.push(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-100 dark:border-gray-800">
      {/* TOP BAR */}
      <div className="hidden md:flex justify-between items-center px-6 py-2 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-gray-850 dark:to-gray-800 text-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6 text-gray-700 dark:text-gray-300">
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="flex items-center space-x-2 hover:text-emerald-600">
              <PhoneIcon className="w-4 h-4" />
              <span>{contactPhone}</span>
            </a>
          )}
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center space-x-2 hover:text-emerald-600">
              <EnvelopeIcon className="w-4 h-4" />
              <span>{contactEmail}</span>
            </a>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-600 dark:text-gray-400">Follow Us:</span>
          {socialLinks?.map((link: any) => (
            <Link key={link.channel} href={link.url} target="_blank" className="hover:text-amber-600">
              <GlobeAltIcon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href={``}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={160}
                height={50}
                loader={loader}
                className="object-contain  h-8 w-32"
                priority
              />
            ) : (
              <span className="text-3xl font-extrabold text-emerald-600">{name}</span>
            )}
          </Link>
        </motion.div>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center space-x-8">
          {[
            { label: "Home", path: "" },
            { label: "Listings", path: `#listings` },
            { label: "Agents", path: `#agents` },
            { label: "About", path: `#about` },
            { label: "Blog", path: `#blog` },
            { label: "Contact", path: `#contact` },
          ].map((item) => (
            <Link
              key={item.label}
              href={`/${slug}${item.path}`}
              className="relative text-gray-700 uppercase tracking-wide font-medium text-lg group hover:text-emerald-600"
            >
              {item.label}
              <motion.span className="absolute left-0 bottom-[-4px] h-[3px] bg-emerald-600" variants={linkVariants} initial="initial" whileHover="hover" />
            </Link>
          ))}

          {/* SEARCH */}
          <div className="relative">
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-800"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            <AnimatePresence>
              {showSearchInput && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 250, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2"
                >
                  <input
                    type="text"
                    placeholder="Search listings..."
                    className="pl-10 pr-4 py-2 w-full rounded-full bg-gray-100"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push(`/realestate/listings?q=${e.currentTarget.value.trim()}`);
                        setShowSearchInput(false);
                      }
                    }}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* AUTH + MOBILE TOGGLE */}
        <div className="flex items-center space-x-6">
          {/* AUTH */}
          {user ? (
            <div className="flex items-center space-x-4">
              <button onClick={handleUserAction} className="font-medium text-gray-700">
                {user.name || "Profile"}
              </button>
              <button onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })} className="text-red-600 font-semibold">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGoogleSignIn}
                className="px-4 py-1 text-sm font-medium rounded-md text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Login
              </button>
              <button
                onClick={handleGoogleSignUp}
                className="px-4 py-1 text-sm font-medium rounded-md border"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Register
              </button>
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <button
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <XMarkIcon className="w-7 h-7" /> : <Bars3BottomLeftIcon className="w-7 h-7" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-2xl p-6 flex flex-col z-50"
          >
            <div className="flex justify-end mb-6">
              <button onClick={() => setMobileMenu(false)}>
                <XMarkIcon className="w-7 h-7" />
              </button>
            </div>

            <nav className="flex flex-col space-y-6">
              {["home", "listings", "agents", "about", "blog", "contact"].map((item) => (
                <button
                  key={item}
                  onClick={() => handleLinkClick(`#${item}`)}
                  className="text-lg font-semibold capitalize text-gray-800"
                >
                  {item}
                </button>
              ))}
            </nav>

            {/* AUTH IN MOBILE */}
            <div className="mt-auto pt-6 border-t">
              {user ? (
                <>
                  <button onClick={handleUserAction} className="block w-full text-left py-2">
                    Profile
                  </button>
                  <button
                    onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })}
                    className="block w-full text-left py-2 text-red-600"
                  >
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
