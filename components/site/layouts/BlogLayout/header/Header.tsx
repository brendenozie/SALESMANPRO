import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking the context hook to make the component runnable.
// In your actual application, you would use your real StoreContext.
// const useStoreContext = () => ({
  // storeFormData: {
  //   slug: 'my-blog',
  //   name: 'GLOBAL INSIGHTS',
  //   logoUrl: 'https://placehold.co/40x40/EF4444/FFFFFF?text=GI', // Using a placeholder that matches the new theme
  //   themeSettings: { primaryColor: '#EF4444', secondaryColor: '#EC4899' }, // Red and Pink to match the Hero
  // },
// });

// A simple utility to mimic a Next.js `Image` loader and router push
const useRouter = () => ({
  push: (href:string) => console.log(`Navigating to ${href}`),
});

const Link = ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>;

// A single-file version of the header component
const Header = () => {
  const { storeFormData } = useStoreContext() || {};
  const { slug, name, logoUrl, themeSettings } = storeFormData || {
    slug: 'my-blog',
    name: 'GLOBAL INSIGHTS',
    logoUrl: 'https://placehold.co/40x40/EF4444/FFFFFF?text=GI', // Using a placeholder that matches the new theme
    themeSettings: { primaryColor: '#EF4444', secondaryColor: '#EC4899' }, // Red and Pink to match the Hero
  };
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Use theme colors with fallbacks
  const primary = themeSettings?.primaryColor || '#f97316';
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  // Define navigation items
  const navItems = [
    { label: 'Home', href: `/${slug}` },
    { label: 'Blog', href: `/${slug}/blog` },
    { label: 'About', href: `/${slug}/about` },
    { label: 'Contact', href: `/${slug}/contact` },
  ];

  // Effect to handle the scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Icon components (using inline SVGs to keep it in one file)
  const Bars3Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
  const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  const MagnifyingGlassIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 18.75a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.324-.775-7.499-2.25Z" />
    </svg>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 backface-hidden ${
        scrolled
          ? 'bg-slate-900/40 backdrop-blur-lg shadow-xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-3 cursor-pointer select-none"
          onClick={() => router.push(`/${slug}`)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <span
              className="text-2xl font-extrabold bg-clip-text text-transparent transition-all duration-500"
              style={{
                backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
              }}
            >
              {name}
            </span>
          )}
        </motion.div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 text-white font-medium">
          {navItems.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              className="relative hover:text-red-400 transition-colors duration-200"
              initial={{ y: 0 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {label}
              <motion.span
                className="absolute left-0 bottom-[-4px] h-0.5"
                style={{ backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})` }}
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          ))}
        </nav>

        {/* Icons + Mobile Toggle */}
        <div className="flex items-center space-x-5 text-gray-300">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <MagnifyingGlassIcon />
            {/* //className="w-6 h-6 cursor-pointer" /> */}
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <UserIcon />
            {/* className="w-6 h-6 cursor-pointer" /> */}
          </motion.div>
          <button
            className="md:hidden text-gray-300"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon />
            {/* className="w-7 h-7" /> */}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-full h-screen bg-slate-950/90 backdrop-blur-lg z-50 md:hidden"
          >
            <div className="p-8 flex flex-col space-y-6 text-xl text-white">
              <div className="flex justify-between items-center mb-4">
                <span
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(45deg, ${primary}, ${secondary})`,
                  }}
                >
                  {name}
                </span>
                <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <XMarkIcon />
                  {/* //className="w-7 h-7 text-gray-300" /> */}
                </button>
              </div>
              {navItems.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-red-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
