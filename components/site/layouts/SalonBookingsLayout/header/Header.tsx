'use client';

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

  // Convert hex to RGB for rgba glass effects
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` 
      : '0, 168, 128';
  };

  const primaryRgb = hexToRgb(primaryColor);

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'benefits', label: 'Why Us' },
    { id: 'testimonials', label: 'Stories' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const handleSignOut = () => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` });
  
  // Animation Variants
  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  const listVariants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { delay: i * 0.1, type: "spring" } 
    })
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled
            ? 'py-3 bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-gray-100'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="#hero" className="flex items-center gap-3 group z-50 relative">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundColor: primaryColor }}
              />
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt={`${name} Logo`}
                  width={44}
                  height={44}
                  loader={loader}
                  className="relative rounded-full object-cover ring-2 ring-white shadow-sm  h-8 w-32"
                />
              )}
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              {name || 'Booking Site'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-gray-100 shadow-sm">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
                className="relative px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors rounded-full"
              >
                <span className="relative z-10">{item.label}</span>
                {hoveredNav === item.id && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-gray-100"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* User/Profile Button */}
            {!user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={handleGoogleSignUp}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-md"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sign Up
                </button>
              </div>
            ) : (
                <button
                  onClick={handleUserAction}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'User Avatar'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="p-1.5 bg-gray-50 rounded-full border border-gray-200 group-hover:border-gray-300 transition-colors">
                      <UserIcon className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>
              )
            }

            {/* Primary CTA */}
            {/* <motion.a
              href="#booking"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-white text-sm shadow-lg overflow-hidden relative group"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, rgba(${primaryRgb}, 0.8))`,
                boxShadow: `0 8px 20px -6px rgba(${primaryRgb}, 0.4)`
              }}
            >
              <span className="relative z-10">Book Now</span>
              <ArrowRightIcon className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.a> */}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 text-gray-800 transition-colors"
          >
            <Bars3Icon className="h-7 w-7" />
          </button>
        </div>
      </motion.header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[90] bg-gray-900/20 backdrop-blur-sm md:hidden"
            />

            {/* Slide-over Panel */}
            <motion.aside
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed inset-y-0 right-0 z-[100] w-full sm:w-[380px] bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <span className="text-lg font-bold text-gray-900">{name}</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6">
                <nav className="flex flex-col space-y-2">
                  {navItems.map((item, i) => (
                    <motion.a
                      custom={i}
                      variants={listVariants}
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-4 rounded-2xl text-xl font-semibold text-gray-800 hover:bg-gray-50 transition-all group"
                    >
                      {item.label}
                      <ArrowRightIcon className="w-5 h-5 text-gray-300 group-hover:text-gray-900 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                    </motion.a>
                  ))}
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                {!user ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { setIsOpen(false); handleGoogleSignIn(); }}
                      className="w-full py-3.5 rounded-xl text-gray-700 font-semibold bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { setIsOpen(false); handleGoogleSignUp(); }}
                      className="w-full py-3.5 rounded-xl text-white font-semibold shadow-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role || 'Member'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => { setIsOpen(false); handleUserAction(); }}
                        className="py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                      >
                        My Account
                      </button>
                      <button
                        onClick={() => { setIsOpen(false); handleSignOut(); }}
                        className="py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100"
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