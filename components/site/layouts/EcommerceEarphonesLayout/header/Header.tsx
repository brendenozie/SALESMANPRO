'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
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

  const primaryColor = themeSettings?.primaryColor || '#1d4ed8'; // Match Hero Primary
  const secondaryColor = themeSettings?.secondaryColor || '#f59e0b'; // Match Hero Secondary

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/ecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Studio', href: `/` },
    { label: 'Series', href: `/ecommerce/products` },
    { label: 'Cores', href: `/ecommerce/categories` },
  ];

  return (
    <>
      <header
        className={`
          fixed top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl 
          px-6 py-3 
          border transition-all duration-500 z-[100]
          ${scrolled 
            ? 'bg-black/80 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl' 
            : 'bg-transparent border-transparent rounded-none'}
        `}
      >
        <div className="flex items-center justify-between">
          
          {/* ===== LOGO ===== */}
          <Link href={`/`} className="group flex items-center gap-2">
            {logoUrl ? (
              <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                <Image
                  src={logoUrl || "https://placehold.co/100x100/111/FFF?text=Logo"}
                  alt={name || 'Store Logo'}
                  fill
                  className="object-contain brightness-0 invert" // Forces logo to white for dark theme
                  loader={imageLoader}
                />
              </div>
            ) : (
              <span className="text-white text-xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                {name}
              </span>
            )}
          </Link>

          {/* ===== DESKTOP NAV ===== */}
          <nav className="hidden md:flex items-center bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 text-xs font-bold tracking-widest uppercase text-white/60 hover:text-white transition-all hover:scale-105"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ===== ACTIONS ===== */}
          <div className="flex items-center space-x-3">
            {/* Login / Profile */}
            <button
              onClick={handleUserAction}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <UserIcon className="h-5 w-5" />
            </button>

            {/* Cart Button - Styled like a pill */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative group flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-primary transition-all active:scale-95"
              style={{ backgroundColor: cart.length > 0 ? primaryColor : '#fff', color: cart.length > 0 ? '#fff' : '#000' }}
            >
              <ShoppingBagIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              {cart.length > 0 && (
                <span className="bg-black text-white px-1.5 py-0.5 rounded text-[10px] ml-1">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomLeftIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU (DARK THEME) ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black z-[90] flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-4xl font-black text-white hover:text-primary transition-colors uppercase tracking-tighter"
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px w-12 bg-white/20 mx-auto" />
              <button 
                onClick={handleUserAction}
                className="text-white/40 uppercase tracking-[0.3em] text-xs font-bold"
              >
                {user ? 'My Profile' : 'Sign In'}
              </button>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute bottom-12 p-4 border border-white/20 rounded-full"
            >
              <XMarkIcon className="h-8 w-8 text-white" />
            </button>
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