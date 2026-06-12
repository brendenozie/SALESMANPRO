'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRightIcon,
  UserIcon,
  PhoneIcon,
  GlobeAltIcon,
  TruckIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';

const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => 
  `${src}?w=${width}&q=${quality || 75}`;

const navLinks = [
    { name: "Home", hasSub: true },
    { name: "About", hasSub: true },
    { name: "Services", hasSub: true },
    { name: "Network", hasSub: true },
    { name: "Blog", hasSub: true },
    { name: "Contact Us", hasSub: true },
  ];

export default function Navbar() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { slug, name, tagline, logoUrl, socialLinks = [], themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#f7941d';

  /* =========================
      AUTH & SCROLL LOGIC
  ========================== */
  const handleGoogleSignIn = useCallback(() => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', window.location.origin);
    window.location.href = authUrl.toString();
  }, []);

  const handleUserAction = useCallback(() => {
    if (!user) return handleGoogleSignIn();
    user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push('/logistics/profile');
  }, [user, router, handleGoogleSignIn]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dynamicNavLinks = useMemo(() => {
    return navLinks.map((link) => ({ id: link.name, label: link.name, href: `/logistics/${link.name.toLowerCase()}` }));
    // if (!storeFormData?.StoreCategory) return [];
    // const rawCategories = [...storeFormData.StoreCategory]
    //   .filter((c) => c.visible ?? true)
    //   .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // let links = rawCategories.map((cat) => ({
    //   id: cat.id,
    //   label: cat.displayName || 'Category',
    //   href: `/${slug}/category/${cat.categoryId}`,
    // }));

    // if (links.length < 5) {
    //   rawCategories.forEach((cat) => {
    //     (cat.subcategories || []).filter((s) => s.visible ?? true).slice(0, 2).forEach((sub) => {
    //       links.push({ id: sub.id, label: sub.name, href: `/${slug}/subcategory/${sub.slug}` });
    //     });
    //   });
    // }

    // const seen = new Set();
    // return links.filter(l => !seen.has(l.label) && seen.add(l.label)).slice(0, 6);
  }, [storeFormData, slug]);

  return (
    <header className={`w-full font-sans sticky top-0 z-50 transition-all ${scrolled ? 'shadow-lg' : ''}`}>
      {/* 1. TOP BAR (DESKTOP) */}
      <div className="bg-[#111111] text-white text-[12px] py-2.5 px-6 hidden lg:block border-b border-white/5">
        <div className=" flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-default">
              <PhoneIcon className="text-orange-500 h-3.5 w-3.5" />
              <span className="font-medium text-gray-400">Call: <span className="text-white group-hover:text-orange-500 transition-colors">Support Center</span></span>
            </div>
            <div className="h-3 w-[1px] bg-gray-700" />
            <div className="flex items-center gap-2 group cursor-default">
              <EnvelopeIcon className="text-orange-500 h-3.5 w-3.5" />
              <span className="font-medium text-gray-400">Email: <span className="text-white group-hover:text-orange-500 transition-colors">info@{slug || 'store'}.com</span></span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-orange-500 transition-colors">
              <GlobeAltIcon className="h-3.5 w-3.5 text-orange-500" />
              <span className="font-bold uppercase tracking-wider text-[11px]">English</span>
            </div>
            <div className="h-3 w-[1px] bg-gray-700" />
            <div className="flex items-center gap-3.5">
              {socialLinks.map((s: any) => (
                <a key={s.channel} href={s.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors uppercase font-bold text-[10px]">
                  {s.channel}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <nav className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-20 lg:h-24">
          
          {/* SLANTED BRANDING BOX */}
         <Link
            href="/"
            className="relative h-full flex items-center bg-gradient-to-r from-[#f7941d] to-[#e07d10] pl-6 pr-16 lg:pl-10 lg:pr-24 text-white shrink-0 group overflow-hidden transition-all duration-500 ease-in-out select-none"
            style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
          >
            {/* Premium Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

            {/* Animated Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 h-[4px] w-0 bg-white group-hover:w-[75%] transition-all duration-500 ease-in-out" />

            <div className="flex items-center gap-4 lg:gap-5 relative z-10 transform group-hover:scale-[1.01] transition-transform duration-300">
              
              {/* Logo Icon Container */}
              {logoUrl && (
                <div className="relative w-20 h-10 sm:w-20 sm:h-12 md:w-28 md:h-14 lg:w-32 lg:h-16 flex items-center justify-center filter drop-shadow-md transition-transform duration-300 group-hover:rotate-[-2deg]">
                  <Image 
                    src={logoUrl} 
                    alt={name || 'Logo'} 
                    fill 
                    loader={imageLoader} 
                    className="object-contain" 
                  />
                </div>
              )}

              {/* Typography Stack */}
              <div className="flex flex-col justify-center border-l border-white/20 pl-4 py-1 min-w-0">
                <span className="text-xl lg:text-2xl font-extrabold italic tracking-tight uppercase leading-none drop-shadow-sm truncate">
                  {name || 'Transportation'}
                </span>
                <span className="text-[9px] lg:text-[10px] font-black uppercase text-orange-100 mt-1 block leading-none tracking-wider max-w-[22ch] sm:max-w-[28ch] truncate">
                  {tagline || 'Logistics & Delivery'}
                </span>
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="hidden lg:flex flex-grow justify-center px-4">
            <ul className="flex items-center gap-7">
              {dynamicNavLinks.map((link) => (
                <li key={link.id}>
                  <Link href={link.href} className="text-[13px] font-extrabold uppercase tracking-tight text-slate-800 hover:text-orange-500 transition-colors flex items-center gap-0.5">
                    {link.label}
                    <span className="text-orange-500 text-[10px] font-light">+</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ACTION ICONS */}
          <div className="flex items-center gap-2 sm:gap-5 px-6">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 cursor-pointer hover:text-orange-500 hidden sm:block" />
            
            <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />

            {/* <div className="relative cursor-pointer group" onClick={() => cart.length > 0 && router.push('/logistics/checkout')}>
              <ShoppingBagIcon className="w-6 h-6 text-gray-800 group-hover:text-orange-500 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-blue-700 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {cart.length}
                </span>
              )}
            </div> */}

            <div className="hidden lg:block">
              {user ? (
                <UserIcon onClick={handleUserAction} className="w-6 h-6 cursor-pointer text-gray-800 hover:text-orange-500 transition-colors" />
              ) : (
                <button onClick={handleGoogleSignIn} className="text-[11px] font-black uppercase border-2 border-slate-900 px-5 py-2 hover:bg-slate-900 hover:text-white transition-all tracking-widest">
                  Login
                </button>
              )}
            </div>

            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-slate-900 hover:bg-gray-100 rounded-lg">
              <Bars3Icon className="w-7 h-7" />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm lg:hidden" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 200 }} className="fixed right-0 top-0 h-full w-[85%] max-w-xs bg-white z-[60] shadow-2xl flex flex-col">
              
              <div className="p-6 flex justify-between items-center bg-slate-50 border-b">
                <div className="flex flex-col">
                  <span className="text-xl font-black italic text-orange-500 uppercase leading-none">{name}</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest">MENU</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:rotate-90 transition-transform">
                  <XMarkIcon className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto py-2">
                {dynamicNavLinks.map((link, idx) => (
                  <Link key={link.id} href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-8 py-4.5 border-b border-gray-50 active:bg-orange-50 transition-colors">
                    <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }} className="text-sm font-bold uppercase tracking-tight text-slate-700">
                      {link.label}
                    </motion.span>
                    <ChevronRightIcon className="w-4 h-4 text-orange-500" />
                  </Link>
                ))}
              </div>

              <div className="p-8 bg-[#111111] text-white space-y-5">
                {user ? (
                  <div className="space-y-4">
                    <button onClick={handleUserAction} className="flex items-center gap-3 text-orange-500 text-sm font-black uppercase">
                      <UserIcon className="w-5 h-5" /> Account Profile
                    </button>
                    <button onClick={()=> {
                        const returnTo = window.location.origin;

                        signOut({
                          redirect: true,
                          callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
                        });
                      }} 
                      className="flex items-center gap-3 text-red-400 text-sm font-black uppercase">
                      <ArrowRightOnRectangleIcon className="w-5 h-5" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button onClick={handleGoogleSignIn} className="w-full bg-orange-500 hover:bg-orange-600 py-4 font-black uppercase text-sm tracking-tighter transition-colors">
                    Access Portal
                  </button>
                )}
                <div className="pt-6 border-t border-white/10 flex justify-center gap-6">
                   <Squares2X2Icon className="w-5 h-5 text-gray-500" />
                   <GlobeAltIcon className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}