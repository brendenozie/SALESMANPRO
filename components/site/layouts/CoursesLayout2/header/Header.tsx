'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider'; 
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function MoriahHeader() {
  const router = useRouter();
  const { storeFormData } = useStoreContext() || {};
  const stateCtx = useStateContext ? useStateContext() : undefined;
  const cart = stateCtx?.cart ?? [];
  const { data: session } = useSession();
  const user = session?.user as { id?: string; role?: string; name?: string; image?: string } | undefined;

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Handle scroll state for glass effect
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const { name = 'Academy', slug = '', themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#1e40af';

  const handleUserAction = () => {
    if (!user) return router.push(`/courses/login`);
    user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push(`/admin/${user.id}`);
  };

  const navLinks = [
    { name: 'Programs', href: `/courses` },
    { name: 'Community', href: `/courses/community` },
    { name: 'Success Stories', href: `/courses/success-stories` },
    { name: 'Contact', href: `/courses/contact` },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="container mx-auto px-6">
        <nav 
          className={`flex items-center justify-between px-6 py-3 rounded-[2rem] transition-all duration-500 border ${
            isScrolled 
              ? 'bg-white/80 backdrop-blur-xl border-slate-200/50 shadow-lg shadow-slate-900/5' 
              : 'bg-transparent border-transparent'
          }`}
        >
          {/* --- Brand Architecture --- */}
          <Link href={`/`} className="flex items-center gap-3 group">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:shadow-lg"
              style={{ backgroundColor: storeFormData?.logoUrl ? 'transparent' : primaryColor }}
            >
              {/* <AcademicCapIcon className="w-6 h-6 text-white" /> */}
              {storeFormData?.logoUrl ? (
                <Image 
                  src={storeFormData?.logoUrl || "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d"}
                  alt={name} 
                  width={24} 
                  height={24} 
                  className="object-cover rounded-lg"
                  loader={({src})=>src}
                />
                ) : (
                  <AcademicCapIcon className="w-6 h-6 text-white" />
                )}
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors duration-500 ${
              isScrolled ? 'text-slate-900' : 'text-slate-900'
            }`}>
              {name}
            </span>
          </Link>

          {/* --- Central Navigation (Desktop) --- */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors relative group"
              >
                {link.name}
                <span className="absolute bottom-1 left-5 right-5 h-px bg-slate-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </div>

          {/* --- Action Cluster --- */}
          <div className="flex items-center gap-2">
            {/* Search Bar (Subtle) */}
            <div className="hidden md:flex items-center bg-slate-100/50 rounded-full px-4 py-2 border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all">
              <MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                className="bg-transparent border-none outline-none text-xs ml-2 w-28 focus:w-40 transition-all text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-1 border-l border-slate-200 ml-2 pl-2">
              {/* Shopping Bag */}
              {/* <button 
                onClick={() => router.push(`/checkout`)}
                className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all relative"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {cart?.length > 0 && (
                  <span 
                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cart.length}
                  </span>
                )}
              </button> */}

              {/* User Identity */}
              <button 
                onClick={handleUserAction}
                className="p-1 text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                {user?.image ? (
                  <img src={user.image} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt="Avatar" />
                ) : (
                  <div className="p-1.5"><UserIcon className="w-5 h-5" /></div>
                )}
              </button>

              {/* Mobile Toggle */}
              <button 
                className="lg:hidden p-2 text-slate-900" 
                onClick={() => setMobileMenuOpen(true)}
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* --- Mobile Full-Screen Menu --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-white z-[200] p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-xl font-bold">{name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-slate-50 rounded-full text-slate-900">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-light text-slate-900 hover:text-blue-600 flex items-center gap-4 group"
                  >
                    {link.name}
                    <ArrowRightIcon className="w-8 h-8 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto p-8 bg-slate-50 rounded-[2rem]">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Join our newsletter</p>
              <div className="flex bg-white rounded-xl p-1 border border-slate-200">
                <input type="text" placeholder="you@email.com" className="bg-transparent flex-1 px-4 text-sm outline-none" />
                <button 
                  className="px-6 py-3 rounded-lg text-white text-xs font-bold uppercase tracking-widest"
                  style={{ backgroundColor: primaryColor }}
                >
                  Join
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}