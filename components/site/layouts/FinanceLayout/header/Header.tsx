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
} from "@heroicons/react/24/outline";
import { useSession, signOut } from "next-auth/react";
import { useStateContext } from "@/contexts/ContextProvider";
import { useStoreContext } from "@/contexts/StoreContext";
import StoreHeaderSearch from "@/components/search/StoreHeaderSearch";

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

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

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

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
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

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

  const primary = themeSettings?.primaryColor || "#2563EB";

  const navLinks = [
    { label: "Home", href: `#home` },
    { label: "Services", href: `#services` },
    { label: "Why Us", href: `#whyus` },
    { label: "Testimonials", href: `#testimonials` },
    { label: "Contact", href: `#contact` },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        mobileOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !mobileToggleRef.current?.contains(e.target as Node)
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
  }, [mobileOpen]);

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
      <header className="fixed inset-x-0 top-0 z-50 font-sans transition-all duration-300">
        <motion.div
          animate={{
            backgroundColor: scrolled ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0)",
            backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
            WebkitBackdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
            borderBottomColor: scrolled ? "rgba(241, 245, 249, 1)" : "rgba(241, 245, 249, 0)",
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 top-0 h-20 border-b flex items-center transition-all"
          style={{ borderBottomWidth: "1px" }}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
            
            {/* LOGO AREA */}
            <Link href="#" className="flex items-center gap-2 group z-10">
              {logoUrl && !logoUrl.includes("placehold.co") ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={130}
                  height={40}
                  loader={imageLoader}
                  className="object-contain max-h-10 w-auto"
                />
              ) : (
                <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primary }} />
                  {name}
                </span>
              )}
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center space-x-1 relative">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredLink(item.label)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-4 py-2 text-xs font-mono font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  <span className="relative z-10">{item.label}</span>
                  {hoveredLink === item.label && (
                    <motion.span
                      layoutId="navHoverCapsule"
                      className="absolute inset-0 bg-slate-50 border border-slate-100/60 rounded-xl z-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ACTION CENTER */}
            <div className="flex items-center space-x-3 z-10">
              {/* SEARCH TRIGGER */}
              <StoreHeaderSearch
                variant="button"
                className="p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100"
              />

              {/* SECURITY / ACCOUNT MANAGEMENT */}
              {!user ? (
                <div className="hidden lg:flex items-center space-x-2 border-l border-slate-100 pl-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase text-white rounded-xl shadow-sm hover:shadow transition-all duration-200"
                    style={{ backgroundColor: primary }}
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-3 border-l border-slate-100 pl-3">
                  <button
                    onClick={handleProfileClick}
                    className="text-xs font-mono font-bold tracking-wider uppercase text-slate-700 hover:text-slate-950 transition-colors"
                  >
                    {user.name || "Profile"}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-mono font-bold tracking-wider uppercase text-red-500 hover:text-red-600 transition-colors"
                  >
                    Exit
                  </button>
                </div>
              )}

              {/* RESPONSIVE TOGGLE */}
              <button
                ref={mobileToggleRef}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                aria-label="Toggle structural menu"
              >
                {mobileOpen ? (
                  <XMarkIcon className="h-5 w-5 stroke-[2]" />
                ) : (
                  <Bars3BottomLeftIcon className="h-5 w-5 stroke-[2]" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* === ARCHITECTURAL SLIDE-DOWN SEARCH WINDOW === */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute inset-x-0 top-0 bg-white border-b border-slate-200 shadow-xl z-50 h-24 flex items-center"
            >
              <div className="max-w-4xl mx-auto w-full px-4 flex items-center gap-4">
                <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 flex-shrink-0 stroke-[2.5]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Type parameters, workflows or legal documents to search..."
                  className="flex-1 bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-medium tracking-wide"
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-900 rounded-lg transition-all"
                >
                  Close [Esc]
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* === MINIMALIST MOBILE OVERLAY DIRECTORY === */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              ref={mobileMenuRef}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-x-4 top-24 bg-white/95 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-40"
            >
              <div className="p-6 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-xs font-mono font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-slate-100 my-4" />

                {/* ACCOUNT STRATEGY INSIDE MOBILE DRAWER */}
                {!user ? (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleGoogleSignIn();
                      }}
                      className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleGoogleSignUp();
                      }}
                      className="w-full py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase text-white shadow-sm transition-all"
                      style={{ backgroundColor: primary }}
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleProfileClick();
                      }}
                      className="block w-full text-left py-2.5 px-3 text-xs font-mono font-bold tracking-wider uppercase text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                      {user.name || "Profile Dashboard"}
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left py-2.5 px-3 text-xs font-mono font-bold tracking-wider uppercase text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Logout Securely
                    </button>
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}