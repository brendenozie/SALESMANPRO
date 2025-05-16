"use client"; 
import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdminLayout from "@/components/AdminLayout";

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const ReportsPage: React.FC = () => {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Data states
  const [ordersByStatus, setOrdersByStatus] = useState({ series: [], labels: [] });
  const [salesAgentRevenue, setSalesAgentRevenue] = useState<{ series: { name: string; data: number[] }[]; labels: string[] }>({ series: [], labels: [] });
  const [bestSellingProducts, setBestSellingProducts] = useState<{ series: { name: string; data: number[] }[]; labels: string[] }>({ series: [], labels: [] });
  const [totalRevenue, setTotalRevenue] = useState(0);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [ordersRes, revenueRes, productsRes, totalRes] = await Promise.all([
        axios.get("/api/admin/reports/orders-by-status", { params: { startDate, endDate } }),
        axios.get("/api/admin/reports/sales-agent-revenue", { params: { startDate, endDate } }),
        axios.get("/api/admin/reports/best-selling-products", { params: { startDate, endDate } }),
        axios.get("/api/admin/reports/total-revenue", { params: { startDate, endDate } }),
      ]);

      setOrdersByStatus({
        labels: ordersRes.data.map((item: any) => item.status),
        series: ordersRes.data.map((item: any) => item._count.id),
      });

      setSalesAgentRevenue({
        labels: revenueRes.data.map((agent: any) => agent.name),
        series: [{ name: "Revenue", data: revenueRes.data.map((agent: any) => agent.totalRevenue) }],
      });

      setBestSellingProducts({
        labels: productsRes.data.map((product: any) => product.name),
        series: [{ name: "Units Sold", data: productsRes.data.map((product: any) => product.totalSold) }],
      });

      setTotalRevenue(totalRes.data.totalRevenue);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  if (loading) {
    return <p>Loading reports...</p>;
  }

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
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center">Admin Reports</h1>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <DatePicker selected={startDate} onChange={(date: any) => setStartDate(date)} className="border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <DatePicker selected={endDate} onChange={(date: any) => setEndDate(date)} className="border p-2 rounded" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Orders by Status</h2>
          <ApexCharts options={pieOptions} series={ordersByStatus.series} type="donut" height={320} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Revenue by Sales Agent</h2>
          <ApexCharts options={barOptions} series={salesAgentRevenue.series} type="bar" height={320} />
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Best-Selling Products</h2>
          <ApexCharts options={lineOptions} series={bestSellingProducts.series} type="line" height={320} />
        </div>

        <div className="bg-green-600 text-white p-6 rounded-lg shadow text-center">
          <h3 className="text-lg font-bold">Total Revenue</h3>
          <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
