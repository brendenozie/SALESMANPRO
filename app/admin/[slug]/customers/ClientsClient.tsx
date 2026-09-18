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
import Modal from "@/components/Modal";
import toast from "react-hot-toast";

ChartJS.register(ArcElement, Tooltip, Legend);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export type Client = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  totalSales: number;
  totalPurchases?: number;
  recentTransactionAmount: number;
  recentTransactionDate: string | null;
  lastPurchaseDate?: string | null;
  status: "new" | "active";
};

interface ClientProps {
  initialClients: Client[];
  companyId?: string;
}

export default function ClientsClient({ initialClients, companyId }: ClientProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState<string>("" );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Add / Edit Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>("");
  const [formEmail, setFormEmail] = useState<string>("");
  const [formPhone, setFormPhone] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      (client.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  const stats = useMemo(() => ({
    total: clients.length,
    new: clients.filter(c => c.status === "new").length,
    active: clients.filter(c => c.status === "active").length,
    revenue: clients.reduce((sum, c) => sum + (c.totalSales || 0), 0),
  }), [clients]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
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

  const handleOpenAddModal = () => {
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormName(client.name || "");
    setFormEmail(client.email || "");
    setFormPhone(client.phone || client.phoneNumber || "");
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          companyId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create client");
      }
      setClients((prev) => [json.data, ...prev]);
      toast.success("Client added successfully");
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/clients`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          name: formName.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          companyId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update client");
      }
      setClients((prev) =>
        prev.map((c) =>
          c.id === selectedClient.id
            ? { ...c, name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim(), phoneNumber: formPhone.trim() }
            : c
        )
      );
      toast.success("Client updated successfully");
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update client");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/clients?clientId=${selectedClient.id}&companyId=${companyId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete client");
      }
      setClients((prev) => prev.filter((c) => c.id !== selectedClient.id));
      toast.success("Client removed successfully");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete client");
    } finally {
      setIsSubmitting(false);
    }
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
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
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
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  onEdit={() => handleOpenEditModal(client)}
                  onDelete={() => handleOpenDeleteModal(client)}
                />
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

      {/* Add Client Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Client">
        <form onSubmit={handleAddClient} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="sarah@example.com"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+254 700 000000"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Save Client"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Client Information">
        <form onSubmit={handleUpdateClient} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-1">Phone Number</label>
            <input
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Update Client"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Client Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Removal">
        <div className="p-6 space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to remove <span className="font-black text-slate-900 dark:text-white">{selectedClient?.name}</span> from your client roster?
          </p>
          <p className="text-xs text-slate-400">
            This will dissociate the client profile from this tenant company. Their historical orders and invoices will remain intact for reporting.
          </p>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 font-bold text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDeleteClient}
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Removing..." : "Remove Client"}
            </button>
          </div>
        </div>
      </Modal>
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

const ClientCard = ({ 
  client, 
  onEdit, 
  onDelete 
}: { 
  client: Client; 
  onEdit?: () => void; 
  onDelete?: () => void;
}) => {
  const isNew = client.status === "new";

  const formattedDate = useMemo(() => {
    const raw = client.recentTransactionDate || client.lastPurchaseDate;
    if (!raw) return "No orders yet";
    try {
      return format(parseISO(raw), "MMM dd, yyyy");
    } catch {
      return "Recent";
    }
  }, [client.recentTransactionDate, client.lastPurchaseDate]);

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-lg hover:border-indigo-500/50 transition-all relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
            {(client.name || "C").charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white uppercase truncate w-32 tracking-tight">{client.name || "Unnamed"}</h3>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${isNew ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
              {client.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={onEdit}
             title="Edit Client"
             className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-indigo-500 transition-colors"
           >
              <PencilSquareIcon className="h-5 w-5" />
           </button>
           <button 
             onClick={onDelete}
             title="Remove Client"
             className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
           >
              <TrashIcon className="h-5 w-5" />
           </button>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
           <EnvelopeIcon className="h-4 w-4 shrink-0" />
           <span className="text-xs font-bold truncate">{client.email || "No email"}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
           <PhoneIcon className="h-4 w-4 shrink-0" />
           <span className="text-xs font-bold">{client.phone || client.phoneNumber || "No phone"}</span>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase">LTV</p>
           <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">${(client.totalSales || 0).toFixed(0)}</p>
        </div>
        <div>
           <p className="text-[10px] font-black text-slate-400 uppercase">Last Order</p>
           <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {formattedDate}
           </p>
        </div>
      </div>
    </div>
  );
};