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
import { EditableElement } from "@/contexts/EditableContentContext";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import StoreHeaderSearch from "@/components/search/StoreHeaderSearch";

const defaultStoreData = {
  name: "YourBrand",
  slug: "yourbrand",
  logoUrl: "",
  themeSettings: {
    primaryColor: "#f97316",
  },
};

const loader = ({ src }: { src: string }) => src;

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { scrollY } = useScroll();
  
  // Continuous fluid transformations responsive to scrolling actions
  const headerWidth = useTransform(scrollY, [0, 80], ["100%", "92%"]);
  const headerTop = useTransform(scrollY, [0, 80], ["0px", "12px"]);
  const headerRadius = useTransform(scrollY, [0, 80], ["0px", "24px"]);
  
  // Dynamic background color mapping light and dark states dynamically
  const headerBg = useTransform(
    scrollY, 
    [0, 80], 
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.75)"] // Uses CSS variables or class alternatives downstream if needed
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
    <>
      <motion.header
        style={{ 
          width: headerWidth, 
          top: headerTop, 
          borderRadius: headerRadius,
        }}
        className={`fixed inset-x-0 mx-auto z-[60] border transition-colors duration-500 ${
          scrolled 
            ? "py-3 px-6 bg-white/80 dark:bg-neutral-900/80 border-neutral-200/50 dark:border-neutral-800/50 shadow-lg shadow-neutral-100/40 dark:shadow-black/40" 
            : "py-5 px-8 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LOGO SECTION */}
          <Link href={`/`} className="relative z-10 shrink-0 group flex items-center gap-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                width={120}
                height={35}
                loader={loader}
                className={`object-contain transition-all duration-300  h-20 w-32 ${scrolled ? 'scale-95' : 'scale-100'}`}
              />
            ) : (
              <EditableElement
                targetId="header.storeName"
                componentKey="Header"
                elementKey="storeName"
                label="Store / Brand Name"
                defaultValue={name}
                inline
              >
                {(val) => (
                  <span className="text-xl font-black tracking-tight text-neutral-900 dark:text-white transition-colors duration-300">
                    {val}<span style={{ color: primaryColor }} className="animate-pulse">.</span>
                  </span>
                )}
              </EditableElement>
            )}
          </Link>

          {/* CENTER NAV: INTEGRATED LAYOUT PILL SLIDER */}
          <nav className="hidden lg:flex items-center space-x-1 bg-neutral-100/60 dark:bg-neutral-800/40 border border-neutral-200/40 dark:border-neutral-700/30 p-1.5 rounded-full relative">
            {navLinks.map((link, idx) => (
              <EditableElement
                key={link.name}
                targetId={`header.nav.${idx}.label`}
                componentKey="Header"
                elementKey={`nav.${idx}.label`}
                label={`Nav ${link.name}`}
                defaultValue={link.name}
                inline
              >
                {(val) => (
                  <Link
                    href={link.href}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide relative text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors duration-200"
                  >
                    {hoveredIndex === idx && (
                      <motion.span
                        layoutId="navHoverBg"
                        className="absolute inset-0 bg-white dark:bg-neutral-800 shadow-sm rounded-full z-[-1]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      />
                    )}
                    {val}
                  </Link>
                )}
              </EditableElement>
            ))}
          </nav>

          {/* RIGHT SIDE UTILITIES */}
          <div className="flex items-center space-x-3">
            {/* SEARCH */}
            <StoreHeaderSearch
              variant="button"
              className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60 rounded-full transition-all duration-200"
            />

            <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden sm:block" />
            
            {/* AUTH / PROFILE ACTION */}
            {user ? (
              <button 
                onClick={handleUserAction}
                className="flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-800/60 hover:bg-neutral-200 dark:hover:bg-neutral-800 p-1 pr-3 rounded-full border border-neutral-200/50 dark:border-neutral-700/30 transition-all duration-200 group"
              >
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden border border-white dark:border-neutral-800 shadow-sm">
                  {user.image ? (
                    <Image src={user.image} alt="avatar" width={28} height={28} loader={loader} className="object-cover" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
                  )}
                </div>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors hidden md:block">
                  {user.name?.split(' ')[0] || "Account"}
                </span>
              </button>
            ) : (
              <button
                onClick={handleUserAction}
                style={{ backgroundColor: primaryColor }}
                className="relative px-5 py-2 overflow-hidden rounded-full font-bold text-xs text-white shadow-md shadow-orange-500/10 hover:brightness-110 active:scale-95 transition-all duration-200"
              >
                Join Club
              </button>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button 
              className="lg:hidden p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-800 dark:text-white transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Bars3BottomRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE PREMIUM SLIDE SHEET */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Dimmer Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[99] bg-neutral-950/40 backdrop-blur-sm"
            />

            {/* Panel Sheet */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-[100] bg-white dark:bg-neutral-900 p-8 flex flex-col justify-between shadow-2xl border-l border-neutral-100 dark:border-neutral-800"
            >
              <div>
                <div className="flex justify-between items-center mb-12">
                  <span className="text-lg font-black text-neutral-900 dark:text-white">
                    {name}<span style={{ color: primaryColor }}>.</span>
                  </span>
                  <button 
                    onClick={() => setMobileOpen(false)}
                    className="p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full text-neutral-800 dark:text-white transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col space-y-4">
                  {navLinks.map((link, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      key={link.name}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block text-2xl font-bold text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-colors py-2"
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom Drawer Actions */}
              <div className="space-y-4">
                {!user && (
                  <button
                    onClick={() => { handleUserAction(); setMobileOpen(false); }}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg text-center block transition-transform active:scale-[0.99]"
                  >
                    Join Club
                  </button>
                )}
                {user && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => { signOut({ redirect: true, callbackUrl: "/" }); setMobileOpen(false); }}
                    className="w-full py-3 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-red-500 rounded-xl font-medium text-sm transition-colors text-center"
                  >
                    Sign Out
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}