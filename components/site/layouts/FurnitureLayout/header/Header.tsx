'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars2Icon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import CartDrawer from './CartDrawer';

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F97316';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // const navLinks = storeFormData?.StoreCategory?.filter(c => c.visible).slice(0, 6) || [];
     // Build dynamic nav links from store categories
    const navLinks = React.useMemo(() => {
      if (!storeFormData?.StoreCategory) return [];
  
      // 1. Filter visible categories
      const rawCategories = (storeFormData.StoreCategory || [])
        .filter((c) => c.visible ?? true)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  
      // 2. Map categories → simplified nav items
      let links = rawCategories.map((cat) => ({
        id: cat.id,
        label: cat.displayName || "Category",
        href: `/${storeFormData.slug}/furnitureecommerce/products?category=${cat.id}`,
      }));
  
      // 3. If fewer than required, pull subcategories
      if (links.length < 5) {
        rawCategories.forEach((cat) => {
          const subs = (cat.subcategories || [])
            .filter((s) => s.visible ?? true)
            .slice(0, 5); // limit subcategories per cat
  
          subs.forEach((sub) =>
            links.push({
              id: sub.id,
              label: sub.name,
              href: `/${storeFormData.slug}/furnitureecommerce/products?subcategory=${sub.slug}`,
            })
          );
        });
      }
  
      // 4. Ensure unique and limit final count
      const seen = new Set();
      const finalLinks = [];
  
      for (let link of links) {
        if (!seen.has(link.label)) {
          finalLinks.push(link);
          seen.add(link.label);
        }
        if (finalLinks.length >= 6) break; // final limit here
      }
  
      return finalLinks;
    }, [storeFormData])

    const handleUserAction = () => {
      if (!user) {
        const url = new URL("https://auth.salesmanpro.site/signin");
        url.searchParams.set("callbackUrl", window.location.href);
        window.location.href = url.toString();
        return;
      }
      router.push(user.role === "admin" ? "/dashboards" : "/furnitureecommerce/profile");
    };


  return (
    <>
      <header 
        className={`fixed top-0 w-full z-50 px-4 md:px-10 transition-all duration-500 ${
          scrolled ? 'pt-4' : 'pt-8'
        }`}
      >
        <div 
          className={`max-w-[1600px] mx-auto transition-all duration-500 rounded-2xl md:rounded-full border border-white/20 shadow-2xl overflow-hidden ${
            scrolled 
              ? 'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl py-3 px-6' 
              : 'bg-white/40 dark:bg-black/20 backdrop-blur-md py-5 px-10'
          }`}
        >
          <div className="flex justify-between items-center">
            
            {/* --- LOGO: Modern & Sharp --- */}
            <Link href="/" className="group flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <div className="w-2 h-2 bg-white dark:bg-zinc-900 rounded-full" />
              </div>
              <span className="text-xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">
                {storeFormData?.name || "HABITAT"}
              </span>
            </Link>

            {/* --- DESKTOP NAV: Kinetic Underlines --- */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.id} 
                  href={link.href}
                  className="px-5 py-2 relative group"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                  <motion.div 
                    className="absolute bottom-0 left-0 h-[2px] bg-zinc-900 dark:bg-white w-0 group-hover:w-full transition-all duration-300" 
                  />
                </Link>
              ))}
            </nav>

            {/* --- UTILITY: Visual Hierarchy --- */}
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/5 dark:bg-white/5 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all">
                <MagnifyingGlassIcon className="w-4 h-4 text-zinc-500" />
                <span className="text-[10px] font-bold uppercase text-zinc-400">Search</span>
              </button>

              <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-2 hidden md:block" />

              <button 
                onClick={() => handleUserAction()}
                className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <UserIcon className="w-5 h-5" />
              </button>

              {/* CART: The Focal Point */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="group relative flex items-center gap-3 pl-2 pr-4 py-2 bg-zinc-900 dark:bg-white rounded-full transition-transform active:scale-95 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)]"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ShoppingBagIcon className="w-4 h-4 text-white dark:text-zinc-900" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-zinc-900">
                  Cart ({cart.length})
                </span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border border-white"></span>
                  </span>
                )}
              </button>

              <button 
                className="lg:hidden p-2 ml-2" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars2Icon className="w-6 h-6 text-zinc-900 dark:text-white" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE MENU: Full Screen Experience --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 flex flex-col p-10 lg:hidden"
          >
            <div className="flex justify-between items-center mb-20">
              <span className="text-xs font-black tracking-[0.3em] text-zinc-400 uppercase">// Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href}
                    className="text-5xl font-light tracking-tighter uppercase hover:italic transition-all inline-block"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4">
               <button className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase text-xs tracking-[0.2em]">
                  Sign In
               </button>
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