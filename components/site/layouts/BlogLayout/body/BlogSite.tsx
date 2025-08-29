// File: components/site/layouts/BlogLayout/BlogSite.tsx
'use client';

import React, {  } from 'react';
import HeroSection from './components/HeroSection';
import LatestPodcastSection from './components/LatestPodcastSection';
import PopularBlogsSection from './components/PopularBlogsSection';
import StaffWritersSection from './components/StaffWritersSection';
import LatestNewsSection from './components/LatestNewsSection';
import CtaSection from './components/CtaSection';

export default function BlogSite() {
  
  return (
    <main className="container mx-auto flex-1 px-6 py-8 space-y-16">

      <HeroSection />

      <LatestNewsSection />

      <StaffWritersSection />

      <PopularBlogsSection />

      <LatestPodcastSection />

      <CtaSection/>
      
    </main>
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


