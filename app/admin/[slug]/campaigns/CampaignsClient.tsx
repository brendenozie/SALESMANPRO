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
import { Campaign } from "./page";
import Modal from "@/components/Modal"; // Adjust path as needed

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ClientProps {
  campaignsData: Campaign[];
}

const CampaignsClient: React.FC<ClientProps> = ({ campaignsData: initialCampaignsData }) => {
  const [campaignsData, setCampaignsData] = useState<Campaign[]>(initialCampaignsData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 6;

  // Function to refresh data
  const refreshCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/campaigns`, { next: { revalidate: 60 } }); // Adjust for companyId if needed
      if (res.ok) {
        const data = await res.json();
        setCampaignsData(data);
      } else {
        throw new Error(`Failed to fetch campaigns: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh campaigns.");
      console.error("Error refreshing campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // Handle Add Campaign
  const handleAddCampaign = async (newCampaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCampaign),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        await refreshCampaigns(); // Refresh the list after successful addition
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add campaign.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add campaign.");
      console.error("Error adding campaign:", err);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for Edit/Delete actions
  const handleEdit = (id: string) => alert(`Editing campaign with ID ${id}`);
  const handleDelete = (id: string) => alert(`Deleting campaign with ID ${id}`);

  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-orange-400 mb-10 drop-shadow-lg">
          Campaigns Management
        </h1>

        {/* Action Bar: Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search campaigns by name or description..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-md"
            aria-label="Search campaigns"
          />
          <div className="flex gap-3">
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all font-semibold"
            >
              Add New Campaign
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4">Loading campaigns...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

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
          {paginatedCampaigns.length === 0 && !loading && !error ? (
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
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-4 mt-8">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading}
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

      {/* Add Campaign Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Campaign">
        <AddCampaignForm
          onSubmit={handleAddCampaign}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={loading}
        />
      </Modal>
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

// Add Campaign Form Component
interface AddCampaignFormProps {
  onSubmit: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AddCampaignForm: React.FC<AddCampaignFormProps> = ({ onSubmit, onCancel, isLoading }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [goalAmount, setGoalAmount] = useState<string>('');
  const [status, setStatus] = useState<Campaign['status']>('PLANNED');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Campaign name is required.');
      return;
    }
    if (goalAmount && isNaN(parseFloat(goalAmount))) {
      setFormError('Goal amount must be a valid number.');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setFormError('End date cannot be before start date.');
        return;
    }

    onSubmit({
      name,
      description: description || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      goalAmount: goalAmount ? parseFloat(goalAmount) : null,
      currentAmount: 0, // New campaigns start with 0 raised
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Campaign Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-orange-500 focus:border-orange-500"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-orange-500 focus:border-orange-500"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>
      <div>
        <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-300">Goal Amount ($)</label>
        <input
          type="number"
          id="goalAmount"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
          step="0.01"
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-orange-500 focus:border-orange-500"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Campaign['status'])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Campaign'}
        </button>
      </div>
    </form>
  );
};
