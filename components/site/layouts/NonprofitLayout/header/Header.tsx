"use client";

import React, { useState } from "react";
import { useStoreContext } from "@/contexts/StoreContext";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
    primaryColor: "#10B981",
    secondaryColor: "#047857",
  },
};

export default function Header() {
  const router = useRouter();
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

  // Data fields
  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks,
    themeSettings,
  } = storeFormData || sampleData;

  const primary = themeSettings?.primaryColor || "#10B981";
  const secondary = themeSettings?.secondaryColor || "#047857";

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-shadow">
      {/* Top Bar */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}1A`, color: primary }}
      >
        <div className="flex items-center space-x-6">
          {contactEmail && (
            <a
              href={`mailto:${contactEmail}`}
              className="flex items-center space-x-1 uppercase hover:underline"
            >
              <span>{contactEmail}</span>
            </a>
          )}
          {contactPhone && (
            <a href={`tel:${contactPhone}`} className="flex items-center space-x-1 hover:underline">
              <span>{contactPhone}</span>
            </a>
          )}
        </div>

        <div className="flex space-x-4">
          {socialLinks?.map((s) => (
            <a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: primary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
              className="capitalize transition-colors"
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <a href={`/`} className="flex items-center space-x-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={name}
                  width={120}
                  height={40}
                  className="object-contain"
                />
              ) : (
                <span className="text-xl font-bold">{name}</span>
              )}
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex space-x-6 font-medium text-gray-700 dark:text-gray-200">
              <a
                href={`/`}
                className="hover:underline"
              >
                Home
              </a>
              <a href={`/${slug}#programs`} className="hover:underline">
                Programs
              </a>
              <a href={`/${slug}#donate`} className="hover:underline">
                Donate
              </a>
              <a href={`/${slug}#contact`} className="hover:underline">
                Contact
              </a>
            </nav>
          </div>

          {/* AUTH / PROFILE */}
          <div className="flex items-center space-x-4">
            {/* If logged in */}
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleUserAction}
                  className="text-gray-700 dark:text-gray-200 font-medium"
                >
                  {user.name || "Profile"}
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 font-semibold text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              // If NOT logged in
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-1 text-sm font-medium rounded-md text-white"
                  style={{ backgroundColor: primary }}
                >
                  Login
                </button>
                <button
                  onClick={handleGoogleSignUp}
                  className="px-4 py-1 text-sm font-medium rounded-md border"
                  style={{ borderColor: primary, color: primary }}
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              className="lg:hidden text-gray-600 dark:text-gray-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-800 px-4 py-4 shadow-md border-t">
          <div className="space-y-3">
            <a href={`/`} className="block">Home</a>
            <a href={`/#programs`} className="block">Programs</a>
            <a href={`/#donate`} className="block">Donate</a>
            <a href={`/#contact`} className="block">Contact</a>

            {/* Auth inside mobile menu */}
            <div className="pt-2 border-t">
              {user ? (
                <>
                  <button
                    onClick={handleUserAction}
                    className="block w-full text-left py-2"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="block w-full text-left py-2 text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    className="block w-full text-left py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="block w-full text-left py-2"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
