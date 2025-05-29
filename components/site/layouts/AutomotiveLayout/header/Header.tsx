'use client'
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MagnifyingGlassCircleIcon,
  ShoppingBagIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";

// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  themeSettings: any;
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface HeaderProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const Header: React.FC<HeaderProps> = ({ store }:any) => {
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Transparent header over video, white text
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="backdrop-blur-md bg-black bg-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href={`/site/${store.slug}`} className="flex items-center">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  width={120}
                  height={40}
                  className="object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                  loader={loader}
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {store.name}
                </span>
              )}
            </Link>

            {/* Desktop Nav + Search */}
            <div className="hidden lg:flex items-center space-x-6">
              {["Home", "Shop", "Categories"].map((label) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -2 }}
                  className="text-white font-medium hover:text-blue-400 transition"
                >
                  <Link
                    href={`/site/${store.slug}/${label === "Home" ? "" : label.toLowerCase()}`}
                    scroll={false}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              <div className="relative">
                <motion.input
                  type="search"
                  placeholder="Search vehicles..."
                  className="w-64 bg-white bg-opacity-20 placeholder-gray-200 text-white rounded-full py-2 pl-10 pr-4 focus:bg-opacity-40 focus:outline-none transition"
                  whileFocus={{ scale: 1.02 }}
                />
                <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-200" />
              </div>
            </div>

            {/* Icons & Mobile Toggle */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => router.push(`/site/${store.slug}/profile`)}
                className="text-white"
              >
                <UserIcon className="h-6 w-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={() => router.push(`/site/${store.slug}/checkout`)}
                className="relative text-white"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </motion.button>

              <button
                className="lg:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3BottomLeftIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-black bg-opacity-50 border-t border-gray-700"
          >
            <div className="flex flex-col px-4 py-4 space-y-3">
              {["Home", "Shop", "Categories"].map((label) => (
                <Link
                  key={label}
                  href={`/site/${store.slug}/${label === "Home" ? "" : label.toLowerCase()}`}
                  className="text-white font-medium hover:text-blue-400 transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;
