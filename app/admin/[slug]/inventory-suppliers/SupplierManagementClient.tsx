"use client";

import React from "react";
import { 
  BuildingOffice2Icon, 
  EnvelopeIcon, 
  PhoneIcon, 
  StarIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";

const SupplierManagementClient = () => {
  const suppliers = [
    { 
      id: 'VEN-001', 
      name: 'Global Tech Solutions', 
      category: 'IT & Electronics', 
      contact: 'Marcus Reid', 
      rating: 4.8, 
      taxId: 'TX-9920-A', 
      status: 'Verified' 
    },
    { 
      id: 'VEN-042', 
      name: 'LabPro Chemicals', 
      category: 'Science Supplies', 
      contact: 'Dr. Sarah Lee', 
      rating: 4.2, 
      taxId: 'TX-1150-C', 
      status: 'On Probation' 
    },
    { 
      id: 'VEN-088', 
      name: 'Elite Sports Gear', 
      category: 'Sports & Athletics', 
      contact: 'Jason Vane', 
      rating: 3.9, 
      taxId: 'TX-4402-B', 
      status: 'Verified' 
    },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-blue-500 rounded-full" />
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Procurement & Sourcing</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Supplier <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Network.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-blue-900/40">
            <PlusIcon className="h-4 w-4 stroke-[3px]" /> Onboard New Vendor
          </button>
        </header>

        {/* Supplier Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {suppliers.map((vendor) => (
            <div key={vendor.id} className="group bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-8 hover:bg-slate-900/40 hover:border-blue-500/30 transition-all">
              {/* Card Top: Branding & Rating */}
              <div className="flex justify-between items-start mb-6">
                 <div className="h-14 w-14 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400">
                    <BuildingOffice2Icon className="h-8 w-8" />
                 </div>
                 <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-amber-400 mb-1">
                       <StarSolid className="h-4 w-4" />
                       <span className="text-xs font-black text-white">{vendor.rating}</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                      vendor.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {vendor.status}
                    </span>
                 </div>
              </div>

              {/* Vendor Info */}
              <div className="mb-6">
                 <h3 className="text-xl font-black text-white italic leading-tight group-hover:text-blue-400 transition-colors">{vendor.name}</h3>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{vendor.category}</p>
              </div>

              {/* Detailed Specs */}
              <div className="space-y-3 pt-6 border-t border-slate-800/50">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                       <ShieldCheckIcon className="h-4 w-4" />
                       <span className="text-[10px] font-bold uppercase tracking-tighter">Tax ID</span>
                    </div>
                    <span className="text-xs font-mono text-slate-300">{vendor.taxId}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                       <EnvelopeIcon className="h-4 w-4" />
                       <span className="text-[10px] font-bold uppercase tracking-tighter">Contact</span>
                    </div>
                    <span className="text-xs text-slate-300">{vendor.contact}</span>
                 </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-8">
                 <button className="flex-grow py-3 bg-slate-800 hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    View Portfolio
                 </button>
                 <button className="p-3 bg-slate-800 hover:bg-blue-600 text-white rounded-xl transition-all">
                    <PhoneIcon className="h-4 w-4" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SupplierManagementClient;