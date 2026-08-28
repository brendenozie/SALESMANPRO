"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bars3Icon, 
  XMarkIcon, 
  SparklesIcon, 
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Navigation() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const navLinks = [
    { name: "Platform", href: "#platform" },
    { name: "AI Studio", href: "#ai-studio", badge: "New" },
    { name: "WhatsApp", href: "#platform" },
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-4 transition-all duration-300">
      <div
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 py-3 px-6"
            : "bg-transparent py-4 px-6 border border-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
              <SparklesIcon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Salesman<span className="text-orange-600 dark:text-orange-400">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3.5 py-1.5 rounded-full hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all duration-200 flex items-center gap-1.5"
              >
                {link.name}
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 rounded-full border border-orange-500/20 dark:border-orange-400/20">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Action Call To Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!session ? (
              <>
                <button
                  onClick={handleSignIn}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 transition-colors px-4 py-2"
                >
                  Log In
                </button>
                <button
                  onClick={handleSignIn}
                  className="text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-5 py-2 rounded-full shadow-md shadow-orange-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  <span>Start Free</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                </button>
              </>
            ) : (
              <Link
                href="/dashboards"
                className="text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 px-5 py-2 rounded-full shadow-md shadow-orange-600/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <span>Merchant Dashboard</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Animated Mobile Menu Drawer Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden max-w-7xl mx-auto mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <nav className="flex flex-col space-y-2 font-medium text-slate-700 dark:text-slate-200">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-orange-500/10 text-orange-600 rounded-full border border-orange-500/20">
                      {link.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-3">
              {!session ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignIn();
                    }}
                    className="w-full text-center py-3 font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignIn();
                    }}
                    className="w-full text-center py-3 font-bold text-white bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                  >
                    <span>Start Free</span>
                    <ArrowRightIcon className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </>
              ) : (
                <Link
                  href="/dashboards"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 font-bold text-white bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                >
                  <span>Merchant Dashboard</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}