'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarDaysIcon,
  SparklesIcon,
  PlusCircleIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  TagIcon,
  ClockIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  FolderOpenIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import EventFormModal from './EventFormModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions ---
export type EventData = {
  id: string;
  title: string;
  summary: string | null;
  description: string | null;
  startDateTime: string; 
  endDateTime: string | null; 
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

// --- Helper Functions ---
const getMonthName = (date: Date | string) => new Date(date).toLocaleString('en-US', { month: 'long', year: 'numeric' });

const hasEventOnDate = (dateString: string, events: EventData[]) => {
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

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
  const [currentMonth, setCurrentMonth] = useState(new Date()); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },
        credentials: 'include',
      });
      if (res.ok) {
        const data: EventData[] = (await res.json()).data.data;
        setEvents(data.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())); 
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to load events.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (initialEvents.length === 0 && !isLoading && !error) {
      fetchEvents();
    }
  }, [initialEvents, isLoading, error, fetchEvents]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayIndex = firstDayOfMonth.getDay(); 
    const days = [];

    // Previous month padding
    for (let i = startDayIndex; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i);
      days.push({
        date: prevMonthDay.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        hasEvent: hasEventOnDate(prevMonthDay.toISOString().split('T')[0], events),
      });
    }

    // Current month days
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

    // Next month padding
    const remainingDays = 42 - days.length; 
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
    }).sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()); 
  }, [events, searchTerm, filterType, filterAudience, filterStatus]);

  const upcomingEvents = filteredEvents.filter(event =>
    new Date(event.endDateTime || event.startDateTime) >= new Date() &&
    new Date(event.startDateTime).getMonth() === currentMonth.getMonth() &&
    new Date(event.startDateTime).getFullYear() === currentMonth.getFullYear()
  ).slice(0, 5); 

  const handleSaveEvent = async (eventData: Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    const method = eventData.id ? 'PATCH' : 'POST';
    const url = eventData.id ? `${apiBaseUrl}/admin/events/${eventData.id}` : `${apiBaseUrl}/admin/events`;

    try {
      const res = await fetch(url, {
        method: method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (res.ok) {
        await fetchEvents(); 
        setShowFormModal(false);
        setEditingEvent(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to save the event.`);
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete the event.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: EventData['eventStatus']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/events/${eventId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventStatus: newStatus }),
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update the event status.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newDate);
  };

  const getStatusColor = (status: EventData['eventStatus']) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
      case 'COMPLETED': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800';
      case 'POSTPONED': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
      case 'CANCELLED': return 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-100 dark:border-slate-700';
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans antialiased selection:bg-indigo-500/10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <span>School Admin</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span>Communication</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 sm:text-3xl">
            School Calendar & Events
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white dark:bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <CalendarDaysIcon className="h-4 w-4 text-indigo-500" />
            <span>{today}</span>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowFormModal(true); setError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all duration-150"
          >
            <PlusCircleIcon className="h-4 w-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', val: events.length, color: 'text-blue-600 dark:text-blue-400', icon: SparklesIcon, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Upcoming', val: events.filter(e => e.eventStatus === 'SCHEDULED' && new Date(e.endDateTime || e.startDateTime) >= new Date()).length, color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircleIcon, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Cancelled/Postponed', val: events.filter(e => e.eventStatus === 'POSTPONED' || e.eventStatus === 'CANCELLED').length, color: 'text-amber-600 dark:text-amber-400', icon: ExclamationTriangleIcon, bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Event Types', val: uniqueEventTypes.length, color: 'text-purple-600 dark:text-purple-400', icon: TagIcon, bg: 'bg-purple-50 dark:bg-purple-900/20', layoutType: 'types' }
        ].map((c, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm/50">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{c.label}</span>
              {c.layoutType === 'types' ? (
                <div className="flex gap-1 overflow-x-auto no-scrollbar pt-1">
                  {uniqueEventTypes.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md uppercase tracking-wide whitespace-nowrap border border-slate-200 dark:border-slate-700">
                      {t.slice(0, 5)}
                    </span>
                  ))}
                  {uniqueEventTypes.length > 2 && <span className="text-[9px] font-bold text-slate-400 self-center">+{uniqueEventTypes.length - 2}</span>}
                </div>
              ) : (
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{c.val}</h4>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${c.bg} border border-transparent flex-shrink-0 ml-2`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Calendar & Upcoming Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar View */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Previous Month"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">{getMonthName(currentMonth)}</h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Next Month"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 text-center gap-1.5">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`py-2.5 text-xs rounded-xl relative flex flex-col items-center justify-center transition-all duration-150 font-medium
                  ${day.isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600'}
                  ${day.isToday ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/10 ring-2 ring-indigo-600/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                  ${day.hasEvent && !day.isToday ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 font-semibold text-indigo-600 dark:text-indigo-400' : 'border border-transparent'}
                `}
                title={day.hasEvent ? `Events scheduled on this date.` : ''}
              >
                <span>{new Date(day.date).getDate()}</span>
                {day.hasEvent && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${day.isToday ? 'bg-white' : 'bg-indigo-500 dark:bg-indigo-400'}`}></span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600"></span>
              <span>Has Event</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm/50 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-purple-500" /> Upcoming This Month
            </h3>
            <ul className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <li key={event.id} className="p-3 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 hover:border-slate-200/80 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-900 dark:text-white leading-snug line-clamp-1">{event.title}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0">
                        {event.eventType}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                        <span>{new Date(event.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                        <span className="truncate max-w-[180px]">{event.location || 'Online / TBD'}</span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 space-y-1.5">
                  <FolderOpenIcon className="h-6 w-6 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-[11px]">No upcoming events this month.</p>
                </div>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Main Events List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Search & Filters */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Events List</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            {[
              { val: filterType, set: setFilterType, opt: uniqueEventTypes, lbl: 'Types' },
              { val: filterAudience, set: setFilterAudience, opt: uniqueAudiences, lbl: 'Audiences' },
              { val: filterStatus, set: setFilterStatus, opt: uniqueStatuses, lbl: 'Statuses' }
            ].map((f, i) => (
              <select
                key={i} value={f.val} onChange={(e) => f.set(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 text-slate-700"
              >
                <option value="All">All {f.lbl}</option>
                {f.opt.map(o => (
                  <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* Loading and Errors */}
        {isLoading && (
          <div className="flex items-center justify-center py-10 text-slate-500 dark:text-slate-400 text-xs gap-2">
            <ArrowPathIcon className="animate-spin h-4 w-4 text-indigo-500" />
            <span>Loading events...</span>
          </div>
        )}
        {error && (
          <div className="m-5 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl flex items-center justify-between text-xs">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200"><XMarkIcon className="h-4 w-4" /></button>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          {!isLoading && filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
              <FolderOpenIcon className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-xs font-medium">No events found matching your search.</p>
            </div>
          ) : (
            !isLoading && (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-3">Event Info</th>
                    <th className="px-5 py-3">Date & Time</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Type & Cost</th>
                    <th className="px-5 py-3">Audience</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">{event.title}</div>
                        {event.summary && <div className="text-slate-400 dark:text-slate-500 text-[11px] truncate mt-0.5">{event.summary}</div>}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{new Date(event.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 mt-0.5">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-[180px]">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 truncate">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                          <span>{event.location || 'Online / TBD'}</span>
                        </div>
                        {event.onlineMeetingLink && (
                          <a href={event.onlineMeetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-[10px] flex items-center gap-0.5 mt-1 font-medium transition-colors">
                            <GlobeAltIcon className="h-3 w-3" /> Meeting Link
                          </a>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {event.eventType}
                          </span>
                          {event.isPaid && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center gap-0.5">
                              <CurrencyDollarIcon className="h-3 w-3" /> {event.price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-[160px]">
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">{event.audience.replace(/_/g, ' ')}</span>
                        </div>
                        
                        {/* Target Mappings */}
                        {event.audience === 'ACADEMIC_LEVEL' && event.targetAcademicLevelIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            ({event.targetAcademicLevelIds.map(id => allAcademicLevels.find(al => al.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'COURSE' && event.targetCourseIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            ({event.targetCourseIds.map(id => allCourses.find(c => c.id === id)?.title || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'EDUCATOR' && event.targetEducatorIds?.length > 0 && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            ({event.targetEducatorIds.map(id => allEducators.find(e => e.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'STUDENT' && event.targetStudentIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            ({event.targetStudentIds.map(id => allStudents.find(s => s.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'DEPARTMENT' && event.targetDepartmentIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            ({event.targetDepartmentIds.map(id => allDepartments.find(d => d.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'PARENT' && event.targetParentIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            ({event.targetParentIds.map(id => allParents.find(p => p.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] leading-5 font-bold rounded-md border uppercase tracking-wide ${getStatusColor(event.eventStatus)}`}>
                          {event.eventStatus}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Quick Actions */}
                          {event.eventStatus === 'SCHEDULED' && (
                            <button
                              onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                              title="Cancel Event"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                          {(event.eventStatus === 'POSTPONED' || event.eventStatus === 'CANCELLED') && (
                            <button
                              onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                              title="Restore Event"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => { setEditingEvent(event); setShowFormModal(true); setError(null); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Event Info"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                            title="Delete Event"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* Form Modal */}
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