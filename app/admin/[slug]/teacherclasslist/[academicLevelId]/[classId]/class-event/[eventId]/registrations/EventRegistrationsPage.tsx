'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeftIcon,
  MagnifyingGlassIcon,
  UserCircleIcon, // For user/registrant
  CalendarDaysIcon, // For event
  CheckCircleIcon, // For REGISTERED status
  ClockIcon, // For WAITLISTED status
  XMarkIcon, // For CANCELLED status, and closing modals/errors
  PlusCircleIcon, // For add registration
  PencilIcon, // For edit registration
  TrashIcon, // For delete registration
  UsersIcon, // For total registrations
  UserPlusIcon, // For new registrations
  ArrowPathIcon,
  MapPinIcon,
  UserGroupIcon,
  UserIcon, // For attended status (or re-register)
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Type Definitions (Aligned with EventRegistration API Response) ---
export type EventRegistrationData = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventStartDateTime: string | null;
  eventEndDateTime: string | null;
  eventLocation: string | null;
  eventCompanyId: string;
  userId: string; // The user who registered
  userName: string;
  userEmail: string;
  studentId: string | null; // The student being registered (if applicable)
  studentName: string | null;
  studentEmail: string | null;
  registeredAt: string; // ISO string
  status: 'REGISTERED' | 'ATTENDED' | 'CANCELLED' | 'WAITLISTED';
};

export type EventDetailsForRegistrationPage = {
  id: string;
  title: string;
  startDateTime: string;
  endDateTime: string | null;
  location: string | null;
  companyId: string;
  isRegistrationRequired: boolean;
  maxCapacity: number | null;
  isPaid: boolean;
  price: number | null;
};

// Types for Dropdowns in Form
export type UserOption = { id: string; name: string; email: string };
export type StudentOption = { id: string; name: string; email: string };

interface EventRegistrationsPageProps {
  eventDetails: EventDetailsForRegistrationPage;
  initialRegistrations: EventRegistrationData[];
  allUsers: UserOption[];
  allStudents: StudentOption[];
  companyId: string;
}

// --- Registration Form Modal Component ---
type RegistrationFormModalProps = {
  registrationData: EventRegistrationData | null; // Null for new registration
  onClose: () => void;
  onSave: (data: Omit<EventRegistrationData, 'eventTitle' | 'eventStartDateTime' | 'eventEndDateTime' | 'eventLocation' | 'eventCompanyId' | 'userName' | 'userEmail' | 'studentName' | 'studentEmail' | 'registeredAt'>) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  eventId: string;
  allUsers: UserOption[];
  allStudents: StudentOption[];
};

