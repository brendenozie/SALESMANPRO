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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react'; 
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function AgrovetHeader() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#064e3b'; 

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: `/` },
    { label: 'Seeds', href: `/agrovetecommerce/products?cat=seeds` },
    { label: 'Animal Health', href: `/agrovetecommerce/products?cat=livestock` },
    { label: 'Consultancy', href: `/agrovetecommerce/services` },
  ];

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out
          ${scrolled ? 'py-2' : 'py-6'}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav 
            className={`
              relative flex items-center justify-between px-6 py-3 transition-all duration-500
              ${scrolled 
                ? 'bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-full border border-white/40' 
                : 'bg-transparent'}
            `}
          >
            {/* LOGO SECTION */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              <div className="relative w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl bg-white shadow-sm transition-transform group-hover:scale-110">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name || ''}
                    fill
                    className="object-contain p-1  h-8 w-32"
                    loader={imageLoader}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center font-black ${scrolled ? 'text-slate-900' : 'text-white'}`} style={{ background: primaryColor }}>
                    {name?.charAt(0)}
                  </div>
                )}
              </div>
              <span className={`text-xl font-black tracking-tighter transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                {name || 'AgroStore'}
              </span>
            </Link>

            {/* DESKTOP NAV - CENTERED */}
            <div className="hidden md:flex items-center bg-slate-100/50 p-1 rounded-full border border-slate-200/50 backdrop-blur-sm">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-slate-900 transition-all hover:bg-white hover:shadow-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* ACTION ICONS */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* User Account */}
              <button 
                onClick={user ? () => router.push('/agrovetecommerce/profile') : handleGoogleSignIn}
                className="p-2.5 rounded-full text-slate-700 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {/* Cart Button - Styled as a Pill */}
              <button 
                // onClick={() => router.push('/agrovetecommerce/checkout')}
                onClick={() => setIsCartOpen(true)}
                className="group flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="text-sm font-bold">{cart.length}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-2.5 rounded-full bg-white shadow-sm border border-slate-100 text-slate-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3BottomLeftIcon className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* MOBILE MENU - FULL SCREEN OVERLAY STYLE */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[40] bg-white pt-32 px-8 md:hidden"
          >
            <div className="space-y-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-black text-slate-900 tracking-tighter hover:text-emerald-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              
              <div className="pt-12 space-y-4">
                <button 
                   onClick={handleGoogleSignIn}
                   className="w-full py-5 rounded-3xl bg-slate-900 text-white font-black text-xl shadow-2xl"
                >
                  {user ? 'My Profile' : 'Sign In'}
                </button>
                <p className="text-center text-slate-400 text-sm font-medium">
                  Need help? <span className="text-slate-900 underline">Contact Support</span>
                </p>
              </div>
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