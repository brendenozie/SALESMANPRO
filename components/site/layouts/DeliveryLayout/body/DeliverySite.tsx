'use client';

import React from 'react';
import HeroSlider from './components/HeroSlider';
import { StoreForm } from '@/types/typings';

// Above-the-fold components - statically imported
// import CategorySection from './components/CategorySection';
// import CategoriesSectionV5 from './components/CategorySection';

// Loading skeleton
// const SectionSkeleton = () => <div className="h-96 w-full animate-pulse bg-gray-200 rounded-lg my-12" />;
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
}

// 🧠 Dynamically import client-side sections (with skeleton fallback)
// const DynamicPopularProducts = dynamic(() => import('./components/PopularProducts'), {
//   loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
//   ssr: false,
// });

// const DynamicDailyBestSells = dynamic(() => import('./components/DailyBestSells'), {
//   loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
//   ssr: false,
// });

// const DynamicTrending = dynamic(() => import('./components/Trending'), {
//   loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,
//   ssr: false,
// });

// const PromoSection = dynamic(() => import('./components/PromoSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
// const SecondPromoSection = dynamic(() => import('./components/SecondPromoSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
// const AllProducts = dynamic(() => import('./components/AllProducts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
// const MetricsSection = dynamic(() => import('./components/MetricsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
// const AwardsSection = dynamic(() => import('./components/AwardsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
// const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection/TestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
// const NewsletterSection = dynamic(() => import('./components/NewsletterSection/NewsletterSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
import TestimonialsCarouselSection from "./components/TestimonialsCarouselSection";
import SocialProofSection from "./components/SocialProofSection";
import ServicesSection from "./components/ServicesSection";

import AbSection from './components/AbSection';
import TeamSection from './components/TeamSection';
import { BookingSection } from './components/BookingSection';
import { WorkShowcase } from './components/WorkShowCase';
import { ProcessTimeline } from './components/ProcessTimeline';
import { NetworkMap } from './components/NetworkMap';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/CallToActionSection';

type EcommerceSiteProps = {
  pageData: StoreForm;
  companyId: string;
};

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function EcommerceSite({ pageData, companyId }: EcommerceSiteProps) {
  const {
    heroSlides,
    id,
    themeSettings = {},
    StoreCategory = [],
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
    bannerUrl,
    CoreValues = [],
  } = pageData;
    // Use pageData for all content
  const siteData = pageData;// || storeFormData;

  return (
    <div>
      <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />

      <AbSection storeFormData={siteData} />  

      <TeamSection storeFormData={siteData} />
      
      <ServicesSection storeFormData={siteData} /> 

      <BookingSection storeFormData={siteData} />

      <TestimonialsCarouselSection  testimonials={pageData?.testimonials || []} />

      <WorkShowcase />

      <ProcessTimeline/>

      <SocialProofSection />  

      <NetworkMap />

       <BlogSection />
      
      {/*<FeaturedListings listings={Ebookslistings} slug={siteData?.slug || ''} />

      <HowItWorks /> 

      <BrowseByCategory listings={Programslisting} storeSlug={siteData?.slug || ''} /> 
      
      <AboutSection />   */}

      {/* <ProgramModulesSection /> */}

      {/* Featured  */}
      {/* <FeaturedProgramsSection  listings={Programslisting} slug=""/> */}

      {/* If videos are stored under latestVideos */}
      {/* {<VideoShowcaseSection blogs={(pageData?.blogs || []).map(b => ({ ...b, excerpt: b.excerpt ?? "", coverImage: b.coverImage ?? "", videoAlbumId: b.videoAlbumId ?? undefined }))} />} */}

      <ContactSection companyId={siteData?.id || ''} />

      {/* <PromotionSection/> */}

      {/* <AppPromoSection /> */}
      {/* <Features />
      <CategoriesSectionV5 store={pageData} />
      <DynamicPopularProducts id={id} />
      <PromoSection promotions={promotions} />
      <DynamicTrending id={id} />
      <DynamicDailyBestSells id={id} />
      <SecondPromoSection promotions={promotions} />
      <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
      <MetricsSection coreValues={CoreValues} />
      <AwardsSection awards={awards} />
      {testimonialsData?.data && <TestimonialsSection testimonials={testimonialsData.data} />}
      <NewsletterSection /> */}
    </div>
  );
}
