"use client";

import React, { useState, useMemo, useEffect, ChangeEvent } from "react";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  EyeIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import PreviewModal from "../PreviewModal/PreviewModal";

interface CategoryVariant {
  name: string;
  link: string;
  description: string;
  tag: "New" | "Popular" | "Standard";
}

interface Category {
  name: string;
  icon?: string;
  variants: CategoryVariant[];
}

export interface CategorySelectProps {
  category: string;
  variant?: string | null | undefined;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const SITE_CATEGORIES: Category[] = [
  { 
    name: "E-commerce", 
    icon: "🛒", 
    variants: [
      { name: "Modern Shop (v1)", link: "https://duka-yangu.salesmanpro.site", description: "Sleek design for apparel and accessories.", tag: 'Popular' },
      { name: "Modern Furniture Store", link: "https://furniture.salesmanpro.site", description: "Contemporary furniture designs.", tag: 'Standard' },
      { name: "Modern Fashion Store", link: "https://fashion.salesmanpro.site", description: "Trendy and stylish clothing designs.", tag: 'Standard' },
      { name: "Business Directory", link: "https://directory-listings.salesmanpro.site", description: "List businesses and services.", tag: 'Standard' },
      { name: "Food Delivery", link: "https://restaurant-food-delivery.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard' },
      { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard' },
      { name: "Agrovet Store", link: "https://agrovet.salesmanpro.site", description: "Optimized for agricultural products and supplies.", tag: 'New' },
      { name: "Gaming Store", link: "https://gaming-store.salesmanpro.site", description: "Designed for gaming products and accessories.", tag: 'New' },
      { name: "Earphones Store", link: "https://earphones-store.salesmanpro.site", description: "Showcase earphones and audio accessories.", tag: 'New' },
      { name: "Bike Store", link: "https://bike-store.salesmanpro.site", description: "Showcase bikes and cycling accessories.", tag: 'New' },
      { name: "Motorcycle Store", link: "https://motorcycle-store.salesmanpro.site", description: "Showcase motorcycles and accessories.", tag: 'New' },
      { name: "Glasses Store", link: "https://glasses-store.salesmanpro.site", description: "Showcase eyewear and accessories.", tag: 'New' },
      { name: "Flowers Store", link: "https://flowers-store.salesmanpro.site", description: "Showcase floral arrangements and gifts.", tag: 'New' },
      { name: "Honey Store", link: "https://honey-store.salesmanpro.site", description: "Showcase honey and related products.", tag: 'New' },
      { name: "Peanuts Store", link: "https://peanuts-store.salesmanpro.site", description: "Showcase peanuts and related snacks.", tag: 'New' },
      { name: "Watch Store", link: "https://watch-store.salesmanpro.site", description: "Showcase watches and timepieces.", tag: 'New' },
      { name: "Baby Store", link: "https://baby-store.salesmanpro.site", description: "Showcase baby products and essentials.", tag: 'New' },
      { name: "Cake Store", link: "https://cake-store.salesmanpro.site", description: "Showcase cakes and baked goods.", tag: 'New' },
      { name: "Pets Store", link: "https://pets-store.salesmanpro.site", description: "Showcase pet products and supplies.", tag: 'New' },
      { name: "Groceries Store", link: "https://groceries-store.salesmanpro.site", description: "Showcase groceries and household items.", tag: 'New' },
      // { name: "Digital Goods Store (v2)", link: "https://digital-shop.salesmanpro.site", description: "Optimized for selling software and courses.", tag: 'New' },
      // { name: "Artisan Marketplace (v3)", link: "https://artisan-shop.salesmanpro.site", description: "Focuses on handcrafted and unique items.", tag: 'Standard' },
    ]
  },
  {
    name: "Furniture Shop",
    icon: "🛋️",
    variants: [
      { name: "Modern Furniture Store", link: "https://furniture.salesmanpro.site", description: "Contemporary furniture designs.", tag: 'Standard' }
    ]
  },
  {
    name: "Fashion Shop",
    icon: "👗",
    variants: [
      { name: "Modern Fashion Store", link: "https://fashion.salesmanpro.site", description: "Trendy and stylish clothing designs.", tag: 'Standard' }
    ]
  },
  { 
    name: "Consultant & Coach", 
    icon: "💡", 
    variants: [
      { name: "Executive Coach (v1)", link: "https://flourishhub.salesmanpro.site", description: "Professional, high-conversion landing page.", tag: 'Popular' },
      // { name: "Wellness Retreat (v2)", link: "https://wellness-coach.salesmanpro.site", description: "Calm and inviting design for wellness services.", tag: 'Standard' },
    ]
  },
  {
    name : "Agrovet Store",
    icon: "🌾",
    variants: [
      { name: "Agrovet Store", link: "https://agrovet.salesmanpro.site", description: "Optimized for agricultural products and supplies.", tag: 'New' }
    ]
  },  
  {
    name: "Gaming Store",
    icon: "🎮",
    variants: [
      { name: "Gaming Store", link: "https://gaming-store.salesmanpro.site", description: "Designed for gaming products and accessories.", tag: 'New' }
    ]
  },
  {
    name: "Earphones Store",
    icon: "🎧",
    variants: [
      { name: "Earphones Store", link: "https://earphones-store.salesmanpro.site", description: "Showcase earphones and audio accessories.", tag: 'New' }
    ]
  },
  {
    name: "Bike Store",
    icon: "🚲",
    variants: [
      { name: "Bike Store", link: "https://bike-store.salesmanpro.site", description: "Showcase bikes and cycling accessories.", tag: 'New' }
    ]
  },
  {
    name: "Motorcycle Store",
    icon: "🏍️",
    variants: [
      { name: "Motorcycle Store", link: "https://motorcycle-store.salesmanpro.site", description: "Showcase motorcycles and accessories.", tag: 'New' }
    ]
  },
  {
  name: "Glasses Store",
  icon: "👓",
  variants: [   
        { name: "Glasses Store", link: "https://glasses-store.salesmanpro.site", description: "Showcase eyewear and accessories.", tag: 'New' },
      ]
  },
  { 
    name: "Flowers Store",
    icon: "🌸",
    variants: [
      { name: "Flowers Store", link: "https://flowers-store.salesmanpro.site", description: "Showcase floral arrangements and gifts.", tag: 'New' }
    ]
  },
  {
    name: "Honey Store",
    icon: "🍯",
    variants: [{ name: "Honey Store", link: "https://honey-store.salesmanpro.site", description: "Showcase honey and related products.", tag: 'New' }]
  },
  {
    name: "Peanuts Store",
    icon: "🥜",
    variants: [{ name: "Peanuts Store", link: "https://peanuts-store.salesmanpro.site", description: "Showcase peanuts and related snacks.", tag: 'New' }],
  },
  { 
    name: "Watch Store", 
    icon: "⌚", 
    variants: [
      { name: "Watch Store", link: "https://watch-store.salesmanpro.site", description: "Showcase watches and timepieces.", tag: 'New' }
    ]
  },
  {
    name: "Baby Store",
    icon: "👶",
    variants: [{ name: "Baby Store", link: "https://baby-store.salesmanpro.site", description: "Showcase baby products and essentials.", tag: 'New' }],
  },
  { 
    name: "Cake Store",
    icon: "🎂",
    variants: [
      { name: "Cake Store", link: "https://cake-store.salesmanpro.site", description: "Showcase cakes and baked goods.", tag: 'New' }
    ]
  },
  {
    name: "Pets Store",
    icon: "🐶",
    variants: [{ name: "Pets Store", link: "https://pets-store.salesmanpro.site", description: "Showcase pet products and supplies.", tag: 'New' }],
  },
  { 
    name: "Groceries Store",
    icon: "🛒",
    variants: [
      { name: "Groceries Store", link: "https://groceries-store.salesmanpro.site", description: "Showcase groceries and household items.", tag: 'New' }
    ]
  },
 { name: "Public Speaking", 
    icon: "🎙️", 
    variants: [
      { name: "Standard Speaker Site", link: "https://flourishhub-2.salesmanpro.site", description: "Bookings and media focus.", tag: 'Standard' }
    ] 
  },
  { 
      name: "Shoes Store", icon: "👟", variants: [
      { name: "Shoes Store Classic", link: "https://shoes-store.salesmanpro.site", description: "Grid-based product layout.", tag: 'Standard' }
    ] 
  },
  { name: "Service Provider", 
    icon: "🔧", variants: [
      { 
        name: "Agency Portfolio", link: "https://service-provider.salesmanpro.site", description: "Showcase services and case studies.", tag: 'Popular' 
      }
    ] 
  },
  { name: "Booking & Appointments", 
    icon: "📅", 
    variants: [
      { name: "Scheduler Hub", link: "https://booking.salesmanpro.site", description: "Integrated calendar for easy booking.", tag: 'Standard' },
      { name: "Barbershop Store", link:"https://barbershop.salesmanpro.site", description: "Booking-focused design for barbershops.", tag: 'New' }   ] 
  },
  { name: "Portfolio & Personal Branding", 
    icon: "👤", 
    variants: [
      { name: "Creative CV", link: "https://portfolio-personal-branding.salesmanpro.site", description: "Minimalist design for designers/writers.", tag: 'New' }
    ] 
  },
  { 
    name: "Blog & Content", 
    icon: "✍️", variants: 
    [{ name: "Modern Magazine", link: "https://blog-content.salesmanpro.site", description: "High-readability blog layout.", tag: 'Popular' }

    ] 
  },
    { name: "Nonprofit & Community",
      icon: "🤝",
      variants: [
        { name: "Charity Connect", link: "https://nonprofit-community.salesmanpro.site", description: "Donation-focused design.", tag: 'Standard' }
      ]
    },
    { name: "Healthcare & Clinics",
      icon: "🏥",
      variants: [
        { name: "Clinic Pro", link: "https://healthcare-clinics.salesmanpro.site", description: "Patient-focused design.", tag: 'Standard' }
      ]
    },
    { name: "Media & Entertainment",
      icon: "🎬",
      variants: [
        { name: "Film Studio", link: "https://media-entertainment.salesmanpro.site", description: "Showcase your films and projects.", tag: 'Standard' }
      ]
    },
    { name: "Finance & Legal",
      icon: "💼",
      variants: [
        { name: "Financial Advisor", link: "https://finance-legal.salesmanpro.site", description: "Professional services for finance experts.", tag: 'Standard' }
      ]
    },
    { name: "Automotive",
      icon: "🚗",
      variants: [
        { name: "Car Dealership", link: "https://automotive.salesmanpro.site", description: "Showcase your vehicles and services.", tag: 'Standard' }
      ]
    },
    { name: "Travel & Tourism",
      icon: "✈️",
      variants: [
        { name: "Travel Agency", link: "https://travel-tourism.salesmanpro.site", description: "Promote travel packages and services.", tag: 'Standard' }
      ]
    },
    { name: "Fitness & Wellness",
      icon: "🏋️‍♂️",
      variants: [
        { name: "Gym & Fitness", link: "https://fitness-wellness.salesmanpro.site", description: "Showcase fitness programs and classes.", tag: 'Standard' }
      ]
    },
    { name: "Directory & Listings",
      icon: "📂",
      variants: [
        { name: "Business Directory", link: "https://directory-listings.salesmanpro.site", description: "List businesses and services.", tag: 'Standard' }
      ]
    },
    { name: "Educational & Online Courses",
      icon: "📚",
      variants: [
        { name: "Online Learning", link: "https://educational-online-courses.salesmanpro.site", description: "Promote online courses and resources.", tag: 'Standard' },
        { name: "Courses Layout 2", link: "https://courses-layout-2.salesmanpro.site", description: "Alternate design for online courses.", tag: 'Standard' },
        { name: "Courses Layout 3", link: "https://courses-layout-3.salesmanpro.site", description: "Another design for online courses.", tag: 'Standard' },
      ]
    },
    { name: "Restaurant & Food Delivery",
      icon: "🍔",
      variants: [
        { name: "Food Delivery", link: "https://restaurant-food-delivery.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard' }
      ]
    },
    { name: "Event & Ticketing",
      icon: "🎟️",
      variants: [
        { name: "Event Booking", link: "https://event-ticketing.salesmanpro.site", description: "Manage events and ticket sales.", tag: 'Standard' }
      ]
    },
    { name: "Real Estate",
      icon: "🏠",
      variants: [
        { name: "Property Listings", link: "https://real-estate.salesmanpro.site", description: "Showcase real estate properties.", tag: 'Standard' }
      ]
    },
    {
      name: "Property Management",
      icon: "🏥",
      variants: [
        { name: "Property Manager", link: "https://property-management.salesmanpro.site", description: "Manage properties and tenants.", tag: 'Standard' }
      ]
     },
    // { name: "SaaS & Web Apps",
    //   icon: "💻",
    //   variants: [
    //     { name: "App Landing Page", link: "https://saas.salesmanpro.site", description: "Promote your SaaS application.", tag: 'Standard' }
    //   ]
    // },
    { name: "Marketplace",
      icon: "🛍️",
      variants: [
        { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard' }
      ]
    },
    {
      name: "Security",
      icon: "🔒",
      variants: [
        { name: "Security Services", link: "https://security-services.salesmanpro.site", description: "Protect your assets and data.", tag: 'Standard' },
        { name: "Security Consulting", link: "https://security-services-2.salesmanpro.site", description: "Security Consulting site.", tag: 'Standard'},
      ]
    },
    {
      name: "Delivery & Logistics",
      icon: "🚚",
      variants: [
        { name: "Delivery Service", link: "https://delivery-logistics.salesmanpro.site", description: "Manage deliveries and logistics.", tag: 'Standard' }
      ]
    }
    // { name: "Other",
    //   icon: "🌐",
    //   variants: [
    //     { name: "General Purpose Site", link: "https://other.salesmanpro.site", description: "A flexible starting point.", tag: 'Standard' }
    //   ]
    // },
];

//  "E-commerce",
//   "Public Speaking",
//   "Consultant & Coach",
//   "Shoes Store",
//   "Service Provider",
//   "Booking & Appointments",
//   "Portfolio & Personal Branding",
//   "Blog & Content",
//   "Directory & Listings",
//   "Educational & Online Courses",
//   "Nonprofit & Community",
//   "Restaurant & Food Delivery",
//   "Event & Ticketing",
//   "Real Estate",
//   "Healthcare & Clinics",
//   "SaaS & Web Apps",
//   "Media & Entertainment",
//   "Finance & Legal",
//   "Automotive",
//   "Travel & Tourism",
//   "Fitness & Wellness",
//   "Marketplace",
//   "Tutors",
//   "Lecturer",
//   "Teacher",
//   "Students",
//   "Pupils",
//   "Principal",
//   "School Head",
//   "Other",

const PreviewSkeleton = () => (
  <motion.div
    key="skeleton"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="flex-1 bg-gray-50 p-8 space-y-4 animate-pulse overflow-hidden"
  >
    <div className="h-8 w-2/3 bg-gray-200 rounded-lg mb-6"></div>
    <div className="h-6 w-5/6 bg-gray-100 rounded"></div>
    <div className="h-40 w-full bg-gray-200 rounded-xl"></div>
    <div className="grid grid-cols-3 gap-4">
      <div className="h-20 bg-gray-100 rounded-lg"></div>
      <div className="h-20 bg-gray-100 rounded-lg"></div>
      <div className="h-20 bg-gray-100 rounded-lg"></div>
    </div>
  </motion.div>
);

// components/CategoryStep.tsx
// import {
//   ChangeEvent,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import {
//   InformationCircleIcon,
//   MagnifyingGlassIcon,
//   ChevronRightIcon,
//   EyeIcon, // <-- Added this
// } from "@heroicons/react/24/solid";
// import PreviewModal from "./PreviewModal"; // <-- Import the modal
// // Import your types and constants
// // import { SITE_CATEGORIES, CategorySelectProps } from './your-types';


// import React, { useState, useEffect, useMemo, ChangeEvent } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// // Assuming you have these icons imported from a library like heroicons
// import { 
//   MagnifyingGlassIcon, 
//   InformationCircleIcon, 
//   ChevronRightIcon, 
//   EyeIcon, 
//   SparklesIcon // Added for a more engaging title icon
// } from '@heroicons/react/24/outline'; 

// --- DUMMY PROPS/DATA TYPES (Replace with your actual types/imports) ---
// type CategorySelectProps = any; 
// type PreviewModalProps = any;
// const SITE_CATEGORIES = [ ... ]; // Your actual data array
// const PreviewModal = ({ isOpen, onClose, url, name }: PreviewModalProps) => (
//   <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isOpen ? 'block' : 'hidden'}`}>
//     {/* Modal Content */}
//   </div>
// ); 
// --- END DUMMY ---

// import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
// Assuming you have these imports for types, data, and components
// import { CategorySelectProps, SITE_CATEGORIES } from 'your-data-source'; 
// import PreviewModal from './PreviewModal'; 
// import { motion, AnimatePresence } from 'framer-motion';
// import { MagnifyingGlassIcon, SparklesIcon, InformationCircleIcon, ChevronRightIcon, EyeIcon } from '@heroicons/react/24/outline'; 

// NOTE: I am assuming your SITE_CATEGORIES, CategorySelectProps, 
// PreviewModal, and icon imports are correctly set up.
// I've kept the logic (useEffect, useMemo, handlers) identical as requested.

export default function CategoryStep({
  category,
  variant,
  handleChange,
}: CategorySelectProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Logic (Unchanged) ---
  const selectedCategory = SITE_CATEGORIES.find(
    (c) => c.name === category
  );
  const selectedTemplate = selectedCategory?.variants.find(
    (v) => v.name === variant
  );

  useEffect(() => {
    if (selectedCategory && !variant) {
      const defaultVariant = selectedCategory.variants[0];
      if (defaultVariant) {
        handleChange({
          target: { name: "variant", value: defaultVariant.name } as HTMLSelectElement,
        } as ChangeEvent<HTMLSelectElement>);
      }
    }
  }, [selectedCategory, variant, handleChange]);

  const filteredCategories = useMemo(
    () =>
      SITE_CATEGORIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );
  
  const handleVariantSelect = (categoryName: string, variantName: string) => {
    handleChange({
      target: { name: 'category', value: categoryName } as HTMLSelectElement
    } as ChangeEvent<HTMLSelectElement>);
    handleChange({
      target: { name: 'variant', value: variantName } as HTMLSelectElement
    } as ChangeEvent<HTMLSelectElement>);
  };

  const handlePreviewClick = () => {
    if (selectedTemplate) {
      setIsModalOpen(true);
    }
  };
  // --- End Logic ---

  return (
    <>
      <section 
        // Mobile-friendly full width, larger desktop max-width
        className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto" 
        role="region" 
        aria-label="Template and Category Selection"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10 border border-gray-100"> 
          
          {/* Header - Bolder headline and clear instruction */}
          <header className="mb-6 text-center">
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex flex-col sm:flex-row items-center justify-center gap-2"
            >
              <SparklesIcon className="h-7 w-7 text-indigo-500 flex-shrink-0" />
              Choose Your <span className="text-indigo-600">Perfect Template</span>
            </motion.h2>
            <p className="mt-2 text-md sm:text-lg text-gray-600 flex items-center justify-center">
              <InformationCircleIcon className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
              Step 1: Pick your category. Step 2: Select a template variant.
            </p>
          </header>

          {/* Sticky Search and Category Header for mobile - BETTER UX */}
          <div className="sticky top-0 z-10 bg-white pt-2 pb-4 border-b border-gray-200">
            {/* Search - Visually clean and accessible */}
            <div className="mb-4 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search categories" 
                className="w-full pl-12 pr-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition shadow-lg shadow-gray-100/50" 
              />
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex justify-between items-center">
              Business Categories 
              <span className="text-indigo-600 font-semibold text-sm bg-indigo-100 px-3 py-1 rounded-full">
                {filteredCategories.length} Available
              </span>
            </h3>
          </div>
          
          {/* Category List - Mobile-first grid (2 columns) */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-4" 
            role="radiogroup"
            aria-label="Site categories"
          >
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategory?.name === cat.name;
              return (
                <motion.button
                  key={cat.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(99, 102, 241, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    handleVariantSelect(cat.name, cat.variants[0].name)
                  }
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1} 
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 h-28 sm:h-36 text-sm rounded-2xl border-2 transition duration-300 ease-in-out font-semibold text-center leading-tight ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-xl ring-4 ring-indigo-300" 
                      : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                  }`}
                >
                  <span className="text-3xl sm:text-5xl mb-1 transition duration-300">{cat.icon}</span> 
                  <span className="mt-1 text-xs sm:text-sm">{cat.name}</span>
                </motion.button>
              );
            })}
          </div>

          {/* VARIANTS (With Preview Button Added) */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                key="variant-selector"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                className="p-4 sm:p-6 bg-indigo-50 rounded-2xl shadow-inner border border-indigo-200 mt-8" 
              >
                <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
                  <ChevronRightIcon className="h-6 w-6 mr-2 text-indigo-600 flex-shrink-0" />
                  Template Variants for <span className='text-indigo-900 ml-1'>{selectedCategory.name}</span>:
                </h3>
                
                {/* Variant selection list - Horizontal Scroll, full bleed on mobile */}
                <div 
                  // Use negative margin/padding for full-bleed horizontal scroll on mobile
                  className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar-horizontal" 
                  role="radiogroup"
                  aria-label="Template variants for selected category"
                >
                  {selectedCategory.variants.map((variantl) => {
                    const isVariantSelected = variantl.name === variant; 
                    let tagColor = "";
                    let tagBg = "";
                    if (variantl.tag === "New") {
                      tagColor = "text-green-800";
                      tagBg = "bg-green-200";
                    } else if (variantl.tag === "Popular") {
                      tagColor = "text-orange-800";
                      tagBg = "bg-orange-200";
                    }

                    return (
                      <motion.button
                        key={variantl.name}
                        onClick={() =>
                          handleVariantSelect(selectedCategory.name, variantl.name)
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        role="radio"
                        aria-checked={isVariantSelected}
                        tabIndex={isVariantSelected ? 0 : -1} 
                        className={`group flex-shrink-0 px-4 sm:px-5 py-2 text-sm sm:text-base rounded-full font-medium transition duration-200 whitespace-nowrap border-2 ${
                          isVariantSelected
                            ? "bg-indigo-600 text-white border-indigo-700 shadow-xl ring-4 ring-indigo-400 focus:outline-none"
                            : "bg-white text-gray-800 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        }`}
                      >
                        {variantl.name}
                        {variantl.tag && (
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full transition duration-200 ${
                              isVariantSelected 
                                ? "bg-white/30 text-white" 
                                : `${tagBg} ${tagColor}`
                            }`}
                          >
                            {variantl.tag}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Description and Preview - Stacked on Mobile */}
                {selectedTemplate && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.1 }}
                    className="mt-6 p-4 bg-white rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200"
                  >
                    <p className="text-sm text-gray-700">
                      <strong className="text-indigo-600">Variant Focus:</strong> {selectedTemplate.description}
                    </p>
                    
                    {/* Preview Button - Full width on mobile, consistent style */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePreviewClick}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-50"
                    >
                      <EyeIcon className="h-5 w-5" />
                      View Live Preview
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </section>

      {/* RENDER THE MODAL */}
      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={selectedTemplate?.link || ""}
        name={selectedTemplate?.name || ""}
      />
    </>
  );
}

// export default function CategoryStep({
//   category,
//   variant,
//   handleChange,
// }: CategorySelectProps) {
//   const [search, setSearch] = useState("");
//   const [showIframe, setShowIframe] = useState(false);

//   const selectedCategory = SITE_CATEGORIES.find(
//     (c) => c.name === category
//   );
//   const selectedTemplate = selectedCategory?.variants.find(
//     (v) => v.name === variant
//   );
//   // Auto-select the first variant when category changes and no variant is set
//   useEffect(() => {
//     if (selectedCategory && !variant) {
//       const defaultVariant = selectedCategory.variants[0];
//       if (defaultVariant) {
//         handleChange({
//           target: { name: "variant", value: defaultVariant.name } as HTMLSelectElement,
//         } as ChangeEvent<HTMLSelectElement>);
//       }
//     }
//   }, [selectedCategory, variant, handleChange]);


//   const filteredCategories = useMemo(
//     () =>
//       SITE_CATEGORIES.filter((c) =>
//         c.name.toLowerCase().includes(search.toLowerCase())
//       ),
//     [search]
//   );

//   useEffect(() => {
//     if (selectedTemplate) {
//       setShowIframe(false);
//       const timeout = setTimeout(() => setShowIframe(true), 800);
//       return () => clearTimeout(timeout);
//     }
//   }, [selectedTemplate?.link]);

//   const handleVariantSelect = (categoryName: string, variantName: string) => {
//     // handleChange({ target: { name: "category", value: categoryName } } as any);
//     // handleChange({ target: { name: "variant", value: variantName } } as any);

//     handleChange({
//       target: { name: 'category', value: categoryName } as HTMLSelectElement
//     } as ChangeEvent<HTMLSelectElement>);
//     handleChange({
//       target: { name: 'variant', value: variantName } as HTMLSelectElement
//     } as ChangeEvent<HTMLSelectElement>);
//   };

//   return (
//     <section 
//       className="mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8"
//       // ACCESSIBILITY IMPROVEMENT: Adding a clear context role for the screen reader
//       role="region" 
//       aria-label="Template and Category Selection"
//     >
//       {/* LEFT PANEL: CATEGORY SELECTION */}
//       <div className="lg:col-span-1">
//         <header className="mb-6">
//           <h2 className="text-3xl font-extrabold text-gray-900">
//             Select Your Business <span className="text-indigo-600">Focus</span>
//           </h2>
//           <p className="mt-2 text-gray-600 flex items-start">
//             <InformationCircleIcon className="h-5 w-5 text-indigo-500 mr-2 mt-1 flex-shrink-0" />
//             Pick a category to see its template variants.
//           </p>
//         </header>

//         {/* Search */}
//         <div className="mb-4 relative">
//           <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search categories..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             // A11Y IMPROVEMENT: Added aria-label for clear search context
//             aria-label="Search categories" 
//             className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition shadow-lg shadow-gray-50/10"
//           />
//         </div>
        
//         {/* Category List */}
//         <div 
//             className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar"
//             // A11Y IMPROVEMENT: Treating this as a button group selection
//             role="radiogroup"
//             aria-label="Site categories"
//         >
//           {filteredCategories.map((cat) => {
//             const isSelected = selectedCategory?.name === cat.name;
//             return (
//               <motion.button
//                 key={cat.name}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 onClick={() =>
//                   // NOTE: Ensure handleVariantSelect is updated to take both category and variant
//                   handleVariantSelect(cat.name, cat.variants[0].name)
//                 }
//                 // A11Y IMPROVEMENT: Keyboard access and ARIA roles for buttons
//                 role="radio"
//                 aria-checked={isSelected}
//                 tabIndex={isSelected ? 0 : -1} // Only selected item is directly focusable in radiogroup
//                 className={`flex flex-col items-center justify-center p-3 h-28 text-sm rounded-xl border-2 transition duration-200 ease-in-out font-medium ${
//                   isSelected
//                     ? "bg-indigo-600 border-indigo-700 text-white shadow-xl ring-4 ring-indigo-300/50"
//                     : "bg-white border-gray-200 text-gray-800 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" // Added focus ring
//                 }`}
//               >
//                 <span className="text-3xl mb-1">{cat.icon}</span>
//                 <span>{cat.name}</span>
//               </motion.button>
//             );
//           })}
//         </div>

//         {/* VARIANTS */}
//         <AnimatePresence>
//           {selectedCategory && (
//             <motion.div
//               key="variant-selector"
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               transition={{ duration: 0.3 }}
//               className="p-4 bg-white rounded-xl shadow-lg border border-indigo-100 mt-6"
//             >
//               <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
//                 <ChevronRightIcon className="h-5 w-5 mr-2 text-indigo-500" />
//                 Choose a Template Variant:
//               </h3>
//               {/* VISUAL POLISH: Added padding to the side for the scrollable container on mobile to match parent padding */}
//               <div 
//                 className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar-horizontal"
//                 role="radiogroup"
//                 aria-label="Template variants for selected category"
//               >
//                 {selectedCategory.variants.map((variantl) => {
//                   // NOTE: Assuming 'variant' is the currently selected variant name state
//                   const isVariantSelected = variantl.name === variant; 
//                   let tagColor = "";
//                   if (variantl.tag === "New")
//                     tagColor = "bg-green-100 text-green-700";
//                   else if (variantl.tag === "Popular")
//                     tagColor = "bg-orange-100 text-orange-700";

//                   return (
//                     <motion.button
//                       key={variantl.name}
//                       onClick={() =>
//                         handleVariantSelect(selectedCategory.name, variantl.name)
//                       }
//                       whileHover={{ scale: 1.05 }}
//                       whileTap={{ scale: 0.98 }}
//                       role="radio"
//                       aria-checked={isVariantSelected}
//                       tabIndex={isVariantSelected ? 0 : -1} // Only selected item is directly focusable
//                       className={`flex-shrink-0 px-4 py-2 text-sm rounded-full font-medium transition duration-200 whitespace-nowrap border-2 ${
//                         isVariantSelected
//                           ? "bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500" // Enhanced focus ring for selected
//                           : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" // Added focus ring for unselected
//                       }`}
//                     >
//                       {variantl.name}
//                       {variantl.tag && (
//                         <span
//                           className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${tagColor} ${
//                             isVariantSelected ? "bg-white/20 text-white" : ""
//                           }`}
//                         >
//                           {variantl.tag}
//                         </span>
//                       )}
//                     </motion.button>
//                   );
//                 })}
//               </div>

//               {selectedTemplate && (
//                 <p className="mt-4 text-sm text-gray-600 border-t pt-3">
//                   <strong>Focus:</strong> {selectedTemplate.description}
//                 </p>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* RIGHT PANEL: LIVE PREVIEW */}
//       <motion.div
//         key={selectedTemplate?.name || "placeholder"}
//         layout
//         className="mt-8 lg:mt-0 lg:col-span-2 bg-white overflow-hidden "
//       >
//         <h3 className="text-2xl font-bold mb-2 text-gray-800">
//           {selectedTemplate
//             ? `Preview: ${selectedTemplate.name}`
//             : "Template Preview Area"}
//         </h3>
//         {selectedCategory && (
//           <p className="text-sm text-gray-500 mb-4">
//             Category: {selectedCategory.name}
//           </p>
//         )}

//         <div className="h-[50vh] lg:h-[75vh] rounded-2xl overflow-hidden border-4 border-gray-100 flex flex-col">
//           {selectedTemplate ? (
//             <>
//               {/* Browser Bar */}
//               <div className="bg-gray-100 p-3 flex items-center justify-between shadow-md">
//                 <div className="flex items-center space-x-2">
//                   <div className="h-3 w-3 rounded-full bg-red-400"></div>
//                   <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
//                   <div className="h-3 w-3 rounded-full bg-green-400"></div>
//                 </div>

//                 <span className="text-sm font-medium bg-white rounded-full px-4 py-1 border border-gray-200 max-w-[150px] sm:max-w-md truncate">
//                   <LinkIcon className="h-4 w-4 mr-1 inline-block text-indigo-600" />
//                   <a
//                     href={selectedTemplate.link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="hover:underline truncate text-indigo-600"
//                     // A11Y IMPROVEMENT: Added aria-label for external link
//                     aria-label={`Open ${selectedTemplate.name} link in a new tab`}
//                   >
//                     {selectedTemplate.link
//                       .replace("https://", "")
//                       .replace("http://", "")
//                       .split("/")[0]}
//                   </a>
//                 </span>

//                 <a
//                   href={selectedTemplate.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-xs text-indigo-600 font-semibold flex items-center hover:text-indigo-800 transition hidden sm:flex"
//                   aria-label={`Open ${selectedTemplate.name} link in a new tab`}
//                 >
//                   Full Screen <ArrowRightIcon className="h-4 w-4 ml-1" />
//                 </a>
//               </div>

//               {/* Iframe */}
//               <AnimatePresence mode="wait">
//                 {showIframe ? (
//                   <motion.iframe
//                     key="iframe-live"
//                     src={selectedTemplate.link}
//                     // A11Y IMPROVEMENT: Title is crucial for iframes
//                     title={`${selectedTemplate.name} Live Template Preview`} 
//                     className="flex-1 w-full h-full border-0 bg-white"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     exit={{ opacity: 0 }}
//                     transition={{ duration: 0.5 }}
//                     loading="lazy"
//                   />
//                 ) : (
//                   <PreviewSkeleton />
//                 )}
//               </AnimatePresence>
//             </>
//           ) : (
//             <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 text-center p-10 border border-dashed border-gray-300 rounded-xl m-4">
//               <MagnifyingGlassIcon className="h-10 w-10 text-gray-400 mb-3" />
//               <p className="text-lg font-semibold text-gray-700">
//                 Explore Templates
//               </p>
//               <p className="mt-1">
//                 Click a variant on the left to preview its design.
//               </p>
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </section>
//   );
// }
