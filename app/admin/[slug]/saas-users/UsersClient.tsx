// app/admin/[slug]/users/UsersClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  RocketLaunchIcon, // For Plan
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
// import ConfirmationModal from "@/components/ConfirmationModal";
import { UserItem } from "./page"; // Import UserItem type

// Assuming you have an AddEditUserModal component
// import AddEditUserModal from "@/components/AddEditUserModal";

interface UsersClientProps {
  companyId: string;
  users: UserItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  refetchUsers: (page: number, limit: number, searchTerm?: string, status?: string, plan?: string) => Promise<{ usersData: UserItem[]; totalItems: number; totalPages: number; }>;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function UsersClient({
  companyId,
  users: initialUsers,
  totalItems: initialTotalItems,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
  perPage: initialPerPage,
  refetchUsers,
}: UsersClientProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [totalItems, setTotalItems] = useState(initialTotalItems);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [perPage, setPerPage] = useState(initialPerPage);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlan, setFilterPlan] = useState("");

  const handleRefetch = useCallback(async (pageToFetch: number = currentPage) => {
    setLoading(true);
    try {
      const { usersData, totalItems: newTotalItems, totalPages: newTotalPages } = await refetchUsers(pageToFetch, perPage, searchTerm, filterStatus, filterPlan);
      setUsers(usersData);
      setTotalItems(newTotalItems);
      setTotalPages(newTotalPages);
      setCurrentPage(pageToFetch); // Ensure currentPage is updated
    } catch (error) {
      console.error("Failed to refetch users:", error);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [refetchUsers, perPage, searchTerm, filterStatus, filterPlan, currentPage]);

  useEffect(() => {
    handleRefetch(initialCurrentPage); // Refetch based on initial props on mount
  }, [handleRefetch, initialCurrentPage]);

  // Update local state when server-side props change (e.g., navigation)
  useEffect(() => {
    setUsers(initialUsers);
    setTotalItems(initialTotalItems);
    setTotalPages(initialTotalPages);
    setCurrentPage(initialCurrentPage);
  }, [initialUsers, initialTotalItems, initialTotalPages, initialCurrentPage]);


  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      handleRefetch(newPage);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      // Simulate API call: await fetch(`${apiUrl}/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
      toast.success(`User "${selectedUser.name}" deleted successfully!`);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      handleRefetch(currentPage);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClasses = (status: UserItem['status']) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Inactive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleClasses = (role: UserItem['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'user': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 md:p-10">
      {/* Page Header */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-2">
          User Management
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Oversee all user accounts, roles, and access permissions.
        </p>
      </motion.div>

      {/* Control Bar: Search, Filters, Add User */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-8 space-y-4 md:space-y-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center w-full md:w-auto space-x-2">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRefetch(1); }}
          />
          <select
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
          >
            <option value="">All Plans</option>
            <option value="Free">Free</option>
            <option value="Starter">Starter</option>
            <option value="Pro">Pro</option>
            <option value="Business">Business</option>
          </select>
          <button
            onClick={() => handleRefetch(1)}
            className="ml-2 bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600 transition-colors"
          >
            Apply
          </button>
        </div>
        <motion.button
          onClick={() => {setSelectedUser(null); setShowAddEditModal(true);}}
          className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusIcon className="h-5 w-5" /> Add New User
        </motion.button>
      </motion.div>

      {loading && (
        <div className="text-center py-10 text-indigo-500 dark:text-indigo-400">
          <p className="text-xl">Loading users...</p>
        </div>
      )}

      {!loading && users.length === 0 && (
        <motion.div
          className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="text-gray-500 dark:text-gray-400 text-2xl font-semibold mb-4">
            No users found matching your criteria.
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            Try adjusting your search or filters, or add a new user.
          </p>
        </motion.div>
      )}

      {!loading && users.length > 0 && (
        <>
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
              Displaying <span className="font-bold">{users.length}</span> of{" "}
              <span className="font-bold">{totalItems}</span> users.
            </p>
          </motion.div>

          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Plan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email Verified
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            {user.avatarUrl ? (
                              <Image
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatarUrl}
                                alt={user.name}
                                width={40}
                                height={40}
                              />
                            ) : (
                               <UserCircleIcon className="h-10 w-10 text-gray-400 dark:text-gray-600" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                          <RocketLaunchIcon className="h-4 w-4 text-indigo-500" /> {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClasses(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.emailVerified ? (
                          <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.lastLogin ? format(new Date(user.lastLogin), 'MMM dd, yyyy') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            onClick={() => { setSelectedUser(user); setShowAddEditModal(true); }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit User"
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            onClick={() => { setSelectedUser(user); setShowDeleteConfirm(true); }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete User"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center space-x-4">
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </motion.button>
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    disabled={currentPage === idx + 1 || loading}
                    className={`px-4 py-2 rounded-full font-semibold ${
                      currentPage === idx + 1
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {idx + 1}
                  </motion.button>
                ))}
              </div>
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRightIcon className="h-6 w-6" />
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {/* <AnimatePresence>
        {showAddEditModal && (
          <AddEditUserModal
            show={showAddEditModal}
            onClose={() => {setShowAddEditModal(false); setSelectedUser(null);}}
            initialData={selectedUser}
            companyId={companyId}
            onSaveSuccess={() => handleRefetch(currentPage)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && selectedUser && (
          <ConfirmationModal
            show={showDeleteConfirm}
            onClose={() => {setShowDeleteConfirm(false); setSelectedUser(null);}}
            onConfirm={handleDelete}
            title="Confirm User Deletion"
            message={`Are you sure you want to delete user "${selectedUser.name}" (${selectedUser.email})? This action cannot be undone.`}
            confirmButtonText="Delete User"
            confirmButtonColor="bg-red-600 hover:bg-red-700"
          />
        )}
      </AnimatePresence> */}
    </div>
  );
}

// Ensure you have these icons imported in this file as well for direct use
import { ChevronLeftIcon, ChevronRightIcon, LifebuoyIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

// Dummy AddEditUserModal component (create a real one in components/AddEditUserModal.tsx)
const AddEditUserModal: React.FC<{
  show: boolean;
  onClose: () => void;
  initialData: UserItem | null;
  companyId: string;
  onSaveSuccess: () => void;
}> = ({ show, onClose, initialData, companyId, onSaveSuccess }) => {
  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`${initialData ? 'Updated' : 'Added'} user!`);
    onSaveSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200]">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg m-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{initialData ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input type="text" id="name" defaultValue={initialData?.name || ''} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" id="email" defaultValue={initialData?.email || ''} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100" required />
          </div>
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan</label>
            <select id="plan" defaultValue={initialData?.plan || 'Free'} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100">
              <option value="Free">Free</option>
              <option value="Starter">Starter</option>
              <option value="Pro">Pro</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select id="status" defaultValue={initialData?.status || 'Active'} className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
            >
              {initialData ? 'Save Changes' : 'Add User'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};