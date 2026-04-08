"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon, CubeTransparentIcon, CalendarDaysIcon, UsersIcon,
  MagnifyingGlassIcon, XMarkIcon, EyeIcon, ArrowPathIcon, CurrencyDollarIcon,
  CheckCircleIcon, ExclamationCircleIcon, UserIcon, ClipboardDocumentListIcon,
  TagIcon, ClockIcon, BuildingOfficeIcon, BriefcaseIcon, // Added icons for clarity
  XCircleIcon
} from '@heroicons/react/24/solid';


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Reusable Modal Component ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
      }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
        variants={{
          hidden: { y: "100vh", opacity: 0 },
          visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
          exit: { y: "100vh", opacity: 0 }
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
};

// --- Report Data Interfaces (matching API responses) ---

interface PatientOption {
  id: string; // Consumer ID
  name: string;
  userId: string; // Corresponding User ID
}

interface DoctorOption {
  id: string; // Doctor ID
  name: string;
  userId: string; // Corresponding User ID
}

interface ProductOption {
  id: string;
  name: string;
  category: string;
}

// Sales Report Interfaces
interface SalesByProduct { name: string; quantity: number; revenue: number; profit: number; }
interface SalesByDoctor { name: string; revenue: number; appointments: number; }
interface SalesByPatient { name: string; totalSpent: number; orderCount: number; }
interface DailySales { date: string; revenue: number; }
interface RawOrderItem {
  id: string;
  productName?: string;
  quantity: number;
  price: number;
  revenue: number;
  patientName?: string;
  doctorName?: string;
  appointmentDate: string;
  orderDate: string;
}
interface SalesReportData {
  totalSales: number;
  totalProfit: number;
  salesByProduct: SalesByProduct[];
  salesByDoctor: SalesByDoctor[];
  salesByPatient: SalesByPatient[];
  dailySales: DailySales[];
  rawOrderItems: RawOrderItem[];
}

// Inventory Report Interfaces
interface InventoryItemReport {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number | null;
  status: 'LOW_STOCK' | 'IN_STOCK';
  costPrice: number;
  sellingPrice: number;
  lastUpdated: string;
}

// Appointment Report Interfaces
interface AppointmentSummaryItem {
  id: string;
  patientName: string;
  doctorName: string;
  service: string;
  date: string;
  status: string; // e.g., 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED'
  totalItemsRevenue: number;
  itemsUsed: { productName: string; quantity: number; price: number }[];
  createdAt: string;
}
interface AppointmentReportData {
  summary: AppointmentSummaryItem[];
  statusCounts: { [key: string]: number };
  totalAppointments: number;
}

// Staff Performance Report Interfaces
interface StaffPerformanceItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  type: 'Doctor' | 'Staff';
  jobTitle?: string; // For Staff
  department?: string; // For Staff
  totalAppointments?: number; // For Doctors
  completedAppointments?: number; // For Doctors
  totalRevenueGenerated?: number; // For Doctors
  // Add other metrics as per API
}

interface StaffPerformanceReportData {
  params: Promise<{
    slug: string;
  }>;
}

