"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useStateContext } from "../../../../../contexts/ContextProvider";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface HeaderProps {
  store: any;
}

const Header: React.FC<HeaderProps> = ({ store }) => {
  const { cart } = useStateContext();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const primary = store.themeSettings?.primaryColor || "#f97316";

  const sections = [
    { id: "hero", label: "Home" },
    { id: "services", label: "Services" },
    { id: "featured", label: "Featured" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed w-full z-50 top-0 left-0">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-lg shadow-md" : "bg-transparent"
        }   py-4`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Link href={`/${store.slug}`} className="flex items-center space-x-2">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  loader={loader}
                  alt={store.name}
                  width={120}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-900">{store.name}</span>
              )}
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="px-4 py-2 text-sm font-medium text-white bg-black/40 backdrop-blur-md rounded-full hover:bg-black/70 transition-all duration-200"
              >
                {label}
              </a>
            ))}

            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-full bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
            </div>
          </div>

          {/* Hamburger */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="text-gray-700 hover:text-black focus:outline-none"
            >
              {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden bg-white/90 backdrop-blur-lg shadow-md"
            >
              <nav className="flex flex-col p-6 space-y-4">
                {sections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="text-gray-700 font-medium hover:text-black"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

export default Header;
