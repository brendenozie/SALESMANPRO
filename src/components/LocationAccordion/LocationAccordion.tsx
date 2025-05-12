import { MapPinIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect, useRef } from 'react';
import ShippingAddress from '../shippingAddress';



const LocationAccordion = ({ form, handleChange, handleLocationChange } : any) => {

  const [address, setAddress]     = useState('');
  const [loading, setLoading]     = useState(false);
  

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <details open className="group">
        <summary className="flex justify-between items-center p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-gray-800">Set Up Location</span>
          </div>
          <span className="transform transition group-open:rotate-180">▼</span>
        </summary>

        <div className="mt-6 space-y-6">      

          {/* Map + Radius */}
          <div>
            {/* Radius slider */}
            <div className="mt-4">
              <ShippingAddress onAddressSelect={undefined} />
            </div>

            {/* Display address */}
            {address && (
              <p className="mt-2 text-sm text-gray-600">Address: {address}</p>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}


export default LocationAccordion;
