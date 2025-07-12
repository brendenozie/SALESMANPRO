// app/admin/donations/DonationsClient.tsx
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
import { Donation } from "./page"; // Import the Donation type

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ClientProps {
  donationsData: Donation[];
}

const DonationsClient: React.FC<ClientProps> = ({ donationsData }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

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


  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-teal-400 mb-10 drop-shadow-lg">
          Donations Management
        </h1>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Search donations by donor, project, or campaign..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-md"
            aria-label="Search donations"
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
          {paginatedDonations.length === 0 ? (
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
                  onEdit={(id) => alert(`Editing donation with ID ${id}`)}
                  onDelete={(id) => alert(`Deleting donation with ID ${id}`)}
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
