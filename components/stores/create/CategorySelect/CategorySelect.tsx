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
  CheckBadgeIcon,
  ArrowLeftIcon,  
  RectangleGroupIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import PreviewModal from "../PreviewModal/PreviewModal";

interface CategoryVariant {
  name: string;
  link: string;
  description: string;
  tag: "New" | "Popular" | "Standard";
  desktopPreviewImage?: string; // Optional field for preview image URL
  mobilePreviewImage?: string; // Optional field for mobile preview image URL
}

interface Category {
  name: string;
  icon?: string;
  variants: CategoryVariant[];
}

export interface CategorySelectProps {
  siteCategories: any[]; // New prop for site categories
  category: string;
  variant?: string | null | undefined;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

const SITE_CATEGORIES: Category[] = [
  { 
    name: "E-commerce", 
    icon: "🛒", 
    variants: [
      { name: "Modern Shop (v1)", link: "https://duka-yangu.salesmanpro.site", description: "Sleek design for apparel and accessories.", tag: 'Popular',desktopPreviewImage: 'https://example.com/modern-shop-v1.jpg' },
      { name: "Modern Furniture Store", link: "https://furniture.salesmanpro.site", description: "Contemporary furniture designs.", tag: 'Standard',desktopPreviewImage: 'https://example.com/modern-furniture-store.jpg' },
      { name: "Modern Fashion Store", link: "https://fashion.salesmanpro.site", description: "Trendy and stylish clothing designs.", tag: 'Standard',desktopPreviewImage: 'https://example.com/modern-fashion-store.jpg' },
      { name: "Business Directory", link: "https://directory-listings.salesmanpro.site", description: "List businesses and services.", tag: 'Standard',desktopPreviewImage: 'https://example.com/business-directory.jpg' },
      { name: "Food Delivery", link: "https://restaurant-food-delivery.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard',desktopPreviewImage: 'https://example.com/food-delivery.jpg' },
      { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard',desktopPreviewImage: 'https://example.com/product-marketplace.jpg' },
      { name: "Agrovet Store", link: "https://agrovet.salesmanpro.site", description: "Optimized for agricultural products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/agrovet-store.jpg' },
      { name: "Gaming Store", link: "https://gaming-store.salesmanpro.site", description: "Designed for gaming products and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/gaming-store.jpg' },
      { name: "Earphones Store", link: "https://earphones-store.salesmanpro.site", description: "Showcase earphones and audio accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/earphones-store.jpg' },
      { name: "Bike Store", link: "https://bike-store.salesmanpro.site", description: "Showcase bikes and cycling accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/bike-store.jpg' },
      { name: "Motorcycle Store", link: "https://motorcycle-store.salesmanpro.site", description: "Showcase motorcycles and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/motorcycle-store.jpg' },
      { name: "Glasses Store", link: "https://glasses-store.salesmanpro.site", description: "Showcase eyewear and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/glasses-store.jpg' },
      { name: "Flowers Store", link: "https://flowers-store.salesmanpro.site", description: "Showcase floral arrangements and gifts.", tag: 'New', desktopPreviewImage: 'https://example.com/flowers-store.jpg' },
      { name: "Honey Store", link: "https://honey-store.salesmanpro.site", description: "Showcase honey and related products.", tag: 'New', desktopPreviewImage: 'https://example.com/honey-store.jpg' },
      { name: "Peanuts Store", link: "https://peanuts-store.salesmanpro.site", description: "Showcase peanuts and related snacks.", tag: 'New', desktopPreviewImage: 'https://example.com/peanuts-store.jpg' },
      { name: "Watch Store", link: "https://watch-store.salesmanpro.site", description: "Showcase watches and timepieces.", tag: 'New', desktopPreviewImage: 'https://example.com/watch-store.jpg' },
      { name: "Baby Store", link: "https://baby-store.salesmanpro.site", description: "Showcase baby products and essentials.", tag: 'New', desktopPreviewImage: 'https://example.com/baby-store.jpg' },
      { name: "Cake Store", link: "https://cake-store.salesmanpro.site", description: "Showcase cakes and baked goods.", tag: 'New', desktopPreviewImage: 'https://example.com/cake-store.jpg' },
      { name: "Pets Store", link: "https://pets-store.salesmanpro.site", description: "Showcase pet products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/pets-store.jpg' },
      { name: "Groceries Store", link: "https://groceries-store.salesmanpro.site", description: "Showcase groceries and household items.", tag: 'New', desktopPreviewImage: 'https://example.com/groceries-store.jpg' },
      // { name: "Digital Goods Store (v2)", link: "https://digital-shop.salesmanpro.site", description: "Optimized for selling software and courses.", tag: 'New' },
      // { name: "Artisan Marketplace (v3)", link: "https://artisan-shop.salesmanpro.site", description: "Focuses on handcrafted and unique items.", tag: 'Standard' },
    ]
  },
  {
    name: "Furniture Shop",
    icon: "🛋️",
    variants: [
      { name: "Modern Furniture Store", link: "https://furniture.salesmanpro.site", description: "Contemporary furniture designs.", tag: 'Standard', desktopPreviewImage: 'https://example.com/modern-furniture-store.jpg' }
    ]
  },
  {
    name: "Fashion Shop",
    icon: "👗",
    variants: [
      { name: "Modern Fashion Store", link: "https://fashion.salesmanpro.site", description: "Trendy and stylish clothing designs.", tag: 'Standard', desktopPreviewImage: 'https://example.com/modern-fashion-store.jpg' }
    ]
  },
  { 
    name: "Consultant & Coach", 
    icon: "💡", 
    variants: [
      { name: "Executive Coach (v1)", link: "https://flourishhub.salesmanpro.site", description: "Professional, high-conversion landing page.", tag: 'Popular', desktopPreviewImage: 'https://example.com/executive-coach-v1.jpg' },
      // { name: "Wellness Retreat (v2)", link: "https://wellness-coach.salesmanpro.site", description: "Calm and inviting design for wellness services.", tag: 'Standard' },
    ]
  },
  {
    name : "Agrovet Store",
    icon: "🌾",
    variants: [
      { name: "Agrovet Store", link: "https://agrovet.salesmanpro.site", description: "Optimized for agricultural products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/agrovet-store.jpg' }
    ]
  },  
  {
    name: "Gaming Store",
    icon: "🎮",
    variants: [
      { name: "Gaming Store", link: "https://gaming-store.salesmanpro.site", description: "Designed for gaming products and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/gaming-store.jpg' }
    ]
  },
  {
    name: "Earphones Store",
    icon: "🎧",
    variants: [
      { name: "Earphones Store", link: "https://earphones-store.salesmanpro.site", description: "Showcase earphones and audio accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/earphones-store.jpg' }
    ]
  },
  {
    name: "Bike Store",
    icon: "🚲",
    variants: [
      { name: "Bike Store", link: "https://bike-store.salesmanpro.site", description: "Showcase bikes and cycling accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/bike-store.jpg' }
    ]
  },
  {
    name: "Motorcycle Store",
    icon: "🏍️",
    variants: [
      { name: "Motorcycle Store", link: "https://motorcycle-store.salesmanpro.site", description: "Showcase motorcycles and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/motorcycle-store.jpg' }
    ]
  },
  {
  name: "Glasses Store",
  icon: "👓",
  variants: [   
        { name: "Glasses Store", link: "https://glasses-store.salesmanpro.site", description: "Showcase eyewear and accessories.", tag: 'New', desktopPreviewImage: 'https://example.com/glasses-store.jpg' },
      ]
  },
  { 
    name: "Flowers Store",
    icon: "🌸",
    variants: [
      { name: "Flowers Store", link: "https://flowers-store.salesmanpro.site", description: "Showcase floral arrangements and gifts.", tag: 'New', desktopPreviewImage: 'https://example.com/flowers-store.jpg' }
    ]
  },
  {
    name: "Honey Store",
    icon: "🍯",
    variants: [{ name: "Honey Store", link: "https://honey-store.salesmanpro.site", description: "Showcase honey and related products.", tag: 'New', desktopPreviewImage: 'https://example.com/honey-store.jpg' }]
  },
  {
    name: "Peanuts Store",
    icon: "🥜",
    variants: [{ name: "Peanuts Store", link: "https://peanuts-store.salesmanpro.site", description: "Showcase peanuts and related snacks.", tag: 'New', desktopPreviewImage: 'https://example.com/peanuts-store.jpg' }],
  },
  { 
    name: "Watch Store", 
    icon: "⌚", 
    variants: [
      { name: "Watch Store", link: "https://watch-store.salesmanpro.site", description: "Showcase watches and timepieces.", tag: 'New', desktopPreviewImage: 'https://example.com/watch-store.jpg' }
    ]
  },
  {
    name: "Baby Store",
    icon: "👶",
    variants: [{ name: "Baby Store", link: "https://baby-store.salesmanpro.site", description: "Showcase baby products and essentials.", tag: 'New', desktopPreviewImage: 'https://example.com/baby-store.jpg' }],
  },
  { 
    name: "Cake Store",
    icon: "🎂",
    variants: [
      { name: "Cake Store", link: "https://cake-store.salesmanpro.site", description: "Showcase cakes and baked goods.", tag: 'New', desktopPreviewImage: 'https://example.com/cake-store.jpg' }
    ]
  },
  {
    name: "Pets Store",
    icon: "🐶",
    variants: [{ name: "Pets Store", link: "https://pets-store.salesmanpro.site", description: "Showcase pet products and supplies.", tag: 'New', desktopPreviewImage: 'https://example.com/pets-store.jpg' }],
  },
  { 
    name: "Groceries Store",
    icon: "🛒",
    variants: [
      { name: "Groceries Store", link: "https://groceries-store.salesmanpro.site", description: "Showcase groceries and household items.", tag: 'New', desktopPreviewImage: 'https://example.com/groceries-store.jpg' }
    ]
  },
 { name: "Public Speaking", 
    icon: "🎙️", 
    variants: [
      { name: "Standard Speaker Site", link: "https://flourishhub-2.salesmanpro.site", description: "Bookings and media focus.", tag: 'Standard', desktopPreviewImage: 'https://example.com/standard-speaker-site.jpg' }
    ] 
  },
  { 
      name: "Shoes Store", icon: "👟", variants: [
      { name: "Shoes Store Classic", link: "https://shoes-store.salesmanpro.site", description: "Grid-based product layout.", tag: 'Standard', desktopPreviewImage: 'https://example.com/shoes-store-classic.jpg' }
    ] 
  },
  { name: "Service Provider", 
    icon: "🔧", variants: [
      { 
        name: "Agency Portfolio", link: "https://service-provider.salesmanpro.site", description: "Showcase services and case studies.", tag: 'Popular', desktopPreviewImage: 'https://example.com/agency-portfolio.jpg' 
      }
    ] 
  },
  { name: "Booking & Appointments", 
    icon: "📅", 
    variants: [
      { name: "Scheduler Hub", link: "https://booking.salesmanpro.site", description: "Integrated calendar for easy booking.", tag: 'Standard', desktopPreviewImage: 'https://example.com/scheduler-hub.jpg' },
      { name: "Barbershop Store", link:"https://barbershop.salesmanpro.site", description: "Booking-focused design for barbershops.", tag: 'New', desktopPreviewImage: 'https://example.com/barbershop-store.jpg' }   ] 
  },
  { name: "Portfolio & Personal Branding", 
    icon: "👤", 
    variants: [
      { name: "Creative CV", link: "https://portfolio-personal-branding.salesmanpro.site", description: "Minimalist design for designers/writers.", tag: 'New', desktopPreviewImage: 'https://example.com/creative-cv.jpg' }
    ] 
  },
  { 
    name: "Blog & Content", 
    icon: "✍️", variants: 
    [{ name: "Modern Magazine", link: "https://blog-content.salesmanpro.site", description: "High-readability blog layout.", tag: 'Popular', desktopPreviewImage: 'https://example.com/modern-magazine.jpg' }

    ] 
  },
    { name: "Nonprofit & Community",
      icon: "🤝",
      variants: [
        { name: "Charity Connect", link: "https://nonprofit-community.salesmanpro.site", description: "Donation-focused design.", tag: 'Standard', desktopPreviewImage: 'https://example.com/charity-connect.jpg' }
      ]
    },
    { name: "Healthcare & Clinics",
      icon: "🏥",
      variants: [
        { name: "Clinic Pro", link: "https://healthcare-clinics.salesmanpro.site", description: "Patient-focused design.", tag: 'Standard', desktopPreviewImage: 'https://example.com/clinic-pro.jpg' }
      ]
    },
    { name: "Media & Entertainment",
      icon: "🎬",
      variants: [
        { name: "Film Studio", link: "https://media-entertainment.salesmanpro.site", description: "Showcase your films and projects.", tag: 'Standard', desktopPreviewImage: 'https://example.com/film-studio.jpg' }
      ]
    },
    { name: "Finance & Legal",
      icon: "💼",
      variants: [
        { name: "Financial Advisor", link: "https://finance-legal.salesmanpro.site", description: "Professional services for finance experts.", tag: 'Standard', desktopPreviewImage: 'https://example.com/financial-advisor.jpg' }
      ]
    },
    { name: "Automotive",
      icon: "🚗",
      variants: [
        { name: "Car Dealership", link: "https://automotive.salesmanpro.site", description: "Showcase your vehicles and services.", tag: 'Standard', desktopPreviewImage: 'https://example.com/car-dealership.jpg' }
      ]
    },
    { name: "Travel & Tourism",
      icon: "✈️",
      variants: [
        { name: "Travel Agency", link: "https://travel-tourism.salesmanpro.site", description: "Promote travel packages and services.", tag: 'Standard', desktopPreviewImage: 'https://example.com/travel-agency.jpg' }
      ]
    },
    { name: "Fitness & Wellness",
      icon: "🏋️‍♂️",
      variants: [
        { name: "Gym & Fitness", link: "https://fitness-wellness.salesmanpro.site", description: "Showcase fitness programs and classes.", tag: 'Standard', desktopPreviewImage: 'https://example.com/gym-fitness.jpg' }
      ]
    },
    { name: "Directory & Listings",
      icon: "📂",
      variants: [
        { name: "Business Directory", link: "https://directory-listings.salesmanpro.site", description: "List businesses and services.", tag: 'Standard', desktopPreviewImage: 'https://example.com/business-directory.jpg' }
      ]
    },
    { name: "Educational & Online Courses",
      icon: "📚",
      variants: [
        { name: "Online Learning", link: "https://educational-online-courses.salesmanpro.site", description: "Promote online courses and resources.", tag: 'Standard', desktopPreviewImage: 'https://example.com/online-learning.jpg' },
        { name: "Courses Layout 2", link: "https://courses-layout-2.salesmanpro.site", description: "Alternate design for online courses.", tag: 'Standard', desktopPreviewImage: 'https://example.com/courses-layout-2.jpg' },
        { name: "Courses Layout 3", link: "https://courses-layout-3.salesmanpro.site", description: "Another design for online courses.", tag: 'Standard', desktopPreviewImage: 'https://example.com/courses-layout-3.jpg' },
      ]
    },
    { name: "Restaurant & Food Delivery",
      icon: "🍔",
      variants: [
        { name: "Food Delivery", link: "https://restaurant-food-delivery.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard', desktopPreviewImage: 'https://example.com/food-delivery.jpg' }
      ]
    },
    { name: "Event & Ticketing",
      icon: "🎟️",
      variants: [
        { name: "Event Booking", link: "https://event-ticketing.salesmanpro.site", description: "Manage events and ticket sales.", tag: 'Standard', desktopPreviewImage: 'https://example.com/event-booking.jpg' }
      ]
    },
    { name: "Real Estate",
      icon: "🏠",
      variants: [
        { name: "Property Listings", link: "https://real-estate.salesmanpro.site", description: "Showcase real estate properties.", tag: 'Standard', desktopPreviewImage: 'https://example.com/property-listings.jpg' }
      ]
    },
    {
      name: "Property Management",
      icon: "🏥",
      variants: [
        { name: "Property Manager", link: "https://property-management.salesmanpro.site", description: "Manage properties and tenants.", tag: 'Standard', desktopPreviewImage: 'https://example.com/property-manager.jpg' }
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
        { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard', desktopPreviewImage: 'https://example.com/product-marketplace.jpg' }
      ]
    },
    {
      name: "Security",
      icon: "🔒",
      variants: [
        { name: "Security Services", link: "https://security-services.salesmanpro.site", description: "Protect your assets and data.", tag: 'Standard', desktopPreviewImage: 'https://example.com/security-services.jpg' },
        { name: "Security Consulting", link: "https://security-services-2.salesmanpro.site", description: "Security Consulting site.", tag: 'Standard', desktopPreviewImage: 'https://example.com/security-consulting.jpg'},
      ]
    },
    {
      name: "Delivery & Logistics",
      icon: "🚚",
      variants: [
        { name: "Delivery Service", link: "https://delivery-logistics.salesmanpro.site", description: "Manage deliveries and logistics.", tag: 'Standard', desktopPreviewImage: 'https://example.com/delivery-service.jpg' },
      ]
    }
    // { name: "Other",
    //   icon: "🌐",
    //   variants: [
    //     { name: "General Purpose Site", link: "https://other.salesmanpro.site", description: "A flexible starting point.", tag: 'Standard', desktopPreviewImage: 'https://example.com/general-purpose.jpg' }
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


// export default function CategoryStep({
//   category,
//   variant,
//   handleChange,
// }: CategorySelectProps) {
//   const [search, setSearch] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // --- Logic (Unchanged) ---
//   const selectedCategory = SITE_CATEGORIES.find(
//     (c) => c.name === category
//   );
//   const selectedTemplate = selectedCategory?.variants.find(
//     (v) => v.name === variant
//   );

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
  
//   const handleVariantSelect = (categoryName: string, variantName: string) => {
//     handleChange({
//       target: { name: 'category', value: categoryName } as HTMLSelectElement
//     } as ChangeEvent<HTMLSelectElement>);
//     handleChange({
//       target: { name: 'variant', value: variantName } as HTMLSelectElement
//     } as ChangeEvent<HTMLSelectElement>);
//   };

//   const handlePreviewClick = () => {
//     if (selectedTemplate) {
//       setIsModalOpen(true);
//     }
//   };
//   // --- End Logic ---

//   return (
//     <>
//       <section 
//         // Mobile-friendly full width, larger desktop max-width
//         className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto" 
//         role="region" 
//         aria-label="Template and Category Selection"
//       >
//         <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-10 border border-gray-100"> 
          
//           {/* Header - Bolder headline and clear instruction */}
//           <header className="mb-6 text-center">
//             <motion.h2 
//               initial={{ y: -20, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ duration: 0.5 }}
//               className="text-3xl sm:text-4xl font-extrabold text-gray-900 flex flex-col sm:flex-row items-center justify-center gap-2"
//             >
//               <SparklesIcon className="h-7 w-7 text-indigo-500 flex-shrink-0" />
//               Choose Your <span className="text-indigo-600">Perfect Template</span>
//             </motion.h2>
//             <p className="mt-2 text-md sm:text-lg text-gray-600 flex items-center justify-center">
//               <InformationCircleIcon className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0" />
//               Step 1: Pick your category. Step 2: Select a template variant.
//             </p>
//           </header>

//           {/* Sticky Search and Category Header for mobile - BETTER UX */}
//           <div className="sticky top-0 z-10 bg-white pt-2 pb-4 border-b border-gray-200">
//             {/* Search - Visually clean and accessible */}
//             <div className="mb-4 relative">
//               <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search categories..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 aria-label="Search categories" 
//                 className="w-full pl-12 pr-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition shadow-lg shadow-gray-100/50" 
//               />
//             </div>
            
//             <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex justify-between items-center">
//               Business Categories 
//               <span className="text-indigo-600 font-semibold text-sm bg-indigo-100 px-3 py-1 rounded-full">
//                 {filteredCategories.length} Available
//               </span>
//             </h3>
//           </div>
          
//           {/* Category List - Mobile-first grid (2 columns) */}
//           <div 
//             className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-4" 
//             role="radiogroup"
//             aria-label="Site categories"
//           >
//             {filteredCategories.map((cat) => {
//               const isSelected = selectedCategory?.name === cat.name;
//               return (
//                 <motion.button
//                   key={cat.name}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
//                   whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(99, 102, 241, 0.4)" }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() =>
//                     handleVariantSelect(cat.name, cat.variants[0].name)
//                   }
//                   role="radio"
//                   aria-checked={isSelected}
//                   tabIndex={isSelected ? 0 : -1} 
//                   className={`flex flex-col items-center justify-center p-3 sm:p-4 h-28 sm:h-36 text-sm rounded-2xl border-2 transition duration-300 ease-in-out font-semibold text-center leading-tight ${
//                     isSelected
//                       ? "bg-indigo-600 border-indigo-700 text-white shadow-xl ring-4 ring-indigo-300" 
//                       : "bg-gray-50 border-gray-100 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
//                   }`}
//                 >
//                   <span className="text-3xl sm:text-5xl mb-1 transition duration-300">{cat.icon}</span> 
//                   <span className="mt-1 text-xs sm:text-sm">{cat.name}</span>
//                 </motion.button>
//               );
//             })}
//           </div>

//           {/* VARIANTS (With Preview Button Added) */}
//           <AnimatePresence>
//             {selectedCategory && (
//               <motion.div
//                 key="variant-selector"
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -30 }}
//                 transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
//                 className="p-4 sm:p-6 bg-indigo-50 rounded-2xl shadow-inner border border-indigo-200 mt-8" 
//               >
//                 <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
//                   <ChevronRightIcon className="h-6 w-6 mr-2 text-indigo-600 flex-shrink-0" />
//                   Template Variants for <span className='text-indigo-900 ml-1'>{selectedCategory.name}</span>:
//                 </h3>
                
//                 {/* Variant selection list - Horizontal Scroll, full bleed on mobile */}
//                 <div 
//                   // Use negative margin/padding for full-bleed horizontal scroll on mobile
//                   className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar-horizontal" 
//                   role="radiogroup"
//                   aria-label="Template variants for selected category"
//                 >
//                   {selectedCategory.variants.map((variantl) => {
//                     const isVariantSelected = variantl.name === variant; 
//                     let tagColor = "";
//                     let tagBg = "";
//                     if (variantl.tag === "New") {
//                       tagColor = "text-green-800";
//                       tagBg = "bg-green-200";
//                     } else if (variantl.tag === "Popular") {
//                       tagColor = "text-orange-800";
//                       tagBg = "bg-orange-200";
//                     }

//                     return (
//                       <motion.button
//                         key={variantl.name}
//                         onClick={() =>
//                           handleVariantSelect(selectedCategory.name, variantl.name)
//                         }
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         role="radio"
//                         aria-checked={isVariantSelected}
//                         tabIndex={isVariantSelected ? 0 : -1} 
//                         className={`group flex-shrink-0 px-4 sm:px-5 py-2 text-sm sm:text-base rounded-full font-medium transition duration-200 whitespace-nowrap border-2 ${
//                           isVariantSelected
//                             ? "bg-indigo-600 text-white border-indigo-700 shadow-xl ring-4 ring-indigo-400 focus:outline-none"
//                             : "bg-white text-gray-800 border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                         }`}
//                       >
//                         {variantl.name}
//                         {variantl.tag && (
//                           <span
//                             className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full transition duration-200 ${
//                               isVariantSelected 
//                                 ? "bg-white/30 text-white" 
//                                 : `${tagBg} ${tagColor}`
//                             }`}
//                           >
//                             {variantl.tag}
//                           </span>
//                         )}
//                       </motion.button>
//                     );
//                   })}
//                 </div>

//                 {/* Description and Preview - Stacked on Mobile */}
//                 {selectedTemplate && (
//                   <motion.div 
//                     initial={{ opacity: 0, y: 10 }} 
//                     animate={{ opacity: 1, y: 0 }} 
//                     transition={{ delay: 0.1 }}
//                     className="mt-6 p-4 bg-white rounded-xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-gray-200"
//                   >
//                     <p className="text-sm text-gray-700">
//                       <strong className="text-indigo-600">Variant Focus:</strong> {selectedTemplate.description}
//                     </p>
                    
//                     {/* Preview Button - Full width on mobile, consistent style */}
//                     <motion.button
//                       whileHover={{ scale: 1.02 }}
//                       whileTap={{ scale: 0.98 }}
//                       onClick={handlePreviewClick}
//                       className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-indigo-50"
//                     >
//                       <EyeIcon className="h-5 w-5" />
//                       View Live Preview
//                     </motion.button>
//                   </motion.div>
//                 )}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//       </section>

//       {/* RENDER THE MODAL */}
//       <PreviewModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         url={selectedTemplate?.link || ""}
//         name={selectedTemplate?.name || ""}
//       />
//     </>
//   );
// }

// import React, { useState, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { 
//   ArrowLeftIcon, 
//   SparklesIcon, 
//   MagnifyingGlassIcon, 
//   EyeIcon, 
//   ChevronRightIcon,
// } from "@heroicons/react/24/solid";

export default function CategoryStep({
  siteCategories,
  category,
  variant,
  handleChange,
}: CategorySelectProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  
  const selectedCategory = siteCategories.find((c) => c.name === category);
  const selectedTemplate = selectedCategory?.variants.find((v: any) => v.name === variant);

  const filteredCategories = useMemo(
    () => siteCategories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleIndustrySelect = (catName: string) => {
    const cat = siteCategories.find(c => c.name === catName);
    handleChange({ target: { name: 'category', value: catName } } as any);
    if (cat) {
      handleChange({ target: { name: 'variant', value: cat.variants[0].name } } as any);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-12 min-h-[700px]">
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          /* STEP 1: MINIMALIST DISCOVERY */
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <header className="text-center space-y-4">
              <h2 className="text-5xl font-black text-gray-900 tracking-tight">
                Pick your <span className="text-indigo-600">Industry.</span>
              </h2>
              <p className="text-gray-500 text-xl max-w-xl mx-auto">
                We'll tailor your experience based on your business type.
              </p>
              
              <div className="relative max-w-lg mx-auto mt-8">
                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="What's your business? (e.g. Agency, Store...)"
                  className="w-full bg-white ring-2 ring-gray-100 rounded-2xl pl-14 pr-6 py-5 shadow-2xl shadow-indigo-100/50 focus:ring-4 focus:ring-indigo-500/10 border-none transition-all text-lg"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredCategories.map((cat) => (
                <motion.button
                  key={cat.name}
                  whileHover={{ y: -8, shadow: "0 25px 50px -12px rgba(99, 102, 241, 0.25)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleIndustrySelect(cat.name)}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:border-indigo-200 transition-all flex flex-col items-center text-center group"
                >
                  <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <span className="font-extrabold text-gray-800 text-lg uppercase tracking-tight">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          /* STEP 2: SPLIT-SCREEN REFINEMENT */
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col lg:flex-row gap-8 lg:h-[700px]"
          >
            {/* LEFT: CONTROLS (Scrollable Sidebar) */}
            <div className="lg:w-1/3 flex flex-col h-full bg-white rounded-[3rem] p-8 shadow-xl border border-gray-50">
              <button 
                onClick={() => handleChange({ target: { name: 'category', value: "" } } as any)}
                className="flex items-center gap-2 text-gray-400 font-bold hover:text-indigo-600 transition-colors mb-8 group"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Change Industry
              </button>

              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl">{selectedCategory.icon}</span>
                  <h2 className="text-2xl font-black text-gray-900 leading-none">{selectedCategory.name}</h2>
                </div>
                <p className="text-gray-400 text-sm font-medium italic">Available Styles:</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {selectedCategory.variants.map((v: any) => {
                  const isSelected = v.name === variant;
                  return (
                    <button
                      key={v.name}
                      onClick={() => handleChange({ target: { name: 'variant', value: v.name } } as any)}
                      className={`w-full group text-left p-5 rounded-3xl border-2 transition-all ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200" 
                          : "bg-gray-50 border-transparent hover:border-indigo-100"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`font-black text-lg leading-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>{v.name}</p>
                          <p className={`text-xs mt-1 font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-indigo-500'}`}>
                            {v.tag || 'Standard'}
                          </p>
                        </div>
                        {isSelected && <SparklesIcon className="h-5 w-5 text-white animate-pulse" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all"
                >
                  <EyeIcon className="h-5 w-5 text-indigo-400" />
                  Full Site Preview
                </button>
              </div>
            </div>

            {/* RIGHT: THE STAGE (Visual Preview) */}
            <div className="lg:w-2/3 flex flex-col gap-6">
              {/* Preview Mode Toggles */}
              <div className="flex justify-center bg-gray-100 p-1.5 rounded-2xl self-center">
                <button 
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                >
                  <ComputerDesktopIcon className="h-4 w-4" /> Desktop
                </button>
                <button 
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-6 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
                >
                  <DevicePhoneMobileIcon className="h-4 w-4" /> Mobile
                </button>
              </div>

              {/* The Cinematic Preview Frame */}
              <div className="flex-1 relative flex items-center justify-center">
                <motion.div 
                  animate={{ 
                    width: previewMode === 'desktop' ? '100%' : '320px',
                    height: previewMode === 'desktop' ? '100%' : '90%'
                  }}
                  className="relative bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-[12px] border-gray-900 overflow-hidden"
                >
                  {/* Fake Scrollbar indicator */}
                  <div className="absolute right-1 top-20 bottom-20 w-1 bg-gray-100 rounded-full z-10 opacity-50" />
                  
                  <motion.div 
                    className="w-full cursor-s-resize"
                    whileHover={{ y: "-60%" }}
                    transition={{ duration: 12, ease: "linear" }}
                  >
                    <img 
                      src={selectedTemplate?.desktopPreviewImage || "/path-to-default.jpg"} 
                      alt="Preview" 
                      className="w-full h-auto"
                    />
                  </motion.div>

                  {/* Info Overlay at the bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent">
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">
                      {selectedTemplate?.name}
                    </h3>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      {selectedTemplate?.description || "Hover to explore the flow."}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={selectedTemplate?.link || ""}
        name={selectedTemplate?.name || ""}
      />
    </div>
  );
}
// export default function CategoryStep({
//   category,
//   variant,
//   handleChange,
// }: CategorySelectProps) {
//   const [search, setSearch] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
  
//   // Logic to determine if we are in "Selection" or "Refinement" mode
//   const selectedCategory = SITE_CATEGORIES.find((c) => c.name === category);
//   const selectedTemplate = selectedCategory?.variants.find((v) => v.name === variant);

//   const filteredCategories = useMemo(
//     () => SITE_CATEGORIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
//     [search]
//   );

//   const handleIndustrySelect = (catName: string) => {
//     const cat = SITE_CATEGORIES.find(c => c.name === catName);
//     handleChange({ target: { name: 'category', value: catName } } as any);
//     if (cat) {
//       handleChange({ target: { name: 'variant', value: cat.variants[0].name } } as any);
//     }
//   };

//   const resetSelection = () => {
//     handleChange({ target: { name: 'category', value: "" } } as any);
//     setSearch("");
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-4 sm:p-8 min-h-[600px]">
//       <AnimatePresence mode="wait">
//         {!selectedCategory ? (
//           /* STEP 1: INDUSTRY DISCOVERY */
//           <motion.div
//             key="step1"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95 }}
//             className="space-y-8"
//           >
//             <div className="text-center max-w-2xl mx-auto space-y-4">
//               <h2 className="text-4xl font-black text-gray-900 tracking-tight">
//                 What are we <span className="text-indigo-600">building?</span>
//               </h2>
//               <p className="text-gray-500 text-lg">Select your industry to see tailored templates.</p>
              
//               <div className="relative max-w-md mx-auto mt-6">
//                 <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search industries..."
//                   className="w-full bg-white ring-1 ring-gray-200 rounded-2xl pl-12 pr-4 py-4 shadow-xl focus:ring-2 focus:ring-indigo-500 border-none transition-all"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {filteredCategories.map((cat) => (
//                 <motion.button
//                   key={cat.name}
//                   whileHover={{ scale: 1.03, y: -5 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => handleIndustrySelect(cat.name)}
//                   className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col items-center text-center group"
//                 >
//                   <span className="text-5xl mb-4 group-hover:scale-110 transition-transform tracking-tighter">
//                     {cat.icon}
//                   </span>
//                   <span className="font-bold text-gray-800 tracking-tight">{cat.name}</span>
//                 </motion.button>
//               ))}
//             </div>
//           </motion.div>
//         ) : (
//           /* STEP 2: STYLE REFINEMENT */
//           <motion.div
//             key="step2"
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="grid lg:grid-cols-2 gap-12 items-center"
//           >
//             <div className="space-y-8">
//               <button 
//                 onClick={resetSelection}
//                 className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors group"
//               >
//                 <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
//                 Back to Industries
//               </button>

//               <div className="space-y-2">
//                 <div className="flex items-center gap-3">
//                   <span className="text-4xl">{selectedCategory.icon}</span>
//                   <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
//                     {selectedCategory.name}
//                   </h2>
//                 </div>
//                 <p className="text-gray-500">Pick the style that best fits your brand personality.</p>
//               </div>

//               <div className="space-y-3">
//                 {selectedCategory.variants.map((v) => {
//                   const isSelected = v.name === variant;
//                   return (
//                     <button
//                       key={v.name}
//                       onClick={() => handleChange({ target: { name: 'variant', value: v.name } } as any)}
//                       className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
//                         isSelected 
//                           ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" 
//                           : "bg-white border-gray-100 hover:border-indigo-200 text-gray-700"
//                       }`}
//                     >
//                       <div className="text-left">
//                         <p className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>{v.name}</p>
//                         <p className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
//                           Optimized for conversion and speed
//                         </p>
//                       </div>
//                       {isSelected ? (
//                          <SparklesIcon className="h-6 w-6 text-indigo-200 animate-pulse" />
//                       ) : (
//                         <ChevronRightIcon className="h-5 w-5 text-gray-300" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* PREVIEW SIDE */}

//             <div className="lg:col-span-5 relative group">
//                 {/* Browser UI Wrap */}
//                 <div className="bg-gray-800 rounded-t-2xl p-3 flex gap-1.5 items-center border-b border-gray-700">
//                   <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
//                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
//                   <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
//                   <div className="ml-4 bg-gray-700 h-4 w-32 rounded-full opacity-50" />
//                 </div>

//                 {/* The Scrollable Viewport */}
//                 <div className="h-[500px] overflow-hidden bg-white rounded-b-2xl shadow-2xl relative border-x-8 border-b-8 border-gray-800">
//                   <motion.img
//                     src="/path-to-flourishhub-capture.jpg"
//                     className="w-full h-auto object-top cursor-n-resize"
//                     initial={{ y: 0 }}
//                     whileHover={{ y: "-80%" }} // This makes the long image "pan" up
//                     transition={{ duration: 10, ease: "easeInOut" }}
//                   />
                  
//                   {/* Action Button Overlay */}
//                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-900/10 backdrop-blur-[2px]">
//                     <button 
//                       onClick={() => setIsModalOpen(true)}
//                       className="bg-white text-indigo-600 px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
//                     >
//                       <EyeIcon className="h-5 w-5" /> Expand View
//                     </button>
//                   </div>
//                 </div>
//               </div>

//             {/* // Inside your Step 2 Refinement view */}
//             <div className="relative group overflow-hidden rounded-[2rem] bg-gray-100 shadow-2xl border-4 border-white aspect-[3/4]">
//               {/* The Long Image Container */}
//               <motion.div 
//                 className="absolute top-0 left-0 w-full"
//                 initial={{ y: 0 }}
//                 whileHover={{ y: "-70%" }} // Adjust percentage based on image length
//                 transition={{ duration: 8, ease: "linear" }} // Slow crawl like a real scroll
//               >
//                 <img 
//                   src={selectedTemplate?.desktopPreviewImage} 
//                   alt="Template Preview" 
//                   className="w-full h-auto object-top"
//                 />
//               </motion.div>

//               {/* Glassmorphism Overlay (Visible when not hovering) */}
//               <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 via-transparent to-transparent pointer-events-none opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
              
//               {/* Hover Hint */}
//               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2 group-hover:hidden transition-all">
//                 <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Hover to scroll</span>
//               </div>
//             </div>
//             <div className="relative">
//               <div className="bg-indigo-900 rounded-[3rem] p-3 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
//                 <div className="bg-white rounded-[2.5rem] p-8 aspect-[4/5] flex flex-col justify-between overflow-hidden relative">
//                    <div className="space-y-4">
//                       <div className="h-2 w-12 bg-indigo-100 rounded-full" />
//                       <h3 className="text-2xl font-bold text-gray-900 leading-tight">
//                         {selectedTemplate?.name} Preview
//                       </h3>
//                       <p className="text-sm text-gray-500 leading-relaxed">
//                         {selectedTemplate?.description}
//                       </p>
//                    </div>
                   
//                    <div className="mt-8 flex-1 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
//                       <EyeIcon className="h-12 w-12 text-gray-200" />
//                    </div>

//                    <button 
//                     onClick={() => setIsModalOpen(true)}
//                     className="mt-6 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200"
//                    >
//                      Launch Interactive Preview <EyeIcon className="h-5 w-5" />
//                    </button>
//                 </div>
//               </div>
//               {/* Decorative background element */}
//               <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-30" />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <PreviewModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         url={selectedTemplate?.link || ""}
//         name={selectedTemplate?.name || ""}
//       />
//     </div>
//   );
// }

 function CategoryStepV1({
  category,
  variant,
  handleChange,
}: CategorySelectProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Logic ---
  const selectedCategory = SITE_CATEGORIES.find((c) => c.name === category);
  const selectedTemplate = selectedCategory?.variants.find((v) => v.name === variant);

  const filteredCategories = useMemo(
    () => SITE_CATEGORIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const handleVariantSelect = (categoryName: string, variantName: string) => {
    handleChange({ target: { name: 'category', value: categoryName } } as any);
    handleChange({ target: { name: 'variant', value: variantName } } as any);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-8">
      <header className="mb-10 text-left">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Design your <span className="text-indigo-600">Vision.</span>
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Select a category and refine your style.</p>
        </motion.div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Selection Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Search & Filter Bar */}
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search industries (e.g. Tech, Food...)"
              className="w-full bg-white border-none ring-1 ring-gray-200 rounded-2xl pl-12 pr-4 py-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 2. Category Carousel */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4 ml-1">Industries</h3>
            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory?.name === cat.name;
                return (
                  <motion.button
                    key={cat.name}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVariantSelect(cat.name, cat.variants[0].name)}
                    className={`flex-shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${
                      isSelected 
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
                        : "bg-white border-gray-100 text-gray-600 hover:border-indigo-200"
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="font-bold whitespace-nowrap">{cat.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 3. Variant List */}
          <AnimatePresence mode="wait">
            {selectedCategory && (
              <motion.div
                key={selectedCategory.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 ml-1">Style Variants</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCategory.variants.map((v) => {
                    const isVSelected = v.name === variant;
                    return (
                      <button
                        key={v.name}
                        onClick={() => handleVariantSelect(selectedCategory.name, v.name)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          isVSelected 
                            ? "border-indigo-600 bg-indigo-50/50" 
                            : "border-gray-100 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${isVSelected ? 'bg-indigo-600 animate-pulse' : 'bg-gray-300'}`} />
                          <span className={`font-semibold ${isVSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{v.name}</span>
                        </div>
                        {v.tag && (
                          <span className="text-[10px] font-black uppercase px-2 py-1 bg-white border border-gray-200 rounded text-gray-500">
                            {v.tag}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Interactive Preview Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl overflow-hidden border-[8px] border-gray-800">
            <div className="bg-white rounded-[2rem] overflow-hidden min-h-[400px] flex flex-col">
              {/* Fake Browser Top Bar */}
              <div className="bg-gray-50 border-b p-3 flex gap-1.5 px-6">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>

              {/* Dynamic Content */}
              <div className="flex-1 relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                {selectedTemplate ? (
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4 text-indigo-600">
                      <SparklesIcon className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Live Concept</span>
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                      {selectedTemplate.description}
                    </p>
                    <div className="aspect-video bg-gray-100 rounded-xl mb-6 overflow-hidden flex items-center justify-center text-gray-400">
                      {/* Imagine a thumbnail here */}
                      <EyeIcon className="h-10 w-10 opacity-20" />
                    </div>
                    <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                      Full Preview <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <PreviewSkeleton />
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-6 text-gray-400">
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckBadgeIcon className="h-4 w-4 text-green-500" /> Fully Responsive
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <CheckBadgeIcon className="h-4 w-4 text-green-500" /> SEO Optimized
            </div>
          </div>
        </div>
      </div>

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={selectedTemplate?.link || ""}
        name={selectedTemplate?.name || ""}
      />
    </div>
  );
}