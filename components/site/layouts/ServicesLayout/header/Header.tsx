'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon, // Used for unauthenticated state
  ArrowRightOnRectangleIcon, // Used for Logout
  UserCircleIcon, // Used for Profile/Account
} from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
// --- AUTH IMPORTS (Assumed from Sample Use Case) ---
import { useSession, signIn, signOut } from 'next-auth/react';
// ----------------------------------------------------
import { useStateContext } from '@/contexts/ContextProvider'; // Assuming this provides cart and other global states

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

interface HeaderProps {
  storeFormData: any;
}

// Custom hook to handle click outside
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

// --- AUTH POPOVER COMPONENT (Desktop) ---
interface AuthPopoverProps {
    user: any;
    slug: string;
    primaryColor: string;
    handleSignOut: () => void;
    closePopover: () => void;
}

const AuthPopover: React.FC<AuthPopoverProps> = ({ user, slug, primaryColor, handleSignOut, closePopover }) => {
    const popoverRef = React.useRef<HTMLDivElement>(null);
    useClickOutside(popoverRef, closePopover);
    
    // Determine the profile link based on user role
    const profileLink = user.role?.toLowerCase() === 'admin' 
        ? `/dashboards` 
        : `/${slug}/profile`; 

    const popoverVariants = {
        hidden: { opacity: 0, scale: 0.9, y: -10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
        exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.15 } },
    };

    return (
        <motion.div
            ref={popoverRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={popoverVariants}
            className="absolute right-0 top-full mt-3 w-48 rounded-xl shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden z-50"
        >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user.name || 'User Profile'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'Customer'}</p>
            </div>
            
            <Link href={profileLink} onClick={closePopover} passHref>
                <motion.div 
                    className="flex items-center space-x-2 p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    whileHover={{ x: 5 }}
                >
                    <UserCircleIcon className="w-5 h-5" style={{ color: primaryColor }} />
                    <span className='font-medium'>{user.role === 'admin' ? 'Dashboard' : 'My Account'}</span>
                </motion.div>
            </Link>

            <motion.button
                onClick={() => { closePopover(); handleSignOut(); }}
                className="flex items-center space-x-2 p-3 w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                whileHover={{ x: 5 }}
            >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className='font-medium'>Sign Out</span>
            </motion.button>
        </motion.div>
    );
};
// ----------------------------------------------------


