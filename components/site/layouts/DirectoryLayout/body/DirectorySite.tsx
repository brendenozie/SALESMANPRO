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


export default function DirectorySite() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // router.push(`/${storeFormData.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="font-sans space-y-24">
      <HeroSection
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
