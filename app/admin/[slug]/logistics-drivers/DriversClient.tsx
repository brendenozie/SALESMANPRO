'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  UsersIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  MapPinIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  AtSymbolIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon, // License
  ClockIcon, // On-time rate
  CheckBadgeIcon, // Verification
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { Driver } from './page';

// --- Types ---
export type DriverProfile = Driver & {
  bio: string;
  profileImageUrl?: string;
  licenseClass: string;
  assignedRoutes: string[];
  joinedAt: string;
};

// --- Summary Card ---
const DriverSummaryCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className={`p-6 rounded-xl shadow-md border border-white/20 transition-all ${colorClass} text-white`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium opacity-80 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black mt-1">{value}</h3>
      </div>
      <Icon className="h-8 w-8 opacity-40" />
    </div>
  </div>
);

// --- Main Client Component ---
export default function DriversClient({ params }: { params: { companyId: string, driversData: any[] } }) {
  const { companyId, driversData } = params;
  const [drivers, setDrivers] = useState<DriverProfile[]>(driversData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            d.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Fleet Personnel</h1>
          <p className="text-slate-500">Manage drivers, license compliance, and delivery performance.</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
        >
          <PlusCircleIcon className="h-5 w-5" /> Add New Driver
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <DriverSummaryCard title="Total Drivers" value={drivers.length} icon={UsersIcon} colorClass="bg-slate-900" />
        <DriverSummaryCard title="On Trip" value={drivers.filter(d => d.status === 'on-trip').length} icon={TruckIcon} colorClass="bg-blue-600" />
        <DriverSummaryCard title="Avg. On-Time" value="94%" icon={ClockIcon} colorClass="bg-emerald-600" />
        <DriverSummaryCard title="Active Now" value={drivers.filter(d => d.status === 'active').length} icon={CheckBadgeIcon} colorClass="bg-indigo-500" />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, or license..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-50 border-none rounded-xl py-3 px-6 font-semibold text-slate-600 min-w-[150px]"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Statuses</option>
          <option>Active</option>
          <option>On-Trip</option>
          <option>Offline</option>
        </select>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {filteredDrivers.map((driver) => (
          <div key={driver.id} className="bg-white rounded-3xl border border-slate-200 p-6 hover:shadow-xl transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl overflow-hidden border-2 border-slate-50">
                {driver.profileImageUrl ? (
                    <img src={driver.profileImageUrl} alt="" className="object-cover h-full w-full" />
                ) : "🚚"}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-900 leading-tight">{driver.name}</h3>
                <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${driver.status === 'active' ? 'bg-emerald-500' : driver.status === 'on-trip' ? 'bg-blue-500' : 'bg-slate-300'}`}></span>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{driver.status}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Login Code</p>
                <code className="text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-1 rounded text-sm">{driver.loginCode}</code>
              </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <IdentificationIcon className="h-4 w-4" />
                    <span className="font-medium">License Class:</span> {driver.licenseClass || 'Class A CDL'}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <TruckIcon className="h-4 w-4" />
                    <span className="font-medium">Vehicle:</span> {driver.vehicleType}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl mb-6">
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Deliveries</p>
                    <p className="text-xl font-black text-slate-800">{driver.totalDeliveries}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">On-Time Rate</p>
                    <p className="text-xl font-black text-emerald-600">{driver.onTimeRate}%</p>
                </div>
            </div>

            <div className="flex gap-2">
                <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
                    View Logs
                </button>
                <button className="p-3 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}