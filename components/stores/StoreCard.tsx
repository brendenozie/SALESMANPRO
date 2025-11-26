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
  CreditCardIcon, 
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// This interface defines the data for a single store from your API
interface StoreData {
  id: string;
  slug: string;
  name: string;
  domain: string;
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

export default function StoreCard({
  id,
  slug,
  name,
  category,
  domain,
  description,
  bannerUrl,
  contactEmail,
  contactPhone,
  isActive,
  onEdit,
  onDelete,
  onManageSubscription
}: StoreCardProps) {
  
  // Local function for navigation (replaces useRouter)
  const navigate = (path: string) => {
    window.location.href = path;
  };

  const statusText = isActive ? 'Active' : 'Inactive';
  const statusClasses = isActive 
    ? 'bg-green-100 text-green-700' 
    : 'bg-yellow-100 text-yellow-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -6, boxShadow: "0 15px 35px rgba(0, 0, 0, 0.15)" }}
      // Use a slightly larger, softer shadow
      className={`bg-white rounded-xl shadow-2xl border border-gray-100 transform transition duration-300 group font-inter flex flex-col ${!isActive ? 'opacity-80' : ''}`}
    >
      
      {/* Banner Section */}
      <div className="h-40 bg-indigo-50/50 relative rounded-t-xl overflow-hidden">
        <img
          src={bannerUrl || `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(name)}`}
          alt={`${name} banner`}
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = `https://placehold.co/800x200/4F46E5/ffffff?text=${encodeURIComponent(name)}`;
          }}
          className={`w-full h-full object-cover transition duration-300 ${bannerUrl ? 'group-hover:scale-105' : 'object-contain mix-blend-multiply opacity-50'}`}
        />
        
        {/* CONDITIONAL EDIT/DELETE BUTTONS (Only shown if ACTIVE and on hover) */}
        {isActive && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition duration-300 space-x-2">
            {/* Edit Button */}
            <button 
              onClick={() => onEdit && onEdit(id)}
              className="p-2 bg-white/95 text-indigo-600 rounded-full shadow-lg hover:bg-indigo-50 transition duration-200"
              title="Edit Store Details"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            {/* Delete Button */}
            <button 
              onClick={onDelete}
              className="p-2 bg-white/95 text-red-600 rounded-full shadow-lg hover:bg-red-50 transition duration-200"
              title="Delete Store"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-extrabold text-gray-900 truncate mb-1">{name}</h2>
            {/* Clear Status Indicator */}
            <div className="flex items-center space-x-2">
                {isActive ? 
                    <BuildingStorefrontIcon className="h-5 w-5 text-green-500" /> : 
                    <LockClosedIcon className="h-5 w-5 text-yellow-500" />
                }
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusClasses}`}>
                    {statusText}
                </span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-5 line-clamp-3 text-sm pt-2 border-t border-gray-50/50">
          {description || 'No detailed description available for this store. Add a description in the editor to improve communication.'}
        </p>

        {/* Contact Info */}
        <div className="space-y-2 border-t border-b border-gray-100 py-3 mb-5">
          {contactEmail && (
            <div className="flex items-center text-xs text-gray-700">
              <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
              <a href={`mailto:${contactEmail}`} className="hover:text-blue-600 transition truncate">
                {contactEmail}
              </a>
            </div>
          )}
          {contactPhone && (
            <div className="flex items-center text-xs text-gray-700">
              <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
              <a href={`tel:${contactPhone}`} className="hover:text-blue-600 transition">
                {contactPhone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer (Prominent Buttons) */}
      <div className="p-6 pt-0 space-y-3">
        {isActive ? (
          <>
            {/* Primary Action: Manage Store (Only when active) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/admin/${id}`)}
              className="w-full flex items-center justify-center px-4 py-3 font-bold rounded-lg text-white bg-green-600 shadow-md shadow-green-200 hover:bg-green-700 transform transition-all"
            >
              Manage Store
              <ArrowRightCircleIcon className="h-5 w-5 ml-2" />
            </motion.button>
            
            {/* Secondary Action: View Live Site (Always available) https:// */}
            <button
              // onClick={() => navigate(`https://${domain}`)}
              // onClick={() => window.location.href = `${domain}`}
              onClick={() => window.open(`https://${domain}`, "_blank")}
              className="w-full text-center text-blue-600 font-semibold hover:text-blue-800 transition flex items-center justify-center text-sm p-2"
            >
              <GlobeAltIcon className="h-4 w-4 mr-2" />
              View Live Site
            </button>
          </>
        ) : (
          <>
            {/* Primary Action: Activate Subscription (When inactive) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onManageSubscription}
              className="w-full inline-flex items-center justify-center px-4 py-3 font-bold rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-200 hover:shadow-xl transform transition-all"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Activate Subscription
            </motion.button>

            {/* Secondary Action: View Live Site (Always available) */}
             <button
              onClick={() => navigate(`/site/${slug}`)}
              className="w-full text-center text-blue-600 font-semibold hover:text-blue-800 transition flex items-center justify-center text-sm p-2"
            >
              <GlobeAltIcon className="h-4 w-4 mr-2" />
              View Live Site (Read-Only)
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}