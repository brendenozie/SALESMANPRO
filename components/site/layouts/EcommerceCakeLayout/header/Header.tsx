'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import CartDrawer from './CartDrawer';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#D97706';

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
    { label: 'Menu', href: `/cakeecommerce/categories` },
    { label: 'Breads', href: `/cakeecommerce/products?category=breads` },
    { label: 'Cakes', href: `/cakeecommerce/products?category=cakes` },
    { label: 'Croissant', href: `/cakeecommerce/products?category=croissant` },
  ];

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/cakeecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <>
      {/* Top Thin Border (matches reference) */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-[#E6D5B8] z-[60]" />

      <header
        className={`fixed top-1.5 left-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-lg py-3 shadow-sm' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* 1. LOGO SECTION - Left Aligned */}
          <div className="flex-1">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                {logoUrl ? (
                  <Image decoding="async"
                    src={logoUrl}
                    alt={name || 'Sweet Crumbs'}
                    width={140}
                    height={50}
                    className="h-20 w-32 object-contain transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-start">
                    <span className="text-amber-500 text-3xl leading-none">🥐</span>
                    <span className="text-black text-xl font-black tracking-tighter uppercase leading-none mt-1">
                        Sweet<br/>Crumbs
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>

          {/* 2. CENTER NAVIGATION - Minimalist & Spaced */}
          <nav className="hidden md:flex items-center space-x-12">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative text-[13px] font-bold uppercase tracking-[0.15em] ${scrolled ? 'text-gray-900' : 'text-white'} hover:text-amber-600 transition-colors duration-300 group`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* 3. ACTION ICONS - Elegant Thin Strokes */}
          <div className="flex-1 flex items-center justify-end space-x-6">
            <StoreHeaderSearch
              variant="button"
              className={`${scrolled ? 'text-gray-900' : 'text-white'} hover:text-amber-600 transition-colors`}
            />

            <button 
              onClick={() => setIsCartOpen(true)}
              className={`relative ${scrolled ? 'text-gray-900' : 'text-white'} hover:text-amber-600 transition-colors`}
            >
              <ShoppingCartIcon className="h-5 w-5 stroke-[2px]" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>

            <button 
              onClick={handleUserAction}
              className={`${scrolled ? 'text-gray-900' : 'text-white'} hover:text-amber-600 transition-colors`}
            >
              <UserIcon className="h-5 w-5 stroke-[2px]" />
            </button>

            <button
              className={`md:hidden ${scrolled ? 'text-gray-900' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[70] md:hidden flex flex-col justify-center items-center space-y-8"
          >
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-10 right-10 text-black"
            >
              <XMarkIcon className="h-10 w-10" />
            </button>
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-3xl font-black uppercase tracking-widest ${scrolled ? 'text-gray-900' : 'text-white'} hover:text-amber-600`}
              >
                {item.label}
              </Link>
            ))}
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