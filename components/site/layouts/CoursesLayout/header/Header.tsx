"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  BookOpenIcon, // New icon for courses/learning
  AcademicCapIcon,
  InboxIcon, // New icon for school/academy
  // Removed BellIcon for a more minimal approach
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// Mocking context data for demonstration purposes
// In a real application, replace with actual data sources
const useMockStoreContext = () => ({
  storeFormData: {
    name: "Edulern Academy",
    slug: "edulern",
    logoUrl: "https://placehold.co/180x60/4A00B7/FFFFFF?text=Edulern", // A custom logo placeholder
    contactEmail: "info@edulern.com",
    contactPhone: "+1 (800) 555-0123",
    socialLinks: [
      { channel: "facebook", url: "#" },
      { channel: "twitter", url: "#" },
      { channel: "linkedin", url: "#" },
    ],
    storeCategories: [
      { id: "web-dev", name: "Web Development" },
      { id: "data-science", name: "Data Science" },
      { id: "graphic-design", name: "Graphic Design" },
      { id: "business", name: "Business & Management" },
    ],
    themeSettings: {
      primaryColor: "#4A00B7", // Deep Purple
      secondaryColor: "#FFC107", // Amber Yellow
    },
  },
});

const useMockStateContext = () => ({
  cart: [{ id: 1, name: "Course A" }, { id: 2, name: "Course B" }], // Mock cart items
});

// Simplified loader for standard <img> tag
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

