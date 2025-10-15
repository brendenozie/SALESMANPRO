// components/CategoryStep.tsx
import React, { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { InformationCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SITE_CATEGORIES = [
  "E-commerce",
  "Consultant & Coach",
  "Shoes Store",
  "Service Provider",
  "Booking & Appointments",
  "Portfolio & Personal Branding",
  "Blog & Content",
  "Directory & Listings",
  "Educational & Online Courses",
  "Nonprofit & Community",
  "Restaurant & Food Delivery",
  "Event & Ticketing",
  "Real Estate",
  "Healthcare & Clinics",
  "SaaS & Web Apps",
  "Media & Entertainment",
  "Finance & Legal",
  "Automotive",
  "Travel & Tourism",
  "Fitness & Wellness",
  "Marketplace",
  "Tutors",
  "Lecturer",
  "Teacher",
  "Students",
  "Pupils",
  "Principal",
  "School Head",
  "Other",
];


export interface CategorySelectProps {
  category: string;
  handleChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export default function CategoryStep({ category, handleChange }: CategorySelectProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => SITE_CATEGORIES.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  // Ensure selected remains visible when filtered
  useEffect(() => {
    if (category && !filtered.includes(category)) {
      setSearch('');
    }
  }, [category, filtered]);

  return (
    <section className="max-w-4xl mx-auto p-2">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">What's Your Business About?</h2>
        <p className="mt-1 text-gray-600 flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-gray-400 mr-1" />
          This helps in setting up your store and website experience.
        </p>
      </header>

      <div className="mb-4 relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
        {filtered.map(cat => {
          const isSelected = cat === category;
          return (
            <motion.button
              key={cat}
              // onClick={handleChange}
              onClick={() =>
                handleChange({
                  target: { name: 'category', value: cat } as HTMLSelectElement
                } as ChangeEvent<HTMLSelectElement>)
              }
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={
                `flex items-center justify-center h-16 p-4 rounded-2xl border transition
                ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-800 hover:bg-indigo-50'}`
              }
            >
              {cat}
            </motion.button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No categories found.
          </div>
        )}
      </div>
    </section>
  );
}
