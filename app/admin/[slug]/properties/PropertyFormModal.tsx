// components/properties/PropertyFormModal.tsx
"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, BuildingOfficeIcon, MapPinIcon, TagIcon, CurrencyDollarIcon, BedIcon, BathtubIcon, RulerSquareIcon, UserIcon } from '@heroicons/react/react-24/outline'; // Assuming BedIcon, BathtubIcon, RulerSquareIcon, UserIcon are available or use placeholders

// Re-using the PropertyListing type
export type PropertyListing = {
  id: string;
  title: string;
  address: string;
  city: string;
  price: number;
  status: 'Available' | 'Under Offer' | 'Sold' | 'Draft';
  type: 'Apartment' | 'House' | 'Commercial' | 'Land';
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt?: number;
  imageUrl?: string;
  agentId: string; // Assuming this is a simple ID for now
  agentName: string; // Assuming this is a simple name for now
  createdAt: string;
  updatedAt: string;
};

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: PropertyListing) => void; // Callback for saving (create/update)
  property?: PropertyListing | null; // Optional: for editing an existing property
}

export function PropertyFormModal({ isOpen, onClose, onSave, property }: PropertyFormModalProps) {
  const isEditing = !!property;
  const [formData, setFormData] = useState<PropertyListing>(() => {
    // Initialize form data with existing property or default values
    if (isEditing && property) {
      return { ...property };
    } else {
      return {
        id: `TEMP-${Date.now()}`, // Temporary ID for new properties
        title: '',
        address: '',
        city: '',
        price: 0,
        status: 'Draft',
        type: 'Apartment',
        bedrooms: undefined,
        bathrooms: undefined,
        areaSqFt: undefined,
        imageUrl: '',
        agentId: 'AGT001', // Default agent for new properties
        agentName: 'John Doe', // Default agent name
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : parseFloat(value),
    }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate image upload by creating a local URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, you'd send formData to your API
      // const apiEndpoint = isEditing ? `/api/properties/${formData.id}` : '/api/properties';
      // const method = isEditing ? 'PUT' : 'POST';
      // const response = await fetch(apiEndpoint, {
      //   method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Failed to save property');
      // }
      // const savedProperty = await response.json();

      // For simulation, just update timestamps and pass back
      const savedProperty = {
        ...formData,
        updatedAt: new Date().toISOString(),
        createdAt: isEditing ? formData.createdAt : new Date().toISOString(),
      };

      onSave(savedProperty); // Pass the saved property back to the parent
      onClose(); // Close modal on success
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-bold leading-6 text-gray-900 flex justify-between items-center pb-4 border-b border-gray-200"
                >
                  {isEditing ? 'Edit Property' : 'Add New Property'}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                {error && (
                  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-4" role="alert">
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  {/* Property Details Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Property Title</label>
                      <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (KES)</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input type="number" name="price" id="price" value={formData.price} onChange={handleNumberChange} required
                          className="block w-full pl-10 pr-3 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          step="any" min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">Property Type</label>
                      <select name="type" id="type" value={formData.type} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Land">Land</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                      <select name="status" id="status" value={formData.status} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="Available">Available</option>
                        <option value="Under Offer">Under Offer</option>
                        <option value="Sold">Sold</option>
                        <option value="Draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Details */}
                  <h4 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-100">Location Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                      <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                      <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Property Specs (Conditional based on type) */}
                  {(formData.type === 'Apartment' || formData.type === 'House') && (
                    <>
                      <h4 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-100">Property Specs</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700">Bedrooms</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <BedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms ?? ''} onChange={handleNumberChange} min="0"
                              className="block w-full pl-10 pr-3 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700">Bathrooms</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <BathtubIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms ?? ''} onChange={handleNumberChange} min="0"
                              className="block w-full pl-10 pr-3 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="areaSqFt" className="block text-sm font-medium text-gray-700">Area (SqFt)</label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <RulerSquareIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input type="number" name="areaSqFt" id="areaSqFt" value={formData.areaSqFt ?? ''} onChange={handleNumberChange} min="0"
                              className="block w-full pl-10 pr-3 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Image Upload */}
                  <h4 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-100">Property Image</h4>
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
                    <div className="mt-1 flex items-center space-x-4">
                      <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl || ''} onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Paste image URL or upload below"
                      />
                      <span className="text-gray-400">OR</span>
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 px-3 py-2 border border-gray-300 shadow-sm">
                        <PhotoIcon className="h-5 w-5 inline-block mr-2" /> Upload File
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-4">
                        <img src={formData.imageUrl} alt="Property Preview" className="max-w-xs h-32 object-cover rounded-md shadow-md" />
                      </div>
                    )}
                  </div>

                  {/* Agent Details (can be a dropdown in a real app) */}
                  <h4 className="text-lg font-semibold text-gray-800 pt-4 border-t border-gray-100">Agent Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="agentName" className="block text-sm font-medium text-gray-700">Agent Name</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <input type="text" name="agentName" id="agentName" value={formData.agentName} onChange={handleChange} required
                          className="block w-full pl-10 pr-3 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    {/* Agent ID could be hidden or auto-populated */}
                    <input type="hidden" name="agentId" value={formData.agentId} />
                  </div>


                  {/* Action Buttons */}
                  <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Saving...' : (isEditing ? 'Update Property' : 'Create Property')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
