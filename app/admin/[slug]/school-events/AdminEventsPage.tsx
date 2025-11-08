'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDaysIcon, // General calendar icon
  SparklesIcon, // For general events
  PlusCircleIcon, // For add event
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  TagIcon, // For event type
  ClockIcon, // For time
  MapPinIcon, // For location
  ArrowLeftIcon, // For calendar navigation
  ArrowRightIcon, // For calendar navigation
  XMarkIcon, // For closing modals/errors
  CheckCircleIcon, // For scheduled/completed status
  ExclamationTriangleIcon, // For postponed/cancelled status
  LinkIcon, // For online meeting link
  CurrencyDollarIcon, // For paid events
  ArrowPathIcon, // For student/parent
} from '@heroicons/react/24/outline';
import EventFormModal from './EventFormModal';

const apiBaserUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Aligned with Event API Response) ---
export type EventData = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  startDateTime: string; // ISO string
  endDateTime: string | null; // ISO string
  location: string | null;
  onlineMeetingLink: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  eventType: 'GENERAL' | 'HOLIDAY'| 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'WORKSHOP' | 'ORIENTATION' | 'FUNDRAISER' | 'OTHER';
  eventStatus: 'SCHEDULED' | 'POSTPONED' | 'CANCELLED' | 'COMPLETED';
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  companyId: string;
  companyName: string;
  audience: 'ALL' | 'ACADEMIC_LEVEL' | 'COURSE' | 'EDUCATOR' | 'STUDENT' | 'DEPARTMENT' | 'STAFF' | 'PARENT';
  targetAcademicLevelIds: string[];
  targetCourseIds: string[];
  targetEducatorIds: string[];
  targetStudentIds: string[];
  targetDepartmentIds: string[];
  targetParentIds: string[];
  isRegistrationRequired: boolean;
  maxCapacity: number | null;
  isPaid: boolean;
  price: number | null;
  contactPerson: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  updatedAt: string;
};

// Types for Audience Selection Dropdowns
export type AcademicLevelOption = { id: string; name: string };
export type CourseOption = { id: string; title: string };
export type EducatorOption = { id: string; name: string; email: string };
export type StudentOption = { id: string; name: string; email: string };
export type DepartmentOption = { id: string; name: string };
export type ParentOption = { id: string; name: string; email: string };
export type OrganizerOption = { id: string; name: string; email: string };

interface AdminEventsPageProps {
  initialEvents: EventData[];
  allAcademicLevels: AcademicLevelOption[];
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  allStudents: StudentOption[];
  allDepartments: DepartmentOption[];
  allParents: ParentOption[];
  allOrganizers: OrganizerOption[];
  companyId: string;
}

// Helper to get month name
const getMonthName = (date: Date | string) => new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' });

// Helper to check if a date has an event
const hasEventOnDate = (dateString: string, events: EventData[]) => {
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0); // Normalize to start of day

  return events.some(event => {
    const eventStart = new Date(event.startDateTime);
    eventStart.setHours(0, 0, 0, 0);
    const eventEnd = event.endDateTime ? new Date(event.endDateTime) : eventStart;
    eventEnd.setHours(0, 0, 0, 0);

    return targetDate >= eventStart && targetDate <= eventEnd;
  });
};


