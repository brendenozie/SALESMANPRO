'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomRightIcon,
  XMarkIcon,
  UserIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react'; 
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PeanutHeader() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    name = "The Peanut Shop",
    logoUrl,
    themeSettings = {},
  } = storeFormData || {};

  // Color Palette update to match Hero
  const primaryColor = themeSettings?.primaryColor || '#8B4513'; // Saddle Brown
  const darkCocoa = '#3E2723';
  const peanutGold = '#F3A852';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'The Roastery', href: `/ecommerce/products` },
    { label: 'Bundles', href: `/ecommerce/categories` },
    { label: 'Our Story', href: `/` },
  ];

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-peanut: ${primaryColor};
          --dark-cocoa: ${darkCocoa};
        }
      `}</style>

      {/* Top Announcement Bar */}
      <div className="fixed top-0 w-full z-[60] bg-[#3E2723] text-[#FAF7F2] py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] px-4">
        <motion.div 
          animate={{ opacity: [0.6, 1, 0.6] }} 
          transition={{ duration: 3, repeat: Infinity }}
          className="flex items-center justify-center gap-2"
        >
          <TicketIcon className="w-3 h-3 text-[#F3A852]" />
          Free Shipping on all orders over $35!
        </motion.div>
      </div>

      <header
        className={`
          fixed top-10 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl 
          px-6 py-3 
          rounded-2xl z-50 transition-all duration-500
          ${scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(62,39,35,0.1)] border border-white/20 py-2' 
            : 'bg-transparent'} 
        `}
      >
        <div className="flex items-center justify-between">
          
          {/* LEFT: Logo & Brand */}
          <Link href={`/`} className="flex items-center group">
            <motion.div whileHover={{ rotate: -5 }} className="relative flex items-center gap-3">
              {logoUrl ? (
                <div className="w-10 h-10 relative">
                    <Image
                    src={logoUrl}
                    alt={name}
                    fill
                    className="object-contain"
                    loader={imageLoader}
                    />
                </div>
              ) : (
                <div className="w-10 h-10 bg-[#8B4513] rounded-full flex items-center justify-center text-white text-xl">🥜</div>
              )}
              <span className={`text-xl font-black tracking-tighter ${scrolled ? 'text-[#3E2723]' : 'text-[#3E2723]'}`}>
                {name.split(' ')[0]}<span className="text-[#8B4513]">.</span>
              </span>
            </motion.div>
          </Link>

          {/* CENTER: Desktop Nav - Minimalist Pill Style */}
          <nav className="hidden md:flex items-center bg-stone-100/50 p-1 rounded-full border border-stone-200/50 backdrop-blur-sm">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-[#3E2723] hover:bg-white hover:shadow-sm transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* User Profile */}
            <div className="hidden sm:block">
                {user ? (
                <button
                    onClick={() => router.push('/ecommerce/profile')}
                    className="p-2 rounded-full hover:bg-amber-100/50 transition-colors text-[#3E2723]"
                >
                    <UserIcon className="h-5 w-5 stroke-[2.5]" />
                </button>
                ) : (
                <button
                    onClick={handleGoogleSignIn}
                    className="text-[10px] font-black uppercase tracking-widest px-4 py-2 text-[#3E2723] hover:text-[#8B4513]"
                >
                    Sign In
                </button>
                )}
            </div>

            {/* Shopping Cart - Pill Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(false)}
              // onClick={() => cart.length > 0 && router.push(`/ecommerce/checkout`)}
              className="flex items-center gap-3 bg-[#3E2723] text-white px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg shadow-amber-900/20"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span className="hidden md:block text-xs font-black uppercase tracking-widest">
                {cart.length > 0 ? `$${cart.reduce((acc:any, item:any) => acc + item.price, 0).toFixed(2)}` : 'Empty'}
              </span>
              {cart.length > 0 && (
                <span className="bg-[#F3A852] text-[#3E2723] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </motion.button>

            {/* Mobile Toggle */}
            <button
              className="md:hidden p-2 text-[#3E2723]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomRightIcon className="h-6 w-6" />}
            </button>
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
            className="fixed inset-0 z-[40] bg-[#FAF7F2] pt-32 px-8 flex flex-col gap-8 md:hidden"
          >
             <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                    <Link 
                        key={link.label} 
                        href={link.href} 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-4xl font-black text-[#3E2723] tracking-tighter"
                    >
                        {link.label}
                    </Link>
                ))}
             </div>
             
             <div className="mt-auto pb-12 space-y-4">
                <button 
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 bg-[#3E2723] text-white rounded-2xl font-black uppercase tracking-widest"
                >
                    Account Login
                </button>
                <div className="flex justify-center gap-6">
                    <span className="text-4xl opacity-20">🥜</span>
                    <span className="text-4xl opacity-20">🍯</span>
                    <span className="text-4xl opacity-20">🍫</span>
                </div>
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