'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
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

  const {
    name,
    logoUrl,
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#C5A059'; // Golden accent

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/watchecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const navLinks = [
    { label: 'Home', href: `/` },
    { label: 'Shop', href: `/watchecommerce/products` },
    { label: 'Categories', href: `/watchecommerce/categories` },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 ${
          scrolled 
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10 py-3' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* MOBILE MENU TOGGLE */}
          <button
            className="lg:hidden text-white order-1"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-7 w-7" />
          </button>

          {/* LOGO - Centered on mobile, Left on desktop */}
          <div className="flex-1 lg:flex-none order-2 lg:order-1 flex justify-center lg:justify-start">
            <Link href="/" className="group">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || ''}
                  width={120}
                  height={40}
                  className="h-10 w-32 brightness-0 invert"
                  loader={imageLoader}
                />
              ) : (
                <span className="text-white text-xl font-bold tracking-[0.2em] uppercase">{name}</span>
              )}
            </Link>
          </div>

          {/* DESKTOP NAV - Centered */}
          <nav className="hidden lg:flex items-center space-x-12 order-2">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs uppercase tracking-[0.3em] text-gray-300 hover:text-white transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#C5A059] transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* ACTION ICONS - Right */}
          <div className="flex items-center space-x-5 md:space-x-8 order-3 flex-1 lg:flex-none justify-end">
            <button className="text-white hover:text-[#C5A059] transition-colors hidden sm:block">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            <button 
              onClick={handleUserAction}
              className="text-white hover:text-[#C5A059] transition-colors"
            >
              <UserIcon className="h-5 w-5" />
            </button>

            <button
              // onClick={() => {
              //   if (cart.length === 0) return;
              //   user ? router.push(`/ecommerce/checkout`) : handleGoogleSignIn();
              // }}
              onClick={() => setIsCartOpen(true)}
              className="group relative flex items-center"
            >
              <ShoppingBagIcon className="h-5 w-5 text-white group-hover:text-[#C5A059] transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C5A059] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-black z-[80] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-white font-bold tracking-widest uppercase">{name}</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <XMarkIcon className="h-8 w-8 text-white" />
                </button>
              </div>

              <nav className="flex flex-col space-y-8">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-2xl font-light text-white tracking-wide"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-white/10">
                {!user ? (
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 bg-[#C5A059] text-white uppercase tracking-widest text-sm font-bold"
                  >
                    Login / Sign Up
                  </button>
                ) : (
                  <button
                    onClick={() => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` })}
                    className="text-gray-400 uppercase tracking-widest text-xs"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
      </AnimatePresence>
    </>
  );
}