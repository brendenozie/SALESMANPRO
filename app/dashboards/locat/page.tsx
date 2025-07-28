"use client";

import React, { useState, useEffect } from 'react';


interface PageProps {
  params: {
    slug: string; // companyId
  };
}

// Main App component for Location Management
export default function Locat({ params }: PageProps) {
  
  const [locations, setLocations] = useState<any[]>([]);
  const [parentLocations, setParentLocations] = useState<any[]>([]); // For parent dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [locationToDeleteId, setLocationToDeleteId] = useState<string | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState<any>({
    name: '',
    slug: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    latitude: '',
    longitude: '',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '', // Will be split into array
    sortOrder: 0,
    visible: true,
    status: 'active',
    parentId: '', // For parent location selection
    localization: {},
    attributes: {},
    createdBy: 'admin_user', // Placeholder, ideally from auth
  });

  // --- Fetching Data ---

  // Function to fetch all locations
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/locations');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLocations(data.data);
      // Also set parent locations for dropdown, excluding current location if editing
      setParentLocations(data.data.filter((loc: any) => loc.id !== selectedLocation?.id));
    } catch (err: any) {
      setError(`Failed to fetch locations: ${err.message}`);
      console.error('Fetch locations error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // --- Form Handlers ---

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Handle checkbox specifically
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>, fieldName: string) => {
    try {
      const parsed = JSON.parse(e.target.value);
      setFormData({ ...formData, [fieldName]: parsed });
      setError(null); // Clear JSON parsing error if successful
    } catch (err) {
      setError(`Invalid JSON for ${fieldName}. Please check syntax.`);
      console.error(`JSON parsing error for ${fieldName}:`, err);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      latitude: '',
      longitude: '',
      seoTitle: '',
      seoDescription: '',
      metaKeywords: '',
      sortOrder: 0,
      visible: true,
      status: 'active',
      parentId: '',
      localization: {},
      attributes: {},
      createdBy: 'admin_user', // Placeholder
    });
    setError(null);
  };

  // --- CRUD Operations ---

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(',').map((kw: string) => kw.trim()) : [],
        // Ensure parentId is null if empty string
        parentId: formData.parentId === '' ? null : formData.parentId,
      };

      const response = await fetch('/api/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchLocations(); // Refresh list
      setIsCreateModalOpen(false);
      resetFormData();
    } catch (err: any) {
      setError(`Failed to create location: ${err.message}`);
      console.error('Create location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        metaKeywords: formData.metaKeywords ? formData.metaKeywords.split(',').map((kw: string) => kw.trim()) : [],
        // Ensure parentId is null if empty string
        parentId: formData.parentId === '' ? null : formData.parentId,
        updatedBy: 'admin_user', // Placeholder, ideally from auth
      };

      const response = await fetch(`/api/admin/locations/${selectedLocation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchLocations(); // Refresh list
      setIsEditModalOpen(false);
      setSelectedLocation(null);
      resetFormData();
    } catch (err: any) {
      setError(`Failed to update location: ${err.message}`);
      console.error('Update location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async () => {
    if (!locationToDeleteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/locations/${locationToDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchLocations(); // Refresh list
      setIsDeleteConfirmOpen(false);
      setLocationToDeleteId(null);
    } catch (err: any) {
      setError(`Failed to delete location: ${err.message}`);
      console.error('Delete location error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Open/Close Handlers ---

  const openCreateModal = () => {
    resetFormData();
    setIsCreateModalOpen(true);
    // Fetch all locations to populate parent dropdown
    fetchLocations();
  };

  const openEditModal = (location: any) => {
    setSelectedLocation(location);
    setFormData({
      ...location,
      // Convert metaKeywords array back to comma-separated string for input
      metaKeywords: location.metaKeywords ? location.metaKeywords.join(', ') : '',
      // Ensure parentId is an empty string if null for select input
      parentId: location.parentId || '',
      // Ensure JSON fields are stringified for textarea
      localization: JSON.stringify(location.localization || {}, null, 2),
      attributes: JSON.stringify(location.attributes || {}, null, 2),
    });
    setIsEditModalOpen(true);
    // Fetch all locations to populate parent dropdown, excluding the current one
    fetchLocations();
  };

  const openDeleteConfirm = (id: string) => {
    setLocationToDeleteId(id);
    setIsDeleteConfirmOpen(true);
  };

  // --- Reusable Modal Component ---
  const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // --- Location Form Component (used in modals) ---
  const LocationForm = ({ onSubmit, onClose, initialData, isEditMode }: { onSubmit: (e: React.FormEvent) => void; onClose: () => void; initialData: any; isEditMode: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
          <input type="text" id="name" name="name" value={initialData.name} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug <span className="text-red-500">*</span></label>
          <input type="text" id="slug" name="slug" value={initialData.slug} onChange={handleFormChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea id="description" name="description" value={initialData.description} onChange={handleFormChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
          <input type="text" id="addressLine1" name="addressLine1" value={initialData.addressLine1} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2</label>
          <input type="text" id="addressLine2" name="addressLine2" value={initialData.addressLine2} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
          <input type="text" id="city" name="city" value={initialData.city} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
          <input type="text" id="state" name="state" value={initialData.state} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code</label>
          <input type="text" id="postalCode" name="postalCode" value={initialData.postalCode} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
        <input type="text" id="country" name="country" value={initialData.country} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">Latitude</label>
          <input type="number" step="any" id="latitude" name="latitude" value={initialData.latitude} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">Longitude</label>
          <input type="number" step="any" id="longitude" name="longitude" value={initialData.longitude} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">SEO Title</label>
          <input type="text" id="seoTitle" name="seoTitle" value={initialData.seoTitle} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">SEO Description</label>
          <input type="text" id="seoDescription" name="seoDescription" value={initialData.seoDescription} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
      </div>

      <div>
        <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">Meta Keywords (comma-separated)</label>
        <input type="text" id="metaKeywords" name="metaKeywords" value={initialData.metaKeywords} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
          <input type="number" id="sortOrder" name="sortOrder" value={initialData.sortOrder} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
        </div>
        <div className="flex items-center mt-6">
          <input type="checkbox" id="visible" name="visible" checked={initialData.visible} onChange={handleFormChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
          <label htmlFor="visible" className="ml-2 block text-sm text-gray-900">Visible</label>
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
        <select id="status" name="status" value={initialData.status} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">Parent Location</label>
        <select id="parentId" name="parentId" value={initialData.parentId} onChange={handleFormChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
          <option value="">-- No Parent --</option>
          {parentLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.slug})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="localization" className="block text-sm font-medium text-gray-700">Localization (JSON)</label>
        <textarea id="localization" name="localization" value={typeof initialData.localization === 'string' ? initialData.localization : JSON.stringify(initialData.localization || {}, null, 2)} onChange={(e) => handleJsonChange(e, 'localization')} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 font-mono"></textarea>
      </div>

      <div>
        <label htmlFor="attributes" className="block text-sm font-medium text-gray-700">Attributes (JSON)</label>
        <textarea id="attributes" name="attributes" value={typeof initialData.attributes === 'string' ? initialData.attributes : JSON.stringify(initialData.attributes || {}, null, 2)} onChange={(e) => handleJsonChange(e, 'attributes')} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 font-mono"></textarea>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out shadow-sm">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-150 ease-in-out shadow-md">
          {isEditMode ? 'Update Location' : 'Create Location'}
        </button>
      </div>
    </form>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      <script src="https://cdn.tailwindcss.com"></script>

      <div className="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Location Management</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-700 transition duration-150 ease-in-out transform hover:scale-105"
          >
            + Add New Location
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading locations...</div>
        ) : locations.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No locations found. Start by adding one!</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City, Country</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{location.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {location.city}{location.city && location.country ? ', ' : ''}{location.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        location.status === 'active' ? 'bg-green-100 text-green-800' :
                        location.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {location.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {location.visible ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(location)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 p-2 rounded-md hover:bg-indigo-50 transition duration-150 ease-in-out"
                        title="Edit Location"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(location.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition duration-150 ease-in-out"
                        title="Delete Location"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Location Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Location">
        <LocationForm onSubmit={handleCreateLocation} onClose={() => setIsCreateModalOpen(false)} initialData={formData} isEditMode={false} />
      </Modal>

      {/* Edit Location Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Location">
        <LocationForm onSubmit={handleUpdateLocation} onClose={() => setIsEditModalOpen(false)} initialData={formData} isEditMode={true} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
        <div className="p-4">
          <p className="text-gray-700 mb-4">Are you sure you want to delete this location? This action cannot be undone.</p>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteLocation}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150 ease-in-out shadow-md"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
