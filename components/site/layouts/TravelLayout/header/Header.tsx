"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bars3BottomLeftIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useStoreContext } from "@/contexts/StoreContext";
import { useSession, signOut } from "next-auth/react";
import { EditableElement } from "@/contexts/EditableContentContext";
import StoreHeaderSearch from "@/components/search/StoreHeaderSearch";

// Fallback sample data
const sampleData = {
  name: "TravelCo",
  slug: "travelco",
  logoUrl: "https://placehold.co/120x40/000000/FFFFFF?text=Logo",
  themeSettings: { primaryColor: "#4f46e5", secondaryColor: "#4338ca" }, // Updated fallbacks to Indigo matching your new hero theme
};

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { storeFormData } = useStoreContext();

  // AUTH
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;

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
      router.push(`/travel/profile`);
    }
  };

  // Extract final data (fallback-safe)
  const { name, slug, logoUrl, themeSettings } = storeFormData || sampleData;

  const primary = themeSettings?.primaryColor || "#4f46e5"; 
  const secondary = themeSettings?.secondaryColor || "#4338ca";

  const navItems = [
    { label: "Home", href: `/` },
    { label: "Destinations", href: `/#destinations` },
    { label: "Tours", href: `/#tours` },
    { label: "About", href: `/#about` },
    { label: "Contact", href: `/#contact` },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full transition-all duration-300">
      {/* Floating Glassmorphism Main Bar */}
      <div className="bg-gradient-to-b from-black/40 via-black/10 to-transparent dark:from-zinc-950/60 dark:via-zinc-950/20 text-white backdrop-blur-[2px]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <Link href={`/`}>
                {logoUrl ? (
                  <Image decoding="async"
                    src={logoUrl}
                    alt={name}
                    width={130}
                    height={44}
                    className="object-contain cursor-pointer transition-transform duration-300 hover:scale-102 filter brightness-100 dark:invert-0  h-20 w-32"
                  />
                ) : (
                  <EditableElement
                    targetId="global.global.header.Header.main.storeName"
                    componentKey="Header"
                    elementKey="storeName"
                    label="Store Brand Name"
                    defaultValue={name}
                    inline
                  >
                    {(val) => (
                      <span className="text-2xl font-serif font-bold tracking-widest bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                        {val}
                      </span>
                    )}
                  </EditableElement>
                )}
              </Link>
            </div>

            {/* Premium Center Navigation */}
            <nav className="hidden lg:flex items-center space-x-10">
              {navItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative group py-2 text-sm font-medium tracking-wider text-white/80 hover:text-white transition-colors duration-300"
                >
                  <EditableElement
                    targetId={`global.global.header.Header.items.${index}.label`}
                    componentKey="Header"
                    elementKey={`navItem${index + 1}Label`}
                    label={`Nav Item ${index + 1} Label`}
                    defaultValue={item.label}
                    inline
                  >
                    {(val) => <span>{val}</span>}
                  </EditableElement>
                  <motion.span
                    className="absolute left-0 bottom-0 h-[2px] w-0 bg-gradient-to-r from-indigo-400 to-purple-400"
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ backgroundColor: primary }}
                  />
                </Link>
              ))}
            </nav>

            {/* Desktop Action Utilities */}
            <div className="hidden lg:flex items-center space-x-3">
              {/* Search Utility Button */}
              <StoreHeaderSearch
                variant="button"
                buttonClassName="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/90"
                iconClassName="h-5 w-5"
                placeholder="Search destinations, tours, packages..."
              />

              {/* Chat Utility Button */}
              <button
                onClick={() => router.push(`/chat`)}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 text-white/90"
              >
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
              </button>

              <span className="h-5 w-px bg-white/20 mx-2" />

              {/* Authenticated / Guest State Call-To-Action */}
              {user ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleUserAction}
                    className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:brightness-110 active:scale-95"
                    style={{ backgroundColor: primary }}
                  >
                    {user.name || "Profile"}
                  </button>

                  <button
                    onClick={()=> {
                      const returnTo = window.location.origin;

                      signOut({
                        redirect: true,
                        callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                      });
                    }}
                    className="text-white/60 hover:text-red-400 text-xs font-medium tracking-wide transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full text-white shadow-xl transition-all duration-300 hover:brightness-110"
                    style={{ backgroundColor: primary }}
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-white/30 bg-white/5 backdrop-blur-md text-white transition-all duration-300 hover:bg-white hover:text-zinc-950 hover:border-white"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Interaction Hamburger */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle navigation menu"
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                {mobileOpen ? (
                  <XMarkIcon className="h-5 w-5 text-white" />
                ) : (
                  <Bars3BottomLeftIcon className="h-5 w-5 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Blur layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-40 lg:hidden"
            />

            {/* Drawer Interface */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 35 }}
              className="fixed inset-y-0 left-0 w-80 bg-zinc-950/95 backdrop-blur-2xl text-white shadow-2xl z-50 lg:hidden border-r border-white/10 flex flex-col"
            >
              <div className="px-6 py-6 flex flex-col h-full overflow-y-auto">
                {/* Mobile Menu Top Frame */}
                <div className="flex items-center justify-between mb-10">
                  {logoUrl ? (
                    <Image decoding="async"
                      src={logoUrl}
                      alt={name}
                      width={110}
                      height={36}
                      className="object-contain  h-20 w-32"
                    />
                  ) : (
                    <span className="text-xl font-serif font-bold tracking-widest">{name}</span>
                  )}
                  <button
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-2 hover:bg-white/10 rounded-full border border-transparent hover:border-white/10 transition-all"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Main Navigation links */}
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-4 py-3 text-lg font-light tracking-wide rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-zinc-300 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                {/* Utilities Stack */}
                <div className="mt-auto border-t border-white/10 pt-6 space-y-3">
                  <button
                    onClick={() => {
                      router.push(`/search`);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center space-x-4 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all text-sm"
                  >
                    <MagnifyingGlassIcon className="h-5 w-5 text-indigo-400" />
                    <span className="tracking-wide">Search Destination</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push(`/chat`);
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center space-x-4 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all text-sm"
                  >
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-indigo-400" />
                    <span className="tracking-wide">AI Concierge Chat</span>
                  </button>

                  {/* Auth Configuration */}
                  <div className="pt-4 border-t border-white/5 flex flex-col space-y-2">
                    {user ? (
                      <>
                        <button
                          onClick={() => {
                            handleUserAction();
                            setMobileOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-zinc-200 transition text-sm"
                        >
                          <UserCircleIcon className="h-5 w-5 text-zinc-400" />
                          <span className="truncate">Profile ({user.name || "Explorer"})</span>
                        </button>

                        <button
                          onClick={()=> {
  const returnTo = window.location.origin;

  signOut({
    redirect: true,
    callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
  });
}}
                          className="text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          Logout Action
                        </button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          onClick={handleGoogleSignIn}
                          className="py-3 text-xs font-semibold uppercase tracking-wider text-center rounded-xl text-white transition shadow-lg"
                          style={{ backgroundColor: primary }}
                        >
                          Login
                        </button>
                        <button
                          onClick={handleGoogleSignUp}
                          className="py-3 text-xs font-semibold uppercase tracking-wider text-center rounded-xl border border-white/20 bg-white/5 text-white transition hover:bg-white hover:text-zinc-950"
                        >
                          Register
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}