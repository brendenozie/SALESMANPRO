'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};

  const accentColor = '#FF003C'; // Empire Red

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/gamingecommerce/profile`);
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
    { label: 'HOME', href: `/` },
    { label: 'SHOP', href: `/gamingecommerce/products` },
    { label: 'COLLECTIONS', href: `/gamingecommerce/categories` },
  ];

  return (
    <>
      <style jsx global>{`
        :root {
          --header-accent: ${accentColor};
        }
        .gaming-skew {
          clip-path: polygon(5% 0%, 100% 0%, 95% 100%, 0% 100%);
        }
      `}</style>

      <header
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-300
          ${scrolled 
            ? 'bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/10 py-3' 
            : 'bg-transparent py-5'}
        `}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* ===== LOGO ===== */}
          <Link href={`/`} className="group flex items-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name || 'Store Logo'}
                width={120}
                height={50}
                className="object-contain dark:invert  h-20 w-32"
                loader={imageLoader}
              />
            ) : (
              <span className="text-zinc-900 dark:text-white text-2xl font-black italic tracking-tighter transition-colors">
                EMPIRE <span className="text-[var(--header-accent)]">GEMS</span>
              </span>
            )}
          </Link>

          {/* ===== DESKTOP NAV ===== */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="relative px-6 py-2 text-sm font-black tracking-widest text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white transition-colors group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-[var(--header-accent)] transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </nav>

          {/* ===== ACTIONS ===== */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <StoreHeaderSearch
              variant="button"
              className="p-2 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all rounded-sm border border-transparent hover:border-zinc-200 dark:hover:border-white/20"
            />

            {/* User Icon */}
            <button
              onClick={handleUserAction}
              className="p-2 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all rounded-sm border border-transparent hover:border-zinc-200 dark:hover:border-white/20"
            >
              <UserIcon className="h-5 w-5" />
            </button>

            {/* Cart Button (Industrial Design) */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative bg-zinc-900 dark:bg-white text-white dark:text-black p-2 px-4 flex items-center gap-2 font-black text-xs hover:bg-[var(--header-accent)] hover:text-white transition-all gaming-skew"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span className="hidden sm:inline">CART</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 dark:bg-black text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-zinc-900 dark:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-7 w-7" /> : <Bars3BottomLeftIcon className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-white dark:bg-black flex flex-col p-8 pt-24"
          >
            <div className="space-y-8">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-white hover:text-[var(--header-accent)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <button
                onClick={handleUserAction}
                className="w-full py-4 bg-zinc-900 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest gaming-skew"
              >
                {user ? 'PROFILE' : 'LOGIN / SIGNUP'}
              </button>
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