export default function Header() {
  const { storeFormData } = useStoreContext();
  // const { cart } = useMockStateContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // State for mobile search input

  // Mock navigation function as Next.js useRouter is not available
  const mockNavigation = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // In a real Next.js app, this would be router.push(path);
    // window.location.href = path; // Uncomment if you want actual page redirection in browser environment
  };

  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    storeCategories,
    themeSettings,
  } = storeFormData;

  const primaryColor = themeSettings?.primaryColor || "#4A00B7"; // Deep Purple
  const accentColor = themeSettings?.secondaryColor || "#FFC107"; // Amber Yellow

  // Reusable NavLink component with enhanced hover effects
  const NavLink = ({ href, label, icon: Icon = undefined }: { href: string; label: string; icon?: React.ElementType }) => (
    <a
      href={href}
      className="relative flex items-center gap-2 text-white font-semibold py-2 px-3 transition-all duration-300
                 hover:text-amber-300 hover:bg-white/10 rounded-md
                 after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-0 after:h-0.5
                 after:bg-amber-400 after:scale-x-0 group-hover:after:scale-x-100 after:transition-all after:duration-300"
      onClick={(e) => { e.preventDefault(); mockNavigation(href); setMenuOpen(false); }} // Close menu on click
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label}
    </a>
  );

  const iconButtonClass = "p-2 rounded-full hover:bg-white/10 transition-colors duration-200 flex items-center justify-center";
  const iconStyleClass = "h-6 w-6 text-white";

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-800 to-indigo-900 shadow-lg transition-all duration-300 font-inter">
      {/* Topbar */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm tracking-wide text-purple-100"
        style={{ backgroundColor: primaryColor }} // Using primary color for solid topbar
      >
        <div className="flex gap-6 text-purple-100 text-opacity-90">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="hover:underline flex items-center gap-1.5">
              <InboxIcon className="w-4 h-4" /> {contactEmail}
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="hover:underline flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.332a.75.75 0 0 0-.215-.53l-1.782-1.782a1.5 1.5 0 0 0-1.06-.44H9.75a.75.75 0 0 0-.53.215L7.468 15.75a2.25 2.25 0 0 1-1.183.69l-.75.166m0 0C6.716 1.716 1.716 6.716 1.716 6.716L2.25 6.75Z" />
              </svg>
              {contactPhone}
            </a>
          )}
        </div>
        <div className="flex gap-4">
          {socialLinks.map((s) => (
            <a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="capitalize hover:text-amber-300 hover:scale-105 transition-all duration-200"
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between h-auto">
          {/* Logo */}
          <a href={`/${slug}`} className="flex items-center gap-2 flex-shrink-0" onClick={(e) => { e.preventDefault(); mockNavigation(`/${slug}`); }}>
            {logoUrl ? (
              <img
                src={customLoader({ src: logoUrl, width: 180 })}
                alt={name}
                width={180}
                height={60}
                className="object-contain rounded-md w-44 h-16"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/180x60/4A00B7/FFFFFF?text=Logo";
                }}
              />
            ) : (
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {name}
              </span>
            )}
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
            <NavLink href={`/${slug}`} label="Home" />
            <NavLink href={`/${slug}/courses`} label="Courses" icon={BookOpenIcon} />
            {/* Removed My Learning and Become a Tutor for a more minimal design */}
            {/* NavLink href={`/${slug}/my-learning`} label="My Learning" /> */}
            {/* NavLink href={`/${slug}/become-a-tutor`} label="Become a Tutor" /> */}
            {/* Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-white font-semibold py-2 px-3 transition-all duration-300
                                 hover:text-amber-300 hover:bg-white/10 rounded-md">
                Categories
                <ChevronDownIcon className="h-4 w-4 transform group-hover:rotate-180 transition-transform duration-300" />
              </button>
              <div className="absolute left-1/2 -translate-x-1/2 mt-3 hidden group-hover:block bg-purple-700 dark:bg-purple-900 border border-purple-600
                              rounded-xl shadow-lg w-56 z-50 overflow-hidden transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300">
                {storeCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/${slug}/category/${cat.id}`}
                    className="block px-5 py-3 text-sm text-white hover:bg-purple-600 hover:text-amber-300
                                 transition-colors duration-200"
                    onClick={(e) => { e.preventDefault(); mockNavigation(`/${slug}/category/${cat.id}`); }}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Search and Icons */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto lg:ml-0">
            {/* Desktop Search Toggle Button (visible on all screens to show search bar on mobile) */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`${iconButtonClass} lg:hidden`} // Only show on mobile
            >
              <MagnifyingGlassIcon className={iconStyleClass} />
            </button>

            {/* Desktop Search Input */}
            <div className="hidden lg:block w-64 relative flex-shrink-0">
              <input
                type="search"
                placeholder="Search courses..."
                className="w-full rounded-full pl-10 pr-4 py-2 text-sm border border-purple-600
                           bg-purple-700 text-white placeholder-purple-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none
                           transition-all duration-200 shadow-sm hover:shadow-md"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
            </div>

            {/* Removed BellIcon for a more minimal approach */}
            {/* <motion.button whileHover={{ scale: 1.1 }} className={iconButtonClass} onClick={() => mockNavigation(`/${slug}/notifications`)}>
              <BellIcon className={iconStyleClass} />
            </motion.button> */}
            <motion.button whileHover={{ scale: 1.1 }} className={iconButtonClass} onClick={() => mockNavigation(`/${slug}/profile`)}>
              <UserIcon className={iconStyleClass} />
            </motion.button>
            {/* <motion.button whileHover={{ scale: 1.1 }} className={iconButtonClass} onClick={() => mockNavigation(`/${slug}/checkout`)}>
              <div className="relative">
                <ShoppingBagIcon className={iconStyleClass} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce-once">
                    {cart.length}
                  </span>
                )}
              </div>
            </motion.button> */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors duration-200"
              aria-label="Toggle Mobile Menu"
            >
              {menuOpen ? (
                <XMarkIcon className="h-7 w-7 text-white" />
              ) : (
                <Bars3Icon className="h-7 w-7 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (Conditionally rendered) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden px-4 pb-4 bg-gradient-to-r from-purple-800 to-indigo-900 shadow-inner"
          >
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search courses..."
                className="w-full rounded-full pl-10 pr-4 py-2 text-sm border border-purple-600
                           bg-purple-700 text-white placeholder-purple-300 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none
                           transition-all duration-200"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden bg-purple-800 shadow-md border-t border-purple-700"
          >
            <div className="px-4 py-4 space-y-3">
              <NavLink href={`/${slug}`} label="Home" icon={AcademicCapIcon} />
              <NavLink href={`/${slug}/courses`} label="Courses" icon={BookOpenIcon} />
              {/* Added My Learning and Become a Tutor back to mobile menu for accessibility */}
              <NavLink href={`/${slug}/my-learning`} label="My Learning" icon={UserIcon} />
              <NavLink href={`/${slug}/become-a-tutor`} label="Become a Tutor" />
              <details className="group text-white">
                <summary className="cursor-pointer flex items-center justify-between font-semibold hover:text-amber-300 transition-colors duration-200 py-2">
                  Categories
                  <ChevronDownIcon className="h-5 w-5 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-2 pl-4 space-y-2 border-l border-purple-600 ml-2">
                  {storeCategories.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/${slug}/category/${cat.id}`}
                      className="block hover:text-amber-300 transition-colors duration-200 text-sm py-1"
                      onClick={(e) => { e.preventDefault(); mockNavigation(`/${slug}/category/${cat.id}`); setMenuOpen(false); }} // Close menu on click
                    >
                      {cat.name}
                    </a>
                  ))}
                </div>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
