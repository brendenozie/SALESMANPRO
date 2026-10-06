"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import { useSession, signOut } from "next-auth/react";
import { useStateContext } from "@/contexts/ContextProvider";
import { useStoreContext } from "@/contexts/StoreContext";
import StoreHeaderSearch from "@/components/search/StoreHeaderSearch";

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const router = useRouter();
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();

  // Extract store data
  const {
    slug,
    name,
    logoUrl,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || "#6366f1";
  const secondary = themeSettings?.secondaryColor || "#ec4899";

  // Auth
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string } | undefined;

  // UI states
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll shadow
  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
  }, [mobileMenu]);

  // Click outside mobile menu to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !mobileMenuButtonRef.current?.contains(e.target as Node)
      ) {
        setMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenu]);

  // Nav links with slug
  const navLinks = [
    { label: "Home", href: `/` },
    { label: "Shop", href: `/marketplace/products` },
    { label: "Categories", href: `/marketplace/categories` },
    { label: "Deals", href: `/marketplace/deals` },
    { label: "Contact", href: `/marketplace/contact` },
  ];

  // Auth handlers
  const handleAuth = () => {
    if (!user) {
      window.location.href =
        "https://auth.salesmanpro.site/signin?callbackUrl=" +
        window.location.origin;
      return;
    }
    if (user.role?.toLowerCase() === "admin") router.push("/dashboards");
    else router.push(`/marketplace/profile`);
  };

  const handleSignup = () => {
    window.location.href =
      "https://auth.salesmanpro.site/signup?callbackUrl=" +
      window.location.origin;
  };

  return (
    <>
      {/* Dynamic theme variables */}
      <style jsx global>{`
        :root {
          --primary-color: ${primary};
          --secondary-color: ${secondary};
        }
      `}</style>

      {/* HEADER */}
      <header
        className={`fixed top-0 w-full z-50 transition-shadow backdrop-blur-xl px-6 py-4
          ${scrolled ? "shadow-xl bg-white/80" : "bg-white/40"}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LEFT: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">

            {/* Mobile Toggle */}
            <button
              ref={mobileMenuButtonRef}
              onClick={() => setMobileMenu(true)}
              className="md:hidden p-2"
            >
              <Bars3BottomLeftIcon className="h-7 w-7 text-gray-700" />
            </button>

            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push(`/site/${slug}`)}
              className="cursor-pointer flex items-center"
            >
              {logoUrl ? (
                <Image decoding="async"
                  src={logoUrl}
                  width={45}
                  height={45}
                  alt={`${name} logo`}
                  className="object-contain  h-20 w-32"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-900">
                  {name || "Store"}
                </span>
              )}
            </motion.div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-10">
              {navLinks.map((item) => (
                <motion.div key={item.label} whileHover={{ y: -2 }}>
                  <Link
                    href={item.href}
                    className="text-gray-800 relative font-medium hover:text-[var(--primary-color)]"
                  >
                    {item.label}
                    <span
                      className="absolute left-0 -bottom-1 h-0.5 w-full scale-x-0 bg-[var(--primary-color)] transition-transform duration-300 origin-left hover:scale-x-100"
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          {/* RIGHT: Icons */}
          <div className="flex items-center gap-6">

            {/* Store Search */}
            <StoreHeaderSearch variant="button" iconClassName="h-6 w-6 text-gray-900" />

            {/* Profile / Login */}
            {status === "loading" ? null : user ? (
              <motion.button onClick={handleAuth} whileHover={{ scale: 1.1 }}>
                <UserIcon className="h-6 w-6 text-gray-900" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="font-medium text-gray-900"
                onClick={handleAuth}
              >
                Login / Signup
              </motion.button>
            )}

            {/* Cart */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="relative"
              onClick={() => {
                if (cart.length === 0) return;
                if (!user) return handleAuth();
                router.push(`/ecommerce/checkout`);
              }}
            >
              <ShoppingBagIcon className="h-6 w-6 text-gray-900" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 text-white bg-red-600 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </motion.button>

            {/* Mobile Menu Toggle (duplicate for left alignment) */}
            <button
              className="hidden md:block"
              onClick={() => setMobileMenu(true)}
            ></button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.35 }}
            className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-[60] p-6 flex flex-col gap-6"
          >
            <button onClick={() => setMobileMenu(false)} className="self-end">
              <XMarkIcon className="h-7 w-7 text-gray-700" />
            </button>

            {/* Nav */}
            <nav className="flex flex-col gap-4">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className="text-lg font-medium text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t" />

            {/* Auth */}
            {user ? (
              <div className="flex flex-col gap-3">
                <button
                  className="w-full py-2 rounded-lg text-white"
                  style={{ background: primary }}
                  onClick={() => {
                    setMobileMenu(false);
                    handleAuth();
                  }}
                >
                  {user.role === "admin" ? "Admin Portal" : "My Account"}
                </button>

                <button
                  onClick={() => {
                    setMobileMenu(false);
                    const returnTo = window.location.origin;
                    signOut({
                        redirect: true,
                        callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                      });        
                  }}
                  className="text-gray-600 underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setMobileMenu(false);
                    handleAuth();
                  }}
                  className="py-2 border rounded-lg"
                >
                  Log In
                </button>

                <button
                  onClick={() => {
                    setMobileMenu(false);
                    handleSignup();
                  }}
                  className="py-2 rounded-lg text-white"
                  style={{ background: primary }}
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="border-t" />

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((s: any) => (
                <a
                  key={s.channel}
                  href={s.url}
                  target="_blank"
                  className="capitalize text-gray-900"
                >
                  {s.channel}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKDROP */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            onClick={() => setMobileMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
          />
        )}
      </AnimatePresence>
    </>
  );
}
