'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars2Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightIcon,
  ArrowUpRightIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const router = useRouter();

  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#059669';

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'benefits', label: 'Why Us' },
    { id: 'testimonials', label: 'Stories' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push(`/bookings/profile`);
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', window.location.origin);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signup');
    authUrl.searchParams.set('callbackUrl', window.location.origin);
    window.location.href = authUrl.toString();
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-in-out ${
          scrolled ? 'py-4' : 'py-8'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className={`relative flex items-center justify-between px-4 py-2 rounded-[2rem] transition-all duration-500 ${
            scrolled 
              ? 'bg-white/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-slate-200/50' 
              : 'bg-transparent'
          }`}>
            
            {/* Logo Section */}
            <Link href="#hero" className="flex items-center gap-3 z-50 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-slate-100 group-hover:shadow-lg transition-all duration-300">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name || 'Logo'}
                    fill
                    loader={loader}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-white" style={{ backgroundColor: primaryColor }}>
                    {name?.charAt(0) || 'B'}
                  </div>
                )}
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900">
                {name || 'SwiftServe'}
              </span>
            </Link>

            {/* Desktop Navigation - Pill Design */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="relative px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <span className="relative z-10">{item.label}</span>
                  {hoveredNav === item.id && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-slate-100"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {!user ? (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="group flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Join Now
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleUserAction}
                  className="flex items-center gap-3 p-1 pr-4 rounded-full bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group"
                >
                  {user.image ? (
                    <img src={user.image} alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
                  ) : (
                    <UserCircleIcon className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[80px]">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-50 text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bars2Icon className="h-6 w-6 stroke-2" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-md md:hidden"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[100] w-full max-w-sm bg-white shadow-2xl flex flex-col p-8"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="text-2xl font-black tracking-tighter text-slate-900">{name}</span>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full bg-slate-50 text-slate-500">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col gap-4 flex-1">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-4 text-3xl font-black text-slate-900 border-b border-slate-50 hover:text-emerald-600 transition-colors group"
                  >
                    {item.label}
                    <ArrowUpRightIcon className="w-6 h-6 text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </a>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                {!user ? (
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleGoogleSignIn} className="py-4 rounded-2xl font-bold bg-slate-50 text-slate-900">Log In</button>
                    <button onClick={handleGoogleSignUp} className="py-4 rounded-2xl font-bold text-white shadow-lg" style={{ backgroundColor: primaryColor }}>Sign Up</button>
                  </div>
                ) : (
                  <button onClick={handleUserAction} className="w-full py-4 rounded-2xl font-bold bg-slate-900 text-white">Dashboard</button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}