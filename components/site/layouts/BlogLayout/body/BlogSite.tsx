'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
// File: components/site/layouts/BlogLayout/BlogSite.tsx

import React from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
import HeroSection from './components/HeroSection';
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
// Loading skeleton

// Dynamically import below-the-fold components
const FeaturedCategoriesSection = dynamic(() => import('./components/FeaturedCategoriesSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const LatestNewsSection = dynamic(() => import('./components/LatestNewsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const StaffWritersSection = dynamic(() => import('./components/StaffWritersSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PopularBlogsSection = dynamic(() => import('./components/PopularBlogsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const LatestPodcastSection = dynamic(() => import('./components/LatestPodcastSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const CtaSection = dynamic(() => import('./components/CtaSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

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
