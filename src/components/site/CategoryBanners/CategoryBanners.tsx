import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PhoneIcon, TruckIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { motion } from "framer-motion";

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

// const categories: StoreCategoryUI[] = [
//   { id: "1", name: "Electronics", imageUrl: `${PLACEHOLDER}/300x300?text=Electronics`, slug: "electronics" },
//   { id: "2", name: "Fashion", imageUrl: `${PLACEHOLDER}/300x300?text=Fashion`, slug: "fashion" },
//   { id: "3", name: "Home & Kitchen", imageUrl: `${PLACEHOLDER}/300x300?text=Home+%26+Kitchen`, slug: "home-kitchen" },
//   { id: "4", name: "Sports", imageUrl: `${PLACEHOLDER}/300x300?text=Sports`, slug: "sports" },
//   { id: "5", name: "Beauty", imageUrl: `${PLACEHOLDER}/300x300?text=Beauty`, slug: "beauty" },
//   { id: "6", name: "Toys", imageUrl: `${PLACEHOLDER}/300x300?text=Toys`, slug: "toys" },
//   { id: "7", name: "Books", imageUrl: `${PLACEHOLDER}/300x300?text=Books`, slug: "books" },
//   { id: "8", name: "Automotive", imageUrl: `${PLACEHOLDER}/300x300?text=Automotive`, slug: "automotive" },
//   { id: "9", name: "Health", imageUrl: `${PLACEHOLDER}/300x300?text=Health`, slug: "health" },
//   { id: "10", name: "Grocery", imageUrl: `${PLACEHOLDER}/300x300?text=Grocery`, slug: "grocery" },
//   { id: "11", name: "Pet Supplies", imageUrl: `${PLACEHOLDER}/300x300?text=Pet+Supplies`, slug: "pet-supplies" },
//   { id: "12", name: "Office Supplies", imageUrl: `${PLACEHOLDER}/300x300?text=Office+Supplies`, slug: "office-supplies" },
//   { id: "13", name: "Garden", imageUrl: `${PLACEHOLDER}/300x300?text=Garden`, slug: "garden" },
//   { id: "14", name: "Baby", imageUrl: `${PLACEHOLDER}/300x300?text=Baby`, slug: "baby" },
//   { id: "15", name: "Jewelry", imageUrl: `${PLACEHOLDER}/300x300?text=Jewelry`, slug: "jewelry" },
//   { id: "16", name: "Footwear", imageUrl: `${PLACEHOLDER}/300x300?text=Footwear`, slug: "footwear" },
//   { id: "17", name: "Luggage", imageUrl: `${PLACEHOLDER}/300x300?text=Luggage`, slug: "luggage" },
// ];

