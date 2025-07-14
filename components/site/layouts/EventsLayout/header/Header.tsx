"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

// Since we're not in a real Next.js environment with context,
// we'll use mock data for demonstration.
const mockStoreFormData = {
  name: "Eventine",
  slug: "eventine",
  logoUrl: "", // Let's assume no logo to show the text fallback
  contactEmail: "hello@eventine.com",
  contactPhone: "1-800-555-EVENT",
  socialLinks: [
    { channel: "twitter", url: "https://twitter.com" },
    { channel: "instagram", url: "https://instagram.com" },
  ],
  themeSettings: {
    primaryColor: "#8B5CF6", // A nice purple
    secondaryColor: "#EC4899", // A vibrant pink
  },
};

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  // In a real app, you'd use `usePathname` to determine active state
  const isActive = false;

  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
    >
      {children}
      {isActive && (
        <motion.span
          layoutId="underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-500"
        />
      )}
    </Link>
  );
};

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // This would come from your context in a real app
  const storeFormData = mockStoreFormData;

  const { name, slug, logoUrl } = storeFormData;

  // Effect to handle scroll-based background change
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", href: `/${slug}` },
    { label: "Events", href: `/${slug}/events` },
    { label: "About", href: `/${slug}/about` },
    { label: "Contact", href: `/${slug}/contact` },
  ];

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          backgroundColor: isScrolled
            ? "rgba(17, 24, 39, 0.8)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(10px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(10px)" : "none", // For Safari
          boxShadow: isScrolled ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={`/${slug}`} className="flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  className="h-10 object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <TicketIcon className="h-8 w-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white tracking-tighter">
                    {name}
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 px-3 py-2 rounded-full">
              {navItems.map((item) => (
                <NavLink key={item.label} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Icons & Actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(`/${slug}/profile`)}
                className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                aria-label="Profile"
              >
                <UserCircleIcon className="h-6 w-6" />
              </motion.button>
              <div className="lg:hidden">
                <motion.button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors"
                  aria-label="Open menu"
                >
                  <Bars3Icon className="h-6 w-6" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-gray-900/95 shadow-xl p-6 flex flex-col"
              onClick={(e:any) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-xl font-bold text-white">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
