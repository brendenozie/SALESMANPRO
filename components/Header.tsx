"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bars3BottomRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import fit1 from "@/assets/fit1.png";
import { useOnClickOutside } from "usehooks-ts";
import classNames from "classnames";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(navRef, () => setMenuOpen(false));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY >= 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Solutions", href: "#solutions" },
    { name: "Pricing", href: "#pricing" },
  ];

  const handleAuth = (type: "signin" | "signup") => {
    const url = new URL(`https://auth.salesmanpro.site/${type}`);
    url.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = url.toString();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-4 sm:px-8 pt-4 pointer-events-none">
      <div
        className={classNames(
          "max-w-7xl mx-auto transition-all duration-500 pointer-events-auto",
          "flex items-center justify-between px-6 py-3 rounded-2xl border",
          scrolled
            ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-2xl border-white/20 dark:border-slate-800/50 py-3"
            : "bg-transparent border-transparent py-5"
        )}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <img
              src={fit1.src}
              alt="Logo"
              className="w-8 h-8 md:w-9 md:h-9 object-contain group-hover:rotate-12 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white transition-colors">
            Salesman<span className="text-orange-600">Pro</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/40 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-4 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {!session ? (
              <>
                <button
                  onClick={() => handleAuth("signin")}
                  className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-orange-600 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleAuth("signup")}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  Get Started
                </button>
              </>
            ) : (
              <Link
                href="/dashboards"
                className="px-5 py-2.5 text-sm font-bold text-white bg-orange-600 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition-all"
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 rounded-xl"
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3BottomRightIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl lg:hidden pointer-events-auto"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-2xl font-bold text-slate-900 dark:text-white hover:text-orange-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-slate-100 dark:border-slate-800 my-2" />
              {!session ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleAuth("signin")}
                    className="w-full py-4 text-center font-bold text-slate-600 dark:text-slate-400"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleAuth("signup")}
                    className="w-full py-4 text-center font-bold text-white bg-orange-600 rounded-2xl"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <Link
                  href="/dashboards"
                  className="w-full py-4 text-center font-bold text-white bg-orange-600 rounded-2xl"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;