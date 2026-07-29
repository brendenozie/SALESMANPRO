"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useStateContext } from '@/contexts/ContextProvider';
import { StoreForm } from '@/types/typings';

// 1. ABOVE-THE-FOLD (Priority): Keep standard import for the hero section.
// This ensures it is bundled in the initial payload for the fastest possible Largest Contentful Paint (LCP).
import BannerSlider from './components/BannerSlider/BannerSlider';

// 2. BELOW-THE-FOLD (Lazy Loaded): Dynamically import the rest.
// Next.js will still Server-Side Render (SSR) the HTML for SEO, but the heavy JavaScript 
// for these sections will be split into separate chunks and loaded in the background.
const FlashDeals = dynamic(() => import('./components/flashDeals/FlashDeals'));
const TopCate = dynamic(() => import('./components/top'));
const NewArrivals = dynamic(() => import('./components/newarrivals'));
const Discount = dynamic(() => import('./components/discount'));
const Shop = dynamic(() => import('./components/shops'));
const Annocument = dynamic(() => import('./components/annocument/Annocument'));
const Wrapper = dynamic(() => import('./components/wrapper/Wrapper'));

const HomePage = ({ pageData, ghubaData, companyId }: { pageData: StoreForm, ghubaData?: any, companyId: string }) => {
  // Pull server-injected data synchronously
  const categories = ghubaData?.categories || [];
  const sections = ghubaData?.sections || {};

  const featuredCategory = ghubaData?.featuredCategory ?? categories.find((c: any) => c.isFeatured) ?? categories[0] ?? null;
  const flashDeals = sections.flashDeals || [];
  const newArrivals = sections.newArrivals || [];
  const discounts = sections.discounts || [];
  const featuredCategoryProducts = sections.featuredCategoryProducts || [];

  const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();

  return (
    <>
      {/* Priority Render */}
      {categories?.length > 0 && (
        <BannerSlider categories={categories} pageData={pageData} />
      )}
      
      {/* Deferred Hydration Renders */}
      {flashDeals?.length > 0 && (
        <FlashDeals
          productItems={flashDeals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      
      {categories?.length > 0 && (
        <TopCate categories={categories} />
      )}
      
      {newArrivals?.length > 0 && (
        <NewArrivals
          productItems={newArrivals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      
      {discounts?.length > 0 && (
        <Discount
          productItems={discounts}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      
      {featuredCategory && featuredCategoryProducts.length > 0 && (
        <Shop
          category={featuredCategory}
          shopItems={featuredCategoryProducts}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      
      {/* Static Footer Elements */}
      <Annocument pageData={pageData} />
      <Wrapper pageData={pageData} />
    </>
  );
};

export default HomePage;
