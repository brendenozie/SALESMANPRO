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
  BookOpenIcon, // Icon for courses/learning
  AcademicCapIcon, // Icon for home/academy
  EnvelopeIcon, // Icon for email
  PhoneIcon, // Icon for phone contact
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";

// Mocking context data for demonstration purposes
// IMPORTANT: These defaults are now aligned with your provided storeFormData sample.
const useMockStoreContext = () => ({
  storeFormData: {
    id: '683581bba1bdf6ca3624b530',
    name: 'Educational & Online Courses',
    slug: 'educational-online-courses',
    logoUrl: 'https://ghubabucket.s3.amazonaws.com/images/c370dc36-17c2-4edd-841a-b033337a73b2.png',
    contactEmail: 'brendenodhiambo@gmail.com',
    contactPhone: '0732771353',
    socialLinks: [
      { channel: "facebook", url: "https://facebook.com/education" },
      { channel: "twitter", url: "https://twitter.com/education" },
      { channel: "instagram", url: "https://instagram.com/education" },
    ],
    StoreCategory: [
      { id: "web-dev", displayName: "Web Development" },
      { id: "data-science", displayName: "Data Science" },
      { id: "graphic-design", displayName: "Graphic Design" },
      { id: "business", displayName: "Business & Management" },
    ],
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      secondaryColor: "#ffffff", // White from your sample
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
  // IMPORTANT: In your actual application, use:
  const { storeFormData } = useStoreContext();
  // const { storeFormData } = useMockStoreContext(); // Using mock to control defaults for demonstration
  const { cart } = useMockStateContext(); // Using mock cart for now
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
    StoreCategory,
    themeSettings,
  } = storeFormData || {}; // Added default empty object for safety

  // Define primary and accent colors from themeSettings or fallbacks
  const primaryColor = themeSettings?.primaryColor || "#fd2121"; // Your brand's primary color (red)
  const accentColor = "#FFC107"; // A vibrant amber/yellow for highlights, matching hero's interactive elements

  // Reusable NavLink component with enhanced hover effects
  const NavLink = ({ href, label, icon: Icon = undefined }: { href: string; label: string; icon?: React.ElementType }) => (
    <motion.a
      href={href}
      className="relative flex items-center gap-2 text-gray-700 font-semibold py-2 px-3 transition-all duration-300
                 hover:text-gray-900 hover:bg-gray-100 rounded-md group" // Adjusted text and background for light theme
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); mockNavigation(href); setMenuOpen(false); }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      {Icon && <Icon className={`w-5 h-5 text-gray-500 group-hover:text-[${accentColor}] transition-colors duration-200`} />} {/* Adjusted icon color */}
      {label}
      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5
                       bg-[${accentColor}] scale-x-0 group-hover:scale-x-100 transition-all duration-300 origin-center`}></span>
    </motion.a>
  );

  const iconButtonClass = "p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"; // Adjusted hover background
  const iconStyleClass = "h-6 w-6 text-gray-700"; // Adjusted icon color

  return (
    <header className="sticky top-0 z-50 font-inter shadow-lg bg-white"> {/* Changed main background to white, lighter shadow */}
      {/* Topbar (Brand Accent Strip) */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-xs tracking-wide text-white"
        style={{ backgroundColor: primaryColor }} // Uses your primaryColor for a strong brand statement
      >
        <div className="flex gap-6 text-opacity-90">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="hover:underline flex items-center gap-1.5">
              <EnvelopeIcon className="w-3 h-3" /> {contactEmail}
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="hover:underline flex items-center gap-1.5">
              <PhoneIcon className="w-3 h-3" />
              {contactPhone}
            </a>
          )}
        </div>
        <div className="flex gap-4">
          {socialLinks?.map((s) => (
            <a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className={`capitalize hover:text-[${accentColor}] hover:scale-105 transition-all duration-200`}
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="py-4 px-4 sm:px-6 lg:px-8"> {/* Background is now handled by parent header tag */}
        <div className="max-w-screen-xl mx-auto flex items-center justify-between h-auto">
          {/* Logo */}
          <a href={`/${slug}`} className="flex items-center gap-2 flex-shrink-0" onClick={(e) => { e.preventDefault(); mockNavigation(`/${slug}`); }}>
            {logoUrl ? (
              <img
                src={customLoader({ src: logoUrl, width: 180 })}
                alt={name || "Company Logo"}
                width={180}
                height={60}
                className="object-contain rounded-md w-44 h-16"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/180x60/CCCCCC/000000?text=Logo"; // Lighter placeholder
                }}
              />
            ) : (
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight"> {/* Changed text to dark */}
                {name || "Your Academy"}
              </span>
            )}
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
            <NavLink href={`/${slug}`} label="Home" icon={AcademicCapIcon} />
            <NavLink href={`/${slug}/courses`} label="Courses" icon={BookOpenIcon} />
            <NavLink href={`/${slug}/my-learning`} label="My Learning" icon={UserIcon} />
            <NavLink href={`/${slug}/become-a-tutor`} label="Become a Tutor" />
            {/* Dropdown */}
            <div className="relative group">
              <motion.button
                className="flex items-center gap-1 text-gray-700 font-semibold py-2 px-3 transition-all duration-300
                           hover:text-gray-900 hover:bg-gray-100 rounded-md" // Adjusted text and background for light theme
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Categories
                {/* <ChevronDownIcon className="h-4 w-4 transform group-hover:rotate-180 transition-transform duration-300 text-gray-500" /> Adjusted icon color */}
              </motion.button>
              {/* <div className={`absolute left-1/2 -translate-x-1/2 mt-3 hidden group-hover:block bg-white border border-gray-200
                              rounded-xl shadow-lg w-56 z-50 overflow-hidden transform origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300`}> 
                {storeCategories?.map((cat) => (
                  <motion.a
                    key={cat.id}
                    href={`/${slug}/category/${cat.id}`}
                    className={`block px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 hover:text-[${accentColor}] transition-colors duration-200`} // Adjusted text and background for light theme
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); mockNavigation(`/${slug}/category/${cat.id}`); }}
                    whileHover={{ x: 5 }} // Slight slide on hover
                  >
                    {cat.displayName}
                  </motion.a>
                ))}
              </div> */}
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
                className={`w-full rounded-full pl-10 pr-4 py-2.5 text-sm border border-gray-300
                           bg-gray-100 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent outline-none
                           transition-all duration-200 shadow-sm hover:shadow-md`} // Adjusted for light theme
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" /> {/* Adjusted icon color */}
            </div>

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
              className="lg:hidden p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" // Adjusted hover background
              aria-label="Toggle Mobile Menu"
            >
              {menuOpen ? (
                <XMarkIcon className="h-7 w-7 text-gray-700" /> // Adjusted icon color
              ) : (
                <Bars3Icon className="h-7 w-7 text-gray-700" /> // Adjusted icon color
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
            className="lg:hidden px-4 pb-4 bg-white shadow-inner" // Adjusted background
          >
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search courses..."
                className={`w-full rounded-full pl-10 pr-4 py-2.5 text-sm border border-gray-300
                           bg-gray-100 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-[${accentColor}] focus:border-transparent outline-none
                           transition-all duration-200`} // Adjusted for light theme
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" /> {/* Adjusted icon color */}
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
            className="lg:hidden overflow-hidden bg-white shadow-md border-t border-gray-200" // Adjusted background and border
          >
            <div className="px-4 py-4 space-y-3">
              <NavLink href={`/${slug}`} label="Home" icon={AcademicCapIcon} />
              <NavLink href={`/${slug}/courses`} label="Courses" icon={BookOpenIcon} />
              <NavLink href={`/${slug}/my-learning`} label="My Learning" icon={UserIcon} />
              <NavLink href={`/${slug}/become-a-tutor`} label="Become a Tutor" />
              <details className="group text-gray-800"> {/* Adjusted text color */}
                <summary className="cursor-pointer flex items-center justify-between font-semibold hover:text-[${accentColor}] transition-colors duration-200 py-2">
                  Categories
                  {/* <ChevronDownIcon className="h-5 w-5 group-open:rotate-180 transition-transform text-gray-500" /> Adjusted icon color */}
                </summary>
                {/* <div className="mt-2 pl-4 space-y-2 border-l border-gray-300 ml-2">
                  {storeCategories?.map((cat) => (
                    <a
                      key={cat.id}
                      href={`/${slug}/category/${cat.id}`}
                      className="block hover:text-[${accentColor}] transition-colors duration-200 text-sm py-1 text-gray-700" // Adjusted text color
                      onClick={(e) => { e.preventDefault(); mockNavigation(`/${slug}/category/${cat.id}`); setMenuOpen(false); }} // Close menu on click
                    >
                      {cat.displayName}
                    </a>
                  ))}
                </div> */}
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Tailwind CSS keyframe animation for the bounce effect (for cart icon) */}
      <style jsx>{`
        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          20% {
            transform: translateY(-6px);
          }
          40% {
            transform: translateY(0);
          }
          60% {
            transform: translateY(-3px);
          }
          80% {
            transform: translateY(0);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 1s ease-in-out;
        }
      `}</style>
    </header>
  );
}