const Header: React.FC<HeaderProps> = ({ storeFormData }) => {
  // --- AUTH HOOKS ---
  const { data: session, status } = useSession();
  const user = session?.user;
  // ------------------

  const { cartItems } = useStateContext();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false); // New state for popover

  // Fallback colors from storeFormData or default Tailwind colors
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // teal-600
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // orange-500

  // Define dynamic CSS variables for easier use in Tailwind JIT (Optimized for simplicity)
  const customStyles = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
  } as React.CSSProperties;

  // --- AUTH HANDLERS ---
  const handleSignOut = () => signOut({ callbackUrl: `/${storeFormData.slug}` }); // Redirect to home on sign out

  const handleSignIn = () => {
    // Assuming 'salesmanpro.site' is the external auth provider
    const authUrl = new URL("https://auth.salesmanpro.site/signin"); 
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}/${storeFormData.slug}`);
    window.location.href = authUrl.toString();
  };
  
  const handleSignUp = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signup");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}/${storeFormData.slug}`);
    window.location.href = authUrl.toString();
  };
  // ----------------------


  const sections = [
    { id: 'hero', label: 'Home', href: `/${storeFormData?.slug}` },
    { id: 'services', label: 'Services', href: `#services` },
    { id: 'packages', label: 'Packages', href: `#packages` },
    { id: 'contact', label: 'Contact', href: `/${storeFormData?.slug}/contact` }, 
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setIsPopoverOpen(false); // Close popover on route change
  }, [pathname]);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${storeFormData.slug}/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const isHomePath = pathname === `/${storeFormData?.slug}` || pathname === '/';

  if (!storeFormData) {
    return (
      <header className="fixed w-full z-50 top-0 left-0 bg-gray-900/80 backdrop-blur-md h-20 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading header...</p>
      </header>
    );
  }

  return (
    <header className="fixed w-full z-50 top-0 left-0 border-b border-transparent" style={customStyles}>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`transition-all duration-300 h-20 flex items-center border-b
          ${scrolled
            ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-lg shadow-xl border-gray-200/50 dark:border-gray-800/50'
            : 'bg-transparent border-transparent'
          }
        `}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Link href={`/${storeFormData.slug}`} className="flex items-center space-x-2 relative z-20">
              {storeFormData.logoUrl ? (
                <Image
                  src={storeFormData.logoUrl}
                  loader={loader}
                  alt={storeFormData.name}
                  width={160}
                  height={60}
                  className="object-contain transition-all duration-300 h-10 w-auto"
                />
              ) : (
                <span className={`text-3xl font-extrabold transition-colors duration-300 ${scrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                  {storeFormData.name}
                </span>
              )}
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8 relative z-10">
            {sections.map(({ id, label, href }) => (
              <Link
                key={id}
                href={href}
                className={`
                  relative py-2 text-sm font-medium transition-all duration-300
                  ${scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90'}
                  hover:text-[var(--primary)]
                  ${(isHomePath && id === 'hero') || pathname === href
                    ? 'font-bold text-[var(--primary)]'
                    : ''
                  }
                `}
                style={{ transition: 'color 0.2s ease' }}
              >
                {label}
                {/* Active link underline indicator */}
                {((isHomePath && id === 'hero') || pathname === href) && (
                  <motion.span
                    layoutId="underline"
                    className="absolute left-0 -bottom-1 h-[3px] w-full rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  />
                )}
              </Link>
            ))}

            {/* --- Desktop Action Icons & Auth --- */}
            <div className="flex items-center space-x-4 ml-6">
                
                {/* Search Icon */}
                <motion.button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`relative p-2 rounded-full transition-all duration-300 ${scrolled ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white/90 hover:bg-white/10'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Toggle Search"
                >
                  <MagnifyingGlassIcon className={`w-6 h-6`} />
                </motion.button>
                
                {/* Cart/Booking Icon */}
                <Link href={`/${storeFormData.slug}/booking`} className="relative">
                    <motion.button
                        className={`relative p-2 rounded-full transition-all duration-300 ${scrolled ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white/90 hover:bg-white/10'}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="View Cart or Booking"
                    >
                        <ShoppingCartIcon className="w-6 h-6" />
                        {cartItems?.length > 0 && ( // Assuming cartItems is an array with a length property
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {cartItems.length}
                            </span>
                        )}
                    </motion.button>
                </Link>
                
                {/* User/Auth Dropdown */}
                <div className="relative">
                    <motion.button
                        onClick={() => user ? setIsPopoverOpen(p => !p) : handleSignIn()}
                        className={`p-2 rounded-full transition-all duration-300 ring-2 ring-transparent
                           ${scrolled ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white/90 hover:bg-white/10'}
                           ${user ? 'ring-[var(--secondary)]' : ''}
                        `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={user ? "Open user menu" : "Sign In"}
                    >
                        {user && user.image ? (
                            <Image 
                                src={user.image} 
                                alt={user.name || 'User'} 
                                width={24} 
                                height={24} 
                                className="w-6 h-6 rounded-full object-cover" 
                            />
                        ) : (
                            <UserIcon className="w-6 h-6" />
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {user && isPopoverOpen && (
                            <AuthPopover 
                                user={user} 
                                slug={storeFormData.slug} 
                                primaryColor={primaryColor}
                                handleSignOut={handleSignOut} 
                                closePopover={() => setIsPopoverOpen(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </div>
            {/* -------------------------------------- */}

          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="lg:hidden relative z-20 flex items-center space-x-4">
            {/* Mobile Cart Icon for Visibility */}
            <Link href={`/${storeFormData.slug}/booking`} className="relative">
              <button
                  className={`p-2 rounded-full transition-all duration-300 ${scrolled ? 'text-gray-700 dark:text-gray-300' : 'text-white/90'}`}
                  aria-label="View Cart or Booking"
              >
                  <ShoppingCartIcon className="w-6 h-6" />
                  {cartItems?.length > 0 && ( 
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                          {cartItems.length}
                      </span>
                  )}
              </button>
            </Link>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className={`p-2 rounded-full transition-all duration-300
                ${scrolled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/20'}
              `}
              style={{ color: scrolled ? primaryColor : 'white' }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed inset-0 top-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-40 flex flex-col items-center justify-start py-10"
            >
              <nav className="flex flex-col items-center space-y-6 w-full px-6">
                {/* Mobile Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative w-full max-w-sm mb-4">
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-3 text-gray-500 dark:text-gray-400" />
                </form>
                
                {sections.map(({ id, label, href }, index) => (
                  <motion.div
                    key={id}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="w-full text-center"
                  >
                    <Link
                      href={href}
                      className="text-2xl font-semibold block py-2 transition-colors duration-300 hover:text-[var(--secondary)]"
                      onClick={() => setMobileOpen(false)}
                      style={{ color: primaryColor }}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="border-t border-gray-200 w-full max-w-sm mt-8 pt-8" />
                
                {/* --- Mobile Auth Buttons (Engaging) --- */}
                {user ? (
                    <motion.div 
                        className="flex flex-col space-y-4 w-full max-w-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: sections.length * 0.05 + 0.2 }}
                    >
                        <Link href={user.role?.toLowerCase() === 'admin' ? `/dashboards` : `/${storeFormData.slug}/profile`}>
                            <button
                                className="w-full text-center px-4 py-3 rounded-full text-white font-bold shadow-md transition-all duration-300"
                                style={{ backgroundColor: primaryColor }}
                                onClick={() => setMobileOpen(false)}
                            >
                                <UserCircleIcon className="w-5 h-5 inline mr-2" />
                                My Account
                            </button>
                        </Link>
                        <button
                            onClick={() => { setMobileOpen(false); handleSignOut(); }}
                            className="w-full text-center px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 font-bold border border-gray-300 dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Sign Out
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        className="flex flex-col space-y-4 w-full max-w-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: sections.length * 0.05 + 0.2 }}
                    >
                        <button
                            onClick={() => { setMobileOpen(false); handleSignIn(); }}
                            className="w-full text-center px-4 py-3 rounded-full text-white font-bold shadow-md transition-all duration-300"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { setMobileOpen(false); handleSignUp(); }}
                            className="w-full text-center px-4 py-3 rounded-full text-gray-700 dark:text-gray-300 font-bold border border-gray-300 dark:border-gray-700 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            Sign Up
                        </button>
                    </motion.div>
                )}
                {/* ------------------------------------------ */}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search Input Popover (Desktop) */}
        <AnimatePresence>
            {isSearchOpen && (
                <motion.form
                    onSubmit={handleSearchSubmit}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-28 top-3 hidden lg:block"
                >
                    <div className="relative">
                        <input
                            type="search"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`pl-10 pr-4 py-2 rounded-full w-64
                                ${scrolled ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600' : 'bg-white/20 text-white placeholder-white/80 border border-white/10'}
                                focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all duration-300
                            `}
                            autoFocus
                        />
                        <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-2.5 ${scrolled ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`} />
                    </div>
                </motion.form>
            )}
        </AnimatePresence>

      </motion.nav>
    </header>
  );
};

export default Header;