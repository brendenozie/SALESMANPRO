// app/admin/[adminSlug]/agents/AgentsClientPage.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  MapPinIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  // Icons for modal form (which remains in client)
  UserCircleIcon,
  AtSymbolIcon,
  DevicePhoneMobileIcon,
  BookOpenIcon,
  TagIcon,
  GlobeAltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Type Definitions (Defined here for the client's internal use and export to parent) ---
// This definition is essential for client-side state management
export type AgentProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  profileImageUrl?: string;
  isActive: boolean;
  specialties: string[];
  regions: string[];
  totalListings: number;
  closedDeals: number;
  joinedAt: string;
};


// Mocking the image loader - Keep if not fully in Next.js Image optimization
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};


// --- Basic Modal Component (Remains Client-side) ---
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

// --- Delete Confirmation Modal Component (Remains Client-side) ---
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agentName: string;
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, agentName, isSubmitting }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-auto text-center border border-gray-200">
      <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6 animate-pulse" />
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
      <p className="text-lg text-gray-600 mb-7">
        Are you sure you want to delete <span className="font-bold text-red-600">"{agentName}"</span>?
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
          {isSubmitting ? "Deleting..." : "Delete Agent"}
        </button>
      </div>
    </div>
  </Modal>
);

// --- Agent Profile Card for the list view (Remains Client-side) ---
// Agent Profile Card for the list view
interface AgentProfileCardProps {
  agent: AgentProfile;
  adminSlug: string;
  onEdit: (agent: AgentProfile) => void; // Changed to trigger modal
  onDelete: (agent: AgentProfile) => void;
}

