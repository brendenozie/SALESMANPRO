// 'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { IStoreCategory, ISubcategory } from '@/types/typings';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

interface EnhancedCategoriesSectionProps {
  categories: IStoreCategory[];
  slug: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, boxShadow: '0 15px 30px rgba(0,0,0,0.4)' },
};

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function EnhancedCategoriesSection({ categories, slug }: EnhancedCategoriesSectionProps) {
  const router = useRouter();

  const isShowSubcategories = categories.length < 4;
  const itemsToDisplay = isShowSubcategories
    ? categories.flatMap(cat => cat.subcategories).slice(0, 8)
    : categories;

  // Function to determine the image source
  const getImageUrl = (item: any) => {
    if (isShowSubcategories) {
      // For subcategories, we don't have images in the provided interface.
      // Use a placeholder or a default image.
      return '/images/default-subcategory.jpg';
    }
    // For main categories, check for a valid image URL.
    return item.image || item.category?.image || '/images/default-category.jpg';
  };

  const getName = (item: any) => {
    return isShowSubcategories ? (item as ISubcategory).name : (item as IStoreCategory).displayName || item.category?.name;
  };

  const getSlug = (item: any) => {
    return isShowSubcategories ? `${slug}/category/${(item as ISubcategory).slug}` : `${slug}/category/${(item as IStoreCategory).id}`;
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.h2
          className="text-4xl md:text-5xl font-extrabold text-center mb-16 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* {isShowSubcategories ? 'Dive Deeper 🔎' : 'Explore Diverse Worlds 🌍'} */}
          {'Explore Diverse Worlds 🌍'}
          <span className="block w-24 h-1 bg-red-600 mx-auto mt-4 rounded-full"></span>
        </motion.h2>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {itemsToDisplay.map((item, index) => {
            const name = getName(item);
            const imageUrl = getImageUrl(item);
            const itemSlug = getSlug(item);

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  type: 'spring',
                  stiffness: 150,
                  damping: 15,
                  delay: index * 0.1,
                }}
                className="relative rounded-2xl overflow-hidden shadow-xl cursor-pointer group aspect-video"
                onClick={() => router.push(itemSlug)}
                aria-label={`Explore ${name}`}
              >
                <Image
                  src={imageUrl}
                  alt={name || 'Category image'}
                  fill
                  loader={loader}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover w-full h-full brightness-[.6] group-hover:brightness-[.5] group-hover:scale-110 transition-all duration-500 ease-in-out"
                  priority={index < 4}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent group-hover:from-black/90 transition-all duration-300" />

                <motion.div
                  className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-start h-20 w-6"
                  variants={textVariants}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-md">{name}</h3>
                  <div className="inline-flex items-center text-red-400 group-hover:text-red-300 transition-colors duration-300">
                    <span className="text-sm font-medium">View All</span>
                    <ArrowRightIcon className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}