// ServiceManager.tsx (Client Component)

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircleIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon,
  EyeIcon, XMarkIcon,
} from '@heroicons/react/24/solid';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";


// (Service interface, fadeIn, modalVariants, and getStatusColor utility should be defined or imported here)
// Copying Service interface from the original page.tsx for completeness:
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
}


const getStatusColor = (status: Service['status']) => {
  switch (status) {
    case 'ACTIVE': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
    case 'INACTIVE': return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
    case 'ARCHIVED': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
  }
};


// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// Custom Modal Component (re-used from previous pages)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative"
        variants={modalVariants}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};


interface ServiceManagerProps {
  initialServices: Service[];
  companyId: string;
}

export const ServiceManagerClient: React.FC<ServiceManagerProps> = ({ initialServices, companyId }) => {
  // Initialize state with the server-fetched data
  const [services, setServices] = useState<Service[]>(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Service['status']>('All');
  
  // Loading is only true for *subsequent* client-side fetches/CRUD
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  // Modals and selected service state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Form data state (copied from original)
  const [newServiceData, setNewServiceData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '',
    status: 'ACTIVE' as Service['status'],
  });

  const [editServiceData, setEditServiceData] = useState<Partial<Service>>({});
  
  // --- Client-side Fetch/Refetch Logic ---

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      // API call remains the same, but now it's only triggered by user interaction
      const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
      const response = await fetch(`${apiBaseUrl}/admin/health-services?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`);
      
      // ... (Error handling and data parsing)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch services');
      }
      const data: Service[] = await response.json();
      setServices(data);
    } catch (e: any) {
      console.error("Error fetching services:", e);
      setError(e.message || "Failed to load service data.");
    } finally {
      setLoading(false);
    }
  };//, [companyId, searchTerm, filterStatus]);

  // Debounce the fetch call for search/filter changes
  useEffect(() => {
    // Only fetch if initial data is loaded or if user explicitly searched/filtered
    if (searchTerm !== '' || filterStatus !== 'All') {
        const handler = setTimeout(() => {
            fetchServices();
        }, 300); // Debounce search input
        return () => clearTimeout(handler);
    }
  }, [searchTerm, filterStatus, fetchServices]); // Added fetchServices to dependencies

  // Handlers for modal interactions
    const handleAddServiceClick = () => {
      setNewServiceData({
        name: '', description: '', price: 0, duration: '', status: 'ACTIVE',
      });
      setIsAddModalOpen(true);
    };
  
    const handleEdit = (service: Service) => {
      setSelectedService(service);
      setEditServiceData({ ...service });
      setIsEditModalOpen(true);
    };
  
    const handleDelete = (service: Service) => {
      setSelectedService(service);
      setIsDeleteConfirmOpen(true);
    };
  
    const handleView = (service: Service) => {
      setSelectedService(service);
      setIsViewModalOpen(true);
    };
  
    // CRUD operations via API
    const addNewService = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/health-services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...newServiceData, companyId }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add service');
        }
  
        setIsAddModalOpen(false);
        fetchServices(); // Refresh list
      } catch (e: any) {
        console.error("Error adding service:", e);
        setError(e.message || "Failed to add new service.");
      } finally {
        setLoading(false);
      }
    };
  
    const updateService = async () => {
      if (!selectedService) {
        setError("No service selected for update.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/health-services/${selectedService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editServiceData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update service');
        }
  
        setIsEditModalOpen(false);
        fetchServices(); // Refresh list
      } catch (e: any) {
        console.error("Error updating service:", e);
        setError(e.message || "Failed to update service.");
      } finally {
        setLoading(false);
      }
    };
  
    const confirmDeleteService = async () => {
      if (!selectedService) {
        setError("No service selected for deletion.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/admin/health-services/${selectedService.id}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete service');
        }
  
        setIsDeleteConfirmOpen(false);
        fetchServices(); // Refresh list
      } catch (e: any) {
        console.error("Error deleting service:", e);
        setError(e.message || "Failed to delete service.");
      } finally {
        setLoading(false);
      }
    };
   

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ delay: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Search Input (Interactivity) */}
        <div className="relative flex-grow w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search services..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        
        {/* Status Filter (Interactivity) */}
        <select
          className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'All' | Service['status'])}
        >
          <option value="All">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        
        {/* Add Service Button (Interactivity) */}
        <button
          onClick={handleAddServiceClick} 
          className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-bold shadow-md hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Service
        </button>
      </div>

      {loading && (
        <div className="text-center py-8 text-blue-600 dark:text-blue-400">Loading services...</div>
      )}
      {error && (
        <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Service Table Component (Inlined for simplicity, but could be separated as ServiceTable.tsx) */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          {/* ... (Table structure and map logic from original page.tsx) ... */}
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
            {/* Table Header (Static HTML) */}
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Service Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                    <span className="sr-only">Actions</span>
                    </th>
                </tr>
            </thead>
            {/* Table Body (Dynamic content) */}
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                    No services found.
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</div></td>
                    <td className="px-6 py-4 max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">{service.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${service.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{service.duration}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </td>
                    {/* Action buttons (Interactivity) */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => handleView(service)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"><EyeIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleEdit(service)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"><PencilIcon className="w-5 h-5" /></button>
                            <button onClick={() => handleDelete(service)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      
      {/* (Add, Edit, Delete, View Modals with their forms and AnimatePresence wrappers) */}
      {/* Add Service Modal */}
            <AnimatePresence>
              <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Service">
                <form onSubmit={(e) => { e.preventDefault(); addNewService(); }} className="space-y-4">
                  <div>
                    <label htmlFor="newName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
                    <input
                      type="text"
                      id="newName"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newServiceData.name}
                      onChange={(e) => setNewServiceData({ ...newServiceData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea
                      id="newDescription"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newServiceData.description}
                      onChange={(e) => setNewServiceData({ ...newServiceData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="newPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                    <input
                      type="number"
                      id="newPrice"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newServiceData.price}
                      onChange={(e) => setNewServiceData({ ...newServiceData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (e.g., "30 min", "1 hour")</label>
                    <input
                      type="text"
                      id="newDuration"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newServiceData.duration}
                      onChange={(e) => setNewServiceData({ ...newServiceData, duration: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select
                      id="newStatus"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={newServiceData.status}
                      onChange={(e) => setNewServiceData({ ...newServiceData, status: e.target.value as Service['status'] })}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-pink-600 text-white hover:bg-pink-700 transition-colors"
                    >
                      Add Service
                    </button>
                  </div>
                </form>
              </Modal>
            </AnimatePresence>
      
            {/* Edit Service Modal */}
            <AnimatePresence>
              <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Service: ${selectedService?.name || ''}`}>
                <form onSubmit={(e) => { e.preventDefault(); updateService(); }} className="space-y-4">
                  <div>
                    <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</label>
                    <input
                      type="text"
                      id="editName"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={editServiceData.name || ''}
                      onChange={(e) => setEditServiceData({ ...editServiceData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
                    <textarea
                      id="editDescription"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={editServiceData.description || ''}
                      onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                    <input
                      type="number"
                      id="editPrice"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={editServiceData.price || 0}
                      onChange={(e) => setEditServiceData({ ...editServiceData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (e.g., "30 min", "1 hour")</label>
                    <input
                      type="text"
                      id="editDuration"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={editServiceData.duration || ''}
                      onChange={(e) => setEditServiceData({ ...editServiceData, duration: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select
                      id="editStatus"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={editServiceData.status || ''}
                      onChange={(e) => setEditServiceData({ ...editServiceData, status: e.target.value as Service['status'] })}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </Modal>
            </AnimatePresence>
      
            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Are you sure you want to delete service <span className="font-bold">{selectedService?.name}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteService}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </Modal>
            </AnimatePresence>
      
            {/* View Service Details Modal */}
            <AnimatePresence>
              <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Service Details: ${selectedService?.name || ''}`}>
                {selectedService && (
                  <div className="space-y-4 text-gray-700 dark:text-gray-300">
                    <p><strong>Service Name:</strong> {selectedService.name}</p>
                    <p><strong>Description:</strong> {selectedService.description || 'N/A'}</p>
                    <p><strong>Price:</strong> ${selectedService.price.toFixed(2)}</p>
                    <p><strong>Duration:</strong> {selectedService.duration}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedService.status)}`}>{selectedService.status}</span></p>
                    <p><strong>Service ID:</strong> {selectedService.id}</p>
                    <p><strong>Created At:</strong> {selectedService.createdAt}</p>
                  </div>
                )}
              </Modal>
            </AnimatePresence>
      
    </motion.div>
  );
};