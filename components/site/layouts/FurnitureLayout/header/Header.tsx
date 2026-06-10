'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars2Icon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import CartDrawer from './CartDrawer';

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const ticking = useRef(false);

  /* ------------------------------ Scroll State ------------------------------ */
  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --------------------------- Dynamic Nav Builder --------------------------- */
  const navLinks = useMemo(() => {
    const categories = storeFormData?.StoreCategory ?? [];

    const visible = categories
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    let links = visible.map((cat) => ({
      id: cat.id,
      label: cat.displayName || 'Category',
      href: `/furnitureecommerce/products?category=${cat.id}`,
    }));

    if (links.length < 5) {
      visible.forEach((cat) => {
        (cat.subcategories ?? [])
          .filter((s) => s.visible ?? true)
          .slice(0, 3)
          .forEach((sub) =>
            links.push({
              id: sub.id,
              label: sub.name,
              href: `/furnitureecommerce/products?subcategory=${sub.slug}`,
            })
          );
      });
    }

    const seen = new Set<string>();
    return links.filter((l) => {
      if (seen.has(l.label)) return false;
      seen.add(l.label);
      return true;
    }).slice(0, 6);
  }, [storeFormData]);

  /* ---------------------------- User Interaction ----------------------------- */
  const handleUserAction = useCallback(() => {
    if (!user) {
      const url = new URL('https://auth.salesmanpro.site/signin');
      url.searchParams.set('callbackUrl', window.location.href);
      window.location.href = url.toString();
      return;
    }

    router.push(
      user.role === 'admin'
        ? '/dashboards'
        : '/furnitureecommerce/profile'
    );
  }, [user, router]);

  /* -------------------------------------------------------------------------- */

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 px-4 md:px-10 transition-all duration-500 ${
          scrolled ? 'pt-4' : 'pt-8'
        }`}
      >
        <div
          className={`max-w-[1600px] mx-auto rounded-2xl md:rounded-full border border-white/20 shadow-2xl overflow-hidden transition-all duration-500 ${
            scrolled
              ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl py-3 px-6'
              : 'bg-white/40 dark:bg-black/20 backdrop-blur-md py-5 px-10'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
                <div className="w-2 h-2 rounded-full bg-white dark:bg-zinc-900" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                {storeFormData?.name || 'HABITAT'}
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className="relative px-5 py-2 group"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                  <motion.span className="absolute left-0 bottom-0 h-[2px] w-0 bg-zinc-900 dark:bg-white group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* UTILITIES */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/5 dark:bg-white/5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
                <span className="text-[10px] font-bold uppercase text-zinc-400">
                  Search
                </span>
              </button>

              <div className="hidden md:block w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-2" />

              <button
                onClick={handleUserAction}
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {/* CART */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-3 px-4 py-2 bg-zinc-900 dark:bg-white rounded-full active:scale-95 transition-transform"
              >
                <ShoppingBagIcon className="w-4 h-4 text-white dark:text-zinc-900" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-zinc-900">
                  Cart ({cart.length})
                </span>
              </button>

              <button
                className="lg:hidden p-2 ml-2"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars2Icon className="w-6 h-6 text-zinc-900 dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 p-10 flex flex-col lg:hidden"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-xs font-black tracking-[0.3em] text-zinc-400 uppercase">
                // Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-4 border rounded-full"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-5xl font-light uppercase tracking-tighter hover:italic"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

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