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
// REUSABLE LIGHT-MODE UI COMPONENTS
// ---------------------------------------------------------

const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white border border-slate-200/60 rounded-3xl shadow-sm shadow-slate-200/50 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, colorClass }: any) => (
  <Card className="p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
    <div className="flex items-center gap-5">
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-inner`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold tracking-wider uppercase mb-0.5">{label}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      </div>
    </div>
  </Card>
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

  const chartData = {
    labels: currentList.map(c => c.name.split(' ')[0]),
    datasets: [{
      label: 'Revenue',
      data: currentList.map(c => c.totalPurchases),
      backgroundColor: '#10b981', // Emerald 500
      borderRadius: 6,
      barThickness: 16,
    }]
  };

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
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Clients <span className="text-emerald-500 font-light">/</span> Hub
            </h1>
            <p className="text-slate-500 font-medium mt-1">Manage, analyze and grow your client base.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Find a client..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full lg:w-72 bg-white border border-slate-200 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => { setEditClient(null); setShowAddEdit(true); }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <PlusIcon className="h-5 w-5" /> New Client
            </button>
          </div>
        </header>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard label="Active Clients" value={stats.total} icon={UsersIcon} colorClass="from-indigo-600 to-indigo-400" />
          <StatCard label="Gross Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={ShoppingBagIcon} colorClass="from-emerald-600 to-emerald-400" />
          <StatCard label="Avg Ticket" value={`$${stats.avgAOV.toFixed(0)}`} icon={ChartBarIcon} colorClass="from-slate-800 to-slate-600" />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LIST */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Directory</h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-tighter">
                {filtered.length} Results
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentList.map(client => (
                <Card key={client.id} className="p-6 group hover:border-indigo-200 transition-colors">
                  <div className="flex justify-between items-start mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 text-xl font-black">
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditClient(client); setShowAddEdit(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><PencilSquareIcon className="h-5 w-5" /></button>
                      <button onClick={() => { setDeleteId(client.id); setShowDelete(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><TrashIcon className="h-5 w-5" /></button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{client.name}</h3>
                  <div className="space-y-1.5 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium truncate"><EnvelopeIcon className="h-4 w-4 text-slate-400" /> {client.email}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 font-medium"><PhoneIcon className="h-4 w-4 text-slate-400" /> {client.phoneNumber}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lifetime</p>
                      <p className="text-emerald-600 font-bold text-lg">${client.totalPurchases.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avg Order</p>
                      <p className="text-slate-900 font-bold text-lg">${client.averageOrderValue.toFixed(0)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-10">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-3 border border-slate-200 rounded-2xl disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all text-slate-600"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Page <span className="text-slate-900">{page}</span> of {totalPages}
                </div>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-3 border border-slate-200 rounded-2xl disabled:opacity-30 hover:bg-white hover:shadow-sm transition-all text-slate-600"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900">Purchase Velocity</h3>
                <p className="text-sm text-slate-500">Revenue per client on current view</p>
              </div>
              <div className="h-56">
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } } },
                      y: { border: { display: false }, grid: { color: '#f1f5f9' }, ticks: { display: false } }
                    }
                  }} 
                />
              </div>
            </Card>

            <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
              <div className="relative z-10">
                <h4 className="font-bold text-xl mb-3">Engagement Tip</h4>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  Clients with an AOV above $500 are 3x more likely to refer your services. Reach out to your top-tier clients today.
                </p>
                <button className="bg-white/20 hover:bg-white/30 transition-colors px-5 py-2.5 rounded-xl text-sm font-bold backdrop-blur-md">
                  View VIP List
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
            </div>
          </aside>
        </div>
      </div>

      <AddEditClientModal isOpen={showAddEdit} onClose={() => setShowAddEdit(false)} client={editClient} onSave={handleSave} />
      <DeleteConfirmationModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} name={clients.find(c => c.id === deleteId)?.name ?? ""} />
    </main>
  );
};

// ---------------------------------------------------------
// MODAL SUB-COMPONENTS (Clean Light Mode)
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
    <Modal isOpen={isOpen} onClose={onClose} title={client ? "Edit Profile" : "Create New Profile"}>
      <form onSubmit={submit} className="p-8 space-y-5 bg-white rounded-b-3xl">
        {['name', 'email', 'phoneNumber'].map((key) => (
          <div key={key}>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{key}</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all text-slate-900"
              value={(form as any)[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </div>
        ))}
        <div className="flex gap-3 pt-6">
          <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all text-slate-500">Cancel</button>
          <button type="submit" className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
            {client ? "Update" : "Create"} Client
          </button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, name }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
    <div className="p-10 text-center bg-white rounded-b-3xl">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
      </div>
      <h3 className="text-2xl font-black mb-3 text-slate-900">Are you sure?</h3>
      <p className="text-slate-500 mb-8 leading-relaxed">
        Removing <span className="text-slate-900 font-bold underline decoration-red-200 underline-offset-4">{name}</span> is permanent. This data cannot be recovered.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 px-6 py-4 bg-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">Go Back</button>
        <button onClick={onConfirm} className="flex-1 px-6 py-4 bg-red-600 rounded-2xl font-bold text-white hover:bg-red-700 shadow-lg shadow-red-100 transition-colors">
          Delete Now
        </button>
      </div>
    </div>
  </Modal>
);

export default ClientsClient;