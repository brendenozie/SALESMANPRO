"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  BriefcaseIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

// Define the structure for a single Lead
interface Lead {
  id: string;
  name: string;
  company: string;
  stage: LeadStage;
  value: number;
  contactDate: string;
  lastActivity: string;
}

// Define possible Lead Stages
type LeadStage = 'New Inquiry' | 'Qualification' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

// Mock data generation
const initialLeads: Lead[] = [
  { id: 'l1', name: 'Sarah Connor', company: 'FutureTech Solutions', stage: 'Negotiation', value: 8000, contactDate: '2025-09-01', lastActivity: '1 day ago' },
  { id: 'l2', name: 'John Doe', company: 'Innovate Hub', stage: 'New Inquiry', value: 3500, contactDate: '2025-10-15', lastActivity: 'Today' },
  { id: 'l3', name: 'Jane Smith', company: 'Global Dynamics', stage: 'Qualification', value: 5000, contactDate: '2025-10-10', lastActivity: '3 days ago' },
  { id: 'l4', name: 'Mike Ross', company: 'Startup X', stage: 'Proposal Sent', value: 12000, contactDate: '2025-09-25', lastActivity: '1 week ago' },
  { id: 'l5', name: 'Lisa Chen', company: 'E-Commerce Pro', stage: 'New Inquiry', value: 4200, contactDate: '2025-10-18', lastActivity: 'Today' },
  { id: 'l6', name: 'Tom Hardy', company: 'DesignWorks', stage: 'Closed Won', value: 15000, contactDate: '2025-08-01', lastActivity: '2 months ago' },
  { id: 'l7', name: 'Amy Wong', company: 'Zenith Consulting', stage: 'Negotiation', value: 6500, contactDate: '2025-09-20', lastActivity: '2 days ago' },
];

const allStages: LeadStage[] = ['New Inquiry', 'Qualification', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'];

// Utility to get visual props for each stage
const getStageProps = (stage: LeadStage) => {
  switch (stage) {
    case 'New Inquiry':
      return { color: 'bg-indigo-100 text-indigo-700 border-indigo-500', dot: 'bg-indigo-500' };
    case 'Qualification':
      return { color: 'bg-amber-100 text-amber-700 border-amber-500', dot: 'bg-amber-500' };
    case 'Proposal Sent':
      return { color: 'bg-purple-100 text-purple-700 border-purple-500', dot: 'bg-purple-500' };
    case 'Negotiation':
      return { color: 'bg-green-100 text-green-700 border-green-500', dot: 'bg-green-500' };
    case 'Closed Won':
      return { color: 'bg-teal-100 text-teal-700 border-teal-500', dot: 'bg-teal-500' };
    case 'Closed Lost':
      return { color: 'bg-gray-200 text-gray-700 border-gray-500', dot: 'bg-gray-500' };
    default:
      return { color: 'bg-gray-100 text-gray-700 border-gray-500', dot: 'bg-gray-500' };
  }
};

// --- MAIN COMPONENT ---
export default function LeadManagementClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<'All' | LeadStage>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Data Loading Effect ---
  useEffect(() => {
    // Simulate API call to fetch leads
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, you would fetch data here
      setLeads(initialLeads);
      setIsLoading(false);
    }, 1000);
  }, []);

  // --- Filtered and Searched Leads ---
  const filteredLeads = useMemo(() => {
    let currentLeads = leads;

    // 1. Filter by Stage
    if (activeStage !== 'All') {
      currentLeads = currentLeads.filter(lead => lead.stage === activeStage);
    }

    // 2. Filter by Search Term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      currentLeads = currentLeads.filter(
        lead =>
          lead.name.toLowerCase().includes(searchLower) ||
          lead.company.toLowerCase().includes(searchLower)
      );
    }

    return currentLeads;
  }, [leads, activeStage, searchTerm]);

  // --- Pipeline Metrics Calculation ---
  const pipelineMetrics = useMemo(() => {
    const totalLeads = leads.length;
    const activePipeline = leads.filter(l => l.stage !== 'Closed Won' && l.stage !== 'Closed Lost');
    const totalPipelineValue = activePipeline.reduce((sum, lead) => sum + lead.value, 0);

    return {
      totalLeads,
      activePipelineCount: activePipeline.length,
      totalPipelineValue,
    };
  }, [leads]);

  // --- Helper Components ---

  const StageTag: React.FC<{ stage: LeadStage }> = ({ stage }) => {
    const { color, dot } = getStageProps(stage);
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
        <span className={`w-2 h-2 rounded-full ${dot}`}></span>
        {stage}
      </span>
    );
  };

  const PipelineMetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; accent: string }> = ({ title, value, icon: Icon, accent }) => (
    <div className="p-5 bg-white rounded-xl shadow-md border-b-4 border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${accent}`} />
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-indigo-600 flex flex-col items-center justify-center">
        <ArrowPathIcon className="w-12 h-12 animate-spin mb-4" />
        <p className="text-xl font-semibold">Analyzing Pipeline Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 text-red-600 flex flex-col items-center justify-center text-center p-4">
        <ExclamationCircleIcon className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Leads Data Unavailable</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* --- Header and CTA --- */}
        <header className="mb-10 p-6 sm:p-8 bg-white rounded-3xl shadow-2xl border-l-8 border-amber-500 flex justify-between items-center flex-wrap gap-4">
          <div className="flex flex-col">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              Lead Management <span className="text-amber-600">Center</span>
              <BriefcaseIcon className="w-10 h-10 text-amber-500" />
            </h1>
            <p className="text-base text-gray-500 font-medium mt-1">Focus on nurturing, conversion, and growth.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.05]">
            <PlusCircleIcon className="w-5 h-5" />
            Add New Lead
          </button>
        </header>

        {/* --- Pipeline Metrics --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <PipelineMetricCard
            title="Total Leads"
            value={pipelineMetrics.totalLeads}
            icon={UsersIcon}
            accent="text-indigo-600"
          />
          <PipelineMetricCard
            title="Active Pipeline"
            value={pipelineMetrics.activePipelineCount}
            icon={FunnelIcon}
            accent="text-amber-600"
          />
          <PipelineMetricCard
            title="Pipeline Value (Potential)"
            value={`$${pipelineMetrics.totalPipelineValue.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            accent="text-green-600"
          />
        </section>

        {/* --- Search and Filters --- */}
        <section className="bg-white p-6 rounded-3xl shadow-xl mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            
            <button className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition">
                Sort By: Last Activity <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Stage Filters */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {['All', ...allStages].map(stage => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage as 'All' | LeadStage)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                  activeStage === stage
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {stage} ({stage === 'All' ? leads.length : leads.filter(l => l.stage === stage).length})
              </button>
            ))}
          </div>
        </section>

        {/* --- Leads Table --- */}
        <section className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <h2 className="text-xl font-bold p-6 border-b border-gray-200 text-gray-900 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-indigo-500" /> Lead Pipeline ({filteredLeads.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Potential Value</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-indigo-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                              <UserCircleIcon className="w-6 h-6 text-gray-400 mr-3" />
                              <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StageTag stage={lead.stage} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                        ${lead.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                        {lead.lastActivity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a href={`/coach/leads/${lead.id}`} className="text-indigo-600 hover:text-indigo-900 font-semibold transition">
                          View Details
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic">
                      No leads found matching the current filters. Try broadening your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
