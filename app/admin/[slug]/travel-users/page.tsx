// app/[slug]/users/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  UsersIcon, UserCircleIcon, EnvelopeIcon, PhoneIcon, TrashIcon, MagnifyingGlassIcon, PlusCircleIcon
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import ConfirmationModal from '@/components/ConfirmationModal'; // Adjust path as needed
import CreateUserModal from '@/components/CreateUserModal'; // New import
import { useParams } from 'next/navigation';

// Define the UserData interface to match the API response
interface UserData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string; // Maps to Prisma's ROLE enum (e.g., 'USER', 'ADMIN', 'CLIENT')
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // Maps to Prisma's UserStatus enum
  registered: string; // YYYY-MM-DD format
}

export default function AdminUsersPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Renamed for clarity
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // New state for create modal
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);

  // Function to fetch users from the API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/travel-users?companyId=${slug}&search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: UserData[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, searchTerm]);

  // Fetch users on component mount and when search term changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUserClick = (user: UserData) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setIsConfirmModalOpen(false); // Close modal immediately
    setLoading(true); // Show loading state for deletion
    setError(null);

    try {
      const response = await fetch(`/api/admin/travel-users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete user ${userToDelete.name}`);
      }

      // If deletion is successful, update the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));
      alert(`User ${userToDelete.name} deleted successfully.`); // Use alert for simple feedback after modal closes
    } catch (err: any) {
      setError(err.message);
      alert(`Error deleting user: ${err.message}`); // Use alert for error feedback
    } finally {
      setLoading(false);
      setUserToDelete(null); // Clear user to delete
    }
  };

  // Callback function for when a new user is successfully created
  const handleUserCreated = (newUser: UserData) => {
    setUsers(prevUsers => [newUser, ...prevUsers]); // Add new user to the top of the list
    setIsCreateModalOpen(false); // Close the create modal
    alert(`User "${newUser.name}" created successfully!`); // Provide feedback
  };

  const getStatusColor = (status: UserData['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        Manage Users & Customers
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <motion.button
              onClick={() => setIsCreateModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors"
            >
              <PlusCircleIcon className='w-5 h-5' />
              Add New User
            </motion.button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">Loading users...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center mb-4">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && users.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                      <UserCircleIcon className="h-6 w-6 mr-2 text-gray-400" />
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.registered}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <motion.button
                        onClick={() => handleDeleteUserClick(user)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50 transition"
                        title="Delete User"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Confirmation Modal for Deletion */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Confirm Deletion"
        message={`Are you sure you want to delete user "${userToDelete?.name || 'N/A'}"? This action cannot be undone.`}
        confirmText="Delete"
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
        slug={slug}
      />
    </div>
  );
}
