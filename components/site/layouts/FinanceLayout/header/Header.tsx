"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useStateContext } from "@/contexts/ContextProvider";
import { useStoreContext } from "@/contexts/StoreContext";

// --- Utility helpers ---
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default function FinanceHeader() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  const {
    slug = "",
    name = "CapitalEdge",
    logoUrl = "https://placehold.co/140x48/ffffff/000000?text=Logo",
    themeSettings = {},
    socialLinks = [],
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || "#2563EB"; // blue-600
  const secondary = themeSettings?.secondaryColor || "#9333EA"; // purple-600

  const navLinks = [
    { label: "Home", href: `#home` },
    { label: "Services", href: `#services` },
    { label: "Why Us", href: `#whyus` },
    { label: "Testimonials", href: `#testimonials` },
    { label: "Contact", href: `#contact` },
  ];

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Outside click for search & menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(e.target as Node))
        setSearchOpen(false);
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !mobileToggleRef.current?.contains(e.target as Node)
      )
        setMobileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, searchOpen]);

  // Lock body scroll on mobile open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  // Debounced search
  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) console.log("FinanceHeader search:", query);
    }, 300),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  // Auth actions
  const handleUserAction = () => {
    if (!user) {
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", `${window.location.origin}/site/${slug}/finance`);
      window.location.href = authUrl.toString();
    } else if (user.role === "admin") {
      router.push("/dashboards");
    } else {
      router.push(`/site/${slug}/finance/profile`);
    }
  };

  const handleSignOut = () => signOut({ callbackUrl: `/site/${slug}/finance` });

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: ${primary};
          --secondary-color: ${secondary};
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 font-sans">
        {/* === LIGHT GLASS HEADER === */}
     <motion.div
        initial={{ backgroundColor: "rgba(255,255,255,0)" }}
        animate={{
          backgroundColor: scrolled
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0)",
          backdropFilter: scrolled ? "blur(10px)" : "blur(0px)",
          WebkitBackdropFilter: scrolled ? "blur(10px)" : "blur(0px)",
          mixBlendMode: scrolled ? "normal" : "difference",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={clsx(
          "absolute inset-x-0 top-0 h-20 border-b transition-all duration-300",
          scrolled ? "border-gray-200 shadow-lg" : "border-transparent"
        )}
      >

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Brand */}
            <Link href="#" className="flex items-center space-x-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={140}
                  height={48}
                  className="object-contain h-12 w-36"
                  loader={imageLoader}
                />
              ) : (
                <span
                  className={`text-2xl font-extrabold ${
                    scrolled ? "text-gray-900" : "text-gray-800"
                  }`}
                >
                  {name}
                </span>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex space-x-8">
              {navLinks.map((item) => (
                <motion.div key={item.label} whileHover={{ y: -2 }}>
                  <Link
                    href={item.href}
                    className={`font-medium relative group text-gray-700 hover:text-gray-900`}
                  >
                    {item.label}
                    <span
                      className="absolute left-0 -bottom-1 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
                      }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 hover:text-[var(--primary-color)]"
                onClick={() => setSearchOpen((p) => !p)}
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </motion.button>

              {/* Profile */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="text-gray-700 hover:text-[var(--primary-color)]"
                onClick={handleUserAction}
              >
                <UserIcon className="h-6 w-6" />
              </motion.button>

              {/* Mobile Toggle */}
              <button
                ref={mobileToggleRef}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <XMarkIcon className="h-6 w-6 text-gray-700" />
                ) : (
                  <Bars3BottomLeftIcon className="h-6 w-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Search Box */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-4 top-20 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg w-64 p-2 flex items-center"
                ref={searchInputRef}
              >
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={onSearchChange}
                  className="flex-1 px-3 py-2 text-sm text-gray-800 focus:outline-none bg-transparent placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1 text-gray-500 hover:text-gray-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.nav
                ref={mobileMenuRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="lg:hidden bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-xl rounded-b-3xl mt-20 overflow-hidden"
              >
                <div className="px-6 py-6 space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-gray-800 font-medium py-2 hover:text-[var(--primary-color)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-200 my-3" />

                  {user ? (
                    <>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleUserAction();
                        }}
                        className="w-full px-4 py-2 rounded-lg text-white font-medium shadow-md"
                        style={{ backgroundColor: primary }}
                      >
                        {user.role === "admin" ? "Admin Portal" : "My Account"}
                      </button>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleSignOut();
                        }}
                        className="w-full mt-2 text-gray-600 underline hover:text-[var(--primary-color)]"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleUserAction();
                      }}
                      className="w-full px-4 py-2 rounded-lg text-gray-800 hover:bg-gray-100 border font-medium"
                    >
                      Log In
                    </button>
                  )}

                  <div className="border-t border-gray-200 my-3" />

                  <div className="flex space-x-4">
                    {socialLinks.map((s: any) => (
                      <a
                        key={s.channel}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="capitalize text-gray-700 hover:text-[var(--secondary-color)] transition-colors"
                      >
                        {s.channel}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </header>
    </>
  );
}
