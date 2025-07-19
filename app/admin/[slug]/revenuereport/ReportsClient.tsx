"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ApexOptions } from "apexcharts"; // Ensure ApexOptions is imported

// Dynamically import ApexCharts for SSR safety
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

// Interface definitions remain the same as they are for data structure
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
  const [error, setError] = useState<string | null>(null);

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
    setError(null); // Clear any previous errors
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

      // Best-Selling Products (line chart)
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
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever date range changes
  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // ApexCharts common options
  const commonChartOptions: ApexOptions = {
    chart: {
      toolbar: {
        show: false, // Hide toolbar for a cleaner look
      },
      animations: {
        enabled: true,
        // easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      fontFamily: 'Inter, sans-serif', // Use a modern font
    },
    dataLabels: {
      enabled: false, // Generally cleaner without default data labels, let tooltips do the work
      style: {
        fontSize: '12px',
        colors: ['#333']
      }
    },
    tooltip: {
      theme: 'dark', // Dark tooltip for better contrast
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif',
      },
      y: {
        formatter: function (val: number) {
          return val.toLocaleString(); // Format numbers
        }
      }
    },
    theme: {
      mode: 'light',
      palette: 'palette1', // ApexCharts default palette 1
      monochrome: {
          enabled: false
      }
    },
    // Custom colors for a more vibrant dashboard feel
    colors: ['#6366F1', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#3B82F6'], // Example modern palette
  };

  // ApexCharts specific options
  const pieOptions: ApexOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: "donut",
    },
    labels: ordersByStatus.labels,
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    plotOptions: {
        pie: {
            donut: {
                labels: {
                    show: true,
                    total: {
                        showAlways: true,
                        show: true,
                        label: 'Total Orders',
                        formatter: function (w: any) {
                            return w.globals.seriesTotals.reduce((a: number, b: number) => {
                                return a + b
                            }, 0).toLocaleString()
                        }
                    }
                }
            }
        }
    },
    legend: {
        position: 'right', // Place legend on the right for more space
        offsetY: 0,
        height: 230,
    }
  };

  const barOptions: ApexOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: "bar",
    },
    xaxis: {
      categories: salesAgentRevenue.labels,
      labels: {
        style: {
          colors: '#6B7280', // Tailwind gray-500
          fontSize: '12px'
        }
      }
    },
    yaxis: {
        labels: {
            formatter: function (value: number) {
                return "$" + value.toFixed(0).toLocaleString();
            },
            style: {
                colors: '#6B7280',
                fontSize: '12px'
            }
        }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
        enabled: true, // Enable data labels for bars
        formatter: function (val: number) {
            return "$" + val.toFixed(0).toLocaleString();
        },
        offsetY: -20, // Position above the bar
        style: {
            fontSize: '12px',
            colors: ['#333']
        }
    },
    grid: {
        show: false // Hide grid lines for cleaner look
    }
  };

  const lineOptions: ApexOptions = {
    ...commonChartOptions,
    chart: {
      ...commonChartOptions.chart,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: bestSellingProducts.labels,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
        labels: {
            formatter: function (value: number) {
                return value.toFixed(0).toLocaleString();
            },
            style: {
                colors: '#6B7280',
                fontSize: '12px'
            }
        }
    },
    stroke: {
      curve: "smooth", // Smooth lines
      width: 3,
    },
    markers: {
      size: 4,
      hover: {
        sizeOffset: 6,
      },
    },
    grid: {
        row: {
            colors: ['#f3f3f3', 'transparent'], // alternating row colors
            opacity: 0.5
        },
        column: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
        }
    },
    dataLabels: {
        enabled: true, // Enable data labels for lines
        formatter: function (val: number) {
            return val.toFixed(0).toLocaleString();
        },
        background: {
            enabled: true,
            foreColor: '#fff',
            borderWidth: 0,
            opacity: 0.9,
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 1,
                opacity: 0.45
            }
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 animate-pulse">
        <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xl font-semibold">Loading your insightful reports...</p>
        <p className="text-sm text-gray-600 mt-2">Gathering data from across your system.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center text-red-700">
          <p className="text-xl font-semibold mb-4">Oops! Something went wrong. 😔</p>
          <p className="text-md">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasAnyData = ordersByStatus.series.length > 0 || salesAgentRevenue.series[0]?.data.length > 0 || bestSellingProducts.series[0]?.data.length > 0 || totalRevenue > 0;

  if (!hasAnyData) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
              <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-indigo-500 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l3-3m0 0l3 3m-3-3v12m-6 3h12a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">No Report Data Available!</h2>
                  <p className="text-gray-600 mb-6">
                      It looks like there's no data to generate reports for the selected date range.
                      Try adjusting the **start and end dates** to see more results, or ensure there's activity in your system.
                  </p>
                  <div className="flex justify-center gap-4">
                      <button
                          onClick={() => { setStartDate(new Date(new Date().setMonth(new Date().getMonth() - 3))); setEndDate(new Date()); }}
                          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
                      >
                          View Last 3 Months
                      </button>
                      <button
                          onClick={() => { setStartDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1))); setEndDate(new Date()); }}
                          className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition"
                      >
                          View Last Year
                      </button>
                  </div>
              </div>
          </div>
      );
  }


  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen font-sans">
      {/* Header Section */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-4 drop-shadow-sm flex items-center justify-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          Admin Insights Dashboard
        </h1>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto">
          Gain valuable insights into your orders, sales performance, and product trends with dynamic reports.
        </p>
      </header>

      {/* Date Range Pickers & Apply Button (if needed) */}
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-lg mb-10 flex flex-col sm:flex-row items-center justify-center gap-6 border border-gray-100">
        <div className="flex flex-col">
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date 🗓️
          </label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={(date: Date | null) => date && setStartDate(date)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out"
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date 🗓️
          </label>
          <DatePicker
            id="endDate"
            selected={endDate}
            onChange={(date: Date | null) => date && setEndDate(date)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition duration-150 ease-in-out"
            dateFormat="dd/MM/yyyy"
            minDate={startDate}
            maxDate={new Date()}
          />
        </div>
        {/* If you want a manual 'Apply' button instead of auto-fetching on date change,
            you'd move fetchReports into an onClick handler here.
            For now, useEffect handles it automatically. */}
      </div>

      {/* Total Revenue Card - Elevated KPI */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-8 rounded-2xl shadow-2xl flex items-center justify-between col-span-1 md:col-span-3">
          <div>
            <h3 className="text-3xl font-bold mb-2">Total Revenue Generated 💰</h3>
            <p className="text-6xl font-extrabold">${totalRevenue.toFixed(2).toLocaleString()}</p>
            <p className="text-lg opacity-90 mt-2">Overall earnings for the selected period.</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 opacity-30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
        {/* Placeholder for other potential KPIs if you add them later */}
        {/* <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center border border-gray-100">
            <h4 className="text-xl font-semibold text-gray-700 mb-2">Total Orders</h4>
            <p className="text-4xl font-bold text-blue-600">XXX</p>
        </div> */}
      </div>


      {/* Charts Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by Status (Donut) */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Orders by Status 📈</h2>
          <p className="text-gray-600 mb-4 text-sm">Distribution of orders across different processing stages.</p>
          {ordersByStatus.series.length > 0 ? (
            <ApexCharts
              options={pieOptions}
              series={ordersByStatus.series}
              type="donut"
              height={320}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-3 0V9m-4 3a2 2 0 012-2h2a2 2 0 012 2v3a2 2 0 01-2 2h-2a2 2 0 01-2-2v-3z" />
                </svg>
                <p className="text-lg font-medium">No order status data for this period.</p>
            </div>
          )}
        </div>

        {/* Revenue by Sales Agent (Bar) */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Sales Agent Revenue 💰</h2>
          <p className="text-gray-600 mb-4 text-sm">Performance breakdown by individual sales agents.</p>
          {salesAgentRevenue.series[0]?.data.length > 0 ? (
            <ApexCharts
              options={barOptions}
              series={salesAgentRevenue.series}
              type="bar"
              height={320}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354V4a1 1 0 00-1-1H9a1 1 0 00-1 1v.354M5 6v6a3 3 0 003 3h4.148M15 11l-3 3m0 0l-3-3m3 3v4.354m7-6.529V12a3 3 0 01-3 3H9a3 3 0 01-3-3V6m6 0h4" />
                </svg>
                <p className="text-lg font-medium">No sales agent revenue data for this period.</p>
            </div>
          )}
        </div>

        {/* Best-Selling Products (Line) */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 lg:col-span-2 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Best-Selling Products 🏆</h2>
          <p className="text-gray-600 mb-4 text-sm">Identify top-performing products by units sold.</p>
          {bestSellingProducts.series[0]?.data.length > 0 ? (
            <ApexCharts
              options={lineOptions}
              series={bestSellingProducts.series}
              type="line"
              height={350} // Slightly taller for line chart detail
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-lg font-medium">No best-selling product data for this period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsClient;

