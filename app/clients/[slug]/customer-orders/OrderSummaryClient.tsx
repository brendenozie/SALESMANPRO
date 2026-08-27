"use client";

import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Order = {
  id: string;
  customerName: string;
  orderDate: string;
  status: "pending" | "shipped" | "delivered" | "canceled";
  totalAmount: number;
  items: { name: string; quantity: number }[];
};

type Props = {
  ordersData: Order[];
};

export default function OrderSummaryClient({ ordersData = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<"all" | "pending" | "shipped" | "delivered" | "canceled">("all");
  const itemsPerPage = 5;

  // 🔍 Filter orders by search and status
  const filteredOrders = ordersData.filter((order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // 📄 Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;

  // 💰 Revenue summary
  const totalRevenue = ordersData.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingRevenue = ordersData
    .filter((o) => o.status === "pending")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const deliveredRevenue = ordersData
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // 📈 Monthly revenue graph
  const monthlyRevenue = Array(12).fill(0);
  ordersData.forEach((order) => {
    const month = new Date(order.orderDate).getMonth();
    monthlyRevenue[month] += order.totalAmount;
  });

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Monthly Revenue",
        data: monthlyRevenue,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Order Summary</h1>

        {/* 🔎 Search and Filter */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border p-3 rounded-lg w-full max-w-md shadow focus:outline-none focus:ring focus:ring-indigo-200"
          />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setCurrentPage(1);
            }}
            className="border p-3 rounded-lg shadow"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        {/* 💵 Revenue Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold">Total Revenue</h2>
            <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-yellow-500 text-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold">Pending Revenue</h2>
            <p className="text-2xl font-semibold">${pendingRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-green-600 text-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-bold">Delivered Revenue</h2>
            <p className="text-2xl font-semibold">${deliveredRevenue.toFixed(2)}</p>
          </div>
        </div>

        {/* 📊 Chart */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Monthly Revenue</h2>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" as const } },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>

        {/* 🧾 Orders List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-600 mb-4">Order List</h2>
          {paginatedOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {paginatedOrders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">{order.customerName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">Status: {order.status.toUpperCase()}</p>
                  <p className="text-sm text-gray-700">Total: ${order.totalAmount.toFixed(2)}</p>
                  <ul className="text-sm text-gray-600 mt-2">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No orders found.</p>
          )}
        </div>

        {/* ⏩ Pagination */}
        <div className="flex justify-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
