'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TagIcon,
  DocumentTextIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { CompanyAddress } from '@/types/typings';

interface LocationPickerProps {
  onAddressSave: (location: CompanyAddress) => void;
  initialData?: CompanyAddress | null; // Added initialData prop
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function LocationPicker({ onAddressSave, initialData }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  
  const [formData, setFormData] = useState({
    id: generateId(),
    address: '',
    label: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    instructions: '',
    isMain: false,
    lat: '',
    lng: '',
  });

  // Sync form data when initialData changes (for switching between editing different cards or adding new)
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || generateId(),
        address: initialData.address || '',
        label: initialData.label || '',
        contactName: initialData.contactName || '',
        contactPhone: initialData.contactPhone || '',
        contactEmail: initialData.contactEmail || '',
        instructions: initialData.instructions || '',
        isMain: initialData.isMain || false,
        lat: initialData.lat?.toString() || '',
        lng: initialData.lng?.toString() || '',
      });
    } else {
      // Reset form if switching back to "Add New"
      setFormData({
        id: generateId(),
        address: '',
        label: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        instructions: '',
        isMain: false,
        lat: '',
        lng: '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          }));
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location', error);
          alert('Unable to retrieve your location. Please check browser permissions.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAddress: CompanyAddress = {
      address: formData.address.trim() || null,
      label: formData.label.trim() || null,
      contactName: formData.contactName.trim() || null,
      contactPhone: formData.contactPhone.trim() || null,
      contactEmail: formData.contactEmail.trim() || null,
      instructions: formData.instructions.trim() || null,
      isMain: formData.isMain,
      lat: parseFloat(formData.lat) || 0,
      lng: parseFloat(formData.lng) || 0,
      id: formData.id, 
    };

    onAddressSave(newAddress);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto bg-white rounded-xl p-5 sm:p-6 space-y-6">
      
      {/* 1. Core Address Details */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
          Location Details
        </h4>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address / Street</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main St, Westlands"
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location Label</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="e.g., Headquarters, Warehouse B"
                  className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Coordinates Section */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Latitude</label>
                <input
                  type="text"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  placeholder="0.000000"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Longitude</label>
                <input
                  type="text"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  placeholder="0.000000"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className="mt-5 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-indigo-200 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              {isLocating ? 'Locating...' : 'Pin Current Location'}
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 2. Contact Information */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
          <UserIcon className="h-5 w-5 mr-2 text-indigo-600" />
          On-Site Contact
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="John Doe"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+254 700 000 000"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="john@example.com"
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 3. Delivery Instructions & Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-1.5 text-indigo-600" />
          Delivery Instructions
        </label>
        <textarea
          name="instructions"
          rows={3}
          value={formData.instructions}
          onChange={handleChange}
          placeholder="e.g., Leave with security at the main gate..."
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        
        <div className="mt-4 flex items-center bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          <input
            type="checkbox"
            id="isMain"
            name="isMain"
            checked={formData.isMain}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isMain" className="ml-2 block text-sm font-medium text-gray-800">
            Set as main delivery address
          </label>
          <InformationCircleIcon className="h-5 w-5 text-blue-400 ml-auto" title="Main addresses are prioritized during checkout" />
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {initialData ? 'Save Changes' : 'Save New Address'}
        </button>
      </div>

    </form>
  );
}