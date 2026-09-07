"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useStateContext } from "@/contexts/ContextProvider";
import { StoreForm } from "@/types/typings";
import BannerSlider from "./components/BannerSlider/BannerSlider";
import { SkeletonGrid } from "./components/SkeletonGrid/SkeletonGrid";

// Reusable Loading Fallback
const ComponentSkeleton = () => (
  <div className="py-20 bg-gray-50 dark:bg-gray-900">
    <SkeletonGrid count={8} />
  </div>
);

// Corrected Dynamic Imports
const FlashDeals = dynamic(() => import("./components/flashDeals/FlashDeals"), {
  ssr: true,
  loading: ComponentSkeleton,
});

const TopCate = dynamic(() => import("./components/top"), {
  ssr: true,
  loading: ComponentSkeleton,
});

const NewArrivals = dynamic(() => import("./components/newarrivals"), {
  ssr: true,
  loading: ComponentSkeleton,
});

const Discount = dynamic(() => import("./components/discount"), {
  ssr: true,
  loading: ComponentSkeleton,
});

const Shop = dynamic(() => import("./components/shops"), {
  ssr: true,
  loading: ComponentSkeleton,
});

const Annocument = dynamic(() => import("./components/annocument/Annocument"));
const Wrapper = dynamic(() => import("./components/wrapper/Wrapper"));

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

  return (
    <main className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 selection:bg-amber-500 selection:text-white transition-colors duration-500">
      {/* Priority Above-The-Fold Render */}
      {categories.length > 0 && (
        <div id="section-banner" data-editor-section="banner" data-editor-component="BannerSlider">
          <BannerSlider categories={categories} pageData={pageData} />
        </div>
      )}

      {/* Dynamic Sections with Standard Loading States */}
      {flashDeals.length > 0 && (
        <div id="section-flash-deals" data-editor-section="flash-deals" data-editor-component="FlashDeals">
          <FlashDeals productItems={flashDeals} addToCart={addToCart} />
        </div>
      )}

      {categories.length > 0 && <div id="section-top-cate" data-editor-section="top-cate" data-editor-component="TopCate">
   <TopCate categories={categories} />
 </div>}

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

      {/* Footer Content */}
      <div id="section-annocument" data-editor-section="annocument" data-editor-component="Annocument">
        <Annocument pageData={pageData} />
      </div>
      <div id="section-wrapper" data-editor-section="wrapper" data-editor-component="Wrapper">
        <Wrapper pageData={pageData} />
      </div>
    </main>
  );
};

export default HomePage;