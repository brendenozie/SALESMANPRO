'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, usePathname } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  // --- 1. FUNCTIONAL HOOKS ---
  const { cart } = useStateContext(); // Access global cart state
  const { storeFormData } = useStoreContext(); // Access store data (logo, name, colors)
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  // --- 2. UI STATE ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#FF6B00';

  // --- 3. SCROLL HANDLER ---
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- 4. AUTH LOGIC ---
  const handleUserAction = useCallback(() => {
    if (!user) {
      // Redirect to your specific auth provider
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", window.location.origin + pathname);
      window.location.href = authUrl.toString();
    } else {
      router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/bikeecommerce/profile`);
    }
  }, [user, router, pathname]);

  const navLinks = [
    { label: 'E-Mountain', href: `/bikeecommerce/products` },
    { label: 'City Stealth', href: `/bikeecommerce/categories` },
    { label: 'Support', href: `/bikeecommerce/about` },
  ];

  return (
    <>
      {/* VISUAL PROTECTION: Dark gradient at top ensures text is always readable */}
      {!scrolled && (
        <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-black/80 to-transparent z-[55] pointer-events-none transition-opacity duration-700" />
      )}

      <header
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 ease-in-out ${
          scrolled ? 'py-3' : 'py-8'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* LOGO & MOBILE TRIGGER */}
          <div className="flex items-center gap-6 flex-1 lg:flex-none">
            <button 
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-full" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-7 w-7" />
            </button>
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 flex items-center justify-center bg-white rounded-sm transform group-hover:rotate-[15deg] transition-transform duration-300">
                <span className="text-black font-black italic text-xl">M</span>
              </div>
              <span className="hidden md:block text-white text-2xl font-black italic tracking-tighter uppercase leading-none">
                {name || 'MAMMOTH'}
              </span>
            </Link>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center bg-white/5 backdrop-blur-md rounded-full px-2 border border-white/10">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white/80 hover:text-white transition-all relative group"
              >
                <span className="relative z-10">{item.label}</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 transition-all group-hover:w-4 rounded-full" 
                      style={{ backgroundColor: primaryColor }} />
              </Link>
            ))}
          </nav>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-2 md:gap-4 flex-1 lg:flex-none">
            <button className="hidden sm:flex p-3 text-white hover:bg-white/10 rounded-full transition-all">
              <MagnifyingGlassIcon className="h-5 w-5 stroke-[2.5]" />
            </button>

            <button 
              onClick={handleUserAction}
              className="p-3 text-white hover:bg-white/10 rounded-full transition-all"
            >
              <UserIcon className="h-5 w-5 stroke-[2.5]" />
            </button>

            {/* CART TRIGGER: Functional & Stunning */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative group flex items-center gap-3 pl-4 pr-2 py-2 rounded-full border border-white/20 hover:border-white/40 transition-all bg-black/20"
            >
              <span className="text-[10px] font-black text-white uppercase tracking-widest hidden sm:block">Cart</span>
              <div className="relative p-2 rounded-full" style={{ backgroundColor: primaryColor }}>
                <ShoppingBagIcon className="h-4 w-4 text-white stroke-[3]" />
                {cart.length > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-lg"
                  >
                    {cart.length}
                  </motion.div>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* GLASS BACKGROUND (Visible on Scroll) */}
        <div 
          className={`absolute inset-0 -z-10 transition-transform duration-500 ease-in-out ${
            scrolled ? 'translate-y-0' : '-translate-y-full'
          }`}
          style={{ 
            backgroundColor: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        />
      </header>

      {/* MOBILE MENU: Full Screen Functional Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-white font-black italic text-2xl uppercase tracking-tighter">{name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-white/10 rounded-full">
                <XMarkIcon className="h-8 w-8 text-white" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6">
              {navLinks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={item.href} 
                    className="text-6xl font-black italic text-white uppercase tracking-tighter hover:text-gray-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto">
              <button 
                onClick={handleUserAction}
                className="w-full py-5 rounded-full font-black uppercase tracking-widest text-sm transition-all"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
              >
                {user ? 'My Profile' : 'Sign In'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL CART DRAWER COMPONENT */}
      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
}