'use client';

import React from 'react';
import {
  ClockIcon,
  TagIcon,
  Squares2X2Icon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

interface FeaturesSectionProps {
  features: {
    id: number;
    title: string;
    description: string;
    icon: React.ElementType;
  }[];
  themeSettings?: any;
}

export default function FeaturesSection({ features, themeSettings }: FeaturesSectionProps) {
  const primary = themeSettings?.primaryColor || '#f97316';
  // Optional: We can use secondary for a subtle background tint
  const secondary = themeSettings?.secondaryColor || '#3b82f6';

  return (
    <section className="py-16 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group flex flex-col items-center text-center space-y-4 p-6 rounded-2xl transition-all duration-300 hover:bg-gray-50 dark:hover:bg-slate-900/50"
              >
                {/* Icon Container with dynamic branding */}
                <div className="relative">
                  <div 
                    className="absolute inset-0 scale-150 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"
                    style={{ backgroundColor: primary }}
                  />
                  <Icon 
                    className="w-12 h-12 relative z-10 transition-transform duration-300 group-hover:scale-110" 
                    style={{ color: primary }}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}