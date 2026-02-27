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

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};

  // Sophisticated Floral Palette
  const primaryColor = themeSettings?.primaryColor || '#E11D48'; // Rose Red
  const secondaryColor = themeSettings?.secondaryColor || '#0F172A'; // Midnight Slate

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/ecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const navLinks = [
    { label: 'Home', href: `/` },
    { label: 'Shop', href: `/ecommerce/products` },
    { label: 'Collections', href: `/ecommerce/categories` },
  ];

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out
          ${scrolled ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm' : 'py-6 bg-transparent'}
        `}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* --- LEFT: NAVIGATION --- */}
          <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative text-[13px] uppercase tracking-[0.2em] font-bold text-slate-800"
              >
                {item.label}
                <span className="absolute -bottom-1 left-1/2 w-0 h-[1.5px] bg-rose-500 transition-all duration-300 group-hover:w-full group-hover:left-0" />
              </Link>
            ))}
          </nav>

          {/* --- CENTER: LOGO --- */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/" className="block">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Logo'}
                  width={120}
                  height={50}
                  className={`object-contain transition-transform duration-500 ${scrolled ? 'scale-90' : 'scale-110'}`}
                  loader={imageLoader}
                />
              ) : (
                <span className="text-2xl lg:text-3xl font-serif italic text-slate-900 tracking-tight">
                  {name || 'Petal Paradise'}
                </span>
              )}
            </Link>
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="flex items-center space-x-5 md:space-x-8">
            {/* User Profile */}
            <button
              onClick={handleUserAction}
              className="group flex items-center space-x-2 text-slate-800 hover:text-rose-500 transition-colors"
            >
              <UserIcon className="h-5 w-5 stroke-[1.5]" />
              <span className="hidden lg:inline-block text-[12px] uppercase tracking-widest font-bold">
                {user ? 'Account' : 'Login'}
              </span>
            </button>

            {/* Shopping Bag */}
            <button
              onClick={() => cart.length > 0 && (user ? router.push('/ecommerce/checkout') : handleGoogleSignIn())}
              className="relative group p-1"
            >
              <ShoppingBagIcon className="h-5 w-5 text-slate-800 group-hover:text-rose-500 transition-colors stroke-[1.5]" />
              {cart.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
                >
                  {cart.length}
                </motion.span>
              )}
            </button>

            {/* Mobile Menu Trigger */}
            <button
              className="md:hidden p-1 text-slate-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomLeftIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[70] shadow-2xl md:hidden p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-serif italic text-xl">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <XMarkIcon className="h-6 w-6 text-slate-400" />
                </button>
              </div>

              <nav className="flex flex-col space-y-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-2xl font-serif text-slate-900 hover:text-rose-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto pt-10 border-t border-slate-100">
                 <button
                   onClick={handleUserAction}
                   className="w-full py-4 bg-slate-900 text-white rounded-full font-bold text-sm uppercase tracking-widest"
                 >
                   {user ? 'My Profile' : 'Join the Club'}
                 </button>
                 {user && (
                    <button 
                      onClick={() => signOut()}
                      className="w-full mt-4 text-slate-400 text-sm font-medium"
                    >
                      Logout
                    </button>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}