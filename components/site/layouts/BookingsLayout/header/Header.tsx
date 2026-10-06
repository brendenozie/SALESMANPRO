"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const router = useRouter();

  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const { slug, name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#00A880';

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'benefits', label: 'Why Us' },
    { id: 'testimonials', label: 'Stories' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

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

  // Auth Handlers
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/bookings/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signup');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleSignOut = () => {
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  // Animation Variants
  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 26 } }
  };

  const listVariants = {
    closed: { opacity: 0, y: 15 },
    open: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.05, type: "spring", stiffness: 300 } 
    })
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled
            ? 'py-3 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl shadow-lg dark:shadow-neutral-950/20 border-b border-neutral-200/50 dark:border-neutral-900'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* LOGO WRAPPER MODULE */}
          <Link href="#hero" className="flex items-center gap-3 group z-50 relative">
            <div className="relative flex items-center justify-center">
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                style={{ backgroundColor: primaryColor }}
              />
              {logoUrl && (
                <div className="relative w-10 h-10 overflow-hidden rounded-full ring-2 ring-white dark:ring-neutral-900 shadow-sm transition-all duration-300">
                  <Image decoding="async"
                    src={logoUrl}
                    alt={`${name || 'Brand'} Logo`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <span className="text-lg font-black tracking-tight text-neutral-900 dark:text-white transition-colors duration-300">
              {name || 'Booking Site'}
            </span>
          </Link>

          {/* DESKTOP NAVIGATION PILL */}
          <nav className="hidden md:flex items-center bg-neutral-200/40 dark:bg-neutral-900/50 backdrop-blur-md px-1.5 py-1 rounded-full border border-neutral-300/30 dark:border-neutral-800 transition-colors duration-300">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className="relative px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-full"
              >
                <span className="relative z-10">{item.label}</span>
                {hoveredNav === item.id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-neutral-800 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* DESKTOP AUTHENTICATION ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            <StoreHeaderSearch
              variant="button"
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full transition-colors"
            />
            {!user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all active:scale-95"
                >
                  Log In
                </button>
                <button
                  onClick={handleGoogleSignUp}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md hover:brightness-110 transition-all active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <button
                onClick={handleUserAction}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm transition-all duration-200 group"
              >
                {user.image ? (
                  <div className="relative w-6 h-6 overflow-hidden rounded-full border border-neutral-200 dark:border-neutral-700">
                    <img
                      src={user.image}
                      alt={user.name || 'User Profile'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 dark:text-neutral-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <span className="text-xs font-bold uppercase tracking-wide text-neutral-700 dark:text-neutral-300 max-w-[90px] truncate">
                  {user.name?.split(' ')[0]}
                </span>
              </button>
            )}
          </div>

          {/* MOBILE NAV TOGGLE & SEARCH */}
          <div className="md:hidden flex items-center gap-1.5">
            <StoreHeaderSearch
              variant="button"
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors"
            />
            <button
              onClick={() => setIsOpen(true)}
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* COMPACT INTERACTIVE SIDE PANEL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Shading */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[90] bg-neutral-950/40 dark:bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Slideover Menu Box */}
            <motion.aside
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 right-0 z-[100] w-full sm:w-[360px] bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-900 shadow-2xl flex flex-col transition-colors duration-300"
            >
              {/* Sidebar Slate Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-900">
                <span className="text-base font-black tracking-tight text-neutral-900 dark:text-white">{name || 'Menu'}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Stack Links */}
              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="flex flex-col space-y-1.5">
                  {navItems.map((item, i) => (
                    <motion.a
                      custom={i}
                      variants={listVariants}
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-4 rounded-2xl text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-900 dark:hover:text-white border border-transparent hover:border-neutral-200 dark:hover:border-neutral-850 transition-all group"
                    >
                      {item.label}
                      <ArrowRightIcon className="w-4 h-4 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-900 dark:group-hover:text-white -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </motion.a>
                  ))}
                </nav>
              </div>

              {/* Panel Action Footer Block */}
              <div className="p-6 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-950/50">
                {!user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setIsOpen(false); handleGoogleSignIn(); }}
                      className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { setIsOpen(false); handleGoogleSignUp(); }}
                      className="w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wide">{user.name || 'User'}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-semibold tracking-wider mt-0.5">{user.role || 'Member'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setIsOpen(false); handleUserAction(); }}
                        className="py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                      >
                        Account
                      </button>
                      <button
                        onClick={() => { setIsOpen(false); handleSignOut(); }}
                        className="py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}