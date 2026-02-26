'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  EnvelopeIcon,
  TruckIcon,
  ChevronDownIcon,
  FireIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import { IStoreCategory } from '@/types/typings';

// Helper for image loader
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Debounce utility
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData,  } = useStoreContext();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Destructure Store Data
  const {
    name = 'Store',
    logoUrl,
    themeSettings = {},
    slug,
    StoreCategory = []
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#F472B6';
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6';

  // --- Auth Handlers ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/ecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const handleSignOut = () => signOut({ callbackUrl: `/` });

  // --- Search Logic ---
  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) console.log('Searching for:', query);
    }, 300),
    [slug]
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  // Lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : 'unset';
  }, [isDrawerOpen]);

  return (
    <header className="w-full bg-white font-sans sticky top-0 z-50 shadow-sm">
      {/* 1. TOP BAR */}
      <div 
        className="hidden md:flex w-full text-white text-[12px] py-2 px-10 justify-between items-center"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center space-x-6 font-medium">
          <div className="flex items-center space-x-2"><PhoneIcon className="h-4 w-4" /><span>+221 33 66 22</span></div>
          <div className="flex items-center space-x-2"><EnvelopeIcon className="h-4 w-4" /><span>support@{slug || 'store'}.com</span></div>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/ecommerce/track-order" className="hover:underline flex items-center space-x-1">
            <TruckIcon className="h-4 w-4" /><span>Track Your Order</span>
          </Link>
          <div className="flex items-center cursor-pointer"><span>$ Dollar (US)</span><ChevronDownIcon className="h-3 w-3 ml-1" /></div>
        </div>
      </div>

      {/* 2. MAIN SECTION */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between gap-4 md:gap-8">
        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsDrawerOpen(true)}>
          <Bars3Icon className="h-7 w-7 text-gray-800" />
        </button>

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          {logoUrl ? (
            <Image src={logoUrl} alt={name} width={120} height={40} loader={imageLoader} className="object-contain h-10 w-auto" />
          ) : (
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
              <span style={{ color: primaryColor }}>●</span> {name}
            </h1>
          )}
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-grow max-w-2xl items-center">
          <div className="flex w-full items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-gray-300">
            <button className="px-4 text-gray-400 border-r border-gray-200 hover:bg-gray-100 transition-colors">
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <input 
              type="text" 
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search for products..." 
              className="flex-grow bg-transparent py-3 px-4 text-sm focus:outline-none" 
            />
            <button className="p-3 text-white transition-opacity hover:opacity-90" style={{ backgroundColor: primaryColor }}>
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 md:space-x-5">
          <button className="hidden sm:block p-2 text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100">
            <HeartIcon className="h-6 w-6" />
          </button>
          
          <button 
            onClick={() => cart.length > 0 ? (user ? router.push('/ecommerce/checkout') : handleGoogleSignIn()) : null} 
            className="flex items-center space-x-3 bg-gray-50 p-1.5 md:p-2 md:pr-4 rounded-xl hover:bg-gray-100 transition-all"
          >
            <div className="relative bg-gray-900 text-white p-2 rounded-lg">
              <ShoppingBagIcon className="h-5 w-5 md:h-6 md:w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">
                  {cart.length}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[10px] text-gray-400 font-bold leading-none uppercase">Cart</p>
              <p className="text-sm font-bold text-gray-900">$0.00</p>
            </div>
          </button>

          <button onClick={handleUserAction} className="flex-shrink-0">
            {user?.image ? (
              <Image src={user.image} alt="User" width={40} height={40} className="rounded-xl border border-gray-200" />
            ) : (
              <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 3. DESKTOP NAV */}
      <div className="hidden md:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between">
          <nav className="flex items-center">
            <Link href="/ecommerce/categories" className="py-4 pr-6 text-sm font-bold text-gray-800 border-r border-gray-100 mr-6 hover:text-gray-600 transition-colors">
              All Categories
            </Link>
            {StoreCategory?.slice(0, 7).map((cat: IStoreCategory) => (
              <Link 
                key={cat.id} 
                href={`/ecommerce/categories/${cat.category?.name?.toLowerCase()}`}
                className="py-4 px-4 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                {cat.displayName || cat.category?.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-2 py-4 font-bold text-sm text-gray-900">
            <FireIcon className="h-5 w-5 text-orange-500" />
            <Link href="/ecommerce/products?filter=hot-deals" className="hover:text-orange-600">HOT DEALS</Link>
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm md:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl flex flex-col md:hidden">
              <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                <span className="font-black text-lg">MENU</span>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><XMarkIcon className="h-6 w-6" /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-4">
                <Link href="/ecommerce/products?filter=hot-deals" onClick={() => setIsDrawerOpen(false)} className="flex items-center space-x-3 p-3 rounded-xl bg-orange-50 text-orange-600 font-bold mb-4">
                  <FireIcon className="h-6 w-6" /><span>Hot Deals</span>
                </Link>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Shop Categories</p>
                {StoreCategory?.map((cat: IStoreCategory) => (
                  <Link key={cat.id} href={`/ecommerce/categories/${cat.category?.name}`} onClick={() => setIsDrawerOpen(false)} className="block p-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-lg">
                    {cat.displayName || cat.category?.name}
                  </Link>
                ))}
              </div>
              <div className="p-5 border-t bg-gray-50 space-y-3">
                {user ? (
                  <button onClick={handleSignOut} className="w-full py-3 rounded-xl font-bold bg-gray-200 text-gray-800">Sign Out</button>
                ) : (
                  <button onClick={handleGoogleSignIn} className="w-full py-3 rounded-xl font-bold text-white shadow-lg" style={{ backgroundColor: primaryColor }}>Login / Sign Up</button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}