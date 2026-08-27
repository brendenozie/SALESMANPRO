"use client";

import React, { useState, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO } from "date-fns";
import { 
  UsersIcon, 
  UserPlusIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EnvelopeIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";

ChartJS.register(ArcElement, Tooltip, Legend);

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSales: number;
  recentTransactionAmount: number;
  recentTransactionDate: string;
  status: "new" | "active";
};

interface ClientProps {
  initialClients: Client[];
}

export default function ClientsClient({ initialClients }: ClientProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const filteredClients = useMemo(() => {
    return initialClients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [initialClients, searchTerm]);

  const stats = useMemo(() => ({
    total: initialClients.length,
    new: initialClients.filter(c => c.status === "new").length,
    active: initialClients.filter(c => c.status === "active").length,
    revenue: initialClients.reduce((sum, c) => sum + c.totalSales, 0),
  }), [initialClients]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const doughnutData = {
    labels: ["New Clients", "Active Clients"],
    datasets: [
      {
        data: [stats.new, stats.active],
        backgroundColor: ["#6366f1", "#10b981"],
        borderColor: "transparent",
        hoverOffset: 10,
        borderRadius: 10,
        spacing: 5,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 p-4 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <UsersIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </span>
              Client <span className="text-indigo-600 dark:text-indigo-400">Portfolio</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage and monitor customer lifecycle and lifetime value.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
            <PlusIcon className="h-5 w-5" />
            <span>ADD NEW CLIENT</span>
          </button>
        </header>

        {/* Search & Bento Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard title="Lifetime Value" value={`$${stats.revenue.toLocaleString()}`} icon={CurrencyDollarIcon} color="emerald" />
            <SummaryCard title="Acquisition" value={stats.new} icon={UserPlusIcon} color="indigo" />
            <SummaryCard title="Retention" value={stats.active} icon={ChartBarIcon} color="blue" />
            
            {/* Embedded Search Bar in the Bento Grid */}
            <div className="sm:col-span-3 relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-3xl shadow-sm">
              <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or email address..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-transparent border-none focus:ring-0 pl-14 py-4 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Mini Chart Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
             <div className="h-40 w-40">
                <Doughnut data={doughnutData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
             </div>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-2">
                <span className="text-2xl font-black">{stats.total}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clients</span>
             </div>
          </div>
        </div>

        {/* Client Grid */}
        <section>
          {paginatedClients.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 py-20 text-center">
              <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest">No clients match your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedClients.map((client) => (
                <ClientCard key={client.id} client={client} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <footer className="mt-12 flex justify-center items-center gap-8 pb-10">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-20 hover:border-indigo-500 transition-colors shadow-sm"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 font-black">
              <span className="text-2xl text-slate-900 dark:text-white">{currentPage}</span>
              <span className="text-slate-400">/ {totalPages}</span>
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-20 hover:border-indigo-500 transition-colors shadow-sm"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}

// --- Sub-components ---

const SummaryCard = ({ title, value, icon: Icon, color }: any) => {
  const themes: any = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20",
    blue: "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-lg transition-transform hover:-translate-y-1">
      <div className={`p-3 w-fit rounded-2xl mb-4 ${themes[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
};

const ClientCard = ({ client }: { client: Client }) => {
  const isNew = client.status === "new";

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-lg hover:border-indigo-500/50 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
            {client.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase truncate w-32 tracking-tight">{client.name}</h3>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${isNew ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              {client.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors">
              <PencilSquareIcon className="h-5 w-5" />
           </button>
           <button className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
              <TrashIcon className="h-5 w-5" />
           </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
           <EnvelopeIcon className="h-4 w-4" />
           <span className="text-xs font-bold truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
           <PhoneIcon className="h-4 w-4" />
           <span className="text-xs font-bold">{client.phone}</span>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase">LTV</p>
           <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">${client.totalSales.toFixed(0)}</p>
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase">Last Order</p>
           <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {format(parseISO(client.recentTransactionDate), "MMM dd, yyyy")}
           </p>
        </div>
      </div>
    </div>
  );
};