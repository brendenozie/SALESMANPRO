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
import CartDrawer from './CartDrawer';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';
import { IStoreCategory } from '@/types/typings';

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

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const {
    name = 'Store',
    logoUrl,
    themeSettings = {},
    slug,
    StoreCategory = []
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#F472B6';

  // Handle scroll event to shrink header on desktop
  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/babyecommerce/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", window.location.origin);
    window.location.href = authUrl.toString();
  };

  const handleSignOut = ()=> {
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

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
    <header className="w-full bg-white dark:bg-gray-950 font-sans sticky top-0 z-50 shadow-sm border-b border-gray-100 dark:border-gray-800 transition-all duration-300">

      {/* TOP BAR - Hides on scroll */}
      <div
        className={`hidden md:flex w-full text-white text-[12px] px-10 justify-between items-center transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 opacity-0 py-0' : 'max-h-12 opacity-100 py-2'
        }`}
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center space-x-6 font-medium">
          <div className="flex items-center space-x-2">
            <PhoneIcon className="h-4 w-4"/>
            <span>{ storeFormData?.contactPhone || "+221 33 66 22" }</span>
          </div>
          <div className="flex items-center space-x-2">
            <EnvelopeIcon className="h-4 w-4"/>
            <span>{ storeFormData?.contactEmail || "support@{slug || 'store'}.com" }</span>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <Link href="/babyecommerce/track-order" className="hover:underline flex items-center space-x-1">
            <TruckIcon className="h-4 w-4"/>
            <span>Track Your Order</span>
          </Link>
          <div className="flex items-center cursor-pointer">
            <span>{storeFormData?.currency || "$ Dollar (US)"}</span>
            <ChevronDownIcon className="h-3 w-3 ml-1"/>
          </div>
        </div>
      </div>

      {/* MAIN - Reduces padding on scroll */}
      <div className={`max-w-7xl mx-auto px-4 md:px-10 flex items-center justify-between gap-4 md:gap-8 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>

        {/* MOBILE MENU */}
        <button
          className="md:hidden p-2 text-gray-800 dark:text-gray-200"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Bars3Icon className="h-7 w-7"/>
        </button>

        {/* LOGO - Shrinks on scroll */}
        <Link href="/" className="flex-shrink-0">
          {logoUrl ? (
            <Image decoding="async"
              src={logoUrl}
              alt={name}
              width={120}
              height={40}
              className={`object-contain transition-all duration-300 ${
                isScrolled ? 'h-12 w-24' : 'h-20 w-32'
              }`}
            />
          ) : (
            <h1 className={`font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-all duration-300 ${
              isScrolled ? 'text-xl' : 'text-2xl'
            }`}>
              <span style={{ color: primaryColor }}>●</span> {name}
            </h1>
          )}
        </Link>

        {/* SEARCH */}
        <div className="hidden md:flex flex-grow max-w-2xl items-center">
          <StoreHeaderSearch
            variant="pill"
            placeholder="Search for products..."
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex items-center space-x-3 md:space-x-5">
          {/* MOBILE SEARCH */}
          <div className="md:hidden">
            <StoreHeaderSearch
              variant="button"
              className="p-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            />
          </div>

          <button className="hidden sm:block p-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <HeartIcon className="h-6 w-6"/>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-900 p-1.5 md:p-2 md:pr-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <div className="relative bg-gray-900 dark:bg-black text-white p-2 rounded-lg">
              <ShoppingBagIcon className="h-5 w-5 md:h-6 md:w-6"/>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 font-bold">
                  {cart.length}
                </span>
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[10px] text-gray-400 font-bold leading-none uppercase">Cart</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">$0.00</p>
            </div>
          </button>

          <button onClick={handleUserAction}>
            {user?.image ? (
              <Image decoding="async"
                src={user.image}
                alt="User"
                width={40}
                height={40}
                className="rounded-xl border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <UserIcon className="h-6 w-6"/>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* DESKTOP NAV - Reduces padding on scroll */}
      <div className="hidden md:block border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-10 flex items-center justify-between">
          <nav className="flex items-center">
            <Link
              href="/babyecommerce/products"
              className={`pr-6 text-sm font-bold text-gray-800 dark:text-gray-200 border-r border-gray-100 dark:border-gray-800 mr-6 hover:text-gray-600 dark:hover:text-white transition-all duration-300 ${
                isScrolled ? 'py-2' : 'py-4'
              }`}
            >
              All Categories
            </Link>

            {StoreCategory?.slice(0, 7).map((cat: IStoreCategory) => (
              <Link
                key={cat.id}
                href={`/babyecommerce/products?categories=${cat.categoryId || cat.category?.id || cat.category?.name?.toLowerCase() || cat.displayName?.toLowerCase()}`}
                className={`px-4 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 ${
                  isScrolled ? 'py-2' : 'py-4'
                }`}
              >
                {cat.displayName || cat.category?.name}
              </Link>
            ))}
          </nav>

          <div className={`flex items-center space-x-2 font-bold text-sm text-gray-900 dark:text-white transition-all duration-300 ${
            isScrolled ? 'py-2' : 'py-4'
          }`}>
            <FireIcon className="h-5 w-5 text-orange-500"/>
            <Link href="/babyecommerce/products?filter=hot-deals" className="hover:text-orange-600">
              HOT DEALS
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
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-white dark:bg-gray-950 z-[70] shadow-2xl flex flex-col md:hidden"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                <span className="font-black text-lg dark:text-white">MENU</span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
                >
                  <XMarkIcon className="h-6 w-6 dark:text-white"/>
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4">
                <Link
                  href="/babyecommerce/products"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 font-bold mb-4"
                >
                  <FireIcon className="h-6 w-6"/>
                  <span>Hot Deals</span>
                </Link>

                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                  Shop Categories
                </p>

                {StoreCategory?.map((cat: IStoreCategory) => (
                  <Link
                    key={cat.id}
                    href={`/babyecommerce/products?categories=${cat.categoryId || cat.category?.id || cat.category?.name?.toLowerCase() || cat.displayName?.toLowerCase()}`}
                    onClick={() => setIsDrawerOpen(false)}
                    className="block p-3 text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    {cat.displayName || cat.category?.name}
                  </Link>
                ))}
              </div>

              <div className="p-5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 rounded-xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Login / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CART */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
        )}
      </AnimatePresence>

    </header>
  );
}