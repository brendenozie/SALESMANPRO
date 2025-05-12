import React, { useState, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import ShippingAddress from '../shippingAddress';

export interface LocationAccordionProps {
  address?: string;
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

  const handleSelect = (display_name: string, lat: number, lng: number ) => {
    setSelectedAddress(display_name);
    onAddressSelect(display_name, { lat, lng });
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div
        onClick={() => setIsOpen(prev => !prev)}
        className="flex justify-between items-center p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
      >
        <div className="flex items-center space-x-2">
          <MapPinIcon className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-semibold text-gray-800">Set Up Location</span>
        </div>
        <span className={`transform transition ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <ShippingAddress onAddressSelect={handleSelect} />
          {selectedAddress && (
            <p className="mt-2 text-sm text-gray-600">Address: {selectedAddress}</p>
          )}
        </div>
      )}
    </div>
  );
}