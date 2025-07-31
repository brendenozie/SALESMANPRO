// app/admin/[adminSlug]/clients/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserGroupIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon, // For lead status or verified client
  XMarkIcon,
  ArrowPathIcon, // For submitting state
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon, // For preferred vehicle types
  WalletIcon, // For budget range
  DocumentTextIcon,
  CurrencyDollarIcon, // For notes
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast'; // For notifications

// --- Basic Modal Component (If you have your own, replace this) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};


const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose} // Close when clicking outside
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:w-full sm:max-w-xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
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

// --- Type Definitions (Must match the structure returned by your API) ---
export type ClientProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  inquiryCount: number;
  dealStatus: 'Lead' | 'Active' | 'Closed' | 'Archived'; // Ensure this matches API's string/enum
  lastActivity: string; // ISO string
  notes?: string;
  preferredVehicleTypes: string[];
  budgetRange: string; // e.g., "10M-20M KES"
  // Add salesAgentId if you want to display or edit it here
  salesAgentId?: string | null;
  // Add bio if you want to display or edit it here (from User model)
  bio?: string;
};

// --- Helper Components ---

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
        This action is irreversible and will permanently remove all associated data.
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

interface ClientSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

const ClientSummaryCard: React.FC<ClientSummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-center justify-center text-center`}>
    <Icon className="h-10 w-10 mb-3 opacity-90" />
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-4xl font-extrabold">{value}</p>
  </div>
);

// Client Profile Card for the list view
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
          {/* Using a generic user icon for clients as profilePicture might not be common */}
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
          <span className="font-semibold">Pref. Types:</span> {client.preferredVehicleTypes.join(', ') || 'N/A'}
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
        {/* <Link
          href={`/admin/${adminSlug}/properties-clients/${client.id}`}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
        >
          <EyeIcon className="h-5 w-5 mr-1" /> View
        </Link> */}
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
            <label htmlFor="preferredVehicleTypes" className="block text-sm font-medium text-gray-700 mb-1">Preferred Vehicle Types (comma-separated)</label>
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


// --- Main ClientsPage Component ---
interface ClientsPageProps {
  params: {
    slug: string;
  };
}

export default function ClientsPage({ params }: ClientsPageProps) {
  const { slug } = params;
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDealStatus, setFilterDealStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For add/edit/delete operations

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null); // Null for add, ClientProfile for edit
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<ClientProfile | null>(null);

  const apiUrl = '/api/admin/properties-clients'; // Base URL for your API routes

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}?companyId=${slug}`); // Call the GET API route
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch clients');
      }
      const data: ClientProfile[] = await res.json();
      setClients(data); // Data is already sorted by createdAt in API
      toast.success("Clients loaded successfully!");
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      setError(err.message || "Failed to load clients.");
      toast.error(err.message || "Failed to load clients.");
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed if apiUrl is constant

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // --- Handlers for Modals ---
  const handleAddClient = () => {
    setEditingClient(null); // Clear any previous editing state
    setShowAddEditModal(true);
  };

  const handleEditClient = (client: ClientProfile) => {
    setEditingClient(client);
    setShowAddEditModal(true);
  };

  const handleSaveClient = async (formData: Partial<ClientProfile>) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingClient ? 'Updating client...' : 'Adding client...');

    try {
      let response;
      if (editingClient) {
        // Update existing client (PUT request)
        response = await fetch(`${apiUrl}/${editingClient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio, // Pass bio for User update
            salesAgentId: formData.salesAgentId,
            inquiryCount: formData.inquiryCount,
            dealStatus: formData.dealStatus,
            lastActivity: formData.lastActivity,
            notes: formData.notes,
            preferredVehicleTypes: formData.preferredVehicleTypes,
            budgetRange: formData.budgetRange,
          }),
        });
      } else {
        // Add new client (POST request)
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: 'default_client_password', // IMPORTANT: Handle this securely in production
            phone: formData.phone,
            bio: formData.bio, // Pass bio for User creation
            companyId: slug, // TODO: Replace with actual company ID logic from auth context
            salesAgentId: formData.salesAgentId,
            inquiryCount: formData.inquiryCount,
            dealStatus: formData.dealStatus,
            lastActivity: formData.lastActivity,
            notes: formData.notes,
            preferredVehicleTypes: formData.preferredVehicleTypes,
            budgetRange: formData.budgetRange,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingClient ? 'update' : 'add'} client.`);
      }

      // Re-fetch all clients to get the latest data from the database
      await fetchClients();

      toast.success(editingClient ? 'Client updated successfully!' : 'Client added successfully!', { id: toastId });
      setShowAddEditModal(false); // Close modal on success
    } catch (error: any) {
      console.error("Error saving client:", error);
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
      const response = await fetch(`${apiUrl}/${clientToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete client.');
      }

      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      toast.success(`${clientToDelete.name} deleted successfully!`, { id: deleteToastId });
      setClientToDelete(null);
    } catch (err: any) {
      console.error("Error deleting client:", err);
      toast.error(err.message || "Failed to delete client.", { id: deleteToastId });
      setError(err.message || "Failed to delete client.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    const statuses = Array.from(new Set(clients.map(c => c.dealStatus)));
    // Ensure standard order and include all possible statuses if not present in data
    const allPossibleStatuses: ClientProfile['dealStatus'][] = ['Lead', 'Active', 'Closed', 'Archived'];
    return allPossibleStatuses.filter(status => statuses.includes(status) || true); // Always include all for dropdown
  }, [clients]);

  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.dealStatus === 'Active').length;
  const leads = clients.filter(client => client.dealStatus === 'Lead').length;
  const closedDeals = clients.filter(client => client.dealStatus === 'Closed').length;


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Vehicle Clients <span className="ml-2 text-orange-600 text-base sm:text-xl">🤝</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Keep track of all your client interactions and deal progress.
          </p>
        </div>
        <button
          onClick={handleAddClient}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Client
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ClientSummaryCard title="Total Clients" value={totalClients} icon={UserGroupIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <ClientSummaryCard title="Active Deals" value={activeClients} icon={CheckBadgeIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
        <ClientSummaryCard title="New Leads" value={leads} icon={ChatBubbleLeftRightIcon} colorClass="bg-gradient-to-br from-orange-500 to-orange-700" />
        <ClientSummaryCard title="Closed Deals" value={closedDeals} icon={CurrencyDollarIcon} colorClass="bg-gradient-to-br from-purple-500 to-purple-700" />
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching client data, please wait...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Oops! Error:</strong>
            <span className="block sm:inline ml-2">{error} Please try refreshing the page.</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      {!isLoading && !error && (
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
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
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
            {/* Future: Add more sophisticated filters here (e.g., by preferred vehicle type, budget range) */}
          </div>
        </div>
      )}

      {/* Clients List/Grid */}
      {!isLoading && !error && (
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
                  adminSlug={slug}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add/Edit Client Modal */}
      <AddEditClientModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        client={editingClient}
        onSave={handleSaveClient}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={confirmDelete}
          clientName={clientToDelete.name}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
