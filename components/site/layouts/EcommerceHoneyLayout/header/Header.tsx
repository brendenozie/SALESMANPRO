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
} from '@heroicons/react/24/outline'; // Using Heroicons as requested
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
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const {
    name,
    logoUrl,
    themeSettings = {},
  } = storeFormData || {};

  // Updated palette based on new design assets
  const primaryColor = '#bc9c64'; // Editorial gold-tan from assets
  const secondaryColor = '#000000';

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

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const [isCartOpen, setIsCartOpen] = useState(false);

  const navLinks = [
    { label: 'Home', href: `/` },
    { label: 'Products', href: `/honeyecommerce/products` },
    { label: 'Varieties', href: `/honeyecommerce/categories` },
  ];

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-300
          ${scrolled ? 'bg-white py-3 shadow-sm' : 'bg-transparent py-6'}
        `}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* LOGO SECTION - Inspired by image_5f4e43.png */}
          <Link href={`/`} className="flex items-center group">
            {logoUrl ? (
              <div className="relative h-20 w-32">
                <Image decoding="async"
                  src={logoUrl}
                  alt={name || 'MEERA'}
                  fill
                  className="object-contain  h-20 w-32"
                />
              </div>
            ) : (
              <span className="text-xl font-black tracking-[0.2em] uppercase italic">{name || 'MELLIFERA'}</span>
            )}
          </Link>

          {/* DESKTOP NAV - Bold Caps from image_5f563a.jpg */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[11px] font-black uppercase tracking-[0.25em] text-black hover:text-[#bc9c64] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ACTION ICONS */}
          <div className="flex items-center space-x-5">
            {/* Search - Subtle Aesthetic */}
            <StoreHeaderSearch
              variant="button"
              className="text-black hover:text-[#bc9c64] transition-colors"
            />

            {/* Cart with count - Styled like image_5f4e43.png */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-black hover:text-[#bc9c64] transition-colors"
            >
              <ShoppingBagIcon className="h-5 w-5 stroke-2" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#bc9c64] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Login/Contact Button - Styled after the gold buttons in your assets */}
            <button
              onClick={user ? () => router.push('/honeyecommerce/profile') : handleGoogleSignIn}
              className="hidden md:block bg-[#bc9c64] text-white px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
            >
              {user ? 'Account' : 'Contact'}
            </button>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden text-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Bars3BottomLeftIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Subtle bottom border to define the section */}
        {!scrolled && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/5 mx-auto max-w-[95%]" />}
      </header>

      {/* MOBILE MENU - Slide from right to match luxury feel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
            className="fixed inset-0 bg-white z-[60] p-10 flex flex-col md:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-sm font-black tracking-widest uppercase">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="h-8 w-8 text-black" />
              </button>
            </div>
            <div className="flex flex-col space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-3xl font-bold uppercase tracking-tighter italic border-b border-gray-100 pb-4"
                >
                  {link.label}
                </Link>
              ))}
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