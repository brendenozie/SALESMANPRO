'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassCircleIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  MegaphoneIcon,
  ShoppingCartIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';

// --- Image Loader ---
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// --- Debounce Utility ---
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function Header() {
  const router = useRouter();
  const { cart, addToCart, removeFromCart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const {
    name,
    slug,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#FF5722';
  const secondaryColor = themeSettings?.secondaryColor || '#3F51B5';

  // --- Scroll shadow ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- Lock body scroll when mobile menu is open ---
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
  }, [mobileMenuOpen]);

  // --- Auth Handlers ---
  const handleUserAction = () => {
    if (!user) return signIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/site/${slug}/profile`);
  };
  const handleSignOut = () => signOut({ callbackUrl: `/site/${slug}` });

  // --- Search Handling ---
  const handleSearch = useCallback(
    debounce((q: string) => {
      if (q.length > 2) console.log('Searching for:', q);
    }, 400),
    []
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    handleSearch(q);
  };

  const navItems = [
    { label: 'Home', href: `/site/${slug}` },
    { label: 'Menu', href: `/site/${slug}#menu` },
    { label: 'About', href: `/site/${slug}#about` },
    { label: 'Contact', href: `/site/${slug}#contact` },
  ];

  return (
    <>
      {/* ===== MAIN HEADER ===== */}
      <motion.header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/70 backdrop-blur-xl shadow-lg'
            : 'bg-transparent backdrop-blur-none'
        }`}
      >
        {/* Top Info Bar */}
        <div
          className="hidden md:flex justify-between items-center px-6 py-2 text-xs font-medium"
          style={{ backgroundColor: scrolled ? '#f8f8f8' : `${primaryColor}10` }}
        >
          <div className="flex items-center space-x-6">
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="flex items-center space-x-1" style={{ color: primaryColor }}>
                <PhoneIcon className="h-4 w-4" />
                <span>{contactPhone}</span>
              </a>
            )}
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex items-center space-x-1" style={{ color: primaryColor }}>
                <MegaphoneIcon className="h-4 w-4" />
                <span>{contactEmail}</span>
              </a>
            )}
          </div>
          <div className="flex space-x-4">
            {socialLinks.map((s) => (
              <Link key={s.channel} href={s.url} target="_blank" rel="noreferrer">
                <span className="capitalize hover:underline" style={{ color: primaryColor }}>
                  {s.channel}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={`/site/${slug}`} className="flex items-center space-x-3 flex-shrink-0">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name || 'Logo'}
                  width={150}
                  height={50}
                  className="object-contain"
                  loader={loader}
                />
              ) : (
                <span className="text-2xl font-extrabold">{name || 'Restaurant'}</span>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex flex-grow justify-center space-x-8 font-medium text-lg">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative group transition-colors"
                >
                  {item.label}
                  <span
                    className="absolute left-0 bottom-0 h-[2px] w-0 bg-[var(--primary-color)] transition-all group-hover:w-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search Toggle */}
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => setSearchOpen((p) => !p)}>
                <MagnifyingGlassCircleIcon className="h-6 w-6 text-gray-700" />
              </motion.button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-16 right-8 bg-white shadow-md rounded-xl p-2 flex items-center space-x-2 border"
                  >
                    <input
                      type="search"
                      placeholder="Search dishes..."
                      className="w-48 rounded-md py-1 px-2 text-sm focus:outline-none"
                      value={searchQuery}
                      onChange={onSearchChange}
                      ref={searchRef}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')}>
                        <XMarkIcon className="h-4 w-4 text-gray-500" />
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* User */}
              <motion.button whileHover={{ scale: 1.1 }} onClick={handleUserAction}>
                <UserIcon className="h-6 w-6" />
              </motion.button>

              {/* Cart */}
              <div className="relative">
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setCartOpen(!cartOpen)}>
                  <ShoppingCartIcon className="h-6 w-6" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cart.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                    </span>
                  )}
                </motion.button>

                {/* Cart Dropdown */}
                <AnimatePresence>
                  {cartOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-lg rounded-lg shadow-xl p-4 z-50"
                    >
                      {cart.length === 0 ? (
                        <p className="text-sm text-gray-500">Your cart is empty.</p>
                      ) : (
                        <div className="space-y-4">
                          {cart.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {item.images?.[0] && (
                                  <Image
                                    src={item.images[0]}
                                    alt={item.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover"
                                  />
                                )}
                                <span className="text-sm font-medium">{item.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => removeFromCart(item)}
                                  className="p-1 border rounded-full hover:bg-gray-100"
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </button>
                                <span className="text-sm font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="p-1 border rounded-full hover:bg-gray-100"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                          <Link
                            href={`/site/${slug}/checkout`}
                            className="block text-center w-full py-2 rounded-md font-semibold"
                            style={{ backgroundColor: primaryColor, color: 'white' }}
                          >
                            Go to Checkout
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
                {mobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3BottomLeftIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ===== MOBILE SLIDE-DOWN MENU ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.8, 0.25, 1] }}
            className="fixed top-20 left-0 w-full bg-white/90 backdrop-blur-lg shadow-xl z-40 md:hidden overflow-hidden"
            ref={mobileMenuRef}
          >
            <div className="px-6 py-6 space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-lg font-medium text-gray-900 hover:text-[var(--primary-color)]"
                  style={{ transition: 'color 0.2s ease', color: secondaryColor }}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-gray-200" />

              {/* Auth Section */}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleUserAction();
                    }}
                    className="w-full py-2 rounded-lg text-white font-medium shadow-md"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full text-gray-600 underline hover:text-[var(--primary-color)]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signIn();
                    }}
                    className="w-full py-2 rounded-lg text-gray-700 border border-gray-200 font-medium hover:bg-gray-100"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signIn('google');
                    }}
                    className="w-full py-2 rounded-lg text-white font-medium shadow-md hover:brightness-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Sign Up
                  </button>
                </>
              )}

              <div className="border-t border-gray-200" />

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((s) => (
                  <a
                    key={s.channel}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="capitalize text-gray-900 hover:text-[var(--primary-color)]"
                    style={{ transition: 'color 0.2s ease' }}
                  >
                    {s.channel}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/30 z-30 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
