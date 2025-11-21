"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  Bars3BottomRightIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { StoreForm } from "@/types/typings";

// Fallback sample data (same style as your other header)
const fallbackData: StoreForm = {
  name: "AutoHub",
  slug: "autohub",
  logoUrl: "https://placehold.co/120x40?text=Logo",
  contactEmail: "sales@autohub.com",
  contactPhone: "+1 555-987-654",
  socialLinks: [],
  themeSettings: {
    primaryColor: "#2563eb",
    secondaryColor: "#1e3a8a",
  },
  id: "",
  tagline: null,
  description: null,
  hasWebsite: undefined,
  companyCategoryId: null,
  category: "",
  bannerUrl: null,
  site: null,
  address: null,
  domain: null,
  currency: "",
  locale: "",
  userId: null,
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
  sEOId: null,
  CoreValues: [],
  geoLocation: null,
  openingHours: null,
  pricingTiers: [],
  awards: null,
  metrics: null,
  stats: null,
  settings: null,
  policies: [],
  faqs: [],
  testimonials: [],
  promotions: [],
  Announcement: [],
  Collection: [],
  pageSections: [],
  heroSlides: [],
  appPromos: [],
  events: [],
  courses: [],
  blogs: [],
  projects: [],
  seo: null,
  analyticsConfig: null,
  paymentSettings: null,
  shippingSettings: null,
  StoreCategory: [],
  CompanyLocation: [],
  marketplaceListings: [],
  Writer: [],
  Expert: [],
  salesAgents: [],
  Educator: [],
  Doctor: [],
  packages: [],
  Podcast: [],
  services: [],
  destinations: [],
  tourPackages: []
};

interface HeaderProps {
  storeFormData?: StoreForm;
}

// Next.js Image loader
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Animation Variants ---
const menuVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 90 } },
};

const mobileMenuVariants = {
  open: { height: "auto", opacity: 1, transition: { duration: 0.25 } },
  closed: { height: 0, opacity: 0, transition: { duration: 0.25 } },
};

const Header: React.FC<HeaderProps> = ({ storeFormData }) => {
  const data = storeFormData || fallbackData;
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const navItems = ["Home", "Listings", "Categories"];

  // --- Authentication Logic ---
  const handleGoogleSignIn = () => {
    const url = new URL("https://auth.salesmanpro.site/signin");
    url.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = url.toString();
  };

  const handleGoogleSignUp = () => {
    const url = new URL("https://auth.salesmanpro.site/signup");
    url.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = url.toString();
  };

  const handleProfileClick = () => {
    if (!user) return handleGoogleSignIn();
    router.push(`/site/${data.slug}/automotive/profile`);
  };

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="backdrop-blur-md bg-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div variants={menuVariants} initial="hidden" animate="visible">
              <Link href={`/site/${data.slug}`} className="flex items-center">
                {data.logoUrl ? (
                  <Image
                    src={data.logoUrl}
                    alt={data.name}
                    width={120}
                    height={40}
                    loader={loader}
                    className="object-contain hover:scale-105 transition"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900">{data.name}</span>
                )}
              </Link>
            </motion.div>

            {/* Desktop Nav + Search */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((label, index) => (
                <motion.div
                  key={label}
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={{ scale: 1.05 }}
                  className="font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  <Link
                    href={`/site/${data.slug}${label === "Home" ? "" : "#" + label.toLowerCase()}`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              {/* Search */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchVisible && (
                    <motion.input
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 260, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      placeholder="Search..."
                      className="bg-gray-100 text-gray-700 rounded-full py-2 pl-4 pr-10 focus:outline-none"
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                  className={`p-2 rounded-full ${
                    isSearchVisible ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </motion.button>
              </div>
            </div>

            {/* Right Side: Profile + Mobile Button */}
            <div className="flex items-center space-x-4">
              {/* Auth/Profile */}
              {!user ? (
                <div className="hidden lg:flex space-x-2">
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <motion.button
                  onClick={handleProfileClick}
                  className="hidden lg:flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 transition"
                  whileTap={{ scale: 0.95 }}
                >
                  <UserIcon className="h-6 w-6 text-gray-700" />
                  <span className="font-medium text-gray-700">{user.name || "Profile"}</span>
                </motion.button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden p-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomRightIcon className="h-6 w-6" />}
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
              className="lg:hidden bg-white/80 border-t border-gray-200 overflow-hidden"
            >
              <div className="flex flex-col px-4 py-4 space-y-4">
                {navItems.map((label) => (
                  <Link
                    key={label}
                    href={`/site/${data.slug}${label === "Home" ? "" : "#" + label.toLowerCase()}`}
                    className="text-gray-900 font-medium hover:text-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}

                {/* Auth Mobile */}
                <div className="pt-3 border-t">
                  {user ? (
                    <>
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left py-2"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left py-2 text-red-600"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleGoogleSignIn} className="w-full text-left py-2">
                        Login
                      </button>
                      <button onClick={handleGoogleSignUp} className="w-full text-left py-2">
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
