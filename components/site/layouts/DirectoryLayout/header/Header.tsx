'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';

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


// --------------------------------------
// IMAGE LOADER
// --------------------------------------
const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;


// --------------------------------------
// DEBOUNCE
// --------------------------------------
const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};


export default function Header() {
  const router = useRouter();
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();

  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const {
    slug,
    name,
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks = [],
    themeSettings = {}
  } = storeFormData || {};

  // --------------------------------------
  // THEME COLORS
  // --------------------------------------
  const primaryColor = themeSettings?.primaryColor || '#f97316';
  const secondaryColor = themeSettings?.secondaryColor || '#14b8a6';


  // --------------------------------------
  // STATE
  // --------------------------------------
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);


  // --------------------------------------
  // NAV ITEMS
  // --------------------------------------
  const navItems = [
    { label: 'Home', href: `/site/${slug}` },
    { label: 'Listings', href: `/directorylistings/products` },
    { label: 'Categories', href: `/directorylistings/categories` },
  ];


  // --------------------------------------
  // AUTH
  // --------------------------------------
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();

    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/directorylistings/profile`);
  };

  const handleGoogleSignIn = () => {
    const url = new URL("https://auth.salesmanpro.site/signin");
    url.searchParams.set("callbackUrl", `${window.location.origin}/site/${slug}`);
    window.location.href = url.toString();
  };

  const handleGoogleSignUp = () => {
    const url = new URL("https://auth.salesmanpro.site/signup");
    url.searchParams.set("callbackUrl", `${window.location.origin}/site/${slug}`);
    window.location.href = url.toString();
  };

  const handleSignOutUser = () =>
    signOut({ callbackUrl: `/site/${slug}` });


  // --------------------------------------
  // HANDLE OUTSIDE CLICK (search + menu)
  // --------------------------------------
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }

      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        !mobileToggleRef.current?.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen, mobileMenuOpen]);


  // --------------------------------------
  // SCROLL SHADOW
  // --------------------------------------
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);


  // --------------------------------------
  // LOCK BODY SCROLL WHEN MENU OPEN
  // --------------------------------------
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
  }, [mobileMenuOpen]);


  // --------------------------------------
  // DEBOUNCED SEARCH
  // --------------------------------------
  const performSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 2) {
        console.log("Search:", query);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: any) => {
    const q = e.target.value;
    setSearchQuery(q);
    performSearch(q);
  };


  return (
    <>
      {/* GLOBAL COLOR VARIABLES */}
      <style jsx global>{`
        :root {
          --primary-color: ${primaryColor};
          --secondary-color: ${secondaryColor};
        }
      `}</style>


      <header className={`
        sticky top-0 w-full z-50 bg-white dark:bg-gray-900 transition-all duration-300
        ${scrolled ? 'shadow-lg' : 'shadow-none'}
      `}>

        {/* --------------------------------------------------
            TOP INFO BAR (desktop only)
        -------------------------------------------------- */}
        <div
          className="hidden md:flex justify-between items-center px-6 py-2 text-sm text-white"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center space-x-6">
            {contactEmail && (
              <a href={`mailto:${contactEmail}`}>
                📧 {contactEmail}
              </a>
            )}
            {contactPhone && (
              <a href={`tel:${contactPhone}`}>
                📞 {contactPhone}
              </a>
            )}
          </div>

          <div className="flex space-x-4">
            {socialLinks?.map((s) => (
              <a
                key={s.channel}
                href={s.url}
                target="_blank"
                className="capitalize"
              >
                {s.channel}
              </a>
            ))}
          </div>
        </div>


        {/* --------------------------------------------------
            MAIN HEADER
        -------------------------------------------------- */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* LOGO + NAV */}
            <div className="flex items-center space-x-8">
              <div
                onClick={() => router.push(`/site/${slug}`)}
                className="cursor-pointer flex-shrink-0"
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name || 'Logo'}
                    width={120}
                    height={40}
                    className="object-contain"
                    loader={loader}
                    priority
                  />
                ) : (
                  <span className="text-2xl font-bold">{name}</span>
                )}
              </div>

              {/* DESKTOP NAV */}
              <nav className="hidden lg:flex space-x-8 font-semibold text-gray-700 dark:text-gray-200">
                {navItems.map((n) => (
                  <Link
                    key={n.label}
                    href={n.href}
                    className="relative group pb-1"
                  >
                    {n.label}
                    <span
                      className="absolute bottom-0 left-0 w-0 h-0.5 bg-current group-hover:w-full transition-all"
                      style={{ backgroundColor: secondaryColor }}
                    />
                  </Link>
                ))}
              </nav>
            </div>

            {/* RIGHT ICONS */}
            <div className="flex items-center space-x-5">

              {/* USER / PROFILE */}
              {!user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={handleGoogleSignIn}
                    className={"text-gray-700 dark:text-gray-200 "}
                  >
                    <span className="">Log In</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={handleGoogleSignUp}
                    className="text-gray-700 dark:text-gray-200"
                  >
                    <span className="">Sign Up</span>
                  </motion.button>
                </>
              ): (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    onClick={handleUserAction}
                    className="text-gray-700 dark:text-gray-200"
                  >
                    <UserIcon className="h-7 w-7" />
                  </motion.button>
                </>
              )}

              {/* CART */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  if (cart.length === 0) return;
                  if (user == null) {
                    handleGoogleSignIn();
                    return;
                  }
                  router.push(`/checkout`)
                }}
                className="relative text-gray-700 dark:text-gray-200"
              >
                <ShoppingBagIcon className="h-7 w-7" />

                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.length}
                  </span>
                )}
              </motion.button>

              {/* MOBILE MENU TOGGLE */}
              <button
                ref={mobileToggleRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
              >
                {mobileMenuOpen
                  ? <XMarkIcon className="h-7 w-7" />
                  : <Bars3BottomLeftIcon className="h-7 w-7" />}
              </button>
            </div>

          </div>
        </div>


        {/* --------------------------------------------------
            MOBILE MENU (Animated)
        -------------------------------------------------- */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden px-4 py-4 border-t bg-white dark:bg-gray-900 shadow-md"
              ref={mobileMenuRef}
            >
              {navItems.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 text-gray-800 dark:text-gray-200"
                >
                  {n.label}
                </Link>
              ))}

              <div className="mt-4 border-t pt-4">
                {user ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleUserAction();
                      }}
                      className="w-full py-2 rounded-lg text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOutUser();
                      }}
                      className="w-full mt-3 text-gray-700 dark:text-gray-200 underline"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleGoogleSignIn();
                      }}
                      className="w-full py-2 border rounded-lg"
                    >
                      Login
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleGoogleSignUp();
                      }}
                      className="w-full mt-3 py-2 rounded-lg text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Signup
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </header>
    </>
  );
}
