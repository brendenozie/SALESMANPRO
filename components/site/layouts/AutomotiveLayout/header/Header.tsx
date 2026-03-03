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
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  
  // Scroll Logic for dynamic styling
  const { scrollY } = useScroll();
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(0,0,0,0)", "rgba(5,5,5,0.8)"]
  );
  const headerBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(20px)"]
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 100],
    ["border-bottom: 1px solid rgba(255,255,255,0)", "border-bottom: 1px solid rgba(255,255,255,0.1)"]
  );

  const navItems = [
    { label: "Inventory", href: "/listings" },
    { label: "Collections", href: "/categories" },
    { label: "Services", href: "/services" },
  ];

  return (
    <motion.header
      style={{ backgroundColor: headerBg, backdropFilter: headerBlur }}
      className="fixed inset-x-0 top-0 z-[100] transition-all duration-300 border-b border-transparent"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-24">
          
          {/* 1. BRANDING */}
          <div className="flex items-center gap-12">
            <Link href={`/site/${data.slug}`} className="relative group">
              {data.logoUrl ? (
                <div className="relative h-10 w-32 transition-transform duration-500 group-hover:scale-110">
                  <Image
                    src={data.logoUrl}
                    alt={data.name}
                    loader={({ src }) => src} // Use the URL directly
                    unoptimized
                    width={40}
                    height={40}
                    // fill
                    className="object-contain brightness-0 invert" // Forces logo to white for dark theme
                  />
                </div>
              ) : (
                <span className="text-2xl font-[1000] tracking-tighter text-white italic uppercase">
                  {data.name || "PRESTIGE"}
                </span>
              )}
              <motion.div 
                className="absolute -bottom-1 left-0 h-[2px] bg-blue-500"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={`/site/${data.slug}${item.href}`}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 2. ACTIONS */}
          <div className="flex items-center gap-6">
            
            {/* Search Trigger */}
            <div className="hidden md:flex items-center">
              <AnimatePresence>
                {isSearchVisible && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden mr-2"
                  >
                    <input
                      autoFocus
                      placeholder="SEARCH INVENTORY..."
                      className="w-full bg-white/5 border border-white/10 rounded-full py-2 px-5 text-[10px] font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                {isSearchVisible ? <XMarkIcon className="h-5 w-5" /> : <MagnifyingGlassIcon className="h-5 w-5" />}
              </button>
            </div>

            {/* Auth / Profile Section */}
            <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-white/10">
              {!user ? (
                <button
                  onClick={() => router.push("https://auth.salesmanpro.site/signin")}
                  className="text-[10px] font-black uppercase tracking-widest text-white px-6 py-2.5 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all"
                >
                  Membership
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/site/${data.slug}/automotive/profile`)}
                  className="group flex items-center gap-3"
                >
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-white/40 uppercase">Verified Member</p>
                    <p className="text-[11px] font-black text-white uppercase tracking-tight">{user.name}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full border-2 border-blue-500/30 p-0.5 overflow-hidden">
                    <Image 
                       src={user.image || "https://ui-avatars.com/api/?name=" + user.name} 
                       width={40} height={40} alt="User" className="rounded-full object-cover"
                       loader={({ src }) => src} unoptimized 

                    />
                  </div>
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-3 rounded-xl bg-white/5 border border-white/10 text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3BottomRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE OVERLAY (Full Screen) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-[#050505] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-xl font-black italic text-white uppercase tracking-tighter">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-white/5 rounded-full text-white">
                <XMarkIcon className="h-8 w-8" />
              </button>
            </div>

            <nav className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="text-5xl font-black text-white uppercase italic tracking-tighter hover:text-blue-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto pt-12 border-t border-white/10">
               <button className="w-full py-6 bg-blue-600 rounded-2xl text-white font-black uppercase tracking-widest">
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