"use client";

import React, { useState, useMemo, useEffect, ChangeEvent } from "react";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  LinkIcon,
  ArrowRightIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// --- REFINED CATEGORY DATA STRUCTURE (Same as before for context) ---
// --- REFINED CATEGORY DATA STRUCTURE (Same as before for context) ---
const SITE_CATEGORIES: { 
  name: string; 
  icon?: string; 
  variants: { name: string; link: string; description: string; tag: 'New' | 'Popular' | 'Standard' }[];
}[] = [
  { 
    name: "E-commerce", 
    icon: "🛒", 
    variants: [
      { name: "Modern Shop (v1)", link: "https://my-duka.salesmanpro.site", description: "Sleek design for apparel and accessories.", tag: 'Popular' },
      { name: "Digital Goods Store (v2)", link: "https://digital-shop.salesmanpro.site", description: "Optimized for selling software and courses.", tag: 'New' },
      { name: "Artisan Marketplace (v3)", link: "https://artisan-shop.salesmanpro.site", description: "Focuses on handcrafted and unique items.", tag: 'Standard' },
    ]
  },
  { 
    name: "Consultant & Coach", 
    icon: "💡", 
    variants: [
      { name: "Executive Coach (v1)", link: "https://flourishhub.salesmanpro.site", description: "Professional, high-conversion landing page.", tag: 'Popular' },
      { name: "Wellness Retreat (v2)", link: "https://wellness-coach.salesmanpro.site", description: "Calm and inviting design for wellness services.", tag: 'Standard' },
    ]
  },
  { name: "Public Speaking", 
    icon: "🎙️", 
    variants: [
      { name: "Standard Speaker Site", link: "https://pflourishub.salesmanpro.site", description: "Bookings and media focus.", tag: 'Standard' }
    ] 
  },
  { name: "Shoes Store", icon: "👟", variants: [
    { name: "Shoes Store Classic", link: "https://shoesstore.salesmanpro.site", description: "Grid-based product layout.", tag: 'Standard' }
  ] 
},
  { name: "Service Provider", 
    icon: "🔧", variants: [
      { 
        name: "Agency Portfolio", link: "https://serviceprovider.salesmanpro.site", description: "Showcase services and case studies.", tag: 'Popular' 
      }
    ] 
  },
  { name: "Booking & Appointments", 
    icon: "📅", 
    variants: [
      { name: "Scheduler Hub", link: "https://bookings.salesmanpro.site", description: "Integrated calendar for easy booking.", tag: 'Standard' }
    ] 
  },
  { name: "Portfolio & Personal Branding", 
    icon: "👤", 
    variants: [
      { name: "Creative CV", link: "https://portfolio.salesmanpro.site", description: "Minimalist design for designers/writers.", tag: 'New' }
    ] 
  },
  { 
    name: "Blog & Content", 
    icon: "✍️", variants: 
    [{ name: "Modern Magazine", link: "https://blogs.salesmanpro.site", description: "High-readability blog layout.", tag: 'Popular' }

    ] 
  },
    { name: "Nonprofit & Community",
      icon: "🤝",
      variants: [
        { name: "Charity Connect", link: "https://nonprofit.salesmanpro.site", description: "Donation-focused design.", tag: 'Standard' }
      ]
    },
    { name: "Healthcare & Clinics",
      icon: "🏥",
      variants: [
        { name: "Clinic Pro", link: "https://healthcare.salesmanpro.site", description: "Patient-focused design.", tag: 'Standard' }
      ]
    },
    { name: "Media & Entertainment",
      icon: "🎬",
      variants: [
        { name: "Film Studio", link: "https://media.salesmanpro.site", description: "Showcase your films and projects.", tag: 'Standard' }
      ]
    },
    { name: "Finance & Legal",
      icon: "💼",
      variants: [
        { name: "Financial Advisor", link: "https://finance.salesmanpro.site", description: "Professional services for finance experts.", tag: 'Standard' }
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
        { name: "Travel Agency", link: "https://travel.salesmanpro.site", description: "Promote travel packages and services.", tag: 'Standard' }
      ]
    },
    { name: "Fitness & Wellness",
      icon: "🏋️‍♂️",
      variants: [
        { name: "Gym & Fitness", link: "https://fitness.salesmanpro.site", description: "Showcase fitness programs and classes.", tag: 'Standard' }
      ]
    },
    { name: "Directory & Listings",
      icon: "📂",
      variants: [
        { name: "Business Directory", link: "https://directory.salesmanpro.site", description: "List businesses and services.", tag: 'Standard' }
      ]
    },
    { name: "Educational & Online Courses",
      icon: "📚",
      variants: [
        { name: "Online Learning", link: "https://education.salesmanpro.site", description: "Promote online courses and resources.", tag: 'Standard' }
      ]
    },
    { name: "Restaurant & Food Delivery",
      icon: "🍔",
      variants: [
        { name: "Food Delivery", link: "https://restaurant.salesmanpro.site", description: "Showcase restaurant menus and delivery options.", tag: 'Standard' }
      ]
    },
    { name: "Event & Ticketing",
      icon: "🎟️",
      variants: [
        { name: "Event Booking", link: "https://event.salesmanpro.site", description: "Manage events and ticket sales.", tag: 'Standard' }
      ]
    },
    { name: "Real Estate",
      icon: "🏠",
      variants: [
        { name: "Property Listings", link: "https://realestate.salesmanpro.site", description: "Showcase real estate properties.", tag: 'Standard' }
      ]
    },
    { name: "SaaS & Web Apps",
      icon: "💻",
      variants: [
        { name: "App Landing Page", link: "https://saas.salesmanpro.site", description: "Promote your SaaS application.", tag: 'Standard' }
      ]
    },
    { name: "Marketplace",
      icon: "🛍️",
      variants: [
        { name: "Product Marketplace", link: "https://marketplace.salesmanpro.site", description: "Create a marketplace for products.", tag: 'Standard' }
      ]
    },
    { name: "Other",
      icon: "🌐",
      variants: [
        { name: "General Purpose Site", link: "https://other.salesmanpro.site", description: "A flexible starting point.", tag: 'Standard' }
      ]
    },
  { name: "Other", icon: "🌐", variants: [{ name: "General Purpose Site", link: "https://other.salesmanpro.site", description: "A flexible starting point.", tag: 'Standard' }] },
];

