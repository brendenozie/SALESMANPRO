'use client'
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomRightIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "@/contexts/ContextProvider";
import { useRouter } from "next/navigation";
import { StoreForm } from "@/types/typings";

interface HeaderProps {
  storeFormData: StoreForm;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Animation Variants ---
const menuVariants = {
  hidden: { y: -20, opacity: 0, transition: { duration: 0.3 } },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

const mobileMenuVariants = {
  open: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  closed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
};

const Header: React.FC<HeaderProps> = ({ storeFormData }: any) => {
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();

  const navItems = ["Home", "Listings", "Categories"];

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      {/* Light Mode Glassmorphism Effect */}
      {/* backdrop-blur-xl */}
      <div className=" backdrop-blur-sm bg-white/40">
       {/* border-b border-gray-200 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div variants={menuVariants} initial="hidden" animate="visible">
              <Link href={`/site/${storeFormData.slug}`} className="flex items-center">
                {storeFormData.logoUrl ? (
                  <Image
                    src={storeFormData.logoUrl}
                    alt={storeFormData.name}
                    width={120}
                    height={40}
                    className="object-contain transition-transform duration-300 hover:scale-105"
                    // Removed the filter style to display the logo's original colors
                    loader={loader}
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900 transition-transform duration-300 hover:scale-105">
                    {/* Changed text-white to a dark gray */}
                    {storeFormData.name}
                  </span>
                )}
              </Link>
            </motion.div>

            {/* Desktop Nav + Interactive Search */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((label, index) => (
                <motion.div
                  key={label}
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{ y: -3, scale: 1.05 }}
                  className="relative font-medium text-gray-700 hover:text-blue-600 transition"
                  // Changed text-white to a dark gray and hover:text-blue-400 to blue-600
                >
                  <Link
                    href={`/site/${storeFormData.slug}${label === "Home" ? "" : "#"+label.toLowerCase()}`}
                    scroll={false}
                    className="py-2"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchVisible && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "250px", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      type="search"
                      placeholder="Search vehicles..."
                      className="bg-gray-100 placeholder-gray-500 text-gray-900 rounded-full py-2 pl-4 pr-10 focus:bg-gray-200 focus:outline-none transition-all duration-300"
                      // Changed colors for light mode
                    />
                  )}
                </AnimatePresence>
                <motion.button
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className={`p-2 rounded-full ${isSearchVisible ? 'bg-blue-600' : 'bg-transparent'} text-gray-700 transition-colors duration-300 hover:bg-blue-600`}
                  // Changed text-white to text-gray-700
                  whileTap={{ scale: 0.9 }}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Icons & Mobile Toggle */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => router.push(`/site/${storeFormData.slug}/automotive/profile`)}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors text-gray-700"
                // Changed colors for light mode
              >
                <UserIcon className="h-6 w-6" />
              </motion.button>

              <button
                className="lg:hidden p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                // Changed colors for light mode
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3BottomRightIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden bg-white/50 border-t border-gray-200 overflow-hidden"
              // Changed colors for light mode
            >
              <div className="flex flex-col px-4 py-4 space-y-3">
                {navItems.map((label) => (
                  <Link
                    key={label}
                    href={`/site/${storeFormData.slug}${label === "Home" ? "" : "#"+label.toLowerCase()}`}
                    className="text-gray-900 font-medium hover:text-blue-600 transition"
                    // Changed colors for light mode
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;