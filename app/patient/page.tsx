"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon, CalendarDaysIcon, DocumentTextIcon, CreditCardIcon,
  MagnifyingGlassIcon, PencilIcon, EyeIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon,
  ClockIcon, CurrencyDollarIcon, TagIcon, PhoneIcon, EnvelopeIcon // Added for clarity
} from '@heroicons/react/24/solid';


const apiBaseUrl = "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


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

// --- Data Interfaces (matching API responses) ---

interface PatientProfile {
  id: string; // User ID
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

interface Appointment {
  id: string;
  patientName: string; // Should be current patient's name
  doctorName: string;
  service: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

interface Prescription {
  id: string;
  patientId: string; // User ID
  patientName: string; // Should be current patient's name
  doctorId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  instructions?: string;
  issuedDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  status: 'PENDING' | 'DISPENSED' | 'EXPIRED';
  notes?: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  patientId: string; // User ID
  patientName: string; // Should be current patient's name
  amount: number;
  date: string; // invoiceDate formatted as YYYY-MM-DD
  dueDate?: string; // dueDate formatted as YYYY-MM-DD
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELED';
  items: string[]; // Array of strings for invoice line items
  notes?: string;
  createdAt: string; // Formatted date string
}

interface PageProps {
  params: Promise<{
    patientSlug: string;
  }>;
}

// --- Main PatientDashboardPage Component ---
export default async function PatientDashboardPage({ params }: PageProps) {
  // In a real app, patientId would come from authenticated session
  // For demo, we'll use a placeholder or derive from params if it's the patient's actual User ID
  const { patientSlug : currentPatientId } = await params; // Assuming patientSlug is the actual User ID

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'appointments', 'prescriptions', 'invoices'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data States ---
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [prescriptionsList, setPrescriptionsList] = useState<Prescription[]>([]);
  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);

  // --- Modal States ---
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<PatientProfile>>({});

  const [isEditApptModalOpen, setIsEditApptModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editApptData, setEditApptData] = useState<Partial<Appointment>>({});

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedItem, setViewedItem] = useState<any>(null);
  const [viewModalTitle, setViewModalTitle] = useState('');

  // --- Filter States ---
  // Appointments
  const [apptStartDate, setApptStartDate] = useState('');
  const [apptEndDate, setApptEndDate] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('All');
  // Prescriptions
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');
  const [prescriptionStatusFilter, setPrescriptionStatusFilter] = useState('All');
  // Invoices
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');


  // --- Fetchers for each section ---