const RegistrationFormModal: React.FC<RegistrationFormModalProps> = ({
  registrationData,
  onClose,
  onSave,
  isLoading,
  error,
  resetError,
  eventId,
  allUsers,
  allStudents,
}) => {
  const [formData, setFormData] = useState<Omit<EventRegistrationData, 'eventTitle' | 'eventStartDateTime' | 'eventEndDateTime' | 'eventLocation' | 'eventCompanyId' | 'userName' | 'userEmail' | 'studentName' | 'studentEmail' | 'registeredAt'>>(
    registrationData || {
      id: '',
      eventId: eventId,
      userId: '',
      studentId: null,
      status: 'REGISTERED',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value })); // Handle null for optional fields
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError(); // Clear any previous errors

    // Basic client-side validation
    if (!formData.eventId || !formData.userId || !formData.status) {
      alert("Please fill all required fields: Event, User, and Status.");
      return;
    }

    onSave(formData);
  };

  const isEdit = !!registrationData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          {isEdit ? `Edit Registration` : 'Add New Registration'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between">
            <span className="block sm:inline">{error}</span>
            <button onClick={resetError} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">Registered By (User) <span className="text-red-500">*</span></label>
            <select name="userId" id="userId" value={formData.userId} onChange={handleChange} required disabled={isEdit} // User cannot be changed after creation
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Select User --</option>
              {allUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">Registering For (Student - Optional)</label>
            <select name="studentId" id="studentId" value={formData.studentId || ''} onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
            >
              <option value="">-- Select Student --</option>
              {allStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name} ({student.email})</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Select if the user is registering a specific student (e.g., a parent registering their child).</p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
            <select name="status" id="status" value={formData.status} onChange={handleChange} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
            >
              <option value="REGISTERED">Registered</option>
              <option value="ATTENDED">Attended</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="WAITLISTED">Waitlisted</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (isEdit ? 'Save Changes' : 'Add Registration')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main EventRegistrationsPage Component ---
export default function EventRegistrationsPage({
  eventDetails,
  initialRegistrations,
  allUsers,
  allStudents,
  companyId,
}: EventRegistrationsPageProps) {
  const [registrations, setRegistrations] = useState<EventRegistrationData[]>(initialRegistrations);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<EventRegistrationData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  // Fetch registrations from API
  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/event-registrations?eventId=${encodeURIComponent(eventDetails.id)}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data: EventRegistrationData[] = await res.json();
        setRegistrations(data.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())); // Sort by most recent
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch registrations.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching registrations.");
    } finally {
      setIsLoading(false);
    }
  }, [eventDetails.id]);

  useEffect(() => {
    // Only fetch if initial data is empty (meaning server fetch failed or was empty)
    if (initialRegistrations.length === 0 && !isLoading && !error) {
      fetchRegistrations();
    }
  }, [initialRegistrations, isLoading, error, fetchRegistrations]);


  const uniqueStatuses = useMemo(() => Array.from(new Set(registrations.map(r => r.status))).sort(), [registrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter(registration => {
      const matchesSearch = registration.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            registration.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (registration.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (registration.studentEmail || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'All' || registration.status === filterStatus;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()); // Sort by most recent
  }, [registrations, searchTerm, filterStatus]);


  const totalRegistrations = registrations.length;
  const registeredCount = registrations.filter(r => r.status === 'REGISTERED').length;
  const attendedCount = registrations.filter(r => r.status === 'ATTENDED').length;
  const cancelledCount = registrations.filter(r => r.status === 'CANCELLED').length;
  const waitlistedCount = registrations.filter(r => r.status === 'WAITLISTED').length;

  const availableCapacity = eventDetails.maxCapacity !== null ? eventDetails.maxCapacity - registeredCount - attendedCount : 'N/A';


  // Helper for status badge color
  const getStatusColor = (status: EventRegistrationData['status']) => {
    switch (status) {
      case 'REGISTERED': return 'bg-blue-100 text-blue-800';
      case 'ATTENDED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'WAITLISTED': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // API Call handlers
  const handleSaveRegistration = async (registrationData: Omit<EventRegistrationData, 'eventTitle' | 'eventStartDateTime' | 'eventEndDateTime' | 'eventLocation' | 'eventCompanyId' | 'userName' | 'userEmail' | 'studentName' | 'studentEmail' | 'registeredAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = registrationData.id ? 'PATCH' : 'POST';
    const url = registrationData.id ? `${apiBaseUrl}/event-registrations/${registrationData.id}` : `${apiBaseUrl}/event-registrations`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (res.ok) {
        await fetchRegistrations(); // Re-fetch all registrations to update the list
        setShowFormModal(false);
        setEditingRegistration(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'create' : 'update'} registration.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'creating' : 'updating'} registration.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRegistration = async (registrationId: string) => {
    if (!confirm("Are you sure you want to delete this registration? This action cannot be undone.")) { // Replace with custom modal
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/event-registrations/${registrationId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchRegistrations();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete registration.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRegistrationStatus = async (registrationId: string, newStatus: EventRegistrationData['status']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/event-registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchRegistrations();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update registration status.");
      }
    } catch (err: any) {
      setError(err.message || "Network error updating registration status.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link href={`/admin/${companyId}/events`} className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-2">
            <ChevronLeftIcon className="h-5 w-5 mr-1" /> Back to Events
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Registrations for: <span className="text-purple-700">{eventDetails.title}</span>
            <span className="ml-2 text-teal-600 text-base sm:text-xl">🎟️</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
            <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
            {new Date(eventDetails.startDateTime).toLocaleDateString()}
            {eventDetails.endDateTime && ` - ${new Date(eventDetails.endDateTime).toLocaleDateString()}`}
            <span className="mx-1">•</span>
            <ClockIcon className="h-4 w-4 text-gray-500" />
            {new Date(eventDetails.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {eventDetails.endDateTime && ` - ${new Date(eventDetails.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            <span className="mx-1">•</span>
            <MapPinIcon className="h-4 w-4 text-gray-500" /> {eventDetails.location || 'Online'}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <UsersIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <h2 className="text-3xl font-bold text-gray-800">{totalRegistrations}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Attended</p>
              <h2 className="text-3xl font-bold text-gray-800">{attendedCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ClockIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Waitlisted</p>
              <h2 className="text-3xl font-bold text-gray-800">{waitlistedCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <UserGroupIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Available Capacity</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {eventDetails.maxCapacity !== null ? `${availableCapacity} / ${eventDetails.maxCapacity}` : 'N/A'}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Registrations List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-indigo-500" /> Registered Attendees
          </h3>
          <button
            onClick={() => { setEditingRegistration(null); setShowFormModal(true); setError(null); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Registration
          </button>
        </div>

        {/* Loading and Error Indicators */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading registrations...
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
            <div>
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by registrant name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="overflow-x-auto">
          {filteredRegistrations.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No registrations found for this event or matching your criteria.
            </div>
          )}
          {filteredRegistrations.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered By</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered For (Student)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <UserCircleIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          {registration.userName}
                          <p className="text-xs text-gray-500">{registration.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.studentName ? (
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            {registration.studentName}
                            <p className="text-xs text-gray-500">{registration.studentEmail}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="italic text-gray-400">N/A (User registered for self)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.registeredAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(registration.status)}`}>
                        {registration.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingRegistration(registration); setShowFormModal(true); setError(null); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Registration"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {registration.status !== 'ATTENDED' && (
                          <button
                            onClick={() => updateRegistrationStatus(registration.id, 'ATTENDED')}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            title="Mark as Attended"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        {registration.status !== 'CANCELLED' && (
                          <button
                            onClick={() => updateRegistrationStatus(registration.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-800 flex items-center"
                            title="Cancel Registration"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteRegistration(registration.id)}
                          className="text-gray-400 hover:text-gray-600 flex items-center"
                          title="Delete Registration"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <RegistrationFormModal
          registrationData={editingRegistration}
          onClose={() => { setShowFormModal(false); setEditingRegistration(null); setError(null); }}
          onSave={handleSaveRegistration}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
          eventId={eventDetails.id}
          allUsers={allUsers}
          allStudents={allStudents}
        />
      )}
    </div>
  );
}
