'use client';

import React, { useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { useStoreContext } from '@/contexts/StoreContext';

const pricingPlans = [
  {
    title: 'Residential',
    price: 25,
    features: ['Carpet Cleaning', 'Bathroom Cleaning', 'Floor Cleaning', 'Bedroom Cleaning'],
    featured: false,
  },
  {
    title: 'Buildings',
    price: 25,
    features: ['Carpet Cleaning', 'Bathroom Cleaning', 'Floor Cleaning', 'Bedroom Cleaning'],
    featured: true,
    badge: 'Most Popular',
  },
  {
    title: 'Commercial',
    price: 25,
    features: ['Carpet Cleaning', 'Bathroom Cleaning', 'Floor Cleaning', 'Bedroom Cleaning'],
    featured: false,
  },
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  
  const { storeFormData } = useStoreContext();
  
    const { pricingTiers } = storeFormData;

    if (!storeFormData || !storeFormData.pricingTiers) {
      console.log('Pricing tiers not found:', storeFormData);
      return <p>Loading pricing tiers...</p>;
    }

    console.log(pricingTiers);

  return (
    <section className="bg-gray-50 py-16 px-4 text-center">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Special Pricing Package
        </h2>
        <p className="text-gray-600 mb-8">No Hidden Charge</p>

        {/* Toggle */}
        <div className="flex justify-center gap-4 mb-12">
          {['Monthly', 'Yearly'].map((option) => (
            <button
              key={option}
              onClick={() => setBillingCycle(option as 'Monthly' | 'Yearly')}
              className={`px-5 py-2 rounded-full font-medium transition ${
                billingCycle === option
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border text-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
        {pricingTiers && pricingTiers.length > 0 ? pricingTiers.map((plan, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl shadow-md transition-all ${
              plan.isFeatured
                  ? 'bg-teal-900 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {/* Badge */}
              {plan.isFeatured  && ( 
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-teal-900 font-semibold text-sm px-4 py-1 rounded-full shadow">
                  {'Most Popular' }
                  {/* {plan.badge} */}
                </div>
              )}

              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={plan.isFeatured ? 'white' : '#1F2937'} 
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2m-6 0h6m-6-8v2m0-2h6"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold mb-1">
                ${plan.price.toFixed(2)}{' '}
                <span className="text-base font-medium">/ charge</span>
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircleIcon
                      className={`w-5 h-5 ${
                        plan.isFeatured ? 'text-orange-300' : 'text-orange-500'
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 px-6 py-2 w-full rounded-md text-sm font-medium transition ${
                  plan.isFeatured
                    ? 'bg-orange-400 text-white hover:bg-orange-500'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                Get Service
              </button>
              {/* <a href="#booking" className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition">
                Get Service
              </a> */}

            </div>
          ))
          : 
          pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl shadow-md transition-all ${
                plan.featured
                  ? 'bg-teal-900 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              {/* Badge */}
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-teal-900 font-semibold text-sm px-4 py-1 rounded-full shadow">
                  {plan.badge}
                </div>
              )}

              <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke={plan.featured ? 'white' : '#1F2937'}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0v2a2 2 0 002 2h2a2 2 0 002-2v-2m-6 0h6m-6-8v2m0-2h6"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
              <p className="text-3xl font-bold mb-1">
                ${plan.price.toFixed(2)}{' '}
                <span className="text-base font-medium">/ Service</span>
              </p>

              {/* Features */}
              <ul className="mt-6 space-y-3 text-left">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircleIcon
                      className={`w-5 h-5 ${
                        plan.featured ? 'text-orange-300' : 'text-orange-500'
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 px-6 py-2 w-full rounded-md text-sm font-medium transition ${
                  plan.featured
                    ? 'bg-orange-400 text-white hover:bg-orange-500'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                Get Service
              </button>
              {/* <a href="#booking" className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition">
                Get Service
              </a> */}

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
