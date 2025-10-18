"use client";

import React, { useState, useMemo, useCallback } from "react";
// Import all necessary Chart.js components
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
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Assuming Modal component is correctly located in "@/components/Modal"
import Modal from "@/components/Modal"; 

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// -------------------------
// Types & Props
// -------------------------
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

// Only the fields our form actually edits or needs to send
type ClientPayload = Omit<
  Client,
  "totalPurchases" | "lastPurchaseDate" | "averageOrderValue"
> & {
  // `id` is optional when creating a new client
  id?: string;
};

// ---------------------------------------------
// I. HELPER COMPONENTS (Cards)
// ---------------------------------------------

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  gradientClass: string;
}
const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  gradientClass,
}) => (
  <div
    className={`p-6 rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-all duration-300 text-white flex flex-col justify-between h-40 ${gradientClass}`}
  >
    <div className="flex justify-between items-start">
      <h2 className="text-lg font-medium opacity-90 tracking-wide">{title}</h2>
      <Icon className="h-8 w-8 opacity-70" />
    </div>
    <p className="text-4xl font-extrabold mt-4">{value}</p>
  </div>
);

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}
const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1">
    
    {/* Header and Details */}
    <div className="pb-4 border-b border-gray-700/50">
      <h3 className="text-2xl font-extrabold text-emerald-400 mb-1 truncate">{client.name}</h3>
      <p className="text-sm text-gray-400 truncate">
        <span className="font-semibold text-gray-300">Email:</span> {client.email}
      </p>
      <p className="text-sm text-gray-400">
        <span className="font-semibold text-gray-300">Phone:</span> {client.phoneNumber}
      </p>
    </div>

    {/* Financial Metrics */}
    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
      <div className="bg-gray-700/50 p-3 rounded-lg">
        <span className="text-gray-400 block mb-1">Total Purchases</span>
        <p className="text-lime-400 font-extrabold text-lg">${client.totalPurchases.toFixed(2)}</p>
      </div>
      <div className="bg-gray-700/50 p-3 rounded-lg">
        <span className="text-gray-400 block mb-1">Avg. Order Value</span>
        <p className="text-sky-400 font-extrabold text-lg">${client.averageOrderValue.toFixed(2)}</p>
      </div>
      <div className="col-span-2 text-center pt-2">
        <span className="text-gray-400">Last Purchased:</span>
        <p className={`font-semibold text-base mt-1 ${client.lastPurchaseDate ? 'text-blue-300' : 'text-red-400'}`}>
          {client.lastPurchaseDate ?? "INACTIVE"}
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-between space-x-2 mt-6 pt-4 border-t border-gray-700/50">
      <button
        onClick={() => onEdit(client)}
        className="flex items-center justify-center flex-grow px-3 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition duration-200 text-sm font-medium shadow-md"
      >
        <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit Profile
      </button>
      <button
        onClick={() => onDelete(client.id)}
        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition duration-200 shadow-md"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  </div>
);

// ---------------------------------------------
// II. MODAL COMPONENTS
// ---------------------------------------------

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (data: ClientPayload) => void;
}

const AddEditClientModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  const [form, setForm] = useState<ClientPayload>({
    id: client?.id ?? "",
    name: client?.name ?? "",
    email: client?.email ?? "",
    phoneNumber: client?.phoneNumber ?? "",
  });

  React.useEffect(() => {
    if (client) {
      setForm({
        id: client.id,
        name: client.name,
        email: client.email,
        phoneNumber: client.phoneNumber,
      });
    } else {
      setForm({ id: "", name: "", email: "", phoneNumber: "" });
    }
  }, [client, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Safely cast to ClientPayload before saving
    onSave(form); 
    onClose();
  };

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={client ? "Edit Client Profile" : "Add New Client"}
        // contentClassName="sm:max-w-xl bg-gray-900 shadow-2xl rounded-xl border border-gray-700" 
    >
      <form onSubmit={submit} className="p-4 space-y-5">
        {["name", "email", "phoneNumber"].map((field) => (
          <div key={field}>
            <label className="block text-gray-300 mb-2 capitalize font-medium">
              {field.replace(/([A-Z])/g, " $1")}
            </label>
            <input
              name={field}
              type={field === 'email' ? 'email' : 'text'}
              value={(form as any)[field]}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
            />
          </div>
        ))}
        <div className="flex justify-end space-x-3 pt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-5 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
          >
            <XMarkIcon className="h-5 w-5 mr-1 inline" /> Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2 bg-emerald-600 rounded-lg text-white font-semibold hover:bg-emerald-700 transition flex items-center shadow-lg"
          >
            <CheckCircleIcon className="h-5 w-5 mr-1" /> Save Details
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
}
const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  name,
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    title="Confirm Deletion"
    // contentClassName="sm:max-w-md bg-gray-900 shadow-2xl rounded-xl border border-gray-700"
  >
    <div className="p-4 text-center space-y-6">
      <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto animate-pulse" />
      <p className="text-xl text-gray-300 font-medium">
        Are you sure you want to permanently delete client <strong className="text-red-400 block mt-1">{name}</strong>?
      </p>
      <p className="text-sm text-gray-500">This action cannot be undone and will remove all associated data.</p>
      
      <div className="flex justify-center space-x-4 pt-2">
        <button onClick={onClose} className="px-5 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-5 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition flex items-center shadow-lg">
          <TrashIcon className="h-5 w-5 mr-1" /> Confirm Delete
        </button>
      </div>
    </div>
  </Modal>
);

// ---------------------------------------------
// III. MAIN COMPONENT
// ---------------------------------------------

