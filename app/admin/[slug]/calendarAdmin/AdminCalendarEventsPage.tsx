'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarDaysIcon, // General calendar icon
  SparklesIcon, // For general events
  PlusCircleIcon, // For add event
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  TagIcon, // For event type
  UsersIcon, // For audience
  ClockIcon, // For time
  MapPinIcon, // For location
  ArrowLeftIcon, // For calendar navigation
  ArrowRightIcon, // For calendar navigation
} from '@heroicons/react/24/outline';

// Sample Event Data
const sampleEvents = [
  {
    id: 'EV001',
    title: 'Midterm Exams Week',
    date: '2025-07-07', // Start date
    endDate: '2025-07-11', // End date for multi-day event
    time: 'All Day',
    location: 'School Wide',
    description: 'Midterm examinations for all grades. Schedule to be published.',
    type: 'Exam',
    audience: 'Students, Teachers',
  },
  {
    id: 'EV002',
    title: 'Parent-Teacher Conference',
    date: '2025-07-15',
    time: '9:00 AM - 4:00 PM',
    location: 'School Auditorium',
    description: 'Opportunity for parents to discuss student progress with teachers.',
    type: 'Meeting',
    audience: 'Parents, Teachers',
  },
  {
    id: 'EV003',
    title: 'Science Fair',
    date: '2025-07-20',
    time: '10:00 AM - 2:00 PM',
    location: 'School Gymnasium',
    description: 'Annual science fair showcasing student projects.',
    type: 'Sporting/Social Event',
    audience: 'All',
  },
  {
    id: 'EV004',
    title: 'National Holiday (Eid al-Adha)',
    date: '2025-07-06',
    time: 'All Day',
    location: 'N/A',
    description: 'School closed for national holiday.',
    type: 'Holiday',
    audience: 'All',
  },
  {
    id: 'EV005',
    title: 'Faculty Professional Development',
    date: '2025-07-25',
    time: '8:30 AM - 12:00 PM',
    location: 'Staff Conference Room',
    description: 'Workshop on new teaching methodologies.',
    type: 'Meeting',
    audience: 'Teachers',
  },
  {
    id: 'EV006',
    title: 'School Board Meeting',
    date: '2025-07-28',
    time: '5:00 PM - 7:00 PM',
    location: 'Board Room',
    description: 'Monthly school board meeting.',
    type: 'Meeting',
    audience: 'Admin, Teachers',
  },
];

// Helper to get month name
const getMonthName = (date: Date | string) => new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' });

// Helper to check if a date has an event
const hasEventOnDate = (dateString: string, events: Array<{ date: string; endDate?: string }>) => {
  return events.some(event => {
    const eventStartDate = new Date(event.date);
    const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;
    const targetDate = new Date(dateString);

    // Normalize dates to just year-month-day for comparison
    const targetDay = targetDate.toISOString().split('T')[0];
    let currentEventDay = new Date(eventStartDate).toISOString().split('T')[0];

    // Check if the target day falls within the event's date range
    while (currentEventDay <= eventEndDate.toISOString().split('T')[0]) {
      if (currentEventDay === targetDay) {
        return true;
      }
      const nextDay = new Date(currentEventDay);
      nextDay.setDate(nextDay.getDate() + 1);
      currentEventDay = nextDay.toISOString().split('T')[0];
    }
    return false;
  });
};


