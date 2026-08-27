'use client';

import React, { useState, useMemo } from 'react';
import { 
  TruckIcon, 
  WrenchScrewdriverIcon, 
  Battery50Icon, 
  ScaleIcon, 
  MapPinIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { Vehicle } from './page';

export default function VehiclesClient({ params }: { params: { companyId: string, vehiclesData: Vehicle[] } }) {
  const [vehicles] = useState<Vehicle[]>(params.vehiclesData);
  const [filter, setFilter] = useState('All');

  const filteredVehicles = useMemo(() => {
    return filter === 'All' ? vehicles : vehicles.filter(v => v.status === filter.toLowerCase());
  }, [vehicles, filter]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Fleet Assets</h1>
          <p className="text-slate-500 font-medium">Monitoring {vehicles.length} units in the Western Region</p>
        </div>
        <button className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all">
          <PlusIcon className="h-5 w-5" /> Register Vehicle
        </button>
      </div>

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Fleet" value={vehicles.length} icon={TruckIcon} color="bg-indigo-600" />
        <StatCard title="In Service" value={vehicles.filter(v => v.status === 'en-route').length} icon={MapPinIcon} color="bg-blue-600" />
        <StatCard title="Maintenance" value={vehicles.filter(v => v.status === 'maintenance').length} icon={WrenchScrewdriverIcon} color="bg-amber-500" />
        <StatCard title="Available" value={vehicles.filter(v => v.status === 'available').length} icon={ScaleIcon} color="bg-emerald-600" />
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input type="text" placeholder="Search VIN, Plate, or Model..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {['All', 'Available', 'En-Route', 'Maintenance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === tab ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((v) => (
          <div key={v.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-indigo-300 transition-all group">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest">{v.type}</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{v.model}</h3>
                  <p className="text-sm font-mono text-slate-400 font-bold">{v.plateNumber}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>

              {/* Telematics Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-400 uppercase">Fuel / Energy</span>
                    <span className={v.fuelLevel < 20 ? 'text-rose-500' : 'text-slate-600'}>{v.fuelLevel}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${v.fuelLevel < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${v.fuelLevel}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-400 uppercase">Health Score</span>
                    <span className="text-slate-600">{v.healthScore}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all" 
                      style={{ width: `${v.healthScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="text-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Current Driver</p>
                    <p className="font-bold text-slate-700">{v.assignedDriver || 'Unassigned'}</p>
                </div>
                <div className="text-sm text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Next Service</p>
                    <p className="font-bold text-slate-700">In 2,400 km</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 flex justify-between items-center group-hover:bg-indigo-50 transition-colors">
              <button className="text-xs font-black text-indigo-600 uppercase tracking-widest">Service History</button>
              <button className="p-2 bg-white rounded-lg shadow-sm text-slate-400 hover:text-indigo-600">
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Helpers ---

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className={`${color} rounded-3xl p-6 text-white shadow-lg shadow-indigo-100`}>
      <Icon className="h-8 w-8 opacity-40 mb-4" />
      <p className="text-xs font-bold opacity-80 uppercase tracking-widest">{title}</p>
      <h3 className="text-4xl font-black">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    'available': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'en-route': 'bg-blue-50 text-blue-600 border-blue-100',
    'maintenance': 'bg-amber-50 text-amber-600 border-amber-100',
    'out-of-service': 'bg-rose-50 text-rose-600 border-rose-100',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${styles[status]}`}>
      {status.replace('-', ' ')}
    </span>
  );
}