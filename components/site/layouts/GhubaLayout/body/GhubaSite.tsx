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
        <BannerSlider categories={categories} pageData={pageData} />
      )}

      {/* Dynamic Sections with Standard Loading States */}
      {flashDeals.length > 0 && (
        <FlashDeals productItems={flashDeals} addToCart={addToCart} />
      )}

      {categories.length > 0 && <TopCate categories={categories} />}

      {newArrivals.length > 0 && (
        <NewArrivals productItems={newArrivals} addToCart={addToCart} />
      )}

      {discounts.length > 0 && (
        <Discount productItems={discounts} addToCart={addToCart} />
      )}

      {featuredCategory && featuredCategoryProducts.length > 0 && (
        <Shop
          category={featuredCategory}
          shopItems={featuredCategoryProducts}
          addToCart={addToCart}
        />
      )}

      {/* Footer Content */}
      <Annocument pageData={pageData} />
      <Wrapper pageData={pageData} />
    </main>
  );
};

export default HomePage;