"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  PencilIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { useParams } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// ---------- Types ----------
type AppointmentStatus = "SCHEDULED" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

interface Client {
  id: string;
  user: {
    id: string;
    name: string;
  };
}

interface Expert {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  clientId: string;
  expertId: string;
  date: string; // ISO string
  notes?: string;
  status: AppointmentStatus;
  client: Client;
  expert: Expert;
}

interface AppointmentFormState {
  clientId: string;
  expertId: string;
  date: string;
  time: string;
  notes: string;
  status: AppointmentStatus;
}

interface PageProps {
  params:Promise<{ slug: string }>
}

interface AppointmentStatusBadgeProps {
  status: AppointmentStatus;
}

// ---------- Components ----------
const AppointmentStatusBadge: React.FC<AppointmentStatusBadgeProps> = ({
  status,
}) => {
  let colorClass = "";
  let Icon = CalendarDaysIcon;

  switch (status) {
    case "CONFIRMED":
      colorClass = "bg-green-600 text-green-100";
      Icon = CheckCircleIcon;
      break;
    case "SCHEDULED":
      colorClass = "bg-blue-600 text-blue-100";
      Icon = CalendarDaysIcon;
      break;
    case "CANCELLED":
      colorClass = "bg-red-600 text-red-100";
      Icon = XCircleIcon;
      break;
    case "COMPLETED":
      colorClass = "bg-gray-600 text-gray-100";
      Icon = CheckCircleIcon;
      break;
    default:
      colorClass = "bg-gray-600 text-gray-100";
      Icon = ExclamationCircleIcon;
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${colorClass}`}
    >
      <Icon className="h-4 w-4 mr-1" /> {status}
    </span>
  );
};

// ---------- Main Page ----------
export default function AppointmentsPage() {
  
  const params = useParams();
  const companyId = params.slug as string;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentAppointment, setCurrentAppointment] =
    useState<Appointment | null>(null);

  const [formState, setFormState] = useState<AppointmentFormState>({
    clientId: "",
    expertId: "",
    date: "",
    time: "",
    notes: "",
    status: "SCHEDULED",
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<Expert[]>([]);

  // ---------- API Fetch ----------
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/finance-appointments?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const dataRes= await res.json();
      const data: Appointment[] = dataRes.data || [];
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientsAndUsers = async () => {
    try {
      const [clientsRes, usersRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/finance-clients?companyId=${companyId}`,
          { headers: { 'Credentials': 'include' } }
        ),
        fetch(`${apiBaseUrl}/admin/experts?companyId=${companyId}`,
          { headers: { 'Credentials': 'include' } }
        ),
      ]);

      if (!clientsRes.ok || !usersRes.ok)
        throw new Error("Failed to fetch clients or users");

      const clientsData = (await clientsRes.json()).data;
      const usersData = (await usersRes.json()).data.data;

      setClients(clientsData);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching clients and users:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchClientsAndUsers();
  }, []);

  // ---------- Handlers ----------
  const handleOpenModal = (appointment: Appointment | null = null) => {
    if (appointment) {
      setIsEditing(true);
      setCurrentAppointment(appointment);
      const [date, time] = appointment.date.split("T");
      setFormState({
        clientId: appointment.clientId,
        expertId: appointment.expertId,
        date: date,
        time: time.slice(0, 5),
        notes: appointment.notes || "",
        status: appointment.status,
      });
    } else {
      setIsEditing(false);
      setCurrentAppointment(null);
      setFormState({
        clientId: "",
        expertId: "",
        date: "",
        time: "",
        notes: "",
        status: "SCHEDULED",
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.currentTarget;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullDate = `${formState.date}T${formState.time}:00.000Z`;
    const appointmentData = { ...formState, date: fullDate };

    try {
      const res = await fetch(
        isEditing
          ? `${apiBaseUrl}/admin/finance-appointments/${currentAppointment?.id}`
          : `${apiBaserUrl}/admin/finance-appointments",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", 'Credentials': 'include' },
          body: JSON.stringify({ ...appointmentData, companyId }),
        }
      );

      if (!res.ok) throw new Error("Failed to save appointment");

      await fetchAppointments();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      setLoading(true);
      try {
        const res = await fetch(`${apiBaseUrl}/admin/finance-appointments/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete appointment");
        await fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointment:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // ---------- Render ----------
  return (
    <div className="p-6">
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-gray-900 min-h-screen text-gray-100 font-sans"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-2">Appointment Schedule</h1>
          <p className="text-gray-400">Manage all client and expert appointments here.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Schedule New
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-gray-400">
          <ArrowPathIcon className="h-8 w-8 animate-spin mr-3" />
          Loading appointments...
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Table View for larger screens */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Expert</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {appointments.length > 0 && appointments.map((appointment) => (
                    <motion.tr
                      key={appointment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{appointment.client.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{appointment.expert.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(appointment.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(appointment.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <AppointmentStatusBadge status={appointment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <motion.button
                            onClick={() => handleOpenModal(appointment)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(appointment.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Card View for mobile screens */}
          <div className="md:hidden p-4 space-y-4">
            <AnimatePresence>
              {appointments.length > 0 && appointments.map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-700 rounded-lg p-4 shadow-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-lg font-bold text-white truncate">{appointment.client.user.name}</h4>
                    </div>
                    <AppointmentStatusBadge status={appointment.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{new Date(appointment.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-2" />
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <PencilIcon className="h-4 w-4 mr-2" />
                      <span>Expert: {appointment.expert.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-2">
                    <motion.button
                      onClick={() => handleOpenModal(appointment)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(appointment.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-full bg-gray-600 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modal for Scheduling/Editing an Appointment */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-gray-100 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">{isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-700">
                  <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="clientId" className="block text-sm font-medium text-gray-400">Client</label>
                    <select
                      id="clientId"
                      name="clientId"
                      value={formState.clientId}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select a client...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expertId" className="block text-sm font-medium text-gray-400">Expert</label>
                    <select
                      id="expertId"
                      name="expertId"
                      value={formState.expertId}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select an expert...</option>
                      {users.map(expert => (
                        <option key={expert.id} value={expert.id}>{expert.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-400">Date</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formState.date}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-400">Time</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={formState.time}
                      onChange={handleFormChange}
                      required
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                {isEditing && (
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-400">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formState.status}
                      onChange={handleFormChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                )}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-400">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    // rows="3"
                    value={formState.notes}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    {isEditing ? 'Save Changes' : 'Schedule Appointment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Appointments</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add Appointment
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {appointments.length > 0 && appointments.map((appt) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 border rounded-md shadow-sm bg-white"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{appt.client.user.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(appt.date).toLocaleString()}
                  </p>
                </div>
                <AppointmentStatusBadge status={appt.status} />
              </div>
              <div className="mt-2 text-sm text-gray-600">{appt.notes}</div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => handleOpenModal(appt)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(appt.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg"
            >
              <h2 className="text-lg font-bold mb-4">
                {isEditing ? "Edit Appointment" : "Add Appointment"}
              </h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Client</label>
                  <select
                    name="clientId"
                    value={formState.clientId}
                    onChange={handleFormChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Expert</label>
                  <select
                    name="expertId"
                    value={formState.expertId}
                    onChange={handleFormChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select expert</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formState.date}
                      onChange={handleFormChange}
                      required
                      className="w-full border rounded p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={formState.time}
                      onChange={handleFormChange}
                      required
                      className="w-full border rounded p-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <textarea
                    name="notes"
                    value={formState.notes}
                    onChange={handleFormChange}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={formState.status}
                    onChange={handleFormChange}
                    required
                    className="w-full border rounded p-2"
                  >
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    {isEditing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
