// File: components/site/layouts/BlogLayout/BlogSite.tsx
'use client';

import React, {  } from 'react';
import HeroSection from './components/HeroSection';
import LatestPodcastSection from './components/LatestPodcastSection';
import PopularBlogsSection from './components/PopularBlogsSection';
import StaffWritersSection from './components/StaffWritersSection';
import LatestNewsSection from './components/LatestNewsSection';
import CtaSection from './components/CtaSection';
import FeaturedCategoriesSection from './components/FeaturedCategoriesSection';
import { StoreForm } from '@/types/typings';

export default function BlogSite({ pageData }: { pageData: StoreForm }) {
  
  return (
    <>

      <HeroSection />

      <FeaturedCategoriesSection />

      <LatestNewsSection />

      <StaffWritersSection />

      <PopularBlogsSection />

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


