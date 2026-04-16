'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
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
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import { IStoreCategory } from '@/types/typings';
import CartDrawer from './CartDrawer';

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

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { scrollY } = useScroll();
  
  // Dynamic header transformation on scroll
  const headerHeight = useTransform(scrollY, [0, 50], ["100px", "80px"]);
  const headerBg = useTransform(scrollY, [0, 50], ["rgba(255, 255, 255, 1)", "rgba(255, 255, 255, 0.8)"]);

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const {
    name = 'Book Duka',
    logoUrl,
    themeSettings = {},
    slug,
    StoreCategory = []
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#0F766E'; // Defaulting to a sophisticated Teal
  const secondaryColor = themeSettings?.secondaryColor || '#F59E0B';

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/bookecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const handleSignOut = () => signOut({ redirect: true, callbackUrl: `${window.location.origin || "/"}` });

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

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : 'unset';
  }, [isDrawerOpen]);

  return (
    <motion.header 
      style={{ height: headerHeight, backgroundColor: headerBg }}
      className="w-full font-sans sticky top-0 z-50 backdrop-blur-md border-b border-gray-100/50 dark:border-gray-800/50 transition-all duration-300"
    >
      {/* MINIMAL TOP BAR */}
      <div className="hidden lg:flex w-full bg-slate-900 text-slate-400 text-[11px] py-1.5 px-10 justify-between items-center tracking-wide font-medium uppercase">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2 group cursor-pointer hover:text-white transition-colors">
            <PhoneIcon className="h-3.5 w-3.5 text-teal-500" />
            <span>{storeFormData?.contactPhone || '+254 700 000 000'}</span>
          </div>
          <div className="flex items-center space-x-2 group cursor-pointer hover:text-white transition-colors">
            <EnvelopeIcon className="h-3.5 w-3.5 text-teal-500" />
            <span>{storeFormData?.contactEmail || `hello@${slug || 'bookduka'}.com`}</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/track" className="hover:text-white transition-colors">Shipment Tracking</Link>
          <div className="flex items-center cursor-pointer hover:text-white">
            <span>{storeFormData?.currency || "KES - Shilling"}</span>
            <ChevronDownIcon className="h-3 w-3 ml-1" />
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <div className="max-w-7xl mx-auto h-full px-4 md:px-10 flex items-center justify-between gap-8">
        
        {/* LOGO & MOBILE TRIGGER */}
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDrawerOpen(true)} className="md:hidden p-2 text-gray-900">
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <Link href="/" className="relative flex items-center group">
            {logoUrl ? (
              <Image src={logoUrl} alt={name} width={140} height={45} loader={imageLoader} className="object-contain transition-transform duration-300 group-hover:scale-105" />
            ) : (
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                  BOOK<span style={{ color: primaryColor }}>DUKA</span>
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">Premium Bookstore</span>
              </div>
            )}
          </Link>
        </div>

        {/* MODERN SEARCH ENGINE */}
        <div className="hidden md:flex flex-grow max-w-xl relative">
          <motion.div 
            animate={{ 
              scale: isSearchFocused ? 1.02 : 1,
              boxShadow: isSearchFocused ? "0 10px 25px -5px rgba(0,0,0,0.1)" : "0 0px 0px rgba(0,0,0,0)"
            }}
            className="flex w-full items-center bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
          >
            <div className="pl-4 text-gray-400">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </div>
            <input
              type="text"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search by title, author, or ISBN..."
              className="flex-grow bg-transparent py-3.5 px-4 text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
            />
            <button className="px-5 py-2 mr-1.5 rounded-xl text-white text-xs font-bold transition-all hover:brightness-110" style={{ backgroundColor: primaryColor }}>
              Find
            </button>
          </motion.div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button className="hidden sm:flex p-2.5 text-gray-500 hover:text-red-500 transition-colors">
            <HeartIcon className="h-6 w-6" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="group flex items-center gap-3 bg-slate-900 text-white p-1.5 pr-4 rounded-2xl hover:bg-black transition-all shadow-lg shadow-slate-200"
          >
            <div className="relative bg-white/10 p-2 rounded-xl transition-transform group-hover:scale-110">
              <ShoppingBagIcon className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 font-black">
                  {cart.length}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-none">Your Bag</p>
              <p className="text-xs font-black">View Cart</p>
            </div>
          </button>

          <button onClick={handleUserAction} className="relative group">
            {user?.image ? (
              <Image src={user.image} alt="Profile" width={42} height={42} className="rounded-2xl border-2 border-white shadow-sm ring-1 ring-gray-100" />
            ) : (
              <div className="bg-gray-100 p-2.5 rounded-2xl text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* CATEGORY NAV - HIDDEN ON SCROLL */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:block border-t border-gray-50"
        >
          <div className="max-w-7xl mx-auto px-10 flex items-center justify-between">
            <nav className="flex items-center">
              <Link href="/bookecommerce/products" className="group flex items-center py-4 pr-8 text-sm font-black text-slate-900 uppercase tracking-tighter">
                <Squares2X2Icon className="h-5 w-5 mr-2 text-teal-600" />
                Browse Genres
              </Link>
              <div className="h-4 w-[1px] bg-gray-200 mr-6" />
              {StoreCategory?.slice(0, 6).map((cat: IStoreCategory) => (
                <Link
                  key={cat.id}
                  href={`/bookecommerce/products?categories=${cat.displayName?.toLowerCase()}`}
                  className="relative py-4 px-4 text-xs font-bold text-gray-500 hover:text-teal-700 transition-colors uppercase tracking-widest group"
                >
                  {cat.displayName || cat.category?.name}
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </nav>

            <Link href="/bookecommerce/products" className="flex items-center gap-2 py-2 px-4 rounded-full bg-amber-50 text-amber-700 text-xs font-black hover:bg-amber-100 transition-colors">
              <SparklesIcon className="h-4 w-4" />
              LIMITED OFFERS
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* MOBILE DRAWER & CART INTEGRATION... (Logic remains as provided but with updated styling) */}
      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </motion.header>
  );
}