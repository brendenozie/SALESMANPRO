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
    const secondary = themeSettings?.secondaryColor || '#3b82f6';

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="flex flex-col items-center text-center space-y-4 p-4"
              >
                <Icon className="w-12 h-12 text-green-600" style={{color:`${primary}`}}/>
                <h3 className="text-lg font-semibold text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
