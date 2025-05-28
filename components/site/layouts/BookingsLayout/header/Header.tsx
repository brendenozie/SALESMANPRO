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

const Header: React.FC<HeaderProps> = ({ store }) => {
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  const primary = store?.themeSettings?.primaryColor || "#f97316";    // fallback: orange
  const secondary = store?.themeSettings?.secondaryColor || "#3b82f6"; // fallback: blue

  const sections = ["hero", "categories", "featured", "testimonials", "faq"];

  return (
    <motion.nav
      className="fixed top-0 w-full bg-white/70 backdrop-blur-md z-50"
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center h-16">
        <Link href="/#hero" className="text-2xl font-bold text-purple-700">{store.name}</Link>
        <div className="flex space-x-6">
          {sections.map((id, i) => (
            <a
              key={id}
              href={`#${id}`}
              className={`font-medium hover:text-purple-600 transition text-gray-700 `}
            >{id.charAt(0).toUpperCase() + id.slice(1)}</a>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Header;
