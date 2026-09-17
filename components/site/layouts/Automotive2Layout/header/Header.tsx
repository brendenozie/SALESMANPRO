"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Bars3BottomRightIcon,
  XMarkIcon,
  UserIcon,
  SparklesIcon,
  MapPinIcon,
  PhoneIcon,
  CheckBadgeIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StoreForm } from "@/types/typings";
import StoreHeaderSearch from "@/components/search/StoreHeaderSearch";

interface HeaderProps {
  storeFormData?: StoreForm;
}

/* -------------------------------------------------------------------------- */
/* WhatsApp Brand Icon */
/* -------------------------------------------------------------------------- */
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.658 1.435 5.63 1.435h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ storeFormData }) => {
  const data = storeFormData || ({} as StoreForm);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; image?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync initial theme mode preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  };

  const { scrollY } = useScroll();

  // Dynamic Transformations tailored for light and dark dynamic overlays
  const bgOpacity = useTransform(
    scrollY,
    [0, 60],
    [
      isDarkMode ? "rgba(8, 11, 16, 0.75)" : "rgba(255, 255, 255, 0.8)",
      isDarkMode ? "rgba(8, 11, 16, 0.95)" : "rgba(255, 255, 255, 0.95)",
    ]
  );
  const headerBlur = useTransform(scrollY, [0, 60], ["blur(12px)", "blur(24px)"]);
  const headerHeight = useTransform(scrollY, [0, 60], ["96px", "76px"]);
  const borderColor = useTransform(
    scrollY,
    [0, 60],
    [
      isDarkMode ? "rgba(51, 65, 85, 0.3)" : "rgba(226, 232, 240, 0.8)",
      isDarkMode ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.4)",
    ]
  );

  const phone = data?.contactPhone || data?.phone || "+254 732 771 353";
  const address = data?.address || "Nairobi Yard, Kenya";

  const navItems = [
    { label: "Inventory", href: "/automotive/listings" },
    { label: "Categories", href: "/automotive/categories" },
    { label: "Services", href: "/automotive/services" },
    { label: "Financing", href: "/automotive/financing" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/automotive/listings?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] flex flex-col">
      {/* 1. TOP HERO UTILITY BAR */}
      <div className="hidden sm:flex items-center justify-between px-4 sm:px-6 lg:px-8 py-1.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors duration-300">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Live Inventory Yard</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <MapPinIcon className="w-3 h-3 text-rose-500" />
            <span>{address}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            <PhoneIcon className="w-3 h-3 text-amber-500" />
            <span>{phone}</span>
          </a>

          <a
            href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors"
          >
            <WhatsAppIcon className="w-3 h-3" />
            <span>WhatsApp Dealership</span>
          </a>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION HEADER */}
      <motion.div
        style={{
          height: headerHeight,
          backdropFilter: headerBlur,
          backgroundColor: bgOpacity,
          borderColor: borderColor,
        }}
        className="relative w-full border-b transition-colors duration-300 flex items-center"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/3 w-64 h-full bg-amber-500/5 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo & Main Links */}
          <div className="flex items-center gap-8 lg:gap-10">
            <Link href="/automotive" className="relative group flex items-center gap-3">
              {data.logoUrl ? (
                <div className="relative h-11 w-28 sm:w-36 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={data.logoUrl}
                    alt={data.name || "Brand Logo"}
                    loader={({ src }) => src}
                    unoptimized
                    fill
                    className="object-contain filter dark:brightness-110"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20">
                    <SparklesIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    {data.name ? (
                      data.name
                    ) : (
                      <>
                        <span>TRUCK</span>
                        <span className="text-amber-500">HUB</span>
                      </>
                    )}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors group py-1.5"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-amber-500 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Search, Theme Toggle & User Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Pill */}
            <div className="hidden md:flex items-center">
              <StoreHeaderSearch
                variant="pill"
                placeholder="Search fleet stock..."
                buttonClassName="rounded-xl border-slate-300 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-900/90 text-xs"
                iconClassName="h-4 w-4 text-amber-500"
              />
            </div>

            {/* Verification Badge Marker */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <CheckBadgeIcon className="w-4 h-4 text-amber-500" />
              <span>Verified Fleet</span>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? (
                <SunIcon className="w-4 h-4 text-amber-400" />
              ) : (
                <MoonIcon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* User Auth Button */}
            <div className="hidden lg:flex items-center">
              {!user ? (
                <button
                  onClick={() => router.push("https://auth.salesmanpro.site/signin")}
                  className="text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-500 hover:bg-amber-400 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={() => router.push("/automotive/profile")}
                  className="group flex items-center gap-3 bg-slate-100 dark:bg-slate-900 pl-3.5 pr-1.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-800 hover:border-amber-500/50 transition-all"
                >
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">
                      {user.name}
                    </p>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-wider">
                      Verified Account
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/30 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                    {user.image ? (
                      <Image
                        src={user.image}
                        width={32}
                        height={32}
                        alt="User Profile"
                        className="object-cover h-full w-full"
                        loader={({ src }) => src}
                        unoptimized
                      />
                    ) : (
                      <UserIcon className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle Navigation Menu"
            >
              <Bars3BottomRightIcon className="h-6 w-6 text-amber-500" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3. MOBILE DRAWER OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl flex flex-col p-6 text-slate-900 dark:text-white"
          >
            <div className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800 mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-amber-500">
                Fleet Marketplace Navigation
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-800"
                >
                  {isDarkMode ? (
                    <SunIcon className="h-5 w-5 text-amber-400" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-slate-700" />
                  )}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-800"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="mb-8">
              <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-800 focus-within:border-amber-500">
                <MagnifyingGlassIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fleet stock..."
                  className="bg-transparent border-none outline-none text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full"
                />
              </div>
            </form>

            <nav className="flex flex-col gap-5">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={item.href}
                    className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-amber-500/80 font-mono">0{i + 1}</span>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Contact Dealership Direct</span>
              </a>

              {!user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("https://auth.salesmanpro.site/signin");
                  }}
                  className="w-full py-4 bg-amber-500 rounded-xl text-slate-950 font-black uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                >
                  Login to Account
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push("/automotive/profile");
                  }}
                  className="w-full py-4 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-bold uppercase tracking-wider flex items-center justify-center gap-3"
                >
                  <UserIcon className="h-5 w-5 text-amber-500" />
                  <span>My Profile ({user.name})</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;