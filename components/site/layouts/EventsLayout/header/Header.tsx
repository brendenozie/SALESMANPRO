'use client';

import {
  Bars3Icon,
  InboxArrowDownIcon,
  MagnifyingGlassCircleIcon,
  PhoneIcon,
  TicketIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useStoreContext } from '@/contexts/StoreContext';

// --- Reusable NavLink Component ---
const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="relative px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200 
               after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-white 
               hover:after:w-full after:transition-all after:duration-300 after:rounded-full"
  >
    {children}
  </Link>
);

// --- MAIN HEADER ---
export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; role?: string } | undefined;
  const { storeFormData } = useStoreContext();

  // Local UI State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Extract store data
  const {
    name = 'Eventine',
    slug = 'eventine',
    logoUrl,
    contactEmail = 'hello@eventine.com',
    contactPhone = '+1-800-555-EVENT',
    socialLinks = [],
    themeSettings = {},
  } = storeFormData || {};

  const primaryColor = themeSettings?.primaryColor || '#8B5CF6';
  const secondaryColor = themeSettings?.secondaryColor || '#EC4899';

  // --- Scroll Background Logic ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Disable Body Scroll When Mobile Menu is Open ---
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // --- Outside click closes mobile menu ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // --- Auth handlers ---
  const handleSignIn = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signin');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleSignUp = () => {
    const authUrl = new URL('https://auth.salesmanpro.site/signup');
    authUrl.searchParams.set('callbackUrl', `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };

  const handleSignOut = ()=> {
    const returnTo = window.location.origin;

    signOut({
      redirect: true,
      callbackUrl: `/logout?returnTo=${encodeURIComponent(returnTo)}`,
    });
  };

  const handleProfile = () => {
    if (!user) return handleSignIn();
    if (user.role?.toLowerCase() === 'admin') router.push(`/dashboards`);
    else router.push(`/events/profile`);
  };

  // --- Nav items ---
  const navItems = [
    { label: 'Home', href: `/`, key: 'home' },
    { label: 'Events', href: `/events/products`, key: 'events' },
    { label: 'About', href: `/events/about`, key: 'about' },
    { label: 'Contact', href: `#contact`, key: 'contact' },
  ];

  // --- Header visual style ---
  const headerStyle = {
    backgroundColor: isScrolled ? 'rgba(17, 24, 39, 0.95)' : 'rgba(17, 24, 39, 0.1)',
    backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
    WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
    borderBottom: isScrolled ? `1px solid ${primaryColor}44` : '1px solid transparent',
  };

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
    isScrolled ? 'translate-y-0 shadow-xl' : 'translate-y-0'
  }`;

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className={headerClasses} style={headerStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* --- Logo --- */}
            <Link
              href={``}
              className="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            >
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={name}
                  width={160}
                  height={80}
                  className="h-20 w-32 object-contain rounded-lg"
                  loader={({ src, width, quality }) =>
                    `${src}?w=${width}&q=${quality || 75}`
                  }
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src =
                      'https://placehold.co/40x40/8B5CF6/ffffff?text=L')
                  }
                />
              ) : (
                <>
                  <TicketIcon className="h-8 w-8" style={{ color: primaryColor }} />
                  <span className="text-2xl font-bold text-white tracking-tighter">
                    {name}
                  </span>
                </>
              )}
            </Link>

            {/* --- Desktop Nav --- */}
            <nav className="hidden lg:flex items-center space-x-2 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 p-2 rounded-full shadow-lg">
              {navItems.map((item) => (
                <NavLink key={item.key} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* --- Right Actions --- */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search */}
              <button
                onClick={() => router.push(`/search`)}
                className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition duration-200 transform hover:scale-110"
                aria-label="Search"
              >
                <MagnifyingGlassCircleIcon className="h-6 w-6" />
              </button>

              {/* Profile */}
              {!user ? (
                <>
                  <button
                    onClick={handleSignIn}
                    className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition duration-200 transform hover:scale-110"
                    aria-label="Sign In"
                  >
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition duration-200 transform hover:scale-110"
                    aria-label="Sign Up"
                  >
                    <span >Sign Up</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleProfile}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition duration-200 transform hover:scale-110"
                  aria-label="Profile"
                >
                  <span className="sr-only">Profile</span>
                  {user.name ? (
                    <span className="text-sm font-medium">{user.name.charAt(0)}</span>
                  ) : (
                    <UserIcon className="h-6 w-6" />
                  )}
                </button>
              )

              }

              {/* Mobile Toggle */}
              <div className="lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-full text-gray-300 hover:text-white hover:bg-gray-700/50 transition duration-200 transform hover:scale-110"
                  aria-label="Toggle Menu"
                >
                  {mobileMenuOpen ? (
                    <XMarkIcon className="h-6 w-6" />
                  ) : (
                    <Bars3Icon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div
            ref={mobileMenuRef}
            className={`fixed top-[5.5rem] left-1/2 -translate-x-1/2 w-[92%] max-w-md 
                        bg-gray-900/95 backdrop-blur-2xl border border-gray-700/30 
                        shadow-2xl rounded-2xl z-[60] p-6 lg:hidden 
                        transform transition-all duration-300 ease-out 
                        ${mobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-3">
              <span
                className="text-xl font-extrabold tracking-wide uppercase"
                style={{ color: primaryColor }}
              >
                Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col space-y-2 mb-6">
              {navItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-gray-200 text-lg py-2 px-3 rounded-xl
                             font-medium transition-all duration-200 ease-in-out
                             hover:bg-gray-800/70 hover:translate-x-1"
                  style={{
                    borderLeft: `3px solid ${primaryColor}`,
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: secondaryColor }}
                  ></span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex flex-col space-y-3 mb-6">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleProfile();
                  }}
                  className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors hover:brightness-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {user.role === 'admin' ? 'Admin Portal' : 'My Account'}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full text-gray-400 hover:text-white underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 mb-6">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignIn();
                  }}
                  className="w-full text-center px-4 py-2 rounded-lg text-gray-200 font-medium border border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignUp();
                  }}
                  className="w-full text-center px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors hover:brightness-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="border-t border-gray-800 my-6" />

            {/* Contact Info */}
            <div className="space-y-4 text-sm text-gray-400">
              <h3 className="text-sm uppercase font-semibold text-gray-500">Get in Touch</h3>
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-3 hover:text-white transition group"
                >
                  <PhoneIcon className="h-5 w-5 text-pink-400 group-hover:text-white transition-colors" />
                  <span className="font-mono">{contactPhone}</span>
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 hover:text-white transition group"
                >
                  <InboxArrowDownIcon className="h-5 w-5 text-pink-400 group-hover:text-white transition-colors" />
                  <span>{contactEmail}</span>
                </a>
              )}
            </div>

            <div className="border-t border-gray-800 my-6" />

            {/* Social Links */}
            <div className="flex justify-center space-x-6">
              {socialLinks.map((s) => (
                <a
                  key={s.channel}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="capitalize text-gray-300 hover:text-white transition duration-200 transform hover:scale-125"
                >
                  {s.channel}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
