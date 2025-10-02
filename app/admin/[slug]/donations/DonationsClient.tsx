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
import { motion, AnimatePresence } from "framer-motion"; // For animations
import AddDonationForm from "./AddDonationForm";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Placeholder types for dropdowns - In a real app, these would be fetched from your APIs
type UserOption = { id: string; name: string; email: string };
type ProjectOption = { id: string; name: string };
type CampaignOption = { id: string; name: string };

interface ClientProps {
  donationsData: Donation[];
  donorsData: UserOption[];
  projectsData: ProjectOption[];
  campaignsData: CampaignOption[];
}

const DonationsClient: React.FC<ClientProps> = ({ 
                                                  donationsData: initialDonationsData, 
                                                  donorsData: initialDonorsData, 
                                                  projectsData: initialProjectsData, 
                                                  campaignsData: initialCampaignsData }) => {
  
  const [donationsData, setDonationsData] = useState<Donation[]>(initialDonationsData);
  const [donorsData, setDonorsData] = useState<UserOption[]>(initialDonorsData);
  const [projectsData, setProjectsData] = useState<ProjectOption[]>(initialProjectsData);
  const [campaignsData, setCampaignsData] = useState<CampaignOption[]>(initialCampaignsData);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 6;

  // Function to refresh data
  const refreshDonations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/admin/donations`, { next: { revalidate: 60 } }); // Adjust for companyId if needed
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
      const res = await fetch(`${apiUrl}/admin/donations`, {
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
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gray-900 text-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl lg:text-6xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-500 mb-12 drop-shadow-xl animate-fade-in-down">
          Empower Your Impact: Donations Dashboard
        </h1>

        {/* Action Bar: Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search by donor, project, or campaign..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-4 pl-12 rounded-full bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none shadow-lg transition-all duration-300 ease-in-out"
              aria-label="Search donations"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Clear search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out font-semibold flex items-center gap-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add New Donation
          </button>
        </div>

        {loading && <p className="text-center text-blue-400 mb-4 animate-pulse">Loading donations...</p>}
        {error && <p className="text-center text-red-500 mb-4 animate-fade-in">Error: {error}</p>}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <SummaryCard
            title="Total Donations"
            value={totalDonationsCount}
            bgColor="bg-gradient-to-br from-teal-500 to-teal-700"
            icon={<svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
          />
          <SummaryCard
            title="Total Amount"
            value={`$${totalDonationAmount.toFixed(2)}`}
            bgColor="bg-gradient-to-br from-green-500 to-green-700"
            icon={<svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1M12 8V4m0 4v12m0-12c-1.11 0-2.08-.402-2.592-1M12 8H7.5c-.51 0-1 .45-1 1s.5 1 1 1H12m-7.5 3h7.5m-7.5 3c.51 0 1-.45 1-1s-.5-1-1-1H12"></path></svg>}
          />
          <SummaryCard
            title="Successful Donations"
            value={successfulDonations}
            bgColor="bg-gradient-to-br from-lime-500 to-lime-700"
            icon={<svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
          />
          <SummaryCard
            title="Avg. Donation"
            value={`$${averageDonation.toFixed(2)}`}
            bgColor="bg-gradient-to-br from-cyan-500 to-cyan-700"
            icon={<svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 flex flex-col mb-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-teal-300 mb-6 text-center">
            Donation Performance by Status
          </h2>
          <div className="chart-container" style={{ height: "400px", position: "relative" }}>
            <Bar
              data={donationStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                    labels: {
                      color: "#ddd",
                      font: {
                        size: 14,
                      },
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#teal-500',
                    borderWidth: 1,
                    cornerRadius: 5,
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#ddd", font: { size: 12 } },
                    title: {
                      display: true,
                      text: 'Donation Status',
                      color: '#ddd',
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    }
                  },
                  y: {
                    grid: { 
                      color: "#444",
                      // drawBorder: false 
                    },
                    ticks: { color: "#ddd", font: { size: 12 } },
                    title: {
                      display: true,
                      text: 'Total Amount ($)',
                      color: '#ddd',
                      font: {
                        size: 14,
                        weight: 'bold'
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Donations List */}
        <section>
          {paginatedDonations.length === 0 && !loading && !error ? (
            <div className="text-center py-16 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <p className="text-xl text-gray-400 font-medium">
                No donations match your search or are available. Try adjusting your filters!
              </p>
              <button
                onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-full shadow-lg hover:bg-teal-600 transition-all font-semibold"
              >
                Show All Donations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <AnimatePresence>
                {paginatedDonations.map((donation) => (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <DonationCard
                      donation={donation}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-12">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-5 py-2 bg-gray-700 rounded-full text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-all duration-200 flex items-center gap-1"
              aria-label="Previous page"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Previous
            </button>
            <span className="px-5 py-2 bg-teal-600 text-white rounded-full font-bold shadow-md">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-5 py-2 bg-gray-700 rounded-full text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-600 transition-all duration-200 flex items-center gap-1"
              aria-label="Next page"
            >
              Next
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
          users={donorsData}
          projects={projectsData}
          campaigns={campaignsData}
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
  icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, bgColor, icon }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-between`}>
    <div>
      <h2 className="text-xl font-semibold mb-1 opacity-90">{title}</h2>
      <p className="text-4xl font-bold">{value}</p>
    </div>
    <div className="flex-shrink-0 opacity-70">
      {icon}
    </div>
  </div>
);

