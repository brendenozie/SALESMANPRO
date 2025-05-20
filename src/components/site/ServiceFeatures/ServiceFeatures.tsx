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

const ServiceFeatures = ({ store }: { store: Store }) => {
  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ Icon, title, desc } :any , idx : any) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-start bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-center bg-orange-100 text-orange-600 rounded-full w-12 h-12 mb-4">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceFeatures;
