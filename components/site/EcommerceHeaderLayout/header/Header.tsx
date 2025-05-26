"use client"
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
import { useStateContext } from "../../../../contexts/ContextProvider";
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

const Header: React.FC<HeaderProps> = ({ store }) => {
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  const primary = store?.themeSettings?.primaryColor || "#f97316";    // fallback: orange
  const secondary = store?.themeSettings?.secondaryColor || "#3b82f6"; // fallback: blue

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm transition-shadow">
      {/* Top Info Bar */}
      <div
        className="hidden md:flex justify-between items-center px-6 py-2 text-sm font-medium"
        style={{ backgroundColor: `${primary}1A`, color: primary }}
      >
        <div className="flex items-center space-x-6">
          {store.contactEmail && (
            <a href={`mailto:${store.contactEmail}`} className="flex text-sm items-center uppercase hover:underline">
              📧 <span className="ml-1">{store.contactEmail}</span>
            </a>
          )}
          {store.contactPhone && (
            <a href={`tel:${store.contactPhone}`} className="flex items-center hover:underline">
              📞 <span className="ml-1">{store.contactPhone}</span>
            </a>
          )}
        </div>
        <div className="flex space-x-4">
          {store.socialLinks.map((s) => (
            <a
              key={s.channel}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: primary }}
              onMouseEnter={(e) => (e.currentTarget.style.color = secondary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = primary)}
              className="capitalize transition-colors"
            >
              {s.channel}
            </a>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <Link href={`/site/${store.slug}`} className="flex items-center space-x-2">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  width={120}
                  height={40}
                  className="object-contain"
                  loader={loader}
                />
              ) : (
                <span className="text-xl font-bold text-gray-800 dark:text-white">{store.name}</span>
              )}
            </Link>
            <nav className="hidden lg:flex space-x-6 font-medium text-gray-700 dark:text-gray-200">
              {["Home", "Shop", "Categories"].map((label) => (
                <Link
                  key={label}
                  href={`/site/${store.slug}/${label.toLowerCase() === "home" ? "" :  label.toLowerCase() === "shop" ? "products" : label.toLowerCase()}`}
                  className="hover:underline"
                  style={{ color: "#444" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search */}
          <div className="flex-1 mx-6 hidden lg:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm rounded-full py-2 px-4 pl-10 shadow-sm focus:outline-none"
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${primary}`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <MagnifyingGlassCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <motion.button whileHover={{ scale: 1.1 }} onClick={()=>{router.push(`/site/${store.slug}/profile`);}} className="text-gray-600 dark:text-gray-200">
              <UserIcon className="h-6 w-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} onClick={()=>{router.push(`/site/${store.slug}/checkout`);}} className="relative text-gray-600 dark:text-gray-200">
              <ShoppingBagIcon className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ">
                  {cart.length}
                </span>
              )}
            </motion.button>
            <button
              className="lg:hidden text-gray-600 dark:text-gray-200"
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
        <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 shadow-md">
          <div className="space-y-3">
            {["Home", "Shop", "Categories"].map((label) => (
              <Link
                key={label}
                href={`/site/${store.slug}/${label.toLowerCase() === "home" ? "" : label.toLowerCase() === "shop" ? "products" : label.toLowerCase() }`}
                className="block hover:underline"
                style={{ color: "#444" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
