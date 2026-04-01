"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const defaultStoreData = {
  name: "YourBrand",
  slug: "yourbrand",
  logoUrl: "",
  themeSettings: {
    primaryColor: "#f97316", // Matching the orange from your Hero
  },
};

const loader = ({ src }: any) => src;

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const data = { ...defaultStoreData, ...storeFormData };
  const { name, slug, logoUrl, themeSettings } = data;
  
  const primaryColor = themeSettings?.primaryColor || "#f97316";

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default to dark for the new vibe
  const [scrolled, setScrolled] = useState(false);

  // Scroll logic for the "floating" effect
  const { scrollY } = useScroll();
  const headerWidth = useTransform(scrollY, [0, 100], ["100%", "92%"]);
  const headerTop = useTransform(scrollY, [0, 100], ["0px", "20px"]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Programs", href: "/#programs" },
    { name: "Trainers", href: "/#trainers" },
    { name: "Membership", href: "/#pricing" },
    { name: "Contact", href: "#contact" },
  ];

  const handleUserAction = () => {
    if (!user) {
      const url = new URL("https://auth.salesmanpro.site/signin");
      url.searchParams.set("callbackUrl", window.location.href);
      window.location.href = url.toString();
      return;
    }
    router.push(user.role === "admin" ? "/dashboards" : "/fitness/profile");
  };

  return (
    <motion.header
      style={{ width: headerWidth, top: headerTop }}
      className={`fixed inset-x-0 mx-auto z-[60] transition-all duration-500 rounded-b-[2rem] ${
        scrolled 
          ? "bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 px-6 rounded-[2.5rem]" 
          : "bg-transparent py-6 px-8"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO SECTION */}
        <Link href={`/`} className="relative z-10">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={150}
              height={50}
              loader={loader}
              className={`object-contain transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}
            />
          ) : (
            <span className="text-2xl font-black text-white tracking-tighter italic uppercase">
              {name}<span style={{ color: primaryColor }}>.</span>
            </span>
          )}
        </Link>

        {/* CENTER NAV: PILL DESIGN */}
        <nav className="hidden lg:flex items-center space-x-1 bg-white/5 backdrop-blur-md border border-white/10 p-1.5 rounded-full">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={`/${link.href}`}
              className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE: UTILITIES */}
        <div className="flex items-center space-x-3">
          {/* SEARCH ICON */}
          <button className="hidden sm:flex p-2.5 text-white hover:bg-white/10 rounded-full transition-colors">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>

          {/* AUTHENTICATION / PROFILE */}
          <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />
          
          {user ? (
            <button 
              onClick={handleUserAction}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 p-1 pr-4 rounded-full border border-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <Image src={user.image} alt="avatar" width={32} height={32} />
                ) : (
                  <UserIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-xs font-black text-white uppercase tracking-tight hidden md:block">
                {user.name?.split(' ')[0] || "Account"}
              </span>
            </button>
          ) : (
            <button
              onClick={handleUserAction}
              className="group relative px-6 py-2.5 overflow-hidden rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:pr-10 transition-all"
            >
              <span className="relative z-10">Join Club</span>
              <div 
                className="absolute right-[-20px] top-1/2 -translate-y-1/2 group-hover:right-3 transition-all opacity-0 group-hover:opacity-100"
              >
                <Bars3BottomRightIcon className="w-4 h-4" />
              </div>
            </button>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button 
            className="lg:hidden p-2.5 bg-white/5 rounded-full text-white"
            onClick={() => setMobileOpen(true)}
          >
            <Bars3BottomRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-black backdrop-blur-3xl p-8 flex flex-col justify-center items-center"
          >
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-10 right-10 p-4 bg-white/5 rounded-full text-white"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>

            <div className="flex flex-col space-y-8 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.name}
                >
                  <Link
                    href={`/${link.href}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-4xl font-black text-white uppercase italic tracking-tighter hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => { signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` }); setMobileOpen(false); }}
                className="pt-10 text-orange-500 font-black uppercase tracking-[0.3em] text-xs"
              >
                {user ? "Sign Out" : ""}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}