export default function AdminCalendarEventsPage() {
  const [events, setEvents] = useState(sampleEvents);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Date object for calendar navigation
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterAudience, setFilterAudience] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  type EventType = {
    id?: string;
    title: string;
    date: string;
    endDate?: string;
    time: string;
    location: string;
    description: string;
    type: string;
    audience: string;
  };
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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

  const uniqueEventTypes = useMemo(() => Array.from(new Set(events.map(e => e.type))).sort(), [events]);
  const uniqueAudiences = useMemo(() => Array.from(new Set(events.map(e => e.audience))).sort(), [events]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || event.type === filterType;
    const matchesAudience = filterAudience === 'All' || event.audience === filterAudience;
    return matchesSearch && matchesType && matchesAudience;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date

  const upcomingEvents = filteredEvents.filter(event => new Date(event.endDate || event.date) >= new Date())
                                       .slice(0, 5); // Show top 5 upcoming

  // Event handlers
  const handleAddNewEvent = (newEventData: {
    title: string;
    date: string;
    endDate?: string;
    time: string;
    location: string;
    description: string;
    type: string;
    audience: string;
  }) => {
    const newId = `EV${String(events.length + 1).padStart(3, '0')}`; // Simple ID generation
    setEvents([...events, { id: newId, ...newEventData }]);
    setShowFormModal(false);
  };

  const handleEditEvent = (updatedEventData: {
    id: string;
    title: string;
    date: string;
    endDate?: string;
    time: string;
    location: string;
    description: string;
    type: string;
    audience: string;
  }) => {
    setEvents(events.map(event => event.id === updatedEventData.id ? updatedEventData : event));
    setShowFormModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) { // Use custom modal in real app
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newDate);
  };

  // --- Event Form Modal ---
  type EventFormModalProps = {
    eventData: {
      id?: string;
      title: string;
      date: string;
      endDate?: string;
      time: string;
      location: string;
      description: string;
      type: string;
      audience: string;
    } | null;
    onClose: () => void;
    onSave: (eventData: {
      id?: string;
      title: string;
      date: string;
      endDate?: string;
      time: string;
      location: string;
      description: string;
      type: string;
      audience: string;
    }) => void;
    isEdit?: boolean;
  };

  const EventFormModal: React.FC<EventFormModalProps> = ({ eventData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(eventData || {
      title: '', date: new Date().toISOString().split('T')[0], endDate: '', time: 'All Day', location: '', description: '', type: '', audience: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Event: ${formData.title}` : 'Add New Event'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              </div>
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
              <input type="text" name="time" id="time" value={formData.time} onChange={handleChange} placeholder="e.g., 9:00 AM - 12:00 PM, All Day"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" name="location" id="location" value={formData.location} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Event Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Type --</option>
                <option value="Meeting">Meeting</option>
                <option value="Exam">Exam</option>
                <option value="Holiday">Holiday</option>
                <option value="Sporting/Social Event">Sporting/Social Event</option>
                <option value="General">General Event</option>
              </select>
            </div>
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Audience</label>
              <select name="audience" id="audience" value={formData.audience} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Audience --</option>
                <option value="All">All School</option>
                <option value="Students">Students Only</option>
                <option value="Teachers">Teachers Only</option>
                <option value="Parents">Parents Only</option>
                <option value="Admin">Admin Only</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
                <option value="Grade 9">Grade 9</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Add Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Modal Component ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CalendarDaysIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming This Month</p>
              <h2 className="text-3xl font-bold text-gray-800">
                {events.filter(e => {
                    const eventStartDate = new Date(e.date);
                    const eventEndDate = e.endDate ? new Date(e.endDate) : eventStartDate;
                    return (
                        (eventStartDate.getFullYear() === currentMonth.getFullYear() && eventStartDate.getMonth() === currentMonth.getMonth()) ||
                        (eventEndDate.getFullYear() === currentMonth.getFullYear() && eventEndDate.getMonth() === currentMonth.getMonth()) ||
                        (eventStartDate < new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0) && eventEndDate > new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1))
                    );
                }).length}
              </h2>
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
                    {type}
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
            <CalendarDaysIcon className="h-5 w-5 text-purple-500" /> Upcoming Events
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
                      <ClockIcon className="h-4 w-4" /> {new Date(event.date).toLocaleDateString()}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                      {event.time && `, ${event.time}`}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="h-4 w-4" /> {event.location || 'N/A'}
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs">{event.type}</span>
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">No upcoming events.</li>
            )}
          </ul>
          <button className="mt-6 w-full text-sm text-blue-600 hover:underline">View All Upcoming Events &rarr;</button>
        </div>
      </div>

      {/* Events List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-indigo-500" /> All Events
          </h3>
          <button
            onClick={() => { setEditingEvent(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Add New Event
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
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
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueEventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Audiences</option>
              {uniqueAudiences.map(audience => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date(s)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                        {event.audience}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setEditingEvent(event); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Event"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete Event"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No events found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && (
        <EventFormModal
          eventData={editingEvent}
          onClose={() => setShowFormModal(false)}
          onSave={editingEvent
            ? (eventData) => {
                if (eventData.id) {
                  handleEditEvent(eventData as { id: string; title: string; date: string; endDate?: string; time: string; location: string; description: string; type: string; audience: string; });
                } else {
                  // fallback: shouldn't happen, but just in case
                  alert('Error: Missing event ID for editing.');
                }
              }
            : handleAddNewEvent}
          isEdit={!!editingEvent}
        />
      )}
    </div>
  );
}
