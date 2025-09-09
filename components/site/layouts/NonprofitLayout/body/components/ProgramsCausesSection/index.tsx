"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline'; // Added for consistency
// Assuming useStoreContext is available and provides storeFormData
import { useStoreContext } from '@/contexts/StoreContext';

// Define types based on your schema.txt for MarketplaceListing and Product
// export type Product = {
//   id: string;
//   name: string;
//   description?: string;
//   images?: string[]; // Array of image URLs
//   // Add other relevant product fields if needed
// };

// export type MarketplaceListing = {
//   id: string;
//   name: string;
//   description?: string;
//   images?: string[]; // Array of image URLs for the listing itself
//   product?: Product; // Nested product details
//   order: number; // For sorting
//   // Add other relevant listing fields if needed
// };

export type ThemeSettings = {
  primaryColor?: string;
  secondaryColor?: string;
};

// export type StoreForm = {
//   name?: string; // For section title
//   slug?: string; // For constructing dynamic links
//   marketplaceListings?: MarketplaceListing[]; // Array of marketplace listings (programs/causes)
//   themeSettings?: ThemeSettings;
//   // Add other relevant StoreForm fields if needed for this section
// };

// Placeholder for useStoreContext to make the component runnable independently
// In a real application, you would uncomment the actual import.
// const useStoreContext = () => ({
//   storeFormData: {
//     name: 'Children\'s Hope Foundation',
//     slug: 'childrens-hope-foundation', // Example slug for dynamic links
//     marketplaceListings: [
//       {
//         id: 'cause-1',
//         title: 'Medical Aid for Children',
//         description: 'Providing essential healthcare, vaccinations, and medical support to vulnerable children in remote areas.',
//         images: ['https://images.unsplash.com/photo-1576765974026-6113b2e7c3e1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'], // Example image
//         order: 1,
//       },
//       {
//         id: 'cause-2',
//         title: 'Education for All',
//         description: 'Building schools, providing learning materials, and supporting teachers to ensure every child has access to quality education.',
//         images: ['https://images.unsplash.com/photo-1523050854805-9a84a9235777?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         order: 2,
//       },
//       {
//         id: 'cause-3',
//         title: 'Clean Water Initiatives',
//         description: 'Implementing sustainable water projects to provide clean and safe drinking water to communities in need.',
//         images: ['https://images.unsplash.com/photo-1549429168-f9d936162391?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         order: 3,
//       },
//       {
//         id: 'cause-4',
//         title: 'Emergency Food Relief',
//         description: 'Delivering urgent food supplies and nutritional support to families affected by crises and natural disasters.',
//         images: ['https://images.unsplash.com/photo-1518621736915-f3b160292723?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
//         order: 4,
//       },
//     ],
//     themeSettings: {
//       primaryColor: "#FF5722", // Orange for primary actions
//       secondaryColor: "#FFFFFF", // White for secondary actions/text
//     },
//   } as StoreForm,
// });

// Optimized image loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Static fallback data for programs/causes
const fallbackCauses = [
  {
    id: 'fb-cause-1',
    name: 'Support for Orphaned Children',
    description: 'Providing loving homes, education, and emotional support to children who have lost their parents.',
    images: ['https://placehold.co/600x400/FF8C00/FFFFFF?text=Orphans'],
    order: 1,
  },
  {
    id: 'fb-cause-2',
    name: 'Healthcare for Rural Communities',
    description: 'Establishing mobile clinics and health education programs in underserved rural areas.',
    images: ['https://placehold.co/600x400/228B22/FFFFFF?text=Rural+Health'],
    order: 2,
  },
  {
    id: 'fb-cause-3',
    name: 'Vocational Training for Youth',
    description: 'Equipping young adults with practical skills and vocational training for sustainable livelihoods.',
    images: ['https://placehold.co/600x400/8A2BE2/FFFFFF?text=Vocational+Training'],
    order: 3,
  },
];

export default function ProgramsCausesSection() {
  const { storeFormData } = useStoreContext();

  // Dynamic colors from storeFormData
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#FF5722'; // Default Orange

  // Determine which listings to render: dynamic or fallback
  const listingsToRender = Array.isArray(storeFormData?.projects) && storeFormData.projects.length > 0
    ? storeFormData.projects//.sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order
    : fallbackCauses;

  const organizationSlug = storeFormData?.slug || 'non-profit'; // Fallback slug for links

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://placehold.co/600x400/CCCCCC/333333?text=Program+Image";
  };

  // Mock router for demonstration (replace with actual useRouter in a Next.js app)
  const mockRouterPush = (path: string) => {
    console.log(`Navigating to: ${path}`);
    // window.location.href = path; // Uncomment for actual redirection
  };

  return (
    <section id="causes" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Explore Our Impact Programs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listingsToRender.map((listing, i) => {
            const progName = listing.name;
            const progDescription = listing.description ?? "";
            const imageUrl = `https://placehold.co/600x400/D1D5DB/4B5563?text=Program+${i + 1}`; //listing.images?.[0] ??  Fallback placeholder
            const progSlug = listing.id;

            return (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-transform duration-300 cursor-pointer flex flex-col"
                onClick={() => mockRouterPush(`/${organizationSlug}/program/${progSlug}`)}
              >
                <div className="relative h-56">
                  <Image
                    src={imageUrl}
                    alt={progName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loader={loader}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      {progName}
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                      {progDescription}
                    </p>
                  </div>
                  <Link
                    href={`/${organizationSlug}/program/${progSlug}`}
                    className="mt-5 inline-flex items-center font-medium transition-colors"
                    style={{ color: primaryColor, '--tw-hover-text-color': `${primaryColor}D0` } as React.CSSProperties}
                  >
                    Learn More <ArrowRightIcon className="ml-2 w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center mt-12">
          <Link
            href={`/${organizationSlug}/programs`}
            className="px-8 py-3 rounded-full font-semibold hover:shadow-lg transition duration-300 transform hover:scale-105"
            style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
          >
            View All Causes
          </Link>
        </div>
      </div>
    </section>
  );
}
