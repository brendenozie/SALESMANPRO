'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import CartDrawer from './CartDrawer';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#16a34a';

  // Handle scroll effect
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

  const navLinks = [
    { label: 'Home', href: `/` },
    { label: 'Shop', href: `/groceriesecommerce/products` },
    { label: 'Categories', href: `/groceriesecommerce/categories` },
  ];

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
          scrolled 
            ? 'py-3 bg-white/95 shadow-sm shadow-sm border-b border-gray-200/50' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* 1. LEFT: LOGO */}
          <Link href="/" className="relative z-[110] flex items-center group">
            {logoUrl ? (
              <Image decoding="async"
                src={logoUrl}
                alt={name || 'Store Logo'}
                className={`transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}  h-20 w-32`}
                width={128}
                height={80}
              />
            ) : (
              <span className={`text-2xl font-black tracking-tighter transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                {name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            )}
          </Link>

          {/* 2. CENTER: NAV (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 hover:bg-white/10 ${
                  scrolled ? 'text-gray-700 hover:text-green-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 3. RIGHT: ACTIONS */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Search Pill (Desktop) */}
            <div className="hidden md:block">
              <StoreHeaderSearch
                variant="pill"
                placeholder="Search groceries..."
                className={`transition-all duration-300 ${
                  scrolled 
                    ? 'bg-gray-100 border-gray-200 text-gray-700' 
                    : 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                }`}
              />
            </div>

            {/* Mobile Search Button */}
            <div className="md:hidden">
              <StoreHeaderSearch
                variant="button"
                className={`p-2.5 rounded-full transition-all active:scale-95 ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              />
            </div>

            {/* Icons Group */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* User Account */}
              <button
                onClick={user ? () => router.push('/groceriesecommerce/profile') : handleGoogleSignIn}
                className={`p-2.5 rounded-full transition-all active:scale-95 ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                {user?.image ? (
                   <img src={user.image} className="h-6 w-6 rounded-full border border-current" alt="profile" />
                ) : (
                  <UserIcon className="h-6 w-6" />
                )}
              </button>

              {/* Cart Button */}
              <button
                // onClick={() => router.push('/ecommerce/checkout')}
                onClick={() => setIsCartOpen(true)}
                className={`relative p-2.5 rounded-full transition-all active:scale-95 ${
                  scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {cart.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 h-5 w-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-current"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cart.length}
                  </motion.span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-full transition-all ${
                  scrolled ? 'text-gray-900 bg-gray-100' : 'text-white bg-white/10'
                }`}
              >
                {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomLeftIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE FULL-SCREEN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-white flex flex-col p-8 pt-24"
          >
            <div className="space-y-8">
              {navLinks.map((link, i) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={link.label}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-black text-gray-900 hover:text-green-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              {!user ? (
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Sign In to Shop
                </button>
              ) : (
                <button 
                  onClick={()=> {
                    const returnTo = window.location.origin;

                    signOut({
                      redirect: true,
                      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                    });
                  }}
                  className="w-full py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-bold"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
      </AnimatePresence>
    </>
  );
}