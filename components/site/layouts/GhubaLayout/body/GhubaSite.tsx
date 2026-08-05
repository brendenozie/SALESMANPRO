"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useStateContext } from "@/contexts/ContextProvider";
import { StoreForm } from "@/types/typings";
import BannerSlider from "./components/BannerSlider/BannerSlider";

// Below-the-fold Lazy Loaded Chunk Splitters
const FlashDeals = dynamic(() => import("./components/flashDeals/FlashDeals"), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-[480px]" />,
});
const TopCate = dynamic(() => import("./components/top"), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-[520px]" />,
});
const NewArrivals = dynamic(() => import("./components/newarrivals"), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-[500px]" />,
});
const Discount = dynamic(() => import("./components/discount"), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-[500px]" />,
});
const Shop = dynamic(() => import("./components/shops"), {
  ssr: true,
  loading: () => <SectionSkeleton height="h-[600px]" />,
});
const Annocument = dynamic(() => import("./components/annocument/Annocument"));
const Wrapper = dynamic(() => import("./components/wrapper/Wrapper"));

function SectionSkeleton({ height }: { height: string }) {
  return (
    <div className={`w-full ${height} max-w-[1600px] mx-auto px-4 my-8`}>
      <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900/60 rounded-[2.5rem] animate-pulse" />
    </div>
  );
}

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

  const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();

  return (
    <main className="min-h-screen bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 selection:bg-amber-500 selection:text-white transition-colors duration-500">
      {/* Priority Above-The-Fold Render */}
      {categories.length > 0 && (
        <BannerSlider categories={categories} pageData={pageData} />
      )}

      {/* Streaming Lazy Hydration Renders */}
      <Suspense fallback={<SectionSkeleton height="h-[480px]" />}>
        {flashDeals.length > 0 && (
          <FlashDeals
            productItems={flashDeals}
            addToCart={addToCart}
          />
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[520px]" />}>
        {categories.length > 0 && <TopCate categories={categories} />}
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        {newArrivals.length > 0 && (
          <NewArrivals
            productItems={newArrivals}
            addToCart={addToCart}
          />
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
        {discounts.length > 0 && (
          <Discount
            productItems={discounts}
            addToCart={addToCart}
          />
        )}
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
        {featuredCategory && featuredCategoryProducts.length > 0 && (
          <Shop
            category={featuredCategory}
            shopItems={featuredCategoryProducts}
            addToCart={addToCart}
          />
        )}
      </Suspense>

      {/* Footer Content */}
      <Annocument pageData={pageData} />
      <Wrapper pageData={pageData} />
    </main>
  );
};

export default HomePage;