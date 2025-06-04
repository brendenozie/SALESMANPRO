// app/admin/agents/AgentsClient.tsx

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
import AdminLayout from "@/components/AdminLayout";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export type Agent = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  totalSales: number;
  totalCommissions: number;
  recentTransaction: {
    amount: number;
    date: string | null;
  };
  recentCommission: {
    amount: number;
    date: string | null;
    status: string;
  };
};

interface ClientProps {
  agentsData: Agent[];
}

const AgentsClient: React.FC<ClientProps> = ({ agentsData }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter by name
  const filteredAgents = useMemo(() => {
    return agentsData.filter((agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [agentsData, searchTerm]);

  // Summaries
  const totalSales = useMemo(
    () => agentsData.reduce((sum, agent) => sum + agent.totalSales, 0),
    [agentsData]
  );
  const totalCommissions = useMemo(
    () =>
      agentsData.reduce((sum, agent) => sum + agent.totalCommissions, 0),
    [agentsData]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedAgents = filteredAgents.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data (based on filteredAgents)
  const chartData = {
    labels: filteredAgents.map((agent) => agent.name),
    datasets: [
      {
        label: "Total Sales",
        data: filteredAgents.map((agent) => agent.totalSales),
        backgroundColor: "#29B6F6",
        borderColor: "#0288D1",
        borderWidth: 1,
      },
      {
        label: "Total Commissions",
        data: filteredAgents.map((agent) => agent.totalCommissions),
        backgroundColor: "#FFA726",
        borderColor: "#FB8C00",
        borderWidth: 1,
      },
    ],
  };

  return (
    <AdminLayout>
      <div className="flex flex-col min-h-screen w-full bg-gradient-to-tr from-gray-800 via-gray-900 to-black text-white">
        <UserNav />
        <main className="flex-grow container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-extrabold text-center text-indigo-400 mb-10 drop-shadow-lg">
              Agents Overview
            </h1>

            {/* Search Bar */}
            <div className="flex justify-center mb-8">
              <input
                type="text"
                placeholder="Search agents by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-md"
                aria-label="Search agents"
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
                title="Total Agents"
                value={agentsData.length}
                bgColor="bg-indigo-500"
              />
              <SummaryCard
                title="Total Sales"
                value={`$${totalSales.toFixed(2)}`}
                bgColor="bg-green-500"
              />
              <SummaryCard
                title="Total Commissions"
                value={`$${totalCommissions.toFixed(2)}`}
                bgColor="bg-yellow-500"
              />
            </div>

            {/* Chart Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">
                Sales &amp; Commissions
              </h2>
              <div className="chart-container" style={{ height: "300px" }}>
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" as const },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: "#ddd" } },
                      y: { grid: { color: "#444" }, ticks: { color: "#ddd" } },
                    },
                  }}
                />
              </div>
            </div>

            {/* Agents List */}
            <section>
              {paginatedAgents.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-400">
                    No agents match your search.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {paginatedAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      onEdit={(id) => alert(`Editing agent with ID ${id}`)}
                      onDelete={(id) => alert(`Deleting agent with ID ${id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                  {`Page ${currentPage} of ${totalPages}`}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AgentsClient;

// ----------------------
// Helper components
// ----------------------

interface SummaryCardProps {
  title: string;
  value: string | number;
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, bgColor }) => (
  <div className={`${bgColor} text-white p-5 rounded-lg shadow-md hover:shadow-lg transition`}>
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

interface AgentCardProps {
  agent: Agent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onEdit, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-bold text-indigo-400 mb-2">{agent.name}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Email: <span className="text-gray-300">{agent.email}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Phone: <span className="text-gray-300">{agent.phoneNumber}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Total Sales:{" "}
        <span className="text-green-400 font-medium">${agent.totalSales.toFixed(2)}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Total Commissions:{" "}
        <span className="text-yellow-400 font-medium">
          ${agent.totalCommissions.toFixed(2)}
        </span>
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Last Transaction:{" "}
        <span className="text-green-400 font-medium">
          ${agent.recentTransaction.amount.toFixed(2)}
        </span>
      </p>
    </div>
    <div className="flex space-x-2 self-end">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        onClick={() => onEdit(agent.id)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(agent.id)}
      >
        Delete
      </button>
    </div>
  </div>
);
