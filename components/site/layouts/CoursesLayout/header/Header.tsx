'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const loader = ({ src }: { src: string }) => src;

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext() || {};
  const { data: session } = useSession();
  const user = session?.user as { id?: string; name?: string; image?: string } | undefined;

  const {
    name = 'St. Edwards Academy', // Default fallback
    slug = '',
    logoUrl,
    contactEmail,
    contactPhone,
    StoreCategory = [],
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#1e3a8a';
  const [scrolled, setScrolled] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 pointer-events-none ${scrolled ? 'pt-2' : 'pt-6'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 pointer-events-auto">
        
        <div className={`relative flex items-center justify-between px-6 py-2 md:rounded-[2rem] bg-white/90 border border-white/50 shadow-[0_15px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all duration-500 ${scrolled ? 'md:py-2' : 'md:py-4'}`}>
          
          {/* --- LOGO & SCHOOL NAME --- */}
          <div className="flex items-center gap-4 cursor-pointer shrink-0" onClick={() => router.push(`/site/${slug}`)}>
            {logoUrl && (
              <Image src={logoUrl} alt={name} width={45} height={45} loader={loader} className="h-10 w-auto object-contain" priority />
            )}
            <div className="flex flex-col border-l border-slate-200 pl-4">
              <span className="text-lg md:text-xl font-serif font-bold text-slate-900 leading-tight tracking-tight">
                {name}
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Foundations of Excellence
              </span>
            </div>
          </div>

          {/* --- NAVIGATION --- */}
          <nav className="hidden lg:flex items-center gap-2 bg-slate-50/80 rounded-full p-1 border border-slate-100">
            <Link href={`/site/${slug}`} className="px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-all rounded-full hover:bg-white">
              Home
            </Link>
            <Link href={`/courses`} className="flex items-center gap-2 px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-all rounded-full hover:bg-white">
              <AcademicCapIcon className="w-4 h-4" /> Programs
            </Link>
            
            <button 
              className="flex items-center gap-1 px-5 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-900"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              Categories <ChevronDownIcon className={`w-3 h-3 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
          </nav>

          {/* --- CONTACT & USER --- */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex flex-col text-right pr-4 border-r border-slate-100">
              <p className="text-[10px] font-bold text-slate-900">{contactPhone || '+1 (555) 000-1234'}</p>
              <p className="text-[9px] font-medium text-slate-400">{contactEmail || 'admissions@academy.edu'}</p>
            </div>

            <button 
              onClick={() => router.push(`/site/${slug}/courses/login`)}
              className="flex items-center gap-2 pl-1.5 pr-5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden ring-2 ring-white/10">
                {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="" /> : <UserIcon className="w-4 h-4 m-2" />}
              </div>
              <span className="hidden sm:block text-[11px] font-black uppercase tracking-widest">Portal</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}