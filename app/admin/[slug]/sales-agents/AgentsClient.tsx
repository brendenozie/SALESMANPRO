// app/admin/[slug]/agents/AgentsClient.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UsersIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  MapPinIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  HomeModernIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
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

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number; }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// --- Basic Modal Component ---
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

const generateSampleAgents = (): AgentProfile[] => [
  {
    id: 'AGT001',
    name: 'Aisha Hassan',
    email: 'aisha.hassan@example.com',
    phone: '+254712345678',
    bio: 'A passionate specialist dedicated to finding clients their perfect need in Nairobi. With over 5 years experience, Aisha excels in client satisfaction and negotiations.',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a3dd78721d6?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3',
    isActive: true,
    specialties: ['Residential', 'Luxury Homes', 'Family Homes'],
    regions: ['Kilimani', 'Karen', 'Langata', 'Lavington'],
    totalListings: 22,
    closedDeals: 14,
    joinedAt: new Date('2022-01-01T09:00:00Z').toISOString(),
  },
  {
    id: 'AGT002',
    name: 'David Kimani',
    email: 'david.kimani@example.com',
    phone: '+254723456789',
    bio: 'Commercial guru with an in-depth understanding of investment opportunities in Nairobi CBD and emerging business hubs.',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3',
    isActive: true,
    specialties: ['Commercial', 'Investments', 'Office Spaces'],
    regions: ['CBD', 'Westlands', 'Upper Hill', 'Gigiri'],
    totalListings: 18,
    closedDeals: 12,
    joinedAt: new Date('2021-06-15T10:30:00Z').toISOString(),
  },
];

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
        This action is irreversible.
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
          className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition font-semibold flex items-center disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : <TrashIcon className="h-5 w-5 mr-2" />}
          {isSubmitting ? "Deleting..." : "Delete Agent"}
        </button>
      </div>
    </div>
  </Modal>
);

interface AgentSummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}

const AgentSummaryCard: React.FC<AgentSummaryCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className={`p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${colorClass} text-white flex flex-col items-center justify-center text-center`}>
    <Icon className="h-10 w-10 mb-3 opacity-90" />
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-4xl font-extrabold">{value}</p>
  </div>
);

interface AgentProfileCardProps {
  agent: AgentProfile;
  adminSlug: string;
  onEdit: (agent: AgentProfile) => void;
  onDelete: (agent: AgentProfile) => void;
}

const AgentProfileCard: React.FC<AgentProfileCardProps> = ({ agent, onEdit, onDelete }) => {
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
        <button
          onClick={() => onEdit(agent)}
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

interface AddEditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentProfile | null;
  onSave: (agentData: Partial<AgentProfile>) => Promise<void>;
  isSubmitting: boolean;
}

const AddEditAgentModal: React.FC<AddEditAgentModalProps> = ({ isOpen, onClose, agent, onSave, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<AgentProfile>>({});

  useEffect(() => {
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
        totalListings: agent.totalListings,
        closedDeals: agent.closedDeals,
        joinedAt: agent.joinedAt,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        profileImageUrl: '',
        isActive: true,
        specialties: [],
        regions: [],
        totalListings: 0,
        closedDeals: 0,
        joinedAt: new Date().toISOString(),
      });
    }
  }, [agent, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'specialties' | 'regions') => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item !== ''),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
                placeholder="Brief description..."
                rows={4}
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                required
              ></textarea>
            </div>
          </div>

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
                placeholder="e.g., Residential, Commercial"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

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
                placeholder="e.g., Kilimani, Karen"
                className="w-full p-3 pl-10 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive ?? true}
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
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition font-semibold flex items-center disabled:opacity-50"
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

interface AgentsClientProps {
  companyId: string;
  slug: string;
}

export default function AgentsClient({ companyId }: AgentsClientProps) {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AgentProfile | null>(null);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/sales-agents?companyId=${companyId}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        const data = generateSampleAgents();
        setAgents(data.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
      } else {
        const data: AgentProfile[] = (await res.json()).data;
        setAgents(data.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
      }
      toast.success("Agents loaded successfully!");
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      setError(err.message || "Failed to load agents.");
      toast.error(err.message || "Failed to load agents.");
      const data = generateSampleAgents();
      setAgents(data.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

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
        response = await fetch(`${apiBaseUrl}/${editingAgent.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            bio: formData.bio,
            profileImageUrl: formData.profileImageUrl,
            isActive: formData.isActive,
            specialties: formData.specialties,
            regions: formData.regions,
          }),
        });
      } else {
        response = await fetch(apiBaseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: 'default_password',
            phone: formData.phone,
            bio: formData.bio,
            profileImageUrl: formData.profileImageUrl,
            isActive: formData.isActive,
            specialties: formData.specialties,
            regions: formData.regions,
            companyId: companyId,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${editingAgent ? 'update' : 'add'} agent.`);
      }

      await fetchAgents();
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
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete agent.');
      }

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

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            agent.regions.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesActive = filterActive === 'All' ||
                            (filterActive === 'true' && agent.isActive) ||
                            (filterActive === 'false' && !agent.isActive);
      return matchesSearch && matchesActive;
    });
  }, [agents, searchTerm, filterActive]);

  const totalAgents = agents.length;
  const activeAgents = agents.filter(agent => agent.isActive).length;
  const totalListingsOverall = agents.reduce((sum, agent) => sum + agent.totalListings, 0);
  const totalClosedDealsOverall = agents.reduce((sum, agent) => sum + agent.closedDeals, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Agents <span className="ml-2 text-purple-600 text-base sm:text-xl">🏠🔑</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Oversee your team of professionals, track performance, and manage profiles.
          </p>
        </div>
        <button
          onClick={handleAddAgent}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AgentSummaryCard title="Total Agents" value={totalAgents} icon={UsersIcon} colorClass="bg-gradient-to-br from-blue-500 to-blue-700" />
        <AgentSummaryCard title="Active Agents" value={activeAgents} icon={CheckCircleIcon} colorClass="bg-gradient-to-br from-green-500 to-green-700" />
        <AgentSummaryCard title="Total Listings" value={totalListingsOverall} icon={HomeModernIcon} colorClass="bg-gradient-to-br from-purple-500 to-purple-700" />
        <AgentSummaryCard title="Closed Deals" value={totalClosedDealsOverall} icon={CurrencyDollarIcon} colorClass="bg-gradient-to-br from-yellow-500 to-yellow-700" />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Fetching agent data, please wait...
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

      {!isLoading && !error && (
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
      )}

      {!isLoading && !error && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">Agent Directory</h2>
          {filteredAgents.length === 0 ? (
            <div className="bg-white p-16 rounded-xl shadow-md text-center border border-gray-200">
              <p className="text-2xl text-gray-500 font-semibold">No agents found matching your search and filter criteria. 😞</p>
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
                  adminSlug={companyId}
                  onEdit={handleEditAgent}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </section>
      )}

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
    </div>
  );
}