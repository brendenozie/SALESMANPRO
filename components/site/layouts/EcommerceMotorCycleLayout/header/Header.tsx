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
import { useSession, signOut } from 'next-auth/react';
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#E62E2E';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleUserAction = useCallback(() => {
    if (!user) {
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", window.location.origin + pathname);
      window.location.href = authUrl.toString();
    } else {
      router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/motorcycleecommerce/profile`);
    }
  }, [user, router, pathname]);

  const navLinks = [
    { label: 'Showroom', href: `/motorcycleecommerce/products` },
    { label: 'Series', href: `/motorcycleecommerce/categories` },
    { label: 'Custom Shop', href: `/motorcycleecommerce/custom` },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[60] transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'py-3 bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm' 
            : 'py-8 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 flex items-center justify-between">
          
          {/* LEFT: MOBILE TRIGGER & LOGO */}
          <div className="flex items-center gap-6">
            <button
              className={`lg:hidden transition-colors ${scrolled ? 'text-black' : 'text-black'}`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6 stroke-2" />
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || ''}
                  width={140}
                  height={40}
                  className="h-20 w-32 transition-all"
                  loader={imageLoader}
                />
              ) : (
                <span className="text-black text-2xl font-black italic tracking-tighter uppercase">
                  {name || 'MOTO'}
                </span>
              )}
            </Link>
          </div>

          {/* CENTER: MINIMALIST NAV */}
          <nav className="hidden lg:flex items-center gap-12">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 hover:text-black transition-all relative group"
              >
                {item.label}
                <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-black transition-all group-hover:w-full`} 
                      style={{ backgroundColor: scrolled ? 'black' : primaryColor }} />
              </Link>
            ))}
          </nav>

          {/* RIGHT: ACTIONS */}
          <div className="flex items-center gap-3 md:gap-6">
            <button className="p-2 text-black/80 hover:text-black hidden sm:block">
              <MagnifyingGlassIcon className="h-5 w-5 stroke-2" />
            </button>

            <button 
              onClick={handleUserAction}
              className="p-2 text-black/80 hover:text-black"
            >
              <UserIcon className="h-5 w-5 stroke-2" />
            </button>

            {/* CART BUTTON: High Contrast Pill */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 pl-4 pr-1 py-1 rounded-full border border-black/10 hover:border-black/20 transition-all bg-white"
            >
              <span className="text-[10px] font-black text-black uppercase tracking-widest hidden md:block">Cart</span>
              <div className="relative p-2 rounded-full bg-black text-white">
                <ShoppingBagIcon className="h-4 w-4 stroke-[2.5]" />
                {cart.length > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 text-[9px] font-bold rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cart.length}
                  </motion.span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SHOWROOM MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-white p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-black font-black italic text-2xl uppercase tracking-tighter">{name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-black/5 rounded-full hover:bg-black/10 transition-colors">
                <XMarkIcon className="h-8 w-8 text-black" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-10">
              {navLinks.map((item, i) => (
                <Link 
                  key={i}
                  href={item.href} 
                  className="text-5xl font-black italic text-black uppercase tracking-tighter hover:translate-x-4 transition-transform"
                  style={{ color: i === 0 ? primaryColor : 'black' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
              <button 
                onClick={handleUserAction}
                className="w-full py-5 bg-black text-white font-black uppercase tracking-widest text-sm shadow-xl"
              >
                {user ? 'Go to Profile' : 'Member Login'}
              </button>
              <p className="text-center text-[10px] font-bold text-black/20 uppercase tracking-widest">Premium Moto Showroom v2.0</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
}