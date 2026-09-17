'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

// --- Icons (Enhanced with generic wrapper for consistency) ---
const IconWrapper = ({ children, className = "w-5 h-5" }: { children: React.ReactNode, className?: string }) => (
  <div className={`${className} transition-transform duration-200 flex items-center justify-center`}>{children}</div>
);

const Bars3Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MagnifyingGlassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 18.75a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.324-.775-7.499-2.25Z" />
  </svg>
);

const Header = () => {
  const { storeFormData } = useStoreContext() || {};
  const router = useRouter();
  const pathname = usePathname();

  // --- Auth State ---
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  // --- Store Data ---
  const { name, logoUrl, themeSettings } = storeFormData || {
    slug: 'my-blog',
    name: 'GLOBAL INSIGHTS',
    logoUrl: 'https://placehold.co/40x40/EF4444/FFFFFF?text=GI',
    themeSettings: { primaryColor: '#EF4444', secondaryColor: '#EC4899' },
  };

  const primary = themeSettings?.primaryColor || '#f97316';

  // --- UI State ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // --- Navigation Items ---
  const navItems = [
    { label: 'Home', href: `/` },
    { label: 'Blog', href: `/blog/listings` },
    { label: 'About', href: `/blog/about` },
    { label: 'Contact', href: `/blog/contact` },
  ];

  // --- Handlers ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/blog/profile`);
  };

  const handleSignOut = () => signOut({ redirect: true, callbackUrl: "/" });

  const handleGoogleSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}/`);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signup');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}/`);
    window.location.href = authUrl.toString();
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-slate-900 border-slate-800 py-3.5 shadow-md'
            : 'bg-slate-950 border-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* ===== LEFT: LOGO ===== */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => router.push(`/`)}
          >
            <div className="relative">
              {logoUrl ? (
                <div className="h-9 w-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                  <img src={logoUrl} alt={name} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-700"
                  style={{ backgroundColor: primary }}
                >
                  <span className="text-white font-bold text-sm">{name.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <span className="text-lg font-semibold tracking-tight text-white hidden sm:block">
              {name}
            </span>
          </div>

          {/* ===== CENTER: DESKTOP NAV ===== */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full p-1">
              {navItems.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={label} className="relative">
                    <a
                      href={href}
                      onMouseEnter={() => setHoveredNav(label)}
                      onMouseLeave={() => setHoveredNav(null)}
                      className={`relative z-10 block px-4 py-1.5 text-xs font-medium transition-colors duration-200 rounded-full ${
                        isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </a>
                    
                    {/* Floating Pill Animation */}
                    {hoveredNav === label && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-slate-800 border border-slate-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                      />
                    )}
                    
                    {/* Active State (Static when not hovered) */}
                    {isActive && !hoveredNav && (
                      <div className="absolute inset-0 rounded-full bg-slate-800/60 border border-slate-700/50" />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ===== RIGHT: ACTIONS ===== */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <StoreHeaderSearch
              variant="button"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-all"
            />

            {/* Profile / Auth Trigger */}
            <div className="hidden md:block">
              {user ? (
                <button 
                  onClick={handleUserAction} 
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  {user.image ? (
                     <img src={user.image} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="p-1 rounded-full bg-slate-800 text-slate-300">
                      <IconWrapper className="w-4 h-4"><UserIcon /></IconWrapper>
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-300 group-hover:text-white max-w-[100px] truncate">
                    {user.name?.split(' ')[0] || 'Account'}
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: primary }}
                >
                  Log In
                </button>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-transparent transition-all"
              aria-label="Open menu"
            >
              <IconWrapper className="w-5 h-5"><Bars3Icon /></IconWrapper>
            </button>
          </div>
        </div>
      </motion.header>

      {/* ===== MOBILE OVERLAY MENU ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-950 md:hidden flex flex-col"
          >
            {/* Overlay Title bar */}
            <div className="px-4 py-5 flex justify-between items-center border-b border-slate-800 bg-slate-900">
              <span className="text-base font-semibold text-white tracking-tight">{name}</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white"
              >
                <IconWrapper><XMarkIcon /></IconWrapper>
              </button>
            </div>

            {/* Mobile Stack links */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
              {navItems.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <a
                    key={label}
                    href={href}
                    className={`block w-full px-4 py-3 rounded-xl text-lg font-medium transition-colors ${
                      isActive 
                        ? 'bg-slate-900 text-white border-l-2' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                    }`}
                    style={{ borderLeftColor: isActive ? primary : 'transparent' }}
                  >
                    {label}
                  </a>
                );
              })}
            </div>

            {/* Mobile Interactive Tray / Context Block */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-2 py-1">
                     {user.image && <img src={user.image} alt="User" className="w-10 h-10 rounded-full border border-slate-700" />}
                     <div>
                       <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
                       <p className="text-xs text-slate-400 tracking-wider font-medium uppercase">{user.role || 'Member'}</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleUserAction}
                      className="py-3 rounded-xl text-xs font-semibold text-white text-center hover:brightness-110 transition-all"
                      style={{ backgroundColor: primary }}
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-semibold text-center hover:bg-slate-700 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleSignIn}
                    className="py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-all"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="py-3 rounded-xl text-white text-xs font-semibold hover:brightness-110 transition-all"
                    style={{ backgroundColor: primary }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;