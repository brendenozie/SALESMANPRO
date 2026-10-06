'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomRightIcon,
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { name, logoUrl } = storeFormData || {};

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

  const navLinks = [
    { label: 'Collection', href: `/` },
    { label: 'Eyeglasses', href: `/glassesecommerce/products` },
    { label: 'Sunglasses', href: `/glassesecommerce/categories` },
    { label: 'Journal', href: `/glassesecommerce/about` },
  ];

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out  py-8
          ${scrolled 
            ? 'bg-white/40 backdrop-blur-xl border-b border-white/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]' 
            : 'bg-transparent '}
        `}
      >
        <div className="container mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between">
          
          {/* LEFT: BRANDING */}
          <div className="flex-1">
            <Link href="/" className="inline-block group">
              {logoUrl ? (
                <Image decoding="async" 
                  src={logoUrl} 
                  alt={name || 'Optics'} 
                  width={140} 
                  height={40} 
                  className="object-contain h-20 w-32 transition-transform group-hover:scale-105" 
                />
              ) : (
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-serif font-black tracking-tighter text-gray-900 italic">
                    {name || 'OPTICS'}
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.4em] text-[#F3A852] font-bold">Visionary Studio</span>
                </div>
              )}
            </Link>
          </div>

          {/* CENTER: ARCHITECTURAL NAV */}
          <nav className="hidden lg:flex items-center space-x-12">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900/80 hover:text-gray-900 transition-all relative group"
              >
                {item.label}
                <motion.span 
                  className="absolute -bottom-2 left-1/2 w-0 h-[1.5px] bg-[#0D4C4F] transition-all group-hover:w-full group-hover:left-0"
                  whileHover={{ width: '100%' }}
                />
              </Link>
            ))}
          </nav>

          {/* RIGHT: ICON SYSTEM */}
          <div className="flex-1 flex items-center justify-end space-x-4 md:space-x-7">
            <StoreHeaderSearch
              variant="button"
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-900"
            />

            {user ? (
              <button 
                onClick={() => router.push('/glassesecommerce/profile')} 
                className="flex items-center gap-2 group p-1"
              >
                <div className="w-8 h-8 rounded-full bg-[#0D4C4F] flex items-center justify-center text-white transition-transform group-hover:scale-110">
                  <UserIcon className="h-4 w-4" />
                </div>
              </button>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="hidden md:flex flex-col items-end group"
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Account</span>
                <span className="h-[1px] w-4 bg-[#F3A852] transition-all group-hover:w-full" />
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 hover:bg-black/5 rounded-full transition-all group"
            >
              <ShoppingBagIcon className="h-5 w-5 text-gray-900 group-hover:scale-110" />
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 bg-[#F3A852] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cart.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="lg:hidden p-2 hover:bg-black/5 rounded-full"
            >
              <Bars3BottomRightIcon className="h-6 w-6 text-gray-900" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER (High-Fashion Design) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 shadow-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-[#F9F6F2] z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-gray-200/50">
                <span className="font-serif italic text-2xl tracking-tighter">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 px-12 py-16 flex flex-col space-y-8">
                {navLinks.map((item, i) => (
                  <motion.div 
                    key={item.label} 
                    initial={{ x: 40, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={item.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-end gap-4"
                    >
                      <span className="text-[10px] font-bold text-[#F3A852] mb-2">0{i + 1}</span>
                      <span className="text-5xl font-light tracking-tighter group-hover:italic group-hover:pl-4 transition-all duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-12 space-y-6">
                {!user ? (
                  <button 
                    onClick={handleGoogleSignIn}
                    className="w-full py-5 bg-gray-900 text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-[#0D4C4F] transition-colors"
                  >
                    Sign In / Register
                  </button>
                ) : (
                   <button 
                    onClick={() => router.push('/glassesecommerce/profile')}
                    className="w-full py-5 border border-black text-black font-bold uppercase tracking-[0.2em] text-[10px]"
                  >
                    My Account
                  </button>
                )}
                <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold opacity-40 px-1">
                  <span>© 2026 {name}</span>
                  <span>Instagram / Twitter</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
}