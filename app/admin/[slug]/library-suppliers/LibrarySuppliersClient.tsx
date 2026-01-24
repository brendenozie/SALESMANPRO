"use client";

import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { 
  TruckIcon, 
  BuildingOffice2Icon, 
  PhoneIcon, 
  GlobeAltIcon,
  TagIcon,
  ShoppingBagIcon,
  ArrowUpRightIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface Supplier {
  id: string;
  name: string;
  category: string;
  leadTime: string;
  status: string;
  reliability: number;
  contact: string;
}

const LibrarySuppliersClient = ({ initialSuppliers = [], schoolId = "" }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', category: '', contact: '' });

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`/api/admin/library/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newVendor,
          contactEmail: newVendor.contact,
          companyId: schoolId
        })
      });

      if (res.ok) {
        const { data } = await res.json();
        setSuppliers([data, ...suppliers]);
        setIsModalOpen(false);
        setNewVendor({ name: '', category: '', contact: '' });
        toast.success(`${data.name} successfully integrated!`);
      }
    } catch (error) {
      toast.error("Onboarding failed. Please check vendor details.");
    }
  };

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <Toaster position="top-right" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-8 bg-cyan-500 rounded-full" />
              <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Procurement & Logistics</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Supply <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Chain.</span>
            </h1>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
          >
            <PlusIcon className="h-5 w-5" />
            Onboard Supplier
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suppliers.map((vendor) => (
            <div key={vendor.id} className="group bg-slate-900/40 border border-slate-800 rounded-3xl p-6 hover:bg-slate-900/60 transition-all border-l-4 border-l-cyan-500/50">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <BuildingOffice2Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">{vendor.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <TagIcon className="h-3.5 w-3.5" />
                      {vendor.category}
                    </div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-cyan-500/20">
                  {vendor.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Lead Time</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <TruckIcon className="h-3.5 w-3.5" />
                    {vendor.leadTime}
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Reliability</p>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                    <ShoppingBagIcon className="h-3.5 w-3.5" />
                    {vendor.reliability}%
                  </div>
                </div>
                <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-bold text-slate-600 uppercase mb-1">Reach</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <GlobeAltIcon className="h-3.5 w-3.5" />
                    Global
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <div className="flex items-center gap-4">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                  <p className="text-sm font-mono text-slate-500">{vendor.contact}</p>
                </div>
                <button 
                  onClick={() => {
                    
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Place Order
                  <ArrowUpRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="border-2 border-dashed border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center group hover:border-cyan-500/30 transition-all"
          >
             <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="h-8 w-8 text-slate-700" />
             </div>
             <h4 className="font-bold text-slate-400">Expand Network</h4>
             <p className="text-xs text-slate-600 mt-1 max-w-[200px]">Add a new distributor to your library procurement system.</p>
          </button>
        </div>

        {/* Onboarding Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0A0C10] border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">New Supplier</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white">
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleOnboard} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Company Name</label>
                  <input required value={newVendor.name} onChange={e => setNewVendor({...newVendor, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all" placeholder="e.g. Oxford Press" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Category</label>
                  <input required value={newVendor.category} onChange={e => setNewVendor({...newVendor, category: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all" placeholder="e.g. Academic Books" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Email</label>
                  <input required type="email" value={newVendor.contact} onChange={e => setNewVendor({...newVendor, contact: e.target.value})} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-cyan-500/50 transition-all" placeholder="orders@vendor.com" />
                </div>
                <button type="submit" className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-50 transition-all">
                  Complete Onboarding
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default LibrarySuppliersClient;