"use client";

import React, { useContext } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useStoreContext } from '@/contexts/StoreContext';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const companyLogos: string[] = [
  '/images/logos/logo1.png',
  '/images/logos/logo2.png',
  '/images/logos/logo3.png',
  '/images/logos/logo4.png',
  '/images/logos/logo5.png',
];

export default function ExcellenceSection() {
  // Retrieve data from context
  const { storeFormData } = useStoreContext();
      
        if (!storeFormData) {
          return (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Loading...</p>
            </div>
          );
        }
  
    const {
      slug,
      bannerUrl,
      name,
      description,
      storeCategories,      // array of { id, name, icon, items, sortOrder, visible }
      marketplaceListings,     // assume you added this field to Prisma/StoreForm
      testimonials,
      faqs,
      stats,
      themeSettings,
    } = storeFormData;

  const primary = themeSettings?.primaryColor || '#0d9488'; // teal-600 fallback
  const secondary = themeSettings?.secondaryColor || '#f97316'; // orange-500 fallback

  // Define featureImages from storeFormData or provide fallback images
  const featureImages: string[] =
    (storeFormData?.bannerUrl
      ? [storeFormData.bannerUrl]
      : []
    ).concat([
      '/images/features/feature1.jpg',
      '/images/features/feature2.jpg',
    ]).slice(0, 3);

  return (
    <section className="bg-white py-12">
      {/* Logos */}
      <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap px-6 gap-4 mb-12">
        {companyLogos.map((logoUrl: string, idx: number) => (
          <Image
            key={idx}
            loader={loader}
            src={logoUrl}
            alt={`Partner logo ${idx + 1}`}
            width={100}
            height={40}
            className="object-contain h-10 w-auto"
          />
        ))}
      </div>

      {/* Main Card */}
      <div
        className="max-w-6xl mx-auto rounded-3xl shadow-xl px-8 py-12 grid md:grid-cols-2 gap-10 items-center"
        style={{ backgroundColor: primary, color: 'white' }}
      >
        {/* Text Section */}
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight mb-4">
            Our Commitment to <br />
            <span className="text-white" style={{ background: `linear-gradient(to right, ${secondary}, ${primary})`, WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Excellence Experiences
            </span>
          </h2>
          <p className="text-white/90 mb-6">
            Explore the core mission and vision that drives us every day. We're not just about services; we're about creating lasting value and trust in every interaction.
          </p>
          <Link
            href={`/${slug}/services`}
            className="inline-block bg-white hover:bg-white/90 text-gray-900 font-semibold px-6 py-3 rounded-lg shadow mb-6 transition"
          >
            Request Service
          </Link>

          {/* Perks */}
          <ul className="space-y-4 text-sm">
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-white mr-3" />
              Eco-Friendly Cleaning Products
            </li>
            <li className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 text-white mr-3" />
              Customized Cleaning Packages
            </li>
          </ul>
        </div>

        {/* Image Collage */}
        <motion.div
          className="relative w-full h-full flex justify-center items-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative w-full max-w-md mx-auto">
            {featureImages[0] && (
              <Image
                src={featureImages[0]}
                loader={loader}
                alt="Main feature"
                width={400}
                height={300}
                className="rounded-xl shadow-lg mb-4"
              />
            )}
            {/* {featureImages[1] && (
              <div className="absolute top-2/3 left-0 transform -translate-y-1/2 -translate-x-8">
                <Image
                  src={featureImages[1]}
                  loader={loader}
                  alt="Secondary feature"
                  width={160}
                  height={120}
                  className="rounded-lg shadow-xl -rotate-10"
                />
              </div>
            )}
            {featureImages[2] && (
              <div className="absolute top-2/3 right-0 transform -translate-y-1/2 translate-x-8">
                <Image
                  src={featureImages[2]}
                  loader={loader}
                  alt="Tertiary feature"
                  width={160}
                  height={120}
                  className="rounded-lg shadow-xl rotate-10"
                />
              </div>
            )} */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
