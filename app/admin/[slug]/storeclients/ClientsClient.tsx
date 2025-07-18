// app/admin/clients/ClientsClient.tsx

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
  UsersIcon,       // For total clients
  ShoppingBagIcon,  // For total purchases
  ChartBarIcon,     // For average order value
  PencilSquareIcon, // Edit icon
  TrashIcon,        // Delete icon
  PlusCircleIcon,   // Add icon
  XMarkIcon,        // Clear search icon
  CheckCircleIcon,  // Save icon in modal
  ExclamationTriangleIcon, // Warning icon in delete modal
} from "@heroicons/react/24/outline"; // Importing relevant icons

import Modal from "@/components/Modal"; // Re-using the generic Modal component

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Type definition for Client
export type Client = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  totalPurchases: number;
  lastPurchaseDate: string | null; // e.g., "YYYY-MM-DD"
  averageOrderValue: number; // Calculated or provided
};

interface ClientProps {
  clientsData: Client[];
}

// -----------------------------------------------------------------------------
// Helper Components (Styled for enhanced UI)
// -----------------------------------------------------------------------------

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType; // Icon component
  gradientClass: string; // Tailwind gradient classes
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon: Icon,
  gradientClass,
}) => (
  <div
    className={`p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105
                text-white flex flex-col items-center justify-center text-center ${gradientClass}`}
  >
    <Icon className="h-10 w-10 mb-3 text-white opacity-90" />
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
  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-7 rounded-xl shadow-xl border-b-4 border-emerald-600 hover:border-emerald-400 transition-all duration-300 flex flex-col justify-between">
    <div className="mb-4">
      <h3 className="text-3xl font-extrabold text-emerald-400 mb-2 truncate">
        {client.name}
      </h3>
      <p className="text-sm text-gray-300 mb-1 flex items-center">
        <span className="font-semibold w-24">Email:</span>{" "}
        <span className="text-gray-200 ml-2 truncate">{client.email}</span>
      </p>
      <p className="text-sm text-gray-300 mb-1 flex items-center">
        <span className="font-semibold w-24">Phone:</span>{" "}
        <span className="text-gray-200 ml-2">{client.phoneNumber}</span>
      </p>
    </div>

    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-4 text-sm">
      <div className="flex flex-col">
        <span className="text-gray-400 font-medium">Total Purchases:</span>
        <span className="text-lime-400 text-lg font-bold">
          ${client.totalPurchases.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-gray-400 font-medium">Last Purchase:</span>
        <span className="text-blue-400 font-bold">
          {client.lastPurchaseDate || "N/A"}
        </span>
      </div>
      <div className="flex flex-col col-span-2">
        <span className="text-gray-400 font-medium">Avg. Order Value:</span>
        <span className="text-sky-400 text-lg font-bold">
          ${client.averageOrderValue.toFixed(2)}
        </span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-700">
      <button
        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 text-sm font-medium"
        onClick={() => onEdit(client)}
        aria-label={`Edit ${client.name}`}
      >
        <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
      </button>
      <button
        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 text-sm font-medium"
        onClick={() => onDelete(client.id)}
        aria-label={`Delete ${client.name}`}
      >
        <TrashIcon className="h-5 w-5 mr-1" /> Delete
      </button>
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// Modals for Add/Edit/Delete
// -----------------------------------------------------------------------------

interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null; // Client data for editing, null for adding
  onSave: (client: Client) => void;
}

const AddEditClientModal: React.FC<AddEditClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  const [formData, setFormData] = useState<Client>(
    client || {
      id: "",
      name: "",
      email: "",
      phoneNumber: "",
      totalPurchases: 0,
      lastPurchaseDate: null,
      averageOrderValue: 0,
    }
  );

  // Reset form data when client prop changes (for editing) or modal opens/closes
  React.useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      // Clear form for adding new client
      setFormData({
        id: "",
        name: "",
        email: "",
        phoneNumber: "",
        totalPurchases: 0,
        lastPurchaseDate: null,
        averageOrderValue: 0,
      });
    }
  }, [client, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd generate a unique ID for new clients here if not from backend
    const savedClient = { ...formData, id: formData.id || `client-${Date.now()}` };
    onSave(savedClient);
    onClose(); // Close modal after saving
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">
          {client ? "Edit Client" : "Add New Client"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-gray-300 text-sm font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-300 text-sm font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>
          {/* Read-only fields for derived data in edit mode */}
          {client && (
            <>
              <div>
                <label htmlFor="totalPurchases" className="block text-gray-300 text-sm font-semibold mb-2">
                  Total Purchases
                </label>
                <input
                  type="number"
                  id="totalPurchases"
                  name="totalPurchases"
                  value={formData.totalPurchases.toFixed(2)}
                  readOnly
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-400 cursor-not-allowed"
                  title="Total Purchases are calculated automatically"
                />
              </div>
              <div>
                <label htmlFor="lastPurchaseDate" className="block text-gray-300 text-sm font-semibold mb-2">
                  Last Purchase Date
                </label>
                <input
                  type="text" // Or date type if you want a date picker
                  id="lastPurchaseDate"
                  name="lastPurchaseDate"
                  value={formData.lastPurchaseDate || "N/A"}
                  readOnly
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-400 cursor-not-allowed"
                  title="Last Purchase Date is updated automatically"
                />
              </div>
              <div>
                <label htmlFor="averageOrderValue" className="block text-gray-300 text-sm font-semibold mb-2">
                  Average Order Value
                </label>
                <input
                  type="number"
                  id="averageOrderValue"
                  name="averageOrderValue"
                  value={formData.averageOrderValue.toFixed(2)}
                  readOnly
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-400 cursor-not-allowed"
                  title="Average Order Value is calculated automatically"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-200 font-semibold flex items-center"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" /> {client ? "Save Changes" : "Add Client"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clientName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 text-gray-100 p-8 rounded-xl shadow-2xl w-full max-w-sm mx-auto text-center">
        <ExclamationTriangleIcon className="h-20 w-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
        <p className="text-lg text-gray-300 mb-7">
          Are you sure you want to delete client <span className="font-bold text-white">"{clientName}"</span>? This action cannot be undone.
        </p>
        <div className="flex justify-center space-x-5">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-all duration-200 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 font-semibold flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" /> Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

// -----------------------------------------------------------------------------
// Main ClientsClient Component
// -----------------------------------------------------------------------------

const ClientsClient: React.FC<ClientProps> = ({ clientsData: initialClientsData }) => {
  const [clients, setClients] = useState<Client[]>(initialClientsData); // Use internal state for clients
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null); // For editing
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [clientToDeleteName, setClientToDeleteName] = useState<string>("");

  // Filter by name
  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Summaries
  const totalClients = useMemo(() => clients.length, [clients]);
  const totalPurchases = useMemo(
    () => clients.reduce((sum, client) => sum + client.totalPurchases, 0),
    [clients]
  );
  const totalAverageOrderValue = useMemo(
    () => {
      const sumOfAOV = clients.reduce((sum, client) => sum + client.averageOrderValue, 0);
      return clients.length > 0 ? sumOfAOV / clients.length : 0;
    },
    [clients]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedClients = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data (based on filteredClients)
  const chartData = {
    labels: filteredClients.map((client) => client.name),
    datasets: [
      {
        label: "Total Purchases",
        data: filteredClients.map((client) => client.totalPurchases),
        backgroundColor: "rgba(102, 204, 153, 0.8)", // Greenish
        borderColor: "#4CAF50",
        borderWidth: 1,
        borderRadius: 5,
      },
      {
        label: "Average Order Value",
        data: filteredClients.map((client) => client.averageOrderValue),
        backgroundColor: "rgba(77, 182, 172, 0.8)", // Tealish
        borderColor: "#009688",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  // -----------------------
  // CRUD Operations Handlers
  // -----------------------

  const handleAddClient = () => {
    setEditingClient(null); // Clear any previous editing state
    setShowAddEditModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowAddEditModal(true);
  };

  const handleSaveClient = (updatedClient: Client) => {
    // In a real application, you'd send this to your backend API
    console.log("Saving client:", updatedClient);
    if (updatedClient.id && clients.find(c => c.id === updatedClient.id)) {
      // Update existing client
      setClients(clients.map((c) => (c.id === updatedClient.id ? updatedClient : c)));
      alert("Client updated successfully!");
    } else {
      // Add new client (assign a temporary ID)
      setClients([...clients, { ...updatedClient, id: `client-${Date.now()}` }]);
      alert("Client added successfully!");
    }
  };

  const handleDeleteClient = (id: string) => {
    const clientName = clients.find(c => c.id === id)?.name || "this client";
    setClientToDelete(id);
    setClientToDeleteName(clientName);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      // In a real application, you'd send this to your backend API
      setClients(clients.filter((c) => c.id !== clientToDelete));
      alert(`Client ${clientToDeleteName} deleted successfully!`);
      setClientToDelete(null);
      setClientToDeleteName("");
      setShowDeleteConfirmModal(false);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-12 bg-gray-900 min-h-screen text-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 mb-6 md:mb-0 drop-shadow-lg text-center md:text-left">
            Client Hub
          </h1>
          <button
            onClick={handleAddClient}
            className="flex items-center px-8 py-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-lg font-semibold"
            aria-label="Add New Client"
          >
            <PlusCircleIcon className="h-7 w-7 mr-3" /> Add New Client
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center mb-10 space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search clients by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-4 pl-12 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xl transition-all duration-300"
              aria-label="Search clients"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <SummaryCard
            title="Total Clients"
            value={totalClients}
            icon={UsersIcon}
            gradientClass="from-blue-600 to-cyan-700"
          />
          <SummaryCard
            title="Total Purchases Value"
            value={`$${totalPurchases.toFixed(2)}`}
            icon={ShoppingBagIcon}
            gradientClass="from-green-600 to-teal-700"
          />
          <SummaryCard
            title="Average Order Value"
            value={`$${totalAverageOrderValue.toFixed(2)}`}
            icon={ChartBarIcon}
            gradientClass="from-purple-600 to-pink-700"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl flex flex-col mb-12 border border-gray-700">
          <h2 className="text-3xl font-bold text-gray-100 mb-6 border-b border-gray-700 pb-4">
            Client Purchase Overview
          </h2>
          <div className="chart-container h-80 md:h-96">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: { color: "#ddd", font: { size: 14 } },
                  },
                  tooltip: {
                    backgroundColor: "rgba(0,0,0,0.7)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    borderColor: "#60A5FA",
                    borderWidth: 1,
                    cornerRadius: 6,
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#ddd", font: { size: 12 } },
                    title: {
                      display: true,
                      text: "Client Name",
                      color: "#9CA3AF",
                      font: { size: 16, weight: "bold" },
                    },
                  },
                  y: {
                    grid: { color: "#444" },
                    ticks: { color: "#ddd", font: { size: 12 } },
                    title: {
                      display: true,
                      text: "Amount ($)",
                      color: "#9CA3AF",
                      font: { size: 16, weight: "bold" },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Clients List */}
        <section>
          <h2 className="text-3xl font-bold text-gray-100 mb-8 border-b border-gray-700 pb-4">
            All Clients
          </h2>
          {paginatedClients.length === 0 ? (
            <div className="bg-gray-800 p-16 rounded-xl shadow-2xl text-center">
              <p className="text-2xl text-gray-400 font-semibold">
                No clients found matching your criteria. 😞
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-6 py-3 bg-gray-700 rounded-full text-white font-semibold shadow-md hover:bg-gray-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
              aria-label="Previous page"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>{" "}
              Previous
            </button>
            <span className="px-5 py-2 bg-emerald-600 text-white rounded-full font-bold shadow-lg">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-6 py-3 bg-gray-700 rounded-full text-white font-semibold shadow-md hover:bg-gray-600 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
              aria-label="Next page"
            >
              Next{" "}
              <svg
                className="h-5 w-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      <AddEditClientModal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        client={editingClient}
        onSave={handleSaveClient}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={confirmDeleteClient}
        clientName={clientToDeleteName}
      />
    </main>
  );
};

export default ClientsClient;