"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon, // Added for a cart/booking link
} from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider'; // Assuming this provides cart and other global states

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?src=${src}&w=${width}&q=${quality || 75}`;

interface HeaderProps {
  storeFormData: any;
}

// ... (imports and existing code)

const Header: React.FC<HeaderProps> = ({ storeFormData }) => {
  const { cartItems } = useStateContext(); // Assuming you have a cartItems state for count
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fallback colors from storeFormData or default Tailwind colors
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#0d9488'; // teal-600
  const secondaryColor = storeFormData?.themeSettings?.secondaryColor || '#f97316'; // orange-500
  const textColor = scrolled ? 'text-gray-800 dark:text-gray-100' : 'text-white';
  const logoTextColor = scrolled ? 'text-gray-900 dark:text-gray-100' : 'text-white';

  // Define dynamic CSS variables for easier use in Tailwind JIT
  const customStyles = {
    '--primary': primaryColor,
    '--secondary': secondaryColor,
    '--scrolled-bg-color': scrolled ? `rgba(255, 255, 255, 0.85)` : 'transparent', // Light mode
    '--scrolled-dark-bg-color': scrolled ? `rgba(17, 24, 39, 0.85)` : 'transparent', // Dark mode
    '--scrolled-border-color': scrolled ? `rgba(0, 0, 0, 0.1)` : 'transparent', // Light mode border
    '--scrolled-dark-border-color': scrolled ? `rgba(255, 255, 255, 0.1)` : 'transparent', // Dark mode border
    '--scrolled-text-color': scrolled ? '#1f2937' : 'white', // gray-800
    '--scrolled-dark-text-color': scrolled ? '#f9fafb' : 'white', // gray-100
    '--logo-text-color': scrolled ? '#1f2937' : 'white', // dark:text-gray-100 is covered by the dark mode logic
    '--logo-dark-text-color': scrolled ? '#f9fafb' : 'white',
  } as React.CSSProperties;


  const sections = [
    { id: 'hero', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'packages', label: 'Packages' }, // Changed 'Featured' to 'Packages' for clarity
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'faq', label: 'FAQs' }, // Changed 'FAQ' to 'FAQs'
    { id: 'blog', label: 'Blog', },//href: `/${storeFormData.slug}/blog` }, // Added a blog link
    { id: 'booking', label: 'Contact', },// href: `/${storeFormData.slug}/contact` }, // Added a contact link
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80); // Increased scroll threshold slightly
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pathname = usePathname(); // Use this to track the current path

  useEffect(() => {
    // This effect now runs whenever the 'pathname' changes
    const handleRouteChange = () => setMobileOpen(false);
    
    // Instead of listening to router events, we use the `pathname` dependency array
    // to trigger the effect on route changes.
    // The handleRouteChange function is called whenever the path changes.
    handleRouteChange();
    
    // There is no cleanup function needed for an event listener,
    // as we are now relying on React's dependency array.
  }, [pathname]); // The effect now depends on 'pathname'

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${storeFormData.slug}/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';


  if (!storeFormData) {
    return (
      <header className="fixed w-full z-50 top-0 left-0 bg-gray-900/80 backdrop-blur-md h-20 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading header...</p>
      </header>
    );
  }

  return (
    <header className="fixed w-full z-50 top-0 left-0" style={customStyles}>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className={`transition-all duration-300 h-20 flex items-center
          ${scrolled
            ? 'bg-[var(--scrolled-bg-color)] dark:bg-[var(--scrolled-dark-bg-color)] backdrop-blur-lg border-b-[var(--scrolled-border-color)] dark:border-b-[var(--scrolled-dark-border-color)] shadow-lg'
            : 'bg-transparent'
          }
        `}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-full"> {/* Use h-full */}
          {/* Logo */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Link href={`/${storeFormData.slug}`} className="flex items-center space-x-2 relative z-20">
              {storeFormData.logoUrl ? (
                <Image
                  src={storeFormData.logoUrl}
                  loader={loader}
                  alt={storeFormData.name}
                  width={160} // Slightly larger for presence
                  height={60} // Adjust height proportionally
                  className="object-contain"
                />
              ) : (
                <span className={`text-3xl font-extrabold text-[var(--logo-text-color)] dark:text-[var(--logo-dark-text-color)]`}>
                  {storeFormData.name}
                </span>
              )}
            </Link>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6 relative z-10">
            {sections.map(({ id, label, href }:any) => (
              <Link
                key={id}
                href={href || `#${id}`}
                className={`
                  relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300
                  text-[var(--scrolled-text-color)] dark:text-[var(--scrolled-dark-text-color)]
                  ${scrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'hover:bg-white/10'}
                  ${(currentPath === (href || `/#${id}`) || (currentPath === `/${storeFormData.slug}` && id === 'hero'))
                    ? `font-bold ${scrolled ? 'bg-[var(--primary)]/[--active-bg-opacity-scrolled]' : 'bg-[var(--primary)]/[--active-bg-opacity-transparent]'}`
                    : ''
                  }
                `}
              >
                {label}
                {/* Active link underline indicator */}
                {((currentPath === href && href) || (currentPath === `/${storeFormData.slug}` && id === 'hero')) && (
                  <motion.span
                    layoutId="underline"
                    className="absolute left-0 bottom-0 h-[3px] w-full rounded-full"
                    style={{ backgroundColor: secondaryColor }} // Always use secondary for accent
                  />
                )}
              </Link>
            ))}

            {/* Search and Cart/Booking Icon */}
            {/* <div className="flex items-center space-x-4 ml-6"> */}
              {/* Search */}
              {/* <motion.button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`relative p-2 rounded-full transition-all duration-300
                  ${scrolled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/10'}
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MagnifyingGlassIcon className={`w-6 h-6 text-[var(--scrolled-text-color)] dark:text-[var(--scrolled-dark-text-color)]`} />
              </motion.button> */}

              {/* <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative ml-2"
                  >
                    <input
                      type="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-full
                        ${scrolled
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-600'
                          : 'bg-white/20 text-white placeholder-white border border-white/10'
                        }
                        focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                      `}
                    />
                    <MagnifyingGlassIcon className={`w-5 h-5 absolute left-3 top-2.5 ${scrolled ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`} />
                  </motion.form>
                )}
              </AnimatePresence> */}

            {/* </div> */}
          </div>

          {/* Hamburger Menu (Mobile) */}
          <div className="lg:hidden relative z-20">
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className={`p-2 rounded-full transition-all duration-300
                ${scrolled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white/20'}
              `}
              style={{ color: scrolled ? primaryColor : 'white' }}
            >
              {mobileOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl z-40 flex flex-col items-center justify-center py-20"
            >
              <nav className="flex flex-col items-center space-y-8">
                {sections.map(({ id, label, href } : any) => (
                  <Link
                    key={id}
                    href={href || `#${id}`}
                    className="text-3xl font-semibold text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    onClick={() => setMobileOpen(false)}
                    style={{ color: primaryColor }}
                  >
                    {label}
                  </Link>
                ))}
                {/* Mobile Search Input */}
                {/* <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs mt-8">
                  <input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-3 text-gray-500 dark:text-gray-400" />
                </form> */}

                {/* Mobile Cart/Booking Button */}
                {/* <Link href={`/${storeFormData.slug}/booking`} passHref>
                  <motion.button
                    className="inline-flex items-center justify-center px-8 py-3 rounded-full font-bold text-lg shadow-md transition-all duration-300 mt-6"
                    style={{ backgroundColor: secondaryColor, color: 'white' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Book Now
                    <ShoppingCartIcon className="w-5 h-5 ml-2" />
                  </motion.button>
                </Link> */}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
};

export default Header;