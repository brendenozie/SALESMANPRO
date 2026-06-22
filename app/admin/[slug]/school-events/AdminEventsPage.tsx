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
      const res = await fetch(`${apiBaseUrl}/events?companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },
        credentials: 'include',
      });
      if (res.ok) {
        const data: EventData[] = (await res.json()).data.data;
        setEvents(data.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())); 
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch institution timelines.");
      }
    } catch (err: any) {
      setError(err.message || "Network exception encountered.");
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

    for (let i = startDayIndex; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i);
      days.push({
        date: prevMonthDay.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false,
        hasEvent: hasEventOnDate(prevMonthDay.toISOString().split('T')[0], events),
      });
    }

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
    const url = eventData.id ? `${apiBaseUrl}/events/${eventData.id}` : `${apiBaseUrl}/events`;

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
        setError(errorData.message || `Failed to ${method === 'POST' ? 'create' : 'update'} core event slate.`);
      }
    } catch (err: any) {
      setError(err.message || "Network layout exception.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to completely erase this event entry? All associated registration and layout records will be cleared.")) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/events/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed entry removal pipeline.");
      }
    } catch (err: any) {
      setError(err.message || "Operational communication framework failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: EventData['eventStatus']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/events/${eventId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventStatus: newStatus }),
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed status state transition.");
      }
    } catch (err: any) {
      setError(err.message || "State machine mutation error.");
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
      case 'SCHEDULED': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'COMPLETED': return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'POSTPONED': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-700 border border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border border-slate-100';
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-slate-50 dark:bg-slate-900 min-h-screen font-sans antialiased selection:bg-indigo-500/10">
      
      {/* Modern Top Hub Navigation & Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-widest">
            <span>Enterprise Infrastructure</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span>Comms Cluster</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 sm:text-3xl">
            Institutional Calendar Engine
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-medium text-slate-600">
            <CalendarDaysIcon className="h-4 w-4 text-indigo-500" />
            <span>{today}</span>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowFormModal(true); setError(null); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-slate-800 active:scale-95 transition-all duration-150"
          >
            <PlusCircleIcon className="h-4 w-4" />
            <span>Schedule Activity</span>
          </button>
        </div>
      </div>

      {/* Analytics Operational Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Event Register Space', val: events.length, color: 'text-blue-600', icon: SparklesIcon, bg: 'bg-blue-50/50' },
          { label: 'Active Schedules', val: events.filter(e => e.eventStatus === 'SCHEDULED' && new Date(e.endDateTime || e.startDateTime) >= new Date()).length, color: 'text-emerald-600', icon: CheckCircleIcon, bg: 'bg-emerald-50/50' },
          { label: 'Exceptions Pipeline', val: events.filter(e => e.eventStatus === 'POSTPONED' || e.eventStatus === 'CANCELLED').length, color: 'text-amber-600', icon: ExclamationTriangleIcon, bg: 'bg-amber-50/50' },
          { label: 'Categorization Modules', val: uniqueEventTypes.length, color: 'text-purple-600', icon: TagIcon, bg: 'bg-purple-50/50', layoutType: 'types' }
        ].map((c, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm/50">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{c.label}</span>
              {c.layoutType === 'types' ? (
                <div className="flex gap-1 overflow-x-auto no-scrollbar pt-1">
                  {uniqueEventTypes.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md uppercase tracking-wide whitespace-nowrap">
                      {t.slice(0, 5)}
                    </span>
                  ))}
                  {uniqueEventTypes.length > 2 && <span className="text-[9px] font-bold text-slate-400 self-center">+{uniqueEventTypes.length - 2}</span>}
                </div>
              ) : (
                <h4 className="text-xl font-bold text-slate-900">{c.val}</h4>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${c.bg} border border-transparent flex-shrink-0 ml-2`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Structural Interactive Calendar & Activity Split-Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Modern Interface Calendar Card Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm/50 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Previous Operations Cycle"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">{getMonthName(currentMonth)}</h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Next Operations Cycle"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 text-center gap-1.5">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`py-2.5 text-xs rounded-xl relative flex flex-col items-center justify-center transition-all duration-150 font-medium
                  ${day.isCurrentMonth ? 'text-slate-800' : 'text-slate-300'}
                  ${day.isToday ? 'bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/10 ring-2 ring-indigo-600/20' : 'hover:bg-slate-50'}
                  ${day.hasEvent && !day.isToday ? 'bg-slate-50 border border-slate-200/80 font-semibold text-indigo-600' : ''}
                `}
                title={day.hasEvent ? `Allocated activity layers on date.` : ''}
              >
                <span>{new Date(day.date).getDate()}</span>
                {day.hasEvent && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1.5 ${day.isToday ? 'bg-white' : 'bg-indigo-500'}`}></span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              <span>Current Server Frame</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-100 border border-slate-200"></span>
              <span>Allocated Operations Frame</span>
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar - Inline Event Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm/50 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-purple-500" /> Active Timeline Metrics
            </h3>
            <ul className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <li key={event.id} className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-2 hover:border-slate-200/80 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-900 leading-snug line-clamp-1">{event.title}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-slate-200/60 text-slate-700 flex-shrink-0">
                        {event.eventType}
                      </span>
                    </div>
                    <div className="space-y-0.5 text-[10px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-3 w-3 text-slate-400" />
                        <span>{new Date(event.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3 text-slate-400" />
                        <span className="truncate max-w-[180px]">{event.location || 'Distributed Node (Online)'}</span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 space-y-1.5">
                  <FolderOpenIcon className="h-6 w-6 mx-auto text-slate-300" />
                  <p className="text-[11px]">No immediate lifecycle modifications required.</p>
                </div>
              )}
            </ul>
          </div>
          <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100/60 mt-4">
            Monitoring current month operations sequence logs.
          </div>
        </div>
      </div>

      {/* Main Aggregation Data Stream Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Dynamic Controls Header Group */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-800">Operational Log Registers</h3>
            </div>
          </div>

          {/* Precision Layout Dropdowns Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search index arrays dynamically..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
              />
            </div>

            {[
              { val: filterType, set: setFilterType, opt: uniqueEventTypes, lbl: 'Types' },
              { val: filterAudience, set: setFilterAudience, opt: uniqueAudiences, lbl: 'Audiences' },
              { val: filterStatus, set: setFilterStatus, opt: uniqueStatuses, lbl: 'Statuses' }
            ].map((f, i) => (
              <select
                key={i} value={f.val} onChange={(e) => f.set(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-indigo-500 text-slate-700"
              >
                <option value="All">All {f.lbl}</option>
                {f.opt.map(o => (
                  <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* Local Scope Pipeline Feedback */}
        {isLoading && (
          <div className="flex items-center justify-center py-10 text-slate-500 text-xs gap-2">
            <ArrowPathIcon className="animate-spin h-4 w-4 text-indigo-500" />
            <span>Synchronizing database sequence streams...</span>
          </div>
        )}
        {error && (
          <div className="m-5 bg-rose-50 border border-rose-100 text-rose-800 p-3.5 rounded-xl flex items-center justify-between text-xs">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600"><XMarkIcon className="h-4 w-4" /></button>
          </div>
        )}

        {/* High-Fidelity Multi-Tenant Tabular Display Interface */}
        <div className="overflow-x-auto">
          {!isLoading && filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <FolderOpenIcon className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs font-medium">No system entries correspond to the applied target parameters.</p>
            </div>
          ) : (
            !isLoading && (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">Event Parameters Scope</th>
                    <th className="px-5 py-3">Execution Sequence Timeline</th>
                    <th className="px-5 py-3">Location/Access Address</th>
                    <th className="px-5 py-3">Classification</th>
                    <th className="px-5 py-3">Target Audience Group</th>
                    <th className="px-5 py-3">Status Matrix</th>
                    <th className="px-5 py-3 text-right">Actions Dashboard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-3.5 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{event.title}</div>
                        {event.summary && <div className="text-slate-400 text-[11px] truncate mt-0.5">{event.summary}</div>}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{new Date(event.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <ClockIcon className="h-3 w-3" />
                          <span>
                            {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-[180px]">
                        <div className="flex items-center gap-1 text-slate-700 truncate">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span>{event.location || 'Distributed Network Node'}</span>
                        </div>
                        {event.onlineMeetingLink && (
                          <a href={event.onlineMeetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 text-[10px] flex items-center gap-0.5 mt-1 font-medium transition-colors">
                            <GlobeAltIcon className="h-3 w-3" /> Secure Gateway Link
                          </a>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700">
                            {event.eventType}
                          </span>
                          {event.isPaid && (
                            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-0.5">
                              <CurrencyDollarIcon className="h-3 w-3" /> {event.price?.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-[160px]">
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-slate-800">{event.audience.replace(/_/g, ' ')}</span>
                        </div>
                        
                        {/* Inline Nested Loop Arrays Parser */}
                        {event.audience === 'ACADEMIC_LEVEL' && event.targetAcademicLevelIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            ({event.targetAcademicLevelIds.map(id => allAcademicLevels.find(al => al.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'COURSE' && event.targetCourseIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            ({event.targetCourseIds.map(id => allCourses.find(c => c.id === id)?.title || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'EDUCATOR' && event.targetOrganizerIds?.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            ({event.targetEducatorIds.map(id => allEducators.find(e => e.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'STUDENT' && event.targetStudentIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            ({event.targetStudentIds.map(id => allStudents.find(s => s.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'DEPARTMENT' && event.targetDepartmentIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            ({event.targetDepartmentIds.map(id => allDepartments.find(d => d.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                        {event.audience === 'PARENT' && event.targetParentIds.length > 0 && (
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            ({event.targetParentIds.map(id => allParents.find(p => p.id === id)?.name || id).join(', ')})
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] leading-5 font-bold rounded-md uppercase tracking-wide ${getStatusColor(event.eventStatus)}`}>
                          {event.eventStatus}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Sequential Operations Interchanges */}
                          {event.eventStatus === 'SCHEDULED' && (
                            <button
                              onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Interrupt/Halt Blueprint Sequence"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          )}
                          {(event.eventStatus === 'POSTPONED' || event.eventStatus === 'CANCELLED') && (
                            <button
                              onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Re-inject Matrix Blueprint Schedule"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => { setEditingEvent(event); setShowFormModal(true); setError(null); }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Metric Configurations"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Erase Cluster Record Permanent"
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

      {/* Synchronized Custom Form Modal Component Layer */}
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