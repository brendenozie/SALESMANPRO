'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, UserIcon, XMarkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import { StoreHeaderSearch } from '@/components/search/StoreHeaderSearch';

// --- Custom Icon Components ---
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h3V2h-3c-3.402 0-4.673 2.144-4.673 4.587V9.5H7.75v4H10V22h4v-8.5z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.29 2 5.09 3.05 5.09 3.05S2 6.29 2 10.05v3.9C2 17.71 3.05 20.91 3.05 20.91S6.29 22 10.05 22h3.9C17.71 22 20.91 20.95 20.91 20.95S22 17.71 22 13.95v-3.9C22 6.29 20.95 3.05 20.95 3.05S17.71 2 13.95 2H12zm0 2.25c.87 0 1.73.1 2.55.3l.5.15a6.5 6.5 0 014.2 4.2l.15.5c.2.82.3 1.68.3 2.55s-.1 1.73-.3 2.55l-.15.5a6.5 6.5 0 01-4.2 4.2l-.5.15c-.82.2-1.68.3-2.55.3s-1.73-.1-2.55-.3l-.5-.15a6.5 6.5 0 01-4.2-4.2l-.15-.5c-.2-.82-.3-1.68-.3-2.55s.1-1.73.3-2.55l.15-.5a6.5 6.5 0 014.2-4.2l.5-.15c.82-.2 1.68-.3 2.55-.3zM12 7.75a4.25 4.25 0 100 8.5 4.25 4.25 0 000-8.5zM12 9a3 3 0 110 6 3 3 0 010-6zm5.17-2.61a.92.92 0 100 1.84.92.92 0 000-1.84z"/></svg>
);
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.34-1.6.58-2.47.69.89-.53 1.57-1.37 1.89-2.39-.83.49-1.75.84-2.73 1.04C18.46 3.98 17.15 3 15.63 3c-2.39 0-4.34 1.95-4.34 4.34 0 .34.04.67.12.98C8.58 8.1 5.42 6.47 3.32 3.86c-.35.6-.55 1.29-.55 2.04 0 1.5.76 2.82 1.92 3.6A4.322 4.322 0 013 9.44v.05c0 2.11 1.5 3.88 3.49 4.29-.37.1-.76.15-1.16.15-.29 0-.58-.03-.85-.09.55 1.73 2.16 2.99 4.07 3.03C10.22 18.06 8 18.73 8 18.73A12.29 12.29 0 0021.2 7.42c.04-.33.06-.67.06-1.02 0-.25 0-.49-.02-.74z"/></svg>
);
const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.52 3.48A11.88 11.88 0 0012.04.02C6.06.02 1.02 5.06 1.02 11.04c0 1.94.5 3.83 1.45 5.5L.02 23l6.6-1.73a11 11 0 005.42 1.43h.01c5.98 0 10.99-4.84 11-10.82a11.9 11.9 0 00-2.53-7.2zM12.04 20.1h-.01a9.15 9.15 0 01-4.66-1.28l-.33-.2-3.92 1.03 1.05-3.82-.22-.35a9.04 9.04 0 01-1.4-4.7c0-5 4.07-9.07 9.08-9.07 2.43 0 4.72.95 6.43 2.67a9.06 9.06 0 012.66 6.4c-.01 5-4.08 9.07-9.09 9.07zm5.02-7.16c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2 .22-.52.48-.45 .65-.46h.55c.18,0,.48,.07,.73,.34s1,.99,1,.99c.18,.18,.3,.27,.48,.43,.18,.16,.3,.12,.41,.09.12-.03,.34-.14,.52-.21.18-.07,.55-.22,.84-.33.27-.11,.52-.05,.75.09.25.14.79.81.88 1.06.09.25.14.43.07.61-.07.18-.32.55-.59.84z"/>
  </svg>
);

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

