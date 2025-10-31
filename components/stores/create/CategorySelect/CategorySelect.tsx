"use client";

import React, { useState, useMemo, useEffect, ChangeEvent } from "react";
import {
  InformationCircleIcon,
  MagnifyingGlassIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// --- CATEGORY DATA ---
const SITE_CATEGORIES: { name: string; link: string; icon?: string }[] = [
  { name: "E-commerce", link: "https://my-duka.salesmanpro.site", icon: "🛒" },
  { name: "Consultant & Coach", link: "https://flourishhub.salesmanpro.site", icon: "💡" },
  { name: "Public Speaking", link: "https://pflourishub.salesmanpro.site", icon: "🎙️" },
  { name: "Shoes Store", link: "https://shoesstore.salesmanpro.site", icon: "👟" },
  { name: "Service Provider", link: "https://serviceprovider.salesmanpro.site", icon: "🔧" },
  { name: "Booking & Appointments", link: "https://bookings.salesmanpro.site", icon: "📅" },
  { name: "Portfolio & Personal Branding", link: "https://portfolio.salesmanpro.site", icon: "👤" },
  { name: "Blog & Content", link: "https://blogs.salesmanpro.site", icon: "✍️" },
  { name: "Nonprofit & Community", link: "https://nonprofit.salesmanpro.site", icon: "🤝" },
  { name: "Healthcare & Clinics", link: "https://healthcare.salesmanpro.site", icon: "🏥" },
  { name: "Media & Entertainment", link: "https://media.salesmanpro.site", icon: "🎬" },
  { name: "Finance & Legal", link: "https://finance.salesmanpro.site", icon: "💼" },
  { name: "Automotive", link: "https://automotive.salesmanpro.site", icon: "🚗" },
  { name: "Travel & Tourism", link: "https://travel.salesmanpro.site", icon: "✈️" },
  { name: "Fitness & Wellness", link: "https://fitness.salesmanpro.site", icon: "🏋️‍♂️" },
  { name: "Directory & Listings", link: "https://directory.salesmanpro.site", icon: "📂" },
  { name: "Educational & Online Courses", link: "https://education.salesmanpro.site", icon: "📚" },
  { name: "Restaurant & Food Delivery", link: "https://restaurant.salesmanpro.site", icon: "🍔" },
  { name: "Event & Ticketing", link: "https://event.salesmanpro.site", icon: "🎟️" },
  { name: "Real Estate", link: "https://realestate.salesmanpro.site", icon: "🏠" },
  { name: "SaaS & Web Apps", link: "https://saas.salesmanpro.site", icon: "💻" },
  { name: "Marketplace", link: "https://marketplace.salesmanpro.site", icon: "🛍️" },
  { name: "Other", link: "https://other.salesmanpro.site", icon: "🌐" },
];

export interface CategorySelectProps {
  category: string;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export default function CategoryStep({ category, handleChange }: CategorySelectProps) {

  const [search, setSearch] = useState("");
  const [showIframe, setShowIframe] = useState(false);

  const selectedCategory = SITE_CATEGORIES.find((c) => c.name === category);

  const filteredCategories = useMemo(
    () =>
      SITE_CATEGORIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  useEffect(() => {
    if (category && !filteredCategories.some((c) => c.name === category)) {
      setSearch("");
    }
  }, [category, filteredCategories]);

  // Reset iframe when category changes
  useEffect(() => {
    if (selectedCategory) {
      setShowIframe(false);
      const timeout = setTimeout(() => setShowIframe(true), 700); // delay iframe mount
      return () => clearTimeout(timeout);
    }
  }, [selectedCategory]);

  return (
    <section className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT PANEL */}
      <div className="lg:col-span-1">
        <header className="mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Choose Your Focus
          </h2>
          <p className="mt-2 text-gray-600 flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-indigo-500 mr-2 mt-1 flex-shrink-0" />
            Select a category to explore its tailored website template.
          </p>
        </header>

        {/* Search Box */}
        <div className="mb-4 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories (e.g. 'Shop', 'Blog')"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
          />
        </div>

        {/* Category List */}
        <div className="grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-2">
          <AnimatePresence>
            {filteredCategories.map((cat) => {
              const isSelected = cat.name === category;
              return (
                <motion.button
                  key={cat.name}
                  layout
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-pressed={isSelected}
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "category",
                        value: cat.name,
                      } as HTMLSelectElement,
                    } as ChangeEvent<HTMLSelectElement>)
                  }
                  className={`flex flex-col items-center justify-center p-3 h-24 text-sm rounded-xl border transition duration-200 ease-in-out shadow-md
                    ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-700 text-white transform ring-4 ring-indigo-300"
                        : "bg-white border-gray-200 text-gray-800 hover:bg-indigo-50 hover:border-indigo-200"
                    }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <span
                    className={`font-semibold ${
                      isSelected ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {cat.name}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>

          {filteredCategories.length === 0 && (
            <p className="col-span-2 text-center text-gray-500 py-10">
              No categories found. Try another keyword.
            </p>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <motion.div
        key={selectedCategory?.name || "placeholder"}
        layout
        className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-4"
      >
        <h3 className="text-xl font-bold mb-3 text-gray-800">
          {selectedCategory
            ? `Preview: ${selectedCategory.name} Template`
            : "Select a Category to Preview"}
        </h3>

        <div className="h-[70vh] rounded-xl overflow-hidden border-4 border-gray-200 flex flex-col">
          {selectedCategory ? (
            <>
              <div className="bg-gray-100 p-3 flex items-center justify-between shadow-sm">
                <span className="text-sm font-medium text-indigo-600 flex items-center truncate">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <a
                    href={selectedCategory.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {selectedCategory.link}
                  </a>
                </span>
                <span className="text-xs text-gray-500 hidden sm:inline">
                  Template Preview
                </span>
              </div>
              {/* Lazy iframe mount */}
              <AnimatePresence mode="wait">
                {showIframe ? (
                  <motion.iframe
                    key="iframe"
                    src={selectedCategory.link}
                    title={`${selectedCategory.name} Template Preview`}
                    className="flex-1 w-full h-full border-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    loading="lazy"
                  />
                ) : (
                  <motion.div
                    key="thumbnail"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 bg-gray-50 flex items-center justify-center"
                  >
                    <img
                      src={`https://via.placeholder.com/800x600?text=${encodeURIComponent(selectedCategory.name.charAt(0) + ' Template')}`} //selectedCategory.thumbnail || 
                      alt={`${selectedCategory.name} preview`}
                      className="object-contain w-full h-full"
                      loading="lazy"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500 text-center p-10 border border-dashed border-gray-300">
              Click a category on the left to see its live template preview.
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
