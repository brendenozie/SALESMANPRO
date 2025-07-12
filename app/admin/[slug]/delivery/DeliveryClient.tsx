// app/admin/[slug]/delivery/DeliveryClient.tsx
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
import { CustomerOrder, OrderItem } from "./page"; // Re-use types
import Modal from "@/components/Modal"; // Adjust path as needed
import { TruckIcon, ClockIcon, MapPinIcon } from "@heroicons/react/24/outline"; // Icons for summary cards

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ClientProps {
  deliveryOrdersData: CustomerOrder[];
  companyId: string;
}

const DeliveryClient: React.FC<ClientProps> = ({ deliveryOrdersData: initialDeliveryOrdersData, companyId }) => {
  const [deliveryOrdersData, setDeliveryOrdersData] = useState<CustomerOrder[]>(initialDeliveryOrdersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeDeliveryStatusFilter, setActiveDeliveryStatusFilter] = useState<string>("All"); // Filter by deliveryStatus
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDeliveryDetailsModalOpen, setIsDeliveryDetailsModalOpen] = useState<boolean>(false);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 8;

  // Function to refresh data
  const refreshDeliveryOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/customer-orders?companyId=${companyId}&delivery=true`, { cache: "no-store" });
      if (res.ok) {
        setDeliveryOrdersData(await res.json());
      } else {
        throw new Error(`Failed to fetch delivery orders: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh delivery orders.");
      console.error("Error refreshing delivery orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter delivery orders by search term and delivery status
  const filteredDeliveryOrders = useMemo(() => {
    let filtered = deliveryOrdersData;

    if (activeDeliveryStatusFilter !== "All") {
      filtered = filtered.filter(order => order.deliveryStatus === activeDeliveryStatusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryPersonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [deliveryOrdersData, activeDeliveryStatusFilter, searchTerm]);

  // Summaries
  const totalDeliveryOrders = deliveryOrdersData.length;
  const pendingDeliveries = deliveryOrdersData.filter(o => o.deliveryStatus === 'PENDING').length;
  const outForDelivery = deliveryOrdersData.filter(o => o.deliveryStatus === 'OUT_FOR_DELIVERY').length;
  const deliveredOrders = deliveryOrdersData.filter(o => o.deliveryStatus === 'DELIVERED').length; // Assuming 'DELIVERED' status

  // Pagination logic
  const totalPages = Math.ceil(filteredDeliveryOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDeliveryOrders = filteredDeliveryOrders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for Delivery Status Distribution
  const deliveryStatusCounts = deliveryOrdersData.reduce((acc, order) => {
    acc[order.deliveryStatus || 'UNKNOWN'] = (acc[order.deliveryStatus || 'UNKNOWN'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deliveryStatusChartData = {
    labels: Object.keys(deliveryStatusCounts),
    datasets: [
      {
        label: "Number of Deliveries",
        data: Object.values(deliveryStatusCounts),
        backgroundColor: [
          '#FFC107', // PENDING (Amber)
          '#7E57C2', // OUT_FOR_DELIVERY (Deep Purple)
          '#4CAF50', // DELIVERED (Green)
          '#EF5350', // CANCELLED (Red)
          '#B0BEC5', // UNKNOWN (Blue Grey)
        ],
        borderColor: '#333',
        borderWidth: 1,
      },
    ],
  };

  const handleViewDeliveryDetails = (order: CustomerOrder) => {
    setSelectedDeliveryOrder(order);
    setIsDeliveryDetailsModalOpen(true);
  };

  const handleUpdateDeliveryStatus = async (orderId: string, newDeliveryStatus: string, deliveryPersonName?: string, deliveryPersonContact?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/customer-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryStatus: newDeliveryStatus,
          deliveryPersonName: deliveryPersonName || null,
          deliveryPersonContact: deliveryPersonContact || null,
        }),
      });

      if (res.ok) {
        await refreshDeliveryOrders();
        // Update selected order if it's currently open in modal
        if (selectedDeliveryOrder && selectedDeliveryOrder.id === orderId) {
          setSelectedDeliveryOrder(prev => prev ? {
            ...prev,
            deliveryStatus: newDeliveryStatus,
            deliveryPersonName: deliveryPersonName || null,
            deliveryPersonContact: deliveryPersonContact || null,
          } : null);
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update delivery status.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to update delivery status.");
      console.error("Error updating delivery status:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-sky-400 mb-10 drop-shadow-lg">
          Delivery Management
        </h1>

        {/* Action Bar: Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search deliveries by customer, address, or driver..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-md"
            aria-label="Search deliveries"
          />
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
        </div>

        {loading && <p className="text-center text-blue-400 mb-4">Loading deliveries...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Deliveries"
            value={totalDeliveryOrders}
            bgColor="bg-sky-600"
          />
          <SummaryCard
            title="Pending Deliveries"
            value={pendingDeliveries}
            bgColor="bg-amber-600"
          />
          <SummaryCard
            title="Out for Delivery"
            value={outForDelivery}
            bgColor="bg-purple-600"
          />
          <SummaryCard
            title="Delivered Orders"
            value={deliveredOrders}
            bgColor="bg-green-600"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Delivery Status Distribution
          </h2>
          <div className="chart-container" style={{ height: "300px" }}>
            <Bar
              data={deliveryStatusChartData}
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

        {/* Status Filters */}
        <div className="flex flex-wrap justify-center gap-3 p-2 bg-gray-800 rounded-full shadow-inner mb-8">
          {['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => { setActiveDeliveryStatusFilter(status); setCurrentPage(1); }}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
                ${activeDeliveryStatusFilter === status
                  ? "bg-sky-500 text-white shadow-md"
                  : "bg-transparent text-gray-300 hover:bg-gray-700"
                }`}
            >
              {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Delivery Orders List */}
        <section>
          {paginatedDeliveryOrders.length === 0 && !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No delivery orders match your criteria or are available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDeliveryOrders.map((order) => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDeliveryDetails}
                  onUpdateStatus={handleUpdateDeliveryStatus}
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

      {/* Delivery Details Modal */}
      <Modal isOpen={isDeliveryDetailsModalOpen} onClose={() => setIsDeliveryDetailsModalOpen(false)} title="Delivery Details">
        {selectedDeliveryOrder && (
          <DeliveryDetails
            order={selectedDeliveryOrder}
            onUpdateStatus={handleUpdateDeliveryStatus}
            isLoading={loading}
          />
        )}
      </Modal>
    </main>
  );
};

export default DeliveryClient;

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

interface DeliveryOrderCardProps {
  order: CustomerOrder;
  onViewDetails: (order: CustomerOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: string, deliveryPersonName?: string, deliveryPersonContact?: string) => void;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ order, onViewDetails, onUpdateStatus }) => {
  const getDeliveryStatusColor = (status: string | null) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400';
      case 'PROCESSING': return 'text-blue-400';
      case 'OUT_FOR_DELIVERY': return 'text-purple-400';
      case 'DELIVERED': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-sky-400 mb-2">Delivery #{order.id.slice(-6).toUpperCase()}</h3>
        <p className="text-sm text-gray-400 mb-1">
          Customer: <span className="text-gray-300">{order.name || order.email || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-1">
          Address: <span className="text-gray-300">{order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-1">
          Status: <span className={`font-medium ${getDeliveryStatusColor(order.deliveryStatus)}`}>{order.deliveryStatus?.replace(/_/g, ' ') || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Est. Arrival: <span className="text-gray-300">{order.estimatedArrival ? new Date(order.estimatedArrival).toLocaleString() : 'N/A'}</span>
        </p>
        {order.deliveryPersonName && (
          <p className="text-sm text-gray-400 mb-4">
            Driver: <span className="text-gray-300">{order.deliveryPersonName} ({order.deliveryPersonContact})</span>
          </p>
        )}
      </div>
      <div className="flex space-x-2 self-end mt-4">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          onClick={() => onViewDetails(order)}
        >
          View Details
        </button>
        {order.deliveryStatus !== 'DELIVERED' && order.deliveryStatus !== 'CANCELLED' && (
          <button
            className="px-3 py-1 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
          >
            Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
};

interface DeliveryDetailsProps {
  order: CustomerOrder;
  onUpdateStatus: (orderId: string, newStatus: string, deliveryPersonName?: string, deliveryPersonContact?: string) => void;
  isLoading: boolean;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ order, onUpdateStatus, isLoading }) => {
  const [currentDeliveryStatus, setCurrentDeliveryStatus] = useState(order.deliveryStatus || 'PENDING');
  const [deliveryPerson, setDeliveryPerson] = useState(order.deliveryPersonName || '');
  const [deliveryContact, setDeliveryContact] = useState(order.deliveryPersonContact || '');

  const getDeliveryStatusColor = (status: string | null) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400';
      case 'PROCESSING': return 'text-blue-400';
      case 'OUT_FOR_DELIVERY': return 'text-purple-400';
      case 'DELIVERED': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleUpdate = async () => {
    await onUpdateStatus(order.id, currentDeliveryStatus, deliveryPerson, deliveryContact);
  };

  return (
    <div className="space-y-6 text-gray-100">
      <div className="flex justify-between items-center pb-4 border-b border-gray-700">
        <h3 className="text-2xl font-bold">Delivery #{order.id.slice(-8).toUpperCase()}</h3>
        <span className={`text-lg font-semibold ${getDeliveryStatusColor(order.deliveryStatus)}`}>
          {order.deliveryStatus?.replace(/_/g, ' ') || 'N/A'}
        </span>
      </div>

      <div>
        <p className="text-lg font-semibold mb-2">Customer Information:</p>
        <ul className="space-y-1 text-gray-300">
          <li><strong>Name:</strong> {order.name || 'N/A'}</li>
          <li><strong>Email:</strong> {order.email || 'N/A'}</li>
          <li><strong>Phone:</strong> {order.phone || 'N/A'}</li>
        </ul>
      </div>

      <div>
        <p className="text-lg font-semibold mb-2">Delivery Details:</p>
        <ul className="space-y-1 text-gray-300">
          <li><strong>Address:</strong> {order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.zip}` : 'N/A'}</li>
          <li><strong>Method:</strong> {order.shippingMethod || 'N/A'}</li>
          <li><strong>Tracking:</strong> {order.trackingNumber || 'N/A'}</li>
          <li><strong>Estimated Arrival:</strong> {order.estimatedArrival ? new Date(order.estimatedArrival).toLocaleString() : 'N/A'}</li>
        </ul>
      </div>

      <div className="pt-4 border-t border-gray-700 space-y-4">
        <div>
          <label htmlFor="deliveryStatus" className="block text-sm font-medium text-gray-300 mb-2">Update Delivery Status:</label>
          <select
            id="deliveryStatus"
            value={currentDeliveryStatus}
            onChange={(e) => setCurrentDeliveryStatus(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-sky-500 focus:border-sky-500"
            disabled={isLoading}
          >
            {['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="deliveryPerson" className="block text-sm font-medium text-gray-300">Delivery Person Name:</label>
          <input
            type="text"
            id="deliveryPerson"
            value={deliveryPerson}
            onChange={(e) => setDeliveryPerson(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-sky-500 focus:border-sky-500"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="deliveryContact" className="block text-sm font-medium text-gray-300">Delivery Person Contact:</label>
          <input
            type="text"
            id="deliveryContact"
            value={deliveryContact}
            onChange={(e) => setDeliveryContact(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-sky-500 focus:border-sky-500"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleUpdate}
            className="px-6 py-3 bg-sky-500 text-white rounded-lg shadow-lg hover:bg-sky-600 transition-all font-semibold disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Delivery'}
          </button>
        </div>
      </div>
    </div>
  );
};
