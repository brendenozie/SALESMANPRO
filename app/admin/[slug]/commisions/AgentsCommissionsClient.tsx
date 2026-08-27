"use client";

import React, { useState, useMemo } from "react";
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  CheckBadgeIcon, 
  ClockIcon,
  FunnelIcon,
  ArrowUpRightIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";

export type Commission = {
  id: string;
  agentName: string;
  agentId: string;
  saleAmount: number;
  commissionRate: number; // e.g., 0.1 for 10%
  payoutAmount: number;
  status: "pending" | "approved" | "paid";
  date: string;
};

interface Props {
  initialCommissions: Commission[];
}

export default function AgentsCommissionsClient({ initialCommissions }: Props) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return initialCommissions.filter(item => {
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      const matchesSearch = item.agentName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [initialCommissions, filterStatus, searchTerm]);

  const stats = useMemo(() => ({
    totalPaid: initialCommissions.filter(c => c.status === "paid").reduce((acc, c) => acc + c.payoutAmount, 0),
    pendingApproval: initialCommissions.filter(c => c.status === "pending").reduce((acc, c) => acc + c.payoutAmount, 0),
    activeAgents: new Set(initialCommissions.map(c => c.agentId)).size,
  }), [initialCommissions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020408] p-4 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Global Actions */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <CurrencyDollarIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </span>
              Commission <span className="text-emerald-600 dark:text-emerald-400">Ledger</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Tracking and auditing agent payouts for SalesmanPro.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-500 transition-all">
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Mass Approval</span>
            </button>
          </div>
        </header>

        {/* High-Level Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatWidget title="Total Payouts" value={`$${stats.totalPaid.toLocaleString()}`} icon={CheckBadgeIcon} color="emerald" trend="+8% vs last month" />
          <StatWidget title="Pending Review" value={`$${stats.pendingApproval.toLocaleString()}`} icon={ClockIcon} color="amber" trend="14 items waiting" />
          <StatWidget title="Active Force" value={stats.activeAgents} icon={UserGroupIcon} color="indigo" trend="Across all regions" />
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="flex-grow relative w-full">
            <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Filter by Agent Name..."
              className="w-full bg-transparent border-none focus:ring-0 pl-12 font-medium text-slate-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full md:w-auto">
            {["all", "pending", "paid"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  filterStatus === status 
                    ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" 
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Commissions Table/List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Agent Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Sale Vol</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Commission</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredData.map((comm) => (
                <tr key={comm.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center font-black">
                        {comm.agentName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{comm.agentName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{format(parseISO(comm.date), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-300">
                    ${comm.saleAmount.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-black text-emerald-600 dark:text-emerald-400">${comm.payoutAmount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">Rate: {(comm.commissionRate * 100).toFixed(0)}%</p>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={comm.status} />
                  </td>
                  <td className="px-8 py-6">
                    <button className="p-2 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all text-slate-400">
                      <ArrowUpRightIcon className="h-5 w-5" />
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

// --- Internal UI Components ---

const StatWidget = ({ title, value, icon: Icon, color, trend }: any) => {
  const colors: any = {
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-1 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">{trend}</span>
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Commission["status"] }) => {
  const styles = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};