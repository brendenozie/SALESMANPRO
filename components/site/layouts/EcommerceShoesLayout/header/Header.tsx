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
import { useEditableContent, EditableElement } from '@/contexts/EditableContentContext';
import { useSession, signOut } from 'next-auth/react'; 
import CartDrawer from './CartDrawer';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

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
  const { buildUrl } = useEditableContent();
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
    { label: 'Drops', href: buildUrl(`/ecommerceshoes/products`) },
    { label: 'Vault', href: buildUrl(`/ecommerceshoes/categories`) },
    { label: 'Story', href: buildUrl(`/ecommerceshoes/about`) },
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

  const handleSignOut = ()=> {
    const returnTo = window.location.origin;

    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  // --- Effects ---
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
            <Link href={buildUrl('/')} className="group relative flex items-center gap-2">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Logo'}
                  width={160}
                  height={80}
                  className="object-contain w-32 h-20 group-hover:rotate-12 transition-transform"
                  loader={imageLoader}
                />
              ) : (
                <EditableElement
                  targetId="header.storeName"
                  componentKey="Header"
                  elementKey="storeName"
                  label="Store Brand Name"
                  defaultValue={name}
                  inline
                >
                  {(val) => (
                    <span className="text-xl font-black italic tracking-tighter uppercase dark:text-white">
                      {val}
                    </span>
                  )}
                </EditableElement>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link, idx) => (
                <EditableElement
                  key={link.label}
                  targetId={`header.nav.${idx}.label`}
                  componentKey="Header"
                  elementKey={`nav.${idx}.label`}
                  label={`Nav ${link.label}`}
                  defaultValue={link.label}
                  inline
                >
                  {(val) => (
                    <Link
                      href={link.href}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                    >
                      {val}
                    </Link>
                  )}
                </EditableElement>
              ))}
            </nav>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-3 sm:gap-6">
            
            {/* Search Toggle */}
            <StoreHeaderSearch
              variant="button"
              buttonClassName="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-white"
              iconClassName="w-5 h-5"
            />

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