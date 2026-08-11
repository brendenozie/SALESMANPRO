// AdminSettings.jsx
"use client";

import React, { useState } from 'react';
import {
  Cog6ToothIcon, UserPlusIcon, KeyIcon, GlobeAltIcon, PaintBrushIcon,
  TrashIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';

// Dummy Data
const initialAdminUsers = [
  { id: 'ADM001', name: 'Super Admin', email: 'super@admin.com', role: 'Super Admin' },
  { id: 'ADM002', name: 'Content Manager', email: 'content@admin.com', role: 'Content Editor' },
  { id: 'ADM003', name: 'Booking Manager', email: 'booking@admin.com', role: 'Booking Manager' },
];

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminSettings({ params }: PageProps) {

    const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  const [siteName, setSiteName] = useState('TravelSitePro');
  const [contactEmail, setContactEmail] = useState('info@travelsite.com');
  const [adminUsers, setAdminUsers] = useState(initialAdminUsers);

  const handleSaveGeneralSettings = (e:any) => {
    e.preventDefault();
    alert('General settings saved!');
    // console.log({ siteName, contactEmail });
  };

  const handleAddAdmin = (e:any) => {
    e.preventDefault();
    const newAdminName = e.target.elements.newAdminName.value;
    const newAdminEmail = e.target.elements.newAdminEmail.value;
    const newAdminRole = e.target.elements.newAdminRole.value;
    const newId = `ADM${String(adminUsers.length + 1).padStart(3, '0')}`;
    setAdminUsers([...adminUsers, { id: newId, name: newAdminName, email: newAdminEmail, role: newAdminRole }]);
    alert(`Admin ${newAdminName} added!`);
    e.target.reset();
  };

  const handleDeleteAdmin = (id:any) => {
    if (confirm(`Are you sure you want to delete this admin user?`)) {
      setAdminUsers(adminUsers.filter(admin => admin.id !== id));
      alert('Admin user deleted!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-gray-900 mb-8"
      >
        Admin Settings
      </motion.h1>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-8 mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <GlobeAltIcon className="h-7 w-7 text-indigo-600" />
          <span>General Site Settings</span>
        </h2>
        <form onSubmit={handleSaveGeneralSettings} className="space-y-6">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">Website Name</label>
            <input
              type="text"
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end">
            <motion.button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Save Settings
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Admin User Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-md p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <KeyIcon className="h-7 w-7 text-purple-600" />
          <span>Admin User Management</span>
        </h2>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Existing Admin Users</h3>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminUsers.length > 0 ? (
                adminUsers.map((admin) => (
                  <tr key={admin.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admin.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{admin.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <motion.button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                        title="Delete Admin"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                  // colSpan="5"
                   className="px-6 py-4 text-center text-gray-500">No admin users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <UserPlusIcon className="h-6 w-6 text-green-600" />
          <span>Add New Admin User</span>
        </h3>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label htmlFor="newAdminName" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="newAdminName"
              name="newAdminName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="newAdminEmail" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="newAdminEmail"
              name="newAdminEmail"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="newAdminRole" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="newAdminRole"
              name="newAdminRole"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="Content Editor">Content Editor</option>
              <option value="Booking Manager">Booking Manager</option>
              <option value="Super Admin">Super Admin</option>
            </select>
          </div>
          <div className="flex justify-end">
            <motion.button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Add Admin
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}