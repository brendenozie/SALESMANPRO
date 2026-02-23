'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider'; 
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const router = useRouter();
  const { storeFormData } = useStoreContext() || {};
  const stateCtx = useStateContext ? useStateContext() : undefined;
  const cart = stateCtx?.cart ?? [];
  const { data: session } = useSession();
  const user = session?.user as { id?: string; role?: string; name?: string; image?: string } | undefined;

  const {
    name = 'Private School',
    slug = '',
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks = [],
    StoreCategory = [],
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#2563eb';

  // --- Search Logic (Retained from Original) ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; slug?: string }[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      const ac = new AbortController();
      abortControllerRef.current = ac;
      fetch(`/api/courses/search?q=${encodeURIComponent(query.trim())}`, { signal: ac.signal })
        .then(res => res.json())
        .then(data => setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []))
        .finally(() => setLoadingSuggestions(false));
    }, 250);
  }, [query]);

  const handleUserAction = () => {
    if (!user) return router.push(`/site/${slug}/courses/login`);
    user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push(`/admin/${user.id}`);
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white font-sans border-b-2 border-slate-900">
      {/* 1. Top Notebook Strip (Socials & Contact) */}
      <div className="relative border-b border-slate-100 bg-slate-50/50 py-1.5 px-6 hidden md:flex justify-between items-center overflow-hidden">
        {/* Subtle Grid overlay for the strip */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
        
        <div className="relative z-10 flex gap-6">
          {contactEmail && (
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
              <EnvelopeIcon className="w-3 h-3" /> {contactEmail}
            </a>
          )}
        </div>
        <div className="relative z-10 flex gap-4">
          {socialLinks.map((s: any) => (
            <a key={s.channel} href={s.url} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 tracking-tighter">
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="relative px-4 py-4 md:px-8 flex items-center justify-between gap-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => router.push(`/site/${slug}`)}>
          <div className="p-2 border-2 border-slate-900 shadow-[3px_3px_0px_#000] group-hover:shadow-none transition-all">
            <BookOpenIcon className="w-6 h-6 text-slate-900" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 uppercase leading-none">
            {name.split(' ').map((word, i) => <span key={i} className={i === 1 ? 'text-blue-600' : ''}>{word} </span>)}
          </span>
        </div>

        {/* Live Search - Notebook Styled */}
        <div className="hidden md:flex relative flex-1 max-w-md">
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the archives..."
            className="w-full bg-transparent border-b-2 border-slate-200 py-1 pl-8 focus:border-blue-600 focus:outline-none text-sm font-medium transition-colors"
          />
          <MagnifyingGlassIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          
          <AnimatePresence>
            {query.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute top-full left-0 w-full bg-white border-2 border-slate-900 mt-2 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden z-50"
              >
                {loadingSuggestions ? (
                  <div className="p-4 text-xs font-bold text-slate-400 animate-pulse uppercase">Searching...</div>
                ) : (
                  suggestions.map(sug => (
                    <div 
                      key={sug.id} 
                      onClick={() => { router.push(`/site/${slug}/courses/${sug.slug}`); setQuery(''); }}
                      className="p-3 border-b border-slate-100 hover:bg-blue-50 cursor-pointer font-bold text-slate-800 text-sm"
                    >
                      {sug.title}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-6">
          <nav className="hidden lg:flex items-center gap-8">
            <Link href={`/site/${slug}`} className="text-sm font-black uppercase tracking-tight text-slate-900 hover:text-blue-600 transition-colors">Home</Link>
            <button 
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 text-sm font-black uppercase tracking-tight text-slate-900 hover:text-blue-600"
            >
              Catalog <ChevronDownIcon className={`w-4 h-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
          </nav>

          <div className="h-8 w-[2px] bg-slate-100 hidden md:block" />

          <button onClick={handleUserAction} className="p-2 hover:bg-slate-50 rounded-full transition-colors relative group">
            {user?.image ? (
              <img src={user.image} className="w-6 h-6 rounded-full border border-slate-900" alt="profile" />
            ) : (
              <UserIcon className="w-6 h-6 text-slate-900" />
            )}
          </button>

          <button onClick={() => router.push(`/checkout`)} className="p-2 hover:bg-slate-50 rounded-full transition-colors relative">
            <ShoppingBagIcon className="w-6 h-6 text-slate-900" />
            {cart?.length > 0 && (
              <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                {cart.length}
              </span>
            )}
          </button>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
            <Bars3Icon className="w-8 h-8 text-slate-900" />
          </button>
        </div>
      </div>

      {/* 3. Mobile Notebook Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(#4a90e2 1px, transparent 1px), linear-gradient(90deg, #4a90e2 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
            
            <div className="flex justify-end p-6 relative z-10">
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 border-2 border-slate-900">
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-10 gap-8 relative z-10">
              {['Home', 'Catalog', 'My Learning', 'Contact'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href="#" className="text-6xl font-black text-slate-900 uppercase tracking-tighter hover:text-blue-600 transition-colors">
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Doodle Watermark for Mobile Menu */}
            <img src="/assets/doodles/rocket.png" className="absolute bottom-20 right-10 w-32 opacity-20 rotate-[-15deg]" />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}