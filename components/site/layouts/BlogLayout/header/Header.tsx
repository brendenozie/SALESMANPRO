'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

// --- Icons (Enhanced with generic wrapper for consistency) ---
const IconWrapper = ({ children, className = "w-6 h-6" }: { children: React.ReactNode, className?: string }) => (
  <div className={`${className} transition-transform duration-200`}>{children}</div>
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
  const { slug, name, logoUrl, themeSettings } = storeFormData || {
    slug: 'my-blog',
    name: 'GLOBAL INSIGHTS',
    logoUrl: 'https://placehold.co/40x40/EF4444/FFFFFF?text=GI',
    themeSettings: { primaryColor: '#EF4444', secondaryColor: '#EC4899' },
  };

  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  // --- UI State ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --- Navigation Items ---
  const navItems = [
    { label: 'Home', href: `/` },
    { label: 'Blog', href: `/blog/products` },
    { label: 'About', href: `/blog/about` },
    { label: 'Contact', href: `/blog/contact` },
  ];

  // --- Handlers ---
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/blog/profile`);
  };

  const handleSignOut = () => signOut({ callbackUrl: `/` });

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
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
          scrolled
            ? 'bg-slate-950/70 backdrop-blur-xl border-white/5 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
            : 'bg-transparent border-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* ===== LEFT: LOGO ===== */}
          <motion.div
            className="flex items-center gap-3 cursor-pointer z-50"
            onClick={() => router.push(`/`)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative group">
              {logoUrl ? (
                <div className="relative rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-white/30 transition-all">
                   <img src={logoUrl} alt={name} width={42} height={42} className="object-cover w-8 h-8" />
                   <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <span
              className="text-xl font-bold tracking-tight hidden sm:block"
              style={{ color: '#fff' }}
            >
              {name}
            </span>
          </motion.div>

          {/* ===== CENTER: DESKTOP NAV (THE ISLAND) ===== */}
          <nav className="hidden md:flex items-center bg-white/5 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/5 shadow-sm">
            <ul className="flex items-center gap-1">
              {navItems.map(({ label, href }) => {
                const isActive = pathname === href;
                return (
                  <li key={label} className="relative">
                    <a
                      href={href}
                      onMouseEnter={() => setHoveredNav(label)}
                      onMouseLeave={() => setHoveredNav(null)}
                      className={`relative z-10 px-5 py-2 text-sm font-medium transition-colors duration-300 ${
                         isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </a>
                    
                    {/* Floating Pill Animation */}
                    {hoveredNav === label && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Active Indicator Dot */}
                    {isActive && !hoveredNav && (
                      <motion.div 
                        layoutId="nav-pill"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ===== RIGHT: ACTIONS ===== */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Search"
            >
              <IconWrapper><MagnifyingGlassIcon /></IconWrapper>
            </motion.button>

            {/* User / CTA */}
            <div className="hidden md:block">
              {user ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button onClick={handleUserAction} className="relative group">
                    {user.image ? (
                       <img src={user.image} alt="Profile" className="w-9 h-9 rounded-full border border-gray-700 group-hover:border-white/50 transition-colors" />
                    ) : (
                      <div className="p-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white transition-all">
                        <IconWrapper className="w-5 h-5"><UserIcon /></IconWrapper>
                      </div>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleSignIn}
                  className="px-5 py-2 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                  style={{ 
                    background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                    boxShadow: `0 0 15px ${primary}40` // 40 = opacity
                  }}
                >
                  Log In
                </motion.button>
              )}
            </div>

             {/* Mobile Menu Toggle */}
             <div className="md:hidden z-50">
               {mobileMenuOpen ? (
                 // Using a separate close button in the overlay, 
                 // but this ensures the toggle button area remains interactive if needed
                 <div /> 
               ) : (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-gray-200 p-1"
                >
                  <IconWrapper className="w-7 h-7"><Bars3Icon /></IconWrapper>
                </motion.button>
               )}
             </div>
          </div>
        </div>
      </motion.header>

      {/* ===== MOBILE OVERLAY MENU ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-2xl md:hidden flex flex-col"
          >
            {/* Menu Header */}
            <div className="px-6 py-6 flex justify-between items-center border-b border-white/10">
              <span className="text-xl font-bold text-white tracking-wide">{name}</span>
              <motion.button 
                whileTap={{ rotate: 90, scale: 0.8 }}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
              >
                <IconWrapper><XMarkIcon /></IconWrapper>
              </motion.button>
            </div>

            {/* Menu Links Staggered */}
            <motion.div 
              className="flex-1 flex flex-col justify-center px-8 space-y-6"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.1 }
                }
              }}
            >
              {navItems.map(({ label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    show: { opacity: 1, x: 0 }
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 hover:to-white transition-all duration-300"
                >
                  {label}
                </motion.a>
              ))}
            </motion.div>

            {/* Menu Footer / Auth */}
            <motion.div 
              className="p-8 border-t border-white/10 bg-white/5"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-4">
                     {user.image && <img src={user.image} alt="User" className="w-12 h-12 rounded-full" />}
                     <div>
                       <p className="text-white font-medium">{user.name || 'User'}</p>
                       <p className="text-xs text-gray-400 uppercase tracking-wider">{user.role || 'Member'}</p>
                     </div>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleUserAction(); }}
                    className="w-full py-3.5 rounded-xl font-semibold text-white shadow-lg"
                    style={{ background: primary }}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="w-full py-3.5 text-gray-400 font-medium hover:text-white transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                    className="py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignUp(); }}
                    className="py-3.5 rounded-xl text-white font-semibold shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;