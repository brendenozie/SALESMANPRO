// app/admin/campaigns/CampaignsClient.tsx
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
import { Campaign } from "./page"; // Import the Campaign type

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ClientProps {
  campaignsData: Campaign[];
}

const CampaignsClient: React.FC<ClientProps> = ({ campaignsData }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter by campaign name or description
  const filteredCampaigns = useMemo(() => {
    return campaignsData.filter(
      (campaign) =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [campaignsData, searchTerm]);

  // Summaries
  const totalCampaigns = campaignsData.length;
  const activeCampaigns = campaignsData.filter(c => c.status === 'ACTIVE').length;
  const totalGoalAmount = useMemo(
    () => campaignsData.reduce((sum, c) => sum + (c.goalAmount || 0), 0),
    [campaignsData]
  );
  const totalRaisedAmount = useMemo(
    () => campaignsData.reduce((sum, c) => sum + c.currentAmount, 0),
    [campaignsData]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedCampaigns = filteredCampaigns.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for Campaign Progress (Goal vs. Raised)
  const campaignProgressChartData = {
    labels: filteredCampaigns.map((campaign) => campaign.name),
    datasets: [
      {
        label: "Goal Amount",
        data: filteredCampaigns.map((campaign) => campaign.goalAmount || 0),
        backgroundColor: "#FFC107", // Amber
        borderColor: "#FFB300",
        borderWidth: 1,
      },
      {
        label: "Amount Raised",
        data: filteredCampaigns.map((campaign) => campaign.currentAmount),
        backgroundColor: "#4CAF50", // Green
        borderColor: "#43A047",
        borderWidth: 1,
      },
    ],
  };

  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-orange-400 mb-10 drop-shadow-lg">
          Campaigns Management
        </h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search campaigns by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-md"
            aria-label="Search campaigns"
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
            title="Total Campaigns"
            value={totalCampaigns}
            bgColor="bg-orange-600"
          />
          <SummaryCard
            title="Active Campaigns"
            value={activeCampaigns}
            bgColor="bg-amber-600"
          />
          <SummaryCard
            title="Total Goal"
            value={`$${totalGoalAmount.toFixed(2)}`}
            bgColor="bg-yellow-600"
          />
          <SummaryCard
            title="Total Raised"
            value={`$${totalRaisedAmount.toFixed(2)}`}
            bgColor="bg-green-600"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Campaign Progress (Goal vs. Raised)
          </h2>
          <div className="chart-container" style={{ height: "300px" }}>
            <Bar
              data={campaignProgressChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const, labels: { color: "#ddd" } },
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#ddd" } },
                  y: { grid: { color: "#444" }, ticks: { color: "#ddd" } },
                },
              }}
            />
          </div>
        </div>

        {/* Campaigns List */}
        <section>
          {paginatedCampaigns.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No campaigns match your search or are available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={(id) => alert(`Editing campaign with ID ${id}`)}
                  onDelete={(id) => alert(`Deleting campaign with ID ${id}`)}
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
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
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
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default CampaignsClient;

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

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onEdit, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-bold text-orange-400 mb-2">{campaign.name}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Description: <span className="text-gray-300 line-clamp-2">{campaign.description || 'N/A'}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Status: <span className={`font-medium ${
          campaign.status === 'ACTIVE' ? 'text-green-400' :
          campaign.status === 'COMPLETED' ? 'text-blue-400' :
          campaign.status === 'PLANNED' ? 'text-yellow-400' :
          'text-red-400'
        }`}>{campaign.status}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Goal: <span className="text-yellow-400 font-medium">${(campaign.goalAmount || 0).toFixed(2)}</span>
      </p>
      <p className="text-sm text-gray-400 mb-4">
        Raised: <span className="text-green-400 font-medium">${campaign.currentAmount.toFixed(2)}</span>
      </p>
    </div>
    <div className="flex space-x-2 self-end mt-4">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        onClick={() => onEdit(campaign.id)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(campaign.id)}
      >
        Delete
      </button>
    </div>
  </div>
);
