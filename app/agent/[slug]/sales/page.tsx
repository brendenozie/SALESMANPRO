"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format, parseISO } from "date-fns";
import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/AdminNav";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";

type Sale = {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  totalAmount: number;
  region: string;
  date: string;
};

const SalesSummaryPage = () => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [salesAgentId, setSalesAgentId] = useState<string>("63f7c9e2d91b1b2a5e80b016");

  const fetchSalesData = async () => {
    try {
      const query = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        salesAgentId,
      }).toString();

      const response = await fetch(`${apiBaseUrl}/agent/sales?${query}`, {
        cache: "no-store",
      });
      const data = await response.json();
      setSalesData(data || []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate, salesAgentId]);

  // Prepare chart data
  const prepareChartData = () => {
    const salesByDate = salesData.reduce((acc, sale) => {
      const date = format(parseISO(sale.date), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(salesByDate).sort();
    return {
      labels: sortedDates,
      data: sortedDates.map((d) => salesByDate[d]),
    };
  };

  const chartData = prepareChartData();

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Revenue",
        data: chartData.data,
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.3)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "#111" } },
    },
    scales: {
      x: { title: { display: true, text: "Date", color: "#111" } },
      y: { title: { display: true, text: "Revenue ($)", color: "#111" } },
    },
  };

  return (
    <UserLayout>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white w-full">
        <UserNav />
        <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Sales Summary</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white shadow p-4 rounded-lg mb-6">
              <div className="mb-4 sm:mb-0 sm:mr-4">
                <label className="text-gray-600 mr-2">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
              <div className="mb-4 sm:mb-0 sm:mr-4">
                <label className="text-gray-600 mr-2">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border p-2 rounded"
                />
              </div>
              <div>
                <label className="text-gray-600 mr-2">Sales Agent ID:</label>
                <input
                  type="text"
                  value={salesAgentId}
                  onChange={(e) => setSalesAgentId(e.target.value)}
                  placeholder="Enter Sales Agent ID"
                  className="border p-2 rounded"
                />
              </div>
            </div>

            {/* Graph Section */}
            <div className="bg-white shadow p-6 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Revenue Trend</h2>
              <Line data={lineChartData} options={lineChartOptions} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-indigo-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold">Total Sales</h2>
                <p className="text-2xl font-semibold">{salesData.length}</p>
              </div>
              <div className="bg-green-600 text-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-bold">Total Revenue</h2>
                <p className="text-2xl font-semibold">
                  ${salesData.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default SalesSummaryPage;
