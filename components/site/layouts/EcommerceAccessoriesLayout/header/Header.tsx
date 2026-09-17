'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  HeartIcon,
  Squares2X2Icon,
  PhoneIcon,
  TruckIcon,
  Bars3Icon,
  XMarkIcon,
  CpuChipIcon,
  CommandLineIcon,
  SunIcon,
  MoonIcon,
  WrenchIcon
} from '@heroicons/react/24/solid';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import { IStoreCategory } from '@/types/typings';
import CartDrawer from './CartDrawer';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default function AutomotiveDukaHeader() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const {
    name = 'SalesmanPro Duka',
    logoUrl,
    themeSettings = {},
    slug,
    StoreCategory = []
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#F59E0B';

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) console.log('Searching OEM Parts Vault:', query);
    }, 300),
    [slug]
  );

  return (
    <header 
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
      className="w-full bg-white dark:bg-[#09090b] font-sans sticky top-0 z-50 border-b border-gray-200 dark:border-zinc-800 transition-colors duration-300"
    >
      {/* HIGH-PERFORMANCE TOP BAR */}
      <div className="hidden lg:flex w-full bg-zinc-900 text-zinc-400 text-[11px] font-semibold tracking-wider py-2.5 px-8 justify-between items-center border-b border-zinc-800">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-[var(--primary-color)]">
            <CommandLineIcon className="h-3.5 w-3.5 animate-pulse" />
            <span className="font-mono uppercase tracking-widest text-[10px]">DIAGNOSTICS: LIVE CORE V2.6</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-white transition-colors cursor-pointer">
            <PhoneIcon className="h-3.5 w-3.5" />
            <span>HQ DISPATCH: +254 PARTS CALL</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/automotiveecommerce/products/track-order" className="hover:text-[var(--primary-color)] flex items-center space-x-2 transition-colors">
            <TruckIcon className="h-3.5 w-3.5" />
            <span>FLEET LOGISTICS TRACE</span>
          </Link>
          <div className="flex items-center text-white font-medium bg-zinc-800 px-2.5 py-0.5 rounded border border-zinc-700">
            <span className="text-[var(--primary-color)] font-bold mr-1.5 text-[10px]">KES</span>
            <span className="text-[10px]">KSH</span>
          </div>
        </div>
      </div>

      {/* CORE CONTROL CONSOLE */}
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 py-4 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* MOBILE INTERACTIVE CONTROLS */}
        <div className="flex items-center gap-1 lg:hidden">
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            className="p-2 text-zinc-800 dark:text-zinc-200 hover:text-[var(--primary-color)] transition-colors"
            aria-label="Open Menu"
          >
            <Bars3Icon className="h-6 w-6"/>
          </button>
          <div className="lg:hidden">
            <StoreHeaderSearch
              variant="button"
              iconClassName="h-5 w-5 text-zinc-800 dark:text-zinc-200"
              buttonClassName="p-2 hover:text-[var(--primary-color)] transition-colors"
            />
          </div>
        </div>

        {/* LOGO ENGINE */}
        <Link href="/" className="flex-shrink-0 group">
          {logoUrl ? (
            <Image src={logoUrl} alt={name} width={150} height={50} loader={imageLoader} className="object-contain h-12 w-auto" />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="bg-[var(--primary-color)] p-2 rounded transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-amber-500/10">
                <CpuChipIcon className="w-5 h-5 text-zinc-950" />
              </div>
              <h1 className="text-xl lg:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">
                {name.split(' ')[0]}<span className="text-[var(--primary-color)]">.DRIVE</span>
              </h1>
            </div>
          )}
        </Link>

        {/* RACING GRID SEARCH VAULT (DESKTOP) */}
        <div className="hidden lg:flex flex-grow max-w-2xl xl:max-w-3xl items-center">
          <StoreHeaderSearch
            variant="inline"
            placeholder="Search by part number, OEM code, specs..."
          />
        </div>

        {/* SUITE OF COCKPIT ACTIONS */}
        <div className="flex items-center space-x-1.5 md:space-x-3">
          
          {/* VISUAL SHIFT (LIGHT/DARK) */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <SunIcon className="h-5 w-5 text-amber-400" /> : <MoonIcon className="h-5 w-5 text-indigo-500" />}
          </button>

          {/* GARAGE WISHLIST */}
          <button className="hidden sm:flex p-2.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all">
            <HeartIcon className="h-5 w-5"/>
          </button>

          {/* PARTS MANIFEST (CART) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-zinc-950 dark:bg-zinc-900 text-white border border-zinc-800 p-1.5 pl-3 rounded-lg hover:border-[var(--primary-color)] transition-all group"
          >
            <div className="text-left hidden xl:block pr-1">
              <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-0.5">MANIFEST</p>
              <p className="text-xs font-black text-[var(--primary-color)]">0.00 KES</p>
            </div>
            <div className="relative bg-[var(--primary-color)] text-zinc-950 p-2 rounded-md group-hover:scale-95 transition-transform">
              <ShoppingBagIcon className="h-4 w-4 md:h-5 md:w-5"/>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black ring-2 ring-zinc-950">
                  {cart.length}
                </span>
              )}
            </div>
          </button>

          {/* PILOT TERMINAL PROFILE */}
          <button onClick={handleUserAction} className="group flex-shrink-0">
            {user?.image ? (
              <div className="h-9 w-9 relative rounded-full overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 group-hover:border-[var(--primary-color)] transition-all">
                <Image src={user.image} alt="User Autoprofile" fill className="object-cover" loader={imageLoader} />
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-lg text-zinc-500 dark:text-zinc-400 group-hover:text-[var(--primary-color)] group-hover:border-[var(--primary-color)]/50 transition-all">
                <UserIcon className="h-4 w-4 md:h-5 md:w-5"/>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDABLE AUTO-SEARCH */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden px-4 pb-4 border-b border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="flex w-full items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <input
                type="text"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search micro-parts & systems..."
                className="flex-grow bg-transparent py-2.5 px-4 text-xs font-mono text-zinc-900 dark:text-white placeholder-zinc-400 outline-none"
              />
              <button className="p-2.5 mr-1 text-zinc-500 dark:text-zinc-400">
                <MagnifyingGlassIcon className="h-4 w-4"/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MECHANIZED CATEGORIES NAVWAY */}
      <div className="hidden lg:block border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#0b0b0d]">
        <div className="max-w-[1800px] mx-auto px-8 flex items-center justify-between">
          <nav className="flex items-center space-x-1">
            <Link href="/automotiveecommerce/products" className="py-3.5 pr-6 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2 hover:text-[var(--primary-color)] transition-colors border-r border-zinc-200 dark:border-zinc-800 mr-4">
              <WrenchIcon className="h-4 w-4 text-[var(--primary-color)]" /> CATALOG DEPARTMENTS
            </Link>
            {StoreCategory?.slice(0, 6).map((cat: IStoreCategory) => (
              <Link
                key={cat.id}
                href={`/automotiveecommerce/products?categories=${cat.displayName?.toLowerCase()}`}
                className="py-3.5 px-4 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide hover:text-zinc-900 dark:hover:text-white transition-all relative group"
              >
                {cat.displayName || cat.category?.name}
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--primary-color)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 py-3.5 border-l border-zinc-200 dark:border-zinc-800 pl-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Link href="/automotiveecommerce/products?filter=hot-deals" className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider hover:text-red-500 transition-colors">
              CRITICAL STOCK DISPATCH
            </Link>
          </div>
        </div>
      </div>

      {/* SLIDEOUT DASHBOARD SIDEBAR (MOBILE) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 z-[60] bg-zinc-950/80 backdrop-blur-md lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }} className="fixed inset-y-0 left-0 z-[70] bg-white dark:bg-[#09090b] p-6 w-[280px] border-r border-zinc-200 dark:border-zinc-800 lg:hidden flex flex-col shadow-2xl">
               <div className="flex justify-between items-center mb-8">
                 <span className="font-mono text-xs font-bold text-[var(--primary-color)] uppercase tracking-widest">DRIVE CORE // MENU</span>
                 <button onClick={() => setIsDrawerOpen(false)} className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900">
                   <XMarkIcon className="w-6 h-6 text-zinc-900 dark:text-white" />
                 </button>
               </div>
               <nav className="flex flex-col gap-4">
                 {StoreCategory?.map((cat: IStoreCategory) => (
                   <Link 
                     key={cat.id} 
                     href={`/automotiveecommerce/products?categories=${cat.displayName?.toLowerCase()}`} 
                     onClick={() => setIsDrawerOpen(false)} 
                     className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider hover:text-[var(--primary-color)] transition-colors py-2 block border-b border-zinc-100 dark:border-zinc-900"
                   >
                     {cat.displayName || cat.category?.name}
                   </Link>
                 ))}
               </nav>
               <div className="mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <button onClick={toggleTheme} className="flex items-center gap-3 text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 w-full py-2">
                    {isDarkMode ? <SunIcon className="w-4 h-4 text-amber-400"/> : <MoonIcon className="w-4 h-4 text-indigo-500"/>} 
                    <span>{isDarkMode ? 'Light Terminal' : 'Dark Terminal'}</span>
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
      </AnimatePresence>
    </header>
  );
}