'use client';

import React, { useState, useEffect } from 'react';
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
import { useSession } from 'next-auth/react';
import CartDrawer from './CartDrawer';

const imageLoader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    name,
    logoUrl,
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#1d4ed8';
  const secondaryColor = themeSettings?.secondaryColor || '#f59e0b';

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/earphonesecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Studio', href: '/' },
    { label: 'Series', href: '/earphonesecommerce/products' },
    { label: 'Cores', href: '/earphonesecommerce/categories' },
  ];

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`
          fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl
          px-6 py-3 z-[100] transition-all duration-500 border
          ${
            scrolled
              ? `
                rounded-2xl shadow-2xl backdrop-blur-xl
                bg-white/80 border-black/10
                dark:bg-black/80 dark:border-white/10
              `
              : 'bg-transparent border-transparent'
          }
        `}
      >
        <div className="flex items-center justify-between">
          {/* ===== LOGO ===== */}
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <div className="relative w-10 h-10 overflow-hidden rounded-lg">
                <Image
                  src={logoUrl}
                  alt={name || 'Store Logo'}
                  fill
                  loader={imageLoader}
                  className="object-contain dark:brightness-0 dark:invert h-20 w-32"
                />
              </div>
            ) : (
              <span className="text-xl font-black tracking-tighter uppercase italic text-gray-900 dark:text-white">
                {name}
              </span>
            )}
          </Link>

          {/* ===== DESKTOP NAV ===== */}
          <nav
            className="
              hidden md:flex items-center px-6 py-2 rounded-full backdrop-blur-md border
              bg-black/5 border-black/10
              dark:bg-white/5 dark:border-white/10
            "
          >
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="
                  px-4 text-xs font-bold tracking-widest uppercase transition-all
                  text-gray-700 hover:text-black
                  dark:text-white/60 dark:hover:text-white
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ===== ACTIONS ===== */}
          <div className="flex items-center space-x-3">
            {/* User */}
            <button
              onClick={handleUserAction}
              className="
                p-2 rounded-full transition-all
                text-gray-600 hover:text-black hover:bg-black/5
                dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10
              "
            >
              <UserIcon className="h-5 w-5" />
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className={`
                relative flex items-center gap-2 px-4 py-2 rounded-full
                font-bold text-xs uppercase tracking-wider transition-all active:scale-95
                ${
                  cart.length === 0
                    ? 'bg-black text-white dark:bg-white dark:text-black'
                    : ''
                }
              `}
              style={{
                backgroundColor: cart.length > 0 ? primaryColor : undefined,
                color: cart.length > 0 ? '#fff' : undefined,
              }}
            >
              <ShoppingBagIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Bag</span>
              {cart.length > 0 && (
                <span className="ml-1 bg-black/80 text-white px-1.5 py-0.5 rounded text-[10px]">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 text-gray-800 dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3BottomLeftIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="
              fixed inset-0 z-[90] flex flex-col items-center justify-center p-8 text-center
              bg-white text-black
              dark:bg-black dark:text-white
            "
          >
            <div className="space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="
                    block text-4xl font-black uppercase tracking-tighter transition-colors
                    text-gray-900 hover:text-primary
                    dark:text-white dark:hover:text-primary
                  "
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px w-12 bg-black/20 dark:bg-white/20 mx-auto" />

              <button
                onClick={handleUserAction}
                className="uppercase tracking-[0.3em] text-xs font-bold text-gray-500 dark:text-white/40"
              >
                {user ? 'My Profile' : 'Sign In'}
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="
                absolute bottom-12 p-4 rounded-full border
                border-black/20 dark:border-white/20
              "
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CART DRAWER ================= */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
          />
        )}
      </AnimatePresence>
    </>
  );
}