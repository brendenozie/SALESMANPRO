'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  Bars2Icon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#ef4444';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dynamicNavLinks = useMemo(() => {
    const categories = (storeFormData?.StoreCategory || [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 5);
    
    return categories.map((cat) => ({
      id: cat.id,
      label: cat.displayName,
      href: `/${storeFormData?.slug}/category/${cat.categoryId}`,
    }));
  }, [storeFormData]);

  const handleUserAction = () => {
    if (!user) {
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", window.location.origin);
      window.location.href = authUrl.toString();
      return;
    }
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/ecommerce/profile`);
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
          scrolled 
            ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-2xl border-b border-zinc-200/50 dark:border-zinc-800/50 py-4 shadow-sm' 
            : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* --- Left: Navigation & Search --- */}
          <div className="flex items-center gap-8 flex-1">
            <button
              className={`transition-all hover:scale-110 active:scale-90 ${
                scrolled ? 'text-zinc-900 dark:text-white' : 'text-white'
              }`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars2Icon className="h-6 w-6 stroke-[1.5]" />
            </button>
            
            <button className={`hidden md:block group transition-colors ${
              scrolled ? 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white' : 'text-white/60 hover:text-white'
            }`}>
              <MagnifyingGlassIcon className="h-5 w-5 stroke-[1.5] group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* --- Center: Brand Identity --- */}
          <Link href="/" className="flex flex-col items-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name || 'Brand'}
                width={140}
                height={45}
                className={`object-contain transition-all duration-500 ${
                  scrolled ? 'brightness-100 dark:invert' : 'brightness-0 invert'
                }`}
                loader={imageLoader}
              />
            ) : (
              <h1 className={`text-2xl md:text-3xl font-black tracking-[0.3em] uppercase transition-all duration-500 ${
                scrolled ? 'text-zinc-900 dark:text-white scale-90' : 'text-white scale-100'
              }`}>
                {name || 'VOGUE'}
              </h1>
            )}
          </Link>

          {/* --- Right: Actions & Cart --- */}
          <div className="flex items-center justify-end gap-6 md:gap-10 flex-1">
            <nav className="hidden lg:flex gap-10">
              {dynamicNavLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-50 ${
                    scrolled ? 'text-zinc-900 dark:text-white' : 'text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-6">
              <button 
                onClick={handleUserAction}
                className={`transition-all hover:scale-110 ${
                  scrolled ? 'text-zinc-900 dark:text-white' : 'text-white/80 hover:text-white'
                }`}
              >
                <UserIcon className="h-5 w-5 stroke-[1.5]" />
              </button>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative group transition-all hover:scale-110 ${
                  scrolled ? 'text-zinc-900 dark:text-white' : 'text-white'
                }`}
              >
                <ShoppingBagIcon className="h-5 w-5 stroke-[1.5]" />
                <AnimatePresence>
                  {cart.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {cart.length}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Fullscreen Boutique Mobile Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 flex flex-col p-8 md:p-16"
          >
            <div className="flex justify-between items-center mb-20">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400">Directory</span>
                <div className="h-0.5 w-10" style={{ backgroundColor: primaryColor }} />
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full border border-zinc-100 dark:border-zinc-800 hover:rotate-90 transition-transform duration-500"
              >
                <XMarkIcon className="h-6 w-6 text-zinc-900 dark:text-white stroke-[1.5]" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-6">
              {dynamicNavLinks.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-5xl md:text-7xl font-light italic font-serif text-zinc-900 dark:text-white hover:text-zinc-400 dark:hover:text-zinc-500 transition-colors tracking-tighter"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-8 md:flex-row md:items-center justify-between pt-12 border-t border-zinc-100 dark:border-zinc-900">
              <button 
                onClick={handleUserAction}
                className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-900 dark:text-white group flex items-center gap-3"
              >
                <span className="w-8 h-[1px] bg-zinc-900 dark:bg-white transition-all group-hover:w-12" />
                {user ? 'View Profile' : 'Member Access'}
              </button>
              
              <div className="flex gap-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <Link href="/shipping">Shipping</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/legal">Legal</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
}