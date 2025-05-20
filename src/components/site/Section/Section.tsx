import React,{ useState, useEffect, useRef } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '@/server/db/prismadb';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDownIcon, HeartIcon, MagnifyingGlassCircleIcon, ShoppingBagIcon, UserIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, XMarkIcon, Bars3BottomLeftIcon, FaceSmileIcon, BookOpenIcon, TruckIcon, ArrowsUpDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import banner from '@/assets/homebanner.png';
import { BuildingLibraryIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../components/site/header/Header";
import Footer from "../../../components/site/footer/Footer";
import Cart from "../../../components/cart";
import SignInModal from "../../../components/SignInModal";
import { useStateContext } from '../../../contexts/ContextProvider';
import LocationModal from "../../../components/locationManager";
import ProductGrid from '@/components/site/productGrid/ProductGrid';
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection';
import CategoryBanners from '@/components/site/CategoryBanners/CategoryBanners';

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

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
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

const features = [
  { Icon: TruckIcon, title: 'Free Delivery', desc: 'On orders over $99' },
  { Icon: PhoneIcon, title: '24/7 Support', desc: 'We’re here to help' },
  { Icon: ShieldCheckIcon, title: 'Secure Payment', desc: '100% secure checkout' },
  { Icon: ArrowsUpDownIcon, title: 'Easy Returns', desc: '30-day return policy' },
];

const Section = ({ title, children, background = "none", }: { title: string; children: React.ReactNode; background?: "light" | "dark" | "none"; }) => {

  const bgClass = clsx({
    "bg-gray-50": background === "light",
    "bg-gray-900 text-white": background === "dark",
    "": background === "none",
  });

  return (
    <section className={clsx("py-16", bgClass)}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={clsx(
            "text-3xl sm:text-4xl font-bold mb-4",
            background === "dark" ? "text-white" : "text-gray-800"
          )}
        >
          {title}
        </motion.h2>
        {title !== "" && (
          <>
            <div  className={clsx("w-16 h-1 rounded mb-8",  background === "dark" ? "bg-blue-400" : "bg-blue-600")} />
          </>
        )}        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-gray-600 mb-6"
        >
          {children}
        </motion.p>
      </div>
    </section>
  );
}

export default Section;
