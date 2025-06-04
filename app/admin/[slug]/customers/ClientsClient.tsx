// app/admin/clients/ClientsClient.tsx

"use client";

import React, { useState, useMemo } from "react";
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
import UserNav from "@/components/UserNav";
import UserLayout from "@/components/UserLayout";
import AdminLayout from "@/components/AdminLayout";
import { format, parseISO } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  // Filtered list based on search term
  const filteredClients = useMemo(() => {
    return initialClients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [initialClients, searchTerm]);

  // Separate new vs. active
  const newClients = useMemo(
    () => filteredClients.filter((c) => c.status === "new"),
    [filteredClients]
  );
  const activeClients = useMemo(
    () => filteredClients.filter((c) => c.status === "active"),
    [filteredClients]
  );

  // Total sales
  const totalSales = useMemo(
    () =>
      initialClients.reduce((sum, client) => sum + client.totalSales, 0),
    [initialClients]
  );

  // Pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedClients = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data
  const chartData = {
    labels: ["New Clients", "Active Clients"],
    datasets: [
      {
        label: "Number of Clients",
        data: [newClients.length, activeClients.length],
        backgroundColor: ["#FFA726", "#29B6F6"],
        borderColor: ["#FB8C00", "#0288D1"],
        borderWidth: 1,
      },
    ],
  };

  // Handlers
  const handleDelete = (id: string) => {
    alert(`Client with ID ${id} deleted.`);
  };
  const handleEdit = (id: string) => {
    alert(`Editing client with ID ${id}.`);
  };

  const PaginationButton = ({
    label,
    onClick,
    disabled,
  }: {
    label: string;
    onClick: () => void;
    disabled: boolean;
  }) => (
    <button
      disabled={disabled}
      onClick={onClick}
      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 disabled:opacity-50"
    >
      {label}
    </button>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-tr from-gray-800 via-gray-900 to-black text-white">
        <UserNav />
        <main className="flex-grow container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-extrabold text-center text-indigo-400 mb-10 drop-shadow-lg">
              Clients Overview
            </h1>

            {/* Search Bar */}
            <div className="flex justify-center mb-8">
              <input
                type="text"
                placeholder="Search clients by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-md"
                aria-label="Search clients"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="ml-3 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                  aria-label="Clear search"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <SummaryCard
                title="Total Clients"
                value={initialClients.length}
                bgColor="bg-indigo-500"
              />
              <SummaryCard
                title="New Clients"
                value={newClients.length}
                bgColor="bg-green-500"
              />
              <SummaryCard
                title="Active Clients"
                value={activeClients.length}
                bgColor="bg-blue-500"
              />
              <SummaryCard
                title="Total Sales"
                value={`$${totalSales.toFixed(2)}`}
                bgColor="bg-yellow-500"
              />
            </div>

            {/* Chart Section */}
            <section className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Customer Growth
              </h2>
              <div className="flex-grow">
                <div className="chart-container" style={{ height: "300px" }}>
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" },
                      },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: "#ddd" } },
                        y: { grid: { color: "#444" }, ticks: { color: "#ddd" } },
                      },
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Clients List Section */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-indigo-400">Clients List</h2>
                <button className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow hover:bg-indigo-600">
                  Add Client
                </button>
              </div>

              {paginatedClients.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-400">
                    No clients match your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {paginatedClients.map((client) => (
                    <ClientCard
                      key={client.id}
                      client={client}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex justify-center mt-6 space-x-4">
                <PaginationButton
                  label="Previous"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                />
                <PaginationButton
                  label="Next"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}

// ----------------------
// Helper Components
// ----------------------

interface SummaryCardProps {
  title: string;
  value: string | number;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, bgColor }) => (
  <div
    className={`${bgColor} text-white p-5 rounded-lg shadow-md hover:shadow-lg transition`}
  >
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

interface ClientCardProps {
  client: Client;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-bold text-indigo-400 mb-2">{client.name}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Email: <span className="text-gray-300">{client.email}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Phone: <span className="text-gray-300">{client.phone}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Total Sales:{" "}
        <span className="text-green-400 font-medium">
          ${client.totalSales.toFixed(2)}
        </span>
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Last Transaction:{" "}
        <span className="text-green-400 font-medium">
          $
          {client.recentTransactionAmount.toFixed(2)} on{" "}
          {format(parseISO(client.recentTransactionDate), "MMM dd, yyyy")}
        </span>
      </p>
    </div>
    <div className="flex space-x-2 self-end">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        onClick={() => onEdit(client.id)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(client.id)}
      >
        Delete
      </button>
    </div>
  </div>
);
