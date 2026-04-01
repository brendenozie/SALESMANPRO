'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Changed FaceFrownIcon to UserIcon for auth
import { useStoreContext } from '@/contexts/StoreContext';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react'; // Kept useSession, signOut

// --- Custom Icon Components (Kept for completeness) ---
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
    <path d="M20.52 3.48A11.88 11.88 0 0012.04.02C6.06.02 1.02 5.06 1.02 11.04c0 1.94.5 3.83 1.45 5.5L.02 23l6.6-1.73a11 11 0 005.42 1.43h.01c5.98 0 10.99-4.84 11-10.82a11.9 11.9 0 00-2.53-7.2zM12.04 20.1h-.01a9.15 9.15 0 01-4.66-1.28l-.33-.2-3.92 1.03 1.05-3.82-.22-.35a9.04 9.04 0 01-1.4-4.7c0-5 4.07-9.07 9.08-9.07 2.43 0 4.72.95 6.43 2.67a9.06 9.06 0 012.66 6.4c-.01 5-4.08 9.07-9.09 9.07zm5.02-7.16c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.58-1.5-1.85-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2 .22-.52.48-.45 .65-.46h.55c,.18,0,.48,.07,.73,.34s1,.99,1,.99c,.18,.18,.3,.27,.48,.43,.18,.16,.3,.12,.41,.09.12-.03,.34-.14,.52-.21.18-.07,.55-.22,.84-.33.27-.11,.52-.05,."/>
    </svg>
);
// --- End Custom Icon Components ---


 // Loader for next/image (Kept)
 const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  // { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Header() {

  const { storeFormData } = useStoreContext();
  const router = useRouter();
  
    // --- Auth State & Hooks ---
    const { data: session, status } = useSession(); // Get session data
    const user = session?.user as { role?: string; name?: string } | undefined;

  const name = storeFormData?.name || 'My Portfolio';
  const slug = storeFormData?.slug || 'my-portfolio';
  const logoUrl = storeFormData?.logoUrl || 'https://placehold.co/140x40/png/gray/white?text=Logo';
  const contactPhone = storeFormData?.contactPhone || '';
  const socialLinks = storeFormData?.socialLinks || [];
  const themeSettings = storeFormData?.themeSettings || {};

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
 
  // Default colors for better visual
  const primaryColor = themeSettings.primaryColor || '#007bff'; // Modern Blue
  const secondaryColor = themeSettings.secondaryColor || '#6c757d'; // Grey/Darker Blue

  // --- Auth Handlers (Adjusted for clarity and better UX) ---
  
  const handleSignOut = () => signOut({ redirect: true, callbackUrl: `${window.location.origin || window.location.href || "/"}` });

  const redirectToAuth = (action: 'signin' | 'signup') => {
    // Assuming 'salesmanpro.site' is the external auth provider
    const authUrl = new URL(`https://auth.salesmanpro.site/${action}`);
    authUrl.searchParams.set("callbackUrl", `${window.location.origin}`);
    window.location.href = authUrl.toString();
  };


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const socialLinksMap: Record<string, string | false> = Array.isArray(socialLinks)
    ? (socialLinks as any[]).reduce((acc: Record<string, string | false>, item: any) => {
        if (item?.platform) acc[item.platform] = item.url ?? false;
        return acc;
      }, {})
    : (socialLinks || {}); 

  // Fallback social links for development/demonstration
  const defaultSocialLinks = {
    facebook: 'https://facebook.com/yourpage',
    instagram: 'https://instagram.com/yourpage',
    twitter: 'https://twitter.com/yourpage',
    whatsapp: `https://wa.me/${contactPhone || '254712345678'}`,
  };

    const getSocialLink = (platform: keyof typeof defaultSocialLinks) =>
    (socialLinksMap as any)?.[platform] || defaultSocialLinks[platform];


  // --- New Styles ---
  const headerStyle = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
  } as React.CSSProperties;

  return (
    <header
      style={headerStyle}
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg backdrop-blur-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
        {/* Logo or Name (Left) */}
        <Link href={`/${slug}`} className="flex items-center gap-3 relative z-10">
          {logoUrl && logoUrl !== 'https://placehold.co/140x40/png/gray/white?text=Logo' ? (
            <Image
              src={logoUrl}
              loader={loader}
              alt={name}
              width={140}
              height={40}
              className="object-contain h-10 w-auto"
            />
          ) : (
            <span
              className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent transition-colors duration-300"
              style={{ color: scrolled ? 'var(--primary-color)' : 'var(--secondary-color)' }}
            >
              {name}
            </span>
          )}
        </Link>

        {/* Desktop Nav (Center) */}
        <nav className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex gap-8 text-sm font-semibold text-gray-700 dark:text-gray-300">
            {navLinks.map(({ label, href }) => (
              <motion.a
                key={label}
                href={href}
                whileHover={{ color: 'var(--primary-color)', scale: 1.05 }}
                transition={{ duration: 0.1 }}
                className="transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
                style={{ '--primary-color': primaryColor } as React.CSSProperties}
              >
                {label}
              </motion.a>
            ))}
          </div>
        </nav>

        {/* CTA, Social, and Auth (Right) */}
        <div className="hidden md:flex items-center gap-6">
          {/* Social Icons Group */}
          <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
            {socialLinksMap?.facebook !== false && (
                <a href={getSocialLink('facebook')} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.instagram !== false && (
                <a href={getSocialLink('instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.twitter !== false && (
                <a href={getSocialLink('twitter')} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <TwitterIcon className="w-5 h-5" />
                </a>
              )}
              {socialLinksMap?.whatsapp !== false && (
                <a href={getSocialLink('whatsapp')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <WhatsappIcon className="w-5 h-5" />
                </a>
              )}
          </div>
          
          {/* CTA Button (Primary) */}
          <Link
            href={`#contact`}
            className="px-5 py-2.5 rounded-full font-bold text-sm transition duration-300 shadow-md hover:shadow-lg transform hover:translate-y-[-1px] dark:shadow-none"
            style={{ backgroundColor: primaryColor, color: '#ffffff' }}
          >
            Get in Touch
          </Link>

          {/* Auth Dropdown/Button (Secondary) */}
          {status === "loading" ? (
            <span className="text-gray-500 text-sm">...</span>
          ) : session ? (
            <div className="group relative">
              <button className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <UserIcon className="w-5 h-5" />
                <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => redirectToAuth('signin')}
                className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-[color:var(--primary)] transition"
                style={{ '--primary-color': primaryColor } as React.CSSProperties}
              >
                Login
              </button>
              <button
                onClick={() => redirectToAuth('signup')}
                className="border border-[color:var(--primary-color)] text-[color:var(--primary-color)] px-4 py-2 rounded-full font-medium text-sm hover:bg-[color:var(--primary-color)] hover:text-white transition"
                style={{ '--primary-color': primaryColor } as React.CSSProperties}
              >
                Sign Up
              </button>
            </>
          )}
        </div>


        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative z-10"
          aria-label="Toggle menu"
        >
          {menuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 px-6 pt-4 pb-6 space-y-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="block text-gray-900 dark:text-gray-100 font-medium hover:text-[color:var(--primary)] transition"
                onClick={() => setMenuOpen(false)}
                style={{ '--primary-color': primaryColor } as React.CSSProperties}
              >
                {label}
              </Link>
            ))}
            <Link
              href={`#contact`}
              onClick={() => setMenuOpen(false)}
              className="block text-center text-white py-2 rounded-full font-bold mt-2 shadow-md hover:opacity-90 transition"
              style={{ backgroundColor: primaryColor }}
            >
              Get in Touch
            </Link>
            
            {/* Auth Buttons (Mobile) */}
            <div className="mt-6 space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              {status === "loading" ? (
                <span className="block text-center text-gray-500 text-sm">Loading...</span>
              ) : session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center font-medium text-gray-900 dark:text-gray-100 hover:text-[color:var(--primary)] transition"
                    style={{ '--primary-color': primaryColor } as React.CSSProperties}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); handleSignOut(); }}
                    className="block w-full text-center text-red-600 font-medium hover:text-red-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMenuOpen(false); redirectToAuth('signin'); }}
                    className="block w-full text-center text-gray-900 dark:text-gray-100 font-medium hover:text-[color:var(--primary)] transition"
                    style={{ '--primary-color': primaryColor } as React.CSSProperties}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); redirectToAuth('signup'); }}
                    className="block w-full border border-[color:var(--primary-color)] text-[color:var(--primary-color)] py-2 rounded-full text-center font-medium hover:bg-[color:var(--primary-color)] hover:text-white transition"
                    style={{ '--primary-color': primaryColor } as React.CSSProperties}
                  >
                    Register
                  </button>
                </>
              )}
            </div>


            {/* Mobile Social Icons */}
            <div className="flex justify-center gap-4 mt-6 pt-3 border-t border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500">
              {socialLinksMap?.facebook !== false && (
                <a href={getSocialLink('facebook')} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <FacebookIcon className="w-6 h-6" />
                </a>
              )}
              {socialLinksMap?.instagram !== false && (
                <a href={getSocialLink('instagram')} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <InstagramIcon className="w-6 h-6" />
                </a>
              )}
              {socialLinksMap?.twitter !== false && (
                <a href={getSocialLink('twitter')} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <TwitterIcon className="w-6 h-6" />
                </a>
              )}
              {socialLinksMap?.whatsapp !== false && (
                <a href={getSocialLink('whatsapp')} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors transform hover:scale-110">
                  <WhatsappIcon className="w-6 h-6" />
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}