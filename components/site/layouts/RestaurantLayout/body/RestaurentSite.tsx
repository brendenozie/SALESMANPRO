"use client";

import React, {  } from "react";
import RestaurantHero from "../components/RestaurantSite";
import SignatureDishes from "../components/SignatureDishes";
import WhyDineWithUs from "../components/WhyDineWithUs";
import Testimonials from "../components/Testimonials";
import RestaurantGallery from "../components/RestaurantGallery";
import RestaurantFAQs from "../components/RestaurantFAQs";
import { StoreForm } from "@/types/typings";

//----------------------------------------------
// RestaurantSite component, now using StoreContext
//----------------------------------------------
export default function RestaurentSite({ pageData }: { pageData: StoreForm }) {

  return (
      <div className="relative bg-cream min-h-screen text-gray-900">
        {/* Patterned Frame */}
        <div className="fixed inset-y-0 left-0 w-8 bg-teal-200 bg-[url('/images/pattern.svg')]"></div>
        <div className="fixed inset-y-0 right-0 w-8 bg-teal-200 bg-[url('/images/pattern.svg')]"></div>

        <RestaurantHero />

        <SignatureDishes />

        <WhyDineWithUs />

        <Testimonials />
        
        <RestaurantGallery />

        <RestaurantFAQs />
        
      </div>
  );
}