  // Fetch Patient Profile
  const fetchPatientProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/patient/profile?patientId=${currentPatientId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patient profile');
      }
      const data: PatientProfile = await response.json();
      setPatientProfile(data);
    } catch (e: any) {
      console.error("Error fetching patient profile:", e);
      setError(e.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [currentPatientId]);

  // Update Patient Profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/patient/profile?patientId=${currentPatientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      setIsEditProfileModalOpen(false);
      fetchPatientProfile(); // Refresh profile data
    } catch (e: any) {
      console.error("Error updating profile:", e);
      setError(e.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ patientId: currentPatientId });
      if (apptStartDate) query.append('startDate', apptStartDate);
      if (apptEndDate) query.append('endDate', apptEndDate);
      if (apptStatusFilter !== 'All') query.append('status', apptStatusFilter);

      const response = await fetch(`${apiBaseUrl}/patient/appointments?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }
      const data: Appointment[] = await response.json();
      setAppointmentsList(data);
    } catch (e: any) {
      console.error("Error fetching appointments:", e);
      setError(e.message || "Failed to load appointments data.");
    } finally {
      setLoading(false);
    }
  }, [currentPatientId, apptStartDate, apptEndDate, apptStatusFilter]);

  // Update Appointment (e.g., for cancellation)
  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/patient/appointments/${selectedAppointment.id}?patientId=${currentPatientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editApptData.status, notes: editApptData.notes }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment');
      }
      setIsEditApptModalOpen(false);
      fetchAppointments(); // Refresh appointments
    } catch (e: any) {
      console.error("Error updating appointment:", e);
      setError(e.message || "Failed to update appointment.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Prescriptions
  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ patientId: currentPatientId });
      if (prescriptionSearchTerm) query.append('searchTerm', prescriptionSearchTerm);
      if (prescriptionStatusFilter !== 'All') query.append('status', prescriptionStatusFilter);

      const response = await fetch(`${apiBaseUrl}/patient/prescriptions?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch prescriptions');
      }
      const data: Prescription[] = await response.json();
      setPrescriptionsList(data);
    } catch (e: any) {
      console.error("Error fetching prescriptions:", e);
      setError(e.message || "Failed to load prescriptions data.");
    } finally {
      setLoading(false);
    }
  }, [currentPatientId, prescriptionSearchTerm, prescriptionStatusFilter]);

  // Fetch Invoices
  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ patientId: currentPatientId });
      if (invoiceSearchTerm) query.append('searchTerm', invoiceSearchTerm);
      if (invoiceStatusFilter !== 'All') query.append('status', invoiceStatusFilter);

      const response = await fetch(`${apiBaseUrl}/patient/invoices?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoices');
      }
      const data: Invoice[] = await response.json();
      setInvoicesList(data);
    } catch (e: any) {
      console.error("Error fetching invoices:", e);
      setError(e.message || "Failed to load invoices data.");
    } finally {
      setLoading(false);
    }
  }, [currentPatientId, invoiceSearchTerm, invoiceStatusFilter]);


  // Effect to trigger data fetch when tab changes or filters change
  useEffect(() => {
    switch (activeTab) {
      case 'profile':
        fetchPatientProfile();
        break;
      case 'appointments':
        fetchAppointments();
        break;
      case 'prescriptions':
        fetchPrescriptions();
        break;
      case 'invoices':
        fetchInvoices();
        break;
      default:
        break;
    }
  }, [activeTab, fetchPatientProfile, fetchAppointments, fetchPrescriptions, fetchInvoices]);


  // --- Helper Functions ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'DISPENSED':
      case 'PAID': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'PENDING': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'OVERDUE':
      case 'CANCELED':
      case 'EXPIRED': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      case 'CONFIRMED': return 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  const handleViewDetails = (item: any, title: string) => {
    setViewedItem(item);
    setViewModalTitle(title);
    setIsViewModalOpen(true);
  };

  // --- Render Functions for each tab content ---

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Profile</h3>
        {patientProfile ? (
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full object-cover shadow-lg"
                src={patientProfile.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${patientProfile.name ? patientProfile.name.charAt(0) : '?'}${patientProfile.name ? patientProfile.name.charAt(1) : ''}`}
                alt={patientProfile.name}
                onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${patientProfile.name ? patientProfile.name.charAt(0) : '?'}${patientProfile.name ? patientProfile.name.charAt(1) : ''}`; }}
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{patientProfile.name}</p>
              <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center justify-center md:justify-start"><EnvelopeIcon className="w-5 h-5 mr-2" /> {patientProfile.email}</p>
              <p className="text-md text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start"><PhoneIcon className="w-5 h-5 mr-2" /> {patientProfile.phone || 'N/A'}</p>
              <button
                onClick={() => {
                  setEditProfileData({ ...patientProfile });
                  setIsEditProfileModalOpen(true);
                }}
                className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full font-bold shadow-md hover:bg-indigo-700 transition-all duration-300 mx-auto md:mx-0"
              >
                <PencilIcon className="w-5 h-5 mr-2" /> Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No profile data available.</p>
        )}
      </div>

      <AnimatePresence>
        <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="Edit My Profile">
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
            <div>
              <label htmlFor="editProfileName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input type="text" id="editProfileName" value={editProfileData.name || ''} onChange={(e) => setEditProfileData({ ...editProfileData, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="editProfileEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" id="editProfileEmail" value={editProfileData.email || ''} onChange={(e) => setEditProfileData({ ...editProfileData, email: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="editProfilePhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <input type="tel" id="editProfilePhone" value={editProfileData.phone || ''} onChange={(e) => setEditProfileData({ ...editProfileData, phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="editProfilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL</label>
              <input type="url" id="editProfilePicture" value={editProfileData.profilePicture || ''} onChange={(e) => setEditProfileData({ ...editProfileData, profilePicture: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsEditProfileModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save Changes</button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>
    </div>
  );

  const renderAppointmentsSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner mb-4">
        <div>
          <label htmlFor="apptStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
          <input type="date" id="apptStartDate" value={apptStartDate} onChange={(e) => setApptStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
        </div>
        <div>
          <label htmlFor="apptEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
          <input type="date" id="apptEndDate" value={apptEndDate} onChange={(e) => setApptEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
        </div>
        <div>
          <label htmlFor="apptStatusFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select id="apptStatusFilter" value={apptStatusFilter} onChange={(e) => setApptStatusFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white">
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button onClick={fetchAppointments} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Appointments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {appointmentsList.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No appointments found.</td></tr>
              ) : (
                appointmentsList.map(appt => (
                  <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{appt.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{appt.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{appt.date} at {appt.timeSlot}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                        {appt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(appt, `Appointment Details: ${appt.service}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label={`View details for appointment ${appt.id}`}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        {appt.status === 'PENDING' || appt.status === 'CONFIRMED' ? (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setEditApptData({ status: 'CANCELED', notes: '' }); // Pre-fill for cancellation
                              setIsEditApptModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label={`Cancel appointment ${appt.id}`}
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        <Modal isOpen={isEditApptModalOpen} onClose={() => setIsEditApptModalOpen(false)} title={`Update Appointment: ${selectedAppointment?.service || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateAppointment(); }} className="space-y-4">
            <div>
              <label htmlFor="editApptStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select id="editApptStatus" value={editApptData.status || ''} onChange={(e) => setEditApptData({ ...editApptData, status: e.target.value as Appointment['status'] })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
            <div>
              <label htmlFor="editApptNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
              <textarea id="editApptNotes" rows={3} value={editApptData.notes || ''} onChange={(e) => setEditApptData({ ...editApptData, notes: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsEditApptModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save Changes</button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>
    </div>
  );

  const renderPrescriptionsSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
        <div className="relative flex-grow w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search medication or doctor..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={prescriptionSearchTerm}
            onChange={(e) => setPrescriptionSearchTerm(e.target.value)}
            onKeyUp={(e) => { if (e.key === 'Enter') fetchPrescriptions(); }}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <select
          className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={prescriptionStatusFilter}
          onChange={(e) => setPrescriptionStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="DISPENSED">Dispensed</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <button onClick={fetchPrescriptions} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Prescriptions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issued Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {prescriptionsList.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No prescriptions found.</td></tr>
              ) : (
                prescriptionsList.map(rx => (
                  <tr key={rx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rx.doctorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rx.medication}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rx.dosage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rx.issuedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(rx.status)}`}>
                        {rx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(rx, `Prescription Details: ${rx.medication}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label={`View details for prescription ${rx.id}`}
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
    </div>
  );

  const renderInvoicesSection = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner">
        <div className="relative flex-grow w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search invoice ID or items..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={invoiceSearchTerm}
            onChange={(e) => setInvoiceSearchTerm(e.target.value)}
            onKeyUp={(e) => { if (e.key === 'Enter') fetchInvoices(); }}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <select
          className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={invoiceStatusFilter}
          onChange={(e) => setInvoiceStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <button onClick={fetchInvoices} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Invoices</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Invoice Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {invoicesList.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No invoices found.</td></tr>
              ) : (
                invoicesList.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{invoice.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{invoice.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{invoice.dueDate || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(invoice, `Invoice Details: ${invoice.id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label={`View details for invoice ${invoice.id}`}
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
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12 text-blue-600 dark:text-blue-400">
          <svg className="animate-spin h-8 w-8 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading data...
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
      case 'profile':
        return renderProfileSection();
      case 'appointments':
        return renderAppointmentsSection();
      case 'prescriptions':
        return renderPrescriptionsSection();
      case 'invoices':
        return renderInvoicesSection();
      default:
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Select a section above.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } }}
        >
          Patient Dashboard
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.7, ease: "easeOut" } } }}
        >
          Welcome, {patientProfile?.name || 'Loading...'}. Manage your health journey here.
        </motion.p>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.5 } } }}
        >
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <UserCircleIcon className="w-5 h-5 mr-2" /> My Profile
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'appointments' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <CalendarDaysIcon className="w-5 h-5 mr-2" /> My Appointments
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'prescriptions' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" /> My Prescriptions
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <CreditCardIcon className="w-5 h-5 mr-2" /> My Invoices
            </button>
          </div>

          {/* Render content based on active tab */}
          {renderContent()}

        </motion.div>
      </div>

      {/* Reusable View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && viewedItem && (
          <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={viewModalTitle}>
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              {Object.entries(viewedItem).map(([key, value]) => {
                // Skip internal Prisma keys or sensitive IDs unless explicitly needed for display
                if (key.startsWith('_') || key.endsWith('Id') || key === 'createdAt' || key === 'updatedAt' || key === 'companyId' || key === 'userId') return null;

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
                } else if (key.includes('Date') && typeof value === 'string') {
                    displayValue = new Date(value).toLocaleDateString(); // Format dates nicely
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
