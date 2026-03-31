'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  Bars3BottomRightIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  ShoppingBagIcon,
  MinusIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';
import LiveSearchSideBar from './LiveSearchSideBar';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 85}`;

export default function Header() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);

  const {
    name,
    logoUrl,
    contactPhone,
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#FF5722';

  // --- Scroll Effect ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserAction = () => {
    if (!user) return signIn();
    user.role?.toLowerCase() === "admin" ? router.push("/dashboards") : router.push(`/restaurent/profile`);
  };

  const navItems = [
    { label: 'The Menu', href: `/restaurent/products` },
    { label: 'Our Story', href: `/restaurent/about` },
    { label: 'Gallery', href: `/restaurent/gallery` },
    { label: 'Find Us', href: `/#contact` },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-[60] transition-all duration-500 ease-in-out px-6 md:px-12 ${
          scrolled ? 'top-4' : 'top-0'
        }`}
      >
        <div 
          className={`max-w-7xl mx-auto transition-all duration-500 rounded-[2rem] border transition-all ${
            scrolled 
              ? 'bg-zinc-950/80 backdrop-blur-2xl border-zinc-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-2 px-8' 
              : 'bg-transparent border-transparent py-2 px-4'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* --- LOGO --- */}
            <Link href="/" className="relative z-10 group">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Logo'}
                  width={140}
                  height={45}
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  loader={loader}
                />
              ) : (
                <span className="text-2xl font-serif italic font-bold text-white tracking-tighter">
                  {name || 'Gourmet'}
                </span>
              )}
            </Link>

            {/* --- DESKTOP NAV --- */}
            <nav className="hidden lg:flex items-center space-x-10">
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-300 hover:text-white transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* --- ACTIONS --- */}
            <div className="flex items-center space-x-3">
              {/* // Trigger in your header actions: */}
              <button onClick={() => setSearchOpen(true)}>
                <MagnifyingGlassIcon className="h-5 w-5  bg-zinc-900/50 text-white " />
              </button>

                {/* Cart Trigger */}
                <button 
                    onClick={() => setCartOpen(true)}
                    className="relative p-3 rounded-full bg-zinc-900/50 text-white border border-zinc-800 hover:bg-zinc-800 transition-all shadow-xl"
                >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-4 ring-zinc-950">
                            {cart.length}
                        </span>
                    )}
                </button>

                {/* User Action */}
                <button 
                    onClick={handleUserAction}
                    className="hidden md:flex items-center gap-3 pl-4 pr-1 py-1 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 transition-all shadow-xl group"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest pl-2">
                        {user ? `Hi, ${user.name?.split(' ')[0]}` : 'Reservations'}
                    </span>
                    <div className="p-2 rounded-full bg-zinc-950 text-white group-hover:rotate-45 transition-transform duration-300">
                        <ArrowRightIcon className="w-4 h-4" />
                    </div>
                </button>

                {/* Mobile Menu Toggle */}
                <button 
                  onClick={() => setMobileMenuOpen(true)} 
                  className="lg:hidden p-3 rounded-full bg-zinc-900/50 text-white border border-zinc-800"
                >
                  <Bars3BottomRightIcon className="h-6 w-6" />
                </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* --- MOBILE FULLSCREEN MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-zinc-950 p-8 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-xl font-serif italic text-white">{name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-4 rounded-full bg-zinc-900 text-white">
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>

            <div className="space-y-8">
                {navItems.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link 
                            href={item.href} 
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-5xl font-serif italic text-zinc-400 hover:text-white transition-colors"
                        >
                            {item.label}
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="space-y-4 border-t border-zinc-900 pt-8">
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Connect with us</p>
                <p className="text-white text-2xl font-medium">{contactPhone}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence> 

      <LiveSearchSideBar 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)} 
        primaryColor={primaryColor} 
      />

      {/* --- CART OVERLAY (SIDEBAR PANEL) --- */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setCartOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" 
            />
            <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-zinc-950 z-[80] shadow-2xl p-8 flex flex-col border-l border-zinc-800"
            >
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-serif italic text-white">Your Order</h2>
                    <button onClick={() => setCartOpen(false)} className="text-zinc-500 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="flex-grow overflow-y-auto space-y-6">
                    {cart.length === 0 ? (
                        <p className="text-zinc-500 font-medium italic text-center py-20">Your table is empty...</p>
                    ) : (
                        cart.map((item: any) => (
                            <div key={item.id} className="flex gap-4 group">
                                <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 border border-zinc-800">
                                    <Image src={item.images?.[0]} alt={item.name} fill className="object-cover" loader={loader} />
                                </div>
                                <div className="flex flex-col justify-between py-1">
                                    <h4 className="text-white font-bold">{item.name}</h4>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => removeFromCart(item)} className="text-zinc-500 hover:text-white"><MinusIcon className="w-4 h-4" /></button>
                                        <span className="text-white text-xs font-black">{item.quantity}</span>
                                        <button onClick={() => addToCart(item)} className="text-zinc-500 hover:text-white"><PlusIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <button 
                        onClick={() => router.push('/restaurent/checkout')}
                        className="w-full py-6 rounded-3xl bg-white text-zinc-950 font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all mt-8"
                    >
                        Proceed to Checkout
                    </button>
                )}
            </motion.div>
            
          </>
        )}
      </AnimatePresence>
    </>
  );
}