// app/admin/[slug]/orders/OrdersClient.tsx
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
import { CustomerOrder, OrderItem } from "./page";
import Modal from "@/components/Modal"; // Adjust path as needed
import { CurrencyDollarIcon, TruckIcon, ClockIcon } from "@heroicons/react/24/outline"; // Icons for summary cards

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface ClientProps {
  ordersData: CustomerOrder[];
  companyId: string;
}

const OrdersClient: React.FC<ClientProps> = ({ ordersData: initialOrdersData, companyId }) => {
  const [ordersData, setOrdersData] = useState<CustomerOrder[]>(initialOrdersData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 8;

  // Function to refresh data
  const refreshOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/customer-orders?companyId=${companyId}`, { cache: "no-store" });
      if (res.ok) {
        setOrdersData(await res.json());
      } else {
        throw new Error(`Failed to fetch orders: ${res.statusText}`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to refresh orders.");
      console.error("Error refreshing orders:", err);
    } finally {
      setLoading(false);
    }
  };

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
    labels: Object.keys(statusCounts),
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
      const res = await fetch(`${apiUrl}/customer-orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await refreshOrders();
        // Update selected order if it's currently open in modal
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }
    } catch (err: any) {
      setError(err.message || "Failed to update order status.");
      console.error("Error updating order status:", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex-grow container mx-auto px-6 py-8 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center text-emerald-400 mb-10 drop-shadow-lg">
          Orders Management
        </h1>

        {/* Action Bar: Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Search orders by customer, email, or dish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-md p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-md"
            aria-label="Search orders"
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

        {loading && <p className="text-center text-blue-400 mb-4">Loading orders...</p>}
        {error && <p className="text-center text-red-500 mb-4">Error: {error}</p>}

        {/* Summary Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <SummaryCard
            title="Total Orders"
            value={totalOrders}
            bgColor="bg-emerald-600"
          />
          <SummaryCard
            title="Pending Orders"
            value={pendingOrders}
            bgColor="bg-amber-600"
          />
          <SummaryCard
            title="Completed Orders"
            value={completedOrders}
            bgColor="bg-green-600"
          />
          <SummaryCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            bgColor="bg-purple-600"
          />
        </div>

        {/* Chart Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col mb-10">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">
            Order Status Distribution
          </h2>
          <div className="chart-container" style={{ height: "300px" }}>
            <Bar
              data={orderStatusChartData}
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
          {['All', 'PENDING', 'COMPLETED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'CANCELLED', 'RECURRING'].map(status => (
            <button
              key={status}
              onClick={() => { setActiveStatusFilter(status); setCurrentPage(1); }}
              className={`px-5 py-2 text-sm md:text-base font-semibold rounded-full transition-all duration-300
                ${activeStatusFilter === status
                  ? "bg-emerald-500 text-white shadow-md"
                  : "bg-transparent text-gray-300 hover:bg-gray-700"
                }`}
            >
              {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <section>
          {paginatedOrders.length === 0 && !loading && !error ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-400">
                No orders match your criteria or are available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewOrder}
                  onUpdateStatus={handleUpdateOrderStatus}
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

      {/* Order Details Modal */}
      <Modal isOpen={isOrderDetailsModalOpen} onClose={() => setIsOrderDetailsModalOpen(false)} title="Order Details">
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
  bgColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, bgColor }) => (
  <div className={`${bgColor} text-white p-5 rounded-lg shadow-md hover:shadow-lg transition`}>
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

interface OrderCardProps {
  order: CustomerOrder;
  onViewDetails: (order: CustomerOrder) => void;
  onUpdateStatus: (orderId: string, newStatus: CustomerOrder['status']) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onViewDetails, onUpdateStatus }) => {
  const getStatusColor = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400';
      case 'COMPLETED': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      case 'SHIPPED': return 'text-blue-400';
      case 'OUT_FOR_DELIVERY': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-lg hover:shadow-xl transition relative flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-emerald-400 mb-2">Order #{order.id.slice(-6).toUpperCase()}</h3>
        <p className="text-sm text-gray-400 mb-1">
          Customer: <span className="text-gray-300">{order.name || order.email || 'N/A'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-1">
          Total: <span className="text-green-400 font-medium">${order.totalPrice.toFixed(2)}</span>
        </p>
        <p className="text-sm text-gray-400 mb-1">
          Status: <span className={`font-medium ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, ' ')}</span>
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Placed On: <span className="text-gray-300">{new Date(order.createdAt).toLocaleString()}</span>
        </p>
        <ul className="text-sm text-gray-300 list-disc pl-5 mb-4">
          {order.items.slice(0, 2).map(item => (
            <li key={item.id}>{item.quantity}x {item.marketplaceListing.name}</li>
          ))}
          {order.items.length > 2 && <li className="text-gray-500">...and {order.items.length - 2} more items</li>}
        </ul>
      </div>
      <div className="flex space-x-2 self-end mt-4">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          onClick={() => onViewDetails(order)}
        >
          View Details
        </button>
        {order.status === 'PENDING' && (
          <button
            className="px-3 py-1 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition"
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
          >
            Mark Completed
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
  const getStatusColor = (status: CustomerOrder['status']) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400';
      case 'COMPLETED': return 'text-green-400';
      case 'CANCELLED': return 'text-red-400';
      case 'SHIPPED': return 'text-blue-400';
      case 'OUT_FOR_DELIVERY': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CustomerOrder['status'];
    await onUpdateStatus(order.id, newStatus);
  };

  return (
    <div className="space-y-6 text-gray-100">
      <div className="flex justify-between items-center pb-4 border-b border-gray-700">
        <h3 className="text-2xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h3>
        <span className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ')}
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
        <p className="text-lg font-semibold mb-2">Order Items:</p>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center space-x-4 bg-gray-700 p-3 rounded-md">
              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                <img
                  src={item.marketplaceListing.images && item.marketplaceListing.images.length > 0 ? item.marketplaceListing.images[0].url : "https://placehold.co/64x64/444/eee?text=Dish"}
                  alt={item.marketplaceListing.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-grow">
                <p className="font-semibold text-lg">{item.marketplaceListing.name}</p>
                <p className="text-sm text-gray-400">{item.quantity} x ${item.price.toFixed(2)}</p>
              </div>
              <p className="font-bold text-lg text-green-400">${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <p className="text-right text-xl font-bold mt-4">Total: ${order.totalPrice.toFixed(2)}</p>
      </div>

      {order.delivery && (
        <div>
          <p className="text-lg font-semibold mb-2">Delivery Information:</p>
          <ul className="space-y-1 text-gray-300">
            <li><strong>Delivery Status:</strong> {order.deliveryStatus || 'N/A'}</li>
            <li><strong>Estimated Arrival:</strong> {order.estimatedArrival ? new Date(order.estimatedArrival).toLocaleString() : 'N/A'}</li>
            <li><strong>Address:</strong> {order.shippingAddress ? `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.zip}` : 'N/A'}</li>
            <li><strong>Delivery Person:</strong> {order.deliveryPersonName || 'N/A'} ({order.deliveryPersonContact || 'N/A'})</li>
          </ul>
        </div>
      )}

      <div className="pt-4 border-t border-gray-700">
        <label htmlFor="updateStatus" className="block text-sm font-medium text-gray-300 mb-2">Update Order Status:</label>
        <select
          id="updateStatus"
          value={order.status}
          onChange={handleStatusChange}
          className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-emerald-500 focus:border-emerald-500"
          disabled={isLoading}
        >
          {['PENDING', 'COMPLETED', 'CANCELLED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'RECURRING'].map(status => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
