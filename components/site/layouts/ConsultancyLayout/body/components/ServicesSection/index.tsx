'use client';
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ArrowRightIcon, ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
// --- Data Integration Imports ---
import { useStoreContext } from '@/contexts/StoreContext';
// Assuming IStoreCategory and ISubcategory have a property for the icon, 
// likely on the parent (IStoreCategory) in this new use case.
import { StoreForm, IStoreCategory, ISubcategory } from '@/types/typings'; 

// Map icon component (optional, if you want specific Heroicons)
// Note: Keeping icons as emojis in the grid for this component's design.
const iconMap: Record<string, string> = {
  // These are now fallbacks if 'StoreCategory.icon' is not available
  'Executive Coaching': '👔',
  'Career Acceleration': '🚀',
  'Personal Development': '💡',
  'Team Workshops': '🤝',
  'Mindset & Resilience': '🧠',
  'Strategic Planning': '📅',
};

// Define the type for the offering in this component
type Offering = {
  title: string;
  desc: string;
  id?: string;
  icon: string; // Using string for emoji/icon
};

// Fallback data for a standalone preview
const defaultCoachingSolutions: Offering[] = [
  { title: "Executive Coaching", desc: "Elevate your leadership, decision-making, and influence with high-impact executive sessions.", icon: iconMap['Executive Coaching'] || '✨' },
  { title: "Career Acceleration", desc: "Design your career path, refine your strengths, and fast-track your professional growth.", icon: iconMap['Career Acceleration'] || '✨' },
  { title: "Personal Development", desc: "Unlock your best self through purpose-driven growth and emotional intelligence mastery.", icon: iconMap['Personal Development'] || '✨' },
  { title: "Team Workshops", desc: "Ignite collaboration and synergy within your team through engaging, result-oriented workshops.", icon: iconMap['Team Workshops'] || '✨' },
  { title: "Mindset & Resilience", desc: "Overcome self-doubt, embrace change, and build the mental strength to thrive in any season.", icon: iconMap['Mindset & Resilience'] || '✨' },
  { title: "Strategic Planning", desc: "Set a clear vision, craft actionable goals, and execute with precision and purpose.", icon: iconMap['Strategic Planning'] || '✨' },
];

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// Original unused hero slides left here for completeness
const heroSlides = [
  {
    type: "image",
    url: "/coach-hero.jpg",
    headline: "Unlock Your True Potential",
    subline:
      "Empowering ambitious individuals and teams to create a life of purpose, clarity, and success.",
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2670&auto=format&fit=crop",
    headline: "Transform Your Vision into Action",
    subline:
      "Through strategic coaching and tailored consultation, I help you move from ideas to impact.",
  },
  {
    type: "video",
    url: "https://cdn.pixabay.com/video/2024/02/26/200827-919106201_large.mp4",
    headline: "Lead with Confidence, Inspire with Purpose",
    subline:
      "Gain clarity, build resilience, and become the leader you were meant to be.",
  },
];

const autoAdvanceDelay = 9000; // 9 seconds

const ServicesSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // --- Data Integration START ---
  const { storeFormData } = useStoreContext() as { storeFormData: StoreForm };
  const {
    name,
    description,
    StoreCategory = [],
  } = storeFormData;

  const hasCategories = Array.isArray(StoreCategory) && StoreCategory.length > 0;
  let offeringsToShow: Offering[] = [];

  if (hasCategories && StoreCategory.length < 6) {
    // 💡 NEW LOGIC: Flatten subcategories and map to the PARENT's icon

    // 1. Create a flattened list of subcategories, enriched with parent data
    const enrichedSubcategories = (StoreCategory as IStoreCategory[]).flatMap(cat => 
        (cat.subcategories || []).map(subcat => ({
            ...subcat,
            parentIcon: cat.icon || iconMap[cat.displayName || cat.category?.name || 'Service'] || '✨', // Get parent's icon
            parentName: cat.displayName,
        }))
    );

    // 2. Limit and map to the final Offering type
    const limitedSubcategories = enrichedSubcategories.slice(0, 6);
    
    offeringsToShow = limitedSubcategories.map(subcat => ({
      title: subcat.name || 'Service',
      // Provide a more descriptive text, indicating the parent
      desc:  `Specialized solutions for ${subcat.parentName}: ${subcat.name}.`, 
      id: subcat.id,
      icon: subcat.parentIcon, // <<< USES THE PARENT'S ICON HERE
    }));

  } else if (hasCategories) {
    // If 3 or more categories, display the categories themselves (Original logic)
    offeringsToShow = (StoreCategory as IStoreCategory[]).map(cat => ({
      title: cat.displayName || 'Service',
      desc:  `Explore our specialized ${cat.displayName} solutions.`,
      id: cat.id,
      icon: cat.icon || iconMap[cat.displayName || cat.category?.name || 'Service'] || '✨', // Use category's own icon
    }));
  } else {
    // Fallback if no categories exist
    offeringsToShow = defaultCoachingSolutions;
  }
  // --- Data Integration END ---

  const advanceSlide = useCallback(
    (direction: "next" | "prev") => {
      setCurrent((prev) =>
        direction === "next"
          ? (prev + 1) % heroSlides.length
          : (prev - 1 + heroSlides.length) % heroSlides.length
      );
    },
    []
  );

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => advanceSlide("next"), autoAdvanceDelay);
    return () => clearTimeout(timeoutRef.current!);
  }, [current, advanceSlide]);

  // Using the actual length of the dynamic offerings for the grid
  const gridOfferings = offeringsToShow.slice(0, 6); // Limit to 6 for the 3-column grid layout

  return (
    <section id="services" className="relative py-28 bg-gradient-to-br from-orange-50 via-white to-orange-100 overflow-hidden">
      {/* Subtle Background Accents */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 -left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
      </div>

      <div className="relative container mx-auto px-6">
        {/* Section Header - Now uses dynamic 'name' and 'description' */}
        <div className="text-center mb-20">
          <span className="text-lg font-semibold text-orange-700 uppercase tracking-wider mb-3 block">
            Our Expertise
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            {name || 'Transformative Coaching'} <span className="text-orange-600">Solutions</span>
          </h2>
          <p className="mt-5 text-xl text-gray-700 max-w-3xl mx-auto">
            {description || 'Experience the synergy of strategy, mindset, and purpose — designed to help you lead with clarity, confidence, and impact.'}
          </p>
        </div>

        {/* Services Grid - Now uses dynamic offeringsToShow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {gridOfferings.map((service, i) => (
            <div
              key={service.id || i} // Use dynamic ID if available, otherwise index
              className="group relative p-8 rounded-3xl bg-white/80 backdrop-blur-md border border-orange-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/10 to-orange-100/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10">
                <div className="text-5xl mb-6">{service.icon}</div> {/* Uses dynamic icon (emoji) */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3> {/* Uses dynamic title */}
                <p className="text-gray-700 leading-relaxed mb-6">{service.desc}</p> {/* Uses dynamic description */}
                <a
                  href={`#contact`} 
                  className="inline-flex items-center text-orange-600 font-semibold hover:underline underline-offset-4 transition-all"
                >
                  Learn More
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 ml-1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12l-3.75 3.75M3 12h18" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;