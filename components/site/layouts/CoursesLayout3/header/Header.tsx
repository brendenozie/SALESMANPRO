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
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useStateContext } from '@/contexts/ContextProvider'; // fallback cart provider
import { useSession, signOut } from 'next-auth/react';

const loader = ({ src }: { src: string }) => {
  return src;
};

/**
 * Courses Store Header
 * - Live search -> /api/courses/search?q=...
 * - Desktop & mobile categories dropdown
 * - Cart + profile (session-aware)
 * - Glassmorphism + theme color integration via CSS vars
 */

export default function Header() {
  const router = useRouter();

  // Contexts
  const { storeFormData } = useStoreContext() || {};
  const stateCtx = useStateContext ? useStateContext() : undefined; // safe access
  const cart = stateCtx?.cart ?? [];

  // Auth/session
  const { data: session } = useSession();
  const user = session?.user as { id?: string; role?: string; name?: string; image?: string  } | undefined;

  // Destructure store data with safe defaults
  const {
    name = 'Your Academy',
    slug = '',
    logoUrl,
    contactEmail,
    contactPhone,
    socialLinks = [],
    StoreCategory = [],
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#fd2121';
  const accentColor = themeSettings?.secondaryColor || '#FFC107';

  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ id: string; title: string; slug?: string }[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);

  // refs for accessibility/focus
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const suggestionsRef = useRef<HTMLDivElement | null>(null);
  const categoriesButtonRef = useRef<HTMLButtonElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);

  // set CSS variables on root of component
  const themeStyles = useMemo(
    () => ({
      '--primary-color': primaryColor,
      '--accent-color': accentColor,
    } as React.CSSProperties),
    [primaryColor, accentColor]
  );

  // ---------- Search: debounce + abortable fetch ----------
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    setLoadingSuggestions(true);

    // debounce
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const ac = new AbortController();
      abortControllerRef.current = ac;

      const encoded = encodeURIComponent(query.trim());
      fetch(`/api/courses/search?q=${encoded}`, { signal: ac.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error('Search error');
          const data = await res.json();
          // Expect backend to return array of suggestions: [{ id, title, slug }]
          setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          console.error('Search fetch failed', err);
          setSuggestions([]);
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [query]);

  // close dropdowns when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = e.target as Node;
      if (searchInputRef.current && !searchInputRef.current.contains(el) && !suggestionsRef.current?.contains(el)) {
        setSuggestions([]);
        // Do NOT automatically close searchOpen here — keep UI predicted by user intent
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // keyboard nav for suggestions
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveCategoryIndex(0);
        (suggestionsRef.current?.querySelector<HTMLElement>('a') || searchInputRef.current)?.focus();
      }
    }
    if (e.key === 'Escape') {
      setSuggestions([]);
      searchInputRef.current?.blur();
    }
  };

  // ---------- Auth helpers ----------
  const handleSignOut = () => {
    signOut({ callbackUrl: `/site/${slug || ''}` });
  };

  const handleGoogleSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}/site/${slug}`);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signup');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}/site/${slug}`);
    window.location.href = authUrl.toString();
  };

  const handleCodeSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin/code');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}/site/${slug}`);
    window.location.href = authUrl.toString();
  };

  const handleCourseLogin = () => {
    router.push(`/site/${slug}/courses/login`);
  };

  const handleUserActionv1 = () => {
      if (!user) return handleGoogleSignIn();
      if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
      else router.push(`/profile`);
    };

    const handleUserAction = () => {
      if (!user) {
        handleCourseLogin(); // 👉 go to your login page
        return;
      }

        if (user.role?.toLowerCase() === 'admin') {
          router.push('/dashboards');
        } else {
          router.push(`/admin/${user.id}`);
        }
    };

  // ---------- Navigation helpers ----------
  const goToCourse = (slugOrPath: string) => {
    // slugOrPath might be full path or just slug
    const path = slugOrPath.startsWith('/') ? slugOrPath : `/${slug}/courses/${slugOrPath}`;
    router.push(path);
    setSuggestions([]);
    setSearchOpen(false);
  };

  const selectCategory = (catId: string) => {
    router.push(`/category/${catId}`);
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  };

  // ---------- Render ----------
  return (
   <header
  className="sticky top-0 z-50 font-inter"
  style={{ backdropFilter: 'saturate(120%) blur(8px)', ...themeStyles }}
>
  {/* Top brand strip - Stays consistent as it uses the primary brand color */}
  <div
    className="hidden md:flex justify-between items-center px-6 py-2 text-xs tracking-wide text-white"
    style={{ backgroundColor: primaryColor }}
  >
    <div className="flex gap-6 items-center">
      {contactEmail && (
        <a href={`mailto:${contactEmail}`} className="flex items-center gap-1.5 text-white/90 hover:underline">
          <EnvelopeIcon className="w-3.5 h-3.5" /> <span className="text-[13px]">{contactEmail}</span>
        </a>
      )}
      {contactPhone && (
        <a href={`tel:${contactPhone}`} className="flex items-center gap-1.5 text-white/90 hover:underline">
          <PhoneIcon className="w-3.5 h-3.5" /> <span className="text-[13px]">{contactPhone}</span>
        </a>
      )}
    </div>

    <div className="flex gap-4 items-center">
      {socialLinks.map((s: any) => (
        <a
          key={s.channel}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/90 hover:text-white transition-colors text-sm capitalize"
        >
          {s.channel}
        </a>
      ))}
    </div>
  </div>

  {/* Main header */}
  <div
    className="py-3 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors"
    role="banner"
  >
    <div className="max-w-screen-xl mx-auto flex items-center gap-6">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer flex-shrink-0"
        onClick={() => router.push(`/site/${slug}`)}
        aria-label={`${name} home`}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={160}
            loader={loader}
            height={48}
            className="object-contain rounded-md h-12 w-auto dark:brightness-110"
            priority
          />
        ) : (
          <div
            className="text-2xl font-extrabold"
            style={{ 
                background: `linear-gradient(45deg, var(--primary-color), var(--accent-color))`, 
                WebkitBackgroundClip: 'text', 
                color: 'transparent' 
            }}
          >
            {name}
          </div>
        )}
      </div>

      {/* Desktop nav */}
      <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
        <Link href={`/site/${slug}`} className="text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white font-semibold transition-colors">Home</Link>
        <Link href={`/courses`} className="text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white font-semibold flex items-center gap-2">
          <BookOpenIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Courses
        </Link>
        <Link href={`/my-learning`} className="text-slate-700 dark:text-slate-200 hover:text-black dark:hover:text-white font-semibold flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" /> My Learning
        </Link>

        {/* Categories dropdown (desktop) */}
        <div className="relative">
          <button
            ref={categoriesButtonRef}
            onClick={() => setCategoriesOpen((p) => !p)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Categories <ChevronDownIcon className="w-4 h-4 text-slate-500" />
          </button>

          <AnimatePresence>
            {categoriesOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 z-40"
              >
                <div className="p-2">
                  {StoreCategory?.length ? (
                    StoreCategory.map((cat: any) => (
                      <button
                        key={cat.id}
                        onClick={() => selectCategory(cat.id)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        {cat.displayName}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-slate-500">No categories</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Search (center) */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-lg">
          <input
            ref={searchInputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses..."
            className="w-full rounded-full pl-10 pr-4 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-900"
            style={{ caretColor: primaryColor }}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />

          {/* Suggestions */}
          <AnimatePresence>
            {searchOpen && (suggestions.length > 0 || loadingSuggestions) && (
              <motion.div
                className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
              >
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {suggestions.map((sug) => (
                    <a
                      key={sug.id}
                      onMouseDown={(e) => { e.preventDefault(); goToCourse(sug.slug ?? sug.id); }}
                      className="block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm text-slate-700 dark:text-slate-200"
                    >
                      {sug.title}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={handleUserAction}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {user?.image ? (
              <img src={user.image} alt="Me" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
            <span className="text-sm font-medium">{user ? user.name ?? 'Account' : 'Sign in'}</span>
          </button>

          {/* <button
            onClick={() => router.push(`/checkout`)}
            className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ShoppingBagIcon className="w-6 h-6" />
            {cart?.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                {cart.length}
              </span>
            )}
          </button> */}
        </div>

        {/* Mobile menu toggle */}
        <div className="lg:hidden flex items-center gap-1">
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Mobile menu */}
  <AnimatePresence>
    {mobileMenuOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden"
      >
        <div className="px-4 py-6 space-y-4">
          <Link href={`/site/${slug}`} className="block text-slate-700 dark:text-slate-200 font-semibold">Home</Link>
          <Link href={`/courses`} className="block text-slate-700 dark:text-slate-200 font-semibold">Courses</Link>
          
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            {user ? (
               <button onClick={handleSignOut} className="w-full text-left text-red-500 font-medium">Sign Out</button>
            ) : (
               <button 
                 onClick={handleCourseLogin} 
                 className="w-full py-3 rounded-xl text-center font-bold text-white transition-transform active:scale-95"
                 style={{ backgroundColor: primaryColor }}
                >
                 Get Started
               </button>
            )}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</header>
  );
}



// 'use client';

// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import {
//   Bars3Icon,
//   XMarkIcon,
//   UserIcon,
//   ShoppingBagIcon,
//   ChevronDownIcon,
//   MagnifyingGlassIcon,
//   BookOpenIcon,
//   EnvelopeIcon,
//   PhoneIcon,
// } from '@heroicons/react/24/outline';
// import { useStoreContext } from '@/contexts/StoreContext';
// import { useStateContext } from '@/contexts/ContextProvider';
// import { useSession, signOut } from 'next-auth/react';

// const loader = ({ src }: { src: string }) => src;

// /**
//  * REIMAGINED HEADER 2026:
//  * - Floating Glass Island Architecture
//  * - Dynamic Search Expansion
//  * - Integrated Theme Variables
//  */

// export default function Header() {
//   const router = useRouter();

//   // Contexts & Auth
//   const { storeFormData } = useStoreContext() || {};
//   const stateCtx = useStateContext ? useStateContext() : undefined;
//   const cart = stateCtx?.cart ?? [];
//   const { data: session } = useSession();
//   const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

//   // Destructure store data
//   const {
//     name = 'Your Academy',
//     slug = '',
//     logoUrl,
//     contactEmail,
//     contactPhone,
//     socialLinks = [],
//     StoreCategory = [],
//     themeSettings = {},
//   } = storeFormData || {};

//   const primaryColor = themeSettings?.primaryColor || '#fd2121';
//   const accentColor = themeSettings?.secondaryColor || '#FFC107';

//   // UI State
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [searchOpen, setSearchOpen] = useState(false);
//   const [query, setQuery] = useState('');
//   const [suggestions, setSuggestions] = useState<{ id: string; title: string; slug?: string }[]>([]);
//   const [loadingSuggestions, setLoadingSuggestions] = useState(false);
//   const [categoriesOpen, setCategoriesOpen] = useState(false);

//   // Refs
//   const searchInputRef = useRef<HTMLInputElement | null>(null);
//   const suggestionsRef = useRef<HTMLDivElement | null>(null);
//   const debounceRef = useRef<number | null>(null);
//   const abortControllerRef = useRef<AbortController | null>(null);

//   const themeStyles = useMemo(() => ({
//     '--primary-color': primaryColor,
//     '--accent-color': accentColor,
//   } as React.CSSProperties), [primaryColor, accentColor]);

//   // Search Logic
//   useEffect(() => {
//     if (!query || query.trim().length < 2) {
//       setSuggestions([]);
//       setLoadingSuggestions(false);
//       return;
//     }
//     setLoadingSuggestions(true);
//     if (debounceRef.current) window.clearTimeout(debounceRef.current);
//     debounceRef.current = window.setTimeout(() => {
//       if (abortControllerRef.current) abortControllerRef.current.abort();
//       const ac = new AbortController();
//       abortControllerRef.current = ac;

//       fetch(`/api/courses/search?q=${encodeURIComponent(query.trim())}`, { signal: ac.signal })
//         .then(async (res) => {
//           const data = await res.json();
//           setSuggestions(Array.isArray(data) ? data.slice(0, 8) : []);
//         })
//         .catch(() => setSuggestions([]))
//         .finally(() => setLoadingSuggestions(false));
//     }, 250);
//   }, [query]);

//   // Handlers
//   const handleUserAction = () => {
//     if (!user) return router.push(`/site/${slug}/courses/login`);
//     user.role?.toLowerCase() === 'admin' ? router.push('/dashboards') : router.push('/profile');
//   };

//   const selectCategory = (catId: string) => {
//     router.push(`/category/${catId}`);
//     setCategoriesOpen(false);
//     setMobileMenuOpen(false);
//   };

//   return (
//     <header 
//       className="fixed top-0 md:top-4 left-0 right-0 z-50 px-0 md:px-8 pointer-events-none font-inter" 
//       style={themeStyles}
//     >
//       <motion.div 
//         initial={{ y: -20, opacity: 0 }} 
//         animate={{ y: 0, opacity: 1 }}
//         className="max-w-7xl mx-auto pointer-events-auto"
//       >
//         {/* Main Floating Bar */}
//         <div className="relative flex items-center justify-between px-4 py-2 md:py-3 md:rounded-[2.5rem] bg-white/80 dark:bg-slate-900/90 border-b md:border border-white/20 shadow-2xl backdrop-blur-xl">
          
//           {/* Left: Logo */}
//           <div className="flex items-center gap-4 shrink-0 cursor-pointer" onClick={() => router.push(`/site/${slug}`)}>
//             {logoUrl ? (
//               <Image src={logoUrl} alt={name} width={130} height={40} loader={loader} className="h-8 md:h-10 w-auto object-contain" />
//             ) : (
//               <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] bg-clip-text text-transparent">
//                 {name.toUpperCase()}
//               </span>
//             )}
//           </div>

//           {/* Center: Nav Links */}
//           <nav className="hidden lg:flex items-center bg-gray-100/50 dark:bg-white/5 rounded-full px-2 py-1 border border-black/5 dark:border-white/5">
//             <NavLink href={`/site/${slug}`} label="Home" />
//             <NavLink href={`/courses`} label="Courses" icon={<BookOpenIcon className="w-4 h-4" />} />
            
//             <div className="relative group">
//               <button 
//                 className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[var(--primary-color)] transition-colors"
//                 onClick={() => setCategoriesOpen(!categoriesOpen)}
//               >
//                 Categories <ChevronDownIcon className={`w-3 h-3 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
//               </button>
              
//               <AnimatePresence>
//                 {categoriesOpen && (
//                   <motion.div 
//                     initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
//                     className="absolute top-full left-0 mt-3 w-60 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl"
//                   >
//                     {StoreCategory.map((cat: any) => (
//                       <button key={cat.id} onClick={() => selectCategory(cat.id)} className="w-full text-left px-4 py-2.5 text-sm rounded-xl hover:bg-[var(--primary-color)] hover:text-white transition-all text-gray-700 dark:text-gray-200">
//                         {cat.displayName}
//                       </button>
//                     ))}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </nav>

//           {/* Right: Actions */}
//           <div className="flex items-center gap-2">
//             {/* Search Bar */}
//             <div className="hidden md:flex items-center relative">
//               <motion.input
//                 ref={searchInputRef}
//                 whileFocus={{ width: 220 }}
//                 className="w-36 bg-gray-100 dark:bg-white/10 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[var(--primary-color)] transition-all outline-none text-gray-800 dark:text-white"
//                 placeholder="Search..."
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 onFocus={() => setSearchOpen(true)}
//                 onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
//               />
//               <MagnifyingGlassIcon className="absolute left-3 w-4 h-4 text-gray-400" />
              
//               {/* Search Suggestions Dropdown */}
//               <AnimatePresence>
//                 {searchOpen && (suggestions.length > 0 || loadingSuggestions) && (
//                   <motion.div 
//                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
//                     className="absolute top-full right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
//                   >
//                     {loadingSuggestions ? (
//                       <div className="p-4 text-sm text-gray-500 animate-pulse">Searching for courses...</div>
//                     ) : (
//                       suggestions.map((s) => (
//                         <div key={s.id} onClick={() => router.push(`/site/${slug}/courses/${s.slug ?? s.id}`)} className="p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-0">
//                           <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.title}</p>
//                         </div>
//                       ))
//                     )}
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             <div className="h-6 w-[1px] bg-gray-200 dark:bg-white/10 mx-1 hidden md:block" />

//             {/* Shopping Cart */}
//             <button onClick={() => router.push('/checkout')} className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-all">
//               <ShoppingBagIcon className="w-6 h-6" />
//               {cart?.length > 0 && (
//                 <span className="absolute top-1.5 right-1.5 flex h-4 w-4">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-color)] opacity-75"></span>
//                   <span className="relative inline-flex rounded-full h-4 w-4 bg-[var(--primary-color)] text-[10px] font-bold text-white items-center justify-center">
//                     {cart.length}
//                   </span>
//                 </span>
//               )}
//             </button>

//             {/* Auth Toggle */}
//             <button onClick={handleUserAction} className="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform active:scale-95 shadow-lg">
//               <div className="w-7 h-7 rounded-full bg-gray-400 overflow-hidden ring-2 ring-white/20">
//                 {user?.image ? <img src={user.image} className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 m-1.5" />}
//               </div>
//               <span className="hidden sm:block text-xs font-bold uppercase tracking-wider">{user ? 'Account' : 'Login'}</span>
//             </button>

//             {/* Mobile Menu Trigger */}
//             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-gray-600 dark:text-gray-300">
//               {mobileMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu Overlays */}
//         <AnimatePresence>
//           {mobileMenuOpen && (
//             <motion.div 
//               initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
//               className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-white/10 shadow-2xl p-4 lg:hidden"
//             >
//               <div className="flex flex-col gap-2">
//                 <Link href={`/site/${slug}`} onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 font-semibold">Home</Link>
//                 <Link href={`/courses`} onClick={() => setMobileMenuOpen(false)} className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 font-semibold">Courses</Link>
//                 <div className="h-[1px] bg-gray-100 dark:bg-white/10 my-2" />
//                 <p className="px-3 text-xs font-bold text-gray-400 uppercase">Contact</p>
//                 {contactEmail && <a href={`mailto:${contactEmail}`} className="p-3 text-sm text-gray-600 dark:text-gray-300">{contactEmail}</a>}
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </header>
//   );
// }

// // Nav Link Helper
// function NavLink({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
//   return (
//     <Link href={href} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[var(--primary-color)] transition-colors rounded-full hover:bg-white dark:hover:bg-white/5">
//       {icon} {label}
//     </Link>
//   );
// }