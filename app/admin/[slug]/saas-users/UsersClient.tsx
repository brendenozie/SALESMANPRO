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
  RocketLaunchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// Define the UserItem type and enums to make the component self-contained
interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: 'ADMIN' | 'USER' | 'AGENT' | 'CONSUMER' | 'STAFF' | 'WRITER' | 'FRESHMAN' | 'SOPHOMORE' | 'SENIOR' | 'JUNIOR' | 'PARENT' | 'HEADTEACHER' | 'EDUCATOR' | 'STUDENT' | 'CLIENT';
  // 'plan' and 'status' are now strings from the Subscription model.
  plan: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIALING' | null;
  emailVerified: boolean | null;
  lastLogin: string | null;
  createdAt: string;
  profilePicture: string | null;
}

// Define Plan type for the modal dropdown
interface PlanItem {
  id: string;
  name: string;
}

// Loader for Next.js Image component
const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

interface UsersClientProps {
  companyId: string;
  users: UserItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

// Framer Motion variants for animated elements
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

// =========================================================================
// Main UsersClient Component
// =========================================================================
export default function UsersClient({
  companyId,
  users: initialUsers,
  totalItems: initialTotalItems,
  totalPages: initialTotalPages,
  currentPage: initialCurrentPage,
  perPage: initialPerPage,
}: UsersClientProps) {
  const router = useRouter();
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
  const [filterRole, setFilterRole] = useState("");

  // Update local state when server-side props change
  useEffect(() => {
    setUsers(initialUsers);
    setTotalItems(initialTotalItems);
    setTotalPages(initialTotalPages);
    setCurrentPage(initialCurrentPage);
  }, [initialUsers, initialTotalItems, initialTotalPages, initialCurrentPage]);

  // Function to refetch data based on current filters and pagination
  const handleRefetch = useCallback((pageToFetch: number = currentPage) => {
    setLoading(true);
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set("page", String(pageToFetch));
    if (searchTerm) newSearchParams.set("search", searchTerm);
    if (filterStatus) newSearchParams.set("status", filterStatus);
    if (filterPlan) newSearchParams.set("plan", filterPlan);
    if (filterRole) newSearchParams.set("role", filterRole);
    
    router.push(`/admin/${companyId}/users?${newSearchParams.toString()}`);
  }, [router, companyId, currentPage, searchTerm, filterStatus, filterPlan, filterRole]);

  // Handler for page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      handleRefetch(newPage);
    }
  };

  // Handler for deleting a user
  const handleDelete = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }
      
      toast.success(`User "${selectedUser.name}" deleted successfully!`);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
      handleRefetch(currentPage);
    } catch (error: any) {
      console.error("Failed to delete user:", error.message);
      toast.error("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handler for saving (creating or updating) a user
  const handleSaveUser = async (formData: any, userId: string | null) => {
    setLoading(true);
    try {
      const url = userId ? `${apiBaseUrl}/admin/users/${userId}` : `${apiBaseUrl}/admin/users`;
      const method = userId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, companyId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${userId ? 'update' : 'create'} user.`);
      }

      toast.success(`User ${userId ? 'updated' : 'created'} successfully!`);
      setShowAddEditModal(false);
      setSelectedUser(null);
      handleRefetch(currentPage);
    } catch (error: any) {
      console.error("Failed to save user:", error.message);
      toast.error(`Failed to ${userId ? 'update' : 'create'} user.`);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Update status classes to match the new SubscriptionStatus enum
  const getStatusClasses = (status: UserItem['status']) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'TRIALING': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'CANCELLED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'EXPIRED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleClasses = (role: UserItem['role']) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'STAFF': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'USER': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 md:p-10 font-sans">
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
        className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg mb-8 space-y-4 md:space-y-0 md:space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Search Input */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRefetch(1); }}
          />
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-2/3 items-center">
          <select
            className="p-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300 w-full"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {/* NEW: Updated status options */}
            <option value="ACTIVE">Active</option>
            <option value="TRIALING">Trialing</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <select
            className="p-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300 w-full"
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
          >
            <option value="">All Plans</option>
            {/* These options now need to be dynamically populated */}
            {/* For now, we'll keep the old ones but this should be fetched from the server */}
            <option value="FREE">Free</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="BUSINESS">Business</option>
          </select>
          <select
            className="p-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300 w-full"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="STAFF">Staff</option>
            <option value="MODERATOR">MODERATOR</option>
            <option value="USER">User</option>
          </select>
          <motion.button
            onClick={() => handleRefetch(1)}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-500 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-600 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Apply
          </motion.button>
        </div>
        
        {/* Add User Button */}
        <motion.button
          onClick={() => {setSelectedUser(null); setShowAddEditModal(true);}}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 w-full md:w-auto bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PlusIcon className="h-5 w-5" /> Add New User
        </motion.button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="ml-4 text-xl text-indigo-500 dark:text-indigo-400">Loading users...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <motion.div
          className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
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

      {/* User Table */}
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
                            {user.profilePicture ? (
                              <Image
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profilePicture}
                                alt={user.name || "User"}
                                width={40}
                                height={40}
                                loader={loader}
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
                          <RocketLaunchIcon className="h-4 w-4 text-indigo-500" /> {user.plan || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(user.status)}`}>
                          {user.status || 'N/A'}
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
            <div className="mt-12 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
      <AnimatePresence>
        {showAddEditModal && (
          <AddEditUserModal
            onClose={() => {setShowAddEditModal(false); setSelectedUser(null);}}
            initialData={selectedUser}
            companyId={companyId}
            onSaveSuccess={handleSaveUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && selectedUser && (
          <ConfirmationModal
            onClose={() => {setShowDeleteConfirm(false); setSelectedUser(null);}}
            onConfirm={handleDelete}
            title="Confirm User Deletion"
            message={`Are you sure you want to delete user "${selectedUser.name}" (${selectedUser.email})? This action cannot be undone.`}
            confirmButtonText="Delete User"
            confirmButtonColor="bg-red-600 hover:bg-red-700"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================================================
// Add/Edit User Modal Component
// =========================================================================
const AddEditUserModal: React.FC<{
  onClose: () => void;
  initialData: UserItem | null;
  companyId: string;
  onSaveSuccess: (formData: any, userId: string | null) => Promise<void>;
}> = ({ onClose, initialData, companyId, onSaveSuccess }) => {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'USER',
    emailVerified: initialData?.emailVerified || false,
    profilePicture: initialData?.profilePicture || null,
    // NEW: Subscription details
    planId: '',
    subscriptionStatus: initialData?.status || 'ACTIVE'
  });

  useEffect(() => {
    // Fetch available plans from the server
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/admin/plans?companyId=${companyId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch plans.");
        }
        const fetchedPlans = await response.json();
        setPlans(fetchedPlans);
        setLoadingPlans(false);

        // Set the initial planId for the user if they have one
        if (initialData?.plan) {
          const currentPlan = fetchedPlans.find((p: PlanItem) => p.name === initialData.plan);
          if (currentPlan) {
            setFormData(prev => ({ ...prev, planId: currentPlan.id }));
          }
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load plans.");
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, [companyId, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSuccess(formData, initialData?.id || null);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg m-4"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
          {initialData ? 'Edit User' : 'Add New User'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input type="text" id="name" value={formData.name || ''} onChange={handleChange} className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" id="email" value={formData.email || ''} onChange={handleChange} className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="planId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Plan</label>
              <select 
                id="planId" 
                value={formData.planId} 
                onChange={handleChange} 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
                required
              >
                {loadingPlans ? (
                  <option value="">Loading plans...</option>
                ) : (
                  <>
                    <option value="">Select a plan</option>
                    {plans.map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.name}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="subscriptionStatus" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select 
                id="subscriptionStatus" 
                value={formData.subscriptionStatus} 
                onChange={handleChange} 
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300"
              >
                <option value="ACTIVE">Active</option>
                <option value="TRIALING">Trialing</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select id="role" value={formData.role} onChange={handleChange} className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 transition-all duration-300">
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
              <option value="USER">User</option>
              <option value="CLIENT">Client</option>
            </select>
          </div>
          <div className="flex justify-end space-x-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-lg font-semibold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {initialData ? 'Update User' : 'Add User'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};


// =========================================================================
// Confirmation Modal Component (used for delete)
// =========================================================================
const ConfirmationModal: React.FC<{
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText: string;
  confirmButtonColor: string;
}> = ({ onClose, onConfirm, title, message, confirmButtonText, confirmButtonColor }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[200] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-sm m-4 text-center"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <motion.button
            onClick={onClose}
            className="px-6 py-2 text-lg font-semibold text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className={`px-6 py-2 text-lg font-semibold text-white ${confirmButtonColor} rounded-lg shadow-md transition-all`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {confirmButtonText}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
