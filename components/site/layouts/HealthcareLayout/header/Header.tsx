'use client';

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

// Optional custom loader
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
const DEFAULT_PRIMARY_COLOR = '#0ea5e9';
const DEFAULT_SECONDARY_COLOR = '#8b5cf6';

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

  const handleSignOut = () => signOut({ redirect: true, callbackUrl: "/?logout=true" });

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
    { label: 'About Us', href: `/#about` },
    { label: 'FAQs', href: `/#faqs` },
    { label: 'Contact', href: `/#contact` },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 14, delay: 0.2 } },
  };

  const mobileMenuVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 20 } },
    exit: { x: '100%', opacity: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <motion.header
      variants={headerVariants}
      initial="initial"
      animate="animate"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-xl py-3 border-b border-gray-100 dark:border-gray-800'
          : 'bg-transparent py-5 text-white'
      }`}
    >
      {/* TOP INFO BAR */}
      <motion.div
        className={`hidden md:flex justify-center items-center text-sm font-medium transition-all ${
          scrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto py-2'
        }`}
        style={{ backgroundColor: `${primary}15`, color: primary }}
      >
        <div className="max-w-7xl w-full flex justify-between items-center px-6">
          <div className="flex items-center space-x-6">
            {contactEmail && (
              <motion.a href={`mailto:${contactEmail}`} className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}>
                <EnvelopeIcon className="w-4 h-4" /> <span>{contactEmail}</span>
              </motion.a>
            )}
            {contactPhone && (
              <motion.a href={`tel:${contactPhone}`} className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}>
                <PhoneIcon className="w-4 h-4" /> <span>{contactPhone}</span>
              </motion.a>
            )}
          </div>

          <div className="flex space-x-4">
            {socialLinks.map((s) => (
              <motion.a
                key={s.channel}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.2, color: secondary }}
                className="capitalize"
              >
                {s.channel}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>

      {/* MAIN NAV */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LOGO */}
        <motion.div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push(`/${slug}`)}
          whileHover={{ scale: 1.05 }}
        >
          {logoUrl !== DEFAULT_LOGO_URL ? (
            <Image
              src={logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=56&background=random`}
              alt={name}
              width={56}
              height={56}
              className="rounded-full shadow-lg border border-gray-200  h-20 w-32"
              loader={loader}
            />
          ) : (
            <motion.span
              className="text-3xl font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
            >
              {name}
            </motion.span>
          )}
        </motion.div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center space-x-8 font-semibold text-lg text-gray-700 dark:text-gray-200">
          {navItems.map(({ label, href }) => (
            <Link key={label} href={href} className="relative group">
              {label}
              <motion.span
                className="absolute left-0 bottom-[-8px] h-1 rounded-full"
                style={{ backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})` }}
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          ))}

          {/* AUTH SECTION — replaces Book Appointment */}
          {!user ? (
            <div className="flex items-center space-x-4 ml-6">
              <button
                onClick={handleGoogleSignIn}
                className="px-5 py-2 rounded-full font-bold text-white shadow-md"
                style={{ backgroundColor: primary }}
              >
                Login
              </button>
              <button
                onClick={handleGoogleSignUp}
                className="px-5 py-2 rounded-full font-bold border"
                style={{ borderColor: primary, color: primary }}
              >
                Register
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 ml-6">
              <button
                onClick={handleUserAction}
                className="font-semibold text-gray-800 dark:text-gray-100"
              >
                {user.name || "Profile"}
              </button>
              <button
                onClick={() => handleSignOut()}
                className="text-red-600 font-bold"
              >
                Logout
              </button>
            </div>
          )}
        </nav>

        {/* MOBILE TOGGLE */}
        <motion.button
          className="md:hidden p-2 rounded-md"
          onClick={() => setMobileMenuOpen(true)}
          whileHover={{ scale: 1.1 }}
        >
          <Bars3BottomRightIcon className="w-8 h-8 text-gray-700 dark:text-gray-200" />
        </motion.button>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              {logoUrl ? (
                <Image src={logoUrl} alt={name} width={60} height={60} className="rounded-full  h-20 w-32" />
              ) : (
                <span className="text-2xl font-extrabold">{name}</span>
              )}
              <motion.button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="w-8 h-8" />
              </motion.button>
            </div>

            <nav className="flex flex-col space-y-6 flex-grow">
              {navItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-bold"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* AUTH INSIDE MOBILE DRAWER */}
            <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
              {!user ? (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 rounded-full font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGoogleSignUp}
                    className="w-full py-3 rounded-full font-bold border"
                    style={{ borderColor: primary, color: primary }}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleUserAction}
                    className="w-full py-3 rounded-full font-bold"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleSignOut()}
                    className="w-full py-3 rounded-full font-bold text-red-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