const ClientsClient: React.FC<ClientsClientProps> = ({ companyId, clientsData }) => {
  const [clients, setClients] = useState<Client[]>(clientsData);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtering & pagination
  const filtered = useMemo(
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) ),
    [clients, search]
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const currentList = filtered.slice((page - 1) * perPage, page * perPage);

  // Summaries
  const totalSum = useMemo(() => clients.reduce((sum, c) => sum + c.totalPurchases, 0), [clients]);
  const avgAOV = useMemo(() => (clients.length ? clients.reduce((s,c) => s + c.averageOrderValue, 0)/clients.length : 0), [clients]);

  // Chart
  const chartOptions = {
    responsive: true,
    plugins: {
        legend: { labels: { color: 'rgb(209, 213, 219)' } }, // Gray-300
        title: { display: false },
    },
    scales: {
        x: { ticks: { color: 'rgb(156, 163, 175)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
        y: { ticks: { color: 'rgb(156, 163, 175)' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
    }
  };

  const chartData = {
    labels: filtered.map((c) => c.name),
    datasets: [
        { 
            label: "Total Purchases", 
            data: filtered.map((c) => c.totalPurchases), 
            backgroundColor: 'rgba(16, 185, 129, 0.8)', // Emerald
            borderRadius: 4,
        },
        { 
            label: "Avg Order Value", 
            data: filtered.map((c) => c.averageOrderValue), 
            backgroundColor: 'rgba(96, 165, 250, 0.8)', // Blue
            borderRadius: 4,
        },
    ],
  };

  // -----------------------
  // CRUD handlers (Mock implementation for client-side demo)
  // -----------------------
  const handleSave = useCallback(async (data: ClientPayload) => {
    // In a real app, this would be an API call (as in the original code)
    // We'll mock the successful save here for the UI demo:
    const mockId = data.id || `new-${Date.now()}`;
    const mockClient: Client = {
      ...data,
      id: mockId,
      totalPurchases: data.id ? clients.find(c => c.id === data.id)?.totalPurchases ?? 0 : 0,
      averageOrderValue: data.id ? clients.find(c => c.id === data.id)?.averageOrderValue ?? 0 : 0,
      lastPurchaseDate: data.id ? clients.find(c => c.id === data.id)?.lastPurchaseDate ?? null : null,
    };

    setClients((prev) =>
      data.id
        ? prev.map((c) => (c.id === mockId ? mockClient : c))
        : [...prev, mockClient]
    );
  }, [clients]);

  const handleDelete = useCallback(async (id: string) => {
    // In a real app, this would be an API call
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <main className="container mx-auto p-4 sm:p-8 lg:p-12 bg-gray-950 min-h-screen text-gray-100">
      
      {/* Header & Main Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-gray-800 pb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-5xl font-extrabold text-white leading-tight">Client Engagement Hub 🌐</h1>
          <p className="text-gray-400 text-lg mt-1">Manage and track your valuable customer base efficiently.</p>
        </div>
        
        <button
          onClick={() => { setEditClient(null); setShowAddEdit(true); }}
          className="flex items-center bg-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-700 transition duration-300 font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.03]"
        >
          <PlusCircleIcon className="h-6 w-6 mr-2" /> Add New Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-10 max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Search by client name, email, or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full p-4 bg-gray-800 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-inner transition"
        />
      </div>

      {/* Summaries Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <SummaryCard 
          title="Total Active Clients" 
          value={clients.length} 
          icon={UsersIcon} 
          gradientClass="bg-gradient-to-br from-blue-700 to-cyan-800" 
        />
        <SummaryCard 
          title="All-Time Revenue" 
          value={`$${totalSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          icon={ShoppingBagIcon} 
          gradientClass="bg-gradient-to-br from-green-600 to-teal-700" 
        />
        <SummaryCard 
          title="Average Order Value" 
          value={`$${avgAOV.toFixed(2)}`} 
          icon={ChartBarIcon} 
          gradientClass="bg-gradient-to-br from-purple-700 to-pink-800" 
        />
      </div>

      {/* Data Visualization & List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 📊 Chart Panel (Takes 1/3 width) */}
        <div className="lg:col-span-1 bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-800 h-full">
          <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Purchase Analytics</h2>
          {filtered.length > 0 ? (
            <div className="max-h-96">
                <Bar data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">No data to display.</div>
          )}
        </div>

        {/* 📋 Client List (Takes 2/3 width) */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-bold text-white mb-6">Client Directory ({filtered.length})</h2>
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentList.map((c) => (
                <ClientCard
                  key={c.id}
                  client={c}
                  onEdit={(c) => { setEditClient(c); setShowAddEdit(true); }}
                  onDelete={(id) => { setDeleteId(id); setShowDelete(true); }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 p-12 rounded-2xl text-center border-2 border-dashed border-gray-700">
              <XMarkIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
              <p className="text-xl font-medium text-gray-400">No clients match your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 space-x-3">
          <button 
            disabled={page === 1} 
            onClick={() => setPage((p) => p - 1)} 
            className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition"
          >
            &larr; Previous Page
          </button>
          <span className="px-4 py-2 bg-emerald-600 rounded-lg text-white font-semibold">{page} / {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage((p) => p + 1)} 
            className="px-4 py-2 bg-gray-800 rounded-lg text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition"
          >
            Next Page &rarr;
          </button>
        </div>
      )}

      {/* Modals */}
      <AddEditClientModal
        isOpen={showAddEdit}
        onClose={() => { setShowAddEdit(false); setEditClient(null); }}
        client={editClient}
        onSave={handleSave}
      />
      {deleteId && (
        <DeleteConfirmationModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={() => { handleDelete(deleteId); setShowDelete(false); setDeleteId(null); }}
          name={clients.find((c) => c.id === deleteId)?.name ?? "Unknown Client"}
        />
      )}
    </main>
  );
};

export default ClientsClient;