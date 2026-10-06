'use client';

import React, { useState, useCallback } from 'react';
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
  MoonIcon
} from '@heroicons/react/24/solid';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
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

export default function IndustrialHeader() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
    name = 'SalesmanPro Duka',
    logoUrl,
    themeSettings = {},
    slug,
    StoreCategory = []
  } = storeFormData || {};

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
      if (query.length > 2) console.log('Searching Inventory:', query);
    }, 300),
    [slug]
  );

  return (
    <header className="w-full bg-white dark:bg-[#050505] font-sans sticky top-0 z-50 border-b-2 border-gray-100 dark:border-zinc-900 transition-colors duration-300">
      
      {/* TACTICAL TOP BAR - Compact height */}
      <div className="hidden lg:flex w-full bg-gray-50 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 text-[9px] xl:text-[10px] font-black uppercase tracking-[0.15em] xl:tracking-[0.2em] py-1.5 px-6 xl:px-10 justify-between items-center border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-500">
            <CommandLineIcon className="h-3 w-3"/>
            <span>SYSTEM READY // V2.6</span>
          </div>
          <div className="flex items-center space-x-1.5 hover:text-black dark:hover:text-white transition-colors cursor-pointer font-bold">
            <PhoneIcon className="h-3 w-3"/>
            <span>+254 HQ DISPATCH</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/hardwareecommerce/products/track-order" className="hover:text-amber-600 dark:hover:text-amber-500 flex items-center space-x-1.5 transition-colors font-bold">
            <TruckIcon className="h-3 w-3"/>
            <span>LOGISTICS TRACKING</span>
          </Link>
          <div className="flex items-center text-gray-900 dark:text-white font-bold">
            <span className="bg-amber-500 text-black px-1.5 py-0.5 rounded-sm mr-1.5 text-[8px] xl:text-[9px]">KES</span>
            <span>Kenya Shilling</span>
          </div>
        </div>
      </div>

      {/* MAIN COMMAND NAV - Tightened mobile & desktop padding */}
      <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-10 py-2 sm:py-3 md:py-4 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
        
        {/* MOBILE TRIGGER */}
        <div className="flex items-center md:hidden">
          <button 
            onClick={() => setIsDrawerOpen(true)} 
            className="p-1.5 sm:p-2 text-gray-900 dark:text-white hover:text-amber-500 transition-colors"
            aria-label="Open Menu"
          >
            <Bars3Icon className="h-6 w-6 sm:h-7 sm:w-7"/>
          </button>
        </div>

        {/* BRAND LOGO - Responsive dimensions */}
        <Link href="/" className="flex-shrink-0 group">
          {logoUrl ? (
            <Image decoding="async" 
              src={logoUrl} 
              alt={name} 
              width={140} 
              height={45} 
              className="object-contain h-8 sm:h-11 md:h-14 lg:h-16 w-auto" 
            />
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-amber-500 p-1 sm:p-1.5 rotate-3 group-hover:rotate-0 transition-transform">
                <CpuChipIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black" />
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                {name.split(' ')[0]}<span className="text-amber-500">.OS</span>
              </h1>
            </div>
          )}
        </Link>

        {/* INDUSTRIAL SEARCH BAR (Desktop & Tablet) */}
        <div className="hidden md:flex flex-grow max-w-xl lg:max-w-3xl items-center">
          <StoreHeaderSearch
            variant="pill"
            placeholder="ENTER PART NO. OR CATEGORY..."
            className="w-full bg-gray-100 dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-white font-mono text-xs"
          />
        </div>

        {/* ACTION SUITE - Compact sizing on mobile */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          {/* MOBILE SEARCH TRIGGER */}
          <div className="md:hidden">
            <StoreHeaderSearch
              variant="button"
              className="p-2 text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:text-amber-600 dark:hover:text-amber-500 transition-all"
            />
          </div>

          {/* THEME TOGGLE */}
          <button 
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 md:p-3 text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:text-amber-600 dark:hover:text-amber-500 transition-all"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" /> : <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          {/* WISHLIST (Tablet & Desktop) */}
          <button className="hidden sm:flex p-2.5 md:p-3 text-gray-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-zinc-600 transition-all">
            <HeartIcon className="h-5 w-5 md:h-6 md:w-6"/>
          </button>

          {/* CART BUTTON */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-1.5 md:gap-4 bg-gray-100 dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 p-1 md:p-2 lg:pr-5 hover:border-amber-500 transition-all"
          >
            <div className="relative bg-amber-500 text-black p-1.5 md:p-2">
              <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"/>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gray-900 dark:bg-white text-white dark:text-black text-[8px] sm:text-[9px] w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-black border-2 border-white dark:border-[#050505]">
                  {cart.length}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[9px] text-gray-500 dark:text-zinc-500 font-black uppercase leading-none tracking-widest mb-1">Manifest</p>
              <p className="text-xs md:text-sm font-black text-gray-900 dark:text-white italic">0.00 KES</p>
            </div>
          </button>

          {/* USER PROFILE */}
          <button onClick={handleUserAction} className="ml-0.5 sm:ml-1 md:ml-2 group">
            {user?.image ? (
              <Image decoding="async" 
                src={user.image} 
                alt="User" 
                width={36} 
                height={36} 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 border-2 border-gray-200 dark:border-zinc-800 group-hover:border-amber-500 transition-all object-cover" 
              />
            ) : (
              <div className="bg-gray-100 dark:bg-zinc-900 border-2 border-gray-200 dark:border-zinc-800 p-2 sm:p-2.5 text-gray-500 dark:text-zinc-400 group-hover:text-amber-600 group-hover:border-amber-500 transition-all">
                <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6"/>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE COMPACT SEARCH ROW (md:hidden) */}
      <div className="block md:hidden px-3 pb-2.5 pt-0">
        <div className="flex w-full items-center bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus-within:border-amber-500">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="SEARCH PARTS & CATEGORIES..."
            className="w-full bg-transparent py-2 px-3 text-[11px] font-mono font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 outline-none"
          />
          <button className="p-2 bg-amber-500 text-black">
            <MagnifyingGlassIcon className="h-4 w-4"/>
          </button>
        </div>
      </div>

      {/* TACTICAL CATEGORY NAV - Horizontal scrollable strip on medium screen */}
      <div className="hidden md:block border-t border-gray-100 dark:border-zinc-900 bg-white dark:bg-[#080808]">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10 flex items-center justify-between overflow-x-auto scrollbar-none">
          <nav className="flex items-center whitespace-nowrap">
            <Link href="/hardwareecommerce/products" className="py-2.5 lg:py-3.5 pr-6 text-[11px] lg:text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.15em] border-r border-gray-100 dark:border-zinc-900 mr-6 flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-500 transition-colors flex-shrink-0">
              <Bars3Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4" /> ALL DEPARTMENTS
            </Link>
            {StoreCategory?.slice(0, 6).map((cat: IStoreCategory) => (
              <Link
                key={cat.id}
                href={`/hardwareecommerce/products?categories=${cat.displayName?.toLowerCase()}`}
                className="py-2.5 lg:py-3.5 px-4 lg:px-6 text-[9px] lg:text-[10px] font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-all relative group flex-shrink-0"
              >
                {cat.displayName || cat.category?.name}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3 py-2.5 lg:py-3.5 pl-4 flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-orange-600 dark:bg-orange-500 animate-ping" />
            <Link href="/hardwareecommerce/products?filter=hot-deals" className="text-[10px] lg:text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter hover:text-orange-600 dark:hover:text-orange-500 transition-colors">
              PRIORITY DISPATCH
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsDrawerOpen(false)} 
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden" 
            />
            <motion.div 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[70] bg-white dark:bg-[#050505] p-6 w-[280px] border-r-2 border-amber-500 md:hidden flex flex-col"
            >
               <div className="flex justify-between items-center mb-8">
                 <span className="font-black text-amber-600 dark:text-amber-500 italic uppercase text-sm">System Menu</span>
                 <button onClick={() => setIsDrawerOpen(false)} className="p-1 text-gray-900 dark:text-white">
                   <XMarkIcon className="w-7 h-7"/>
                 </button>
               </div>
               <nav className="flex flex-col gap-5 overflow-y-auto">
                 <Link 
                   href="/hardwareecommerce/products" 
                   onClick={() => setIsDrawerOpen(false)} 
                   className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest flex items-center gap-2"
                 >
                   <Bars3Icon className="w-4 h-4"/> ALL DEPARTMENTS
                 </Link>
                 <hr className="border-gray-100 dark:border-zinc-900" />
                 {StoreCategory?.map((cat: IStoreCategory) => (
                   <Link 
                     key={cat.id} 
                     href={`/hardwareecommerce/products?categories=${cat.displayName?.toLowerCase()}`} 
                     onClick={() => setIsDrawerOpen(false)} 
                     className="text-xs font-black text-gray-600 dark:text-zinc-400 uppercase tracking-widest hover:text-amber-500 transition-colors"
                   >
                     {cat.displayName || cat.category?.name}
                   </Link>
                 ))}
               </nav>
               <div className="mt-auto pt-6 border-t border-gray-100 dark:border-zinc-900">
                  <button 
                    onClick={toggleTheme} 
                    className="flex items-center gap-3 text-xs font-black uppercase text-gray-500 dark:text-zinc-400 hover:text-amber-500 transition-colors"
                  >
                    {isDarkMode ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>} 
                    {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
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