'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
// File: components/site/layouts/BlogLayout/BlogSite.tsx

import React from 'react';
import useSWR from 'swr';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// Below-the-fold components - statically imported
import FeaturedCategoriesSection from './components/FeaturedCategoriesSection';
import LatestNewsSection from './components/LatestNewsSection';
import StaffWritersSection from './components/StaffWritersSection';
import PopularBlogsSection from './components/PopularBlogsSection';
import LatestPodcastSection from './components/LatestPodcastSection';
import CtaSection from './components/CtaSection';


export default function BlogSite({ pageData, companyId }: { pageData: StoreForm, companyId: string }) {
  // Fetch client-side data
  const { data: blogsData } = useSWR(`${apiBaseUrl}/site/blogs?id=${companyId}`, fetcher);
  
  
  const sectionMap: Record<string, React.ReactNode> = {
    'hero': <HeroSection heroSlides={pageData.heroSlides} />,
    'featured-categories': <FeaturedCategoriesSection StoreCategory={pageData.StoreCategory} />,
    'latest-news': blogsData?.data ? <LatestNewsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} /> : null,
    'staff-writers': <StaffWritersSection Writer={pageData.Writer} />,
    'popular-blogs': blogsData?.data ? <PopularBlogsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} /> : null,
    'latest-podcast': <LatestPodcastSection Podcast={pageData.Podcast} />,
    'cta': <CtaSection/>,
  };

  const staticFallback = (
    <>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSection">
        <HeroSection heroSlides={pageData.heroSlides} />
      </div>
      <div id="section-featured-categories" data-editor-section="featured-categories" data-editor-component="FeaturedCategoriesSection">
        <FeaturedCategoriesSection StoreCategory={pageData.StoreCategory} />
      </div>
      {blogsData?.data && (
        <div id="section-latest-news" data-editor-section="latest-news" data-editor-component="LatestNewsSection">
          <LatestNewsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} />
        </div>
      )}
      <div id="section-staff-writers" data-editor-section="staff-writers" data-editor-component="StaffWritersSection">
        <StaffWritersSection Writer={pageData.Writer} />
      </div>
      {blogsData?.data && (
        <div id="section-popular-blogs" data-editor-section="popular-blogs" data-editor-component="PopularBlogsSection">
          <PopularBlogsSection blogs={blogsData.data} themeSettings={pageData.themeSettings} />
        </div>
      )}
      <div id="section-latest-podcast" data-editor-section="latest-podcast" data-editor-component="LatestPodcastSection">
        <LatestPodcastSection Podcast={pageData.Podcast} />
      </div>
      <div id="section-cta" data-editor-section="cta" data-editor-component="CtaSection">
        <CtaSection/>
      </div>
    </>
  );

  return (
    <div className="font-sans">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </div>
  );
}
