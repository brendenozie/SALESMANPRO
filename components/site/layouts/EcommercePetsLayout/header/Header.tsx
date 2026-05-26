'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  HeartIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react'; 
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#10B981';
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6';

  // --- Auth Handlers ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/petsecommerce/profile`);
  };

  const handleSignOut = ()=> {
    const returnTo = window.location.origin;

    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Shop', href: `/petsecommerce/products` },
    { label: 'Categories', href: `/petsecommerce/categories` },
    { label: 'Our Story', href: `/petsecommerce/about` },
  ];

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
      `}</style>

      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out px-4 sm:px-8 ${
          scrolled ? 'pt-4' : 'pt-6'
        }`}
      >
        <div 
          className={`mx-auto max-w-7xl flex items-center justify-between transition-all duration-500 px-6 h-20 rounded-[2rem] ${
            scrolled 
              ? 'bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/40' 
              : 'bg-transparent border border-transparent'
          }`}
        >
          {/* 1. BRANDING */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div whileHover={{ scale: 1.05 }} className="relative">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={`${name} logo`}
                  width={40}
                  height={40}
                  className="object-contain  h-20 w-32"
                  loader={imageLoader}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xl">
                  {name?.[0]}
                </div>
              )}
            </motion.div>
            <span className={`text-xl font-black tracking-tight hidden sm:block ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
              {name}
            </span>
          </Link>

          {/* 2. NAVIGATION (PILL STYLE) */}
          <nav className="hidden md:flex items-center bg-slate-100/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-5 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 3. ACTION CENTER */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Search Icon (Visible on desktop) */}
            <button className="p-2.5 rounded-full hover:bg-slate-100 transition-colors text-slate-600 hidden md:block">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Auth Button */}
            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block" />
            
            {status !== 'loading' && (
              user ? (
                <button
                  onClick={handleUserAction}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 overflow-hidden">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 hidden lg:block">My Account</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="px-6 py-2.5 rounded-full text-sm font-black text-white shadow-lg shadow-blue-200/50 hover:scale-105 active:scale-95 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  Login
                </button>
              )
            )}

            {/* Cart Button (Always Highlighted) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all group shadow-lg shadow-slate-200"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <AnimatePresence>
                {cart.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 text-[10px] font-black w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {cart.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-900"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl p-8 flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-2xl font-black">{name}</span>
                <button onClick={() => setMobileMenuOpen(false)}><XMarkIcon className="h-8 w-8" /></button>
              </div>

              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.label} 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl font-bold text-slate-900 hover:text-[var(--primary-color)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-slate-100">
                {!user ? (
                  <div className="grid gap-3">
                    <button onClick={handleGoogleSignIn} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold">Log In</button>
                    <button onClick={handleGoogleSignUp} className="w-full py-4 rounded-2xl border-2 border-slate-100 font-bold">Sign Up</button>
                  </div>
                ) : (
                  <button onClick={handleSignOut} className="w-full py-4 text-rose-500 font-bold flex items-center gap-2">
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
      </AnimatePresence>
    </>
  );
}