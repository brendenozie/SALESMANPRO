// app/admin/[slug]/orders/OrdersClient.tsx
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
import { CustomerOrder, OrderItem } from "./page";
import Modal from "@/components/Modal"; // Adjust path as needed
import {
  CurrencyDollarIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  SparklesIcon // For a touch of visual flair
} from "@heroicons/react/24/outline";
import toast from 'react-hot-toast'; // For engaging user feedback
import { Bars3Icon } from "@heroicons/react/20/solid";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ClientProps {
  ordersData: CustomerOrder[];
  companyId: string;
  initialError: string | null;
}

const OrdersClient: React.FC<ClientProps> = ({ ordersData: initialOrdersData, companyId, initialError }) => {
  const [ordersData, setOrdersData] = useState<CustomerOrder[]>(initialOrdersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
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
  const refreshOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/customer-orders?companyId=${companyId}`, { next: { revalidate: 60 } });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to fetch orders: ${res.statusText}`);
      }
      setOrdersData(await res.json());
      toast.success("Orders refreshed successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to refresh orders.");
      toast.error(err.message || "Failed to refresh orders.");
      console.error("Error refreshing orders:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Filter orders by search term and status
  const filteredOrders = useMemo(() => {
    let filtered = ordersData;

    if (activeStatusFilter !== "All") {
      filtered = filtered.filter(order => order.status === activeStatusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.marketplaceListing.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filtered;
  }, [ordersData, activeStatusFilter, searchTerm]);

  // Summaries
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter(o => o.status === 'PENDING').length;
  const completedOrders = ordersData.filter(o => o.status === 'COMPLETED').length;
  const totalRevenue = useMemo(
    () => ordersData.reduce((sum, order) => sum + order.totalPrice, 0),
    [ordersData]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = filteredOrders.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Chart data for Order Status Distribution
  const statusCounts = ordersData.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<CustomerOrder['status'], number>);

  const orderStatusChartData = {
    labels: Object.keys(statusCounts).map(status => status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())),
    datasets: [
      {
        label: "Number of Orders",
        data: Object.values(statusCounts),
        backgroundColor: [
          '#FFC107', // PENDING (Amber)
          '#4CAF50', // COMPLETED (Green)
          '#EF5350', // CANCELLED (Red)
          '#29B6F6', // SHIPPED (Light Blue)
          '#7E57C2', // OUT_FOR_DELIVERY (Deep Purple)
          '#B0BEC5', // RECURRING (Blue Grey)
        ],
        borderColor: '#333',
        borderWidth: 1,
      },
    ],
  };

  const handleViewOrder = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: CustomerOrder['status']) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/customer-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }

      await refreshOrders();
      // Update selected order if it's currently open in modal
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      toast.success(`Order #${orderId.slice(-6).toUpperCase()} status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err: any) {
      setError(err.message || "Failed to update order status.");
      toast.error(err.message || "Failed to update order status.");
      console.error("Error updating order status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-emerald-400 mb-8 sm:mb-10 drop-shadow-lg flex items-center justify-center gap-3">
          <SparklesIcon className="h-10 w-10 text-emerald-300 animate-pulse" />
          Dynamic Order Dashboard
        </h1>

        {/* Action Bar: Search & Refresh */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, email, phone, or dish..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-14 pr-4 py-3 rounded-xl bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-lg transition-all duration-300"
              aria-label="Search orders"
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
            onClick={refreshOrders}
            className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Refreshing..." : "Refresh Orders"}
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
            title="Total Orders"
            value={totalOrders}
            icon={ClockIcon}
            bgColor="bg-gradient-to-br from-emerald-600 to-green-700"
          />
          <SummaryCard
            title="Pending Orders"
            value={pendingOrders}
            icon={ClockIcon}
            bgColor="bg-gradient-to-br from-amber-600 to-orange-700"
          />
          <SummaryCard
            title="Completed Orders"
            value={completedOrders}
            icon={CheckCircleIcon}
            bgColor="bg-gradient-to-br from-green-600 to-teal-700"
          />
          <SummaryCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon={CurrencyDollarIcon}
            bgColor="bg-gradient-to-br from-purple-600 to-indigo-700"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col mb-10 border border-gray-700">
          <h2 className="text-2xl font-bold text-gray-100 mb-4 flex items-center gap-2">
            <Bars3Icon className="h-6 w-6 text-emerald-400" /> Order Status Overview
          </h2>
          <div className="chart-container h-72 sm:h-96">
            <Bar
              data={orderStatusChartData}
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
                      text: 'Order Status',
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
                      text: 'Number of Orders',
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
          {['All', 'PENDING', 'COMPLETED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'CANCELLED', 'RECURRING'].map(status => (
            <button
              key={status}
              onClick={() => { setActiveStatusFilter(status); setCurrentPage(1); }}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300 ease-in-out
                ${activeStatusFilter === status
                  ? "bg-emerald-500 text-white shadow-lg transform scale-105"
                  : "bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
            >
              {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <section>
          {paginatedOrders.length === 0 && !loading && !error ? (
            <div className="text-center py-16 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
              <p className="text-2xl font-semibold text-gray-400 mb-4">
                No orders found for your criteria.
              </p>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewOrder}
                  onUpdateStatus={handleUpdateOrderStatus}
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
            <span className="px-4 py-2 bg-gray-800 text-emerald-400 font-semibold rounded-lg shadow-md">
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

      {/* Order Details Modal */}
      <Modal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => setIsOrderDetailsModalOpen(false)}
        title="Order Details"
      >
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            isLoading={loading}
          />
        )}
      </Modal>
    </main>
  );
};

export default OrdersClient;

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

interface OrderCardProps {
  order: CustomerOrder;
  onViewDetails: (order: CustomerOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: CustomerOrder['status']) => void;
  isLoading: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails, onUpdateStatus, isLoading }) => {
  const getStatusColorClass = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-yellow-900';
      case 'COMPLETED': return 'bg-green-500 text-green-900';
      case 'CANCELLED': return 'bg-red-500 text-red-900';
      case 'SHIPPED': return 'bg-blue-500 text-blue-900';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-500 text-purple-900';
      case 'RECURRING': return 'bg-gray-500 text-gray-900';
      default: return 'bg-gray-400 text-gray-800';
    }
  };

  const getStatusIcon = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'PENDING': return <ClockIcon className="h-5 w-5 inline-block mr-1" />;
      case 'COMPLETED': return <CheckCircleIcon className="h-5 w-5 inline-block mr-1" />;
      case 'CANCELLED': return <XCircleIcon className="h-5 w-5 inline-block mr-1" />;
      case 'SHIPPED': return <TruckIcon className="h-5 w-5 inline-block mr-1" />;
      case 'OUT_FOR_DELIVERY': return <TruckIcon className="h-5 w-5 inline-block mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-700 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-emerald-400">Order #{order.id.slice(-6).toUpperCase()}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColorClass(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        <p className="text-sm text-gray-400 mb-2">
          Customer: <span className="text-gray-300 font-medium">{order.name || order.email || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-2">
          Total: <span className="text-green-400 font-bold text-lg">${order.totalPrice.toFixed(2)}</span>
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Placed: <span className="text-gray-300">{new Date(order.createdAt).toLocaleString()}</span>
        </p>

        <div className="mb-4">
          <p className="font-semibold text-gray-300 mb-2">Items:</p>
          <ul className="text-sm text-gray-400 space-y-1">
            {order.items.slice(0, 3).map(item => (
              <li key={item.id} className="flex justify-between items-center">
                <span>{item.quantity}x {item.marketplaceListing.name}</span>
                <span className="font-medium text-gray-300">${item.price.toFixed(2)}</span>
              </li>
            ))}
            {order.items.length > 3 && (
              <li className="text-gray-500 italic">...and {order.items.length - 3} more items</li>
            )}
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4 pt-4 border-t border-gray-700">
        <button
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          onClick={() => onViewDetails(order)}
          aria-label={`View details for order ${order.id.slice(-6).toUpperCase()}`}
        >
          <EyeIcon className="h-5 w-5" /> View Details
        </button>
        {order.status === 'PENDING' && (
          <button
            className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            disabled={isLoading}
            aria-label={`Mark order ${order.id.slice(-6).toUpperCase()} as completed`}
          >
            <CheckCircleIcon className="h-5 w-5" /> Mark Completed
          </button>
        )}
      </div>
    </div>
  );
};

interface OrderDetailsProps {
  order: CustomerOrder;
  onUpdateStatus: (orderId: string, newStatus: CustomerOrder['status']) => void;
  isLoading: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onUpdateStatus, isLoading }) => {
  const getStatusColorClass = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 text-yellow-900';
      case 'COMPLETED': return 'bg-green-500 text-green-900';
      case 'CANCELLED': return 'bg-red-500 text-red-900';
      case 'SHIPPED': return 'bg-blue-500 text-blue-900';
      case 'OUT_FOR_DELIVERY': return 'bg-purple-500 text-purple-900';
      case 'RECURRING': return 'bg-gray-500 text-gray-900';
      default: return 'bg-gray-400 text-gray-800';
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CustomerOrder['status'];
    await onUpdateStatus(order.id, newStatus);
  };

  return (
    <div className="space-y-6 text-gray-100 p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-700">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Order #{order.id.slice(-8).toUpperCase()}</h3>
        <span className={`px-4 py-2 text-sm font-bold rounded-full mt-2 sm:mt-0 ${getStatusColorClass(order.status)} shadow-md`}>
          {order.status.replace(/_/g, ' ')}
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
        <p className="text-lg font-bold text-gray-200 mb-3">Order Items:</p>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center space-x-4 bg-gray-700 p-4 rounded-md shadow-sm">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-600">
                <img
                  src={item.marketplaceListing.images && item.marketplaceListing.images.length > 0 ? item.marketplaceListing.images[0].url : "https://placehold.co/80x80/333/eee?text=Dish"}
                  alt={item.marketplaceListing.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-xl text-white">{item.marketplaceListing.name}</p>
                <p className="text-base text-gray-400">{item.quantity} x ${item.price.toFixed(2)}</p>
              </div>
              <p className="font-bold text-xl text-green-400">${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <p className="text-right text-2xl font-extrabold text-white mt-6 pt-4 border-t border-gray-600">
          Total: <span className="text-emerald-400">${order.totalPrice.toFixed(2)}</span>
        </p>
      </div>

      {order.delivery && (
        <div className="bg-gray-800 p-5 rounded-lg shadow-inner border border-gray-700">
          <p className="text-lg font-bold text-gray-200 mb-3">Delivery Information:</p>
          <ul className="space-y-2 text-gray-300">
            <li><strong>Delivery Status:</strong> <span className="text-gray-100">{order.deliveryStatus || 'N/A'}</span></li>
            <li><strong>Estimated Arrival:</strong> <span className="text-gray-100">{order.estimatedArrival ? new Date(order.estimatedArrival).toLocaleString() : 'N/A'}</span></li>
            <li><strong>Address:</strong> <span className="text-gray-100">{order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.zip}, ${order.shippingAddress.country || ''}` : 'N/A'}</span></li>
            <li><strong>Delivery Person:</strong> <span className="text-gray-100">{order.deliveryPersonName || 'N/A'}</span></li>
            {order.deliveryPersonContact && <li><strong>Contact:</strong> <span className="text-gray-100">{order.deliveryPersonContact}</span></li>}
          </ul>
        </div>
      )}

      <div className="pt-4 border-t border-gray-700">
        <label htmlFor="updateStatus" className="block text-base font-semibold text-gray-300 mb-2">Update Order Status:</label>
        <div className="relative">
          <select
            id="updateStatus"
            value={order.status}
            onChange={handleStatusChange}
            className="block w-full p-3 pr-10 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 cursor-pointer"
            disabled={isLoading}
          >
            {['PENDING', 'COMPLETED', 'CANCELLED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'RECURRING'].map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <ChevronRightIcon className="h-5 w-5 rotate-90" />
          </div>
        </div>
        {isLoading && <p className="text-sm text-blue-400 mt-2">Updating status...</p>}
      </div>
    </div>
  );
};