// --- Main AdminEventsPage Component ---
export default function AdminEventsPage({
  initialEvents,
  allAcademicLevels,
  allCourses,
  allEducators,
  allStudents,
  allDepartments,
  allParents,
  allOrganizers,
  companyId,
}: AdminEventsPageProps) {
  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Date object for calendar navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaserUrl}/events?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data: EventData[] = await res.json();
        setEvents(data.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())); // Sort by upcoming
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch events.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching events.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    // Only fetch if initial data is empty (meaning server fetch failed or was empty)
    if (initialEvents.length === 0 && !isLoading && !error) {
      fetchEvents();
    }
  }, [initialEvents, isLoading, error, fetchEvents]);


  // Calculate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayIndex = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday etc.
    const days = [];

    // Add days from previous month to fill the first week
    for (let i = startDayIndex; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i);
      days.push({
        date: prevMonthDay.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        hasEvent: hasEventOnDate(prevMonthDay.toISOString().split('T')[0], events),
      });
    }

    // Add days of the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      const isToday = day.toDateString() === new Date().toDateString();
      days.push({
        date: day.toISOString().split('T')[0],
        isCurrentMonth: true,
        isToday: isToday,
        hasEvent: hasEventOnDate(day.toISOString().split('T')[0], events),
      });
    }

    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // Ensure 6 rows (6*7=42 days)
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        hasEvent: hasEventOnDate(nextMonthDay.toISOString().split('T')[0], events),
      });
    }
    return days;
  }, [currentMonth, events]);

  const uniqueEventTypes = useMemo(() => Array.from(new Set(events.map(e => e.eventType))).sort(), [events]);
  const uniqueAudiences = useMemo(() => Array.from(new Set(events.map(e => e.audience))).sort(), [events]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(events.map(e => e.eventStatus))).sort(), [events]);


  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            event.organizerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'All' || event.eventType === filterType;
      const matchesAudience = filterAudience === 'All' || event.audience === filterAudience;
      const matchesStatus = filterStatus === 'All' || event.eventStatus === filterStatus;

      return matchesSearch && matchesType && matchesAudience && matchesStatus;
    }).sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()); // Sort by upcoming
  }, [events, searchTerm, filterType, filterAudience, filterStatus]);

  const upcomingEvents = filteredEvents.filter(event =>
    new Date(event.endDateTime || event.startDateTime) >= new Date() &&
    new Date(event.startDateTime).getMonth() === currentMonth.getMonth() &&
    new Date(event.startDateTime).getFullYear() === currentMonth.getFullYear()
  ).slice(0, 5); // Show top 5 upcoming for current month


  // Event handlers
  const handleSaveEvent = async (eventData: Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);

    const method = eventData.id ? 'PATCH' : 'POST';
    const url = eventData.id ? `${apiBaserUrl}/events/${eventData.id}` : `${apiBaserUrl}/events`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        await fetchEvents(); // Re-fetch all events to update the list
        setShowFormModal(false);
        setEditingEvent(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to ${method === 'POST' ? 'create' : 'update'} event.`);
      }
    } catch (err: any) {
      setError(err.message || `Network error ${method === 'POST' ? 'creating' : 'updating'} event.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) { // Replace with custom modal
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaserUrl}/events/${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete event.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting event.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: EventData['eventStatus']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaserUrl}/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventStatus: newStatus }),
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update event status.");
      }
    } catch (err: any) {
      setError(err.message || "Network error updating event status.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newDate);
  };

  // Helper for status badge color
  const getStatusColor = (status: EventData['eventStatus']) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'POSTPONED': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            School Calendar & Events
            <span className="ml-2 text-teal-600 text-base sm:text-xl">🗓️</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage and publish all school-wide events and holidays.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <SparklesIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <h2 className="text-3xl font-bold text-gray-800">{events.length}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-green-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled Events</p>
              <h2 className="text-3xl font-bold text-gray-800">{events.filter(e => e.eventStatus === 'SCHEDULED' && new Date(e.endDateTime || e.startDateTime) >= new Date()).length}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-yellow-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Postponed/Cancelled</p>
              <h2 className="text-3xl font-bold text-gray-800">{events.filter(e => e.eventStatus === 'POSTPONED' || e.eventStatus === 'CANCELLED').length}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-purple-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <TagIcon className="h-7 w-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Event Types</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {uniqueEventTypes.map(type => (
                  <span key={type} className="text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {type.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View and Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Previous Month"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">{getMonthName(currentMonth)}</h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              title="Next Month"
            >
              <ArrowRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`py-2 rounded-md transition-colors
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  ${day.isToday ? 'bg-indigo-100 font-bold border border-indigo-300' : 'hover:bg-gray-50'}
                  ${day.hasEvent ? 'bg-blue-100 border border-blue-300 font-semibold' : ''}
                `}
                title={day.hasEvent ? `Events on ${new Date(day.date).toLocaleDateString()}` : ''}
              >
                {new Date(day.date).getDate()}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            <span className="inline-block w-3 h-3 rounded-full bg-indigo-100 border border-indigo-300 mr-1"></span> Today
            <span className="inline-block w-3 h-3 rounded-full bg-blue-100 border border-blue-300 ml-3 mr-1"></span> Event Day
          </p>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-5 text-gray-800 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-purple-500" /> Upcoming Events This Month
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-shrink-0">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" /> {new Date(event.startDateTime).toLocaleDateString()}
                      {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleDateString()}`}
                      {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="h-4 w-4" /> {event.location || 'Online'}
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">{event.eventType.replace(/_/g, ' ')}</span>
                    </p>                  </div>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">No upcoming events this month.</li>
            )}
          </ul>
          {/* You might want a "View All Events" link here that navigates to the filtered table below */}
        </div>
      </div>

      {/* Events List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-indigo-500" /> All Events
          </h3>
          <button
            onClick={() => { setEditingEvent(null); setShowFormModal(true); setError(null); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Event
          </button>
        </div>

        {/* Loading and Error Indicators */}
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading events...
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative col-span-full md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueEventTypes.map(type => (
                <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Audiences</option>
              {uniqueAudiences.map(audience => (
                <option key={audience} value={audience}>{audience.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
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

        {/* Events Table */}
        <div className="overflow-x-auto">
          {filteredEvents.length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-500">
              No events found matching your criteria.
            </div>
          )}
          {filteredEvents.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Title</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      <div>
                        {event.title}
                        <p className="text-xs text-gray-500 mt-1">{event.summary}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.startDateTime).toLocaleDateString()}
                      {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleDateString()}`}
                      <br />
                      <span className="text-xs text-gray-600">
                        {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        {event.location || 'Online'}
                      </div>
                      {event.onlineMeetingLink && (
                        <a href={event.onlineMeetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs flex items-center gap-1 mt-1">
                          <LinkIcon className="h-3 w-3" /> Meeting Link
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                      {event.isPaid && (
                        <span className="ml-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold flex items-center gap-1">
                          <CurrencyDollarIcon className="h-3 w-3" /> {event.price?.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                        {event.audience.replace(/_/g, ' ')}
                      </span>
                      {/* Display specific targets if audience is not ALL */}
                      {event.audience === 'ACADEMIC_LEVEL' && event.targetAcademicLevelIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetAcademicLevelIds.map(id => allAcademicLevels.find(al => al.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'COURSE' && event.targetCourseIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetCourseIds.map(id => allCourses.find(c => c.id === id)?.title || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'EDUCATOR' && event.targetEducatorIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetEducatorIds.map(id => allEducators.find(e => e.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'STUDENT' && event.targetStudentIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetStudentIds.map(id => allStudents.find(s => s.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'DEPARTMENT' && event.targetDepartmentIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetDepartmentIds.map(id => allDepartments.find(d => d.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                      {event.audience === 'PARENT' && event.targetParentIds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                              ({event.targetParentIds.map(id => allParents.find(p => p.id === id)?.name || id).join(', ')})
                          </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.eventStatus)}`}>
                        {event.eventStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingEvent(event); setShowFormModal(true); setError(null); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Event"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {event.eventStatus === 'SCHEDULED' && (
                          <button
                            onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                            className="text-red-600 hover:text-red-800 flex items-center"
                            title="Cancel Event"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                        {(event.eventStatus === 'POSTPONED' || event.eventStatus === 'CANCELLED') && (
                          <button
                            onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                            className="text-green-600 hover:text-green-800 flex items-center"
                            title="Reschedule Event"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-gray-400 hover:text-gray-600 flex items-center"
                          title="Delete Event"
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
        <EventFormModal
          eventData={editingEvent}
          onClose={() => { setShowFormModal(false); setEditingEvent(null); setError(null); }}
          onSave={handleSaveEvent}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
          companyId={companyId}
          allAcademicLevels={allAcademicLevels}
          allCourses={allCourses}
          allEducators={allEducators}
          allStudents={allStudents}
          allDepartments={allDepartments}
          allParents={allParents}
          allOrganizers={allOrganizers}
        />
      )}
    </div>
  );
}
