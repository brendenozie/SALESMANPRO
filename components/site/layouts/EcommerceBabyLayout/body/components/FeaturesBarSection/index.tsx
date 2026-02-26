'use client';

import React from 'react';
import { 
  TruckIcon, 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

const features = [
  {
    title: 'Free Shipping',
    description: 'Free shipping on all your order',
    Icon: TruckIcon,
  },
  {
    title: 'Customer Support 24/7',
    description: 'Instant access to Support',
    Icon: ChatBubbleLeftRightIcon,
  },
  {
    title: '100% Secure Payment',
    description: 'We ensure your money is save',
    Icon: ShieldCheckIcon,
  },
  {
    title: 'Money-Back Guarantee',
    description: '30 Days Money-Back Guarantee',
    Icon: ArrowPathIcon,
  },
];

export default function FeaturesBarSection() {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#F472B6';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-100 pt-10">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-center space-x-4 group transition-all duration-300"
          >
            {/* Icon Container */}
            <div className="flex-shrink-0">
              <feature.Icon 
                className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" 
                style={{ color: primaryColor }}
              />
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
              <h3 className="text-base font-bold text-gray-900 leading-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}