'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import HeroSlider from './components/HeroSlider';
import { StoreForm, MarketListingForm, ListingMarketStatus, ListingSystemStatus, ListingTransactionType } from '@/types/typings';

// Above-the-fold components - statically imported
import CategorySection from './components/CategorySection';
import USPSlider from './components/USPSlider';
import RoomSection from './components/RoomSection';

// Loading skeleton
import { SkeletonGrid } from './components/SkeletonGrid/SkeletonGrid';

// 🧠 Dynamically import client-side sections (with skeleton fallback)
const DynamicPopularProducts = dynamic(() => import('./components/PopularProducts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
const DynamicDailyBestSells = dynamic(() => import('./components/DailyBestSells'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>,  ssr: false,});
const DynamicTrending = dynamic(() => import('./components/Trending'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const PromoSection = dynamic(() => import('./components/PromoSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const WeeklyProducts = dynamic(() => import('./components/WeeklyProducts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const SecondPromoSection = dynamic(() => import('./components/SecondPromoSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const AllProducts = dynamic(() => import('./components/AllProducts'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const MetricsSection = dynamic(() => import('./components/MetricsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const AwardsSection = dynamic(() => import('./components/AwardsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const TestimonialsSection = dynamic(() => import('./components/TestimonialsSection/TestimonialsSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });
const NewsletterSection = dynamic(() => import('./components/NewsletterSection/NewsletterSection'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false });

type EcommerceSiteProps = {
  pageData: StoreForm;
  companyId: string;
};

// Generic fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EcommerceSite({ pageData, companyId }: EcommerceSiteProps) {
  const {
    heroSlides,
    id,
    themeSettings = {},
    marketplaceListings = [],
    testimonials = [],
    awards = [],
    promotions = [],
    CoreValues = [],
  } = pageData;

  // Fetch client-side data
  const { data: testimonialsData } = useSWR(`${process.env.NEXT_PUBLIC_API_URL || "/api"}/site/testimonials?id=${companyId}`, fetcher);

  // ⚙️ Only include featured listings on SSR
  const featured = useMemo(
    () => (marketplaceListings || []).filter((item) => item.isFeatured).slice(0, 12),
    [marketplaceListings]
  );

  const getSectionKey = (sec: any): string => {
    if (sec.component) return sec.component;
    const sId = (sec.id || "").toLowerCase();
    if (sId.includes("heroslider") || sId.includes("hero")) return "HeroSlider";
    if (sId.includes("uspslider") || sId.includes("usp") || sId.includes("features") || sId.includes("values")) return "USPSlider";
    if (sId.includes("categorysection") || sId.includes("category")) return "CategorySection";
    if (sId.includes("weeklyproducts") || sId.includes("weekly")) return "WeeklyProducts";
    if (sId.includes("roomsection") || sId.includes("room")) return "RoomSection";
    if (sId.includes("dynamicpopularproducts") || sId.includes("popular")) return "DynamicPopularProducts";
    if (sId.includes("secondpromo") || sId.includes("second-promo")) return "SecondPromoSection";
    if (sId.includes("promosection") || sId.includes("promo")) return "PromoSection";
    if (sId.includes("dynamictrending") || sId.includes("trending")) return "DynamicTrending";
    if (sId.includes("dynamicdailybestsells") || sId.includes("daily-best-sells") || sId.includes("bestsell")) return "DynamicDailyBestSells";
    if (sId.includes("allproducts") || sId.includes("all-products")) return "AllProducts";
    if (sId.includes("metricssection") || sId.includes("metrics")) return "MetricsSection";
    if (sId.includes("awardssection") || sId.includes("awards")) return "AwardsSection";
    if (sId.includes("testimonialssection") || sId.includes("testimonial")) return "TestimonialsSection";
    if (sId.includes("newslettersection") || sId.includes("newsletter")) return "NewsletterSection";

    if (sec.type === "hero") return "HeroSlider";
    if (sec.type === "featuresBadges") return "USPSlider";
    if (sec.type === "categoryGrid") return "CategorySection";
    if (sec.type === "testimonials") return "TestimonialsSection";
    if (sec.type === "newsletter") return "NewsletterSection";

    return "";
  };

  const renderSectionComponent = (sec: any, index: number) => {
    const compKey = getSectionKey(sec);
    const secId = sec.id || `sec-${index}`;
    const domId = secId.startsWith("section-") ? secId : `section-${secId}`;

    let childNode: React.ReactNode = null;

    switch (compKey) {
      case "HeroSlider":
        childNode = <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />;
        break;
      case "USPSlider":
        childNode = (
          <USPSlider
            coreValues={CoreValues}
            themeSettings={themeSettings}
            config={sec.content}
            sectionId={sec.id}
          />
        );
        break;
      case "CategorySection":
        childNode = <CategorySection store={pageData} />;
        break;
      case "WeeklyProducts":
        childNode = <WeeklyProducts id={id} />;
        break;
      case "RoomSection":
        childNode = <RoomSection store={pageData} themeSettings={themeSettings} />;
        break;
      case "DynamicPopularProducts":
        childNode = <DynamicPopularProducts id={id} />;
        break;
      case "PromoSection":
        childNode = <PromoSection promotions={promotions} />;
        break;
      case "DynamicTrending":
        childNode = <DynamicTrending id={id} />;
        break;
      case "DynamicDailyBestSells":
        childNode = <DynamicDailyBestSells id={id} />;
        break;
      case "SecondPromoSection":
        childNode = <SecondPromoSection promotions={promotions} />;
        break;
      case "AllProducts":
        childNode = <AllProducts id={id} marketplaceListings={featured} themeSettings={themeSettings} />;
        break;
      case "MetricsSection":
        childNode = <MetricsSection coreValues={CoreValues} />;
        break;
      case "AwardsSection":
        childNode = <AwardsSection awards={awards} />;
        break;
      case "TestimonialsSection":
        childNode = (testimonialsData?.data || testimonials?.length > 0) ? (
          <TestimonialsSection testimonials={testimonialsData?.data || testimonials} />
        ) : null;
        break;
      case "NewsletterSection":
        childNode = <NewsletterSection />;
        break;
      default:
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[FurnitureSite] Unresolved section component: "${compKey || sec.component || sec.type}" for section "${sec.id}"`
          );
        }
        childNode = (
          <div className="p-8 my-4 border-2 border-dashed border-amber-500 bg-amber-50/10 text-amber-600 dark:text-amber-400 text-center font-mono text-xs rounded-xl">
            <span className="font-bold">[Unresolved Section Component: {sec.name || sec.component || sec.type || sec.id}]</span>
            <div className="text-[10px] text-zinc-500 mt-1">Section ID: {sec.id} &bull; Type: {sec.type}</div>
          </div>
        );
        break;
    }

    if (!childNode) return null;

    return (
      <div
        key={sec.id || index}
        id={domId}
        data-editor-section={sec.id}
        data-editor-component={compKey}
      >
        {childNode}
      </div>
    );
  };

  const activeSections = (pageData as any).sections;
  const hasTenantSections = Array.isArray(activeSections);

  if (hasTenantSections) {
    return (
      <div>
        {activeSections
          .filter((sec: any) => sec.isVisible !== false)
          .map((sec: any, idx: number) => renderSectionComponent(sec, idx))}
      </div>
    );
  }

  return (
    <div>
      <div id="section-hero" data-editor-section="hero" data-editor-component="HeroSlider">
        <HeroSlider heroSlides={heroSlides} themeSettings={themeSettings} />
      </div>
      {/* USP Section */}
      <div id="section-usp" data-editor-section="usp" data-editor-component="USPSlider">
        <USPSlider coreValues={CoreValues} themeSettings={themeSettings} />
      </div>      
      <div id="section-category" data-editor-section="category" data-editor-component="CategorySection">
        <CategorySection store={pageData} />
      </div>      
      {/* Product Grid */}
      <div id="section-weekly-products" data-editor-section="weekly-products" data-editor-component="WeeklyProducts">
        <WeeklyProducts id={id} />
      </div>
      {/* Featured Categories */}
      <div id="section-room" data-editor-section="room" data-editor-component="RoomSection">
        <RoomSection store={pageData} themeSettings={themeSettings} />
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
      {testimonialsData?.data && (
        <div id="section-testimonials" data-editor-section="testimonials" data-editor-component="TestimonialsSection">
          <TestimonialsSection testimonials={testimonialsData.data} />
        </div>
      )}
      <div id="section-newsletter" data-editor-section="newsletter" data-editor-component="NewsletterSection">
        <NewsletterSection />
      </div>
    </div>
  );
}