export interface CategorySelectProps {
  category: string;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

// ... (PreviewSkeleton component remains the same) ...
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

// --- MAIN COMPONENT START ---
export default function CategoryStep({ category, handleChange }: CategorySelectProps) {
  const [search, setSearch] = useState("");
  const [showIframe, setShowIframe] = useState(false);
  const [selectedVariantName, setSelectedVariantName] = useState(""); 

  const selectedCategory = SITE_CATEGORIES.find((c) => c.name === category);

  const selectedTemplate = useMemo(() => {
    return selectedCategory?.variants.find(v => v.name === selectedVariantName) || selectedCategory?.variants[0];
  }, [selectedCategory, selectedVariantName]);

  const filteredCategories = useMemo(() => {
    let list = SITE_CATEGORIES.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [search]);

  // EFFECT 1: Set default category on initial load
  useEffect(() => {
    if (!category && SITE_CATEGORIES.length > 0) {
      const defaultCategory = SITE_CATEGORIES[0];
      handleChange({
        target: { name: "category", value: defaultCategory.name } as HTMLSelectElement,
      } as ChangeEvent<HTMLSelectElement>);
      setSelectedVariantName(defaultCategory.variants[0].name);
    }
  }, []); 

  // EFFECT 2: Reset variant selection when the broad category changes
  useEffect(() => {
    if (selectedCategory) {
      // Only reset the variant if the new category is different
      if (category !== selectedCategory.name) {
          setSelectedVariantName(selectedCategory.variants[0].name); 
      }
    }
  }, [selectedCategory?.name, category]); 

  // EFFECT 3: Reset iframe and show loading delay when the *specific template* changes
  useEffect(() => {
    if (selectedTemplate) {
      setShowIframe(false);
      const timeout = setTimeout(() => setShowIframe(true), 1000); 
      return () => clearTimeout(timeout);
    }
  }, [selectedTemplate?.link]);

  const totalCategories = SITE_CATEGORIES.length;

  // --- HANDLERS ---
  const handleCategoryChange = (catName: string) => {
    handleChange({
        target: { name: "category", value: catName } as HTMLSelectElement,
    } as ChangeEvent<HTMLSelectElement>);
  }

  // --- NEW HANDLER FOR VARIANT BUTTONS ---
  const handleVariantSelect = (variantName: string) => {
    setSelectedVariantName(variantName);
  }
  // --- END HANDLER ---

  return (
    // UPDATED: Removed the `grid` class on the container for mobile (default stack)
    // The grid is applied on `lg` screens only.
    <section className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT PANEL: CATEGORY SELECTION (Always takes full width on mobile) */}
      <div className="lg:col-span-1">
        <header className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Select Your Business **Focus**
          </h2>
          <p className="mt-2 text-gray-600 flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-indigo-500 mr-2 mt-1 flex-shrink-0" />
            Pick a category to see its associated template variants.
          </p>
        </header>

        {/* Search Box */}
        <div className="mb-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Start typing to quickly find a category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition shadow-lg shadow-gray-50/10"
            aria-label="Search categories"
          />
        </div>

        {/* Scroll Hint */}
        {filteredCategories.length > 0 && (
            <p className="text-xs text-gray-500 mb-2 px-1">
                Showing **{filteredCategories.length}** categories.
            </p>
        )}

        {/* Category List: Mobile specific changes */}
        {/* UPDATED: Increased `max-h` on mobile to `max-h-[50vh]` for better scrolling experience */}
        <div className="grid grid-cols-2 gap-3 max-h-[50vh] lg:max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {filteredCategories.map((cat) => {
              const isSelected = cat.name === category;
              return (
                <motion.button
                  key={cat.name}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.03, y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  aria-pressed={isSelected}
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`flex flex-col items-center justify-center p-3 h-28 text-sm rounded-xl border-2 transition duration-200 ease-in-out font-medium ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-xl shadow-indigo-200/50 ring-4 ring-indigo-300/50"
                      : "bg-white border-gray-200 text-gray-800 hover:bg-indigo-50 hover:border-indigo-300"
                  }`}
                >
                  <span className={`text-3xl mb-1 ${isSelected ? 'animate-bounce-once' : ''}`}>{cat.icon}</span>
                  <span className={`${isSelected ? "text-white" : "text-gray-900"} text-center`}>
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filteredCategories.length === 0 && (
            <motion.p 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 text-center text-gray-500 py-10"
            >
              No categories found for "**{search}**".
            </motion.p>
          )}
        </div>

        {/* TEMPLATE VARIANT BUTTONS */}
        <AnimatePresence>
            {selectedCategory && selectedCategory.variants.length > 0 && (
                <motion.div
                    key="variant-selector"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 bg-white rounded-xl shadow-lg border border-indigo-100"
                >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        <ChevronRightIcon className="h-5 w-5 mr-2 text-indigo-500" />
                        Choose a Template Variant:
                    </h3>

                    {/* Horizontal Scrollable Button Container */}
                    <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar-horizontal">
                        {selectedCategory.variants.map((variant) => {
                            const isVariantSelected = variant.name === selectedVariantName;
                            
                            // Determine tag color
                            let tagColor = '';
                            if (variant.tag === 'New') tagColor = 'bg-green-100 text-green-700';
                            else if (variant.tag === 'Popular') tagColor = 'bg-orange-100 text-orange-700';
                            
                            return (
                                <motion.button
                                    key={variant.name}
                                    onClick={() => handleVariantSelect(variant.name)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex-shrink-0 px-4 py-2 text-sm rounded-full font-medium transition duration-200 whitespace-nowrap border-2 ${
                                        isVariantSelected 
                                            ? "bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300"
                                            : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700"
                                    }`}
                                >
                                    {variant.name}
                                    {variant.tag && (
                                        <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${tagColor} ${isVariantSelected ? 'bg-white/20 text-white' : ''}`}>
                                            {variant.tag}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                    
                    {/* Variant Description */}
                    {selectedTemplate && (
                        <p className="mt-4 text-sm text-gray-600 border-t pt-3">
                            **Focus:** {selectedTemplate.description}
                        </p>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* RIGHT PANEL: LIVE PREVIEW */}
      {/* UPDATED: Removed `lg:col-span-2` which is redundant since the container is `grid-cols-1` on mobile. */}
      {/* ADDED: `mt-8 lg:mt-0` to ensure proper spacing when stacked on mobile. */}
      <motion.div
        key={selectedTemplate?.name || "placeholder-preview"}
        layout
        className="mt-8 lg:mt-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-5"
      >
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {selectedTemplate
            ? `Preview: ${selectedTemplate.name}`
            : "Template Preview Area"}
        </h3>

        {/* UPDATED: Adjusted iframe height for mobile. Use `h-[50vh]` on small screens, retaining `h-[75vh]` on desktop. */}
        <div className="h-[50vh] lg:h-[75vh] rounded-2xl overflow-hidden border-4 border-gray-100 flex flex-col">
          {selectedTemplate ? (
            <>
              {/* Custom Browser Bar: Use flex-col on mobile to stack elements if needed (though current design is fine) */}
              <div className="bg-gray-100 p-3 flex items-center justify-between shadow-md">
                {/* Traffic Lights hidden on XS screens if space is tight, but we'll keep it for better feel */}
                <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                </div>

                {/* UPDATED: Reduced max-width on URL span for better fit on small phones */}
                <span className="text-sm font-medium bg-white rounded-full px-4 py-1 border border-gray-200 max-w-[150px] sm:max-w-md truncate">
                  <LinkIcon className="h-4 w-4 mr-1 inline-block text-indigo-600" />
                  <a
                    href={selectedTemplate.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate text-indigo-600"
                  >
                    {selectedTemplate.link.replace('https://', '').replace('http://', '').split('/')[0]}
                  </a>
                </span>

                {/* Full Screen link */}
                <a
                  href={selectedTemplate.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 font-semibold flex items-center hover:text-indigo-800 transition hidden sm:flex" // Hide on extra-small screens to save space
                >
                  Full Screen <ArrowRightIcon className="h-4 w-4 ml-1" />
                </a>
              </div>

              {/* Iframe or Loading State */}
              <AnimatePresence mode="wait">
                {showIframe ? (
                  <motion.iframe
                    key="iframe-live"
                    src={selectedTemplate.link}
                    title={`${selectedTemplate.name} Template Preview`}
                    className="flex-1 w-full h-full border-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    loading="lazy"
                  />
                ) : (
                  <PreviewSkeleton />
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500 text-center p-10 border border-dashed border-gray-300 rounded-xl m-4">
              <MagnifyingGlassIcon className="h-10 w-10 text-gray-400 mb-3" />
              <p className="text-lg font-semibold text-gray-700">Explore Templates</p>
              <p className="mt-1">
                Click a category on the left to select its template variant for preview.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}