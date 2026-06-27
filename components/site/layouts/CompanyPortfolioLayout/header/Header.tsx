"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  UserIcon,
  PhoneIcon,
  GlobeAltIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const navLinks = [
  { name: "Home" },
  { name: "About" },
  { name: "Services" },
  { name: "Blog" },
];

export default function Navbar() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { slug, name, tagline, logoUrl, contactEmail, contactPhone, socialLinks = [], themeSettings = {} } = storeFormData || {};
  
  // Adaptive High-Contrast Core Accents
  const systemAccent = themeSettings?.primaryColor || '#F59E0B'; // Amber Core Node

  const handleGoogleSignIn = useCallback(() => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', window.location.origin);
    window.location.href = authUrl.toString();
  }, []);

  const handleUserAction = useCallback(() => {
    if (!user) return handleGoogleSignIn();
    user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push('/companyprofile/profile');
  }, [user, router, handleGoogleSignIn]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dynamicNavLinks = useMemo(() => {
    return navLinks.map((link) => ({ 
      id: link.name, 
      label: link.name, 
      href: `${link.name === 'Home' ? '/' : `/companyprofile/${link.name.toLowerCase()}`}?store=${slug || 'grey-trading'}`
    }));
  }, [slug]);

  return (
    <header className={`w-full font-sans sticky top-0 z-50 transition-all duration-300 border-b ${
      scrolled 
        ? 'bg-zinc-950/80 backdrop-blur-md border-zinc-900 shadow-2xl' 
        : 'bg-zinc-950 border-zinc-900/50'
    }`}>
      
      {/* 1. MONITORING TOP BAR (DESKTOP) */}
      <div className="bg-black/40 text-[11px] font-mono py-2 px-8 hidden lg:block border-b border-zinc-900/60 select-none">
        <div className="flex justify-between items-center text-zinc-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-default">
              <PhoneIcon className="h-3.5 w-3.5 transition-colors" style={{ color: systemAccent }} />
              <span>PHONE: <span className="text-zinc-200 group-hover:text-white transition-colors">{contactPhone || '+1 (555) 123-4567'}</span></span>
            </div>
            <div className="h-3 w-[1px] bg-zinc-800" />
            <div className="flex items-center gap-2 group cursor-default">
              <EnvelopeIcon className="h-3.5 w-3.5 transition-colors" style={{ color: systemAccent }} />
              <span>EMAIL: <span className="text-zinc-200 group-hover:text-white transition-colors">{contactEmail || `info@aurum-precious-trading-limited.com`}</span></span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
              <GlobeAltIcon className="h-3.5 w-3.5" style={{ color: systemAccent }} />
              <span className="tracking-widest uppercase text-[10px]">ENG</span>
            </div>
            <div className="h-3 w-[1px] bg-zinc-800" />
            <div className="flex items-center gap-4">
              {socialLinks.map((s: any) => (
                <a key={s.channel} href={s.url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-200 transition-colors uppercase tracking-wider text-[10px]">
                  {s.channel}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE SYSTEM NAVIGATION */}
      <nav className="h-20 lg:h-24 w-full">
        <div className="flex items-stretch justify-between h-full w-full max-w-[1600px] mx-auto px-6 gap-4">
          
          {/* PREMIUM BRAND NODES - FIXED MOBILE OVERFLOW */}
          <Link href="/" className="flex items-center gap-3 sm:gap-4 group shrink min-w-0 select-none">
            {logoUrl && (
              <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0 border border-zinc-800 bg-zinc-900/40 rounded-lg p-1.5 overflow-hidden transition-all duration-300 group-hover:border-zinc-700">
                <Image 
                  src={logoUrl} 
                  alt={name || 'Logo'} 
                  fill 
                  priority
                  sizes="48px"
                  loader={imageLoader} 
                  className="object-contain p-1 filter brightness-110" 
                />
              </div>
            )}

            <div className="flex flex-col justify-center min-w-0 flex-1">
              <span className="text-sm sm:text-base md:text-lg font-black tracking-wider uppercase text-zinc-100 leading-none group-hover:text-white transition-colors truncate block">
                {name || 'AURUM Trading'}
              </span>
              <span className="hidden sm:block text-[9px] font-mono uppercase tracking-[0.18em] text-zinc-500 mt-1 leading-none truncate">
                {tagline || 'Risk Infrastructure'}
              </span>
            </div>
          </Link>

          {/* LINEAR NAVIGATION ELEMENT */}
          <div className="hidden lg:flex items-center flex-grow justify-center px-8">
            <ul className="flex items-center gap-8">
              {dynamicNavLinks.map((link) => (
                <li key={link.id} className="relative py-2 group">
                  <Link 
                    href={link.href} 
                    className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    {link.label}
                  </Link>
                  <motion.div 
                    className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                    style={{ backgroundColor: systemAccent }}
                    layoutId="navIndicator"
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* COMPLIANCE CORE UTILITIES */}
          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors hidden sm:block">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </button>
            
            <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block" />

            <div className="hidden lg:block">
              {user ? (
                <button 
                  onClick={handleUserAction}
                  className="flex items-center gap-2 border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 text-zinc-300 hover:text-white font-mono text-[10px] tracking-wider uppercase py-2.5 px-4 rounded-md transition-all"
                >
                  <UserIcon className="w-3.5 h-3.5" style={{ color: systemAccent }} />
                  {user.name || 'Profile'}
                </button>
              ) : (
                <button 
                  onClick={handleGoogleSignIn} 
                  className="font-mono text-[10px] tracking-widest uppercase border border-zinc-800 bg-zinc-950 px-5 py-2.5 text-zinc-300 hover:text-white hover:border-zinc-700 transition-all rounded-md"
                >
                  Login
                </button>
              )}
            </div>

            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="lg:hidden p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 rounded-lg transition-all shrink-0"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE ARCHITECTURE DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMenuOpen(false)} 
              className="fixed inset-0 bg-black/60 backdrop-blur-md lg:hidden z-[60]" 
            />
            
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 30, stiffness: 220 }} 
              className="fixed right-0 top-0 h-full w-[85%] max-w-xs bg-zinc-950 border-l border-zinc-900 z-[70] shadow-2xl flex flex-col font-sans"
            >
              {/* FIXED DRAWER HEADER FOR LONG NAMES */}
              <div className="p-6 flex justify-between items-center border-b border-zinc-900 bg-zinc-900/20 gap-4">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-black tracking-wider text-zinc-100 uppercase leading-none truncate block">{name || 'Grey Trading'}</span>
                  <span className="text-[9px] font-mono text-zinc-500 tracking-widest mt-1">SYS_NAVIGATION</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-2 border border-zinc-800 bg-zinc-900/40 text-zinc-400 rounded-md hover:text-zinc-200 transition-transform shrink-0"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto py-4 px-4 space-y-1">
                {dynamicNavLinks.map((link, idx) => (
                  <Link 
                    key={link.id} 
                    href={link.href} 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center justify-between p-4 rounded-lg border border-transparent hover:border-zinc-900 hover:bg-zinc-900/30 transition-all group"
                  >
                    <motion.span 
                      initial={{ opacity: 0, x: 8 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.03 }} 
                      className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-200 transition-colors"
                    >
                      {link.label}
                    </motion.span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  </Link>
                ))}
              </div>

              <div className="p-6 bg-black/40 border-t border-zinc-900 space-y-4">
                {user ? (
                  <div className="space-y-3">
                    <button 
                      onClick={handleUserAction} 
                      className="flex items-center justify-center gap-3 w-full border border-zinc-800 bg-zinc-900/60 py-3 rounded-lg text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      <UserIcon className="w-4 h-4" style={{ color: systemAccent }} /> 
                      {user.name || 'Profile'}
                    </button>
                    <button 
                      onClick={() => {
                        const returnTo = window.location.origin;
                        signOut({
                          redirect: true,
                          callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                        });
                      }} 
                      className="flex items-center justify-center gap-3 w-full border border-red-950/40 bg-red-950/10 hover:bg-red-950/20 py-3 rounded-lg text-red-400 font-mono text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleGoogleSignIn} 
                    className="w-full py-3.5 rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all text-zinc-950"
                    style={{ backgroundColor: systemAccent }}
                  >
                    Login
                  </button>
                )}
                <div className="pt-4 border-t border-zinc-900/60 flex justify-center gap-6 text-zinc-600">
                   <Squares2X2Icon className="w-4 h-4" />
                   <GlobeAltIcon className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}