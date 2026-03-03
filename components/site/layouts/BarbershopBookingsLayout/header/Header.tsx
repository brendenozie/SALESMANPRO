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
// import CartDrawer from './CartDrawer';
// 
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
  const primaryColor = '#D4AF37'; // Matching the Hero's Gold

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
            ? 'bg-black/80 backdrop-blur-2xl border-b border-white/5 py-4' 
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
                  className="object-contain h-8 w-auto brightness-0 invert" 
                  loader={imageLoader} 
                />
              ) : (
                <div className="flex flex-col leading-none">
                  <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-[#D4AF37] transition-colors">
                    {name || 'THE CRAFT'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="h-[1px] w-3 bg-[#D4AF37]" />
                    <span className="text-[7px] uppercase tracking-[0.5em] text-[#D4AF37] font-bold">Bespoke Grooming</span>
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
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 hover:text-[#D4AF37] transition-all relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* RIGHT: ICON SYSTEM */}
          <div className="flex-1 flex items-center justify-end space-x-3 md:space-x-6">
            <button className="p-2 text-white/80 hover:text-[#D4AF37] transition-colors hidden sm:block">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {user ? (
              <button 
                onClick={() => router.push('/ecommerce/profile')} 
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"
              >
                <UserIcon className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={handleGoogleSignIn}
                className="hidden md:flex flex-col items-end group"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-white group-hover:text-[#D4AF37] transition-colors">Members</span>
                <span className="h-[1px] w-4 bg-[#D4AF37]" />
              </button>
            )}

            <button 
              onClick={() => setIsCartOpen(true)} 
              className="relative p-2 text-white group"
            >
              <ShoppingBagIcon className="h-5 w-5 group-hover:text-[#D4AF37] transition-colors" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className="lg:hidden p-2 text-white border border-white/10 rounded-lg"
            >
              <Bars3BottomRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER (Brutal Luxury Design) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-[#0A0A0A] border-l border-white/5 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.5em]">Navigation</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-white/5 text-white rounded-full hover:bg-[#D4AF37] hover:text-black transition-all"
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
                      <span className="text-[#D4AF37] font-serif italic text-xl">0{i + 1}</span>
                      <span className="text-6xl font-black text-white uppercase tracking-tighter group-hover:italic group-hover:text-[#D4AF37] transition-all duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="p-12 border-t border-white/5 bg-white/[0.02]">
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full py-6 bg-[#D4AF37] text-black font-black uppercase tracking-[0.3em] text-[11px] hover:bg-white transition-colors mb-8"
                >
                  Client Login
                </button>
                <div className="grid grid-cols-2 gap-4 text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">
                   <div className="space-y-2">
                     <p className="text-white/60">Follow</p>
                     <p className="hover:text-[#D4AF37] cursor-pointer">Instagram</p>
                     <p className="hover:text-[#D4AF37] cursor-pointer">Facebook</p>
                   </div>
                   <div className="space-y-2 text-right">
                     <p className="text-white/60">Location</p>
                     <p>123 Barber St, NY</p>
                     <p>Bookings: 555-0123</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} /> */}
    </>
  );
}