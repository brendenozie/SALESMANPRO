"use client";

import { useSession } from "next-auth/react";
import MainLayout from "@/components/MainLayout";
import Banner from "@/components/Banner";
import WhyChooseUs from "@/components/WhyChooseUs"; // Assuming this will be updated to a feature section
import PlayStoreBanner from "@/components/PlayStoreBanner"; // Assuming this will be updated to a CTA section
import PricingTable from "@/components/pricingTable";
import Testimonials from "@/components/Testimonials";
import Join from "@/components/Join";
import Pic from "@/components/Pic";
import AboutUs from "@/components/AboutUs";

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
      <div className="flex flex-col overflow-x-hidden">
        {/*
          Hero Section: The main entry point to the site, designed to be visually
          stunning and immediately grab the user's attention.
        */}
        <Banner />      

        <AboutUs />
        
        <Pic />
        
        <Testimonials />
        
        <WhyChooseUs />
        
        <PricingTable />
        
        <Join />

        <PlayStoreBanner />
      </div>
    </MainLayout>
  );
};

export default Home;