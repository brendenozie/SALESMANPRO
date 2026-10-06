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
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import CartDrawer from './CartDrawer';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PremiumMeatHeader() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  
  // Theme colors adjusted for a Meat Butchery Duka
  const primaryColor = themeSettings?.primaryColor || '#991b1b'; // Deep Red

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
    { label: 'The Farm', href: `/meatecommerce/about` },
    { label: 'Reserve Cuts', href: `/meatecommerce/products?cat=reserve` },
    { label: 'Artisan Boxes', href: `/meatecommerce/products?cat=boxes` },
    { label: 'Delivery', href: `/meatecommerce/delivery` },
  ];

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out ${
          scrolled ? 'py-3' : 'py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav 
            className={`
              relative flex items-center justify-between px-8 py-4 transition-all duration-700
              ${scrolled 
                ? 'bg-black/80 backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/10' 
                : 'bg-transparent'}
            `}
          >
            {/* LOGO SECTION */}
            <Link href="/" className="relative z-10 flex items-center gap-4 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-full bg-white p-0.5 transition-transform group-hover:rotate-12 group-hover:scale-110 shadow-lg">
                {logoUrl ? (
                  <Image decoding="async"
                    src={logoUrl}
                    alt={name || ''}
                    fill
                    className="object-contain  h-20 w-32"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-white rounded-full" style={{ background: primaryColor }}>
                    {name?.charAt(0) || 'T'}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-black tracking-tighter leading-none transition-colors ${scrolled ? 'text-white' : 'text-white'}`}>
                  {name || 'TUYIA FARM'}
                </span>
                <span className="text-[9px] font-bold tracking-[0.3em] text-stone-500 uppercase mt-1">Premium Butchery</span>
              </div>
            </Link>

            {/* DESKTOP NAV - CENTERED FLOATING PILL */}
            <div className={`
              hidden md:flex items-center gap-1 p-1 rounded-full border transition-all duration-500
              ${scrolled 
                ? 'bg-white/5 border-white/10 backdrop-blur-md' 
                : 'bg-black/20 border-white/5 backdrop-blur-sm'}
            `}>
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest text-stone-300 hover:text-white transition-all hover:bg-white/10"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* ACTION ICONS */}
            <div className="flex items-center gap-3">
              {/* Location indicator - subtle trust builder */}
              <div className="hidden lg:flex items-center gap-2 mr-4 border-r border-white/10 pr-6">
                <MapPinIcon className="w-4 h-4 text-stone-500" />
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">NBO Delivery</span>
              </div>

              {/* Search */}
            <StoreHeaderSearch
              variant="button"
              className={`p-3 rounded-xl transition-all border border-white/5 hover:bg-white hover:text-black ${scrolled ? 'text-white' : 'text-white bg-black/20'}`}
            />

            {/* User Account */}
              <button 
                onClick={user ? () => router.push('/meatecommerce/profile') : handleGoogleSignIn}
                className={`p-3 rounded-xl transition-all border border-white/5 hover:bg-white hover:text-black ${scrolled ? 'text-white' : 'text-white bg-black/20'}`}
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {/* Cart Button */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="group flex items-center gap-3 px-6 py-3 rounded-xl transition-all shadow-2xl active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingBagIcon className="w-5 h-5 text-white" />
                <span className="text-sm font-black text-white">{cart.length}</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden p-3 rounded-xl bg-white text-black"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3BottomLeftIcon className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#0a0a0a] flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-2xl font-black tracking-tighter text-white">TUYIA MENU</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-4 bg-white/10 rounded-full">
                <XMarkIcon className="w-8 h-8 text-white" />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 hover:text-red-600 transition-colors"
                  >
                    <span className="text-sm font-serif italic text-stone-600">0{i+1}</span>
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-auto space-y-6">
              <button 
                onClick={handleGoogleSignIn}
                className="w-full py-6 rounded-2xl text-white font-black text-xl border border-white/20"
                style={{ backgroundColor: primaryColor }}
              >
                {user ? 'My Dashboard' : 'Member Login'}
              </button>
              <div className="flex justify-center gap-8 text-stone-500 font-bold text-[10px] uppercase tracking-widest">
                <span>Instagram</span>
                <span>Facebook</span>
                <span>WhatsApp</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
      </AnimatePresence>
    </>
  );
}