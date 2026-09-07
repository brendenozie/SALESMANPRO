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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSlider">
        <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      </div>

      <div id="section-ab" data-editor-section="ab" data-editor-component="AbSection">
        <AbSection storeFormData={siteData} />
      </div>  

      <div id="section-team" data-editor-section="team" data-editor-component="TeamSection">
        <TeamSection storeFormData={siteData} />
      </div>
      
      <div id="section-services" data-editor-section="services" data-editor-component="ServicesSection">
        <ServicesSection storeFormData={siteData} />
      </div> 

      <BookingSection storeFormData={siteData} />

      <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsCarouselSection">
        <TestimonialsCarouselSection  testimonials={pageData?.testimonials || []} />
      </div>

      <WorkShowcase />

      <ProcessTimeline/>

      <div id="section-social-proof" data-editor-section="social-proof" data-editor-component="SocialProofSection">
        <SocialProofSection />
      </div>  

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
      <div id="section-categories-section-v5" data-editor-section="categories-section-v5" data-editor-component="CategoriesSectionV5">
        <CategoriesSectionV5 store={pageData} />
      </div>
      <div id="section-popular-products" data-editor-section="popular-products" data-editor-component="DynamicPopularProducts">
        <DynamicPopularProducts id={id} />
      </div>
      <div id="section-promo" data-editor-section="promo" data-editor-component="PromoSection">
        <PromoSection promotions={promotions} />
      </div>
      <div id="section-trending" data-editor-section="trending" data-editor-component="DynamicTrending">
        <DynamicTrending id={id} />
      </div>
      <div id="section-daily-best-sells" data-editor-section="daily-best-sells" data-editor-component="DynamicDailyBestSells">
        <DynamicDailyBestSells id={id} />
      </div>
      <div id="section-second-promo" data-editor-section="second-promo" data-editor-component="SecondPromoSection">
        <SecondPromoSection promotions={promotions} />
      </div>
      <div id="section-all-products" data-editor-section="all-products" data-editor-component="AllProducts">
        <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />
      </div>
      <div id="section-metrics" data-editor-section="metrics" data-editor-component="MetricsSection">
        <MetricsSection coreValues={CoreValues} />
      </div>
      <div id="section-awards" data-editor-section="awards" data-editor-component="AwardsSection">
        <AwardsSection awards={awards} />
      </div>
      {testimonialsData?.data && <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
   <TestimonialsSection testimonials={testimonialsData.data} />
 </div>}
      <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
        <NewsletterSection />
      </div> */}
    </div>
  );
}
