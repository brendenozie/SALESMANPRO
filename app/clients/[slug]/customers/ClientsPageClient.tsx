"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalSales: number;
  recentTransactionAmount: number;
  recentTransactionDate: string;
  status: "new" | "active";
};

type Props = {
  clientsData: Client[];
};

export default function ClientsPageClient({ clientsData }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredClients = clientsData.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const newClients = filteredClients.filter((c) => c.status === "new");
  const activeClients = filteredClients.filter((c) => c.status === "active");
  const totalSales = clientsData.reduce((sum, c) => sum + c.totalSales, 0);
  const totalCustomerGrowth = clientsData.length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const chartData = {
    labels: ["New Clients", "Active Clients"],
    datasets: [
      {
        label: "Number of Clients",
        data: [newClients.length, activeClients.length],
        backgroundColor: ["#F59E0B", "#3B82F6"],
        borderColor: ["#D97706", "#2563EB"],
        borderWidth: 1,
      },
    ],
  };

  const handleDelete = (id: string) => alert(`Client ${id} deleted.`);
  const handleEdit = (id: string) => alert(`Editing client ${id}.`);

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Clients Overview
      </h1>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <input
          type="text"
          placeholder="Search clients by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-3 rounded-lg w-full max-w-lg shadow focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-indigo-600 text-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Clients</h2>
          <p className="text-2xl font-bold">{clientsData.length}</p>
        </div>
        <div className="bg-green-600 text-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Customer Growth</h2>
          <p className="text-2xl font-bold">{totalCustomerGrowth}</p>
        </div>
        <div className="bg-yellow-500 text-white p-5 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Sales</h2>
          <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Customer Growth Chart</h2>
        <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
      </div>

      {/* Clients List */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Clients List</h2>
        {paginatedClients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedClients.map((client) => (
              <div key={client.id} className="bg-white p-5 rounded-lg shadow relative">
                <div>
                  <h3 className="text-lg font-bold">{client.name}</h3>
                  <p className="text-sm text-gray-600">📧 {client.email}</p>
                  <p className="text-sm text-gray-600">📞 {client.phone}</p>
                  <p className="text-sm mt-2 text-gray-700 font-medium">
                    💰 Total Sales: ${client.totalSales.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-700">
                    🕒 Last Txn: ${client.recentTransactionAmount.toFixed(2)} on{" "}
                    {format(parseISO(client.recentTransactionDate), "MMM dd, yyyy")}
                  </p>
                </div>

                {/* Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleEdit(client.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    onClick={() => handleDelete(client.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">No clients found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700 font-medium">
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
