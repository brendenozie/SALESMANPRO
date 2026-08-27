"use client";

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
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { name, logoUrl } = storeFormData || {};
  const tealAccent = '#0D9488'; // Signature Pristine Teal

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: `/services` },
    { label: 'E-Shop', href: `/ecommerce/products` },
    { label: 'Pricing', href: `#pricing` },
    { label: 'About', href: `/about` },
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
          fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-in-out
          ${scrolled 
            ? 'bg-white/70 dark:bg-[#080a0c]/80 backdrop-blur-2xl border-b border-slate-100 dark:border-white/5 py-4' 
            : 'bg-transparent py-8'}
        `}
      >
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 flex items-center justify-between">
          
          {/* LEFT: BRANDING */}
          <div className="flex-1">
            <Link href="/" className="inline-block group">
              {logoUrl ? (
                <Image 
                  src={logoUrl} 
                  alt={name || 'Pristine'} 
                  width={140} 
                  height={40} 
                  className={`object-contain h-20 w-32 transition-all duration-500 ${scrolled ? 'brightness-100' : 'brightness-100'}`} 
                  loader={imageLoader} 
                />
              ) : (
                <div className="flex flex-col leading-none">
                  <span className={`text-2xl font-black tracking-tighter uppercase transition-colors duration-500 ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
                    {name || 'PRISTINE'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`h-[1px] w-3 transition-colors ${scrolled ? 'bg-teal-600' : 'bg-teal-400'}`} />
                    <span className={`text-[7px] uppercase tracking-[0.5em] font-black transition-colors ${scrolled ? 'text-teal-600' : 'text-teal-400'}`}>Modern Care</span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* CENTER: NAV */}
          <nav className="hidden lg:flex items-center space-x-12">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group ${scrolled ? 'text-slate-600 dark:text-slate-400 hover:text-teal-600' : 'text-slate-600 dark:text-slate-400 hover:text-teal-600'}`}
              >
                {item.label}
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-teal-600 transition-all group-hover:w-full rounded-full" />
              </Link>
            ))}
          </nav>

          {/* RIGHT: ICON SYSTEM */}
          <div className="flex-1 flex items-center justify-end space-x-2 md:space-x-5">
            <button className={`p-2 transition-colors hidden sm:block ${scrolled ? 'text-slate-400 hover:text-teal-600' : 'text-slate-400 hover:text-teal-600'}`}>
              <MagnifyingGlassIcon className="h-5 w-5 stroke-[2]" />
            </button>

            {user ? (
              <button 
                onClick={() => router.push('/ecommerce/profile')} 
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${scrolled ? 'border-slate-200 text-slate-900 hover:border-teal-600' : 'border-slate-200 text-slate-900 hover:border-teal-600'}`}
              >
                <UserIcon className="h-4 w-4 stroke-[2.5]" />
              </button>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="hidden md:flex flex-col items-end group"
              >
                <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>Concierge</span>
                <span className="h-[1px] w-4 bg-teal-600 transition-all group-hover:w-full" />
              </button>
            )}

            <button 
              className={`relative p-2 group transition-colors ${scrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}
            >
              <ShoppingBagIcon className="h-5 w-5 group-hover:text-teal-600 transition-colors stroke-[2]" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-teal-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cart.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className={`p-2 border rounded-xl transition-all ${scrolled ? 'border-slate-200 text-slate-900' : 'border-slate-200 text-slate-900'}`}
            >
              <Bars3BottomRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[440px] bg-white dark:bg-[#080a0c] z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-10 flex justify-between items-center border-b border-slate-50 dark:border-white/5">
                <span className="text-teal-600 text-[10px] font-black uppercase tracking-[0.5em]">Menu</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl hover:bg-teal-600 hover:text-white transition-all"
                >
                  <XMarkIcon className="h-5 w-5 stroke-[3]" />
                </button>
              </div>

              <div className="flex-1 px-12 py-20 space-y-8">
                {navLinks.map((item, i) => (
                  <motion.div 
                    key={item.label} 
                    initial={{ x: 20, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      href={item.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-6"
                    >
                      <span className="text-teal-600/30 font-black text-2xl group-hover:text-teal-600 transition-colors">0{i + 1}</span>
                      <span className="text-5xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter group-hover:translate-x-3 transition-transform duration-500">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-12 bg-slate-50 dark:bg-white/5">
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full py-6 bg-slate-900 dark:bg-teal-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-3xl hover:scale-[1.02] transition-transform shadow-xl"
                >
                  Client Login
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}