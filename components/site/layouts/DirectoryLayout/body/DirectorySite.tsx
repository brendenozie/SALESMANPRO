// File: components/site/layouts/DirectoryLayout/DirectorySite.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useStoreContext } from '../../../../../contexts/StoreContext';
import CategorySection from './components/CategorySection';
import PromotionSection from './components/PromotionSection';
import NewArrivalsSection from './components/NewArrivalsSection';
import HeroSection from './components/HeroSection';
import TestimonialsSection from './components/TestimonialsSection';
import CtaSection from './components/CtaSection';
import FeaturedListingsOverviewSection from './components/FeaturedListingsOverviewSection';
import FAQSection from './components/FAQSection';

// Dynamic loader for optimized images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

function CategoryGrid({
  categories,
  slug,
}: {
  categories: { id: string; name: string; slug: string; image?: string }[];
  slug: string;
}) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 py-6 px-4">
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300 }}
          onClick={() => router.push(`/${slug}/category/${cat.slug}`)}
          role="button"
          aria-label={`View ${cat.name}`}
          className="group cursor-pointer text-center rounded-2xl bg-white/30 backdrop-blur-md border border-white/20 shadow-md p-4 transition-all hover:shadow-xl hover:ring-2 hover:ring-green-500/40"
        >
          <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden">
            {cat.image ? (
              <Image
                src={cat.image}
                alt={cat.name}
                width={96}
                height={96}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loader={loader}
              />
            ) : (
              <span className="text-3xl">{cat.name.charAt(0)}</span>
            )}
          </div>
          <p className="mt-4 text-base font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
            {cat.name}
          </p>
        </motion.div>
      ))}
    </div>
  );
}



export default function DirectorySite() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Pull categories and listings from context
  const categories = storeFormData.storeCategories.map((sc) => ({
    id: sc.id,
    name: sc.name,
    slug: sc.id,
    image: typeof sc.icon === 'string'
      ? sc.icon
      : typeof sc.items?.[0] === 'string'
      ? sc.items[0]
      : undefined,
  }));
  const listings = storeFormData.marketplaceListings.map((m) => ({
    id: m.id,
    name: m.title,
    subtitle: m.product?.name,
    imageUrl: m.images?.[0] || '',
    slug: m.id,
  }));

  const handleSearch = () => {
    router.push(`/${storeFormData.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="font-sans space-y-24">
      <HeroSection
        title={storeFormData.name}
        description={storeFormData.description}
        bannerUrl={storeFormData.bannerUrl}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
      />

      <PromotionSection />

      <NewArrivalsSection />

      <CategorySection />

      <NewArrivalsSection />

      <FeaturedListingsOverviewSection />

      <TestimonialsSection />

      <CtaSection />
    
      <FAQSection /> 
      
       {/* faqs={customFaqs} */}
    </div>
  );
}
