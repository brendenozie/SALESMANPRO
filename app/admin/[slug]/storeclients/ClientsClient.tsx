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
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";

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


// -------------------------
// Helper Components
// -------------------------
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
    className={`p-6 rounded-xl shadow-lg transform hover:scale-105 transition text-white flex flex-col items-center justify-center ${gradientClass}`}
  >
    <Icon className="h-10 w-10 mb-3 opacity-90" />
    <h2 className="text-xl font-semibold mb-1">{title}</h2>
    <p className="text-4xl font-extrabold">{value}</p>
  </div>
);

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}
const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => (
  <div className="bg-gray-800 p-6 rounded-xl shadow-xl flex flex-col justify-between border-b-4 border-emerald-600 hover:border-emerald-400 transition">
    <div>
      <h3 className="text-2xl font-bold text-emerald-400 mb-2 truncate">{client.name}</h3>
      <p className="text-sm text-gray-300"><strong>Email:</strong> {client.email}</p>
      <p className="text-sm text-gray-300"><strong>Phone:</strong> {client.phoneNumber}</p>
    </div>
    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
      <div>
        <span className="text-gray-400">Total Purchases</span>
        <p className="text-lime-400 font-bold">${client.totalPurchases.toFixed(2)}</p>
      </div>
      <div>
        <span className="text-gray-400">Last Purchase</span>
        <p className="text-blue-400 font-bold">{client.lastPurchaseDate ?? "N/A"}</p>
      </div>
      <div className="col-span-2">
        <span className="text-gray-400">Avg. Order Value</span>
        <p className="text-sky-400 font-bold">${client.averageOrderValue.toFixed(2)}</p>
      </div>
    </div>
    <div className="flex justify-end space-x-2 mt-4">
      <button
        onClick={() => onEdit(client)}
        className="flex items-center px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700 transition"
      >
        <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
      </button>
      <button
        onClick={() => onDelete(client.id)}
        className="flex items-center px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700 transition"
      >
        <TrashIcon className="h-5 w-5 mr-1" /> Delete
      </button>
    </div>
  </div>
);

// -------------------------
// Modals
// -------------------------
interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (data: Omit<Client, "totalPurchases" | "lastPurchaseDate" | "averageOrderValue">) => void;
}

const AddEditClientModal: React.FC<AddEditModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  const [form, setForm] = useState({
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
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={submit} className="bg-gray-800 p-6 rounded-xl w-full max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-emerald-400 text-center">
          {client ? "Edit Client" : "Add New Client"}
        </h2>
        {["name","email","phoneNumber"].map((field) => (
          <div key={field}>
            <label className="block text-gray-300 mb-1 capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
            <input
              name={field}
              value={(form as any)[field]}
              onChange={handleChange}
              required
              className="w-full p-2 bg-gray-700 rounded"
            />
          </div>
        ))}
        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-emerald-600 rounded text-white flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-1" /> Save
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
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="bg-gray-800 p-6 rounded-xl text-center space-y-4 max-w-sm mx-auto">
      <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto" />
      <p className="text-lg text-gray-300">
        Delete <strong className="text-white">{name}</strong>? This cannot be undone.
      </p>
      <div className="flex justify-center space-x-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-600 rounded">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-red-600 rounded text-white flex items-center">
          <TrashIcon className="h-5 w-5 mr-1" /> Delete
        </button>
      </div>
    </div>
  </Modal>
);

// -------------------------
// Main Component
// -------------------------
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
    () => clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [clients, search]
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const currentList = filtered.slice((page - 1) * perPage, page * perPage);

  // Summaries
  const totalSum = useMemo(() => clients.reduce((sum, c) => sum + c.totalPurchases, 0), [clients]);
  const avgAOV = useMemo(() => (clients.length ? clients.reduce((s,c) => s + c.averageOrderValue, 0)/clients.length : 0), [clients]);

  // Chart
  const chartData = {
    labels: filtered.map((c) => c.name),
    datasets: [
      { label: "Purchases", data: filtered.map((c) => c.totalPurchases) },
      { label: "Avg Order", data: filtered.map((c) => c.averageOrderValue) },
    ],
  };

  // -----------------------
  // CRUD handlers
  // -----------------------
  const handleSave = useCallback(async (data: ClientPayload) => {
    try {
      let res: Response;
      if (data.id) {
        res = await fetch(`/api/admin/clients/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, companyId }),
        });
      } else {
        res = await fetch(`/api/admin/clients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, companyId }),
        });
      }
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json() as Client;
      setClients((prev) =>
        data.id
          ? prev.map((c) => (c.id === updated.id ? updated : c))
          : [...prev, updated]
      );
    } catch (e) {
      console.error(e);
      alert("Failed to save client.");
    }
  }, [companyId]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete client.");
    }
  }, []);

  return (
    <main className="container mx-auto p-6 bg-gray-900 min-h-screen text-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Client Hub</h1>
        <button
          onClick={() => { setEditClient(null); setShowAddEdit(true); }}
          className="flex items-center bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full p-2 bg-gray-800 rounded"
        />
      </div>

      {/* Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard title="Total Clients" value={clients.length} icon={UsersIcon} gradientClass="from-blue-500 to-cyan-600" />
        <SummaryCard title="Total Purchase $" value={`$${totalSum.toFixed(2)}`} icon={ShoppingBagIcon} gradientClass="from-green-500 to-teal-600" />
        <SummaryCard title="Avg Order $" value={`$${avgAOV.toFixed(2)}`} icon={ChartBarIcon} gradientClass="from-purple-500 to-pink-600" />
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-6 rounded mb-8">
        <h2 className="text-2xl mb-4">Purchase Overview</h2>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentList.map((c) => (
          <ClientCard
            key={c.id}
            client={c}
            onEdit={(c) => { setEditClient(c); setShowAddEdit(true); }}
            onDelete={(id) => { setDeleteId(id); setShowDelete(true); }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 bg-gray-700 rounded">Prev</button>
          <span className="px-3 py-1 bg-emerald-600 rounded text-white">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-700 rounded">Next</button>
        </div>
      )}

      {/* Modals */}
      <AddEditClientModal
        isOpen={showAddEdit}
        onClose={() => setShowAddEdit(false)}
        client={editClient}
        onSave={handleSave}
      />
      {deleteId && (
        <DeleteConfirmationModal
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={() => { handleDelete(deleteId); setShowDelete(false); }}
          name={clients.find((c) => c.id === deleteId)?.name ?? ""}
        />
      )}
    </main>
  );
};

export default ClientsClient;
