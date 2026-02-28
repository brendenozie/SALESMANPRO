'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import CartDrawer from './CartDrawer';

// --- Helpers ---
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
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleButtonRef = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { slug, name, logoUrl, socialLinks = [], themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#F97316'; // Furniture accent (orange)
  const secondaryColor = themeSettings?.secondaryColor || '#334155'; // Stone gray

    // Build dynamic nav links from store categories
    const dynamicNavLinks = React.useMemo(() => {
      if (!storeFormData?.StoreCategory) return [];
  
      // 1. Filter visible categories
      const rawCategories = (storeFormData.StoreCategory || [])
        .filter((c) => c.visible ?? true)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  
      // 2. Map categories → simplified nav items
      let links = rawCategories.map((cat) => ({
        id: cat.id,
        label: cat.displayName || "Category",
        href: `/${storeFormData.slug}/category/${cat.categoryId}`,
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
              href: `/${storeFormData.slug}/subcategory/${sub.slug}`,
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

  // --- Auth Handlers ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/ecommerce/profile`);
  };
  const handleSignOut = () => signOut({ callbackUrl: '/' });
  const handleGoogleSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };
  const handleGoogleSignUp = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signup');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // --- Effects ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
          !document.querySelector('.search-toggle-button')?.contains(event.target as Node)) setSearchOpen(false);

      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) &&
          !mobileMenuToggleButtonRef.current?.contains(event.target as Node)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen, mobileMenuOpen]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) console.log('Search for:', query);
    }, 300),
    [slug]
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  const handleClearSearch = () => setSearchQuery('');

  const toggleMobileMenu = () => {
    const wasOpen = mobileMenuOpen;
    setMobileMenuOpen(!mobileMenuOpen);
    if (wasOpen) mobileMenuToggleButtonRef.current?.focus();
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <nav className={`fixed top-0 w-full z-50 bg-stone-50/80 backdrop-blur-md border-b border-stone-200 transition-shadow duration-300 ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href={`/`} className="flex items-center">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Store Logo'}
                  width={100}
                  height={48}
                  loader={imageLoader}
                  className="object-contain w-24 h-12"
                />
              ) : (
                <h1 className="text-2xl font-serif font-bold text-stone-900 tracking-wide">
                  { name || "HABITAT" }<span className="text-orange-600">.</span>
                </h1>
              )}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex gap-6 text-sm font-medium text-stone-600">
              {/* {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hover:text-orange-700 transition-colors"
                >
                  {item.label}
                </Link>
              ))} */}
              {dynamicNavLinks.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href={item.href} className="block hover:text-orange-700 transition-colors">
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Icons */}
          <div className="flex gap-5 text-stone-800 items-center">
            <MagnifyingGlassIcon
              className="w-6 h-6 cursor-pointer hover:text-orange-600 transition-colors"
              onClick={() => setSearchOpen((p) => !p)}
            />
            {status === 'loading' ? null : user ? (
              <UserIcon
                className="w-6 h-6 cursor-pointer hover:text-orange-600 transition-colors"
                onClick={handleUserAction}
              />
            ) : (
              <button
                className="text-sm font-medium text-stone-700 hover:text-orange-600 transition-colors"
                onClick={handleGoogleSignIn}
              >
                Login / Signup
              </button>
            )}
            <button
              className="relative"
              onClick={() => setIsCartOpen(true)}
              // onClick={() => {
              //   if (cart.length === 0) return;
              //   if (user) router.push(`/ecommerce/checkout`);
              //   else handleGoogleSignIn();
              // }}
            >
              <ShoppingBagIcon className="w-6 h-6 cursor-pointer hover:text-orange-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Toggle */}
            <button
              className="md:hidden"
              onClick={toggleMobileMenu}
              ref={mobileMenuToggleButtonRef}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3BottomLeftIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-stone-50/95 backdrop-blur-md border-t border-stone-200 shadow-lg"
              ref={mobileMenuRef}
            >
              <div className="flex flex-col px-6 py-4 space-y-4">
                {dynamicNavLinks.map((item) => (
                  <Link key={item.label} href={item.href} className="text-stone-700 font-medium hover:text-orange-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-stone-200 my-2" />
                {user ? (
                  <>
                    <button
                      className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => { setMobileMenuOpen(false); handleUserAction(); }}
                    >
                      {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                    </button>
                    <button
                      className="w-full mt-2 text-stone-700 underline hover:text-orange-600"
                      onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-full text-center px-4 py-2 rounded-lg text-stone-700 hover:bg-stone-100 font-medium border border-stone-300 transition-colors"
                      onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                    >
                      Log In
                    </button>
                    <button
                      className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => { setMobileMenuOpen(false); handleGoogleSignUp(); }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
              
        {/* Cart Drawer */}
        <AnimatePresence>
          {isCartOpen && <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />}
        </AnimatePresence>
    </>
  );
}
