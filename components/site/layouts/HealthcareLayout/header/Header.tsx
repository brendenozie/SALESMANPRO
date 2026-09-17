"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3BottomRightIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import { EditableElement } from '@/contexts/EditableContentContext';
import StoreHeaderSearch from '@/components/search/StoreHeaderSearch';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const DEFAULT_NAME = "CareClinic";
const DEFAULT_SLUG = "care-clinic";
const DEFAULT_LOGO_URL = "/path/to/default-logo.png";
const DEFAULT_CONTACT_EMAIL = "info@careclinic.com";
const DEFAULT_CONTACT_PHONE = "+1 (555) 123-4567";
const DEFAULT_SOCIAL_LINKS = [
  { channel: 'facebook', url: 'https://facebook.com' },
  { channel: 'instagram', url: 'https://instagram.com' },
];
const DEFAULT_PRIMARY_COLOR = '#0d9488'; // Clean Medical Teal
const DEFAULT_SECONDARY_COLOR = '#0f766e';

export default function Header() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // AUTH
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const handleGoogleSignIn = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signin");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleGoogleSignUp = () => {
    const authUrl = new URL("https://auth.salesmanpro.site/signup");
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === "admin") {
      router.push("/dashboards");
    } else {
      router.push(`/healthcare/profile`);
    }
  };

  const handleSignOut = () => {
    const returnTo = window.location.origin;
    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  // DATA
  const {
    name = DEFAULT_NAME,
    slug = DEFAULT_SLUG,
    logoUrl = DEFAULT_LOGO_URL,
    contactEmail = DEFAULT_CONTACT_EMAIL,
    contactPhone = DEFAULT_CONTACT_PHONE,
    socialLinks = DEFAULT_SOCIAL_LINKS,
    themeSettings,
  } = storeFormData || {};

  const primary = themeSettings?.primaryColor || DEFAULT_PRIMARY_COLOR;
  const secondary = themeSettings?.secondaryColor || DEFAULT_SECONDARY_COLOR;

  const navItems = [
    { label: 'Home', href: `/` },
    { label: 'Services', href: `/#services` },
    { label: 'Doctors', href: `/#doctors` },
    { label: 'About', href: `/#about` },
    { label: 'FAQs', href: `/#faqs` },
    { label: 'Contact', href: `/#contact` },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md py-3 shadow-[0_4px_30px_rgba(15,23,42,0.03)] border-b border-slate-200/50 dark:border-slate-800/50'
          : 'bg-transparent py-5'
      }`}
    >
      {/* PROFESSIONAL INFO TOP BAR */}
      <div 
        className={`hidden md:block transition-all duration-300 overflow-hidden ${
          scrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100 pb-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-xs font-semibold tracking-wide">
          <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-300">
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex items-center space-x-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <EnvelopeIcon className="w-3.5 h-3.5 opacity-80" /> 
                <span>{contactEmail}</span>
              </a>
            )}
            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="flex items-center space-x-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                <PhoneIcon className="w-3.5 h-3.5 opacity-80" /> 
                <span>{contactPhone}</span>
              </a>
            )}
          </div>

          <div className="flex items-center space-x-4 text-slate-400 dark:text-slate-500">
            {socialLinks.map((s) => (
              <a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="capitalize text-[11px] hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                {s.channel}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* BRAND IDENTITY LOGO */}
        <div
          onClick={() => router.push(`/${slug}`)}
          className="flex items-center space-x-2.5 cursor-pointer group z-10"
        >
          {logoUrl && logoUrl !== DEFAULT_LOGO_URL ? (
            <div className="relative h-10 w-28 transition-transform duration-300 group-hover:scale-[1.02]">
              <Image
                src={logoUrl}
                alt={name}
                fill
                className="object-contain object-left"
                loader={loader}
                priority
              />
            </div>
          ) : (
            <EditableElement
              targetId="global.global.header.Header.main.storeName"
              componentKey="Header"
              elementKey="storeName"
              label="Store Brand Name"
              defaultValue={name}
              inline
            >
              {(val) => (
                <span 
                  className="text-2xl font-black tracking-tight bg-clip-text text-transparent transition-all duration-300 group-hover:opacity-90"
                  style={{ backgroundImage: `linear-gradient(135deg, ${primary}, ${secondary})` }}
                >
                  {val}
                </span>
              )}
            </EditableElement>
          )}
        </div>

        {/* DESKTOP CONTENT SYSTEM */}
        <nav className="hidden md:flex items-center space-x-7 text-sm font-bold text-slate-700 dark:text-slate-200">
          {navItems.map(({ label, href }, index) => (
            <Link 
              key={label} 
              href={href} 
              className="relative py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group"
            >
              <EditableElement
                targetId={`global.global.header.Header.items.${index}.label`}
                componentKey="Header"
                elementKey={`navItem${index + 1}Label`}
                label={`Nav Item ${index + 1} Label`}
                defaultValue={label}
                inline
              >
                {(val) => <span>{val}</span>}
              </EditableElement>
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] w-0 rounded-full transition-all duration-300 ease-[0.16, 1, 0.3, 1] group-hover:w-full"
                style={{ backgroundColor: primary }}
              />
            </Link>
          ))}

          {/* SPLIT SECURITY AUTH LAYOUT */}
          <div className="flex items-center space-x-3 ml-4 border-l border-slate-200/60 dark:border-slate-800 pl-6">
            <StoreHeaderSearch
              variant="button"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            />
            {!user ? (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGoogleSignUp}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-[0.98] hover:brightness-105"
                  style={{ backgroundColor: primary }}
                >
                  Register
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleUserAction}
                  className="text-xs font-bold text-slate-800 dark:text-slate-100 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800"
                >
                  {user.name || "My Account"}
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* MOBILE INTERACTIVE TOGGLE */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="md:hidden p-2 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/80"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Bars3BottomRightIcon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </motion.button>
      </div>

      {/* MOBILE PREMIUM DRAWER LINKAGE */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop lock */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-[60]"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[61] w-full max-w-xs bg-white dark:bg-slate-950 shadow-2xl p-6 flex flex-col justify-between border-l border-slate-100 dark:border-slate-900"
            >
              <div>
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 dark:border-slate-900">
                  <span className="text-lg font-black tracking-tight dark:text-white">{name}</span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-4">
                  {navItems.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base font-bold text-slate-800 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-1"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* AUTH SYSTEM INSIDE CONTAINER */}
              <div className="border-t border-slate-100 dark:border-slate-900 pt-4 space-y-3">
                {!user ? (
                  <>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleGoogleSignIn(); }}
                      className="w-full py-3 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleGoogleSignUp(); }}
                      className="w-full py-3 rounded-xl font-bold text-sm text-white shadow-sm"
                      style={{ backgroundColor: primary }}
                    >
                      Register Account
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleUserAction(); }}
                      className="w-full py-3 rounded-xl font-bold text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900"
                    >
                      Dashboard Profile
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                      className="w-full py-2 font-bold text-xs text-rose-500 text-center"
                    >
                      Logout Session
                    </button>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}