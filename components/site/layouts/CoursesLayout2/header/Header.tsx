'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider'; 
import { useSession } from 'next-auth/react';
// import { 
//   TwitterIcon, 
//   FacebookIcon, 
//   InstagramIcon, 
//   YoutubeIcon 
// } from '@/components/icons/SocialIcons'; // Replace with your actual SVGs

// Reusable loader and error handler
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "https://placehold.co/400x250/CCCCCC/000000?text=Image+Error";
};

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.949.555-2.005.959-3.127 1.184-.897-.959-2.178-1.559-3.594-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.708.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.317 0-.626-.03-.927-.086.627 1.956 2.444 3.379 4.6 3.419-1.68 1.318-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067C2.179 19.29 4.768 20 7.548 20c9.057 0 14-7.496 14-13.986 0-.21 0-.423-.015-.633A9.936 9.936 0 0024 4.59z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.333v21.334C0 23.403.597 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.794.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.591l-.467 3.622h-3.124V24h6.116C23.403 24 24 23.403 24 22.667V1.333C24 .597 23.403 0 22.675 0z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.31.975.975 1.248 2.243 1.31 3.608.058 1.266.069 1.645.069 4.85s-.012 3.584-.012 4.85-.07 1.366-.062 2.633-.334 3.608-1.31.975-.975 1.248-2.243 1.31-3.608.058-1.266.069-1.645.069-4.85s-.012-3.584-.07-4.85c-.062-1.366-.334-2.633-1.31-3.608C19.633 2.497 18.366 2.225 17 2.163c-1.266-.058-1.645-.069-4.85-.069zm0-2.163C8.741 0 8.332 0 7.052.07c-1.675.077-3.162.36-4.364 1.562C1.44 2.765 1.156 4.252 1.08 5.927.998 7.207.998 7.616.998 12s0 4.793.082 6.073c.077 1.675.36 3.162 1.562 4.364C2.838 22.64 4.325 22.923 6 23c1.28.07 1.689.07 4.85.07s3.584 0 4.85-.07c1.675-.077 3.162-.36 4.364-1.562C22.56 21.162 22.843 19.675 22.92 18c0-1.28-.07-1.689-.07-4.85s0-3.584-.07-4.85c-.077-1.675-.36-3.162-1.562-4.364C19.162.36 17.675.077 16 .07 14.72 0 14.311 0 12 0z" />
    <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998z" />
    <circle cx="18.406" cy="5.594" r="1.44" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.615 3.184C21.403 3.184 23 4.781 23 6.569v10.862c0 1.788-1.597 3.385-3.385 3.385H4.385C2.597 20.816 1 19.219 1 17.431V6.569C1 4.781 2.597 3.184 4.385 3.184h15.23zM10 15l5-3-5-3v6z" />
  </svg>
);



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
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#004aad';

  // --- Search & UI Logic ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; slug?: string }[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
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
    <header className="relative z-[100] w-full bg-white font-sans">
      {/* 1. Main Navigation Wrapper */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Logo Section - Matches "SCHOOL NAME" in image */}
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0 group" 
          onClick={() => router.push(`/site/${slug}`)}
        >
          <div className="relative">
            <AcademicCapIcon className="w-8 h-8 transition-transform group-hover:rotate-[-10deg]" style={{ color: primaryColor }} />
            {/* Sketchy accent behind logo */}
            <div className="absolute -inset-1 border-2 border-dashed border-slate-200 rounded-full -z-10 animate-spin-slow" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase leading-none max-w-[150px] md:max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: primaryColor }}>
            {name}
          </span>
        </div>

        {/* 2. Desktop Center Links */}
        <nav className="hidden lg:flex items-center gap-10">
          {['Home', 'Profile', 'About Us', 'Contact'].map((item) => (
            <Link 
              key={item} 
              href={item === 'Home' ? `/site/${slug}` : '#'} 
              className="text-sm font-extrabold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" style={{ backgroundColor: primaryColor }} />
            </Link>
          ))}
        </nav>

        {/* 3. Socials & Actions Bar */}
        <div className="flex items-center gap-3 md:gap-6">
          {/* Social Icons - Clean vector style from image */}
          <div className="hidden xl:flex items-center gap-4 border-r border-slate-200 pr-6 mr-2">
            <TwitterIcon className="w-5 h-5 text-slate-900 hover:scale-110 transition-transform cursor-pointer" />
            <FacebookIcon className="w-5 h-5 text-slate-900 hover:scale-110 transition-transform cursor-pointer" />
            <InstagramIcon className="w-5 h-5 text-slate-900 hover:scale-110 transition-transform cursor-pointer" />
            <YoutubeIcon className="w-5 h-5 text-slate-900 hover:scale-110 transition-transform cursor-pointer" />
          </div>

          {/* Search Toggle (Desktop) */}
          <div className="relative hidden md:block">
             <div className="flex items-center border-b-2 border-slate-200 focus-within:border-slate-900 transition-all">
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH..." 
                  className="bg-transparent py-1 w-32 focus:w-48 transition-all outline-none text-[10px] font-black tracking-widest uppercase"
                />
                <MagnifyingGlassIcon className="w-4 h-4 text-slate-900" />
             </div>
             
             {/* Search Dropdown - Blueprint Style */}
             <AnimatePresence>
                {query.length > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute top-full right-0 w-64 bg-white border-2 border-slate-900 mt-2 shadow-[6px_6px_0px_#000] z-50 p-2"
                  >
                    {loadingSuggestions ? (
                      <div className="p-2 text-[10px] font-black text-slate-400 animate-pulse uppercase">Searching...</div>
                    ) : (
                      suggestions.map(sug => (
                        <div 
                          key={sug.id} 
                          onClick={() => { router.push(`/site/${slug}/courses/${sug.slug}`); setQuery(''); }}
                          className="p-2 hover:bg-slate-50 cursor-pointer font-bold text-slate-800 text-xs border-b border-slate-100 last:border-0"
                        >
                          {sug.title}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* User & Cart Icons */}
          <div className="flex items-center gap-2">
            <button onClick={handleUserAction} className="p-2 hover:bg-slate-50 rounded-md transition-colors">
              {user?.image ? (
                <img src={user.image} className="w-6 h-6 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_#000]" alt="profile" />
              ) : (
                <UserIcon className="w-6 h-6 text-slate-900" />
              )}
            </button>

            <button onClick={() => router.push(`/checkout`)} className="p-2 hover:bg-slate-50 rounded-md transition-colors relative">
              <ShoppingBagIcon className="w-6 h-6 text-slate-900" />
              {cart?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(true)}>
              <Bars3Icon className="w-8 h-8 text-slate-900" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Menu Overlay - Matches the Blueprint theme */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ 
              backgroundImage: `linear-gradient(${primaryColor} 1px, transparent 1px), linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)`, 
              backgroundSize: '40px 40px' 
            }} />
            
            <div className="flex justify-between items-center p-6 relative z-10">
              <span className="font-black uppercase tracking-tighter text-xl">{name}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 border-2 border-slate-900 bg-white shadow-[4px_4px_0px_#000]">
                <XMarkIcon className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-10 gap-6 relative z-10">
              {['Home', 'Profile', 'About Us', 'Contact'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href="#" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-5xl font-black text-slate-900 uppercase tracking-tighter hover:text-blue-600 transition-colors"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="p-10 relative z-10 flex gap-6">
              <TwitterIcon className="w-6 h-6" />
              <FacebookIcon className="w-6 h-6" />
              <InstagramIcon className="w-6 h-6" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}