"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  TruckIcon, MapPinIcon, WrenchScrewdriverIcon, UserGroupIcon, 
  Battery50Icon, ExclamationTriangleIcon, ChevronRightIcon, 
  PlusIcon, GlobeAltIcon, 
  XMarkIcon,
  IdentificationIcon,
  CogIcon
} from "@heroicons/react/24/outline";

interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  type: string;
  capacity: number;
  _count?: {
    routes: number;
    maintenances: number;
  }
}

interface Props {
  initialVehicles: Vehicle[];
  schoolId: string;
}

const TransportFleetClient = ({ initialVehicles, schoolId }: Props) => {
  const [fleet, setFleet] = useState<Vehicle[]>(initialVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    registration: "",
    make: "",
    model: "",
    capacity: 30,
    type: "BUS"
  });

  const toggleMaintenance = async (vehicleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/transport/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setFleet(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus as any } : v));
        toast.success(newStatus === 'MAINTENANCE' ? "Vehicle grounded for service" : "Vehicle cleared for service");
      }
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const activeCount = fleet.filter(v => v.status === 'ACTIVE').length;
  const maintenanceCount = fleet.filter(v => v.status === 'MAINTENANCE').length;

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/transport/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, companyId: schoolId }),
      });
      const result = await res.json();
      if (result.success) {
        setFleet((prev) => [result.data, ...prev]);
        toast.success(`Vehicle ${formData.registration} added!`);
        setIsModalOpen(false);
        setFormData({ registration: "", make: "", model: "", capacity: 30, type: "BUS" });
      } else {
        toast.error(result.message || "Failed to add vehicle");
      }
    } catch (error) {
      toast.error("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#05070A] text-slate-900 dark:text-slate-200 p-8 font-sans transition-colors duration-300">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-yellow-500 rounded-full" />
              <span className="text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em]">Fleet Operations</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Vehicle <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Logistics.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl font-bold text-xs transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
          >
            <PlusIcon className="h-4 w-4 stroke-[3px]" />
            Add Vehicle
          </button>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
               <p className="text-[10px] font-bold text-slate-500 uppercase">Total Fleet</p>
               <h3 className="text-xl font-black text-slate-900 dark:text-white">{fleet.length} Units</h3>
            </div>
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
               <p className="text-[10px] font-bold text-slate-500 uppercase">On Route</p>
               <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-500">{activeCount} Active</h3>
            </div>
            <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
               <p className="text-[10px] font-bold text-slate-500 uppercase">Maintenance</p>
               <h3 className="text-xl font-black text-rose-600 dark:text-rose-500">{maintenanceCount} Pending</h3>
            </div>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {fleet.map((bus) => (
            <div key={bus.id} className="group relative bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-xl dark:hover:bg-slate-900/30 transition-all border-t-4 border-t-slate-300 dark:border-t-slate-800 hover:border-t-yellow-500">
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="space-y-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    bus.status === 'ACTIVE' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-200 dark:border-emerald-500/20' 
                      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500 border-rose-200 dark:border-rose-500/20'
                  }`}>
                    {bus.status}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{bus.make} {bus.model}</h2>
                    <p className="text-sm font-mono text-slate-500 tracking-widest">{bus.registration}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Capacity: {bus.capacity} seats</span>
                  </div>
                </div>

                <div className="flex-grow grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-black/30 rounded-3xl p-4 border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">Routes Assigned</p>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{bus._count?.routes || 0}</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-black/30 rounded-3xl p-4 border border-slate-100 dark:border-slate-800/50">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase">Service History</p>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{bus._count?.maintenances || 0} Logs</div>
                  </div>
                  
                  <button 
                    onClick={() => toggleMaintenance(bus.id, bus.status)}
                    className="col-span-2 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase transition-all"
                  >
                    {bus.status === 'ACTIVE' ? 'Send to Maintenance' : 'Mark as Operational'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ADD VEHICLE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0F1115] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">New Asset Entry</h2>
                <p className="text-xs text-slate-500">Register a new vehicle to the transport network</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">License Plate</label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      required
                      placeholder="KCB 123X"
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all uppercase"
                      value={formData.registration}
                      onChange={(e) => setFormData({...formData, registration: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Make</label>
                  <input 
                    required
                    placeholder="Toyota"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all"
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Model</label>
                  <input 
                    required
                    placeholder="Coaster"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Capacity</label>
                  <div className="relative">
                    <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="number"
                      required
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Vehicle Type</label>
                  <select 
                      className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <optgroup label="Customer Delivery" className="bg-white dark:bg-slate-900">
                        <option value="REF_VAN">Refrigerated Van</option>
                        <option value="CARGO_VAN">Dry Cargo Van</option>
                        <option value="COURIER_BIKE">Delivery Motorbike</option>
                      </optgroup>

                      <optgroup label="Supply Chain" className="bg-white dark:bg-slate-900">
                        <option value="BOX_TRUCK">Box Truck (Lorry)</option>
                        <option value="REF_TRUCK">Heavy Reefer (Cold Chain)</option>
                        <option value="FLATBED">Flatbed Lorry</option>
                      </optgroup>

                      <optgroup label="Utility & Warehouse" className="bg-white dark:bg-slate-900">
                        <option value="FORKLIFT">Industrial Forklift</option>
                        <option value="STAFF_CAR">Staff/Admin Vehicle</option>
                      </optgroup>
                    </select>
                  {/* <select 
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-sm text-slate-900 dark:text-white focus:border-yellow-500 outline-none transition-all appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="BUS">School Bus</option>
                    <option value="VAN">Van / Shuttle</option>
                    <option value="CAR">Staff Car</option>
                  </select> */}
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                type="submit"
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <CogIcon className="h-5 w-5 animate-spin" /> : "Finalize Registration"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default TransportFleetClient;