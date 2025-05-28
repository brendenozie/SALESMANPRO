"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface HeaderProps {
  store: any;
}

const Header: React.FC<HeaderProps> = ({ store }) => {
  const { cart } = useStateContext();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primary = store.themeSettings?.primaryColor || "#f97316";
  const sections = [
    { id: "hero", label: "Home" },
    { id: "services", label: "Services" },
    { id: "featured", label: "Featured" },
    { id: "testimonials", label: "Testimonials" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header className="fixed w-full z-50 top-0 left-0">
      <motion.nav
        className={`w-full transition-colors duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${store.slug}`} className="flex items-center">
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                loader={loader}
                alt={store.name}
                width={120}
                height={40}
                className="object-contain"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-800">{store.name}</span>
            )}
          </Link>

          {/* Desktop Links & Search */}
          <div className="hidden lg:flex items-center space-x-8">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="text-gray-700 hover:text-gray-900 font-medium transition"
              >
                {label}
              </a>
            ))}
            <div className="relative">
              <input
                type="search"
                placeholder="Search services..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2"
                style={{ borderColor: primary }}
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
            </div>
          </div>

          {/* Icons & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/${store.slug}/profile`)}
              className="text-gray-600"
            >
              <UserIcon className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => router.push(`/${store.slug}/checkout`)}
              className="relative text-gray-600"
            >
              <ShoppingBagIcon className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </motion.button>
            <button
              className="lg:hidden text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-white shadow-inner">
            <nav className="flex flex-col p-4 space-y-4">
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="text-gray-700 font-medium hover:text-gray-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </motion.nav>
    </header>
  );
};

export default Header;
