"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStoreContext } from "../../../../../contexts/StoreContext";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import RestaurantHero from "../components/RestaurantSite";
import SignatureDishes from "../components/SignatureDishes";
import WhyDineWithUs from "../components/WhyDineWithUs";
import Testimonials from "../components/Testimonials";
import RestaurantGallery from "../components/RestaurantGallery";
import RestaurantFAQs from "../components/RestaurantFAQs";


const dishes = [
  {
    title: "Cheese Burger",
    price: "$11.66",
    img: "/images/burger.jpg",
    desc: "Crispy chicken fillet with cheese, thousand island sauce...",
    accent: "bg-orange-500",
  },
  {
    title: "Wrap Pizza",
    price: "$12.6",
    img: "/images/pizza.jpg",
    desc: "Crispy chicken with garlic sauce, tomato, lettuce...",
    accent: "bg-purple-500",
  },
  {
    title: "Naga Subway",
    price: "$9.4",
    img: "/images/subway.jpg",
    desc: "Spicy & tangy flat chicken wrapped in whole wheat...",
    accent: "bg-teal-400",
  },
];

const features = [
  {
    title: "Fresh, Locally Sourced Ingredients.",
    img: "/images/feature1.jpg",
    bg: "bg-purple-50",
    icon: "♥️",
  },
  {
    title: "Authentic Recipes with a Modern Twist.",
    img: "/images/feature2.jpg",
    bg: "bg-amber-50",
    icon: "🍴",
  },
  {
    title: "Quick and Reliable Home Delivery.",
    img: "/images/feature3.jpg",
    bg: "bg-teal-50",
    icon: "🚚",
  },
];

const testimonials = [
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-yellow-100",
  },
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-pink-100",
  },
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-purple-100",
  },
  {
    review: "Best Salad Man! Every slice is a piece of heaven…",
    name: "Larry Alexander",
    bg: "bg-emerald-100",
  },
];


//----------------------------------------------
// Image loader (same as elsewhere)
//----------------------------------------------
const loader = ({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) => `${src}?w=${width}&q=${quality || 75}`;

//----------------------------------------------
// RestaurantSite component, now using StoreContext
//----------------------------------------------
export default function RestaurantSite() {
  const router = useRouter();
  const { storeFormData } = useStoreContext();
  const {
    name,
    slug,
    description,
    bannerUrl,
    storeCategories,
    marketplaceListings,
    // testimonials,
    faqs,
  } = storeFormData;

  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
