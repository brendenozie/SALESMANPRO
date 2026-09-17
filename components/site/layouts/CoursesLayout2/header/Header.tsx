'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider';
import { useSession } from 'next-auth/react';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

const loader = ({ src }: { src: string }) => src;

export default function MoriahHeader() {
  const router = useRouter();
  const { storeFormData } = useStoreContext() || {};
  const stateCtx = useStateContext ? useStateContext() : undefined;
  const cart = stateCtx?.cart ?? [];
  const { data: session } = useSession();
  const user = session?.user as { id?: string; role?: string; name?: string; image?: string } | undefined;

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  
  const { scrollY } = useScroll();

  // Advanced smooth scroll detection
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const { name = 'Academy', slug = '', themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#1e40af';

  const handleUserAction = () => {
    setMobileMenuOpen(false);
    if (!user) return router.push(`/courses/login`);
    user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push(`/admin/${user.id}`);
  };

  const navLinks = [
    { name: 'Programs', href: `/courses` },
    { name: 'Community', href: `/courses/community` },
    { name: 'Success Stories', href: `/courses/success-stories` },
    { name: 'Contact', href: `/courses/contact` },
  ];

  // Framer Motion Variants for Staggered Mobile Menu
  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ease-in-out px-4 sm:px-6 lg:px-8 ${
          isScrolled ? 'py-3' : 'py-5 md:py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          {/* --- Main Navigation Island --- */}
          <motion.nav 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
            className={`flex items-center justify-between px-3 md:px-5 py-2.5 mx-auto transition-all duration-500 rounded-full ${
              isScrolled 
                ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/40 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)]' 
                : 'bg-transparent border border-transparent'
            }`}
          >
            {/* --- Brand Architecture (With Mobile Truncation Fix) --- */}
            <Link href={`/site/${slug}`} className="flex items-center gap-3 group shrink-0 min-w-0">
              <div 
                className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 overflow-hidden shadow-sm shrink-0"
                style={{ backgroundColor: storeFormData?.logoUrl ? 'transparent' : primaryColor }}
              >
                {storeFormData?.logoUrl ? (
                  <Image 
                    src={storeFormData.logoUrl}
                    alt={name} 
                    fill
                    loader={loader}
                    className="object-contain p-1.5 drop-shadow-sm"
                    unoptimized
                  />
                ) : (
                  <AcademicCapIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                )}
              </div>
              
              {/* Intelligent Truncation Wrapper for long names */}
              <div className="flex flex-col min-w-0">
                <span className={`text-base sm:text-lg lg:text-xl font-extrabold tracking-tight truncate max-w-[140px] xs:max-w-[180px] sm:max-w-[250px] md:max-w-xs transition-colors duration-500 ${
                  isScrolled ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'
                }`}>
                  {name}
                </span>
              </div>
            </Link>

            {/* --- Central Navigation (Desktop Magnetic Hover) --- */}
            <div className="hidden lg:flex items-center gap-1.5 relative z-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className="relative px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full"
                >
                  {hoveredLink === link.name && (
                    <motion.div
                      layoutId="nav-hover"
                      className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-full -z-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* --- Action Cluster --- */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              
              {/* Desktop Search */}
              <div className="hidden md:block">
                <StoreHeaderSearch
                  variant="pill"
                  placeholder="Search courses..."
                  className="bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200/50 dark:border-slate-700/50"
                />
              </div>

              {/* Mobile Search */}
              <div className="md:hidden">
                <StoreHeaderSearch
                  variant="button"
                  className="p-2 text-slate-700 dark:text-slate-300 rounded-full"
                />
              </div>

              {/* User Avatar / Portal Action */}
              <button 
                onClick={handleUserAction}
                className="hidden sm:flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-md active:scale-95 border border-slate-800 dark:border-slate-200"
              >
                {user?.image ? (
                  <img src={user.image} className="w-7 h-7 rounded-full object-cover border border-white/20" alt="Avatar" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-slate-100 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-[11px] font-bold tracking-wide">
                  {user ? 'Dashboard' : 'Sign In'}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden p-2.5 text-slate-900 dark:text-white rounded-full bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors backdrop-blur-md" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

            </div>
          </motion.nav>
        </div>
      </header>

      {/* --- Mobile Full-Screen Menu (Stunning Overhaul) --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[200] flex flex-col bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-2xl"
          >
            {/* Header of Mobile Menu */}
            <div className="flex justify-between items-center p-6 sm:p-8 pt-8 sm:pt-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate max-w-[200px]">{name}</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-900 dark:text-white shadow-sm transition-all active:scale-90"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Staggered Navigation Links */}
            <motion.div 
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col justify-center px-8 sm:px-12 gap-6 sm:gap-8"
            >
              {navLinks.map((link) => (
                <motion.div key={link.name} variants={itemVariants}>
                  <Link 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center justify-between group"
                  >
                    <span>{link.name}</span>
                    <ArrowRightIcon className="w-6 h-6 sm:w-8 sm:h-8 opacity-0 -translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 ease-out" style={{ color: primaryColor }} />
                  </Link>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mt-6 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors" />
                </motion.div>
              ))}

              <motion.div variants={itemVariants} className="pt-4">
                <button
                  onClick={handleUserAction}
                  className="w-full py-4 rounded-2xl text-center text-sm font-bold text-white shadow-xl shadow-primary/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>{user ? 'Go to Dashboard' : 'Sign in to Portal'}</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Footer Newsletter Action */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-auto p-6 sm:p-8"
            >
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 text-center">Join the Academy Newsletter</p>
                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-transparent flex-1 px-4 text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400" 
                  />
                  <button 
                    className="px-6 py-3 rounded-lg text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}