const AgentProfileCard: React.FC<AgentProfileCardProps> = ({ agent, adminSlug, onEdit, onDelete }) => {

  const joinedDate = useMemo(() => {
    const date = new Date(agent.joinedAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, [agent.joinedAt]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 mr-4">
          <Image
            className="h-20 w-20 rounded-full object-cover border-2 border-indigo-400 shadow-md"
            src={agent.profileImageUrl || `https://ui-avatars.com/api/?name=${agent.name}&background=random&color=fff`}
            alt={`${agent.name}'s profile`}
            width={80}
            height={80}
            loader={customLoader}
          />
        </div>
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-900 leading-tight">{agent.name}</h3>
          <p className="text-xs text-gray-500 flex items-center mt-1">
            <EnvelopeIcon className="h-4 w-4 mr-1" /> {agent.email}
          </p>
          <p className="text-sm text-gray-500 flex items-center mt-0.5">
            <PhoneIcon className="h-4 w-4 mr-1" /> {agent.phone}
          </p>
          <span className={`inline-flex items-center px-3 py-1 mt-2 rounded-full text-xs font-semibold ${
            agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {agent.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">{agent.bio}</p>

      <div className="mb-4">
        <div className="flex items-center text-gray-600 text-sm mb-1">
          <BriefcaseIcon className="h-4 w-4 mr-2" />
          <span className="font-semibold">Specialties:</span> {agent.specialties.join(', ') || 'N/A'}
        </div>
        <div className="flex items-center text-gray-600 text-sm">
          <MapPinIcon className="h-4 w-4 mr-2" />
          <span className="font-semibold">Regions:</span> {agent.regions.join(', ') || 'N/A'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex flex-col">
          <span className="text-gray-500 font-medium">Total Listings:</span>
          <span className="text-indigo-600 text-lg font-bold">{agent.totalListings}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 font-medium">Closed Deals:</span>
          <span className="text-green-600 text-lg font-bold">{agent.closedDeals}</span>
        </div>
      </div>

      <div className="mt-auto flex justify-end space-x-3 pt-4 border-t border-gray-100">
        {/* You can keep this link if you still want a dedicated view page */}
        {/* <Link
          href={`/admin/${adminSlug}/agents/${agent.id}`}
          className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
        >
          <EyeIcon className="h-5 w-5 mr-1" /> View
        </Link> */}
        <button
          onClick={() => onEdit(agent)} // Now opens modal
          className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition"
        >
          <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
        </button>
        <button
          onClick={() => onDelete(agent)}
          className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition"
        >
          <TrashIcon className="h-5 w-5 mr-1" /> Delete
        </button>
      </div>
    </div>
  );
};


// --- Add/Edit Agent Modal Component (Remains Client-side) ---

// --- Add/Edit Agent Modal Component ---
interface AddEditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentProfile | null; // Agent data for editing, null for adding
  onSave: (agentData: Partial<AgentProfile>) => Promise<void>; // Async save function
  isSubmitting: boolean;
}

const AddEditAgentModal: React.FC<AddEditAgentModalProps> = ({ isOpen, onClose, agent, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<AgentProfile>>({});

  useEffect(() => {
    // Initialize form data when modal opens or agent prop changes
    if (agent) {
      setFormData({
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        bio: agent.bio,
        profileImageUrl: agent.profileImageUrl,
        isActive: agent.isActive,
        specialties: agent.specialties,
        regions: agent.regions,
        // totalListings and closedDeals are not editable via this form
        totalListings: agent.totalListings,
        closedDeals: agent.closedDeals,
        joinedAt: agent.joinedAt,
      });
    } else {
      // Reset for adding new agent
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        profileImageUrl: '',
        isActive: true, // Default to active
        specialties: [],
        regions: [],
        // These will be initialized by the API
        totalListings: 0,
        closedDeals: 0,
        joinedAt: new Date().toISOString(),
      });
    }
  }, [agent, isOpen]); // Depend on agent and isOpen to re-initialize

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'specialties' | 'regions') => {
    const value = e.target.value;
    // Split by comma, trim spaces, filter out empty strings
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.bio) {
      toast.error("Please fill in all required fields.");
      return;
    }
    await onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-xl mx-auto border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          {agent ? "Edit Agent Profile" : "Add New Agent"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AtSymbolIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="+2547XXXXXXXX"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Profile Image URL */}
          <div>
            <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL (Optional)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCircleIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="profileImageUrl"
                name="profileImageUrl"
                value={formData.profileImageUrl || ""}
                onChange={handleChange}
                placeholder="https://example.com/profile.jpg"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <div className="relative">
              <div className="absolute top-3 left-3 flex items-center pointer-events-none">
                <BookOpenIcon className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                placeholder="Brief description of the agent's experience and focus areas..."
                rows={4}
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
          </div>

          {/* Specialties (comma-separated) */}
          <div>
            <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-1">Specialties (comma-separated)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TagIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="specialties"
                name="specialties"
                value={formData.specialties?.join(', ') || ""}
                onChange={(e) => handleArrayChange(e, 'specialties')}
                placeholder="e.g., Residential, Commercial, Land"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Separate multiple specialties with commas.</p>
          </div>

          {/* Regions (comma-separated) */}
          <div>
            <label htmlFor="regions" className="block text-sm font-medium text-gray-700 mb-1">Regions (comma-separated)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GlobeAltIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="regions"
                name="regions"
                value={formData.regions?.join(', ') || ""}
                onChange={(e) => handleArrayChange(e, 'regions')}
                placeholder="e.g., Kilimani, Karen, CBD"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Separate multiple regions with commas.</p>
          </div>

          {/* Is Active Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive ?? true} // Default to true if undefined
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Agent is Active
            </label>
          </div>

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
              {isSubmitting ? "Saving..." : (agent ? "Save Changes" : "Add Agent")}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// --- Main AgentsClientPage Component ---
interface AgentsClientPageProps {
  adminSlug: string; // The prop passed from the Server Component
  initialAgents: AgentProfile[]; // Initial data loaded from the server
  isInitialLoadSuccessful: boolean;
}

export default function AgentsClientPage({ adminSlug, initialAgents, isInitialLoadSuccessful }: AgentsClientPageProps) {
  // Initialize state with the data passed from the server
  const [agents, setAgents] = useState<AgentProfile[]>(initialAgents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('All'); // 'All', 'true', 'false'
  const [isLoading, setIsLoading] = useState(false); // Only used for client-side re-fetches
  const [error, setError] = useState<string | null>(isInitialLoadSuccessful ? null : "Initial data fetch failed on server."); // Display server-side error
  const [isSubmitting, setIsSubmitting] = useState(false); // For add/edit/delete operations

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AgentProfile | null>(null);

  const apiBaseUrl = `${apiBaseUrl}/admin/sales-agents`; // Base URL for your API routes

  // --- Handlers for CRUD Operations (Require re-fetch to keep client state synced) ---
  
  const fetchAgents = useCallback(async () => {
    // This is now only called after a CRUD operation (Add/Edit/Delete)
    setIsLoading(true);
    setError(null);
    try {
      // NOTE: Use a *client-side* fetch for subsequent data updates after initial server load
      const res = await fetch(`${apiBaseUrl}?companyId=${adminSlug}`,{ integrity: 'same-origin' });
      if (!res.ok) {
        throw new Error(`Data fetch failed after update. (Status: ${res.status})`);
      }
      
      const dataRes = await res.json();
      const fetchedAgents: AgentProfile[] = dataRes.data.data || [];
      setAgents(fetchedAgents.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
      toast.success("Agents list successfully refreshed!");
      
    } catch (err: any) {
      console.error("Error fetching agents after update:", err);
      setError(err.message || "Failed to refresh agents list.");
      toast.error(err.message || "Failed to refresh agents list.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);


  const handleAddAgent = () => {
    setEditingAgent(null);
    setShowAddEditModal(true);
  };

  const handleEditAgent = (agent: AgentProfile) => {
    setEditingAgent(agent);
    setShowAddEditModal(true);
  };

  const handleSaveAgent = async (formData: Partial<AgentProfile>) => {
    setIsSubmitting(true);
    const toastId = toast.loading(editingAgent ? 'Updating agent...' : 'Adding agent...');

    try {
      let response;
      if (editingAgent) {
        // Update existing agent (PUT request)
        response = await fetch(`${apiBaseUrl}/${editingAgent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Only send fields that can be updated
            name: formData.name, email: formData.email, phone: formData.phone, 
            bio: formData.bio, profileImageUrl: formData.profileImageUrl, isActive: formData.isActive,
            specialties: formData.specialties, regions: formData.regions,
          }),
        });
      } else {
        // Add new agent (POST request)
        response = await fetch(apiBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // Include companyId for creation
            name: formData.name, email: formData.email, password: 'default_password', 
            phone: formData.phone, bio: formData.bio, profileImageUrl: formData.profileImageUrl, 
            isActive: formData.isActive, specialties: formData.specialties, regions: formData.regions, 
            companyId: adminSlug,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingAgent ? 'update' : 'add'} agent.`);
      }

      await fetchAgents(); // Re-fetch the data to update the client list

      toast.success(editingAgent ? 'Agent updated successfully!' : 'Agent added successfully!', { id: toastId });
      setShowAddEditModal(false);
    } catch (error: any) {
      console.error("Error saving agent:", error);
      toast.error(error.message || `Failed to ${editingAgent ? 'update' : 'add'} agent.`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (agent: AgentProfile) => {
    setAgentToDelete(agent);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;

    setIsSubmitting(true);
    setShowDeleteConfirmModal(false);
    const deleteToastId = toast.loading(`Deleting ${agentToDelete.name}...`);

    try {
      const response = await fetch(`${apiBaseUrl}/${agentToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete agent.');
      }

      // Optimistic update: filter out the deleted agent from the state immediately
      setAgents(prev => prev.filter(a => a.id !== agentToDelete.id)); 
      toast.success(`${agentToDelete.name} deleted successfully!`, { id: deleteToastId });
      setAgentToDelete(null);
    } catch (err: any) {
      console.error("Error deleting agent:", err);
      toast.error(err.message || "Failed to delete agent.", { id: deleteToastId });
      setError(err.message || "Failed to delete agent.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- Filtering Logic (Remains Client-side) ---
  const filteredAgents = useMemo(() => {
    return agents.length > 0 ? agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            agent.regions.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesActive = filterActive === 'All' ||
                            (filterActive === 'true' && agent.isActive) ||
                            (filterActive === 'false' && !agent.isActive);
      return matchesSearch && matchesActive;
    }) : [];
  }, [agents, searchTerm, filterActive]);


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Add New Agent Button (Must be inside Client Component to open Modal) */}
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddAgent}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Agent
        </button>
      </div>


      {/* Loading and Error Indicators (Client-side) */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating agent list...
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, specialty, region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
            <select
              id="status-filter"
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents List/Grid (Client-side rendering of filtered state) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Agent Directory</h2>
        {filteredAgents.length === 0 ? (
          <div className="bg-white p-16 rounded-xl shadow-md text-center border border-gray-200">
            <p className="text-2xl text-gray-500 font-semibold">No agents found matching your criteria. 😞</p>
            {(searchTerm || filterActive !== 'All') && (
              <button
                onClick={() => { setSearchTerm(''); setFilterActive('All'); }}
                className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAgents.map((agent) => (
              <AgentProfileCard
                key={agent.id}
                agent={agent}
                adminSlug={adminSlug}
                onEdit={handleEditAgent}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals (Client-side components) */}
      <AddEditAgentModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        agent={editingAgent}
        onSave={handleSaveAgent}
        isSubmitting={isSubmitting}
      />

      {agentToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirmModal}
          onClose={() => setShowDeleteConfirmModal(false)}
          onConfirm={confirmDelete}
          agentName={agentToDelete.name}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}