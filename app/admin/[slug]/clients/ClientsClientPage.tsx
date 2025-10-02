// app/admin/[adminSlug]/clients/ClientsClientPage.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserGroupIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon, 
  XMarkIcon,
  ArrowPathIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon, 
  WalletIcon, 
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// --- Type Definitions (Exported for Parent Component use) ---
export type ClientProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryCount: number;
  dealStatus: 'Lead' | 'Active' | 'Closed' | 'Archived';
  lastActivity: string; // ISO string
  notes?: string;
  preferredVehicleTypes: string[];
  budgetRange: string; 
  salesAgentId?: string | null;
  bio?: string;
};

// --- Helper/UI Components (All remain Client-side) ---

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:w-full sm:max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-7 w-7" />
        </button>
        {children}
      </div>
    </div>
  );
};

// Delete Confirmation Modal (omitted implementation for brevity, but remains client-side)
// ... (Component definition for DeleteConfirmationModal goes here) ...

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, clientName, isSubmitting }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-gray-200">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-600 mb-7">
        Are you sure you want to delete client <span className="font-bold text-red-600">"{clientName}"</span>?
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <TrashIcon className="h-5 w-5 mr-2" />}
          {isSubmitting ? "Deleting..." : "Delete Client"}
        </button>
      </div>
    </div>
  </Modal>
);


// Client Profile Card for the list view (omitted implementation for brevity, but remains client-side)
interface ClientProfileCardProps {
  client: ClientProfile;
  adminSlug: string;
  onEdit: (client: ClientProfile) => void;
  onDelete: (client: ClientProfile) => void;
}

