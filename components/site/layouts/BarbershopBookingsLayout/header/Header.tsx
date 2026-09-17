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

  const { name, logoUrl, themeSettings } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#D4AF37';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: `/services` },
    { label: 'Products', href: `/ecommerce/products` },
    { label: 'Master Barbers', href: `/team` },
    { label: 'Journal', href: `/about` },
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
          fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out py-6
          ${scrolled 
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-zinc-200 dark:border-white/5 py-4' 
            : 'bg-transparent'}
        `}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          
          {/* LEFT: BRANDING */}
          <div className="flex-1">
            <Link href="/" className="inline-block group">
              {logoUrl ? (
                <Image 
                  src={logoUrl} 
                  alt={name || 'Barber'} 
                  width={140} 
                  height={40} 
                  className={`object-contain h-20 w-32 transition-all duration-500 ${scrolled ? 'dark:invert-0 invert' : 'invert'}`} 
                  loader={imageLoader} 
                />
              ) : (
                <div className="flex flex-col leading-none">
                  <span 
                    className={`text-2xl font-black tracking-tighter uppercase transition-colors 
                      ${scrolled ? 'text-zinc-900 dark:text-white' : 'text-white'}`}
                  >
                    {name || 'THE CRAFT'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="h-[1px] w-3" style={{ backgroundColor: primaryColor }} />
                    <span className="text-[7px] uppercase tracking-[0.5em] font-bold" style={{ color: primaryColor }}>
                      Bespoke Grooming
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* CENTER: NAV */}
          <nav className="hidden lg:flex items-center space-x-10">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative group
                  ${scrolled ? 'text-zinc-500 dark:text-white/70' : 'text-white/70'}
                  hover:!text-opacity-100`}
                style={{ '--hover-color': primaryColor } as any}
              >
                <span className="group-hover:text-[var(--hover-color)] transition-colors">{item.label}</span>
                <span 
                  className="absolute -bottom-1 left-0 w-0 h-[1px] transition-all group-hover:w-full" 
                  style={{ backgroundColor: primaryColor }}
                />
              </Link>
            ))}
          </nav>

          {/* RIGHT: ICON SYSTEM */}
          <div className="flex-1 flex items-center justify-end space-x-3 md:space-x-6">
            <StoreHeaderSearch
              variant="button"
              className={`p-2 transition-colors ${
                scrolled ? 'text-zinc-600 dark:text-white/80' : 'text-white/80'
              }`}
            />

            {user ? (
              <button 
                onClick={() => router.push('/ecommerce/profile')} 
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all
                  ${scrolled 
                    ? 'border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white' 
                    : 'border-white/10 text-white'}`}
              >
                <UserIcon className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="hidden md:flex flex-col items-end group"
              >
                <span 
                  className={`text-[9px] font-black uppercase tracking-widest transition-colors
                    ${scrolled ? 'text-zinc-900 dark:text-white' : 'text-white'}`}
                >
                  Members
                </span>
                <span className="h-[1px] w-4" style={{ backgroundColor: primaryColor }} />
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)} 
              className={`relative p-2 group transition-colors ${scrolled ? 'text-zinc-900 dark:text-white' : 'text-white'}`}
            >
              <ShoppingBagIcon className="h-5 w-5 group-hover:text-[var(--hover-color)] transition-colors" style={{ '--hover-color': primaryColor } as any} />
              {cart.length > 0 && (
                <span 
                  className="absolute top-0 right-0 text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  {cart.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className={`lg:hidden p-2 border rounded-lg transition-colors
                ${scrolled 
                  ? 'text-zinc-900 dark:text-white border-zinc-200 dark:border-white/10' 
                  : 'text-white border-white/10'}`}
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
              className="fixed inset-0 bg-zinc-950/95 dark:bg-black/95 backdrop-blur-xl z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-white dark:bg-[#0A0A0A] border-l border-zinc-200 dark:border-white/5 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.5em]" style={{ color: primaryColor }}>Navigation</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white rounded-full transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 px-12 flex flex-col justify-center space-y-10">
                {navLinks.map((item, i) => (
                  <motion.div 
                    key={item.label} 
                    initial={{ x: 50, opacity: 0 }} 
                    animate={{ x: 0, opacity: 1 }} 
                    transition={{ delay: i * 0.1 + 0.3 }}
                  >
                    <Link 
                      href={item.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-baseline gap-6"
                    >
                      <span className="font-serif italic text-xl" style={{ color: primaryColor }}>0{i + 1}</span>
                      <span className="text-6xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter group-hover:italic transition-all duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-12 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/[0.02]">
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full py-6 text-white font-black uppercase tracking-[0.3em] text-[11px] transition-colors mb-8"
                  style={{ backgroundColor: primaryColor }}
                >
                  Client Login
                </button>
                <div className="grid grid-cols-2 gap-4 text-[9px] text-zinc-400 dark:text-white/30 uppercase tracking-[0.2em] font-bold">
                   <div className="space-y-2">
                     <p className="text-zinc-500 dark:text-white/60">Follow</p>
                     <p className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Instagram</p>
                     <p className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">Facebook</p>
                   </div>
                   <div className="space-y-2 text-right">
                     <p className="text-zinc-500 dark:text-white/60">Location</p>
                     <p className="text-zinc-800 dark:text-zinc-300">123 Barber St, NY</p>
                     <p className="text-zinc-800 dark:text-zinc-300">Bookings: 555-0123</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}