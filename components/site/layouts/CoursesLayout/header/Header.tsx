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
  const user = session?.user as { role?: string; name?: string; image?: string } | undefined;

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

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/site/${slug}/profile`);
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
    router.push(`/site/${slug}/category/${catId}`);
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  };

  // ---------- Render ----------
  return (
    <header
      className="sticky top-0 z-50 font-inter"
      style={{ backdropFilter: 'saturate(120%) blur(8px)', ...themeStyles }}
    >
      {/* Top brand strip */}
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
        className="py-3 px-4 sm:px-6 lg:px-8 bg-white/70 dark:bg-slate-900/60 border-b border-white/20"
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
                className="object-contain rounded-md h-16 w-auto"
                priority
              />
            ) : (
              <div
                className="text-2xl font-extrabold"
                style={{ background: `linear-gradient(45deg,var(--primary-color), var(--accent-color))`, WebkitBackgroundClip: 'text', color: 'transparent' }}
              >
                {name}
              </div>
            )}
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            <Link href={`/site/${slug}`} className="text-gray-700 hover:text-black font-semibold">Home</Link>
            <Link href={`/site/${slug}/courses`} className="text-gray-700 hover:text-black font-semibold flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-gray-500" /> Courses
            </Link>
            <Link href={`/site/${slug}/my-learning`} className="text-gray-700 hover:text-black font-semibold flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-gray-500" /> My Learning
            </Link>
            <Link href={`/site/${slug}/become-a-tutor`} className="text-gray-700 hover:text-black font-semibold">
              Become a Tutor
            </Link>

            {/* Categories dropdown (desktop) */}
            <div className="relative">
              <button
                ref={categoriesButtonRef}
                onClick={() => setCategoriesOpen((p) => !p)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setCategoriesOpen(false);
                }}
                aria-haspopup="menu"
                aria-expanded={categoriesOpen}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md font-semibold text-gray-700 hover:bg-gray-100"
              >
                Categories <ChevronDownIcon className="w-4 h-4 text-gray-500" />
              </button>

              <AnimatePresence>
                {categoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-40"
                    role="menu"
                    aria-label="Categories"
                  >
                    <div className="p-2">
                      {StoreCategory?.length ? (
                        StoreCategory.map((cat: any) => (
                          <button
                            key={cat.id}
                            onClick={() => selectCategory(cat.id)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                            role="menuitem"
                          >
                            {cat.displayName}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">No categories</div>
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
                onKeyDown={onSearchKeyDown}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => {
                  // small delay so click on suggestions still works
                  setTimeout(() => setSearchOpen(false), 150);
                }}
                placeholder="Search courses, topics, authors..."
                className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1"
                aria-label="Search courses"
                style={{ caretColor: primaryColor }}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

              {/* Suggestions */}
              <AnimatePresence>
                {searchOpen && (suggestions.length > 0 || loadingSuggestions) && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden"
                  >
                    <div className="divide-y divide-gray-100">
                      {loadingSuggestions && (
                        <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                      )}
                      {suggestions.map((sug) => (
                        <a
                          key={sug.id}
                          onMouseDown={(e) => {
                            // use onMouseDown to avoid losing focus before click
                            e.preventDefault();
                            goToCourse(sug.slug ?? sug.id);
                          }}
                          className="block px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                        >
                          {sug.title}
                        </a>
                      ))}
                      {!loadingSuggestions && suggestions.length === 0 && query.trim().length >= 2 && (
                        <div className="px-4 py-3 text-sm text-gray-500">No results</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Desktop: profile button shows name or avatar if logged in */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={handleUserAction}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-gray-100"
                aria-label={user ? 'Open profile' : 'Sign in'}
              >
                {user?.image ? (
                  <img src={user.image} alt={user.name ?? 'Me'} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-6 h-6 text-gray-700" />
                )}
                <span className="text-sm text-gray-700">
                  {user ? user.name ?? 'Account' : 'Sign in'}
                </span>
              </button>

              <button
                onClick={() => router.push(`/site/${slug}/checkout`)}
                className="relative p-2 rounded-full hover:bg-gray-100"
                aria-label="Open cart"
              >
                <ShoppingBagIcon className="w-6 h-6 text-gray-700" />
                {cart?.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white"
                  >
                    {cart.length}
                  </motion.span>
                )}
              </button>
            </div>

            {/* Mobile icons */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={() => setSearchOpen((s) => !s)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-expanded={searchOpen}
                aria-label="Toggle search"
              >
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={() => {
                  if (user) router.push(`/site/${slug}/profile`);
                  else handleGoogleSignIn();
                }}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Profile"
              >
                <UserIcon className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={() => setMobileMenuOpen((p) => !p)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <XMarkIcon className="w-6 h-6 text-gray-700" /> : <Bars3Icon className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: expandable search area (when searchOpen on mobile) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden px-4 pb-4 bg-white/95 border-b border-gray-100"
          >
            <div className="relative max-w-screen-md mx-auto">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 bg-white shadow-sm focus:outline-none"
                ref={searchInputRef}
                aria-label="Search courses"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {/* suggestions reused */}
              <div className="mt-2">
                {loadingSuggestions && <div className="text-sm text-gray-500">Searching...</div>}
                {suggestions.map((s) => (
                  <div key={s.id} className="py-2 border-b last:border-b-0">
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        goToCourse(s.slug ?? s.id);
                        setSearchOpen(false);
                      }}
                      className="block text-sm text-gray-700"
                    >
                      {s.title}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden bg-white/97 border-t border-gray-100 shadow-md"
          >
            <div className="px-4 py-4 space-y-3">
              <Link href={`/site/${slug}`} onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-semibold">Home</Link>
              <Link href={`/site/${slug}/courses`} onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-semibold">Courses</Link>
              <Link href={`/site/${slug}/my-learning`} onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-semibold">My Learning</Link>
              <Link href={`/site/${slug}/become-a-tutor`} onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 font-semibold">Become a Tutor</Link>

              <details className="bg-white border border-gray-100 rounded-lg p-2">
                <summary className="cursor-pointer font-semibold text-gray-700">Categories</summary>
                <div className="mt-2 space-y-1">
                  {StoreCategory?.length ? StoreCategory.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => selectCategory(cat.id)}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      {cat.displayName}
                    </button>
                  )) : <div className="px-3 py-2 text-sm text-gray-500">No categories</div>}
                </div>
              </details>

              <div className="pt-2 border-t border-gray-100" />
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleUserAction();
                    }}
                    className="w-full text-left px-3 py-2 rounded-md bg-[var(--primary-color)] text-white font-semibold"
                  >
                    {user.name ?? 'My Account'}
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                    className="w-full text-left px-3 py-2 mt-2 rounded-md text-gray-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                    className="w-full text-left px-3 py-2 rounded-md border border-gray-200 text-gray-700"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleGoogleSignUp(); }}
                    className="w-full text-left px-3 py-2 mt-2 rounded-md bg-[var(--primary-color)] text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
