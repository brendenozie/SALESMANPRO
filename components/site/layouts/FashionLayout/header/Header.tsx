'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShoppingBagIcon,
  Bars2Icon,
  XMarkIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { useSession, signOut } from 'next-auth/react';
import CartDrawer from './CartDrawer';

const imageLoader = ({ src, width }: { src: string; width: number }) => `${src}?w=${width}&q=80`;

export default function Header() {
  const { cart } = useStateContext();
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { name, logoUrl, themeSettings = {} } = storeFormData || {};
  const primaryColor = themeSettings?.primaryColor || '#18181b';

  // --- Header Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Navigation Logic ---
  const dynamicNavLinks = useMemo(() => {
    const categories = (storeFormData?.StoreCategory || [])
      .filter((c) => c.visible ?? true)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 5);
    
    return categories.map((cat) => ({
      id: cat.id,
      label: cat.displayName,
      href: `/${storeFormData?.slug}/category/${cat.categoryId}`,
    }));
  }, [storeFormData]);

  const handleUserAction = () => {
    if (!user) {
      const authUrl = new URL("https://auth.salesmanpro.site/signin");
      authUrl.searchParams.set("callbackUrl", window.location.origin);
      window.location.href = authUrl.toString();
      return;
    }
    router.push(user.role?.toLowerCase() === 'admin' ? '/dashboards' : `/ecommerce/profile`);
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-700 ease-in-out ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 py-4' 
            : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex justify-between items-center">
          
          {/* Left: Mobile Toggle & Search Icon */}
          <div className="flex items-center gap-6 flex-1">
            <button
              className={`md:hidden transition-colors ${scrolled ? 'text-zinc-900' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars2Icon className="h-6 w-6" />
            </button>
            <button className={`hidden md:block transition-colors ${scrolled ? 'text-zinc-900' : 'text-white/70 hover:text-white'}`}>
              <MagnifyingGlassIcon className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Center: Brand Identity */}
          <Link href="/" className="flex flex-col items-center">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name || 'Brand'}
                width={120}
                height={40}
                className={`object-contain transition-all duration-500 ${scrolled ? 'brightness-100' : 'brightness-0 invert'}`}
                loader={imageLoader}
              />
            ) : (
              <h1 className={`text-2xl md:text-3xl font-light tracking-[0.25em] uppercase transition-colors duration-500 ${
                scrolled ? 'text-zinc-900' : 'text-white'
              }`}>
                {name || 'VOGUE'}
              </h1>
            )}
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-6 md:gap-8 flex-1">
            <nav className="hidden lg:flex gap-8">
              {dynamicNavLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                    scrolled ? 'text-zinc-600 hover:text-zinc-900' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-5">
              <button 
                onClick={handleUserAction}
                className={`transition-colors ${scrolled ? 'text-zinc-900' : 'text-white/70 hover:text-white'}`}
              >
                <UserIcon className="h-5 w-5 stroke-[1.5]" />
              </button>
              
              <button
                onClick={() => setIsCartOpen(true)}
                className={`relative group transition-colors ${scrolled ? 'text-zinc-900' : 'text-white'}`}
              >
                <ShoppingBagIcon className="h-5 w-5 stroke-[1.5]" />
                {cart.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center text-white animate-in zoom-in duration-300"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="h-8 w-8 text-zinc-900 stroke-1" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-8">
              {dynamicNavLinks.map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-4xl font-light italic font-serif text-zinc-900 hover:pl-4 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-zinc-100">
              <button 
                onClick={handleUserAction}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900"
              >
                {user ? 'Account Settings' : 'Sign In / Register'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
    </>
  );
}