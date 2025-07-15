// app/admin/[adminSlug]/users/page.tsx
"use client";

import React from 'react';
import AdminLayout from '../../../../components/AdminLayout'; // Adjust path as needed
import { motion } from 'framer-motion';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/solid';

const sampleUsers = [
  { id: "usr1", name: "Alice Smith", email: "alice.s@example.com", role: "Admin", status: "Active" },
  { id: "usr2", name: "Bob Johnson", email: "bob.j@example.com", role: "Editor", status: "Active" },
  { id: "usr3", name: "Charlie Brown", email: "charlie.b@example.com", role: "Contributor", status: "Pending" },
  { id: "usr4", name: "Diana Prince", email: "diana.p@example.com", role: "Viewer", status: "Active" },
];

export default function UserManagementPage() {
  const handleEdit = (id: string) => alert(`Edit user ${id}`);
  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete user ${id}?`)) {
      alert(`User ${id} deleted.`);
    }
  };
  const handleAddUser = () => alert("Add new user form will open.");

  return (
    <div>
      <div className="flex justify-end mb-6">
        <motion.button
          onClick={handleAddUser}
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Add New User
        </motion.button>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sampleUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-8 w-8 text-gray-400 mr-3" />
                    <div className="text-lg font-medium text-white">{user.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-gray-400">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'Editor' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'Contributor' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <motion.button
                    onClick={() => handleEdit(user.id)}
                    className="text-indigo-400 hover:text-indigo-300 mr-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Edit ${user.name}`}
                  >
                    <PencilIcon className="h-5 w-5 inline" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-400 hover:text-red-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Delete ${user.name}`}
                  >
                    <TrashIcon className="h-5 w-5 inline" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}