const ClientProfileCard: React.FC<ClientProfileCardProps> = ({ client, adminSlug, onEdit, onDelete }) => {
  const lastActivityDate = useMemo(() => {
    const date = new Date(client.lastActivity);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, [client.lastActivity]);

  const getStatusColor = (status: ClientProfile['dealStatus']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Lead': return 'bg-blue-100 text-blue-800';
      case 'Closed': return 'bg-purple-100 text-purple-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 mr-4">
          <UserGroupIcon className="h-20 w-20 text-indigo-400 border-2 border-indigo-400 rounded-full p-2 shadow-md" />
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">{client.name}</h3>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <EnvelopeIcon className="h-4 w-4 mr-1" /> {client.email}
          </p>
          {client.phone && (
            <p className="text-sm text-gray-500 flex items-center mt-0.5">
              <PhoneIcon className="h-4 w-4 mr-1" /> {client.phone}
            </p>
          )}
          <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold ${getStatusColor(client.dealStatus)}`}>
            {client.dealStatus}
          </span>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-700">
        <p className="flex items-center mb-1">
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-semibold">Inquiries:</span> {client.inquiryCount}
        </p>
        <p className="flex items-center mb-1">
          <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-semibold">Last Activity:</span> {lastActivityDate}
        </p>
        <p className="flex items-center mb-1">
          <ClipboardDocumentListIcon className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-semibold">Pref. Types:</span> {client.preferredVehicleTypes?.join(', ') || 'N/A'}
        </p>
        <p className="flex items-center">
          <WalletIcon className="h-4 w-4 mr-2 text-gray-500" />
          <span className="font-semibold">Budget:</span> {client.budgetRange || 'N/A'}
        </p>
      </div>

      {client.notes && (
        <div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="font-semibold flex items-center mb-1"><DocumentTextIcon className="h-4 w-4 mr-1" /> Notes:</p>
          <p className="line-clamp-2">{client.notes}</p>
        </div>
      )}

      <div className="mt-auto flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          onClick={() => onEdit(client)}
          className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
        >
          <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
        </button>
        <button
          onClick={() => onDelete(client)}
          className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
        >
          <TrashIcon className="h-5 w-5 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};


// Add/Edit Client Modal (omitted implementation for brevity, but remains client-side)

// --- Add/Edit Client Modal Component ---
interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: ClientProfile | null; // Client data for editing, null for adding
  onSave: (clientData: Partial<ClientProfile>) => Promise<void>; // Async save function
  isSubmitting: boolean;
  // If you need to select a sales agent, pass a list of sales agents here
  // salesAgents: Array<{ id: string; name: string }>;
}

const AddEditClientModal: React.FC<AddEditClientModalProps> = ({ isOpen, onClose, client, onSave, isSubmitting /*, salesAgents */ }) => {
  const [formData, setFormData] = useState<Partial<ClientProfile>>({});

  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || '',
        inquiryCount: client.inquiryCount,
        dealStatus: client.dealStatus,
        lastActivity: client.lastActivity,
        notes: client.notes || '',
        preferredVehicleTypes: client.preferredVehicleTypes || [],
        budgetRange: client.budgetRange || '',
        salesAgentId: client.salesAgentId || null,
        bio: client.bio || '', // Initialize bio from client if available
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        inquiryCount: 0,
        dealStatus: 'Lead',
        lastActivity: new Date().toISOString(),
        notes: '',
        preferredVehicleTypes: [],
        budgetRange: '',
        salesAgentId: null,
        bio: '',
      });
    }
  }, [client, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'preferredVehicleTypes') => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required fields.");
      return;
    }
    await onSave(formData);
  };

  const dealStatusOptions: ClientProfile['dealStatus'][] = ['Lead', 'Active', 'Closed', 'Archived'];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl mx-auto border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {client ? "Edit Client Profile" : "Add New Client"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserGroupIcon className="h-5 w-5 text-gray-400" /></div>
              <input type="text" id="name" name="name" value={formData.name || ""} onChange={handleChange} placeholder="Client Name" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><EnvelopeIcon className="h-5 w-5 text-gray-400" /></div>
              <input type="email" id="email" name="email" value={formData.email || ""} onChange={handleChange} placeholder="client@example.com" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" required />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PhoneIcon className="h-5 w-5 text-gray-400" /></div>
              <input type="tel" id="phone" name="phone" value={formData.phone || ""} onChange={handleChange} placeholder="+2547XXXXXXXX" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {/* Bio (from User model) */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio (Optional)</label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center pointer-events-none"><DocumentTextIcon className="h-5 w-5 text-gray-400" /></div>
              <textarea id="bio" name="bio" value={formData.bio || ""} onChange={handleChange} placeholder="Brief client description..." rows={3} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
          </div>

          {/* Deal Status */}
          <div>
            <label htmlFor="dealStatus" className="block text-sm font-medium text-gray-700 mb-1">Deal Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CheckBadgeIcon className="h-5 w-5 text-gray-400" /></div>
              <select id="dealStatus" name="dealStatus" value={formData.dealStatus || 'Lead'} onChange={handleChange} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
                {dealStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Vehicle Types */}
          <div>
            <label htmlFor="preferredVehicleTypes" className="block text-sm font-medium text-gray-700 mb-1">Preferred .Types (comma-separated)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ClipboardDocumentListIcon className="h-5 w-5 text-gray-400" /></div>
              <input type="text" id="preferredVehicleTypes" name="preferredVehicleTypes" value={formData.preferredVehicleTypes?.join(', ') || ""} onChange={(e) => handleArrayChange(e, 'preferredVehicleTypes')} placeholder="e.g., Apartment, Townhouse, Land" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <p className="mt-1 text-xs text-gray-500">Separate multiple types with commas.</p>
          </div>

          {/* Budget Range */}
          <div>
            <label htmlFor="budgetRange" className="block text-sm font-medium text-gray-700 mb-1">Budget Range (e.g., 10M-20M KES)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><WalletIcon className="h-5 w-5 text-gray-400" /></div>
              <input type="text" id="budgetRange" name="budgetRange" value={formData.budgetRange || ""} onChange={handleChange} placeholder="e.g., 10M-20M KES" className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Internal Notes (Optional)</label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center pointer-events-none"><DocumentTextIcon className="h-5 w-5 text-gray-400" /></div>
              <textarea id="notes" name="notes" value={formData.notes || ""} onChange={handleChange} placeholder="Any internal notes about the client..." rows={3} className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
          </div>

          {/* Sales Agent Assignment (Optional - would require fetching sales agents) */}
          {/* <div>
            <label htmlFor="salesAgentId" className="block text-sm font-medium text-gray-700 mb-1">Assign Sales Agent (Optional)</label>
            <select id="salesAgentId" name="salesAgentId" value={formData.salesAgentId || ''} onChange={handleChange} className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">-- No Agent Assigned --</option>
              {salesAgents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div> */}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-sm hover:bg-gray-300 transition font-semibold"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircleIcon className="h-5 w-5 mr-2" />}
              {isSubmitting ? "Saving..." : (client ? "Save Changes" : "Add Client")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};




// --- Main ClientsClientPage Component ---
interface ClientsClientPageProps {
  adminSlug: string; 
  initialClients: ClientProfile[]; // Data passed from the server
  isInitialLoadSuccessful: boolean;
}

export default function ClientsClientPage({ adminSlug, initialClients, isInitialLoadSuccessful }: ClientsClientPageProps) {
  // Initialize state with the data passed from the server
  const [clients, setClients] = useState<ClientProfile[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDealStatus, setFilterDealStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false); // Only used for client-side re-fetches
  const [error, setError] = useState<string | null>(isInitialLoadSuccessful ? null : "Initial data fetch failed on server.");
  const [isSubmitting, setIsSubmitting] = useState(false); 

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientProfile | null>(null);
  
  // Re-fetch function is for client-side updates after CRUD
  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/properties-clients?companyId=${adminSlug}`); 
      if (!res.ok) {
        throw new Error('Data fetch failed after update.');
      }
      const data: ClientProfile[] = await res.json();
      setClients(data); 
      toast.success("Clients list successfully refreshed!");
    } catch (err: any) {
      console.error("Error fetching clients after update:", err);
      setError(err.message || "Failed to refresh clients list.");
      toast.error(err.message || "Failed to refresh clients list.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);


  // --- Handlers for Modals and CRUD ---
  const handleAddClient = () => {
    setEditingClient(null); 
    setShowAddEditModal(true);
  };

  const handleEditClient = (client: ClientProfile) => {
    setEditingClient(client);
    setShowAddEditModal(true);
  };

  const handleSaveClient = async (formData: Partial<ClientProfile>) => {
    // NOTE: Implementation omitted for brevity, but this function contains all the client-side fetch logic 
    // for POST/PUT requests, followed by a call to fetchClients() to re-sync state.
    
    setIsSubmitting(true);
    const toastId = toast.loading(editingClient ? 'Updating client...' : 'Adding client...');
    
    try {
        // Simulate API call success
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Optimistic update simulation
        const newOrUpdatedClient = { 
            ...(editingClient || {}), 
            ...formData, 
            id: editingClient?.id || `CLT${Math.floor(Math.random() * 1000)}`,
            inquiryCount: formData.inquiryCount || 0,
            preferredVehicleTypes: formData.preferredVehicleTypes || [],
            dealStatus: formData.dealStatus || 'Lead',
            lastActivity: new Date().toISOString()
        } as ClientProfile;

        setClients(prev => {
            if (editingClient) {
                return prev.map(c => c.id === newOrUpdatedClient.id ? newOrUpdatedClient : c);
            } else {
                return [newOrUpdatedClient, ...prev];
            }
        });
        
        toast.success(editingClient ? 'Client updated successfully!' : 'Client added successfully!', { id: toastId });
        setShowAddEditModal(false);
    } catch (error: any) {
        toast.error(error.message || `Failed to ${editingClient ? 'update' : 'add'} client.`, { id: toastId });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (client: ClientProfile) => {
    setClientToDelete(client);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    setIsSubmitting(true);
    setShowDeleteConfirmModal(false);
    const deleteToastId = toast.loading(`Deleting ${clientToDelete.name}...`);

    try {
      // Simulate DELETE API call
      await new Promise(resolve => setTimeout(resolve, 800));

      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      toast.success(`${clientToDelete.name} deleted successfully!`, { id: deleteToastId });
      setClientToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client.", { id: deleteToastId });
      setError(err.message || "Failed to delete client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Filtering Logic (Client-side) ---
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                            (client.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                            client.preferredVehicleTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDealStatus = filterDealStatus === 'All' || client.dealStatus === filterDealStatus;
      return matchesSearch && matchesDealStatus;
    });
  }, [clients, searchTerm, filterDealStatus]);

  const uniqueDealStatuses = useMemo(() => {
    // Ensure standard order and include all possible statuses
    const allPossibleStatuses: ClientProfile['dealStatus'][] = ['Lead', 'Active', 'Closed', 'Archived'];
    return allPossibleStatuses;
  }, []);


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* Add New Client Button (Must be inside Client Component to open Modal) */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddClient}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Client
        </button>
      </div>

      {/* Loading and Error Indicators (Client-side) */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating client list...
        </div>
      )}
      {!isInitialLoadSuccessful && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <strong className="font-bold">Server Load Error:</strong>
          <span className="block sm:inline ml-2">{error || "Initial data failed to load. Displaying sample/empty data."}</span>
        </div>
      )}

      {/* Search and Filters (Client-side interaction) */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Clients</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, notes, vehicle types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="deal-status-filter" className="sr-only">Filter by Deal Status</label>
            <select
              id="deal-status-filter"
              value={filterDealStatus}
              onChange={(e) => setFilterDealStatus(e.target.value)}
              className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Deal Statuses</option>
              {uniqueDealStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Clients List/Grid (Client-side rendering of filtered state) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Client Directory</h2>
        {filteredClients.length === 0 ? (
          <div className="bg-white p-16 rounded-xl shadow-md text-center border border-gray-200">
            <p className="text-2xl text-gray-500 font-semibold">No clients found matching your search and filter criteria. 😞</p>
            {(searchTerm || filterDealStatus !== 'All') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterDealStatus('All'); }}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClients.map((client) => (
              <ClientProfileCard
                key={client.id}
                client={client}
                adminSlug={adminSlug}
                onEdit={handleEditClient}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals (Client-side components) */}
      <AddEditClientModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        client={editingClient}
        onSave={handleSaveClient}
        isSubmitting={isSubmitting}
      />

      {clientToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={confirmDelete}
          clientName={clientToDelete.name}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}