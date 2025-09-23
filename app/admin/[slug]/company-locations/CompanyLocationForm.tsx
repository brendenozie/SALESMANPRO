"use client";

import React, { useState } from "react";

interface CompanyLocationFormProps {
  onSubmit: (e: React.FormEvent, formData: any) => void;
  onClose: () => void;
  initialData: any;
  isEditMode: boolean;
  availableLocations: any[];
}

const CompanyLocationForm: React.FC<CompanyLocationFormProps> = ({
  onSubmit,
  onClose,
  initialData,
  isEditMode,
  availableLocations,
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [error, setError] = useState<string | null>(null);

  
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.currentTarget;
    const checked = (e.currentTarget as HTMLInputElement).checked;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Example validation
    if (!isEditMode && !formData.locationId) {
      setError("Please select a base location.");
      return;
    }

    setError(null);
    onSubmit(e, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Base Location Selection (only for Add mode) */}
      {!isEditMode && (
        <div>
          <label
            htmlFor="locationId"
            className="block text-sm font-medium text-gray-700"
          >
            Base Location <span className="text-red-500">*</span>
          </label>
          <select
            id="locationId"
            name="locationId"
            value={formData.locationId || ""}
            onChange={handleFormChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          >
            <option value="">Select a base location</option>
            {availableLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.city}, {loc.country})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Overrides */}
      <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t mt-6">
        Company-Specific Overrides
      </h3>

      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-gray-700"
        >
          Display Name (Override)
        </label>
        <input
          type="text"
          id="displayName"
          name="displayName"
          value={formData.displayName || ""}
          onChange={handleFormChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          placeholder="e.g., Acme Corp Headquarters"
        />
      </div>

      {/* Example of other overrides (repeat pattern for all fields) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="addressLine1Override"
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 1 (Override)
          </label>
          <input
            type="text"
            id="addressLine1Override"
            name="addressLine1Override"
            value={formData.addressLine1Override || ""}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
        </div>
        <div>
          <label
            htmlFor="addressLine2Override"
            className="block text-sm font-medium text-gray-700"
          >
            Address Line 2 (Override)
          </label>
          <input
            type="text"
            id="addressLine2Override"
            name="addressLine2Override"
            value={formData.addressLine2Override || ""}
            onChange={handleFormChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          />
        </div>
      </div>

      {/* Continue same pattern for cityOverride, stateOverride, postalCodeOverride, etc. */}
      
  

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label htmlFor="cityOverride" className="block text-sm font-medium text-gray-700">City (Override)</label>
        <input type="text" id="cityOverride" name="cityOverride" value={initialData.cityOverride} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
      <div>
        <label htmlFor="stateOverride" className="block text-sm font-medium text-gray-700">State (Override)</label>
        <input type="text" id="stateOverride" name="stateOverride" value={initialData.stateOverride} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
      <div>
        <label htmlFor="postalCodeOverride" className="block text-sm font-medium text-gray-700">Postal Code (Override)</label>
        <input type="text" id="postalCodeOverride" name="postalCodeOverride" value={initialData.postalCodeOverride} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
    </div>

    <div>
      <label htmlFor="countryOverride" className="block text-sm font-medium text-gray-700">Country (Override)</label>
      <input type="text" id="countryOverride" name="countryOverride" value={initialData.countryOverride} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="latitudeOverride" className="block text-sm font-medium text-gray-700">Latitude (Override)</label>
        <input type="number" step="any" id="latitudeOverride" name="latitudeOverride" value={initialData.latitudeOverride} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
      <div>
        <label htmlFor="longitudeOverride" className="block text-sm font-medium text-gray-700">Longitude (Override)</label>
        <input type="number" step="any" id="longitudeOverride" name="longitudeOverride" value={initialData.longitudeOverride} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
    </div>

    <h3 className="text-lg font-semibold text-gray-800 pt-4 border-t mt-6">Company-Specific Settings</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
        <input type="number" id="sortOrder" name="sortOrder" value={initialData.sortOrder} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>
      <div className="flex items-center mt-6">
        <input type="checkbox" id="visible" name="visible" checked={initialData.visible} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
        <label htmlFor="visible" className="ml-2 block text-sm text-gray-900">Visible for this Company</label>
      </div>
    </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out shadow-md"
        >
          {isEditMode ? "Update Association" : "Add Association"}
        </button>
      </div>
    </form>
  );
};

export default CompanyLocationForm;