interface StoreFormData {
  name?: string;
  slug?: string;
  logoUrl?: string;
  contactPhone?: string;
  socialLinks?: Array<{ platform: string; url?: string }> | Record<string, string | false>;
  themeSettings?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

export default function Header() {
  const { storeFormData } = ((useStoreContext() || {}) as unknown as { storeFormData?: StoreFormData });
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const name = storeFormData?.name || 'My Portfolio';
  const slug = storeFormData?.slug || 'my-portfolio';
  const logoUrl = storeFormData?.logoUrl || '';
  const contactPhone = storeFormData?.contactPhone || '';
  const socialLinks = storeFormData?.socialLinks || [];
  const themeSettings = storeFormData?.themeSettings || {};

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const primaryColor = themeSettings.primaryColor || '#000000';
  const secondaryColor = themeSettings.secondaryColor || '#64748b';

  const handleSignOut = () => {
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  const redirectToAuth = (action: 'signin' | 'signup') => {
    const authUrl = new URL(`https://auth.salesmanpro.site/${action}`);
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  useEffect(() => {
    let ticking = false;
    let lastScrolled = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 20;
          if (isScrolled !== lastScrolled) {
            lastScrolled = isScrolled;
            setScrolled(isScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const socialLinksMap: Record<string, string | false> = Array.isArray(socialLinks)
    ? socialLinks.reduce((acc: Record<string, string | false>, item: any) => {
        if (item?.platform) acc[item.platform] = item.url ?? false;
        return acc;
      }, {})
    : (socialLinks || {});

  const defaultSocialLinks = {
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourpage',
    twitter: 'https://twitter.com/yourpage',
    whatsapp: `https://wa.me/${contactPhone || '254712345678'}`,
  };

  const getSocialLink = (platform: keyof typeof defaultSocialLinks) =>
    (socialLinksMap as any)?.[platform] || defaultSocialLinks[platform];

  return (
    <header
      className={`fixed w-full top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800/80 shadow-sm py-3'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center relative">
        
        {/* Left Anchor: Identity Framework */}
        <Link href={`/${slug}`} className="flex items-center gap-3 relative z-20">
          {logoUrl && logoUrl !== 'https://placehold.co/140x40/png/gray/white?text=Logo' ? (
            <Image decoding="async"
              src={logoUrl}
              alt={name}
              width={130}
              height={36}
              className="object-contain h-9 w-auto dark:invert-0"
            />
          ) : (
            <span
              className="text-lg font-black tracking-wider uppercase transition-colors"
              style={{ color: scrolled ? '#0f172a' : primaryColor }}
            >
              {name}
            </span>
          )}
        </Link>

        {/* Center Anchor: Matrix Navigation Track */}
        <nav className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="flex items-center gap-1 bg-slate-50/50 dark:bg-slate-800/40 p-1 border border-slate-200/60 dark:border-slate-700/60 rounded-xl backdrop-blur-md">
            {navLinks.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white transition-colors"
                whileHover={{
                  backgroundColor: 'rgba(15, 23, 42, 0.04)',
                  transition: { type: 'spring', stiffness: 110, damping: 16 }
                }}
              >
                {label}
              </motion.a>
            ))}
          </div>
        </nav>

        {/* Right Anchor: Secure Node Control Suite */}
        <div className="hidden md:flex items-center gap-4 relative z-20">
          <StoreHeaderSearch variant="button" />
          
          {/* External Pipelines Group */}
          <div className="flex items-center border-r border-slate-200 dark:border-slate-800 pr-4 gap-2 text-slate-400 dark:text-slate-500">
            {socialLinksMap?.facebook !== false && (
              <a href={getSocialLink('facebook')} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinksMap?.instagram !== false && (
              <a href={getSocialLink('instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinksMap?.twitter !== false && (
              <a href={getSocialLink('twitter')} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
            {socialLinksMap?.whatsapp !== false && (
              <a href={getSocialLink('whatsapp')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                <WhatsappIcon className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Secure Access Validation */}
          {status === "loading" ? (
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          ) : session ? (
            <div className="group relative">
              <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <UserIcon className="w-4 h-4" strokeWidth={2.5} />
                <span>{user?.name?.split(' ')[0] || 'Account'}</span>
              </button>
              
              {/* Context Dropdown Frame */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden opacity-0 scale-95 origin-top-right group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none group-hover:pointer-events-auto z-50">
                <Link href="/dashboard" className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Dashboard Matrix
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50/50 dark:hover:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800"
                >
                  Terminate Session
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => redirectToAuth('signin')}
                className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2.5 transition-colors"
              >
                Access
              </button>
              <button
                onClick={() => redirectToAuth('signup')}
                className="inline-flex items-center justify-center text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl text-white bg-slate-900 dark:bg-white dark:text-slate-900 border border-slate-900 dark:border-white transition-all duration-200 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95 shadow-sm"
              >
                Provision Account
              </button>
            </div>
          )}
        </div>

        {/* Mobile Grid Menu Trigger */}
        <div className="md:hidden flex items-center gap-2 relative z-20">
          <StoreHeaderSearch variant="button" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-xl text-slate-800 dark:text-slate-200 border border-transparent active:border-slate-200 dark:active:border-slate-800 transition-colors"
            aria-label="Toggle structural menu"
          >
            {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Array */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="md:hidden bg-white dark:bg-slate-900 px-6 pt-4 pb-8 space-y-5 border-t border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="space-y-1">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="block py-3 text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 border-b border-slate-50 dark:border-slate-800/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Execution Vectors */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              {status === "loading" ? (
                <div className="text-center py-2 text-xs font-bold tracking-wider text-slate-400">SYNCING CONTROLS...</div>
              ) : session ? (
                <>
                  <div className="flex items-center gap-2 px-1 py-2 text-xs font-bold tracking-wider uppercase text-slate-400">
                    <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                    <span>Node Connected: {user?.name}</span>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center text-xs font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-3.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    Dashboard Terminal
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleSignOut(); }}
                    className="block w-full text-center text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50/40 dark:bg-red-950/20 py-3.5 rounded-xl border border-red-100 dark:border-red-900/40"
                  >
                    Terminate Session
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setMenuOpen(false); redirectToAuth('signin'); }}
                    className="text-center text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    Access Node
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); redirectToAuth('signup'); }}
                    className="text-center text-xs font-bold uppercase tracking-wider text-white bg-slate-900 py-3.5 rounded-xl"
                  >
                    Provision Node
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Link Pipeline Group */}
            <div className="flex justify-center gap-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-slate-400">
              {socialLinksMap?.facebook !== false && (
                <a href={getSocialLink('facebook')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.instagram !== false && (
                <a href={getSocialLink('instagram')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.twitter !== false && (
                <a href={getSocialLink('twitter')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <TwitterIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.whatsapp !== false && (
                <a href={getSocialLink('whatsapp')} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  <WhatsappIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}