// app/admin/[adminSlug]/appointments/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';

// Placeholder data for clients and experts
// In a real app, these would be fetched from your API
const mockClients = [
  { id: 'cl1', name: 'Alice Johnson' },
  { id: 'cl2', name: 'Bob Williams' },
  { id: 'cl3', name: 'Charlie Davis' },
];

const mockExperts = [
  { id: 'exp1', name: 'Dr. Evelyn Reed' },
  { id: 'exp2', name: 'Mr. Benjamin Carter' },
  { id: 'exp3', name: 'Ms. Olivia Hayes' },
  { id: 'exp4', name: 'Mr. Alex Thorne' },
];

const AppointmentStatusBadge = ({ status }) => {
  let colorClass = '';
  let Icon = CalendarDaysIcon;

  switch (status) {
    case 'CONFIRMED':
      colorClass = 'bg-green-600 text-green-100';
      Icon = CheckCircleIcon;
      break;
    case 'SCHEDULED':
      colorClass = 'bg-blue-600 text-blue-100';
      Icon = CalendarDaysIcon;
      break;
    case 'CANCELLED':
      colorClass = 'bg-red-600 text-red-100';
      Icon = XCircleIcon;
      break;
    case 'COMPLETED':
      colorClass = 'bg-gray-600 text-gray-100';
      Icon = CheckCircleIcon;
      break;
    default:
      colorClass = 'bg-gray-600 text-gray-100';
      Icon = ExclamationCircleIcon;
      break;
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase ${colorClass}`}>
      <Icon className="h-4 w-4 mr-1" /> {status}
    </span>
  );
};

interface PageProps {
  params: {
    slug: string; // This will be the companyId
  };
}


export default function AppointmentsPage({ params }: PageProps) {
  const companyId = params.slug;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [formState, setFormState] = useState({
    clientId: '',
    expertId: '',
    date: '',
    time: '',
    notes: '',
    status: 'SCHEDULED'
  });
  
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance-appointments?companyId=${companyId}`);
      const data = await res.json();
      console.log(data);
      setAppointments(data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  
    const fetchClientsAndUsers = async () => {
      try {
        const clientsRes = await fetch(`/api/admin/finance-clients?companyId=${companyId}`);
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients);
  
        const usersRes = await fetch(`/api/admin/experts?companyId=${companyId}`); // Assuming you have a /api/users endpoint
        const usersData = await usersRes.json();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching clients or users:', error);
      }
    };
  
    useEffect(() => {
      fetchAppointments();
      fetchClientsAndUsers();
    }, []);
  



  const handleOpenModal = (appointment = null) => {
    if (appointment) {
      setIsEditing(true);
      setCurrentAppointment(appointment);
      const [date, time] = appointment.date.split('T');
      setFormState({
        clientId: appointment.clientId,
        expertId: appointment.expertId,
        date: date,
        time: time.slice(0, 5),
        notes: appointment.notes || '',
        status: appointment.status,
      });
    } else {
      setIsEditing(false);
      setCurrentAppointment(null);
      setFormState({
        clientId: '',
        expertId: '',
        date: '',
        time: '',
        notes: '',
        status: 'SCHEDULED'
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fullDate = `${formState.date}T${formState.time}:00.000Z`;
    const appointmentData = {
      ...formState,
      date: fullDate,
    };

    try {
      const res = await fetch(isEditing ? `/api/admin/finance-appointments/${currentAppointment.id}` : '/api/admin/finance-appointments', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...appointmentData,companyId}),
      });

      if (!res.ok) throw new Error('Failed to save appointment');

      await fetchAppointments();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/finance-appointments/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete appointment');
        await fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
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
                    rows="3"
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
  );
}
