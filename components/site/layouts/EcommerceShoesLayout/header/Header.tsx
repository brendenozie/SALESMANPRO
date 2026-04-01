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
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react'; 
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();

  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleButtonRef = useRef<HTMLButtonElement>(null);

  const { name, logoUrl, socialLinks = [], themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#ef4444';

  const navLinks = [
    { label: 'Drops', href: `/ecommerceshoes/products` },
    { label: 'Vault', href: `/ecommerceshoes/categories` },
    { label: 'Story', href: `/ecommerceshoes/about` },
  ];

  // --- Handlers ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/ecommerceshoes/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.href);
    window.location.href = authUrl.toString();
  };

  const handleSignOut = () => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` });

  // --- Effects ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  return (
    <>
      <header
        className={`
          fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 sm:px-8 py-4 z-50 transition-all duration-300
          ${scrolled ? 'top-2' : 'top-0'}
        `}
      >
        <div className={`
          flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300
          ${scrolled 
            ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-white/10' 
            : 'bg-transparent'}
        `}>
          
          {/* Logo Section */}
          <div className="flex items-center gap-12">
            <Link href="/" className="group relative flex items-center gap-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Logo'}
                  width={40}
                  height={40}
                  className="object-contain w-10 h-10 group-hover:rotate-12 transition-transform"
                  loader={imageLoader}
                />
              ) : (
                <span className="text-xl font-black italic tracking-tighter uppercase dark:text-white">
                  {name}
                </span>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Search Toggle */}
            <div className="relative flex items-center">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-0 flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden"
                  >
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Find your vibe..."
                      className="bg-transparent px-4 py-2 text-xs font-bold outline-none w-full dark:text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 relative z-10 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
              >
                {searchOpen ? <XMarkIcon className="w-5 h-5" /> : <MagnifyingGlassIcon className="w-5 h-5" />}
              </button>
            </div>

            {/* Auth/Profile */}
            {user ? (
              <button 
                onClick={handleUserAction}
                className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 transition-all overflow-hidden"
              >
                {user.image ? (
                  <img src={user.image} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 m-1.5 dark:text-white" />
                )}
              </button>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="hidden sm:block text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform"
              >
                Sign In
              </button>
            )}

            {/* Cart Icon */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              {cart.length > 0 && (
                <span 
                  className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white animate-bounce"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              ref={mobileMenuToggleButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 dark:text-white"
            >
              <Bars3BottomLeftIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-zinc-950 z-[60] shadow-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-black italic uppercase dark:text-white">{name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 dark:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-black italic uppercase tracking-tighter hover:opacity-50 transition-opacity dark:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-6">
              {!user && (
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest rounded-xl"
                >
                  Join the Club
                </button>
              )}
              <div className="flex gap-4">
                {socialLinks.map((s: any) => (
                  <a key={s.channel} href={s.url} className="text-xs font-black uppercase tracking-widest text-gray-400">
                    {s.channel}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
      </AnimatePresence>
    </>
  );
}