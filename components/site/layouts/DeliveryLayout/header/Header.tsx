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
import { useSession, signIn, signOut } from 'next-auth/react';

// Helper for image loader
const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Debounce utility function
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
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleButtonRef = useRef<HTMLButtonElement>(null);

  const { slug, name, logoUrl, socialLinks = [], themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#6366F1'; // Fashion Indigo
  const secondaryColor = themeSettings?.secondaryColor || '#EC4899'; // Fashion Pink

  // --- Auth Handlers ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/ecommerce/profile`);
  };
  const handleSignOut = () => signOut({ callbackUrl: `/` });
  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };
  const handleGoogleSignUp = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signup");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  // --- Click outside handlers ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
          !document.querySelector('.search-toggle-button')?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) &&
          !mobileMenuToggleButtonRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen, mobileMenuOpen]);

  // Focus search input when open
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Header shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Navigation links
  const navLinks = ['New Arrivals', 'Men', 'Women', 'Accessories', 'Sale'];

  // Debounced search
  const handleSearch = useCallback(debounce((query: string) => {
    if (query.length > 2) console.log('Search:', query);
  }, 300), [slug]);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  const handleClearSearch = () => setSearchQuery('');
  const toggleMobileMenu = () => {
    const wasOpen = mobileMenuOpen;
    setMobileMenuOpen((prev) => !prev);
    if (wasOpen) mobileMenuToggleButtonRef.current?.focus();
  };

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
  }, [storeFormData]);


  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <Link href={`/`} className="flex items-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`${name} logo`}
                width={100}
                height={48}
                className="object-contain w-28 h-14"
                loader={imageLoader}
              />
            ) : (
              <h1 className={`text-2xl font-bold tracking-tighter ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                {name || 'VOGUE'}<span className="text-indigo-600">.</span>
              </h1>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-700">
            {/* {navLinks.map((item) => (
              <a key={item} href="#" className="hover:text-indigo-600 transition-colors">{item}</a>
            ))} */}
            {dynamicNavLinks.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={item.href} className="block text-sm font-semibold text-slate-900 hover:text-indigo-600">
                    {item.label}
                  </Link>
                </motion.div>
              ))}

          </div>

          {/* Icons + Auth */}
          <div className="flex gap-4 items-center">
            <ShoppingBagIcon
              className="w-6 h-6 text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => {
                if (cart.length === 0) return;
                if (user) router.push(`/ecommerce/checkout`);
                else handleGoogleSignIn();
              }}
            />
            {status === 'loading' ? null : user ? (
              <UserIcon
                className="w-6 h-6 text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={handleUserAction}
              />
            ) : (
              <button
                className="hidden md:block bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors"
                onClick={handleGoogleSignIn}
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-slate-900"
              onClick={toggleMobileMenu}
              ref={mobileMenuToggleButtonRef}
            >
              {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomLeftIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.8, 0.25, 1] }}
            className="fixed top-[72px] left-0 w-full bg-white/90 backdrop-blur-lg rounded-b-3xl overflow-hidden z-50 md:hidden"
            ref={mobileMenuRef}
          >
            <div className="pt-6 pb-8 px-6 space-y-6">
              {
                dynamicNavLinks.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <a href="#" className="block text-lg font-medium text-slate-900 hover:text-indigo-600">
                      {item.label}
                    </a>
                  </motion.div>
                ))
              }
              {/* {navLinks.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <a href="#" className="block text-lg font-medium text-slate-900 hover:text-indigo-600">
                    {item}
                  </a>
                </motion.div>
              ))} */}

              <div className="border-t border-gray-200" />

              {/* Auth Buttons */}
              {user ? (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleUserAction(); }}
                    className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors hover:brightness-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="w-full text-gray-600 underline hover:text-indigo-600 text-base"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                    className="w-full text-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium border border-gray-200 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignUp(); }}
                    className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors hover:brightness-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <div className="border-t border-gray-200" />

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((s: any) => (
                  <a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="capitalize text-gray-900 transition-colors hover:text-indigo-600"
                  >
                    {s.channel}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] bottom-0 bg-black/30 z-40 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}
