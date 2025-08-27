"use client";

import { useSession } from "next-auth/react";
import MainLayout from "@/components/MainLayout";
import Banner from "@/components/Banner";
import OurPrograms from "@/components/ourprograms"; // Assuming this will be updated to a feature section
import Reasons from "@/components/Reasons"; // Assuming this will be updated to a feature section
import PlayStoreBanner from "@/components/PlayStoreBanner"; // Assuming this will be updated to a CTA section
import PricingTable from "@/components/pricingTable";
import Testimonials from "@/components/Testimonials";
import Join from "@/components/Join";
import Pic from "@/components/Pic";

const Home = () => {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-pink-600 via-red-500 to-yellow-400">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          <p className="text-white text-xl font-semibold mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col gap-32 lg:gap-48 overflow-x-hidden">
        {/*
          Hero Section: The main entry point to the site, designed to be visually
          stunning and immediately grab the user's attention.
        */}
        <Banner />      

        {/*
          Feature Showcase: A series of components highlighting the core benefits
          and features of the product in an engaging carousel format.
        */}
        <OurPrograms />
        
        {/*
          Feature Showcase: A series of components highlighting the core benefits
          and features of the product in an engaging carousel format.
        */}
        <Pic />

        {/*
          Social Proof: Testimonials from satisfied customers to build trust and credibility.
        */}
        <Testimonials />

        {/*
          Feature List: A more detailed look at the core reasons to choose the product.
        */}
        <Reasons />
        
        {/*
          Pricing: A clear and concise pricing table to help users make a decision.
        */}
        <PricingTable />

        {/*
          Final Call-to-Action: A compelling section to drive user sign-ups or downloads.
          This includes the Join and PlayStoreBanner components.
        */}
        <Join />
        <PlayStoreBanner />
      </div>
    </MainLayout>
  );
};

export default Home;