'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useStateContext } from '@/contexts/ContextProvider';
import { clsx } from 'clsx';


const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

// --- HOOKS ---
const useClickOutside = (ref: React.RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};

// --- COMPONENTS ---

// 1. Nav Link with Sliding Background Effect
const NavItem = ({ href, label, isActive, primaryColor }: { href: string; label: string; isActive: boolean; primaryColor: string }) => {
  return (
    <Link href={href} className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors z-10 group">
      {isActive && (
        <motion.div
          layoutId="activeNavPill"
          className="absolute inset-0 rounded-full opacity-10 dark:opacity-20"
          style={{ backgroundColor: primaryColor }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className={clsx(
        "relative z-10 transition-colors duration-200",
        isActive ? "font-semibold" : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      )}
      style={{ color: isActive ? primaryColor : undefined }}
      >
        {label}
      </span>
    </Link>
  );
};

// 2. Auth Popover
const UserMenu = ({ user, slug, primaryColor, handleSignOut, close }: any) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, close);

  const profileLink = user.role?.toLowerCase() === 'admin' ? `/dashboards` : `/service-provider/profile`;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-4 w-64 rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
    >
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || 'User Profile'}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{user.role || 'Customer'}</p>
      </div>

      <div className="p-2">
        <Link href={profileLink} onClick={close} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
             <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.role === 'admin' ? 'Dashboard' : 'My Account'}</span>
        </Link>

        <button
          onClick={() => { close(); handleSignOut(); }}
          className="flex w-full items-center space-x-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group text-red-600"
        >
           <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
             <ArrowRightOnRectangleIcon className="w-5 h-5" />
           </div>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const Header = ({ storeFormData }: { storeFormData: any }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const { cart } = useStateContext();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  // Scroll Logic for "Floating" effect
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Colors & Styles
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488';
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316';

  // Reset states on route change
  useEffect(() => {
    setMobileOpen(false);
    setIsPopoverOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSignOut = () => signOut({ callbackUrl: `/` });
  const handleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };
  const handleSignUp = () => {
     const authUrl = new URL("https://auth.salesmanpro.site/signup");
     authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
     window.location.href = authUrl.toString();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/service-provider/products?query=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const sections = [
    { id: 'hero', label: 'Home', href: `/` },
    { id: 'services', label: 'Services', href: `#services` },
    { id: 'packages', label: 'Packages', href: `#packages` },
    { id: 'contact', label: 'Contact', href: `#booking` },
  ];

  const isHomePath = pathname === `/` || pathname === '/';

  if (!storeFormData) return null; // Or a skeleton loader

  return (
    <>
      <motion.header
        className={clsx(
          "fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out flex justify-center",
          isScrolled ? "top-4" : "top-0"
        )}
      >
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={clsx(
            "flex items-center justify-between transition-all duration-500",
            // Scrolled State: Floating Pill
            isScrolled 
              ? "w-[95%] md:w-[90%] lg:w-[85%] h-16 rounded-full shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700 px-6"
              : "w-full h-20 bg-transparent px-6 md:px-10 border-b border-transparent"
          )}
        >
          {/* --- LEFT: LOGO --- */}
          <div className="flex-shrink-0">
            <Link href={`/`} className="flex items-center gap-2">
              {storeFormData.logoUrl ? (
                <Image
                  src={storeFormData.logoUrl}
                  loader={loader}
                  alt={storeFormData.name}
                  width={140}
                  height={50}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className={clsx(
                  "text-2xl font-extrabold tracking-tight",
                  isScrolled ? "text-gray-900 dark:text-white" : "text-white"
                )}>
                  {storeFormData.name}
                </span>
              )}
            </Link>
          </div>

          {/* --- CENTER: NAVIGATION (Desktop) --- */}
          <div className="hidden lg:flex items-center gap-1">
            <div className={clsx(
              "flex items-center gap-1 px-2 py-1.5 rounded-full transition-colors",
              isScrolled ? "bg-gray-100/50 dark:bg-gray-800/50" : "bg-black/20 backdrop-blur-sm"
            )}>
              {sections.map((section) => {
                 const isActive = (isHomePath && section.id === 'hero') || pathname === section.href;
                 // Override styling for Transparent Header mode
                 const labelClass = isActive ? "font-semibold" : (isScrolled ? "text-gray-600" : "text-white/90 hover:text-white");
                 
                 return (
                    <Link 
                      key={section.id} 
                      href={section.href}
                      className="relative px-5 py-2 rounded-full text-sm font-medium transition-all z-10"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="desktopNavPill"
                          className="absolute inset-0 rounded-full bg-white dark:bg-gray-700 shadow-sm"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className={clsx("relative z-10 transition-colors", isActive ? (isScrolled ? "text-[var(--primary)]" : "text-gray-900") : labelClass)}
                            style={isActive && isScrolled ? { color: primaryColor } : {}}
                      >
                        {section.label}
                      </span>
                    </Link>
                 );
              })}
            </div>
          </div>

          {/* --- RIGHT: ACTIONS --- */}
          <div className="flex items-center gap-3">
            
            {/* Search (Expanding) */}
            <div className={clsx("relative flex items-center transition-all", isSearchOpen ? "w-64" : "w-auto")}>
               <AnimatePresence>
                 {isSearchOpen && (
                   <motion.form
                     initial={{ width: 0, opacity: 0 }}
                     animate={{ width: '100%', opacity: 1 }}
                     exit={{ width: 0, opacity: 0 }}
                     onSubmit={handleSearchSubmit}
                     className="absolute right-0 top-1/2 -translate-y-1/2 w-full"
                   >
                     <input
                       autoFocus
                       type="text"
                       placeholder="Search..."
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="w-full h-10 pl-4 pr-10 rounded-full bg-gray-100 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-[var(--primary)] text-gray-800 dark:text-white"
                       style={{ '--primary': primaryColor } as React.CSSProperties}
                       onBlur={() => !searchTerm && setIsSearchOpen(false)}
                     />
                   </motion.form>
                 )}
               </AnimatePresence>
               
               <button 
                 onClick={() => setIsSearchOpen(!isSearchOpen)}
                 className={clsx(
                   "p-2.5 rounded-full transition-colors z-10", 
                   isScrolled ? "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200" : "hover:bg-white/20 text-white"
                 )}
               >
                  <MagnifyingGlassIcon className="w-5 h-5" />
               </button>
            </div>

            {/* Cart */}
            <Link href="/service-provider/checkout">
              <button className={clsx(
                 "relative p-2.5 rounded-full transition-colors hidden sm:block",
                 isScrolled ? "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200" : "hover:bg-white/20 text-white"
              )}>
                <ShoppingCartIcon className="w-5 h-5" />
                {cart?.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
                    {cart.length}
                  </span>
                )}
              </button>
            </Link>

            {/* Desktop Profile / Login */}
            <div className="relative hidden lg:block">
              {user ? (
                <button 
                  onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  {user.image ? (
                    <Image src={user.image} loader={loader} alt="Profile" width={32} height={32} className="rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600">
                       <span className="text-xs font-bold">{user.name?.charAt(0) || 'U'}</span>
                    </div>
                  )}
                  <ChevronDownIcon className={clsx("w-3 h-3 transition-transform text-gray-500", isPopoverOpen && "rotate-180")} />
                </button>
              ) : (
                <button 
                  onClick={handleSignIn}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sign In
                </button>
              )}
              <AnimatePresence>
                {isPopoverOpen && user && (
                  <UserMenu 
                    user={user} 
                    slug={storeFormData.slug} 
                    primaryColor={primaryColor} 
                    handleSignOut={handleSignOut} 
                    close={() => setIsPopoverOpen(false)} 
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={clsx(
                "lg:hidden p-2 rounded-full transition-colors",
                isScrolled ? "text-gray-900 dark:text-white hover:bg-gray-100" : "text-white hover:bg-white/20"
              )}
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-40 bg-white/90 dark:bg-gray-900/95 lg:hidden pt-28 px-6 pb-10 flex flex-col overflow-y-auto"
          >
            <div className="flex flex-col space-y-6">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="search"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  style={{ '--primary': primaryColor } as React.CSSProperties}
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-6 h-6 text-gray-400" />
              </form>

              {/* Mobile Links */}
              <div className="flex flex-col space-y-2">
                {sections.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={section.href}
                      onClick={() => setMobileOpen(false)}
                      className="block text-3xl font-bold py-3 border-b border-gray-100 dark:border-gray-800 hover:pl-2 transition-all"
                      style={{ color: pathname === section.href ? primaryColor : 'inherit' }}
                    >
                      {section.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="mt-auto pt-8">
                {user ? (
                  <div className="space-y-3">
                    <Link 
                      href={user.role?.toLowerCase() === 'admin' ? `/dashboards` : `/service-provider/profile`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center space-x-2 w-full py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 font-bold text-lg"
                    >
                      <UserCircleIcon className="w-6 h-6" />
                      <span>My Account</span>
                    </Link>
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold text-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { handleSignIn(); setMobileOpen(false); }}
                      className="py-4 rounded-2xl font-bold text-lg text-white shadow-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { handleSignUp(); setMobileOpen(false); }}
                      className="py-4 rounded-2xl font-bold text-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;