interface DonationCardProps {
  donation: Donation;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, onEdit, onDelete }) => {
  const statusColors = {
    'SUCCESS': 'bg-green-600 text-green-100',
    'PENDING': 'bg-yellow-600 text-yellow-100',
    'FAILED': 'bg-red-600 text-red-100',
    'REFUNDED': 'bg-blue-600 text-blue-100',
  };

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-xl hover:shadow-2xl border border-gray-700 hover:border-teal-500 transition-all duration-300 ease-in-out relative flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-3xl font-extrabold text-teal-400">
            ${donation.amount.toFixed(2)}{" "}
            <span className="text-xl font-semibold opacity-70">{donation.currency}</span>
          </h3>
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColors[donation.status] || 'bg-gray-600 text-gray-100'}`}>
            {donation.status.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-1 flex items-center">
          <svg className="h-4 w-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
          Donor: <span className="text-gray-300 font-medium ml-1">{donation.donor?.name || donation.donor?.email || 'Anonymous'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-1 flex items-center">
          <svg className="h-4 w-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
          Date: <span className="text-gray-300 ml-1">{new Date(donation.donationDate).toLocaleDateString()}</span>
        </p>
        {donation.project && (
          <p className="text-sm text-gray-400 mb-1 flex items-center">
            <svg className="h-4 w-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 12v3a1 1 0 001 1h12a1 1 0 001-1v-3a1 1 0 00-1-1H4a1 1 0 00-1 1zm.006-2.01l.994-.993A1 1 0 005 8h10a1 1 0 00.707-1.707l.994-.993A.996.996 0 0016 4H4a.996.996 0 00-.707.293l-.994.993A1 1 0 003 6v4.006z" clipRule="evenodd"></path></svg>
            Project: <span className="text-gray-300 ml-1">{donation.project.name}</span>
          </p>
        )}
        {donation.campaign && (
          <p className="text-sm text-gray-400 mb-4 flex items-center">
            <svg className="h-4 w-4 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5 9a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
            Campaign: <span className="text-gray-300 ml-1">{donation.campaign.name}</span>
          </p>
        )}
      </div>
      <div className="flex space-x-3 mt-4 justify-end">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transform hover:scale-105 transition-all duration-200"
          onClick={() => onEdit(donation.id)}
          aria-label={`Edit donation ${donation.id}`}
        >
          Edit
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
          onClick={() => onDelete(donation.id)}
          aria-label={`Delete donation ${donation.id}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Add Donation Form Component
// interface AddDonationFormProps {
//   onSubmit: (donation: Omit<Donation, 'id' | 'createdAt' | 'donor' | 'project' | 'campaign'>) => void;
//   onCancel: () => void;
//   isLoading: boolean;
//   users: UserOption[];
//   projects: ProjectOption[];
//   campaigns: CampaignOption[];
// }


