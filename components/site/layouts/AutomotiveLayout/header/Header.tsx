"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Bars3BottomRightIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { StoreForm } from "@/types/typings";

interface HeaderProps {
  storeFormData?: StoreForm;
}

const Header: React.FC<HeaderProps> = ({ storeFormData }) => {
  const data = storeFormData || ({} as StoreForm);
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; image?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Dynamic Scroll Transformations
  const { scrollY } = useScroll();
  
  // Transition from transparent to frosted glass
  const headerBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(5, 5, 5, 0)", "rgba(255, 255, 255, 0.7)"] // Light mode fallback
  );
  const darkHeaderBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(5, 5, 5, 0)", "rgba(5, 5, 5, 0.8)"]
  );
  const headerBlur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(24px)"]);
  const headerHeight = useTransform(scrollY, [0, 80], ["100px", "80px"]);
  const borderColor = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255,255,255,0)", "rgba(100,100,100,0.1)"]
  );

  const navItems = [
    { label: "Inventory", href: "/automotive/listings" },
    { label: "Collections", href: "/automotive/categories" },
    { label: "Services", href: "/automotive/services" },
  ];

  return (
    <motion.header
      style={{ 
        height: headerHeight,
        backdropFilter: headerBlur,
        borderColor: borderColor
      }}
      className="fixed inset-x-0 top-0 z-[100] flex items-center transition-colors duration-500 border-b bg-transparent dark:bg-transparent"
    >
      {/* 
         Note: We use a CSS variable or Tailwind 'dark' class on the body 
         to switch between 'headerBg' and 'darkHeaderBg' if necessary.
         For simplicity, we use a class-based approach below.
      */}
      <motion.div 
        style={{ backgroundColor: darkHeaderBg }} // Defaulting to dark for your luxury theme
        className="absolute inset-0 -z-10" 
      />

      <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 flex items-center justify-between">
        
        {/* 1. BRANDING */}
        <div className="flex items-center gap-16">
          <Link href={`/`} className="relative group">
            {data.logoUrl ? (
              <div className="relative h-8 w-32 transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={data.logoUrl}
                  alt={data.name}
                  loader={({ src }) => src}
                  unoptimized
                  fill
                  className="object-contain brightness-0 invert dark:invert"
                />
              </div>
            ) : (
              <span className="text-2xl font-[1000] tracking-tighter text-black dark:text-white italic uppercase">
                {data.name || "PRESTIGE"}
              </span>
            )}
          </Link>

          {/* Desktop Nav - Luxury Spacing */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={`${item.href}`}
                className="relative text-[10px] font-black uppercase tracking-[0.3em] text-black/50 dark:text-white/50 hover:text-blue-600 dark:hover:text-white transition-colors group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        {/* 2. ACTIONS */}
        <div className="flex items-center gap-8">
          
          {/* Search Integrated */}
          <div className="hidden md:flex items-center bg-black/5 dark:bg-white/5 rounded-full px-4 py-2 border border-black/5 dark:border-white/10 focus-within:border-blue-500/50 transition-all">
            <MagnifyingGlassIcon className="h-4 w-4 text-black/40 dark:text-white/40" />
            <input
              placeholder="SEARCH ASSETS..."
              className="bg-transparent border-none outline-none ml-3 text-[10px] font-bold text-black dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 w-40 focus:w-56 transition-all"
            />
          </div>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center gap-6">
            {!user ? (
              <button
                onClick={() => router.push("https://auth.salesmanpro.site/signin")}
                className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white px-8 py-3 rounded-full border border-black/10 dark:border-white/20 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all active:scale-95"
              >
                Membership
              </button>
            ) : (
              <button
                onClick={() => router.push(`/automotive/profile`)}
                className="group flex items-center gap-4 bg-black/5 dark:bg-white/5 pl-5 pr-2 py-2 rounded-full border border-transparent hover:border-blue-500/30 transition-all"
              >
                <div className="text-right">
                  <p className="text-[11px] font-black text-black dark:text-white uppercase tracking-tight">{user.name}</p>
                  <p className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Level IV Access</p>
                </div>
                <div className="h-9 w-9 rounded-full border border-black/10 dark:border-white/20 overflow-hidden group-hover:scale-105 transition-transform">
                  <Image 
                     src={user.image || "https://ui-avatars.com/api/?name=" + user.name} 
                     width={36} height={36} alt="User" className="object-cover"
                     loader={({ src }) => src} unoptimized 
                  />
                </div>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-black dark:text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3BottomRightIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* 3. MOBILE OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[110] bg-white/90 dark:bg-[#050505]/95 flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-sm font-black uppercase tracking-[0.5em] dark:text-white">Directory</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-4 bg-black/5 dark:bg-white/5 rounded-full dark:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-6xl font-[1000] text-black dark:text-white uppercase italic tracking-tighter hover:text-blue-600 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto">
               <button className="w-full py-6 bg-blue-600 rounded-3xl text-white font-black uppercase tracking-widest shadow-2xl shadow-blue-500/20">
                 Member Portal
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;