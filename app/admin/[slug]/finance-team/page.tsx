

import { motion } from 'framer-motion';
import { TagIcon, CheckCircleIcon, XMarkIcon, PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

const packagesData = [
  {
    id: 'basic',
    title: 'Foundational Insight',
    price: '$299',
    frequency: 'One-time consultation',
    features: [
      '60-minute session',
      'Initial assessment',
      'High-level strategy'
    ],
    featured: false,
  },
  {
    id: 'premium',
    title: 'Strategic Partnership',
    price: '$999',
    frequency: 'Monthly Retainer',
    features: [
      'Unlimited consultations',
      'Dedicated advisor',
      'Customized action plan',
      'Priority support'
    ],
    featured: true,
  },
  {
    id: 'enterprise',
    title: 'Tailored Enterprise Solutions',
    price: 'Contact Us',
    frequency: 'Customized Pricing',
    features: [
      'Dedicated enterprise team',
      'On-site consultations',
      'Integrated services',
      '24/7 priority support'
    ],
    featured: false,
  },
];

export default function PackagesPage() {
  return (
    <div>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-blue-400">Service Packages</h3>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center">
            <PlusCircleIcon className="h-5 w-5 mr-2" /> Add New Package
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packagesData.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-[#0A192F] rounded-lg shadow-md p-6 border ${pkg.featured ? 'border-blue-500 ring-2 ring-blue-500' : 'border-blue-800'}`}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-2xl font-bold text-white">{pkg.title}</h4>
                {pkg.featured && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Featured</span>
                )}
              </div>
              <p className="text-4xl font-extrabold text-blue-400 mb-2">{pkg.price}</p>
              <p className="text-blue-300 text-sm mb-6">{pkg.frequency}</p>

              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-blue-100">
                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-end space-x-3 mt-4">
                <button className="text-blue-400 hover:text-blue-600">
                  <PencilIcon className="h-6 w-6" />
                </button>
                <button className="text-red-400 hover:text-red-600">
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}