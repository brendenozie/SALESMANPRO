'use client';

import React, { useState } from 'react';
import {
  BanknotesIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  PlusCircleIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Commission {
  id: string;
  productId: string;
  productName?: string;
  salesAgentId: string;
  agentName?: string;
  commissionEarned: number;
  commissionRate: number;
  status: 'PENDING' | 'COMPLETED' | 'DENIED';
  createdAt: string;
}

export default function CommissionsManagementPage({ initialCommissions, agents, products, companyId }: any) {
  const [commissions, setCommissions] = useState<Commission[]>(initialCommissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAgent, setFilterAgent] = useState('All');
  // Inside CommissionsManagementPage function:
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [currentEditingRate, setCurrentEditingRate] = useState<RateFormData | null>(null);

  const handleSaveRate = async (data: RateFormData) => {
    // Example API call logic
    try {
      const res = await fetch(`/api/admin/commission-rates`, {
        method: data.id ? 'PUT' : 'POST',
        body: JSON.stringify({ ...data, companyId }),
      });
      
      if (res.ok) {
        // Refresh your rates list or local state
        setIsRateModalOpen(false);
        setCurrentEditingRate(null);
      }
    } catch (err) {
      console.error("Failed to save rate", err);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const filteredCommissions = commissions?.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.productName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesAgent = filterAgent === 'All' || c.salesAgentId === filterAgent;
    return matchesSearch && matchesStatus && matchesAgent;
  });

  const totalEarned = commissions?.reduce((sum, c) => sum + c.commissionEarned, 0);
  const pendingCount = commissions?.filter(c => c.status === 'PENDING').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Commission Ledger
            <span className="ml-2 text-orange-600 text-base sm:text-xl">💰</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Track payouts, agent performance, and earnings.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-orange-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BanknotesIcon className="h-7 w-7 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commissions</p>
              <h2 className="text-3xl font-bold text-gray-800">Ksh {totalEarned?.toLocaleString() || '0'}</h2>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ArrowPathIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <h2 className="text-3xl font-bold text-gray-800">{pendingCount || '0'}</h2>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <UserGroupIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Top Agents</p>
              <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                {agents.slice(0, 3).map((agent: any) => (
                  <span key={agent.id} className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {agent.name || 'Agent'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CurrencyDollarIcon className="h-5 w-5 text-orange-500" /> Transaction History
          </h3>
          <button
            onClick={() => {
              setCurrentEditingRate(null);
              setIsRateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md shadow-sm hover:bg-orange-700"
          >
            <PlusCircleIcon className="h-5 w-5" /> Adjust Rates
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by ID or Product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="DENIED">Denied</option>
          </select>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="block py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
          >
            <option value="All">All Agents</option>
            {agents.map((agent: any) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Earned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="relative px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCommissions.length > 0 ? (
                filteredCommissions.map((comm) => (
                  <tr key={comm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(comm.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {comm.agentName || 'Unknown Agent'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comm.productName || 'Generic Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comm.commissionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Ksh {comm.commissionEarned?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-[10px] leading-5 font-bold rounded-full border
                        ${comm.status === 'COMPLETED' ? 'bg-green-100 text-green-800 border-green-200' : 
                          comm.status === 'PENDING' ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                          'bg-red-100 text-red-800 border-red-200'}
                      `}>
                        {comm.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <div className="flex justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-900"><PencilIcon className="h-4 w-4"/></button>
                          {comm.status === 'PENDING' && (
                            <>
                              <button className="text-green-600"><CheckCircleIcon className="h-5 w-5"/></button>
                              <button className="text-red-600"><XCircleIcon className="h-5 w-5"/></button>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 italic">No commission records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CommissionRateModal 
        isOpen={isRateModalOpen} 
        onClose={() => setIsRateModalOpen(false)} 
        onSave={handleSaveRate}
        products={products}
        editingRate={currentEditingRate}
      />
    </div>
  );
}

interface RateFormData {
  id?: string;
  name: string;
  productId: string;
  commissionType: 'PERCENTAGE' | 'FIXED';
  rate: number;
  isActive: boolean;
}

interface RateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RateFormData) => void;
  products: any[]; // Passed from the server component
  editingRate?: RateFormData | null;
}

const CommissionRateModal: React.FC<RateModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  products, 
  editingRate 
}) => {
  const [formData, setFormData] = React.useState<RateFormData>({
    name: '',
    productId: '',
    commissionType: 'PERCENTAGE',
    rate: 0,
    isActive: true,
  });

  // Sync state when editing
  React.useEffect(() => {
    if (editingRate) setFormData(editingRate);
    else setFormData({ name: '', productId: '', commissionType: 'PERCENTAGE', rate: 0, isActive: true });
  }, [editingRate, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">
            {editingRate ? 'Update Rate Policy' : 'Configure New Rate'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-5">
          {/* Policy Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Policy Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Summer Electronics Special"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Target Product</label>
            <select
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-white"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
            >
              <option value="">Select a product...</option>
              {products.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Calculation Type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Rate Type</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm bg-white"
                value={formData.commissionType}
                onChange={(e) => setFormData({ ...formData, commissionType: e.target.value as any })}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (Ksh)</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                {formData.commissionType === 'PERCENTAGE' ? 'Rate (%)' : 'Amount (Ksh)'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-mono"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`} />
              <span className="text-sm font-bold text-gray-700">Status: {formData.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? 'bg-orange-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all"
            >
              {editingRate ? 'Update Policy' : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};