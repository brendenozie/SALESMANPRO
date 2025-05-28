"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../../../contexts/ContextProvider";

interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  themeSettings: any;
}

interface HeaderProps {
  store: Store;
}

// Dynamic loader for optimized images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const Header: React.FC<HeaderProps> = ({ store }) => {
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const primary = store.themeSettings?.primaryColor || "#f97316";
  const secondary = store.themeSettings?.secondaryColor || "#3b82f6";

  return (
    <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-xl border-b border-gray-200 py-4 shadow-md transition-all">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt="Logo" width={40} height={40} className="rounded-full" loader={loader}/>
          ) : (
            <span className="text-2xl font-extrabold text-gray-800">Insightful</span>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
          {["Home", "Blog", "About", "Contact"].map((label) => (
            <Link
              key={label}
              href={label === "Home" ? "/" : `/${label.toLowerCase()}`}
              className="hover:text-indigo-600 transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center space-x-5">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-700 cursor-pointer hover:text-indigo-600" />
          <UserIcon className="w-6 h-6 text-gray-700 cursor-pointer hover:text-indigo-600" />
          <div className="relative cursor-pointer" onClick={() => router.push("/cart")}>
            <ShoppingBagIcon className="w-6 h-6 text-gray-700 hover:text-indigo-600" />
            {cart?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </div>
          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
            <Bars3Icon className="w-7 h-7 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:hidden absolute top-0 left-0 w-full bg-white z-50 shadow-xl"
          >
            <div className="p-5 flex flex-col space-y-4 text-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              {["Home", "Blog", "About", "Contact"].map((label) => (
                <Link
                  key={label}
                  href={label === "Home" ? "/" : `/${label.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-indigo-600 transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
