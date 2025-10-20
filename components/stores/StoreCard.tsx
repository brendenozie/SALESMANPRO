import React from 'react';
import { motion } from 'framer-motion';
import {
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  BuildingStorefrontIcon,
  ArrowRightCircleIcon,
  GlobeAltIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';
// Using EnvelopeIcon instead of WalletIcon as it fits better with contact info

// --- Mocking Router/Context (Required for single-file environment) ---
// const mockNavigation = (path) => {
//     console.log(`Simulated Navigation to: ${path}`);
//     // In a real application, you would use: router.push(path)
// };

// const mockRouter = { push: mockNavigation };
// --- End Mocking ---

/**
 * @typedef {object} Store
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} [category]
 * @property {string} [description]
 * @property {string} [bannerUrl]
 * @property {string} [contactEmail]
 * @property {string} [contactPhone]
 * @property {(id: string) => void} onEdit - Mocked function (replaces router logic)
 * @property {(id: string) => void} onDelete - Mocked function (replaces router logic)
 */

/**
 * Renders a highly interactive card for a single store location.
 * @param {Store} store
 * @returns {JSX.Element}
 */

interface Store {
  id: string;
  slug: string;
  name: string;
  category?: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function StoreCard(store: Store) {
  // Use mockRouter instead of the actual next/navigation hook
  // const router = mockRouter;
   const router = useRouter();

  // Placeholder for banner image if bannerUrl is missing
  // const defaultBannerUrl = 'https://placehold.co/800x200/4F46E5/ffffff?text=E-COMMERCE+STORE+FRONT';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      // Enhanced hover effect for a more premium feel
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
      className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 transform transition duration-300 group font-inter"
    >
      {/* Banner Section */}
      <div className="h-36 bg-indigo-50/50 relative">
        <img
          src={store.bannerUrl || `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(store.name)}`}
          alt={`${store.name} banner`}
          onError={(e) => {
            // Fallback for broken image URLs
            e.currentTarget.onerror = null; 
            e.currentTarget.src = `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(store.name)}`;
          }}
          className={`w-full h-full object-cover transition duration-300 group-hover:opacity-80 ${store.bannerUrl ? '' : 'object-contain mix-blend-multiply opacity-50'}`}
        />
        
        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300 flex items-center justify-center space-x-3">
          {/* Edit Button */}
          <button 
            onClick={() => store.onEdit(store.id)} 
            className="p-3 bg-white/90 text-indigo-600 rounded-full shadow-lg hover:bg-indigo-50 transition duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
            title="Edit Store Details"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          {/* Delete Button */}
          <button 
            onClick={() => store.onDelete(store.id)} 
            className="p-3 bg-white/90 text-red-600 rounded-full shadow-lg hover:bg-red-50 transition duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
            title="Delete Store"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BuildingStorefrontIcon className="h-6 w-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-900 truncate">{store.name}</h2>
            </div>
            {store.category && (
                <p className="text-sm text-indigo-700 font-medium mt-1 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
                    {store.category}
                </p>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
          {store.description || 'No detailed description available for this store.'}
        </p>

        {/* Contact Info */}
        <div className="space-y-3 mb-5 border-t border-b border-gray-100 py-4">
          {store.contactEmail && (
            <div className="flex items-center text-sm text-gray-700">
              <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500" />
              <a href={`mailto:${store.contactEmail}`} className="hover:text-blue-600 transition truncate">
                {store.contactEmail}
              </a>
            </div>
          )}
          {store.contactPhone && (
            <div className="flex items-center text-sm text-gray-700">
              <PhoneIcon className="h-5 w-5 mr-3 text-gray-500" />
              <a href={`tel:${store.contactPhone}`} className="hover:text-blue-600 transition">
                {store.contactPhone}
              </a>
            </div>
          )}
        </div>

        

        {/* Action Links */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push(`/site/${store.slug}`)}
            className="text-blue-600 font-semibold hover:text-blue-800 transition flex items-center text-sm"
          >
            <GlobeAltIcon className="h-4 w-4 mr-1" />
            View Live Site
          </button>
          
          <button
            onClick={() => router.push(`/admin/${store.id}`)}
            className="text-green-600 font-semibold hover:text-green-800 transition flex items-center text-sm group"
          >
            Manage Store
            <ArrowRightCircleIcon className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
