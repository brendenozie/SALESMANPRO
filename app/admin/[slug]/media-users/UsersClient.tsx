// app/admin/[adminSlug]/users/UsersClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Type Definitions ---
type UserRole = 'Admin' | 'Editor' | 'Contributor' | 'Viewer';
type UserStatus = 'Active' | 'Pending' | 'Inactive';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  companyId: string;
}

interface UsersClientProps {
  companyId: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface UserFormProps {
  user?: User;
  onSubmit: (userData: Omit<User, 'id' | 'companyId'> & { id?: string }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  user: User | null;
  isSubmitting: boolean;
}

// --- Reusable Modal Component ---
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl p-8 transform-gpu"
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-800 mb-6">
          <h3 className="text-2xl font-extrabold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// --- User Form Component (Add/Edit) ---
const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isSubmitting }) => {
  const [form, setForm] = useState<Omit<User, 'id' | 'companyId'> & { id?: string }>(user || {
    name: '',
    email: '',
    role: 'Editor',
    status: 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-3 transition-colors"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-3 transition-colors"
          >
            <option value="Admin">Admin</option>
            <option value="Editor">Editor</option>
            <option value="Contributor">Contributor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-xl bg-gray-800 border-gray-700 text-white shadow-sm focus:border-red-500 focus:ring-red-500 p-3 transition-colors"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-red-800 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Saving...' : 'Save User'}
        </button>
      </div>
    </form>
  );
};

// --- Delete Confirmation Modal Component ---
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, user, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm User Deletion">
      <p className="text-gray-300 mb-6 text-lg">
        Are you sure you want to delete user <strong className="text-white">"{user?.name}"</strong>? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-full font-semibold transition-colors ${
            isSubmitting ? 'bg-red-800 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
};

// --- Main Client Component ---
export default function UsersClient({ companyId }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/users?companyId=${companyId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchUsers();
    }
  }, [companyId, fetchUsers]);

  const handleAddUser = async (userData: Omit<User, 'id' | 'companyId'> & { id?: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...userData, companyId }),
      });

      if (!response.ok) throw new Error('Failed to create user');
      const newUser = (await response.json()).data || await response.json();
      setUsers(prev => [...prev, newUser]);
      setIsAddModalOpen(false);
    } catch {
      // Handle error gracefully
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (updatedData: Omit<User, 'id' | 'companyId'> & { id?: string }) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update user');
      const updatedUser = (await response.json()).data || await response.json();
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch {
      // Handle error gracefully
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    } catch {
      // Handle error gracefully
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <div className="flex space-x-3">
          <motion.button
            onClick={fetchUsers}
            className="inline-flex items-center px-4 py-3 bg-gray-800 text-gray-300 font-semibold rounded-full shadow-lg transition-colors hover:bg-gray-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" /> Refresh
          </motion.button>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon className="h-5 w-5 mr-2" /> Add New User
          </motion.button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No users found. Add your first user above.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/50 transition-colors duration-150"
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
                      onClick={() => handleEditClick(user)}
                      className="text-indigo-400 hover:text-indigo-300 mr-4"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={`Edit ${user.name}`}
                    >
                      <PencilIcon className="h-5 w-5 inline" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteClick(user)}
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
        )}
      </div>

      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User">
          <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
          <UserForm user={selectedUser || undefined} onSubmit={handleUpdateUser} onCancel={() => setIsEditModalOpen(false)} isSubmitting={isSubmitting} />
        </Modal>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          user={selectedUser}
          isSubmitting={isSubmitting}
        />
      </AnimatePresence>
    </div>
  );
}