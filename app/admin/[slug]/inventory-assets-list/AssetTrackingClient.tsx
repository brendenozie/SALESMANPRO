"use client";

import React from "react";
import { 
  CpuChipIcon, 
  ArrowTrendingDownIcon, 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon,
  HashtagIcon,
  CalendarDaysIcon,
  TrashIcon,
  ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";

const AssetTrackingClient = () => {
  const assets = [
    { 
      id: 'AST-SERVER-01', 
      name: 'Dell PowerEdge R750', 
      serial: 'XYZ-9920-BA', 
      purchased: 'Jan 2024', 
      cost: 8500, 
      currentValue: 6200, 
      condition: 'Excellent',
      location: 'IT Server Room'
    },
    { 
      id: 'AST-BUS-004', 
      name: 'Mercedes Sprinter (60-Seater)', 
      serial: 'VIN-7729-11', 
      purchased: 'June 2022', 
      cost: 45000, 
      currentValue: 28500, 
      condition: 'Servicing Required',
      location: 'Main Garage'
    },
    { 
      id: 'AST-LAB-102', 
      name: 'Zeiss Digital Microscope', 
      serial: 'ZSS-440-OP', 
      purchased: 'Sept 2025', 
      cost: 3200, 
      currentValue: 3100, 
      condition: 'Good',
      location: 'Bio-Lab 2'
    }
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-slate-400 rounded-full" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Capital Asset Management</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Asset <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-500">Lifecycle.</span>
            </h1>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all font-bold text-xs">
                <ArrowTrendingDownIcon className="h-4 w-4" /> Depreciation Logic
             </button>
             <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all shadow-lg">
                <CpuChipIcon className="h-4 w-4" /> Register New Asset
             </button>
          </div>
        </header>

        {/* Financial Health of Assets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Asset Book Value</p>
             <h3 className="text-3xl font-black text-white mt-1">$412,850</h3>
             <p className="mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">Current Academic Year</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Annual Depreciation</p>
             <h3 className="text-3xl font-black text-rose-500 mt-1">-$24,100</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic italic">Straight-line Method Applied</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-slate-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Insurance Coverage</p>
             <h3 className="text-3xl font-black text-white mt-1">98.2%</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-bold uppercase">4 Assets Uninsured</p>
          </div>
        </div>

        {/* Asset Tracking Ledger */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <HashtagIcon className="h-5 w-5 text-slate-500" />
              Serial Registry & Valuation
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Asset & Serial</th>
                  <th className="p-6">Purchased</th>
                  <th className="p-6">Valuation (Book)</th>
                  <th className="p-6">Condition</th>
                  <th className="p-6 text-right">Lifecycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {assets.map((asset) => (
                  <tr key={asset.id} className="group hover:bg-slate-500/[0.03] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-700 transition-colors">
                          <CpuChipIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{asset.name}</p>
                          <p className="text-[10px] font-mono text-slate-600 mt-1">{asset.serial}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300">{asset.purchased}</span>
                        <span className="text-[9px] text-slate-500 font-medium uppercase">{asset.location}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-black text-white">${asset.currentValue.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-600 line-through">${asset.cost.toLocaleString()}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        asset.condition === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        asset.condition === 'Good' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      }`}>
                        {asset.condition}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400" title="Maintenance Log">
                          <WrenchScrewdriverIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white" title="Transfer Asset">
                          <ArrowsRightLeftIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-slate-800 hover:bg-rose-600 rounded-lg text-slate-400 hover:text-white" title="Dispose/Write-off">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AssetTrackingClient;