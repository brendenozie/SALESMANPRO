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

// Image loader
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Debounce
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

export default function FinanceHeader() {
  const router = useRouter();
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();

  // --- AUTH ---
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  // Sign-In URL
  const signInUrl = (type: "signin" | "signup") => {
    const url = new URL(`https://auth.salesmanpro.site/${type}`);
    url.searchParams.set("callbackUrl", `${window.location.origin}/finance`);
    return url.toString();
  };

  const handleGoogleSignIn = () => {
    window.location.href = signInUrl("signin");
  };

  const handleGoogleSignUp = () => {
    window.location.href = signInUrl("signup");
  };

  const handleProfileClick = () => {
    if (!user) return handleGoogleSignIn();

    if (user.role?.toLowerCase() === "admin") {
      return router.push("/dashboards");
    }

    return router.push(`/finance/profile`);
  };

  const handleLogout = () => {
    signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` });    
  };

  // UI State
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  // Extract store data
  const {
    slug = "",
    name = "CapitalEdge",
    logoUrl = "https://placehold.co/140x48/ffffff/000000?text=Logo",
    themeSettings = {},
    socialLinks = [],
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || "#2563EB";
  const secondary = themeSettings?.secondaryColor || "#9333EA";

  const navLinks = [
    { label: "Home", href: `#home` },
    { label: "Services", href: `#services` },
    { label: "Why Us", href: `#whyus` },
    { label: "Testimonials", href: `#testimonials` },
    { label: "Contact", href: `#contact` },
  ];

  // Scroll header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside handling
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
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

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen, searchOpen]);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

  // Debounced search
  const handleSearch = useCallback(
    debounce((q: string) => {
      if (q.length > 2) console.log("Searching:", q);
    }, 300),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: ${primary};
          --secondary-color: ${secondary};
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 font-sans">
        <motion.div
          initial={{ backgroundColor: "rgba(255,255,255,0)" }}
          animate={{
            backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0)",
            backdropFilter: scrolled ? "blur(10px)" : "blur(0px)",
            WebkitBackdropFilter: scrolled ? "blur(10px)" : "blur(0px)",
          }}
          transition={{ duration: 0.35 }}
          className={clsx(
            "absolute inset-x-0 top-0 h-20 border-b transition-all",
            scrolled ? "border-gray-200 shadow-lg" : "border-transparent"
          )}
        >
          <div className="max-w-7xl mx-auto h-20 flex items-center justify-between px-4">
            {/* LOGO */}
            <Link href="#" className="flex items-center">
              <Image
                src={logoUrl || "https://placehold.co/140x48/ffffff/000000?text=Logo"}
                alt={name}
                width={150}
                height={48}
                loader={imageLoader}
                className="object-contain h-20 w-32"
              />
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex space-x-8">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative font-medium text-gray-700 hover:text-gray-900 group"
                >
                  {item.label}
                  <span
                    className="absolute left-0 -bottom-1 h-[2px] w-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${primary}, ${secondary})`,
                    }}
                  />
                </Link>
              ))}
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center space-x-4">
              {/* SEARCH */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => setSearchOpen((p) => !p)}
                className="text-gray-700 hover:text-[var(--primary-color)]"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </motion.button>

              {/* AUTH BUTTONS */}
              {!user ? (
                <div className="hidden lg:flex items-center space-x-3">
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
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  <button
                    onClick={handleProfileClick}
                    className="text-gray-700 font-medium"
                  >
                    {user.name || "Profile"}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="text-red-600 font-semibold text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}

              {/* MOBILE TOGGLE */}
              <button
                ref={mobileToggleRef}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-200"
              >
                {mobileOpen ? (
                  <XMarkIcon className="h-7 w-7 text-gray-700" />
                ) : (
                  <Bars3BottomLeftIcon className="h-7 w-7 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* === SEARCH BOX === */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                ref={searchInputRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-4 top-20 bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl p-2 w-64 flex items-center"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Search..."
                  className="flex-1 px-3 py-2 bg-transparent text-gray-800 text-sm focus:outline-none"
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

          {/* === MOBILE MENU === */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.nav
                ref={mobileMenuRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="lg:hidden bg-white/90 backdrop-blur-xl shadow-xl border-t border-gray-200 rounded-b-3xl mt-20 overflow-hidden"
              >
                <div className="px-6 py-6 space-y-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-gray-800 font-medium py-2 hover:text-[var(--primary-color)]"
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-300 my-4" />

                  {/* AUTH INSIDE MOBILE MENU */}
                  {!user ? (
                    <>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleGoogleSignIn();
                        }}
                        className="w-full px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: primary }}
                      >
                        Login
                      </button>

                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleGoogleSignUp();
                        }}
                        className="w-full mt-2 border font-medium py-2 rounded-lg"
                        style={{ borderColor: primary, color: primary }}
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleProfileClick();
                        }}
                        className="block w-full text-left py-2 font-medium"
                      >
                        {user.name || "Profile"}
                      </button>

                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left py-2 text-red-600 font-semibold"
                      >
                        Logout
                      </button>
                    </>
                  )}

                  <div className="border-t border-gray-300 my-4" />

                  {/* SOCIAL LINKS */}
                  <div className="flex space-x-4">
                    {socialLinks?.map((s: any) => (
                      <a
                        key={s.channel}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="capitalize text-gray-700 hover:text-[var(--secondary-color)]"
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
