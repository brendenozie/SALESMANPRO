'use client';

import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';

import React, { Suspense } from "react";
import { useStateContext } from "@/contexts/ContextProvider";
import { StoreForm } from "@/types/typings";
import BannerSlider from "./components/BannerSlider/BannerSlider";

// Reusable Loading Fallback


// Below-the-fold components - statically imported
import FlashDeals from "./components/flashDeals/FlashDeals";
import TopCate from "./components/top";
import NewArrivals from "./components/newarrivals";
import Discount from "./components/discount";
import Shop from "./components/shops";
import Annocument from "./components/annocument/Annocument";
import Wrapper from "./components/wrapper/Wrapper";
import GhubaPersonalizedSection from "@/components/ghuba/recommendations/GhubaPersonalizedSection";

interface HomePageProps {
  pageData: StoreForm;
  ghubaData?: any;
  companyId: string;
}

const HomePage: React.FC<HomePageProps> = ({ pageData, ghubaData }) => {
  const categories = ghubaData?.categories || [];
  const sections = ghubaData?.sections || {};

  const featuredCategory =
    ghubaData?.featuredCategory ??
    categories.find((c: any) => c.isFeatured) ??
    categories[0] ??
    null;

  const flashDeals = sections.flashDeals || [];
  const newArrivals = sections.newArrivals || [];
  const discounts = sections.discounts || [];
  const featuredCategoryProducts = sections.featuredCategoryProducts || [];

  const { addToCart } = useStateContext();

  
  const bannerNode = categories.length > 0 ? <BannerSlider categories={categories} pageData={pageData} /> : null;
  const flashDealsNode = flashDeals.length > 0 ? <FlashDeals productItems={flashDeals} addToCart={addToCart} /> : null;
  const topCateNode = categories.length > 0 ? <TopCate categories={categories} /> : null;
  const newArrivalsNode = newArrivals.length > 0 ? <NewArrivals productItems={newArrivals} addToCart={addToCart} /> : null;
  const discountNode = discounts.length > 0 ? <Discount productItems={discounts} addToCart={addToCart} /> : null;
  const shopNode = (featuredCategory && featuredCategoryProducts.length > 0) ? (
    <Shop
      category={featuredCategory}
      shopItems={featuredCategoryProducts}
      addToCart={addToCart}
    />
  ) : null;
  const annocumentNode = <Annocument pageData={pageData} />;
  const wrapperNode = <Wrapper pageData={pageData} />;
  const personalizedNode = <GhubaPersonalizedSection />;

  const sectionMap: Record<string, React.ReactNode> = {
    // 1. Banner Slider
    'ghuba-bannerslider': bannerNode,
    'bannerslider': bannerNode,
    'banner': bannerNode,
    'hero': bannerNode,

    // 2. Flash Deals
    'ghuba-flashdeals': flashDealsNode,
    'flashdeals': flashDealsNode,
    'flash-deals': flashDealsNode,

    // 3. Top Categories
    'ghuba-topcate': topCateNode,
    'topcate': topCateNode,
    'top-cate': topCateNode,
    'categories': topCateNode,

    // 4. Personalized Recommendations
    'ghuba-recommendations': personalizedNode,
    'recommendations': personalizedNode,
    'personalized': personalizedNode,

    // 5. New Arrivals
    'ghuba-newarrivals': newArrivalsNode,
    'newarrivals': newArrivalsNode,
    'new-arrivals': newArrivalsNode,

    // 6. Discounts
    'ghuba-discount': discountNode,
    'discount': discountNode,
    'discounts': discountNode,

    // 7. Shop Catalog
    'ghuba-shop': shopNode,
    'shop': shopNode,

    // 8. Announcements
    'ghuba-annocument': annocumentNode,
    'annocument': annocumentNode,
    'announcement': annocumentNode,

    // 9. Highlights Wrapper
    'ghuba-wrapper': wrapperNode,
    'wrapper': wrapperNode,
  };

  const staticFallback = (
    <>
      {categories.length > 0 && (
        <div id="section-banner" data-editor-section="banner" data-editor-component="BannerSlider">
          <BannerSlider categories={categories} pageData={pageData} />
        </div>
      )}
      {flashDeals.length > 0 && (
        <div id="section-flash-deals" data-editor-section="flash-deals" data-editor-component="FlashDeals">
          <FlashDeals productItems={flashDeals} addToCart={addToCart} />
        </div>
      )}
      <div id="section-recommendations" data-editor-section="recommendations" data-editor-component="GhubaPersonalizedSection">
        <GhubaPersonalizedSection />
      </div>
      {categories.length > 0 && (
        <div id="section-top-cate" data-editor-section="top-cate" data-editor-component="TopCate">
          <TopCate categories={categories} />
        </div>
      )}
      {newArrivals.length > 0 && (
        <div id="section-new-arrivals" data-editor-section="new-arrivals" data-editor-component="NewArrivals">
          <NewArrivals productItems={newArrivals} addToCart={addToCart} />
        </div>
      )}
      {discounts.length > 0 && (
        <div id="section-discount" data-editor-section="discount" data-editor-component="Discount">
          <Discount productItems={discounts} addToCart={addToCart} />
        </div>
      )}
      {featuredCategory && featuredCategoryProducts.length > 0 && (
        <div id="section-shop" data-editor-section="shop" data-editor-component="Shop">
          <Shop
            category={featuredCategory}
            shopItems={featuredCategoryProducts}
            addToCart={addToCart}
          />
        </div>
      )}
      <div id="section-annocument" data-editor-section="annocument" data-editor-component="Annocument">
        <Annocument pageData={pageData} />
      </div>
      <div id="section-wrapper" data-editor-section="wrapper" data-editor-component="Wrapper">
        <Wrapper pageData={pageData} />
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 selection:bg-amber-500 selection:text-white transition-colors duration-500">
      <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={staticFallback} />
    </main>
  );
};

export default HomePage;
