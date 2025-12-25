"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  UsersIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

import Modal from "@/components/Modal"; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Types ---
export type Client = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  totalPurchases: number;
  lastPurchaseDate: string | null;
  averageOrderValue: number;
};

interface ClientsClientProps {
  companyId: string;
  clientsData: Client[];
}

type ClientPayload = Omit<Client, "totalPurchases" | "lastPurchaseDate" | "averageOrderValue"> & { id?: string };

// ---------------------------------------------------------
// REUSABLE GLASS COMPONENTS
// ---------------------------------------------------------

const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-gray-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

const StatBadge = ({ label, value, icon: Icon, colorClass }: any) => (
  <GlassCard className="group p-6 hover:border-white/20 transition-all duration-500">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-xs font-bold tracking-[0.15em] uppercase mb-1">{label}</p>
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl bg-gradient-to-br ${colorClass} shadow-lg shadow-black/50`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </GlassCard>
);

// ---------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------

const ClientsClient: React.FC<ClientsClientProps> = ({ companyId, clientsData }) => {
  const [clients, setClients] = useState<Client[]>(clientsData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- Logic: Filtering & Pagination ---
  const filtered = useMemo(() => 
    clients.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phoneNumber.includes(search)
    ), [clients, search]
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const currentList = filtered.slice((page - 1) * perPage, page * perPage);

  const stats = useMemo(() => ({
    total: clients.length,
    revenue: clients.reduce((sum, c) => sum + c.totalPurchases, 0),
    avgAOV: clients.length ? (clients.reduce((s, c) => s + c.averageOrderValue, 0) / clients.length) : 0
  }), [clients]);

  // --- Logic: Chart Config ---
  const chartData = {
    labels: currentList.map(c => c.name.split(' ')[0]), // Use first names for space
    datasets: [{
      label: 'Total Purchases',
      data: currentList.map(c => c.totalPurchases),
      backgroundColor: '#10b981',
      borderRadius: 8,
      barThickness: 12,
    }]
  };

  // --- Logic: CRUD Handlers ---
  const handleSave = useCallback(async (data: ClientPayload) => {
    const mockId = data.id || `client-${Date.now()}`;
    const existing = clients.find(c => c.id === data.id);
    
    const mockClient: Client = {
      ...data,
      id: mockId,
      totalPurchases: existing?.totalPurchases ?? 0,
      averageOrderValue: existing?.averageOrderValue ?? 0,
      lastPurchaseDate: existing?.lastPurchaseDate ?? null,
    };

    setClients(prev => data.id ? prev.map(c => c.id === data.id ? mockClient : c) : [mockClient, ...prev]);
  }, [clients]);

  const handleDelete = useCallback(() => {
    if (deleteId) {
      setClients(prev => prev.filter(c => c.id !== deleteId));
      setShowDelete(false);
      setDeleteId(null);
    }
  }, [deleteId]);

  return (
    <main className="min-h-screen bg-[#030406] text-gray-200 p-4 sm:p-8 lg:p-12 relative overflow-hidden">
      {/* Aesthetic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
              HUB<span className="text-emerald-500">.</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium">Manage your client network.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-grow">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search clients..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full lg:w-80 bg-white/5 border border-white/10 pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all backdrop-blur-md"
              />
            </div>
            <button 
              onClick={() => { setEditClient(null); setShowAddEdit(true); }}
              className="bg-emerald-500 hover:bg-emerald-400 text-[#030406] px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-xl shadow-emerald-500/20"
            >
              <PlusIcon className="h-5 w-5 stroke-[3px]" /> New Client
            </button>
          </div>
        </header>

        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatBadge label="Total Clients" value={stats.total} icon={UsersIcon} colorClass="from-emerald-600 to-teal-500" />
          <StatBadge label="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={ShoppingBagIcon} colorClass="from-blue-600 to-indigo-500" />
          <StatBadge label="Avg Order" value={`$${stats.avgAOV.toFixed(0)}`} icon={ChartBarIcon} colorClass="from-purple-600 to-pink-500" />
        </div>

        {/* DATA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* List - 8 Columns */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              Directory <span className="text-sm font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-md">{filtered.length}</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentList.map(client => (
                <div key={client.id} className="group relative p-[1px] rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent hover:from-emerald-500/50 transition-all duration-500">
                  <div className="bg-[#0b0e14] rounded-[1.95rem] p-6 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold">
                        {client.name.charAt(0)}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditClient(client); setShowAddEdit(true); }} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"><PencilSquareIcon className="h-5 w-5" /></button>
                        <button onClick={() => { setDeleteId(client.id); setShowDelete(true); }} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"><TrashIcon className="h-5 w-5" /></button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4 truncate">{client.name}</h3>
                    <div className="space-y-2 mb-6 flex-grow">
                      <div className="flex items-center gap-2 text-sm text-gray-400"><EnvelopeIcon className="h-4 w-4 text-emerald-500/50" /> {client.email}</div>
                      <div className="flex items-center gap-2 text-sm text-gray-400"><PhoneIcon className="h-4 w-4 text-emerald-500/50" /> {client.phoneNumber}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Lifetime</p>
                        <p className="text-emerald-400 font-mono font-bold">${client.totalPurchases.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">AOV</p>
                        <p className="text-white font-mono font-bold">${client.averageOrderValue.toFixed(0)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Page <span className="text-white">{page}</span> / {totalPages}
                </div>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3 bg-white/5 border border-white/10 rounded-xl disabled:opacity-20 hover:bg-white/10 transition-all"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - 4 Columns */}
          <aside className="lg:col-span-4 space-y-8">
            <GlassCard className="p-8">
              <h3 className="text-lg font-bold text-white mb-6">Volume Analysis</h3>
              <div className="h-64">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#4b5563', font: { size: 10 } } },
                      y: { display: false }
                    }
                  }} 
                />
              </div>
            </GlassCard>

            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-3xl p-8 border border-white/5">
              <h4 className="text-white font-bold mb-2">Market Insights</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                Your highest engagement comes from the first half of your client list. Consider a re-engagement campaign for dormant users.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* --- MODALS --- */}
      <AddEditClientModal 
        isOpen={showAddEdit} 
        onClose={() => setShowAddEdit(false)} 
        client={editClient} 
        onSave={handleSave} 
      />
      
      <DeleteConfirmationModal 
        isOpen={showDelete} 
        onClose={() => setShowDelete(false)} 
        onConfirm={handleDelete} 
        name={clients.find(c => c.id === deleteId)?.name ?? ""} 
      />
    </main>
  );
};

// ---------------------------------------------------------
// RE-IMPLEMENTED MODAL SUB-COMPONENTS
// ---------------------------------------------------------

const AddEditClientModal = ({ isOpen, onClose, client, onSave }: any) => {
  const [form, setForm] = useState<ClientPayload>({ id: "", name: "", email: "", phoneNumber: "" });

  React.useEffect(() => {
    if (client) setForm({ id: client.id, name: client.name, email: client.email, phoneNumber: client.phoneNumber });
    else setForm({ id: "", name: "", email: "", phoneNumber: "" });
  }, [client, isOpen]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? "Update Profile" : "New Client Entry"}>
      <form onSubmit={submit} className="p-6 space-y-6 bg-[#0b0e14] text-white rounded-b-3xl">
        {['name', 'email', 'phoneNumber'].map((key) => (
          <div key={key}>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{key}</label>
            <input 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500/40 focus:outline-none transition-all"
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-white/10 rounded-2xl font-bold hover:bg-white/5 transition-all text-gray-400">Cancel</button>
          <button type="submit" className="flex-1 px-6 py-4 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
            <CheckCircleIcon className="h-5 w-5" /> Save Client
          </button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, name }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Danger Zone">
    <div className="p-8 text-center bg-[#0b0e14] text-white rounded-b-3xl">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
        <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">Remove Client?</h3>
      <p className="text-gray-400 mb-8 leading-relaxed">
        Are you sure you want to delete <span className="text-red-400 font-bold">{name}</span>? This action is permanent and cannot be reversed.
      </p>
      <div className="flex gap-4">
        <button onClick={onClose} className="flex-1 px-6 py-4 bg-white/5 rounded-2xl font-bold text-gray-400 hover:bg-white/10">Keep Client</button>
        <button onClick={onConfirm} className="flex-1 px-6 py-4 bg-red-600 rounded-2xl font-bold text-white hover:bg-red-500 shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
          <TrashIcon className="h-5 w-5" /> Delete
        </button>
      </div>
    </div>
  </Modal>
);

export default ClientsClient;