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
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
            ? 'py-3 bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* 1. LEFT: LOGO */}
          <Link href="/" className="relative z-[110] flex items-center group">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name || 'Store Logo'}
                width={120}
                height={50}
                className={`transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}  h-20 w-32`}
                loader={imageLoader}
              />
            ) : (
              <span className={`text-2xl font-black tracking-tighter transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                {name?.toUpperCase()}
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
            <div className={`hidden md:flex items-center rounded-full px-4 py-1.5 border transition-all duration-300 ${
              scrolled 
                ? 'bg-gray-100 border-gray-200 text-gray-400 focus-within:ring-2 ring-green-500/20' 
                : 'bg-white/10 border-white/20 text-white/60 focus-within:bg-white/20'
            }`}>
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none focus:ring-0 text-sm placeholder-inherit text-current w-24 lg:w-40"
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
                  onClick={() => signOut({ redirect: true, callbackUrl: "/?logout=true" })}
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