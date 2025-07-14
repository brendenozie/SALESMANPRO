// app/admin/[adminSlug]/agents/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UsersIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// --- Type Definitions ---
export type AgentProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  profileImageUrl?: string;
  isActive: boolean;
  specialties: string[]; // e.g., ["Residential", "Commercial", "Land"]
  regions: string[]; // e.g., ["Karen", "Kilimani", "CBD"]
  totalListings: number;
  closedDeals: number;
  joinedAt: string;
};

// --- Sample Data Generation ---
const generateSampleAgents = (): AgentProfile[] => [
  {
    id: 'AGT001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+254712345678',
    bio: 'Experienced agent specializing in residential properties in Nairobi. Passionate about helping clients find their dream homes.',
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a3dd78721d6?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isActive: true,
    specialties: ['Residential', 'Luxury Homes'],
    regions: ['Kilimani', 'Karen', 'Langata'],
    totalListings: 15,
    closedDeals: 8,
    joinedAt: new Date('2022-01-01T09:00:00Z').toISOString(),
  },
  {
    id: 'AGT002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+254723456789',
    bio: 'Commercial property expert with a deep understanding of market trends in CBD and Westlands.',
    profileImageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=2670&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isActive: true,
    specialties: ['Commercial', 'Investments'],
    regions: ['CBD', 'Westlands', 'Upper Hill'],
    totalListings: 12,
    closedDeals: 10,
    joinedAt: new Date('2021-06-15T10:30:00Z').toISOString(),
  },
  {
    id: 'AGT003',
    name: 'Emily White',
    email: 'emily.white@example.com',
    phone: '+254734567890',
    bio: 'Dedicated agent for land sales and development projects across Nairobi and its outskirts.',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29329?auto=format&fit=crop&q=80&w=2574&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isActive: false, // Example of an inactive agent
    specialties: ['Land', 'Development'],
    regions: ['Ruiru', 'Syokimau', 'Kiambu'],
    totalListings: 8,
    closedDeals: 3,
    joinedAt: new Date('2023-03-20T11:00:00Z').toISOString(),
  },
];

interface AgentsPageProps {
  params: {
    adminSlug: string;
  };
}

export default function AgentsPage({ params }: AgentsPageProps) {
  const { adminSlug } = params;
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('All'); // 'All', 'true', 'false'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AgentProfile | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      // const res = await fetch(`${apiUrl}/agents?adminSlug=${adminSlug}`);
      // if (!res.ok) throw new Error('Failed to fetch agents');
      // const data: AgentProfile[] = await res.json();
      // setAgents(data);

      const data = generateSampleAgents();
      setAgents(data.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
    } catch (err: any) {
      console.error("Error fetching agents:", err);
      setError(err.message || "Failed to load agents.");
    } finally {
      setIsLoading(false);
    }
  }, [adminSlug]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleDeleteClick = (agent: AgentProfile) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (agentToDelete) {
      setIsLoading(true);
      try {
        // Simulate API call for deletion
        // const res = await fetch(`${apiUrl}/agents/${agentToDelete.id}`, { method: 'DELETE' });
        // if (!res.ok) throw new Error('Failed to delete agent');
        setAgents(prev => prev.filter(a => a.id !== agentToDelete.id));
        setShowDeleteModal(false);
        setAgentToDelete(null);
        // Optionally show a success toast/notification
      } catch (err: any) {
        setError(err.message || "Failed to delete agent.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            agent.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            agent.regions.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesActive = filterActive === 'All' || (filterActive === 'true' && agent.isActive) || (filterActive === 'false' && !agent.isActive);
      return matchesSearch && matchesActive;
    });
  }, [agents, searchTerm, filterActive]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Manage Agents
            <span className="ml-2 text-purple-600 text-base sm:text-xl">👥</span>
          </h1>
          <p className="text-md text-gray-600 mt-1">
            Add, edit, and oversee your team of real estate agents.
          </p>
        </div>
        <Link
          href={`/admin/${adminSlug}/agents/add-new`}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusCircleIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
          Add New Agent
        </Link>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading agents...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-full md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {/* Add more filters, e.g., by specialty, region */}
        </div>

        {/* Agents Table */}
        <div className="overflow-x-auto">
          {filteredAgents.length === 0 && !isLoading && !error ? (
            <p className="text-center text-gray-500 py-8">No agents found matching your criteria.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialties
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listings/Deals
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={agent.profileImageUrl || `https://ui-avatars.com/api/?name=${agent.name}&background=random&color=fff`}
                            alt={`${agent.name}'s profile`}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <p className="flex items-center gap-1"><PhoneIcon className="h-4 w-4" /> {agent.phone}</p>
                      <p className="flex items-center gap-1"><MapPinIcon className="h-4 w-4" /> {agent.regions.join(', ')}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${agent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {agent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.specialties.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Listings: {agent.totalListings} <br />
                      Closed: {agent.closedDeals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/admin/${adminSlug}/agents/${agent.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Details">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link href={`/admin/${adminSlug}/agents/${agent.id}/edit`} className="text-blue-600 hover:text-blue-900" title="Edit">
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(agent)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && agentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete agent "{agentToDelete.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}