"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bars4Icon, XMarkIcon } from "@heroicons/react/24/solid";
import fit1 from "@/assets/fit1.png"; // Assuming this is the logo
import { useOnClickOutside } from "usehooks-ts";
import classNames from "classnames";
import { motion as Motion } from "framer-motion";

const Header = () => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(navRef, () => setMenuOpen(false));

  useEffect(() => {
    const handleScroll = () => setDark(window.scrollY >= 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={classNames(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        dark ? "bg-white/80 shadow-lg backdrop-blur-md" : "bg-transparent"
      )}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 sm:px-8 min-h-[5rem] md:min-h-[6rem]">
        {/* Logo */}
        <Motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" aria-label="Home" className="flex items-center gap-3">
            <img
              src={fit1.src}
              alt="TulivuApps Logo"
              className="w-10 h-10 md:w-12 md:h-12 object-contain cursor-pointer transition-transform duration-300 hover:scale-110"
            />
            <span
              className={classNames(
                "hidden lg:block text-2xl font-extrabold tracking-tight transition-colors duration-300 text-gray-900" 
              )}
            >
              TulivuApps
            </span>
          </Link>
        </Motion.div>

        {/* Navigation */}
        <nav
          ref={navRef}
          className={classNames(
            "fixed lg:static top-0 right-0 h-screen lg:h-auto w-60 lg:w-auto bg-gray-900 lg:bg-transparent flex flex-col lg:flex-row items-start lg:items-center gap-6 px-6 lg:px-0 py-8 lg:py-0",
            menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            "lg:translate-x-0 lg:opacity-100 transition-all duration-500 ease-in-out"
          )}
        >
          {/* Close Button (Mobile Only) */}
          <button
            aria-label="Close menu"
            onClick={toggleMenu}
            className="absolute top-4 right-4 lg:hidden text-gray-500 hover:text-white"
          >
            <XMarkIcon className="h-7 w-7" />
          </button>

          {/* Navigation Links */}
          <ul className="flex flex-col lg:flex-row gap-8 font-medium text-lg lg:text-sm">
            {navLinks.map((item) => (
              <li key={item.name} onClick={() => setMenuOpen(false)}>
                <Link
                  href={item.href}
                  className={classNames(
                    "relative group transition-all duration-300 text-gray-600 hover:text-red-600" 
                  )}
                >
                  {item.name}
                  <span
                    className={classNames(
                      "absolute bottom-0 left-0 w-0 group-hover:w-full h-[3px] rounded-full transition-all duration-300",
                      dark ? "bg-red-600" : "bg-white"
                    )}
                  ></span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Call-to-Action Buttons */}
          <div className="mt-8 lg:mt-0 flex flex-col lg:flex-row gap-4 lg:ml-8">
            {!session ? (
              <>
                <Link
                  href="/signin"
                  className={classNames(
                    "py-2 px-5 rounded-full text-base font-bold transition-all duration-300 border",
                    dark ? "text-gray-800 border-gray-300 hover:bg-gray-100" : "text-white border-white hover:bg-white hover:text-gray-900"
                  )}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="py-2.5 px-6 rounded-full text-base font-bold text-white bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <Link
                href="/dashboards"
                className="py-2.5 px-6 rounded-full text-base font-bold text-white bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 shadow-lg hover:scale-105 transition-all duration-300"
              >
                Dashboard
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Menu Toggle */}
        <Motion.button
          aria-label="Open menu"
          className={classNames(
            "lg:hidden p-2 rounded-lg transition-colors duration-300 text-gray-900 bg-white/50"
          )}
          onClick={toggleMenu}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Bars4Icon className="h-7 w-7" />
        </Motion.button>
      </div>
    </header>
  );
};

export default Header;