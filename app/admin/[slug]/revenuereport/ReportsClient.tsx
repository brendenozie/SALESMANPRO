// app/admin/reports/ReportsClient.tsx

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ApexOptions } from "apexcharts";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface OrdersByStatusResponse {
  status: string;
  _count: { id: number };
}
interface SalesAgentRevenueResponse {
  name: string;
  totalRevenue: number;
}
interface BestSellingProductsResponse {
  name: string;
  totalSold: number;
}
interface TotalRevenueResponse {
  totalRevenue: number;
}




const ReportsClient: React.FC = () => {
  // Default to one month ago → today
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setMonth(new Date().getMonth() - 1))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());

  const [loading, setLoading] = useState<boolean>(true);

  // Chart data states
  const [ordersByStatus, setOrdersByStatus] = useState<{
    series: number[];
    labels: string[];
  }>({ series: [], labels: [] });

  const [salesAgentRevenue, setSalesAgentRevenue] = useState<{
    series: { name: string; data: number[] }[];
    labels: string[];
  }>({ series: [], labels: [] });

  const [bestSellingProducts, setBestSellingProducts] = useState<{
    series: { name: string; data: number[] }[];
    labels: string[];
  }>({ series: [], labels: [] });

  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  // Helper: format date to ISO (YYYY-MM-DD) for API params
  const formatISODate = (d: Date) => d.toISOString().slice(0, 10);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        startDate: formatISODate(startDate),
        endDate: formatISODate(endDate),
      };

      const [
        ordersRes,
        revenueRes,
        productsRes,
        totalRes,
      ] = await Promise.all([
        axios.get<OrdersByStatusResponse[]>(
          "/api/admin/reports/orders-by-status",
          { params }
        ),
        axios.get<SalesAgentRevenueResponse[]>(
          "/api/admin/reports/sales-agent-revenue",
          { params }
        ),
        axios.get<BestSellingProductsResponse[]>(
          "/api/admin/reports/best-selling-products",
          { params }
        ),
        axios.get<TotalRevenueResponse>(
          "/api/admin/reports/total-revenue",
          { params }
        ),
      ]);

      // Orders by Status (donut chart)
      const ordersData = ordersRes.data;
      setOrdersByStatus({
        labels: ordersData.map((item) => item.status),
        series: ordersData.map((item) => item._count.id),
      });

      // Sales Agent Revenue (bar chart)
      const revenueData = revenueRes.data;
      setSalesAgentRevenue({
        labels: revenueData.map((agent) => agent.name),
        series: [
          {
            name: "Revenue",
            data: revenueData.map((agent) => agent.totalRevenue),
          },
        ],
      });

      // Best‐Selling Products (line chart)
      const productsData = productsRes.data;
      setBestSellingProducts({
        labels: productsData.map((prod) => prod.name),
        series: [
          {
            name: "Units Sold",
            data: productsData.map((prod) => prod.totalSold),
          },
        ],
      });

      // Total Revenue (number)
      setTotalRevenue(totalRes.data.totalRevenue || 0);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Re‐fetch whenever date range changes
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <p className="text-xl font-semibold">Loading reports...</p>
        </div>
    );
  }

  // ApexCharts options
//   const pieOptions = {
//     chart: { type: "donut" },
//     labels: ordersByStatus.labels,
//   };

//   const barOptions = {
//     chart: { type: "bar" },
//     xaxis: { categories: salesAgentRevenue.labels },
//   };

//   const lineOptions = {
//     chart: { type: "line" },
//     xaxis: { categories: bestSellingProducts.labels },
//   };

  const pieOptions: ApexOptions = {
    chart: { type: "donut" },
    labels: ordersByStatus.labels,
  };

  const barOptions: ApexOptions = {
    chart: { type: "bar" },
    xaxis: { categories: salesAgentRevenue.labels },
  };

  const lineOptions: ApexOptions = {
    chart: { type: "line" },
    xaxis: { categories: bestSellingProducts.labels },
  };

  return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Reports</h1>

        {/* Date Range Pickers */}
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => {
                if (date) setStartDate(date);
              }}
              className="border p-2 rounded mt-1"
              maxDate={new Date()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => {
                    if (date) setEndDate(date);
                }}
              className="border p-2 rounded mt-1"
              maxDate={new Date()}
            />
          </div>
        </div>

        {/* Orders by Status (Donut) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Orders by Status</h2>
          <ApexCharts
            options={pieOptions}
            series={ordersByStatus.series}
            type="donut"
            height={320}
          />
        </div>

        {/* Revenue by Sales Agent (Bar) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Revenue by Sales Agent
          </h2>
          <ApexCharts
            options={barOptions}
            series={salesAgentRevenue.series}
            type="bar"
            height={320}
          />
        </div>

        {/* Best‐Selling Products (Line) */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Best‐Selling Products
          </h2>
          <ApexCharts
            options={lineOptions}
            series={bestSellingProducts.series}
            type="line"
            height={320}
          />
        </div>

        {/* Total Revenue */}
        <div className="bg-green-600 text-white p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-bold">Total Revenue</h3>
          <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>
  );
};

export default ReportsClient;

