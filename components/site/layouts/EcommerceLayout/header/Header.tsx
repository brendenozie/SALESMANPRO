'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

// Hooks & Contexts
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    name,
    logoUrl,
    themeSettings = {},
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || '#6366f1';

  // Auth Handlers
  const handleUserAction = () => {
    if (!user) {
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", window.location.origin);
      window.location.href = authUrl.toString();
      return;
    }
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/ecommerce/profile`);
  };

  // Scroll logic
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Collection', href: `/ecommerce/products` },
    { label: 'Categories', href: `/ecommerce/categories` },
    { label: 'Our Story', href: `/ecommerce/about` },
  ];

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500
          ${scrolled ? 'py-3' : 'py-6'}
        `}
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            layout
            className={`
              relative flex items-center justify-between px-6 py-3 rounded-[2rem]
              transition-all duration-500 border
              ${scrolled 
                ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-slate-200/50 dark:border-gray-800/50 shadow-2xl shadow-black/5' 
                : 'bg-transparent border-transparent'}
            `}
          >
            {/* Logo */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Store'}
                  width={40}
                  height={40}
                  loader={imageLoader}
                  className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all"
                />
              ) : (
                <span className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                  {name}
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Account */}
              <button
                onClick={handleUserAction}
                className="p-2.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-900 transition-all"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {/* Cart Toggle */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="group relative p-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black transition-transform active:scale-95"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {cart.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ring-2 ring-white dark:ring-black"
                    style={{ backgroundColor: primary }}
                  >
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-full text-slate-500"
              >
                {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Mobile Menu Slide */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mx-6 mt-2 p-8 bg-white dark:bg-gray-950 rounded-[2.5rem] border border-slate-100 dark:border-gray-900 shadow-2xl md:hidden"
            >
              <div className="flex flex-col gap-6 text-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-[1px] bg-slate-100 dark:bg-gray-900 w-full" />
                <button 
                  onClick={() => { handleUserAction(); setMobileMenuOpen(false); }}
                  className="text-sm font-bold text-slate-500"
                >
                  {user ? 'My Profile' : 'Login / Sign Up'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
      </AnimatePresence>
    </>
  );
}