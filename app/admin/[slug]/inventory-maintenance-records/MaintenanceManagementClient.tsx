"use client";

import React from "react";
import { 
  WrenchScrewdriverIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon,
  BoltIcon,
  TruckIcon,
  CpuChipIcon,
  BeakerIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

const MaintenanceManagementClient = () => {
  const maintenanceTasks = [
    { id: 'MNT-402', asset: 'School Bus #04', category: 'Transport', task: 'Brake Pad Replacement', dueDate: 'Jan 20', priority: 'Critical', status: 'Scheduled' },
    { id: 'MNT-415', asset: 'Main Server Rack', category: 'IT', task: 'Cooling System Flush', dueDate: 'Jan 16', priority: 'High', status: 'In Progress' },
    { id: 'MNT-390', asset: 'Precision Scales', category: 'Science Lab', task: 'Annual Calibration', dueDate: 'Feb 05', priority: 'Medium', status: 'Pending' },
  ];

  return (
    <main className="min-h-screen bg-[#05070A] text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-10 bg-amber-500 rounded-full" />
              <span className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em]">Operational Continuity</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-500">Logistics.</span>
            </h1>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-amber-900/40">
            <WrenchScrewdriverIcon className="h-4 w-4" /> Schedule Maintenance
          </button>
        </header>

        {/* Maintenance Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Tickets</p>
             <h3 className="text-3xl font-black text-white mt-1">12</h3>
             <p className="mt-4 text-[10px] text-amber-500 font-bold uppercase tracking-widest">4 Overdue for Service</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] border-b-4 border-b-rose-500">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Risks</p>
             <h3 className="text-3xl font-black text-rose-500 mt-1">Critical</h3>
             <p className="mt-4 text-[10px] text-slate-500 font-medium italic">Server Room Temp: 24°C (Limit 22°C)</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Maint. Budget Used</p>
             <h3 className="text-3xl font-black text-white mt-1">64%</h3>
             <p className="mt-4 text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Under Q1 Forecast</p>
          </div>
        </div>

        {/* Service Queue */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
               <ClockIcon className="h-5 w-5 text-amber-500" /> Current Service Queue
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800/50">
                  <th className="p-6">Asset & Category</th>
                  <th className="p-6">Task Description</th>
                  <th className="p-6">Priority</th>
                  <th className="p-6">Due Date</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {maintenanceTasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-amber-500/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors">
                          {task.category === 'Transport' && <TruckIcon className="h-5 w-5" />}
                          {task.category === 'IT' && <CpuChipIcon className="h-5 w-5" />}
                          {task.category === 'Science Lab' && <BeakerIcon className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{task.asset}</p>
                          <p className="text-[9px] font-black text-slate-600 uppercase mt-0.5">{task.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <p className="text-xs font-medium text-slate-300 italic">"{task.task}"</p>
                       <span className="text-[8px] font-mono text-slate-600 uppercase">{task.id}</span>
                    </td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                         task.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                         task.priority === 'High' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                         'bg-blue-500/10 text-blue-400 border-blue-500/20'
                       }`}>
                         {task.priority}
                       </span>
                    </td>
                    <td className="p-6">
                       <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">{task.dueDate}</span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase">{task.status}</span>
                       </div>
                    </td>
                    <td className="p-6 text-right">
                       <button className="flex items-center gap-2 ml-auto px-4 py-2 bg-slate-800 hover:bg-amber-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all">
                          Manage Log <ChevronRightIcon className="h-4 w-4" />
                       </button>
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

export default MaintenanceManagementClient;