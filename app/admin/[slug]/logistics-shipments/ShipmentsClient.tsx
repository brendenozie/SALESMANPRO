'use client';

import React, { useState } from 'react';
import { 
  ArchiveBoxIcon, 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  GlobeAmericasIcon
} from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { Shipment } from './page';

export default function ShipmentsClient({ params }: { params: { companyId: string, shipmentsData: Shipment[] } }) {
  const [shipments] = useState<Shipment[]>(params.shipmentsData);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Inventory & Shipments</h1>
          <p className="text-slate-500 font-medium tracking-tight">Real-time parcel auditing and freight management</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all">
            <ArrowDownTrayIcon className="h-5 w-5" /> Export Manifest
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all">
            + New Shipment
          </button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard label="In Warehouse" count={42} icon={ArchiveBoxIcon} color="text-amber-600" bg="bg-amber-50" />
        <StatusCard label="In Transit" count={128} icon={TruckIcon} color="text-blue-600" bg="bg-blue-50" />
        <StatusCard label="Delivered" count={892} icon={CheckCircleIcon} color="text-emerald-600" bg="bg-emerald-50" />
        <StatusCard label="Pending/Holds" count={5} icon={ClockIcon} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Tracking #, Customer, or SKU..." 
              className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl bg-white">
            <FunnelIcon className="h-4 w-4" /> Filter Options
          </button>
        </div>

        {/* Shipment Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shipment Info</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination Hub</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value/Weight</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-white transition-colors">
                      <GlobeAmericasIcon className="h-5 w-5" />
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="font-mono text-xs font-black text-indigo-600 mb-0.5">{s.trackingNumber}</p>
                    <p className="text-sm font-bold text-slate-800">{s.customer}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{s.content}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyles(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-700">{s.lastLocation}</p>
                    <p className="text-[10px] text-slate-400 italic">Updated 2h ago</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <p className="text-sm font-black text-slate-800">{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-400">{s.weight}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Helpers ---

function StatusCard({ label, count, icon: Icon, color, bg }: any) {
  return (
    <div className={`p-5 rounded-2xl ${bg} border border-white flex items-center gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl bg-white shadow-sm ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{count}</p>
      </div>
    </div>
  );
}

function getStatusStyles(status: string) {
  switch (status) {
    case 'In Transit': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'Delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'In Warehouse': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'On Hold': return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
}