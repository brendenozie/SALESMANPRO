// app/admin/[adminSlug]/appointments/AdminAppointmentsClient.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon, PlusCircleIcon, PencilIcon, TrashIcon,
  EyeIcon, UserIcon, XMarkIcon
} from "@heroicons/react/24/solid";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "127.0.0.1:3000/api";

// Types
// Define the Appointment interface based on the expected data from the backend
interface Appointment {
  id: string;
  patientName: string;
  doctorId: string; // Doctor's ID from the Doctor model
  doctorName: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM AM/PM
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED'; // Matches Prisma enum
  service: string;
  userId: string; // Patient's User ID
  createdAt: string; // Formatted date string
}

// Interface for Patient options in dropdowns
interface PatientOption {
  id: string; // Consumer ID
  name: string;
  userId: string; // Corresponding User ID
}

// Interface for Doctor options in dropdowns
interface DoctorOption {
  id: string; // Doctor ID
  name: string;
  userId: string; // Corresponding User ID
}

interface Props {
  companyId: string;
  initialAppointments: Appointment[];
  initialPatients: PatientOption[];
  initialDoctors: DoctorOption[];
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// Custom Modal Component (re-used from Patient Management)
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
      variants={modalVariants}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative"
        variants={modalVariants}
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

export default function AdminAppointmentsClient({
  companyId,
  initialAppointments,
  initialPatients,
  initialDoctors,
}: Props) {

  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  // ✅ Example client-side filtering (fast, no refetch needed for search)
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch = a.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const [patients, setPatients] = useState<PatientOption[]>(initialPatients);
  const [doctors, setDoctors] = useState<DoctorOption[]>(initialDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | Appointment['status']>('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);


  const [newAppointmentData, setNewAppointmentData] = useState({
    userId: '', // Patient's User ID
    doctorId: '', // Doctor's ID
    service: '',
    date: '', // YYYY-MM-DD
    time: '', // HH:MM (24-hour format for input)
    status: 'PENDING' as Appointment['status'],
  });

  const [editAppointmentData, setEditAppointmentData] = useState<Partial<Appointment>>({});
  
  const handleAddAppointmentClick = () => {
    setNewAppointmentData({
      userId: '',
      doctorId: '',
      service: '',
      date: '',
      time: '',
      status: 'PENDING',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    // Format date and time for input fields
    const formattedDate = appointment.date; // Already YYYY-MM-DD
    // Convert HH:MM AM/PM to HH:MM (24-hour) for input type="time"
    const [timePart, ampm] = appointment.time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0; // Midnight
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    setEditAppointmentData({
      ...appointment,
      date: formattedDate,
      time: formattedTime,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteConfirmOpen(true);
  };

  const handleView = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsViewModalOpen(true);
  };

  // Fetch appointments from the backend API
  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = filterStatus === 'All' ? '' : `&filterStatus=${filterStatus}`;
      const response = await fetch(`${apiBaseUrl}/admin/appointments?companyId=${companyId}&searchTerm=${encodeURIComponent(searchTerm)}${statusParam}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch appointments');
      }
      const data: Appointment[] = await response.json();
      setAppointments(data);
    } catch (e: any) {
      console.error("Error fetching appointments:", e);
      setError(e.message || "Failed to load appointment data.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of patients (consumers) for dropdown
  const fetchPatientsList = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/patients?companyId=${companyId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch patients list');
      }
      const data: PatientOption[] = await response.json();
      setPatients(data.map(p => ({ id: p.id, name: p.name, userId: p.userId }))); // Map to PatientOption
    } catch (e: any) {
      console.error("Error fetching patients list:", e);
      // Don't set global error, just log for dropdowns
    }
  };

  // Fetch list of doctors for dropdown
  const fetchDoctorsList = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/admin/doctors?companyId=${companyId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch doctors list');
      }
      const data: DoctorOption[] = await response.json();
      setDoctors(data);
    } catch (e: any) {
      console.error("Error fetching doctors list:", e);
      // Don't set global error, just log for dropdowns
    }
  };

  // CRUD operations via API
  const addNewAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newAppointmentData, companyId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add appointment');
      }

      setIsAddModalOpen(false);
      fetchAppointments(); // Refresh list
    } catch (e: any) {
      console.error("Error adding appointment:", e);
      setError(e.message || "Failed to add new appointment.");
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async () => {
    if (!selectedAppointment) {
      setError("No appointment selected for update.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editAppointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment');
      }

      setIsEditModalOpen(false);
      fetchAppointments(); // Refresh list
    } catch (e: any) {
      console.error("Error updating appointment:", e);
      setError(e.message || "Failed to update appointment.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteAppointment = async () => {
    if (!selectedAppointment) {
      setError("No appointment selected for deletion.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/admin/appointments/${selectedAppointment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete appointment');
      }

      setIsDeleteConfirmOpen(false);
      fetchAppointments(); // Refresh list
    } catch (e: any) {
      console.error("Error deleting appointment:", e);
      setError(e.message || "Failed to delete appointment.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900';
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900';
      case 'COMPLETED': return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900';
      case 'CANCELED': return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          Appointment Schedule
        </motion.h1>
        <motion.p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          Manage and track all patient appointments.
        </motion.p>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="relative flex-grow w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'All' | Appointment['status'])}
            >
              <option value="All">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELED">Cancelled</option>
            </select>
            <button
              onClick={handleAddAppointmentClick}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-full font-bold shadow-md hover:from-teal-600 hover:to-blue-700 transition-all duration-300"
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Appointment
            </button>
          </div>

          {loading && (
            <div className="text-center py-8 text-blue-600 dark:text-blue-400">Loading appointments...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600 dark:text-red-400">{error}</div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-xl">Patient</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Service</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3 rounded-tr-xl">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500 dark:text-gray-400">
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="w-6 h-6 text-gray-500 mr-2" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{appt.patientName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UserIcon className="w-6 h-6 text-gray-500 mr-2" />
                            <div className="text-sm text-gray-900 dark:text-white">{appt.doctorName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{appt.date}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{appt.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {appt.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appt.status)}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleView(appt)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`View ${appt.patientName}'s appointment`}
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(appt)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Edit ${appt.patientName}'s appointment`}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(appt)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-2 rounded-full hover:bg-red-50 dark:hover:bg-gray-700 transition-colors"
                              aria-label={`Delete ${appt.patientName}'s appointment`}
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      
    {/* Add Appointment Modal */}
      <AnimatePresence>
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule New Appointment">
          <form onSubmit={(e) => { e.preventDefault(); addNewAppointment(); }} className="space-y-4">
            <div>
              <label htmlFor="newPatient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
              <select
                id="newPatient"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newAppointmentData.userId}
                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, userId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p.id} value={p.userId}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="newDoctor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
              <select
                id="newDoctor"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newAppointmentData.doctorId}
                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, doctorId: e.target.value })}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.length > 0 && doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="newService" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
              <input
                type="text"
                id="newService"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newAppointmentData.service}
                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, service: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  id="newDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newAppointmentData.date}
                  onChange={(e) => setNewAppointmentData({ ...newAppointmentData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="newTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                <input
                  type="time"
                  id="newTime"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={newAppointmentData.time}
                  onChange={(e) => setNewAppointmentData({ ...newAppointmentData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="newStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={newAppointmentData.status}
                onChange={(e) => setNewAppointmentData({ ...newAppointmentData, status: e.target.value as Appointment['status'] })}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Add Appointment
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Edit Appointment Modal */}
      <AnimatePresence>
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Appointment: ${selectedAppointment?.patientName || ''}`}>
          <form onSubmit={(e) => { e.preventDefault(); updateAppointment(); }} className="space-y-4">
            <div>
              <label htmlFor="editPatient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Patient</label>
              <select
                id="editPatient"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editAppointmentData.userId || ''}
                onChange={(e) => setEditAppointmentData({ ...editAppointmentData, userId: e.target.value })}
                required
              >
                <option value="">Select Patient</option>
                {patients.length > 0 ? (
                  patients.map(p => (
                    <option key={p.id} value={p.userId}>{p.name}</option>
                  ))
                ) : (
                  <option value="">No Patients Available</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="editDoctor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Doctor</label>
              <select
                id="editDoctor"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editAppointmentData.doctorId || ''}
                onChange={(e) => setEditAppointmentData({ ...editAppointmentData, doctorId: e.target.value })}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.length > 0 ? (
                  doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))
                ) : (
                  <option value="">No Doctors Available</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="editService" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
              <input
                type="text"
                id="editService"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editAppointmentData.service || ''}
                onChange={(e) => setEditAppointmentData({ ...editAppointmentData, service: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  id="editDate"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editAppointmentData.date || ''}
                  onChange={(e) => setEditAppointmentData({ ...editAppointmentData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="editTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                <input
                  type="time"
                  id="editTime"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={editAppointmentData.time || ''}
                  onChange={(e) => setEditAppointmentData({ ...editAppointmentData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                id="editStatus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={editAppointmentData.status || ''}
                onChange={(e) => setEditAppointmentData({ ...editAppointmentData, status: e.target.value as Appointment['status'] })}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELED">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete the appointment for <span className="font-bold">{selectedAppointment?.patientName}</span> with <span className="font-bold">{selectedAppointment?.doctorName}</span> on {selectedAppointment?.date} at {selectedAppointment?.time}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeleteAppointment}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      </AnimatePresence>

      {/* View Appointment Details Modal */}
      <AnimatePresence>
        <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Appointment Details: ${selectedAppointment?.patientName || ''}`}>
          {selectedAppointment && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              <p><strong>Patient:</strong> {selectedAppointment.patientName}</p>
              <p><strong>Doctor:</strong> {selectedAppointment.doctorName}</p>
              <p><strong>Service:</strong> {selectedAppointment.service}</p>
              <p><strong>Date:</strong> {selectedAppointment.date}</p>
              <p><strong>Time:</strong> {selectedAppointment.time}</p>
              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedAppointment.status)}`}>{selectedAppointment.status}</span></p>
              <p><strong>Appointment ID:</strong> {selectedAppointment.id}</p>
              <p><strong>Created At:</strong> {selectedAppointment.createdAt}</p>
            </div>
          )}
        </Modal>
      </AnimatePresence>
    </div>

  );
}