// --- Main AdminReportsPage Component ---
export default async function AdminReportsPage({ params }: StaffPerformanceReportData) {

  const { slug: companyId } = await params;

  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'inventory', 'appointments', 'staff'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states for each report
  const [salesReportData, setSalesReportData] = useState<SalesReportData | null>(null);
  const [inventoryReportData, setInventoryReportData] = useState<InventoryItemReport[]>([]);
  const [appointmentReportData, setAppointmentReportData] = useState<AppointmentReportData | null>(null);
  const [staffPerformanceData, setStaffPerformanceData] = useState<StaffPerformanceItem[]>([]);

  // Filter states for each report
  // Sales Filters
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');
  const [salesProductId, setSalesProductId] = useState('');
  const [salesDoctorId, setSalesDoctorId] = useState('');
  const [salesPatientId, setSalesPatientId] = useState('');

  // Inventory Filters
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const [inventoryStockStatus, setInventoryStockStatus] = useState('ALL');

  // Appointment Filters
  const [apptStartDate, setApptStartDate] = useState('');
  const [apptEndDate, setApptEndDate] = useState('');
  const [apptDoctorId, setApptDoctorId] = useState('');
  const [apptPatientId, setApptPatientId] = useState('');
  const [apptServiceName, setApptServiceName] = useState('');
  const [apptStatus, setApptStatus] = useState('All');

  // Staff Performance Filters
  const [staffPerfStartDate, setStaffPerfStartDate] = useState('');
  const [staffPerfEndDate, setStaffPerfEndDate] = useState('');
  const [staffPerfStaffId, setStaffPerfStaffId] = useState('');
  const [staffPerfRole, setStaffPerfRole] = useState('ALL');

  // Dropdown options (fetched once)
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [serviceNames, setServiceNames] = useState<string[]>([]); // Assuming service names are fetched from Services API

  // Modal states for viewing details
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedItem, setViewedItem] = useState<any>(null);
  const [viewModalTitle, setViewModalTitle] = useState('');

  // Mock companyId for demonstration. In a real app, this would come from auth/session.
  // const companyId = "654321098765432109876543"; // IMPORTANT: Replace with your actual company ID

  // --- Common Data Fetchers for Dropdowns ---
  const fetchPatientsList = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/patients?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setPatients(data.map((p: any) => ({ id: p.id, name: p.name, userId: p.userId })));
      }
    } catch (e) { 
      // console.error("Error fetching patients list:", e); 
    }
  }, [companyId]);

  const fetchDoctorsList = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/doctors?companyId=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (e) { 
      // console.error("Error fetching doctors list:", e); 
    }
  }, [companyId]);

  const fetchProductsList = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/products?companyId=${companyId}`); // Assuming you have a /api/admin/products endpoint
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        const categories = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean)));
        setProductCategories(['All', ...categories as string[]]);
      }
    } catch (e) { 
      // console.error("Error fetching products list:", e); 
    }
  }, [companyId]);

  const fetchServiceNames = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/services?companyId=${companyId}`); // Assuming you have a /api/admin/services endpoint
      if (response.ok) {
        const data = await response.json();
        const names = Array.from(new Set(data.map((s: any) => s.name).filter(Boolean)));
        setServiceNames(['All', ...names as string[]]);
      }
    } catch (e) { 
      // console.error("Error fetching service names:", e); 
    }
  }, [companyId]);

  useEffect(() => {
    fetchPatientsList();
    fetchDoctorsList();
    fetchProductsList();
    fetchServiceNames();
  }, [fetchPatientsList, fetchDoctorsList, fetchProductsList, fetchServiceNames]);


  // --- Report Specific Data Fetchers ---
  const fetchSalesReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ companyId });
      if (salesStartDate) query.append('startDate', salesStartDate);
      if (salesEndDate) query.append('endDate', salesEndDate);
      if (salesProductId) query.append('productId', salesProductId);
      if (salesDoctorId) query.append('doctorId', salesDoctorId);
      if (salesPatientId) query.append('patientId', salesPatientId);

      const response = await fetch(`${apiBaseUrl}/admin/reports/sales?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sales report');
      }
      const data: SalesReportData = await response.json();
      setSalesReportData(data);
    } catch (e: any) {
      // console.error("Error fetching sales report:", e);
      setError(e.message || "Failed to load sales report.");
    } finally {
      setLoading(false);
    }
  }, [companyId, salesStartDate, salesEndDate, salesProductId, salesDoctorId, salesPatientId]);

  const fetchInventoryReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ companyId });
      if (inventoryCategory && inventoryCategory !== 'All') query.append('category', inventoryCategory);
      if (inventoryStockStatus && inventoryStockStatus !== 'ALL') query.append('stockStatus', inventoryStockStatus);

      const response = await fetch(`${apiBaseUrl}/admin/reports/inventory?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch inventory report');
      }
      const data: InventoryItemReport[] = await response.json();
      setInventoryReportData(data);
    } catch (e: any) {
      // console.error("Error fetching inventory report:", e);
      setError(e.message || "Failed to load inventory report.");
    } finally {
      setLoading(false);
    }
  }, [companyId, inventoryCategory, inventoryStockStatus]);

  const fetchAppointmentReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ companyId });
      if (apptStartDate) query.append('startDate', apptStartDate);
      if (apptEndDate) query.append('endDate', apptEndDate);
      if (apptDoctorId) query.append('doctorId', apptDoctorId);
      if (apptPatientId) query.append('patientId', apptPatientId);
      if (apptServiceName && apptServiceName !== 'All') query.append('serviceName', apptServiceName);
      if (apptStatus && apptStatus !== 'All') query.append('status', apptStatus);

      const response = await fetch(`${apiBaseUrl}/admin/reports/appointments?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch appointment report');
      }
      const data: AppointmentReportData = await response.json();
      setAppointmentReportData(data);
    } catch (e: any) {
      // console.error("Error fetching appointment report:", e);
      setError(e.message || "Failed to load appointment report.");
    } finally {
      setLoading(false);
    }
  }, [companyId, apptStartDate, apptEndDate, apptDoctorId, apptPatientId, apptServiceName, apptStatus]);

  const fetchStaffPerformanceReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ companyId });
      if (staffPerfStartDate) query.append('startDate', staffPerfStartDate);
      if (staffPerfEndDate) query.append('endDate', staffPerfEndDate);
      if (staffPerfStaffId) query.append('staffId', staffPerfStaffId);
      if (staffPerfRole && staffPerfRole !== 'ALL') query.append('role', staffPerfRole);

      const response = await fetch(`${apiBaseUrl}/admin/reports/staff-performance?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch staff performance report');
      }
      const data: StaffPerformanceItem[] = await response.json();
      setStaffPerformanceData(data);
    } catch (e: any) {
      // console.error("Error fetching staff performance report:", e);
      setError(e.message || "Failed to load staff performance report.");
    } finally {
      setLoading(false);
    }
  }, [companyId, staffPerfStartDate, staffPerfEndDate, staffPerfStaffId, staffPerfRole]);


  // Effect to trigger data fetch when tab changes or filters change
  useEffect(() => {
    switch (activeTab) {
      case 'sales':
        fetchSalesReport();
        break;
      case 'inventory':
        fetchInventoryReport();
        break;
      case 'appointments':
        fetchAppointmentReport();
        break;
      case 'staff':
        fetchStaffPerformanceReport();
        break;
      default:
        break;
    }
  }, [activeTab, fetchSalesReport, fetchInventoryReport, fetchAppointmentReport, fetchStaffPerformanceReport]);


  // Helper for stock status color
  const getStockStatusColor = (stock: number, minStock: number | null) => {
    if (minStock === null) return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700'; // No min stock defined
    if (stock <= minStock) return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
    if (stock < minStock * 2) return 'text-orange-600 bg-orange-100 dark:text-orange-300 dark:bg-orange-900';
    return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
  };

  const getApptStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'CONFIRMED': return 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900';
      case 'COMPLETED': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'CANCELED': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  const handleViewDetails = (item: any, title: string) => {
    setViewedItem(item);
    setViewModalTitle(title);
    setIsViewModalOpen(true);
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12 text-blue-600 dark:text-blue-400">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading report data...
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-600 dark:text-red-400">
          <ExclamationCircleIcon className="w-8 h-8 mx-auto mb-4" />
          Error: {error}
        </div>
      );
    }

    switch (activeTab) {
      case 'sales':
        return (
          <div className="space-y-8">
            {/* Sales Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
              <div>
                <label htmlFor="salesStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input type="date" id="salesStartDate" value={salesStartDate} onChange={(e) => setSalesStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
              <div>
                <label htmlFor="salesEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input type="date" id="salesEndDate" value={salesEndDate} onChange={(e) => setSalesEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
              <div>
                <label htmlFor="salesPatientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                <select id="salesPatientId" value={salesPatientId} onChange={(e) => setSalesPatientId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="">All Patients</option>
                  {patients.map(p => <option key={p.id} value={p.userId}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="salesDoctorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
                <select id="salesDoctorId" value={salesDoctorId} onChange={(e) => setSalesDoctorId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="">All Doctors</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="salesProductId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product</label>
                <select id="salesProductId" value={salesProductId} onChange={(e) => setSalesProductId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="">All Products</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button onClick={fetchSalesReport} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
              </div>
            </div>

            {salesReportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
                    <CurrencyDollarIcon className="w-10 h-10" />
                    <div>
                      <p className="text-sm font-medium opacity-80">Total Sales</p>
                      <p className="text-3xl font-bold">${salesReportData.totalSales.toFixed(2)}</p>
                    </div>
                  </motion.div>
                  <motion.div className="bg-gradient-to-br from-teal-400 to-teal-600 text-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
                    <ChartBarIcon className="w-10 h-10" />
                    <div>
                      <p className="text-sm font-medium opacity-80">Total Profit</p>
                      <p className="text-3xl font-bold">${salesReportData.totalProfit.toFixed(2)}</p>
                    </div>
                  </motion.div>
                  <motion.div className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
                    <ClipboardDocumentListIcon className="w-10 h-10" />
                    <div>
                      <p className="text-sm font-medium opacity-80">Total Order Items</p>
                      <p className="text-3xl font-bold">{salesReportData.rawOrderItems.length}</p>
                    </div>
                  </motion.div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Daily Sales Trend</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {salesReportData.dailySales.length === 0 ? (
                          <tr><td colSpan={2} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No daily sales data.</td></tr>
                        ) : (
                          salesReportData.dailySales.map(day => (
                            <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{day.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${day.revenue.toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sales by Product</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {salesReportData.salesByProduct.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No product sales data.</td></tr>
                          ) : (
                            salesReportData.salesByProduct.map((prod, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{prod.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{prod.quantity}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${prod.revenue.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${prod.profit.toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sales by Doctor</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Appointments</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {salesReportData.salesByDoctor.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No doctor sales data.</td></tr>
                          ) : (
                            salesReportData.salesByDoctor.map((doc, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{doc.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${doc.revenue.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{doc.appointments}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sales by Patient</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Spent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order Items Count</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {salesReportData.salesByPatient.length === 0 ? (
                          <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No patient sales data.</td></tr>
                        ) : (
                          salesReportData.salesByPatient.map((pat, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{pat.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${pat.totalSpent.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{pat.orderCount}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Detailed Sales Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Appt Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order Date</th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {salesReportData.rawOrderItems.length === 0 ? (
                          <tr><td colSpan={8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No detailed sales transactions.</td></tr>
                        ) : (
                          salesReportData.rawOrderItems.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.productName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${item.revenue.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.patientName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.doctorName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.appointmentDate}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.orderDate}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleViewDetails(item, `Order Item Details: ${item.productName}`)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                  aria-label={`View details for ${item.productName}`}
                                >
                                  <EyeIcon className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-8">
            {/* Inventory Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
              <div>
                <label htmlFor="inventoryCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select id="inventoryCategory" value={inventoryCategory} onChange={(e) => setInventoryCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="inventoryStockStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Status</label>
                <select id="inventoryStockStatus" value={inventoryStockStatus} onChange={(e) => setInventoryStockStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="ALL">All</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="IN_STOCK">In Stock</option>
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button onClick={fetchInventoryReport} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
              </div>
            </div>

            {inventoryReportData && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Inventory Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {inventoryReportData.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No inventory items found.</td></tr>
                      ) : (
                        inventoryReportData.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockStatusColor(item.stock, item.minStock)}`}>
                                {item.stock}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.minStock || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'LOW_STOCK' ? 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900' : 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900'}`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.lastUpdated}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(item, `Inventory Item Details: ${item.name}`)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                aria-label={`View details for ${item.name}`}
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      case 'appointments':
        return (
          <div className="space-y-8">
            {/* Appointment Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
              <div>
                <label htmlFor="apptStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input type="date" id="apptStartDate" value={apptStartDate} onChange={(e) => setApptStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
              <div>
                <label htmlFor="apptEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input type="date" id="apptEndDate" value={apptEndDate} onChange={(e) => setApptEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
              <div>
                <label htmlFor="apptPatientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
                <select id="apptPatientId" value={apptPatientId} onChange={(e) => setApptPatientId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="">All Patients</option>
                  {patients.map(p => <option key={p.id} value={p.userId}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="apptDoctorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
                <select id="apptDoctorId" value={apptDoctorId} onChange={(e) => setApptDoctorId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="">All Doctors</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="apptServiceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
                <select id="apptServiceName" value={apptServiceName} onChange={(e) => setApptServiceName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  {serviceNames.map(name => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="apptStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select id="apptStatus" value={apptStatus} onChange={(e) => setApptStatus(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="All">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button onClick={fetchAppointmentReport} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
              </div>
            </div>

            {appointmentReportData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow-lg flex items-center space-x-4">
                    <CalendarDaysIcon className="w-10 h-10" />
                    <div>
                      <p className="text-sm font-medium opacity-80">Total Appointments</p>
                      <p className="text-3xl font-bold">{appointmentReportData.totalAppointments}</p>
                    </div>
                  </motion.div>
                  {Object.entries(appointmentReportData.statusCounts).map(([status, count]) => (
                    <motion.div key={status} className={`p-6 rounded-2xl shadow-lg flex items-center space-x-4 ${getApptStatusColor(status).replace('text-', 'bg-').replace('bg-', 'bg-gradient-to-br from-').replace('100', '400').replace('900', '600')} text-white`}>
                      {status === 'COMPLETED' && <CheckCircleIcon className="w-10 h-10" />}
                      {status === 'PENDING' && <ClockIcon className="w-10 h-10" />}
                      {status === 'CANCELED' && <XCircleIcon className="w-10 h-10" />}
                      {status === 'CONFIRMED' && <CalendarDaysIcon className="w-10 h-10" />}
                      <div>
                        <p className="text-sm font-medium opacity-80">{status} Appointments</p>
                        <p className="text-3xl font-bold">{count}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Appointment List</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue</th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">View</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {appointmentReportData.summary.length === 0 ? (
                          <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No appointments found.</td></tr>
                        ) : (
                          appointmentReportData.summary.map((appt) => (
                            <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{appt.patientName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{appt.doctorName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{appt.service}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{appt.date}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getApptStatusColor(appt.status)}`}>
                                  {appt.status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${appt.totalItemsRevenue.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleViewDetails(appt, `Appointment Details: ${appt.id}`)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                  aria-label={`View details for appointment ${appt.id}`}
                                >
                                  <EyeIcon className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-8">
            {/* Staff Performance Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
              <div>
                <label htmlFor="staffPerfStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input type="date" id="staffPerfStartDate" value={staffPerfStartDate} onChange={(e) => setStaffPerfStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
              <div>
                <label htmlFor="staffPerfEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input type="date" id="staffPerfEndDate" value={staffPerfEndDate} onChange={(e) => setStaffPerfEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
              </div>
              <div>
                <label htmlFor="staffPerfRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select id="staffPerfRole" value={staffPerfRole} onChange={(e) => { setStaffPerfRole(e.target.value); setStaffPerfStaffId(''); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="ALL">All Roles</option>
                  <option value="DOCTOR">Doctor</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>
              <div>
                <label htmlFor="staffPerfStaffId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specific Staff/Doctor</label>
                <select id="staffPerfStaffId" value={staffPerfStaffId} onChange={(e) => setStaffPerfStaffId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                  <option value="">All</option>
                  {staffPerfRole === 'DOCTOR' && doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  {staffPerfRole === 'STAFF' && patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)} {/* Assuming patients list can be reused for staff profiles */}
                  {staffPerfRole === 'ALL' && (
                    <>
                      <optgroup label="Doctors">
                        {doctors.map(d => <option key={`doc-${d.id}`} value={d.id}>{d.name}</option>)}
                      </optgroup>
                      <optgroup label="Staff">
                        {patients.map(p => <option key={`pat-${p.id}`} value={p.id}>{p.name}</option>)}
                      </optgroup>
                    </>
                  )}
                </select>
              </div>
              <div className="flex items-end justify-end">
                <button onClick={fetchStaffPerformanceReport} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
              </div>
            </div>

            {staffPerformanceData && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Staff Performance Overview</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Job Title/Dept</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Appts (Completed)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenue Generated</th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {staffPerformanceData.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No staff performance data found.</td></tr>
                      ) : (
                        staffPerformanceData.map((staff) => (
                          <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{staff.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{staff.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{staff.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {staff.type === 'Staff' ? `${staff.jobTitle || 'N/A'} (${staff.department || 'N/A'})` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {staff.type === 'Doctor' ? `${staff.totalAppointments || 0} (${staff.completedAppointments || 0})` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {staff.type === 'Doctor' ? `$${(staff.totalRevenueGenerated || 0).toFixed(2)}` : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleViewDetails(staff, `${staff.type} Details: ${staff.name}`)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                                aria-label={`View details for ${staff.name}`}
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Select a report type above.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          // variants={fadeIn}
        >
          Clinic Reports
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          // variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Gain insights into your clinic's performance with detailed reports.
        </motion.p>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          initial="hidden"
          animate="visible"
          // variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'sales' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <ChartBarIcon className="w-5 h-5 mr-2" /> Sales Report
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <CubeTransparentIcon className="w-5 h-5 mr-2" /> Inventory Report
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <CalendarDaysIcon className="w-5 h-5 mr-2" /> Appointment Summary
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'staff' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <UsersIcon className="w-5 h-5 mr-2" /> Staff Performance
            </button>
          </div>

          {/* Report Content based on activeTab */}
          {renderReportContent()}

        </motion.div>
      </div>

      {/* Reusable View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewedItem && (
          <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={viewModalTitle}>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              {Object.entries(viewedItem).map(([key, value]) => {
                // Skip internal Prisma keys or sensitive IDs
                if (key.startsWith('_') || key.endsWith('Id') || key === 'createdAt' || key === 'updatedAt') return null;

                let displayValue = value;
                if (Array.isArray(value)) {
                  displayValue = value.map((item, idx) => (
                    <span key={idx} className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 mb-2">
                      {typeof item === 'object' ? JSON.stringify(item) : item}
                    </span>
                  ));
                } else if (typeof value === 'boolean') {
                  displayValue = value ? 'Yes' : 'No';
                } else if (typeof value === 'number') {
                  displayValue = key.includes('price') || key.includes('revenue') || key.includes('amount') ? `$${value.toFixed(2)}` : value;
                } else if (typeof value === 'object' && value !== null) {
                  displayValue = JSON.stringify(value, null, 2); // Pretty print objects
                }

                return (
                  <p key={key}>
                    <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> 
                    {/* {displayValue} */}
                  </p>
                );
              })}
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
