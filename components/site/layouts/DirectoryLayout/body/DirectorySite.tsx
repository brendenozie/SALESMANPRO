// File: components/site/layouts/DirectoryLayout/DirectorySite.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useStoreContext } from '@/contexts/StoreContext';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';
const  apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const PromotionSection = dynamic(() => import('./components/PromotionSection'), { loading: () => <SectionSkeleton />, ssr: false });
const NewArrivalsSection = dynamic(() => import('./components/NewArrivalsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CategorySection = dynamic(() => import('./components/CategorySection'), { loading: () => <SectionSkeleton />, ssr: false });
const FeaturedListingsOverviewSection = dynamic(() => import('./components/FeaturedListingsOverviewSection'), { loading: () => <SectionSkeleton />, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <SectionSkeleton />, ssr: false });
const FAQSection = dynamic(() => import('./components/FAQSection'), { loading: () => <SectionSkeleton />, ssr: false });

// Dynamic loader for optimized images
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DirectorySite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  const { storeFormData } = useStoreContext(); // Use for global theme settings only
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${apiBaseUrl}/site/testimonials?id=${companyId}`, fetcher);
  const { data: faqsData } = useSWR(`${apiBaseUrl}/site/faqs?id=${companyId}`, fetcher);

  const handleSearch = () => {
    // router.push(`/${pageData.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="font-sans">
      <HeroSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
      />

      <PromotionSection promotions={pageData.promotions} />

      <NewArrivalsSection marketplaceListings={pageData.marketplaceListings} currency={pageData.currency} />

      <CategorySection StoreCategory={pageData.StoreCategory}/>

      <NewArrivalsSection marketplaceListings={pageData.marketplaceListings} currency={pageData.currency} />

      <FeaturedListingsOverviewSection />

      {testimonialsData?.data && <TestimonialsSection testimonial={testimonialsData?.data} />}

      <CtaSection />
    
      {faqsData?.data && <FAQSection faqs={faqsData?.data} />} 
      
       {/* faqs={customFaqs} */}
    </div>
  );
}
