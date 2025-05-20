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

interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }

const slides = [
  {
    image: '/images/slider-1.jpg',
    subtitle: 'Super Value Deals',
    title: 'On all products',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
  },
  {
    image: '/images/slider-2.jpg',
    subtitle: 'Hot Deals',
    title: 'Up to 50% off',
    ctaText: 'Explore',
    ctaLink: '/deals',
  },
];

const features = [
  { Icon: TruckIcon, title: 'Free Delivery', desc: 'On orders over $99' },
  { Icon: PhoneIcon, title: '24/7 Support', desc: 'We’re here to help' },
  { Icon: ShieldCheckIcon, title: 'Secure Payment', desc: '100% secure checkout' },
  { Icon: ArrowsUpDownIcon, title: 'Easy Returns', desc: '30-day return policy' },
];

// Loader for next/image
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


const CategoryBanners = ({ categories }: { categories: StoreCategoryUI[];}) => {

  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Explore Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.id ?? "#"}
              className="group relative block rounded-xl overflow-hidden shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.4 }}
                className="relative w-full h-48"
              >
                <Image
                  src={cat.icon ?? cat.imageUrl}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loader={loader}
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all" />

                <div className="absolute inset-0 flex flex-col items-start justify-end p-4 z-10">
                  <div className="text-white text-3xl mb-1">{cat.icon}</div>
                  <span className="text-white text-lg font-semibold">
                    {cat.name}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryBanners;
