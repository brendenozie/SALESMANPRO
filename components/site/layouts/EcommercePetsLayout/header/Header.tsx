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
// Assuming these contexts exist and provide the necessary data
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
// Assuming NextAuth is available in this environment
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

  // --- Auth State & Hooks ---
  const { data: session, status } = useSession(); // Get session data
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleButtonRef = useRef<HTMLButtonElement>(null);

  // Destructure relevant fields with default empty objects for safety
  const {
    slug,
    name,
    logoUrl,
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  // Fallback to emerald/blue if no colors are provided
  const primaryColor = themeSettings?.primaryColor || '#10B981';    // Emerald
  const secondaryColor = themeSettings?.secondaryColor || '#3B82F6'; // Blue

  // --- Auth Handlers (copied from the first component) ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn(); // Fallback in case button logic is missed
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/ecommerce/profile`); // Navigate to profile for non-admin
  };

  const handleSignOut = () => signOut({ callbackUrl: `/` });

  const handleGoogleSignIn = () => {
    // Assuming 'salesmanpro.site' is the external auth provider
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`); // Adjusted callback
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signup");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`); // Adjusted callback
    window.location.href = authUrl.toString();
  };

  // Handle outside clicks for closing search and mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close search if clicked outside
      if (searchOpen && searchInputRef.current && !searchInputRef.current.contains(event.target as Node) &&
          !document.querySelector('.search-toggle-button')?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
      // Close mobile menu if clicked outside, but not on the toggle button itself
      if (mobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) &&
          !mobileMenuToggleButtonRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen, mobileMenuOpen]);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  // Handle body scroll locking when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle scroll for header shadow
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Define navigation links as constants
  const navLinks = [
    { label: 'Home', href: `/` },
    { label: 'Shop', href: `/ecommerce/products` },
    { label: 'Categories', href: `/ecommerce/categories` },
  ];

  // Debounced search handler (simulate API call)
  const handleSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 2) { 
        console.log('Performing search for:', query);
      }
    }, 300),
    [slug]
  );

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const toggleMobileMenu = () => {
    const wasOpen = mobileMenuOpen;
    setMobileMenuOpen((prev) => !prev);
    if (wasOpen) {
      mobileMenuToggleButtonRef.current?.focus();
    }
  };

  return (
    <>
      {/* Set CSS variables for dynamic colors and global styles */}
      <style jsx global>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
        /* Style for the underline on hover for nav links */
        .nav-link-hover-underline a:hover + span {
          height: 2px;
        }
      `}</style>

      <header
  className={`
    fixed top-0 left-0 w-full z-50
    transition-all duration-300
    ${
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-md py-3'
        : 'bg-transparent py-5'
    }
  `}
>
  <div className="container mx-auto px-6 lg:px-20 flex items-center justify-between">

    {/* LOGO */}
    <Link href={`/`} className="flex items-center">
      <motion.div whileHover={{ scale: 1.05 }}>
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${name} logo`}
            width={100}
            height={48}
            className="object-contain w-12 h-12"
            loader={imageLoader}
          />
        ) : (
          <span
            className={`text-xl font-black tracking-tight ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}
          >
            {name}
          </span>
        )}
      </motion.div>
    </Link>

    {/* DESKTOP NAV */}
    <nav className="hidden md:flex items-center space-x-10">
      {navLinks.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`
            relative font-semibold transition-all duration-200
            ${
              scrolled
                ? 'text-gray-800 hover:text-[var(--primary-color)]'
                : 'text-white hover:opacity-80'
            }
          `}
        >
          {item.label}
        </Link>
      ))}
    </nav>

    {/* RIGHT SIDE */}
    <div className="flex items-center space-x-5">

      {/* Profile / Auth */}
      {status === 'loading' ? null : user ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={handleUserAction}
          className={`
            transition-colors
            ${scrolled ? 'text-gray-800' : 'text-white'}
          `}
        >
          <UserIcon className="h-6 w-6" />
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={handleGoogleSignIn}
          className="
            hidden md:block
            px-6 py-2.5
            rounded-full
            font-bold
            shadow-md
            transition-all
          "
          style={{
            backgroundColor: scrolled ? primaryColor : 'white',
            color: scrolled ? 'white' : primaryColor,
          }}
        >
          Login
        </motion.button>
      )}

      {/* Cart */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={() => {
          if (cart.length === 0) return;
          if (user) router.push(`/ecommerce/checkout`);
          else handleGoogleSignIn();
        }}
        className={`
          relative transition-colors
          ${scrolled ? 'text-gray-800' : 'text-white'}
        `}
      >
        <ShoppingBagIcon className="h-6 w-6" />
        {cart.length > 0 && (
          <span
            className="absolute -top-2 -right-2 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: secondaryColor }}
          >
            {cart.length}
          </span>
        )}
      </motion.button>

      {/* Mobile Toggle */}
      <button
        onClick={toggleMobileMenu}
        className={`md:hidden ${
          scrolled ? 'text-gray-800' : 'text-white'
        }`}
      >
        {mobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3BottomLeftIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  </div>
</header>

      {/* ===== MOBILE SLIDE-DOWN MENU ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: [0.25, 0.8, 0.25, 1],
            }}
            className="
              fixed top-[72px] left-0 w-full
              bg-white/90 backdrop-blur-lg
              ring-1 ring-gray-200
              rounded-b-3xl
              overflow-hidden 
              z-[60]
              md:hidden
              origin-top
              shadow-lg
            "
            id="mobile-menu"
            ref={mobileMenuRef}
          >
            <div className="pt-6 pb-8 px-6 space-y-6">
              {/* Nav Links */}
              {navLinks.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link
                    href={item.href}
                    className="block text-lg font-medium text-gray-900 hover:text-[var(--primary-color)]"
                    style={{ transition: 'color 0.2s ease' }}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="border-t border-gray-200" />
              
              {/* --- Authentication Buttons for Mobile --- */}
              {user ? (
                // User is logged in
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: navLinks.length * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                >
                    <button
                        onClick={() => { setMobileMenuOpen(false); handleUserAction(); }}
                        className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors hover:brightness-90"
                        style={{ backgroundColor: `var(--primary-color)` }}
                    >
                        {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                    </button>
                    <button
                        onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                        className="w-full mt-3 text-gray-600 underline hover:text-[var(--primary-color)] text-base"
                    >
                        Sign Out
                    </button>
                </motion.div>
              ) : (
                // User is NOT logged in (Log In & Sign Up)
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: navLinks.length * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                    className='flex flex-col space-y-3'
                >
                    <button
                        onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                        className="w-full text-center px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium border border-gray-200 transition-colors"
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => { setMobileMenuOpen(false); handleGoogleSignUp(); }}
                        className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors hover:brightness-90"
                        style={{ backgroundColor: `var(--primary-color)` }}
                    >
                        Sign Up
                    </button>
                </motion.div>
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
                    className="capitalize text-gray-900 transition-colors"
                    style={{ transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = secondaryColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
                  >
                    {s.channel}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[72px] bottom-0 bg-black/30 z-30 md:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}