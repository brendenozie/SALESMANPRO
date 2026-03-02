'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  UserCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const router = useRouter();
  const { scrollY } = useScroll();

  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#C5A267';

  const navItems = [
    { id: 'services', label: 'Rituals' },
    { id: 'benefits', label: 'Philosophy' },
    { id: 'testimonials', label: 'Collective' },
    { id: 'faq', label: 'Intelligence' },
    { id: 'contact', label: 'Concierge' },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

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
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-[100] pointer-events-none"
      >
        <div className="container mx-auto px-6 py-6">
          <div className={`
            relative flex items-center justify-between px-6 py-3 rounded-full transition-all duration-700 pointer-events-auto
            ${scrolled 
              ? 'bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[0.98]' 
              : 'bg-transparent border border-transparent'
            }
          `}>
            
            {/* Logo: Architectural Branding */}
            <Link href="/" className="flex items-center gap-4 z-50 group">
              <div className="relative w-9 h-9 overflow-hidden rounded-full bg-zinc-900 border border-white/5 group-hover:border-[#C5A267]/50 transition-all duration-500">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={name || 'Logo'}
                    fill
                    loader={loader}
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: primaryColor }}>
                    {name?.charAt(0) || 'R'}
                  </div>
                )}
              </div>
              <span className={`text-lg font-black tracking-tighter transition-colors duration-500 ${scrolled ? 'text-white' : 'text-zinc-900'}`}>
                {name || 'RITUAL'}<span style={{ color: primaryColor }}>.</span>
              </span>
            </Link>

            {/* Desktop Nav: Magnetic Experience */}
            <nav className="hidden md:flex items-center bg-white/5 rounded-full p-1 border border-white/5">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`relative px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                    hoveredNav === item.id ? 'text-white' : (scrolled ? 'text-zinc-400' : 'text-zinc-500')
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {hoveredNav === item.id && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-full bg-white/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* Actions: Command Center */}
            <div className="hidden md:flex items-center gap-6">
              {!user ? (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    className={`text-[10px] font-black uppercase tracking-widest transition-all hover:text-[#C5A267] ${scrolled ? 'text-zinc-400' : 'text-zinc-600'}`}
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="group relative flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-[#C5A267] hover:text-white transition-all duration-500"
                  >
                    Join Ritual
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleUserAction}
                  className="flex items-center gap-3 p-1 pr-5 rounded-full bg-zinc-900 border border-white/10 hover:border-[#C5A267]/50 transition-all group"
                >
                  <div className="relative">
                    {user.image ? (
                      <img src={user.image} alt="User" className="w-8 h-8 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                    ) : (
                      <UserCircleIcon className="w-8 h-8 text-zinc-600" />
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>
              )}
            </div>

            {/* Mobile Toggle: Aesthetic Bars */}
            <button
              onClick={() => setIsOpen(true)}
              className={`md:hidden p-3 rounded-full transition-colors ${scrolled ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-900'}`}
            >
              <Bars3BottomRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE OVERLAY: The Velvet Room */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[150] bg-[#050505] flex flex-col p-12"
          >
            <div className="flex items-center justify-between mb-20">
              <span className="text-xl font-black tracking-tighter text-white">{name}</span>
              <button onClick={() => setIsOpen(false)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-8">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-baseline gap-6"
                >
                  <span className="text-[10px] font-bold text-zinc-700 group-hover:text-[#C5A267]">0{i + 1}</span>
                  <span className="text-5xl font-black text-white tracking-tighter group-hover:italic group-hover:text-[#C5A267] transition-all">
                    {item.label}
                  </span>
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto pt-12 border-t border-white/5 space-y-8">
              <div className="flex items-center gap-4 text-zinc-500">
                <ShieldCheckIcon className="w-5 h-5 text-[#C5A267]" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Secure Access Protocol Active</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button onClick={handleUserAction} className="w-full py-6 rounded-2xl bg-[#C5A267] text-black font-black uppercase tracking-[0.2em] text-xs">
                  {user ? 'Enter Dashboard' : 'Get Started'}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}