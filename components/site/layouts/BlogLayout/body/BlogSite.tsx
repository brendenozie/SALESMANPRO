// File: components/site/layouts/BlogLayout/BlogSite.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
// Loading skeleton
const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;

// Dynamically import below-the-fold components
const FeaturedCategoriesSection = dynamic(() => import('./components/FeaturedCategoriesSection'), { loading: () => <SectionSkeleton />, ssr: false });
const LatestNewsSection = dynamic(() => import('./components/LatestNewsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const StaffWritersSection = dynamic(() => import('./components/StaffWritersSection'), { loading: () => <SectionSkeleton />, ssr: false });
const PopularBlogsSection = dynamic(() => import('./components/PopularBlogsSection'), { loading: () => <SectionSkeleton />, ssr: false });
const LatestPodcastSection = dynamic(() => import('./components/LatestPodcastSection'), { loading: () => <SectionSkeleton />, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <SectionSkeleton />, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function BlogSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);
  
  return (
    <>

      <HeroSection />

      <FeaturedCategoriesSection />

      {blogsData?.data && <LatestNewsSection />}

      <StaffWritersSection />

      {blogsData?.data && <PopularBlogsSection />}

      <LatestPodcastSection />

      <CtaSection/>
      
    </>
  );
}

interface BlogHeroProps {
  siteName: string;
  bannerUrl?: string;
}


interface BlogInsightsProps {
  posts: Array<{ id: string; title: string; excerpt: string; image: string }>;
  loader: (_: any) => string;
}


