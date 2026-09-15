'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
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
        childNode = (testimonials && testimonials.length > 0) ? (
          <TestimonialsSection testimonials={testimonials} />
        ) : null;
        break;
      case "NewsletterSection":
        childNode = <NewsletterSection />;
        break;
      default:
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[WebsiteBuilder Renderer Failure]\ntheme: Furniture\npage: Home\nsectionId: ${sec.id}\nsemanticRole: ${sec.category || sec.type}\ncomponentType: ${sec.component || compKey}\nrendererKey: ${compKey}\nrenderer: NOT FOUND`
          );
        }
        childNode = (
          <div className="p-8 my-4 border-2 border-dashed border-rose-500 bg-rose-50/10 text-rose-600 dark:text-rose-400 text-center font-mono text-xs rounded-xl">
            <span className="font-bold">[WebsiteBuilder Renderer Failure: Unresolved Section Component: {sec.name || sec.component || sec.type || sec.id}]</span>
            <div className="text-[10px] text-zinc-500 mt-1">
              Theme: Furniture &bull; Section ID: {sec.id} &bull; Component: {sec.component || "none"} &bull; Type: {sec.type}
            </div>
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

const DEFAULT_FURNITURE_SECTIONS = [
  { id: "furniture-heroslider", name: "Hero Banner Slider", component: "HeroSlider", type: "hero", isVisible: true },
  {
    id: "furniture-uspslider",
    name: "Core Values & Guarantees",
    component: "USPSlider",
    type: "featuresBadges",
    isVisible: true,
    content: {
      title: "Core Values & Guarantees",
      items: [
        {
          title: "White Glove Delivery",
          desc: "Seamless assembly and precise placement by our specialist team.",
          icon: "TruckIcon",
        },
        {
          title: "Sustainable Sourcing",
          desc: "FSC certified timber and organic textiles designed for longevity.",
          icon: "SwatchIcon",
        },
        {
          title: "Lifetime Structural",
          desc: "A testament to quality: guaranteed integrity on every frame.",
          icon: "StarIcon",
        },
      ],
    },
  },
  { id: "furniture-categorysection", name: "Featured Categories", component: "CategorySection", type: "categoryGrid", isVisible: true },
  { id: "furniture-weeklyproducts", name: "Weekly Featured Items", component: "WeeklyProducts", type: "productGrid", isVisible: true },
  { id: "furniture-roomsection", name: "Shop by Room", component: "RoomSection", type: "custom", isVisible: true },
  { id: "furniture-dynamicpopularproducts", name: "Popular Products", component: "DynamicPopularProducts", type: "productGrid", isVisible: true },
  { id: "furniture-promosection", name: "Promotional Spotlight Banner", component: "PromoSection", type: "ctaBanner", isVisible: true },
  { id: "furniture-dynamictrending", name: "Trending Items", component: "DynamicTrending", type: "custom", isVisible: true },
  { id: "furniture-dynamicdailybestsells", name: "Daily Best Sellers", component: "DynamicDailyBestSells", type: "productGrid", isVisible: true },
  { id: "furniture-secondpromosection", name: "Special Offers Banner", component: "SecondPromoSection", type: "ctaBanner", isVisible: true },
  { id: "furniture-allproducts", name: "All Products Showcase", component: "AllProducts", type: "productGrid", isVisible: true },
  { id: "furniture-metricssection", name: "Guarantees & Performance Metrics", component: "MetricsSection", type: "featuresBadges", isVisible: true },
  { id: "furniture-awardssection", name: "Industry Awards & Honors", component: "AwardsSection", type: "featuresBadges", isVisible: true },
  { id: "furniture-testimonialssection", name: "Customer Testimonials", component: "TestimonialsSection", type: "testimonials", isVisible: true },
  { id: "furniture-newslettersection", name: "VIP Newsletter Subscription", component: "NewsletterSection", type: "newsletter", isVisible: true },
];

  const rawSections = (pageData as any)?.sections;
  const activeSections = Array.isArray(rawSections) && rawSections.length > 0
    ? rawSections
    : DEFAULT_FURNITURE_SECTIONS;

  return (
    <div data-furniture-site="dynamic-root">
      {activeSections
        .filter((sec: any) => sec.visible !== false && sec.isVisible !== false)
        .map((sec: any, idx: number) => renderSectionComponent(sec, idx))}
    </div>
  );
}
