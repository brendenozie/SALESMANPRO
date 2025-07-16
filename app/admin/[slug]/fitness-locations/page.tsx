import React from 'react';
import { motion } from 'framer-motion';
import { Location, getLocationsData } from '@/constant/Data';

interface LocationsProps {
  params: {
    adminSlug: string;
  };
}

const locationCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function LocationsPage({ params }: LocationsProps) {
  const { adminSlug } = params;
  const locationsData: Location[] = getLocationsData(adminSlug);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Locations & Facilities Management</h2>

      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Your Locations</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary-dark text-white rounded-md text-sm hover:bg-primary-hover transition-colors"
        >
          + Add New Location
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locationsData.map((location) => (
          <motion.div
            key={location.id}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
            variants={locationCardVariants}
          >
            <h4 className="text-xl font-bold text-gray-900 mb-2">{location.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{location.address}</p>
            <div className="text-sm text-gray-700 space-y-1 mb-4">
              <p><span className="font-semibold">Phone:</span> {location.phone}</p>
              <p><span className="font-semibold">Email:</span> {location.email}</p>
              <p>
                <span className="font-semibold">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  location.status === 'open' ? 'bg-green-100 text-green-800' :
                  location.status === 'closed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                </span>
              </p>
              <p><span className="font-semibold">Capacity:</span> {location.capacity} people</p>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-semibold">Amenities:</span> {location.amenities.join(', ')}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}