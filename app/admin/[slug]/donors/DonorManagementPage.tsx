"use client";
// Example usage in a parent component (e.g., DonorsClient.tsx or a new DonorManagementPage.tsx)
import React, { useState, useEffect } from 'react';
import DonorForm from './DonorForm'; // Adjust path as needed
import Modal from '@/components/Modal'; // Your existing Modal component


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// Assume these types are defined globally or imported
interface User { id: string; name: string | null; email: string; }
interface Company { id: string; name: string; }
interface Donor {
  id: string;
  userId: string;
  phoneNumber: string | null;
  companyId: string | null;
  user?: User;
  company?: Company;
}

const DonorManagementPage = ({ donationsData, donorsData, projectsData, campaignsData  } : any) => {

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<Donor | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([
    { id: 'user_abc', name: 'Alice Smith', email: 'alice@example.com' },
    { id: 'user_xyz', name: 'Bob Johnson', email: 'bob@example.com' },
  ]);
  const [companies, setCompanies] = useState<Company[]>([
    { id: 'comp_1', name: 'Tech Solutions Inc.' },
    { id: 'comp_2', name: 'Global Charity Foundation' },
  ]);

  // Placeholder for your actual donor data
  const [donors, setDonors] = useState<Donor[]>([
    { id: 'donor_1', userId: 'user_abc', phoneNumber: '+1234567890', companyId: 'comp_1',
      user: { id: 'user_abc', name: 'Alice Smith', email: 'alice@example.com' },
      company: { id: 'comp_1', name: 'Tech Solutions Inc.' }
    },
    { id: 'donor_2', userId: 'user_xyz', phoneNumber: null, companyId: null,
      user: { id: 'user_xyz', name: 'Bob Johnson', email: 'bob@example.com' }
    },
  ]);


  const handleAddDonor = () => {
    setEditingDonor(undefined); // Clear any existing data
    setIsFormModalOpen(true);
  };

  const handleEditDonor = (donor: Donor) => {
    setEditingDonor(donor);
    setIsFormModalOpen(true);
  };

  const handleSubmitDonorForm = async (formData: any) => { // Use specific type for formData
    setIsLoading(true);
    try {
      let response;
      if (editingDonor) {
        // Logic to update existing donor
        response = await fetch(`${apiBaseUrl}/admin/donors/${editingDonor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        // Logic to create new donor
        response = await fetch(`${apiBaseUrl}/admin/donors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const result = await response.json();
        // console.log('Donor saved:', result);
        // In a real app, you'd refresh your donor list here
        // For now, just close the modal
        setIsFormModalOpen(false);
        setEditingDonor(undefined);
        // You might want to trigger a data refresh for the main list
        // e.g., fetchDonors();
      } else {
        const errorData = await response.json();
        // console.error('Failed to save donor:', errorData);
        // Handle error, maybe display it in the form
      }
    } catch (error) {
      // console.error('API call failed:', error);
      // Handle network or unexpected errors
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-8 text-center text-teal-400">Donor Management</h1>

      <button
        onClick={handleAddDonor}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 transition-all mb-8"
      >
        Add New Donor
      </button>

      {/* Display existing donors (simple list for demonstration) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donors.map(donor => (
          <div key={donor.id} className="bg-gray-800 p-6 rounded-lg shadow-md flex justify-between items-center">
            <div>
              <p className="text-xl font-semibold text-teal-300">{donor.user?.name || donor.user?.email || 'Anonymous'}</p>
              {donor.phoneNumber && <p className="text-sm text-gray-400">{donor.phoneNumber}</p>}
              {donor.company && <p className="text-sm text-gray-400">Company: {donor.company.name}</p>}
            </div>
            <button
              onClick={() => handleEditDonor(donor)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            >
              Edit
            </button>
          </div>
        ))}
      </div>


      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingDonor ? 'Edit Donor Profile' : 'Create New Donor Profile'}
      >
        <DonorForm
          initialData={editingDonor}
          onSubmit={handleSubmitDonorForm}
          onCancel={() => setIsFormModalOpen(false)}
          isLoading={isLoading}
          users={users} // Pass your actual user data here
          companies={companies} // Pass your actual company data here
        />
      </Modal>
    </div>
  );
};

export default DonorManagementPage;