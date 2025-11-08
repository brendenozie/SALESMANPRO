"use client";

import { useEffect, useState } from "react";
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

import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type Order = {
  id: string;
  clientName: string;
  createdAt: string;
  status: "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELED";
  totalPrice: number;
  quantity: number;
};

type OrdersData = {
  orders: Order[];
  totalRevenue: number;
  pendingRevenue: number;
  completedRevenue: number;
  monthlyRevenue: number[];
};

const OrderSummaryPage = () => {
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELED"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const apiUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${apiUrl}/agent/orders?agentId=63f7c9e2d91b1b2a5e80b016`, {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Failed to fetch orders");

        const data = await response.json();

        const mappedOrders = data.orders.map((order: any) => ({
          id: order.id,
          clientName: order.client?.name || "Unknown Client",
          createdAt: new Date(order.createdAt).toLocaleDateString("en-GB"),
          status: order.status,
          totalPrice: order.totalPrice,
          quantity: order.quantity,
        }));

        setOrdersData({
          orders: mappedOrders,
          totalRevenue: data.totalRevenue,
          pendingRevenue: data.pendingRevenue,
          completedRevenue: data.completedRevenue,
          monthlyRevenue: data.monthlyRevenue,
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [apiUrl]);

  if (!ordersData) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center text-gray-600">
          <p className="text-xl font-semibold">Loading order summary...</p>
        </div>
      </UserLayout>
    );
  }

  const { orders, totalRevenue, pendingRevenue, completedRevenue, monthlyRevenue } = ordersData;

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

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
    <UserLayout>
      <div className="min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="container mx-auto p-6">
          <h1 className="text-4xl font-bold text-center mb-8">Order Summary</h1>

          {/* Search & Filters */}
          <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg bg-white text-gray-800"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full sm:w-auto px-4 py-2 border rounded-lg bg-white text-gray-800"
            >
              <option value="all">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          {/* Revenue Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-lg shadow bg-gradient-to-r from-blue-500 to-blue-700 text-white">
              <h2 className="text-lg font-semibold">Total Revenue</h2>
              <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg shadow bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
              <h2 className="text-lg font-semibold">Pending Revenue</h2>
              <p className="text-3xl font-bold">${pendingRevenue.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg shadow bg-gradient-to-r from-green-500 to-green-700 text-white">
              <h2 className="text-lg font-semibold">Completed Revenue</h2>
              <p className="text-3xl font-bold">${completedRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Chart + Orders */}
          <div className="mb-10">
            <div className="bg-white p-6 rounded-lg shadow mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Monthly Revenue</h2>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" as const },
                  },
                }}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-indigo-400 mb-6">Order List</h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {paginatedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300"
                  >
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">{order.clientName}</h3>
                      <p className="text-xs text-gray-500">{order.createdAt}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-700"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="flex justify-between">
                        <span className="font-medium">Total:</span>
                        <span className="font-semibold">${order.totalPrice.toFixed(2)}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium">Items:</span>
                        <span>{order.quantity} Items</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-center space-x-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-700 rounded-lg text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default OrderSummaryPage;
