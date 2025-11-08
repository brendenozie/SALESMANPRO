// app/admin/[slug]/delivery/DeliveryClient.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import {
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon, // For a dynamic title icon
  PhoneIcon, // For driver contact
  BuildingStorefrontIcon, // For order source
  ChartBarIcon
} from "@heroicons/react/24/outline";
import toast from 'react-hot-toast'; // For engaging user feedback

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Define an explicit type for delivery statuses for easier management and consistency
type DeliveryStatus = CustomerOrder['deliveryStatus'];

interface ClientProps {
  deliveryOrdersData: CustomerOrder[];
  companyId: string;
  initialError: string | null;
}

const DeliveryClient: React.FC<ClientProps> = ({ deliveryOrdersData: initialDeliveryOrdersData, companyId, initialError }) => {
  const [deliveryOrdersData, setDeliveryOrdersData] = useState<CustomerOrder[]>(initialDeliveryOrdersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeDeliveryStatusFilter, setActiveDeliveryStatusFilter] = useState<string>("All"); // Filter by deliveryStatus
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDeliveryDetailsModalOpen, setIsDeliveryDetailsModalOpen] = useState<boolean>(false);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(initialError);

  const itemsPerPage = 8;

  // Effect to display initial error if any
  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  // Function to refresh data with robust error handling and feedback
  const refreshDeliveryOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/customer-orders?companyId=${companyId}&delivery=true`, { next: { revalidate: 60 } });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to fetch delivery orders: ${res.statusText}`);
      }
      setDeliveryOrdersData(await res.json());
      toast.success("Delivery orders refreshed successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to refresh delivery orders.");
      toast.error(err.message || "Failed to refresh delivery orders.");
      console.error("Error refreshing delivery orders:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

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
        order.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const deliveredOrders = deliveryOrdersData.filter(o => o.deliveryStatus === 'DELIVERED').length;

  // Pagination logic
  const totalPages = Math.ceil(filteredDeliveryOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedDeliveryOrders = filteredDeliveryOrders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for Delivery Status Distribution
  const allDeliveryStatuses: DeliveryStatus[] = [
    'PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'ATTEMPTED_DELIVERY', 'RETURNED'
  ];
  const deliveryStatusCounts = deliveryOrdersData.reduce((acc, order) => {
    const status = order.deliveryStatus || 'UNKNOWN'; // Handle null/undefined status
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartLabels = allDeliveryStatuses.map(status =>
    status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  );
  const chartDataValues = allDeliveryStatuses.map(status => deliveryStatusCounts[status] || 0);

  const deliveryStatusChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Number of Deliveries",
        data: chartDataValues,
        backgroundColor: [
          '#FFC107', // PENDING (Amber)
          '#29B6F6', // PROCESSING (Light Blue)
          '#03A9F4', // SHIPPED (Blue)
          '#7E57C2', // OUT_FOR_DELIVERY (Deep Purple)
          '#4CAF50', // DELIVERED (Green)
          '#EF5350', // CANCELLED (Red)
          '#FF8F00', // ATTEMPTED_DELIVERY (Dark Orange)
          '#B0BEC5', // RETURNED (Blue Grey)
          '#607D8B', // UNKNOWN
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

  const handleUpdateDeliveryStatus = async (orderId: string, newDeliveryStatus: DeliveryStatus, deliveryPersonName?: string | null, deliveryPersonContact?: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/admin/customer-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryStatus: newDeliveryStatus,
          deliveryPersonName: deliveryPersonName,
          deliveryPersonContact: deliveryPersonContact,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update delivery status.');
      }

      await refreshDeliveryOrders();
      // Update selected order if it's currently open in modal
      if (selectedDeliveryOrder && selectedDeliveryOrder.id === orderId) {
        setSelectedDeliveryOrder((prev:any) => prev ? {
          ...prev,
          deliveryStatus: newDeliveryStatus,
          deliveryPersonName: deliveryPersonName,
          deliveryPersonContact: deliveryPersonContact,
        } : null);
      }
      toast.success(`Delivery #${orderId.slice(-6).toUpperCase()} status updated to ${newDeliveryStatus?.replace(/_/g, ' ')}`);
    } catch (err: any) {
      setError(err.message || "Failed to update delivery status.");
      toast.error(err.message || "Failed to update delivery status.");
      console.error("Error updating delivery status:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-sky-400 mb-8 sm:mb-10 drop-shadow-lg flex items-center justify-center gap-3">
          <RocketLaunchIcon className="h-10 w-10 text-sky-300 animate-bounce" />
          Seamless Deliveries Hub
        </h1>

        {/* Action Bar: Search & Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, address, driver, or order ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-sky-500 focus:outline-none shadow-lg transition-all duration-300"
              aria-label="Search deliveries"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
          <button
            onClick={refreshDeliveryOrders}
            className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh Deliveries"}
          </button>
        </div>

        {error && (
          <div className="bg-red-800 border border-red-600 text-red-100 px-6 py-4 rounded-lg flex items-center gap-3 mb-8 shadow-md" role="alert">
            <XCircleIcon className="h-6 w-6" />
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Deliveries"
            value={totalDeliveryOrders}
            icon={TruckIcon}
            bgColor="bg-gradient-to-br from-sky-600 to-cyan-700"
          />
          <SummaryCard
            title="Pending Deliveries"
            value={pendingDeliveries}
            icon={ClockIcon}
            bgColor="bg-gradient-to-br from-amber-600 to-orange-700"
          />
          <SummaryCard
            title="Out for Delivery"
            value={outForDelivery}
            icon={MapPinIcon}
            bgColor="bg-gradient-to-br from-purple-600 to-indigo-700"
          />
          <SummaryCard
            title="Delivered Orders"
            value={deliveredOrders}
            icon={CheckCircleIcon}
            bgColor="bg-gradient-to-br from-green-600 to-emerald-700"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col mb-10 border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-6 w-6 text-sky-400" /> Delivery Status Breakdown
          </h2>
          <div className="chart-container h-72 sm:h-96">
            <Bar
              data={deliveryStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" as const, labels: { color: "#ddd", font: { size: 14 } } },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                        }
                        return label;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: "#ddd", font: { size: 12 } },
                    title: {
                      display: true,
                      text: 'Delivery Status',
                      color: '#bbb',
                      font: { size: 14, weight: 'bold' }
                    }
                  },
                  y: {
                    grid: { color: "#444" },
                    ticks: { color: "#ddd", font: { size: 12 } },
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Deliveries',
                      color: '#bbb',
                      font: { size: 14, weight: 'bold' }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap justify-center gap-3 p-4 bg-gray-800 rounded-full shadow-inner mb-10 border border-gray-700">
          {['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ATTEMPTED_DELIVERY', 'RETURNED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => { setActiveDeliveryStatusFilter(status); setCurrentPage(1); }}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300 ease-in-out
                ${activeDeliveryStatusFilter === status
                  ? "bg-sky-500 text-white shadow-lg transform scale-105"
                  : "bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
              {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Delivery Orders List */}
        <section>
          {paginatedDeliveryOrders.length === 0 && !loading && !error ? (
            <div className="text-center py-16 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <p className="text-2xl font-semibold text-gray-400 mb-4">
                No delivery orders found for your criteria.
              </p>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedDeliveryOrders.map((order) => (
                <DeliveryOrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDeliveryDetails}
                  onUpdateStatus={handleUpdateDeliveryStatus}
                  isLoading={loading} // Pass loading state to disable buttons during update
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-10">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="px-5 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-5 w-5" /> Previous
            </button>
            <span className="px-4 py-2 bg-gray-800 text-sky-400 font-semibold rounded-lg shadow-md">
              {`Page ${currentPage} of ${totalPages}`}
            </span>
            <button
              disabled={currentPage === totalPages || loading}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="px-5 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50 hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
              aria-label="Next page"
            >
              Next <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Delivery Details Modal */}
      <Modal
        isOpen={isDeliveryDetailsModalOpen}
        onClose={() => setIsDeliveryDetailsModalOpen(false)}
        title="Delivery Details"
      >
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
  icon: React.ElementType; // Icon component from Heroicons
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, bgColor }) => (
  <div className={`${bgColor} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-between`}>
    <div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className="text-4xl font-bold">{value}</p>
    </div>
    <Icon className="h-10 w-10 opacity-75" />
  </div>
);

interface DeliveryOrderCardProps {
  order: CustomerOrder;
  onViewDetails: (order: CustomerOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: DeliveryStatus, deliveryPersonName?: string | null, deliveryPersonContact?: string | null) => void;
  isLoading: boolean;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ order, onViewDetails, onUpdateStatus, isLoading }) => {
  const getDeliveryStatusColorClass = (status: DeliveryStatus | null) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-yellow-900';
      case 'PROCESSING': return 'bg-blue-500 text-blue-900';
      case 'SHIPPED': return 'bg-indigo-500 text-indigo-900';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-500 text-purple-900';
      case 'DELIVERED': return 'bg-green-500 text-green-900';
      case 'CANCELLED': return 'bg-red-500 text-red-900';
      case 'ATTEMPTED_DELIVERY': return 'bg-orange-500 text-orange-900';
      case 'RETURNED': return 'bg-gray-500 text-gray-900';
      default: return 'bg-gray-400 text-gray-800';
    }
  };

  const getDeliveryStatusIcon = (status: DeliveryStatus | null) => {
    switch (status) {
      case 'PENDING': return <ClockIcon className="h-5 w-5 inline-block mr-1" />;
      case 'PROCESSING': return <BuildingStorefrontIcon className="h-5 w-5 inline-block mr-1" />;
      case 'SHIPPED': return <TruckIcon className="h-5 w-5 inline-block mr-1" />;
      case 'OUT_FOR_DELIVERY': return <MapPinIcon className="h-5 w-5 inline-block mr-1" />;
      case 'DELIVERED': return <CheckCircleIcon className="h-5 w-5 inline-block mr-1" />;
      case 'CANCELLED': return <XCircleIcon className="h-5 w-5 inline-block mr-1" />;
      case 'ATTEMPTED_DELIVERY': return <TruckIcon className="h-5 w-5 inline-block mr-1" />;
      case 'RETURNED': return <ArrowPathIcon className="h-5 w-5 inline-block mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-700 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-sky-400">Delivery #{order.id.slice(-6).toUpperCase()}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDeliveryStatusColorClass(order.deliveryStatus)}`}>
            {getDeliveryStatusIcon(order.deliveryStatus)}
            {order.deliveryStatus?.replace(/_/g, ' ') || 'N/A'}
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-2">
          Customer: <span className="text-gray-300 font-medium">{order.name || order.email || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-2">
          <MapPinIcon className="h-4 w-4 inline-block text-gray-500 mr-1" /> Address: <span className="text-gray-300">{order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}` : 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-2">
          <ClockIcon className="h-4 w-4 inline-block text-gray-500 mr-1" /> Est. Arrival: <span className="text-gray-300">{order.estimatedArrival ? new Date(order.estimatedArrival).toLocaleString() : 'N/A'}</span>
        </p>
        {order.deliveryPersonName && (
          <p className="text-sm text-gray-400 mb-4">
            <TruckIcon className="h-4 w-4 inline-block text-gray-500 mr-1" /> Driver: <span className="text-gray-300">{order.deliveryPersonName} {order.deliveryPersonContact && `(${order.deliveryPersonContact})`}</span>
          </p>
        )}
        <div className="mb-4">
          <p className="font-semibold text-gray-300 mb-2">Items:</p>
          <ul className="text-sm text-gray-400 space-y-1">
            {order.items.slice(0, 2).map(item => (
              <li key={item.id} className="flex justify-between items-center">
                <span>{item.quantity}x {item.marketplaceListing.name}</span>
                <span className="font-medium text-gray-300">${item.price.toFixed(2)}</span>
              </li>
            ))}
            {order.items.length > 2 && (
              <li className="text-gray-500 italic">...and {order.items.length - 2} more items</li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pt-4 border-t border-gray-700">
        <button
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          onClick={() => onViewDetails(order)}
          aria-label={`View details for delivery ${order.id.slice(-6).toUpperCase()}`}
        >
          <EyeIcon className="h-5 w-5" /> View Details
        </button>
        {order.deliveryStatus !== 'DELIVERED' && order.deliveryStatus !== 'CANCELLED' && (
          <button
            className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={() => onUpdateStatus(order.id, 'DELIVERED')}
            disabled={isLoading}
            aria-label={`Mark delivery ${order.id.slice(-6).toUpperCase()} as delivered`}
          >
            <CheckCircleIcon className="h-5 w-5" /> Mark Delivered
          </button>
        )}
      </div>
    </div>
  );
};

interface DeliveryDetailsProps {
  order: CustomerOrder;
  onUpdateStatus: (orderId: string, newStatus: DeliveryStatus, deliveryPersonName?: string | null, deliveryPersonContact?: string | null) => void;
  isLoading: boolean;
}

const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({ order, onUpdateStatus, isLoading }) => {
  const [currentDeliveryStatus, setCurrentDeliveryStatus] = useState<DeliveryStatus>(order.deliveryStatus || 'PENDING');
  const [deliveryPerson, setDeliveryPerson] = useState(order.deliveryPersonName || '');
  const [deliveryContact, setDeliveryContact] = useState(order.deliveryPersonContact || '');

  const getDeliveryStatusColorClass = (status: DeliveryStatus | null) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-yellow-900';
      case 'PROCESSING': return 'bg-blue-500 text-blue-900';
      case 'SHIPPED': return 'bg-indigo-500 text-indigo-900';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-500 text-purple-900';
      case 'DELIVERED': return 'bg-green-500 text-green-900';
      case 'CANCELLED': return 'bg-red-500 text-red-900';
      case 'ATTEMPTED_DELIVERY': return 'bg-orange-500 text-orange-900';
      case 'RETURNED': return 'bg-gray-500 text-gray-900';
      default: return 'bg-gray-400 text-gray-800';
    }
  };

  const handleUpdate = async () => {
    await onUpdateStatus(order.id, currentDeliveryStatus, deliveryPerson, deliveryContact);
  };

  const allDeliveryStatuses: DeliveryStatus[] = [
    'PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'ATTEMPTED_DELIVERY', 'RETURNED', 'CANCELLED'
  ];

  return (
    <div className="space-y-6 text-gray-100 p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-700">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-sky-400">Delivery #{order.id.slice(-8).toUpperCase()}</h3>
        <span className={`px-4 py-2 text-sm font-bold rounded-full mt-2 sm:mt-0 ${getDeliveryStatusColorClass(order.deliveryStatus)} shadow-md`}>
          {order.deliveryStatus?.replace(/_/g, ' ') || 'N/A'}
        </span>
      </div>

      <div className="bg-gray-800 p-5 rounded-lg shadow-inner border border-gray-700">
        <p className="text-lg font-bold text-gray-200 mb-3">Customer Information:</p>
        <ul className="space-y-2 text-gray-300">
          <li><strong>Name:</strong> <span className="text-gray-100">{order.name || 'N/A'}</span></li>
          <li><strong>Email:</strong> <span className="text-gray-100">{order.email || 'N/A'}</span></li>
          <li><strong>Phone:</strong> <span className="text-gray-100">{order.phone || 'N/A'}</span></li>
        </ul>
      </div>

      <div className="bg-gray-800 p-5 rounded-lg shadow-inner border border-gray-700">
        <p className="text-lg font-bold text-gray-200 mb-3">Delivery Details:</p>
        <ul className="space-y-2 text-gray-300">
          <li><strong>Address:</strong> <span className="text-gray-100">{order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.zip}${order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ''}` : 'N/A'}</span></li>
          <li><strong>Method:</strong> <span className="text-gray-100">{order.shippingMethod || 'N/A'}</span></li>
          <li><strong>Tracking:</strong> <span className="text-gray-100">{order.trackingNumber || 'N/A'}</span></li>
          <li><strong>Estimated Arrival:</strong> <span className="text-gray-100">{order.estimatedArrival ? new Date(order.estimatedArrival).toLocaleString() : 'N/A'}</span></li>
        </ul>
      </div>

      <div className="bg-gray-800 p-5 rounded-lg shadow-inner border border-gray-700">
        <p className="text-lg font-bold text-gray-200 mb-3">Assigned Driver:</p>
        <ul className="space-y-2 text-gray-300">
          <li><strong>Name:</strong> <span className="text-gray-100">{order.deliveryPersonName || 'N/A'}</span></li>
          <li><strong>Contact:</strong> <span className="text-gray-100">{order.deliveryPersonContact || 'N/A'}</span></li>
        </ul>
      </div>

      <div className="pt-4 border-t border-gray-700 space-y-4">
        <div>
          <label htmlFor="deliveryStatus" className="block text-base font-semibold text-gray-300 mb-2">Update Delivery Status:</label>
          <div className="relative">
            <select
              id="deliveryStatus"
              value={currentDeliveryStatus}
              onChange={(e) => setCurrentDeliveryStatus(e.target.value as DeliveryStatus)}
              className="block w-full p-3 pr-10 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 appearance-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 cursor-pointer"
              disabled={isLoading}
            >
              {allDeliveryStatuses.map(status => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <ChevronRightIcon className="h-5 w-5 rotate-90" />
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="deliveryPerson" className="block text-base font-semibold text-gray-300">Delivery Person Name:</label>
          <input
            type="text"
            id="deliveryPerson"
            value={deliveryPerson}
            onChange={(e) => setDeliveryPerson(e.target.value)}
            placeholder="e.g., John Doe"
            className="mt-1 block w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="deliveryContact" className="block text-base font-semibold text-gray-300">Delivery Person Contact:</label>
          <input
            type="text"
            id="deliveryContact"
            value={deliveryContact}
            onChange={(e) => setDeliveryContact(e.target.value)}
            placeholder="e.g., +254712345678"
            className="mt-1 block w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={handleUpdate}
            className="px-6 py-3 bg-sky-600 text-white rounded-lg shadow-lg hover:bg-sky-700 transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" /> Updating...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5" /> Update Delivery
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};