"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon, UsersIcon, CalendarDaysIcon, DocumentTextIcon, CubeTransparentIcon,
  MagnifyingGlassIcon, PencilIcon, EyeIcon, XMarkIcon, CheckCircleIcon, ExclamationCircleIcon,
  ClockIcon, CurrencyDollarIcon, TagIcon, BriefcaseIcon // Added for clarity
} from '@heroicons/react/24/solid';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";;//process.env.NEXT_PUBLIC_API_URL || "/api";

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

interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  specialty: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

interface Patient {
  id: string; // Consumer ID or User ID
  userId: string; // User ID
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  doctorName: string; // Should be current doctor's name, but included for consistency
  service: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
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

interface ProductUsed {
  id: string; // Product ID
  name: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  lastUsedDate: string; // YYYY-MM-DD
}

// interface PageProps {
//   params: Promise<{
//     slug: string;
//   }>;
// }

interface PageProps {
  params: {
    slug: string;
  };
}

// --- Main DoctorDashboardPage Component ---
export default async function DoctorDashboardPage({ params }: PageProps) {
  // In a real app, doctorId would come from authenticated session
  // For demo, we'll use a placeholder or derive from params if it's the doctor's actual ID
  const { slug : currentDoctorId } = await params; // Assuming doctorSlug is the actual Doctor ID
  // const currentDoctorId = await params.slug; 

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'patients', 'appointments', 'prescriptions', 'products-used'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data States ---
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [patientsList, setPatientsList] = useState<Patient[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [prescriptionsList, setPrescriptionsList] = useState<Prescription[]>([]);
  const [productsUsedList, setProductsUsedList] = useState<ProductUsed[]>([]);

  // --- Modal States ---
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState<Partial<DoctorProfile>>({});

  const [isEditApptModalOpen, setIsEditApptModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [editApptData, setEditApptData] = useState<Partial<Appointment>>({});

  const [isEditPrescriptionModalOpen, setIsEditPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [editPrescriptionData, setEditPrescriptionData] = useState<Partial<Prescription>>({});

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewedItem, setViewedItem] = useState<any>(null);
  const [viewModalTitle, setViewModalTitle] = useState('');

  // --- Filter States ---
  // Patients
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  // Appointments
  const [apptStartDate, setApptStartDate] = useState('');
  const [apptEndDate, setApptEndDate] = useState('');
  const [apptStatusFilter, setApptStatusFilter] = useState('All');
  // Prescriptions
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');
  const [prescriptionStatusFilter, setPrescriptionStatusFilter] = useState('All');
  // Products Used
  const [productsUsedStartDate, setProductsUsedStartDate] = useState('');
  const [productsUsedEndDate, setProductsUsedEndDate] = useState('');
  const [productsUsedSearchTerm, setProductsUsedSearchTerm] = useState('');


  // --- Fetchers for each section ---

  // Fetch Doctor Profile
  const fetchDoctorProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/doctor/profile?doctorId=${currentDoctorId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch doctor profile');
      }
      const data: DoctorProfile = await response.json();
      setDoctorProfile(data);
    } catch (e: any) {
      console.error("Error fetching doctor profile:", e);
      setError(e.message || "Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [currentDoctorId]);

  // Update Doctor Profile
  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/doctor/profile?doctorId=${currentDoctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfileData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      setIsEditProfileModalOpen(false);
      fetchDoctorProfile(); // Refresh profile data
    } catch (e: any) {
      console.error("Error updating profile:", e);
      setError(e.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Patients
  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ doctorId: currentDoctorId });
      if (patientSearchTerm) query.append('searchTerm', patientSearchTerm);

      const response = await fetch(`${apiBaseUrl}/doctor/patients?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patients');
      }
      const data: Patient[] = await response.json();
      setPatientsList(data);
    } catch (e: any) {
      console.error("Error fetching patients:", e);
      setError(e.message || "Failed to load patients data.");
    } finally {
      setLoading(false);
    }
  }, [currentDoctorId, patientSearchTerm]);

  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ doctorId: currentDoctorId });
      if (apptStartDate) query.append('startDate', apptStartDate);
      if (apptEndDate) query.append('endDate', apptEndDate);
      if (apptStatusFilter !== 'All') query.append('status', apptStatusFilter);

      const response = await fetch(`${apiBaseUrl}/doctor/appointments?${query.toString()}`);
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
  }, [currentDoctorId, apptStartDate, apptEndDate, apptStatusFilter]);

  // Update Appointment
  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/doctor/appointments/${selectedAppointment.id}?doctorId=${currentDoctorId}`, {
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
      const query = new URLSearchParams({ doctorId: currentDoctorId });
      if (prescriptionSearchTerm) query.append('searchTerm', prescriptionSearchTerm);
      if (prescriptionStatusFilter !== 'All') query.append('status', prescriptionStatusFilter);

      const response = await fetch(`${apiBaseUrl}/doctor/prescriptions?${query.toString()}`);
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
  }, [currentDoctorId, prescriptionSearchTerm, prescriptionStatusFilter]);

  // Update Prescription
  const handleUpdatePrescription = async () => {
    if (!selectedPrescription) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/doctor/prescriptions/${selectedPrescription.id}?doctorId=${currentDoctorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editPrescriptionData.status,
          notes: editPrescriptionData.notes,
          instructions: editPrescriptionData.instructions,
          expiryDate: editPrescriptionData.expiryDate,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prescription');
      }
      setIsEditPrescriptionModalOpen(false);
      fetchPrescriptions(); // Refresh prescriptions
    } catch (e: any) {
      console.error("Error updating prescription:", e);
      setError(e.message || "Failed to update prescription.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Products Used
  const fetchProductsUsed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ doctorId: currentDoctorId });
      if (productsUsedStartDate) query.append('startDate', productsUsedStartDate);
      if (productsUsedEndDate) query.append('endDate', productsUsedEndDate);
      if (productsUsedSearchTerm) query.append('searchTerm', productsUsedSearchTerm);

      const response = await fetch(`${apiBaseUrl}/doctor/products-used?${query.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch products used');
      }
      const data: ProductUsed[] = await response.json();
      setProductsUsedList(data);
    } catch (e: any) {
      console.error("Error fetching products used:", e);
      setError(e.message || "Failed to load products used data.");
    } finally {
      setLoading(false);
    }
  }, [currentDoctorId, productsUsedStartDate, productsUsedEndDate, productsUsedSearchTerm]);


  // Effect to trigger data fetch when tab changes or filters change
  useEffect(() => {
    switch (activeTab) {
      case 'profile':
        fetchDoctorProfile();
        break;
      case 'patients':
        fetchPatients();
        break;
      case 'appointments':
        fetchAppointments();
        break;
      case 'prescriptions':
        fetchPrescriptions();
        break;
      case 'products-used':
        fetchProductsUsed();
        break;
      default:
        break;
    }
  }, [activeTab, fetchDoctorProfile, fetchPatients, fetchAppointments, fetchPrescriptions, fetchProductsUsed]);


  // --- Helper Functions ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'DISPENSED': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'ON_LEAVE':
      case 'PENDING': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'INACTIVE':
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
        {doctorProfile ? (
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <img
                className="h-24 w-24 rounded-full object-cover shadow-lg"
                src={doctorProfile.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${doctorProfile.name ? doctorProfile.name.charAt(0) : '?'}${doctorProfile.name ? doctorProfile.name.charAt(1) : ''}`}
                alt={doctorProfile.name}
                onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${doctorProfile.name ? doctorProfile.name.charAt(0) : '?'}${doctorProfile.name ? doctorProfile.name.charAt(1) : ''}`; }}
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{doctorProfile.name}</p>
              <p className="text-lg text-gray-700 dark:text-gray-300">{doctorProfile.specialty}</p>
              <p className="text-md text-gray-500 dark:text-gray-400">Email: {doctorProfile.email}</p>
              <p className="text-md text-gray-500 dark:text-gray-400">Phone: {doctorProfile.phone || 'N/A'}</p>
              <p className="text-md text-gray-500 dark:text-gray-400">Status: <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(doctorProfile.status)}`}>{doctorProfile.status}</span></p>
              <button
                onClick={() => {
                  setEditProfileData({ ...doctorProfile });
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
            <div>
              <label htmlFor="editProfileSpecialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specialty</label>
              <input type="text" id="editProfileSpecialty" value={editProfileData.specialty || ''} onChange={(e) => setEditProfileData({ ...editProfileData, specialty: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="editProfileStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select id="editProfileStatus" value={editProfileData.status || ''} onChange={(e) => setEditProfileData({ ...editProfileData, status: e.target.value as DoctorProfile['status'] })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
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

  const renderPatientsSection = () => (
    <div className="space-y-6">
      <div className="relative flex-grow w-full mb-4">
        <input
          type="text"
          placeholder="Search patients by name or email..."
          className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={patientSearchTerm}
          onChange={(e) => setPatientSearchTerm(e.target.value)}
          onKeyUp={(e) => { if (e.key === 'Enter') fetchPatients(); }} // Trigger search on Enter
        />
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <button onClick={fetchPatients} className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200">Search</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Patients</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {patientsList.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No patients found.</td></tr>
              ) : (
                patientsList.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={patient.profilePicture || `https://placehold.co/100x100/A7F3D0/0D9488?text=${patient.name ? patient.name.charAt(0) : '?'}${patient.name ? patient.name.charAt(1) : ''}`}
                            alt={patient.name}
                            onError={(e) => { e.currentTarget.src = `https://placehold.co/100x100/A7F3D0/0D9488?text=${patient.name ? patient.name.charAt(0) : '?'}${patient.name ? patient.name.charAt(1) : ''}`; }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{patient.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">ID: {patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {patient.email} {patient.phone && `(${patient.phone})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(patient, `Patient Details: ${patient.name}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label={`View details for ${patient.name}`}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{appt.patientName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{appt.patientEmail}</div>
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
                          onClick={() => handleViewDetails(appt, `Appointment Details: ${appt.patientName}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label={`View details for appointment ${appt.id}`}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setEditApptData({ status: appt.status, notes: appt.notes });
                            setIsEditApptModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label={`Edit appointment ${appt.id}`}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
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
        <Modal isOpen={isEditApptModalOpen} onClose={() => setIsEditApptModalOpen(false)} title={`Update Appointment: ${selectedAppointment?.patientName || ''}`}>
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
            placeholder="Search prescriptions..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Issued Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {prescriptionsList.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No prescriptions found.</td></tr>
              ) : (
                prescriptionsList.map(rx => (
                  <tr key={rx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{rx.patientName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rx.medication}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rx.dosage}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rx.issuedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(rx.status)}`}>
                        {rx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(rx, `Prescription Details: ${rx.medication}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label={`View details for prescription ${rx.id}`}
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrescription(rx);
                            setEditPrescriptionData({ ...rx });
                            setIsEditPrescriptionModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                          aria-label={`Edit prescription ${rx.id}`}
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
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
        <Modal isOpen={isEditPrescriptionModalOpen} onClose={() => setIsEditPrescriptionModalOpen(false)} title={`Edit Prescription: ${selectedPrescription?.medication || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdatePrescription(); }} className="space-y-4">
            <div>
              <label htmlFor="editRxMedication" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medication</label>
              <input type="text" id="editRxMedication" value={editPrescriptionData.medication || ''} onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, medication: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="editRxDosage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dosage</label>
              <input type="text" id="editRxDosage" value={editPrescriptionData.dosage || ''} onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, dosage: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="editRxInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructions (Optional)</label>
              <textarea id="editRxInstructions" rows={2} value={editPrescriptionData.instructions || ''} onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, instructions: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            <div>
              <label htmlFor="editRxIssuedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issued Date</label>
              <input type="date" id="editRxIssuedDate" value={editPrescriptionData.issuedDate || ''} onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, issuedDate: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
            </div>
            <div>
              <label htmlFor="editRxExpiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiry Date (Optional)</label>
              <input type="date" id="editRxExpiryDate" value={editPrescriptionData.expiryDate || ''} onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, expiryDate: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="editRxNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</label>
              <textarea id="editRxNotes" rows={2} value={editPrescriptionData.notes || ''} onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, notes: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            <div>
              <label htmlFor="editRxStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select id="editRxStatus" value={editPrescriptionData.status || ''} onChange={(e) => setEditPrescriptionData({ ...editPrescriptionData, status: e.target.value as Prescription['status'] })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
                <option value="PENDING">Pending</option>
                <option value="DISPENSED">Dispensed</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setIsEditPrescriptionModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save Changes</button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>
    </div>
  );

  const renderProductsUsedSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-inner mb-4">
        <div>
          <label htmlFor="productsUsedStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
          <input type="date" id="productsUsedStartDate" value={productsUsedStartDate} onChange={(e) => setProductsUsedStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
        </div>
        <div>
          <label htmlFor="productsUsedEndDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
          <input type="date" id="productsUsedEndDate" value={productsUsedEndDate} onChange={(e) => setProductsUsedEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white" />
        </div>
        <div className="relative flex-grow">
          <label htmlFor="productsUsedSearchTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Product</label>
          <input
            type="text"
            placeholder="Search product name or category..."
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={productsUsedSearchTerm}
            onChange={(e) => setProductsUsedSearchTerm(e.target.value)}
            onKeyUp={(e) => { if (e.key === 'Enter') fetchProductsUsed(); }}
          />
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button onClick={fetchProductsUsed} className="px-6 py-2 bg-blue-600 text-white rounded-full font-bold shadow-md hover:bg-blue-700 transition-colors">Apply Filters</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Products Used in My Appointments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Quantity Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Revenue Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Used Date</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {productsUsedList.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No products used data found.</td></tr>
              ) : (
                productsUsedList.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{product.totalQuantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${product.totalRevenue.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.lastUsedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(product, `Product Details: ${product.name}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        aria-label={`View details for ${product.name}`}
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
      case 'patients':
        return renderPatientsSection();
      case 'appointments':
        return renderAppointmentsSection();
      case 'prescriptions':
        return renderPrescriptionsSection();
      case 'products-used':
        return renderProductsUsedSection();
      default:
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Select a section above.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0, y: -50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } }}
        >
          Doctor Dashboard
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.7, ease: "easeOut" } } }}
        >
          Welcome, Dr. {doctorProfile?.name || 'Loading...'}. Manage your practice with ease.
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
              onClick={() => setActiveTab('patients')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'patients' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <UsersIcon className="w-5 h-5 mr-2" /> My Patients
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
              onClick={() => setActiveTab('products-used')}
              className={`flex items-center px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 ${activeTab === 'products-used' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <CubeTransparentIcon className="w-5 h-5 mr-2" /> Products Used
            </button>
          </div>

          {/* Render content based on active tab */}
          {renderContent()}

        </motion.div>
      </div>

      {/* Reusable View Details Modal (for patients, products used, etc.) */}
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
