// app/admin/sales-summary/SalesSummaryClient.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { format, parseISO } from "date-fns";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export type Sale = {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  totalAmount: number;
  region: string;
  date: string; // ISO string
};

interface ClientProps {
  initialSales: Sale[];
}

const SalesSummaryClient: React.FC<ClientProps> = ({ initialSales }) => {
  // Store date filters as ISO strings (YYYY-MM-DD)
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filteredSales, setFilteredSales] = useState<Sale[]>(initialSales);

  // Filter whenever dates or initialSales change
  useEffect(() => {
    if (startDate && endDate) {
      const filtered = initialSales.filter((sale) => {
        const saleDate = parseISO(sale.date);
        return (
          saleDate >= parseISO(startDate) && saleDate <= parseISO(endDate)
        );
      });
      setFilteredSales(filtered);
    } else {
      setFilteredSales(initialSales);
    }
  }, [startDate, endDate, initialSales]);

  // Prepare the data for the line chart
  const prepareChartData = () => {
    // Sum totalAmount by date (YYYY-MM-DD)
    const salesByDate = filteredSales.reduce((acc, sale) => {
      const dateKey = format(parseISO(sale.date), "yyyy-MM-dd");
      acc[dateKey] = (acc[dateKey] || 0) + sale.totalAmount;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(salesByDate).sort();
    const labels = sortedDates;
    const data = sortedDates.map((d) => salesByDate[d]);

    return { labels, data };
  };

  const chartDataObj = prepareChartData();
  const lineChartData = {
    labels: chartDataObj.labels,
    datasets: [
      {
        label: "Revenue",
        data: chartDataObj.data,
        fill: false,
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.3)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#4F46E5",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Date" } },
      y: { title: { display: true, text: "Revenue ($)" } },
    },
  };

  return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-6 text-indigo-400">
            Sales Summary
          </h1>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Sales"
              value={filteredSales.length.toString()}
              color="indigo"
            />
            <StatCard
              title="Total Revenue"
              value={`$${filteredSales
                .reduce((sum, sale) => sum + sale.totalAmount, 0)
                .toFixed(2)}`}
              color="green"
            />
          </div>

          {/* Filters */}
          <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Filters</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <DateInput
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
              <DateInput
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              Revenue Trend
            </h2>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>
  );
};

export default SalesSummaryClient;

// ----------------------
// Helper Components
// ----------------------

interface StatCardProps {
  title: string;
  value: string;
  color: keyof typeof gradientColors;
}

const gradientColors = {
  indigo: "from-indigo-500 to-purple-500",
  green: "from-green-400 to-green-600",
};

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
  <div
    className={`p-6 bg-gradient-to-r ${gradientColors[color]} rounded-lg shadow-lg`}
  >
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

interface DateInputProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-gray-300 mb-2">{label}</label>
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-300"
    />
  </div>
);
