"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
// import { StoreContext } from "../path/to/StoreContext"; // adjust to your actual context path
import { SunIcon, MoonIcon, Bars3CenterLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useStoreContext } from "../../../../../contexts/StoreContext";

export default function Header() {
  const { storeFormData } = useStoreContext();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle dark mode on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  if (!storeFormData) return null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Programs", href: "/programs" },
    { name: "Trainers", href: "/trainers" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="absolute top-0 inset-x-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo / Site Name */}
        <Link href="/" className="text-white text-2xl font-bold tracking-wider">
          {storeFormData.name}
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="ml-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? (
              <SunIcon className="w-5 h-5 text-white" />
            ) : (
              <MoonIcon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? (
              <XMarkIcon className="w-6 h-6 text-white" />
            ) : (
              <Bars3CenterLeftIcon className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="px-6 pt-4 pb-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block text-white text-lg hover:text-gray-200 transition"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center space-x-2 mt-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <>
                  <SunIcon className="w-5 h-5 text-white" />
                  <span className="text-white">Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon className="w-5 h-5 text-white" />
                  <span className="text-white">Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
