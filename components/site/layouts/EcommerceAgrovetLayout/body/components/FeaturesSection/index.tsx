'use client';

import React from 'react';
import {
  ClockIcon,
  TagIcon,
  Squares2X2Icon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

const features = [
  {
    id: 1,
    title: '10 minute grocery now',
    description:
      'Get your order delivered to your doorstep at the earliest from FreshCart pickup stores near you.',
    icon: ClockIcon,
  },
  {
    id: 2,
    title: 'Best Prices & Offers',
    description:
      'Cheaper prices than your local supermarket, great cashback offers to top it off. Get best prices & offers.',
    icon: TagIcon,
  },
  {
    id: 3,
    title: 'Wide Assortment',
    description:
      'Choose from 5000+ products across food, personal care, household, bakery, veg and non-veg & other categories.',
    icon: Squares2X2Icon,
  },
  {
    id: 4,
    title: 'Easy Returns',
    description:
      'Not satisfied with a product? Return it at the doorstep & get a refund within hours. No questions asked policy.',
    icon: ArrowUturnLeftIcon,
  },
];

export default function FeaturesSection() {

    const { storeFormData } = useStoreContext();
    const { slug, marketplaceListings = [], themeSettings = {} } = storeFormData || {};
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
