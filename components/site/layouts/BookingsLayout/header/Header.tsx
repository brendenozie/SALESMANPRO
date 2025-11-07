'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: any) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  const { storeFormData } = useStoreContext();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const { slug, name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#00A880';

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'benefits', label: 'Why Us' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

  // Scroll shadow toggle
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth Handlers
  const handleUserAction = () => {
    if (!user) return handleGoogleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push('/dashboards');
    else router.push(`/site/${slug}/profile`);
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

  const handleSignOut = () => signOut({ callbackUrl: `/site/${slug}` });

  return (
    <>
      {/* HEADER */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 py-4 ${
          scrolled
            ? 'bg-white/90 shadow-lg ring-1 ring-gray-200 backdrop-blur-md'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link href="#hero" className="flex items-center gap-3 group">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={`${name || 'Brand'} Logo`}
                width={48}
                height={48}
                className="rounded-full object-cover border-2 border-emerald-300 shadow-sm transition-all group-hover:scale-105"
                loader={loader}
              />
            )}
            <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
              {name || 'Your Brand'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors relative group"
              >
                {item.label}
                <span
                  style={{ backgroundColor: primaryColor }}
                  className="absolute bottom-0 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                />
              </a>
            ))}

            {/* Profile Icon */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="text-gray-800 hover:text-emerald-600 transition-colors"
              onClick={handleUserAction}
              aria-label={user ? 'Profile page' : 'Log In or Sign Up'}
            >
              <UserIcon className="h-6 w-6" />
            </motion.button>

            {/* CTA */}
            <motion.a
              href="#booking"
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 18px ${primaryColor}66`,
              }}
              transition={{ type: 'spring', stiffness: 250 }}
              className="ml-6 px-6 py-2.5 rounded-full font-semibold text-white text-md shadow-lg"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, #10B981)`,
              }}
            >
              Book Now
            </motion.a>
          </nav>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-gray-800 hover:text-gray-900"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-8 w-8" />
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-[100] w-3/4 max-w-sm bg-white/95 backdrop-blur-xl p-8 flex flex-col shadow-2xl border-l border-gray-100"
          >
            <div className="flex justify-between items-center mb-10">
              <Link href="#hero" className="flex items-center space-x-3">
                {logoUrl && (
                  <Image
                    src={logoUrl}
                    alt={`${name || 'Brand'} Logo`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover border-2 border-emerald-300"
                    loader={loader}
                  />
                )}
                <span className="text-xl font-bold text-gray-900">
                  {name || 'Your Brand'}
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>

            <nav className="flex flex-col space-y-7">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="text-gray-800 text-lg font-semibold hover:text-emerald-600 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleUserAction();
                    }}
                    className="w-full text-center px-4 py-3 rounded-lg text-white font-semibold shadow-md"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    className="w-full mt-3 text-gray-600 underline hover:text-emerald-600 text-base"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleGoogleSignIn();
                    }}
                    className="w-full text-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium border border-gray-200"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleGoogleSignUp();
                    }}
                    className="w-full mt-3 text-center px-4 py-3 rounded-lg text-white font-semibold shadow-md"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            <motion.a
              href="#booking"
              onClick={() => setIsOpen(false)}
              className="mt-auto text-center py-4 rounded-full font-bold text-white text-lg shadow-xl"
              style={{
                background: `linear-gradient(90deg, ${primaryColor}, #10B981)`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 20px ${primaryColor}66`,
              }}
              transition={{ type: 'spring', stiffness: 250 }}
            >
              Book Your Session
            </motion.a>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
