import React, { useState, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import ShippingAddress from '@/components/shippingAddress';

export interface LocationAccordionProps {
  address?: string | null;
  onAddressSelect: (address: string, geoLocation: { lat: number; lng: number }) => void;
}

export default function LocationAccordion({
  address,
  onAddressSelect,
}: LocationAccordionProps) {
  
  const [isOpen, setIsOpen] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(address || '');

  useEffect(() => {
    setSelectedAddress(address || '');
  }, [address]);

  const handleSelect = (
      display_name: string,
      geoLocation: { lat: number; lng: number }
    ) => {
      setSelectedAddress(display_name);
      // pass straight through
      onAddressSelect(display_name, geoLocation);
    };

  return (
    <div className="max-w-3xl mx-auto p-6 ">
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-200 transition"
      >
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-semibold text-gray-800">Set Up Location</span>
        </div>
        <span className={`transform transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          {selectedAddress && (
            <div className="p-4 bg-gray-50 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">Selected Address</h3>
              <p className="text-gray-600">{selectedAddress}</p>
            </div>
          )}
          <ShippingAddress onAddressSelect={handleSelect} />          
        </div>
      )}
    </div>
  );
}