"use client";

import React, { useState, useEffect } from 'react';
import CompanyLocationForm from './CompanyLocationForm';
import { useParams } from 'next/navigation';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Define a type for CompanyLocation (optional but good practice)
interface CompanyLocation {
  id: string;
  companyId: string;
  locationId: string;
  displayName: string | null;
  addressLine1Override: string | null;
  addressLine2Override: string | null;
  cityOverride: string | null;
  stateOverride: string | null;
  postalCodeOverride: string | null;
  countryOverride: string | null;
  latitudeOverride: number | null;
  longitudeOverride: number | null;
  sortOrder: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  location: { // Included from the API response
    id: string;
    name: string;
    slug: string;
    addressLine1: string | null;
    city: string | null;
    country: string | null;
    // ... other base location fields you might want to display
  };
}

// interface PageProps {
//   params: {
//     slug: string; // companyId
//   };
// }

// Main App component for Company Location Management
export default function App() {
  // Hardcoded company ID for demonstration.
  // In a real app, this would come from auth context or URL params.
  // const COMPANY_ID = params.slug || "60c72b2f9b1e8b001c8e4d1b"; // Replace with a valid Company ID from your DB
  const { slug : COMPANY_ID } = useParams();
  
  const [companyLocations, setCompanyLocations] = useState<CompanyLocation[]>([]);
  const [availableLocations, setAvailableLocations] = useState<any[]>([]); // All base locations for selection
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompanyLocation, setSelectedCompanyLocation] = useState<CompanyLocation | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [companyLocationToDeleteId, setCompanyLocationToDeleteId] = useState<string | null>(null);

  // Form state for add/edit
  const [formData, setFormData] = useState<any>({
    locationId: '', // For selecting the base location
    displayName: '',
    addressLine1Override: '',
    addressLine2Override: '',
    cityOverride: '',
    stateOverride: '',
    postalCodeOverride: '',
    countryOverride: '',
    latitudeOverride: '',
    longitudeOverride: '',
    sortOrder: 0,
    visible: true,
  });

  // --- Fetching Data ---

  // Function to fetch all company locations for the current company
  const fetchCompanyLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/company-locations?companyId=${COMPANY_ID}`
        , { headers: { 'Credentials': 'include' } }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCompanyLocations(data.data);
    } catch (err: any) {
      setError(`Failed to fetch company locations: ${err.message}`);
      console.error('Fetch company locations error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all available base locations (for the dropdown)
  const fetchAvailableLocations = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/locations`,
        { headers: { 'Credentials': 'include' } }
      ); // Use the generic /api/locations endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAvailableLocations(data.data);
    } catch (err: any) {
      setError(`Failed to fetch available base locations: ${err.message}`);
      console.error('Fetch available locations error:', err);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchCompanyLocations();
    fetchAvailableLocations(); // Fetch base locations too
  }, []);

  // --- Form Handlers ---

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetFormData = () => {
    setFormData({
      locationId: '',
      displayName: '',
      addressLine1Override: '',
      addressLine2Override: '',
      cityOverride: '',
      stateOverride: '',
      postalCodeOverride: '',
      countryOverride: '',
      latitudeOverride: '',
      longitudeOverride: '',
      sortOrder: 0,
      visible: true,
    });
    setError(null);
  };

  // --- CRUD Operations ---

  const handleAddCompanyLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        companyId: COMPANY_ID,
        locationId: formData.locationId,
        displayName: formData.displayName || null, // Ensure empty strings become null
        addressLine1Override: formData.addressLine1Override || null,
        addressLine2Override: formData.addressLine2Override || null,
        cityOverride: formData.cityOverride || null,
        stateOverride: formData.stateOverride || null,
        postalCodeOverride: formData.postalCodeOverride || null,
        countryOverride: formData.countryOverride || null,
        latitudeOverride: formData.latitudeOverride ? parseFloat(formData.latitudeOverride) : null,
        longitudeOverride: formData.longitudeOverride ? parseFloat(formData.longitudeOverride) : null,
        sortOrder: parseInt(formData.sortOrder, 10),
        visible: formData.visible,
      };

      const response = await fetch(`${apiBaseUrl}/admin/company-locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchCompanyLocations(); // Refresh list
      setIsAddModalOpen(false);
      resetFormData();
    } catch (err: any) {
      setError(`Failed to add company location: ${err.message}`);
      console.error('Add company location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompanyLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyLocation) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        displayName: formData.displayName || null,
        addressLine1Override: formData.addressLine1Override || null,
        addressLine2Override: formData.addressLine2Override || null,
        cityOverride: formData.cityOverride || null,
        stateOverride: formData.stateOverride || null,
        postalCodeOverride: formData.postalCodeOverride || null,
        countryOverride: formData.countryOverride || null,
        latitudeOverride: formData.latitudeOverride ? parseFloat(formData.latitudeOverride) : null,
        longitudeOverride: formData.longitudeOverride ? parseFloat(formData.longitudeOverride) : null,
        sortOrder: parseInt(formData.sortOrder, 10),
        visible: formData.visible,
      };

      const response = await fetch(`${apiBaseUrl}/admin/company-locations/${selectedCompanyLocation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Credentials': 'include' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchCompanyLocations(); // Refresh list
      setIsEditModalOpen(false);
      setSelectedCompanyLocation(null);
      resetFormData();
    } catch (err: any) {
      setError(`Failed to update company location: ${err.message}`);
      console.error('Update company location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompanyLocation = async () => {
    if (!companyLocationToDeleteId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/admin/company-locations/${companyLocationToDeleteId}`, {
        method: 'DELETE',
        headers: { 'Credentials': 'include' },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchCompanyLocations(); // Refresh list
      setIsDeleteConfirmOpen(false);
      setCompanyLocationToDeleteId(null);
    } catch (err: any) {
      setError(`Failed to delete company location: ${err.message}`);
      console.error('Delete company location error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Open/Close Handlers ---

  const openAddModal = () => {
    resetFormData();
    setIsAddModalOpen(true);
    fetchAvailableLocations(); // Ensure latest base locations are available
  };

  const openEditModal = (companyLoc: CompanyLocation) => {
    setSelectedCompanyLocation(companyLoc);
    setFormData({
      locationId: companyLoc.locationId, // This field is read-only in edit mode
      displayName: companyLoc.displayName || '',
      addressLine1Override: companyLoc.addressLine1Override || '',
      addressLine2Override: companyLoc.addressLine2Override || '',
      cityOverride: companyLoc.cityOverride || '',
      stateOverride: companyLoc.stateOverride || '',
      postalCodeOverride: companyLoc.postalCodeOverride || '',
      countryOverride: companyLoc.countryOverride || '',
      latitudeOverride: companyLoc.latitudeOverride || '',
      longitudeOverride: companyLoc.longitudeOverride || '',
      sortOrder: companyLoc.sortOrder,
      visible: companyLoc.visible,
    });
    setIsEditModalOpen(true);
    fetchAvailableLocations(); // Ensure latest base locations are available
  };

  const openDeleteConfirm = (id: string) => {
    setCompanyLocationToDeleteId(id);
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

  // --- CompanyLocation Form Component (used in modals) ---


  // Helper to get the effective address/city/country (override or base)
  const getEffectiveAddress = (companyLoc: CompanyLocation) => {
    const city = companyLoc.cityOverride || companyLoc.location.city;
    const country = companyLoc.countryOverride || companyLoc.location.country;
    return `${city || ''}${city && country ? ', ' : ''}${country || ''}`;
  };

  // Helper to get the effective display name
  const getEffectiveDisplayName = (companyLoc: CompanyLocation) => {
    return companyLoc.displayName || companyLoc.location.name;
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Location Management</h1>
        <p className="text-gray-600 mb-6 border-b pb-4">
          Managing locations for Company ID: <span className="font-semibold text-indigo-700">{COMPANY_ID}</span>
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <button
            onClick={openAddModal}
            className="px-6 py-3 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-700 transition duration-150 ease-in-out transform hover:scale-105"
          >
            + Add Location to Company
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading company locations...</div>
        ) : companyLocations.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No locations associated with this company.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Address</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyLocations.map((companyLoc) => (
                  <tr key={companyLoc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getEffectiveDisplayName(companyLoc)}
                      {companyLoc.displayName && (
                        <span className="block text-xs text-gray-500 italic">(Override)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {companyLoc.location.name} ({companyLoc.location.slug})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getEffectiveAddress(companyLoc)}
                      {(companyLoc.cityOverride || companyLoc.countryOverride) && (
                        <span className="block text-xs text-gray-500 italic">(Override)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {companyLoc.visible ? 'Yes' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(companyLoc)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 p-2 rounded-md hover:bg-indigo-50 transition duration-150 ease-in-out"
                        title="Edit Company Location"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(companyLoc.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition duration-150 ease-in-out"
                        title="Remove Association"
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

      {/* Add Company Location Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Location to Company">
        <CompanyLocationForm onSubmit={handleAddCompanyLocation} onClose={() => setIsAddModalOpen(false)} initialData={formData} isEditMode={false} availableLocations={availableLocations} />
      </Modal>

      {/* Edit Company Location Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Company Location">
        <CompanyLocationForm onSubmit={handleUpdateCompanyLocation} onClose={() => setIsEditModalOpen(false)} initialData={formData} isEditMode={true} availableLocations={availableLocations} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
        <div className="p-4">
          <p className="text-gray-700 mb-4">Are you sure you want to remove this location association from your company? This will not delete the base location.</p>
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
              onClick={handleDeleteCompanyLocation}
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
