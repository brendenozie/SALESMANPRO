"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const defaultStoreData = {
  name: "YourBrand",
  slug: "yourbrand",
  logoUrl: "",
  themeSettings: {
    primaryColor: "#f97316",
  },
};

const loader = ({ src }: any) => src;

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const data = { ...defaultStoreData, ...storeFormData };
  const { name, logoUrl, themeSettings } = data;
  
  const primaryColor = themeSettings?.primaryColor || "#f97316";

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Framer Motion continuous scroll animations
  const { scrollY } = useScroll();
  const headerWidth = useTransform(scrollY, [0, 80], ["100%", "94%"]);
  const headerTop = useTransform(scrollY, [0, 80], ["0px", "6px"]);
  const headerRadius = useTransform(scrollY, [0, 80], ["0px", "9999px"]);
  const headerBg = useTransform(
    scrollY, 
    [0, 80], 
    ["rgba(0, 0, 0, 0)", "rgba(10, 10, 10, 0.75)"]
  );
  const headerBorder = useTransform(
    scrollY,
    [0, 80],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.08)"]
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
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
      style={{ 
        width: headerWidth, 
        top: headerTop, 
        borderRadius: headerRadius,
        backgroundColor: headerBg,
        borderColor: headerBorder
      }}
      className={`fixed inset-x-0 mx-auto z-[60]  border transition-all duration-300 ${
        scrolled 
          ? "py-2.5 px-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]" 
          : "py-4 px-8"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO SECTION */}
        <Link href={`/`} className="relative z-10 shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={130}
              height={40}
              loader={loader}
              className={`object-contain transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}
            />
          ) : (
            <span className="text-xl font-black text-white tracking-tighter italic uppercase">
              {name}<span style={{ color: primaryColor }}>.</span>
            </span>
          )}
        </Link>

        {/* CENTER NAV: SUPER-SLEEK PILL DESIGN */}
        <nav className="hidden lg:flex items-center space-x-0.5 bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-1 rounded-full">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE: COMPACT UTILITIES */}
        <div className="flex items-center space-x-2">
          {/* SEARCH ICON */}
          <button className="hidden sm:flex p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />
          
          {/* AUTHENTICATION / PROFILE */}
          {user ? (
            <button 
              onClick={handleUserAction}
              className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 p-0.5 pr-3 rounded-full border border-white/5 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center overflow-hidden">
                {user.image ? (
                  <Image src={user.image} alt="avatar" width={28} height={28} loader={loader} />
                ) : (
                  <UserIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider hidden md:block">
                {user.name?.split(' ')[0] || "Account"}
              </span>
            </button>
          ) : (
            <button
              onClick={handleUserAction}
              className="group relative px-5 py-2 overflow-hidden rounded-full bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all"
            >
              <span className="relative z-10">Join Club</span>
            </button>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button 
            className="lg:hidden p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Bars3BottomRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MOBILE FULL-SCREEN OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl p-6 flex flex-col justify-center items-center"
          >
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-3 bg-white/5 rounded-full text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col space-y-6 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={link.name}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-3xl font-black text-white uppercase italic tracking-tighter hover:text-orange-500 transition-colors"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              {user && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { signOut({ redirect: true, callbackUrl: "/" }); setMobileOpen(false); }}
                  className="pt-6 text-orange-500 font-bold uppercase tracking-[0.2em] text-xs"
                >
                  Sign Out
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}