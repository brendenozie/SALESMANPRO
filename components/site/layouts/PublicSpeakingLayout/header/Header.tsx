"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  SparklesIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";

// --- Types ---
interface StoreForm {
  slug: string;
  name: string;
  logoUrl?: string;
}

interface HeaderProps {
  storeFormData: StoreForm;
}

// --- Dynamic Logo Component ---
const DynamicLogo: React.FC<{ formData: StoreForm; isScrolled: boolean }> = ({
  formData,
  isScrolled,
}) => {
  const { slug, name, logoUrl } = formData;
  const homeLink = `/site/${slug}`;
  const displayName = name?.trim() || "Flourish";
  const [firstName, lastName] = displayName.split(" ");

  return (
    <a
      href={homeLink}
      className="flex items-center space-x-2.5 group transition-transform hover:scale-[1.02]"
      aria-label="Home"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={displayName}
          width={120}
          height={40}
          onError={(e: any) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/120x40/EA580C/FFFFFF?text=${firstName
              .substring(0, 4)
              .toUpperCase()}`;
          }}
          className={`object-contain transition-all duration-300 rounded-full ${
            isScrolled ? "h-16" : "h-20"
          }`}
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-orange-600 text-white font-bold transition-all duration-300 ${
            isScrolled ? "text-lg w-8 h-8" : "text-xl w-10 h-10"
          }`}
        >
          {firstName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-col leading-tight">
        <span
          className={`font-extrabold tracking-tight transition-all duration-300 ${
            isScrolled ? "text-lg" : "text-xl md:text-2xl"
          }`}
        >
          <span className="text-gray-900">{firstName}</span>{" "}
          <span className="text-orange-600">{lastName || ""}</span>
        </span>
      </div>
    </a>
  );
};

// --- Animation Variants ---
const navItemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4 },
  }),
};

const mobileMenuVariants = {
  closed: { opacity: 0, scale: 0.98, transition: { when: "afterChildren" } },
  open: { opacity: 1, scale: 1, transition: { staggerChildren: 0.06 } },
};

const mobileLinkVariants = {
  closed: { opacity: 0, y: 10 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45 },
  }),
};

// --- Main Header ---
const PublicSpeakingHeader: React.FC<HeaderProps> = ({ storeFormData }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 120);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [handleScroll, mobileMenuOpen]);

  // Navigation items
  const navItems = [
    { label: "Home", href: "#hero" },
    { label: "Method", href: "#about" },
    { label: "Success Stories", href: "#testimonials" },
  ];

  const ctaItem = { label: "Book Now", href: "#contact" };

  // Handle user actions
  const handleUserAction = () => {
    if (!user) return signIn();
    console.log("User:", user);
    if (user.role?.toLowerCase() === "admin") router.push("/dashboards");
    else router.push("/publicspeaking/profile");
  };

  const handleSignOut = () => signOut({ callbackUrl: "/" });

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/auth/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/auth/signup");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-xl backdrop-blur-xl border-b border-orange-200"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-16" : "h-24"
          }`}
        >
          {/* Logo */}
          <DynamicLogo formData={storeFormData} isScrolled={isScrolled} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 lg:space-x-10">
            {navItems.map((item, i) => (
              <motion.div
                key={item.label}
                custom={i}
                variants={navItemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3 }}
                className="relative"
              >
                <a
                  href={item.href}
                  className={`text-base font-semibold relative group py-2 transition-colors duration-300 ${
                    isScrolled
                      ? "text-gray-700 hover:text-orange-600"
                      : "text-gray-800 hover:text-orange-600"
                  }`}
                >
                  {item.label}
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-0 h-0.5 w-0 bg-orange-600 rounded-full transition-all duration-300 group-hover:w-full"></span>
                </a>
              </motion.div>
            ))}
          </div>

          {/* CTA + Profile / Mobile Toggle */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* --- Primary CTA / Sign Up (Only visible when user is NOT logged in) --- */}
            {!user && (
              <motion.div
                className="hidden md:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
              >
                <button
                  onClick={handleGoogleSignUp}
                  className="inline-flex items-center px-6 py-3 text-base font-bold rounded-xl shadow-2xl text-white bg-orange-600 ring-4 ring-orange-300/50 hover:bg-orange-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100 group whitespace-nowrap"
                >
                  {"Signup"}
                  <SparklesIcon className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:rotate-12" />
                </button>
              </motion.div>
            )}

            {/* --- User Session Button (Sign In / My Profile / Admin Dashboard) --- */}
            <motion.button
              onClick={
                status === "loading"
                  ? undefined
                  : user
                  ? handleUserAction // still your internal handler for logged-in users
                  : handleGoogleSignIn // new external auth for login
              }
              whileTap={{ scale: 0.95 }}
              className={`hidden md:flex items-center px-4 py-2 rounded-full font-semibold transition-all shadow-md whitespace-nowrap ${
                user
                  ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100"
              }`}
            >
              <UserCircleIcon className="w-5 h-5 mr-2" />
              {status === "loading"
                ? "Loading..."
                : user
                ? user.role === "admin"
                  ? "Admin Portal"
                  : "My Account"
                : "Log In"}
            </motion.button>

            {/* --- Mobile Menu Toggle --- */}
            <div className="md:hidden z-50">
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-3 rounded-full transition-colors shadow-lg border ${
                  mobileMenuOpen
                    ? "bg-white border-gray-300 text-gray-800"
                    : "bg-white/80 border-orange-200 text-orange-600 hover:bg-orange-50"
                }`}
                aria-label="Toggle menu"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                    >
                      <Bars3BottomRightIcon className="h-6 w-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden fixed top-0 left-0 w-full h-screen bg-white/95 backdrop-blur-2xl origin-top-right z-40"
          >
            <motion.div className="flex flex-col items-center justify-center h-full space-y-8 px-6">
              {[...navItems, ctaItem].map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i}
                  variants={mobileLinkVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                >
                  <a
                    href={item.href}
                    className={`text-4xl font-extrabold transition-colors block p-4 tracking-tight ${
                      item.label === ctaItem.label
                        ? "text-orange-600 hover:text-orange-700"
                        : "text-gray-900 hover:text-orange-600"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </motion.div>
              ))}

              {/* User Profile Button for Mobile */}
              <motion.button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleUserAction();
                }}
                className="flex items-center px-6 py-3 rounded-full bg-orange-600 text-white font-semibold text-lg hover:bg-orange-700 transition-all"
              >
                <UserCircleIcon className="w-6 h-6 mr-2" />
                {status === "loading"
                  ? "Loading..."
                  : user
                  ? user.role === "admin"
                    ? "Admin Dashboard"
                    : "My Profile"
                  : "Sign In"}
              </motion.button>

              {user && (
                <button
                  onClick={handleSignOut}
                  className="mt-4 text-gray-600 underline hover:text-orange-600 text-base"
                >
                  Sign Out
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default PublicSpeakingHeader;
