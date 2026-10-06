"use client";

import React, { useState } from "react";
import { useStoreContext } from "@/contexts/StoreContext";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  Bars3BottomRightIcon, 
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { StoreHeaderSearch } from "@/components/search/StoreHeaderSearch";

// Sample data fallback
const sampleData = {
  name: "KindFlow",
  slug: "kindflow",
  logoUrl: "https://placehold.co/120x40/000000/FFFFFF?text=Logo",
  contactEmail: "info@example.org",
  contactPhone: "+1 (555) 123-4567",
  socialLinks: [
    { channel: "facebook", url: "https://facebook.com" },
    { channel: "twitter", url: "https://twitter.com" },
    { channel: "instagram", url: "https://instagram.com" },
  ],
  themeSettings: {
    primaryColor: "#2563EB",
    secondaryColor: "#FFFFFF",
    accentColor: "#D97706"
  },
};

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { storeFormData } = useStoreContext();

  // AUTH ---
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signup");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();

    if (user.role?.toLowerCase() === "admin") {
      router.push("/dashboards");
    } else {
      router.push(`/nonprofit/profile`);
    }
  };

  // Data fields pairing safely with dynamic context
  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData || sampleData;

  const primary = themeSettings?.primaryColor || "#2563EB"; 

  // Navigation schema helper
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Programs", href: `/${slug}#programs` },
    { name: "Donate", href: `/${slug}#donate` },
    { name: "Contact", href: `/${slug}#contact` },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 transition-all duration-200">
      
      {/* 1. Flat Top Bar Info Stream */}
      <div className="hidden md:block bg-slate-50 border-b border-slate-200 text-xs font-semibold tracking-wide text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center space-x-1.5 hover:text-slate-900 transition-colors"
              >
                <EnvelopeIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{contactEmail}</span>
              </a>
            )}
            {contactPhone && (
              <a 
                href={`tel:${contactPhone}`} 
                className="flex items-center space-x-1.5 hover:text-slate-900 transition-colors"
              >
                <PhoneIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>{contactPhone}</span>
              </a>
            )}
          </div>

          <div className="flex space-x-5 items-center">
            {socialLinks?.map((s) => (
              <a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="capitalize text-slate-500 hover:text-slate-900 transition-colors duration-150"
              >
                {s.channel}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Header Arena */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Frame */}
          <div className="flex items-center space-x-10">
            <a href="/" className="flex items-center group transition-transform duration-150 active:scale-98">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${name} organizational logo`}
                  className="object-contain h-10 w-auto mix-blend-multiply"
                />
              ) : (
                <span className="text-xl font-black tracking-tight text-slate-900">
                  {name}
                </span>
              )}
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 font-semibold text-sm text-slate-600">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`relative py-2 transition-colors duration-200 hover:text-slate-900 ${
                      isActive ? "text-slate-900" : ""
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div 
                        layoutId="navIndicator" 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" 
                      />
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Interactive Utility Section */}
          <div className="hidden lg:flex items-center space-x-4">
            <StoreHeaderSearch variant="button" />
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-100/80 p-1.5 pr-4 rounded-xl border border-slate-200">
                <button
                  onClick={handleUserAction}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-sm font-bold text-slate-800 hover:bg-slate-50 transition-all active:scale-98"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>{user.name || "My Dashboard"}</span>
                </button>
                <button
                  onClick={() => {
                    const returnTo = window.location.origin;
                    signOut({
                      redirect: true,
                      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                    });
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors px-4 py-2.5"
                >
                  Sign in
                </button>
                <button
                  onClick={handleGoogleSignUp}
                  className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-98 text-white hover:brightness-105"
                  style={{ backgroundColor: primary }}
                >
                  Join Movement
                </button>
              </div>
            )}
          </div>

          {/* Responsive Menu Icon (Mobile/Tablet View) */}
          <div className="flex items-center space-x-2 lg:hidden">
            <StoreHeaderSearch variant="button" />
            <button
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Tray"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" strokeWidth={2} />
              ) : (
                <Bars3BottomRightIcon className="h-6 w-6" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Smooth Mobile Navigation Overlay Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 px-4 py-6 shadow-xl lg:hidden flex flex-col gap-6"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-slate-800 hover:text-slate-900 py-1"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              {user ? (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleUserAction(); }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      const returnTo = window.location.origin;
                      signOut({
                        redirect: true,
                        callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                      });
                    }}
                    className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                    className="py-3.5 text-center text-sm font-bold text-slate-700 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignUp(); }}
                    className="py-3.5 text-center text-sm font-bold text-white rounded-xl shadow-sm"
                    style={{ backgroundColor: primary }}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}