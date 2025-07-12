// app/admin/donations/DonationsClient.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Donation } from "./page";
import Modal from "@/components/Modal"; // Adjust path as needed

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Placeholder types for dropdowns - In a real app, these would be fetched from your APIs
type UserOption = { id: string; name: string; email: string };
type ProjectOption = { id: string; name: string };
type CampaignOption = { id: string; name: string };

interface ClientProps {
  donationsData: Donation[];
}

const DonationsClient: React.FC<ClientProps> = ({ donationsData: initialDonationsData }) => {
  const [donationsData, setDonationsData] = useState<Donation[]>(initialDonationsData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder data for dropdowns (replace with actual fetched data)
  const [users, setUsers] = useState<UserOption[]>([
    { id: 'user1', name: 'John Doe', email: 'john.doe@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  ]);
  const [projects, setProjects] = useState<ProjectOption[]>([
    { id: 'project1', name: 'Community Garden' },
    { id: 'project2', name: 'Education Drive' },
  ]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([
    { id: 'campaign1', name: 'Summer Fundraiser' },
    { id: 'campaign2', name: 'Winter Aid Appeal' },
  ]);

  const itemsPerPage = 6;

  // Function to refresh data
  const refreshDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/donations`, { cache: "no-store" }); // Adjust for companyId if needed
      if (res.ok) {
        const data = await res.json();
        setDonationsData(data);
      } else {
        throw new Error(`Failed to fetch donations: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh donations.");
      console.error("Error refreshing donations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by donor name, email, or project/campaign name
  const filteredDonations = useMemo(() => {
    return donationsData.filter(
      (donation) =>
        donation.donor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donor?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.project?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [donationsData, searchTerm]);

  // Summaries
  const totalDonationsCount = donationsData.length;
  const totalDonationAmount = useMemo(
    () => donationsData.reduce((sum, d) => sum + d.amount, 0),
    [donationsData]
  );
  const successfulDonations = donationsData.filter(d => d.status === 'SUCCESS').length;
  const averageDonation = totalDonationsCount > 0 ? totalDonationAmount / totalDonationsCount : 0;

  // Pagination logic
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDonations = filteredDonations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for Donation Amounts by Status
  const statusAmounts = donationsData.reduce((acc, donation) => {
    acc[donation.status] = (acc[donation.status] || 0) + donation.amount;
    return acc;
  }, {} as Record<Donation['status'], number>);

  const donationStatusChartData = {
    labels: Object.keys(statusAmounts),
    datasets: [
      {
        label: "Total Amount",
        data: Object.values(statusAmounts),
        backgroundColor: [
          '#8BC34A', // SUCCESS (Light Green)
          '#FFD700', // PENDING (Gold)
          '#EF5350', // FAILED (Red)
          '#B0BEC5', // REFUNDED (Blue Grey)
        ],
        borderColor: '#333',
        borderWidth: 1,
      },
    ],
  };

  // Handle Add Donation
  const handleAddDonation = async (newDonation: Omit<Donation, 'id' | 'createdAt' | 'donor' | 'project' | 'campaign'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDonation),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        await refreshDonations(); // Refresh the list after successful addition
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to add donation.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add donation.");
      console.error("Error adding donation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for Edit/Delete actions
  const handleEdit = (id: string) => alert(`Editing donation with ID ${id}`);
  const handleDelete = (id: string) => alert(`Deleting donation with ID ${id}`);

  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-teal-400 mb-10 drop-shadow-lg">
          Donations Management
        </h1>

        {/* Action Bar: Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search donations by donor, project, or campaign..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md"
            aria-label="Search donations"
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
              className="px-6 py-3 bg-teal-500 text-white rounded-lg shadow-lg hover:bg-teal-600 transition-all font-semibold"
            >
              Add New Donation
            </button>
          </div>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4">Loading donations...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Donations"
            value={totalDonationsCount}
            bgColor="bg-teal-600"
          />
          <SummaryCard
            title="Total Amount"
            value={`$${totalDonationAmount.toFixed(2)}`}
            bgColor="bg-green-600"
          />
          <SummaryCard
            title="Successful Donations"
            value={successfulDonations}
            bgColor="bg-lime-600"
          />
          <SummaryCard
            title="Avg. Donation"
            value={`$${averageDonation.toFixed(2)}`}
            bgColor="bg-cyan-600"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Donation Amounts by Status
          </h2>
          <div className="chart-container" style={{ height: "300px" }}>
            <Bar
              data={donationStatusChartData}
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

        {/* Donations List */}
        <section>
          {paginatedDonations.length === 0 && !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No donations match your search or are available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedDonations.map((donation) => (
                <DonationCard
                  key={donation.id}
                  donation={donation}
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

      {/* Add Donation Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Donation">
        <AddDonationForm
          onSubmit={handleAddDonation}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={loading}
          users={users}
          projects={projects}
          campaigns={campaigns}
        />
      </Modal>
    </main>
  );
};

export default DonationsClient;

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

interface DonationCardProps {
  donation: Donation;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, onEdit, onDelete }) => (
  <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
    <div>
      <h3 className="text-2xl font-bold text-teal-400 mb-2">${donation.amount.toFixed(2)} {donation.currency}</h3>
      <p className="text-sm text-gray-400 mb-1">
        Donor: <span className="text-gray-300">{donation.donor?.name || donation.donor?.email || 'Anonymous'}</span>
      </p>
      <p className="text-sm text-gray-400 mb-1">
        Date: <span className="text-gray-300">{new Date(donation.donationDate).toLocaleDateString()}</span>
      </p>
      {donation.project && (
        <p className="text-sm text-gray-400 mb-1">
          Project: <span className="text-gray-300">{donation.project.name}</span>
        </p>
      )}
      {donation.campaign && (
        <p className="text-sm text-gray-400 mb-1">
          Campaign: <span className="text-gray-300">{donation.campaign.name}</span>
        </p>
      )}
      <p className="text-sm text-gray-400 mb-4">
        Status: <span className={`font-medium ${
          donation.status === 'SUCCESS' ? 'text-green-400' :
          donation.status === 'PENDING' ? 'text-yellow-400' :
          'text-red-400'
        }`}>{donation.status}</span>
      </p>
    </div>
    <div className="flex space-x-2 self-end mt-4">
      <button
        className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
        onClick={() => onEdit(donation.id)}
      >
        Edit
      </button>
      <button
        className="px-3 py-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        onClick={() => onDelete(donation.id)}
      >
        Delete
      </button>
    </div>
  </div>
);

// Add Donation Form Component
interface AddDonationFormProps {
  onSubmit: (donation: Omit<Donation, 'id' | 'createdAt' | 'donor' | 'project' | 'campaign'>) => void;
  onCancel: () => void;
  isLoading: boolean;
  users: UserOption[];
  projects: ProjectOption[];
  campaigns: CampaignOption[];
}

const AddDonationForm: React.FC<AddDonationFormProps> = ({ onSubmit, onCancel, isLoading, users, projects, campaigns }) => {
  const [donorId, setDonorId] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<Donation['status']>('PENDING');
  const [projectId, setProjectId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!donorId) {
      setFormError('Donor is required.');
      return;
    }
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setFormError('Amount must be a positive number.');
      return;
    }

    // onSubmit({
    //   donorId,
    //   amount: parseFloat(amount),
    //   currency,
    //   paymentMethod: paymentMethod || null,
    //   notes: notes || null,
    //   status,
    //   projectId: projectId || null,
    //   campaignId: campaignId || null,
    //   transactionId: transactionId || null,
    // });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && <p className="text-red-500 text-sm">{formError}</p>}
      <div>
        <label htmlFor="donorId" className="block text-sm font-medium text-gray-300">Donor</label>
        <select
          id="donorId"
          value={donorId}
          onChange={(e) => setDonorId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
          required
        >
          <option value="">Select a donor</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-300">Currency</label>
          <input
            type="text"
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-300">Payment Method</label>
        <input
          type="text"
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Donation['status'])}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-300">Project (Optional)</label>
          <select
            id="projectId"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">None</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="campaignId" className="block text-sm font-medium text-gray-300">Campaign (Optional)</label>
          <select
            id="campaignId"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">None</option>
            {campaigns.map(campaign => (
              <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="transactionId" className="block text-sm font-medium text-gray-300">Transaction ID (Optional)</label>
        <input
          type="text"
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-300">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-teal-500 focus:border-teal-500"
        ></textarea>
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
          className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Donation'}
        </button>
      </div>
    </form>
  );
};
