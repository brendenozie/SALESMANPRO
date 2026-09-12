'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ChevronDownIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { EditableElement } from '@/contexts/EditableContentContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const loader = ({ src }: { src: string }) => src;

interface CategoryItem {
  id: string;
  name: string;
  displayName?: string;
  slug?: string;
}

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext() || {};
  const { data: session } = useSession();
  
  const user = session?.user as { id?: string; name?: string; image?: string; role?: string; } | undefined;

  const {
    name = 'St. Edwards Academy',
    slug = '',
    logoUrl,
    contactEmail,
    contactPhone,
    StoreCategory = [] as CategoryItem[],
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#1e3a8a';
  
  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const handleUserAction = () => {
    setMobileMenuOpen(false);
    if (!user) return router.push(`/courses/login`);
    user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push(`/admin/${user.id}`);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pointer-events-none ${scrolled ? 'pt-2' : 'pt-4 md:pt-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pointer-events-auto">
          
          <div className={`relative flex items-center justify-between px-3 sm:px-6 py-2.5 md:rounded-full bg-white/90 dark:bg-slate-900/90 border border-white/50 dark:border-slate-800/50 shadow-[0_12px_30px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-500 ${scrolled ? 'md:py-2 shadow-[0_15px_40px_rgba(0,0,0,0.08)]' : 'md:py-3.5'}`}>
            
            {/* 1. BRAND EMBLEM ARCHITECTURE (With Mobile Overflow Safeguards) */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0 group select-none min-w-0" 
              onClick={() => { router.push(`/site/${slug}`); setMobileMenuOpen(false); }}
            >
              {logoUrl ? (
                <div className="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden p-1 transition-transform group-hover:scale-102 shrink-0">
                  <Image 
                    src={logoUrl} 
                    alt={name} 
                    fill
                    loader={loader} 
                    className="object-contain p-0.5" 
                    priority 
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-900/10 shrink-0" style={{ backgroundColor: primaryColor }}>
                  <AcademicCapIcon className="w-4 sm:w-5 h-5" />
                </div>
              )}
              
              {/* Added adaptive max widths & text-truncation nodes to accommodate lengthy names */}
              <div className="flex flex-col border-l border-slate-200 dark:border-slate-800 pl-2.5 sm:pl-3 min-w-0 max-w-[130px] xs:max-w-[170px] sm:max-w-[240px] md:max-w-[320px] lg:max-w-xs xl:max-w-none">
                <EditableElement
                  targetId="header.storeName"
                  componentKey="Header"
                  elementKey="storeName"
                  label="Store / Brand Name"
                  defaultValue={name}
                  inline
                >
                  {(val) => (
                    <span className="text-xs sm:text-base font-serif font-black text-slate-900 dark:text-white leading-tight tracking-tight truncate">
                      {val}
                    </span>
                  )}
                </EditableElement>
                <span className="text-[8px] font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block truncate">
                  Foundations of Excellence
                </span>
              </div>
            </div>

            {/* 2. DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/60 rounded-full p-1 border border-slate-200/40 dark:border-slate-700/30 relative">
              <EditableElement
                targetId="header.nav.0.label"
                componentKey="Header"
                elementKey="nav.0.label"
                label="Nav Home"
                defaultValue="Home"
                inline
              >
                {(val) => (
                  <Link href="/" className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all rounded-full hover:bg-white dark:hover:bg-slate-800">
                    {val}
                  </Link>
                )}
              </EditableElement>
              <EditableElement
                targetId="header.nav.1.label"
                componentKey="Header"
                elementKey="nav.1.label"
                label="Nav Programs"
                defaultValue="Programs"
                inline
              >
                {(val) => (
                  <Link href="/courses/products" className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all rounded-full hover:bg-white dark:hover:bg-slate-800">
                    <AcademicCapIcon className="w-3.5 h-3.5" /> {val}
                  </Link>
                )}
              </EditableElement>
              
              <div className="relative">
                <button 
                  className={`flex items-center gap-1 px-5 py-2 text-xs font-bold transition-all rounded-full ${categoriesOpen ? 'bg-white dark:bg-slate-800 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}
                  style={categoriesOpen ? { color: primaryColor } : {}}
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                >
                  <Squares2X2Icon className="w-3.5 h-3.5" />
                  <span>Categories</span>
                  <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute top-full mt-3 right-1/2 translate-x-1/2 w-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3 py-1.5 border-b border-slate-50 dark:border-slate-800/60 mb-1">
                        Explore Disciplines
                      </div>
                      {StoreCategory.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {StoreCategory.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setCategoriesOpen(false);
                                router.push(`/courses/products?category=${cat.id}`);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors flex items-center justify-between group"
                            >
                              <span>{cat.displayName || cat.name}</span>
                              <span className="w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: primaryColor }} />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic p-3 text-center">No categories configured</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* 3. UTILITIES & CONTROLS */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden xl:flex flex-col text-right pr-4 border-r border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-black text-slate-900 dark:text-white tracking-tight">{contactPhone || '+1 (555) 000-1234'}</p>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 lowercase mt-0.5">{contactEmail || 'admissions@academy.edu'}</p>
              </div>

              <button 
                onClick={handleUserAction}
                className="flex items-center gap-2 pl-1.5 pr-2.5 sm:pr-5 py-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-all shadow-md active:scale-98 group"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-800 dark:bg-slate-100 overflow-hidden ring-2 ring-white/10 dark:ring-slate-950/10 flex items-center justify-center shrink-0">
                  {user?.image ? (
                    <img src={user.image} className="w-full h-full object-cover" alt="User Profile" />
                  ) : (
                    <UserIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">
                  {user ? 'Dashboard' : 'Portal'}
                </span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-300 lg:hidden transition-colors"
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? <XMarkIcon className="w-4 h-4 sm:w-5 h-5" /> : <Bars3Icon className="w-4 h-4 sm:w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 4. DRAWER VIEWPORT MOBILE NAVIGATION SYSTEM */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[90] lg:hidden flex justify-end"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-sm bg-white dark:bg-slate-950 h-full p-6 pt-24 flex flex-col justify-between shadow-2xl relative border-l border-slate-100 dark:border-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col space-y-6 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3">Navigation</span>
                  <Link 
                    href="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl block"
                  >
                    Home Overview
                  </Link>
                  <Link 
                    href="/courses/products" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl flex items-center gap-2"
                  >
                    <AcademicCapIcon className="w-4 h-4 text-slate-400" /> Academic Programs
                  </Link>
                </div>

                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3">Available Disciplines</span>
                  {StoreCategory.length > 0 ? (
                    <div className="grid grid-cols-1 gap-1 px-1">
                      {StoreCategory.map((cat: CategoryItem) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push(`/courses/products?category=${cat.id}`);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: primaryColor }} />
                          <span className="truncate">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic px-3">No categories cataloged.</p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-900 pt-6 space-y-4 bg-white dark:bg-slate-950 z-10">
                <div className="space-y-2.5 px-2">
                  <a href={`tel:${contactPhone || '+15550001234'}`} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                    <PhoneIcon className="w-4 h-4 opacity-60" style={{ color: primaryColor }} />
                    <span className="truncate">{contactPhone || '+1 (555) 000-1234'}</span>
                  </a>
                  <a href={`mailto:${contactEmail || 'admissions@academy.edu'}`} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white break-all">
                    <EnvelopeIcon className="w-4 h-4 opacity-60" style={{ color: primaryColor }} />
                    <span className="truncate">{contactEmail || 'admissions@academy.edu'}</span>
                  </a>
                </div>

                <button
                  onClick={handleUserAction}
                  className="w-full py-3.5 rounded-xl text-center text-xs font-black uppercase tracking-widest text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{user ? 'Enter Command Center' : 'Access Secure Portal'}</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}