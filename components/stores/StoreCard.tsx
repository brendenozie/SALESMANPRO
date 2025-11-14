'use client';

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
  CreditCardIcon, // <-- New
  LockClosedIcon, // <-- New
} from "@heroicons/react/24/outline";
import { useRouter } from 'next/navigation';

// 1. --- UPDATED INTERFACE ---
// This interface defines the data for a single store from your API
interface StoreData {
  id: string;
  slug: string;
  name: string;
  companyId: string;
  subscriptionStatus: string;
  category?: string;
  description?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// These are the props the StoreCard component *actually* receives from StoresPage
interface StoreCardProps extends StoreData {
  isActive: boolean;
  onEdit?: (id: string) => void;
  onDelete?: () => void; // Parent now binds the store/ID
  onManageSubscription?: () => void; // Parent now binds the companyId
}

// 2. --- UPDATED FUNCTION SIGNATURE ---
// We destructure all the props, including the new ones
export default function StoreCard({
  id,
  slug,
  name,
  category,
  description,
  bannerUrl,
  contactEmail,
  contactPhone,
  isActive,
  onEdit,
  onDelete,
  onManageSubscription
}: StoreCardProps) {

  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
      // 3. --- INACTIVE VISUAL STATE ---
      // Add 'grayscale' and 'relative' for the badge
      className={`bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 transform transition duration-300 group font-inter relative ${!isActive ? 'grayscale' : ''}`}
    >
      
      {/* 4. --- INACTIVE BADGE --- */}
      {!isActive && (
        <div 
          className="absolute top-4 left-4 z-10 bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center"
          title="This store's subscription is inactive."
        >
          <LockClosedIcon className="h-4 w-4 mr-1.5" />
          Subscription Inactive
        </div>
      )}

      {/* Banner Section */}
      <div className="h-36 bg-indigo-50/50 relative">
        <img
          src={bannerUrl || `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(name)}`}
          alt={`${name} banner`}
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(name)}`;
          }}
          className={`w-full h-full object-cover transition duration-300 ${bannerUrl ? 'group-hover:opacity-80' : 'object-contain mix-blend-multiply opacity-50'}`}
        />
        
        {/* 5. --- CONDITIONAL ACTION BUTTONS --- */}
        {/* Only show Edit/Delete if the store is active */}
        {isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300 flex items-center justify-center space-x-3">
            {/* Edit Button */}
            <button 
              onClick={() => onEdit && onEdit(id)} // 6. Updated onClick
              className="p-3 bg-white/90 text-indigo-600 rounded-full shadow-lg hover:bg-indigo-50 transition duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
              title="Edit Store Details"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            {/* Delete Button */}
            <button 
              onClick={onDelete} // 6. Updated onClick
              className="p-3 bg-white/90 text-red-600 rounded-full shadow-lg hover:bg-red-50 transition duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
              title="Delete Store"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BuildingStorefrontIcon className={`h-6 w-6 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
              <h2 className="text-2xl font-bold text-gray-900 truncate">{name}</h2>
            </div>
            {category && (
              <p className={`text-sm font-medium mt-1 px-2 py-0.5 rounded-full inline-block ${isActive ? 'text-indigo-700 bg-indigo-50' : 'text-gray-600 bg-gray-100'}`}>
                  {category}
              </p>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
          {description || 'No detailed description available for this store.'}
        </p>

        {/* Contact Info (remains the same) */}
        <div className="space-y-3 mb-5 border-t border-b border-gray-100 py-4">
          {contactEmail && (
            <div className="flex items-center text-sm text-gray-700">
              <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500" />
              <a href={`mailto:${contactEmail}`} className="hover:text-blue-600 transition truncate">
                {contactEmail}
              </a>
            </div>
          )}
          {contactPhone && (
            <div className="flex items-center text-sm text-gray-700">
              <PhoneIcon className="h-5 w-5 mr-3 text-gray-500" />
              <a href={`tel:${contactPhone}`} className="hover:text-blue-600 transition">
                {contactPhone}
              </a>
            </div>
          )}
        </div>

        {/* 7. --- CONDITIONAL ACTION LINKS --- */}
        {/* Show 'Manage/View' or 'Activate Subscription' */}
        <div className="flex justify-between items-center">
          {isActive ? (
            <>
              <button
                onClick={() => router.push(`/site/${slug}`)}
                className="text-blue-600 font-semibold hover:text-blue-800 transition flex items-center text-sm"
              >
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                View Live Site
              </button>
              
              <button
                onClick={() => router.push(`/admin/${id}`)}
                className="text-green-600 font-semibold hover:text-green-800 transition flex items-center text-sm group"
              >
                Manage Store
                <ArrowRightCircleIcon className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            // Inactive State Button
            <button
              onClick={onManageSubscription}
              className="w-full inline-flex items-center justify-center px-4 py-3 font-semibold rounded-lg text-white bg-gradient-to-r from-orange-500 to-pink-500 shadow-md hover:shadow-lg hover:scale-105 transform transition-all"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Activate Subscription
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}



// import React from 'react';
// import { motion } from 'framer-motion';
// import {
//   PencilIcon,
//   TrashIcon,
//   PhoneIcon,
//   BuildingStorefrontIcon,
//   ArrowRightCircleIcon,
//   GlobeAltIcon,
//   EnvelopeIcon,
// } from "@heroicons/react/24/outline";
// import { useRouter } from 'next/navigation';
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

// interface Store {
//   id: string;
//   slug: string;
//   name: string;
//   category?: string;
//   description?: string;
//   bannerUrl?: string;
//   contactEmail?: string;
//   contactPhone?: string;
//   onEdit: (id: string) => void;
//   onDelete: (id: string) => void;
// }

// export default function StoreCard(store: Store) {
//   // Use mockRouter instead of the actual next/navigation hook
//   // const router = mockRouter;
//    const router = useRouter();

//   // Placeholder for banner image if bannerUrl is missing
//   // const defaultBannerUrl = 'https://placehold.co/800x200/4F46E5/ffffff?text=E-COMMERCE+STORE+FRONT';

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.4 }}
//       // Enhanced hover effect for a more premium feel
//       whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)" }}
//       className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 transform transition duration-300 group font-inter"
//     >
//       {/* Banner Section */}
//       <div className="h-36 bg-indigo-50/50 relative">
//         <img
//           src={store.bannerUrl || `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(store.name)}`}
//           alt={`${store.name} banner`}
//           onError={(e) => {
//             // Fallback for broken image URLs
//             e.currentTarget.onerror = null; 
//             e.currentTarget.src = `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(store.name)}`;
//           }}
//           className={`w-full h-full object-cover transition duration-300 group-hover:opacity-80 ${store.bannerUrl ? '' : 'object-contain mix-blend-multiply opacity-50'}`}
//         />
        
//         {/* Action Buttons Overlay */}
//         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300 flex items-center justify-center space-x-3">
//           {/* Edit Button */}
//           <button 
//             onClick={() => store.onEdit(store.id)} 
//             className="p-3 bg-white/90 text-indigo-600 rounded-full shadow-lg hover:bg-indigo-50 transition duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
//             title="Edit Store Details"
//           >
//             <PencilIcon className="h-5 w-5" />
//           </button>
//           {/* Delete Button */}
//           <button 
//             onClick={() => store.onDelete(store.id)} 
//             className="p-3 bg-white/90 text-red-600 rounded-full shadow-lg hover:bg-red-50 transition duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2"
//             title="Delete Store"
//           >
//             <TrashIcon className="h-5 w-5" />
//           </button>
//         </div>
//       </div>

//       {/* Content Section */}
//       <div className="p-6">
//         <div className="flex items-start justify-between mb-4">
//           <div>
//             <div className="flex items-center space-x-2">
//               <BuildingStorefrontIcon className="h-6 w-6 text-indigo-500" />
//               <h2 className="text-2xl font-bold text-gray-900 truncate">{store.name}</h2>
//             </div>
//             {store.category && (
//                 <p className="text-sm text-indigo-700 font-medium mt-1 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">
//                     {store.category}
//                 </p>
//             )}
//           </div>
//         </div>

//         <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
//           {store.description || 'No detailed description available for this store.'}
//         </p>

//         {/* Contact Info */}
//         <div className="space-y-3 mb-5 border-t border-b border-gray-100 py-4">
//           {store.contactEmail && (
//             <div className="flex items-center text-sm text-gray-700">
//               <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500" />
//               <a href={`mailto:${store.contactEmail}`} className="hover:text-blue-600 transition truncate">
//                 {store.contactEmail}
//               </a>
//             </div>
//           )}
//           {store.contactPhone && (
//             <div className="flex items-center text-sm text-gray-700">
//               <PhoneIcon className="h-5 w-5 mr-3 text-gray-500" />
//               <a href={`tel:${store.contactPhone}`} className="hover:text-blue-600 transition">
//                 {store.contactPhone}
//               </a>
//             </div>
//           )}
//         </div>

        

//         {/* Action Links */}
//         <div className="flex justify-between items-center">
//           <button
//             onClick={() => router.push(`/site/${store.slug}`)}
//             className="text-blue-600 font-semibold hover:text-blue-800 transition flex items-center text-sm"
//           >
//             <GlobeAltIcon className="h-4 w-4 mr-1" />
//             View Live Site
//           </button>
          
//           <button
//             onClick={() => router.push(`/admin/${store.id}`)}
//             className="text-green-600 font-semibold hover:text-green-800 transition flex items-center text-sm group"
//           >
//             Manage Store
//             <ArrowRightCircleIcon className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" />
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   );
// }
