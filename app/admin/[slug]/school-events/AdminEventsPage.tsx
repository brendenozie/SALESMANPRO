// app/admin/[slug]/events/AdminEventsPage.tsx
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
  CurrencyDollarIcon,
  ArrowPathIcon,
  FolderOpenIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  GlobeAltIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import EventFormModal from './EventFormModal';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

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

const getMonthName = (date: Date) => date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);

  const todayText = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  }), []);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/events?companyId=${encodeURIComponent(companyId)}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const rawJson = await res.json();
        const incomingData = Array.isArray(rawJson.data) ? rawJson.data : rawJson.data?.data || [];
        setEvents(incomingData.sort((a: EventData, b: EventData) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())); 
      } else {
        const errorData = await res.json().catch(() => ({ message: "Failed to load dynamic context." }));
        setError(errorData.message || "Failed to load events.");
      }
    } catch (err: any) {
      setError(err.message || "A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (initialEvents.length === 0) {
      fetchEvents();
    }
  }, [initialEvents, fetchEvents]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayIndex = firstDayOfMonth.getDay(); 
    const days = [];

    for (let i = startDayIndex; i > 0; i--) {
      const prevMonthDay = new Date(year, month, 1 - i);
      const dStr = prevMonthDay.toISOString().split('T')[0];
      days.push({ date: dStr, isCurrentMonth: false, isToday: false, hasEvent: hasEventOnDate(dStr, events) });
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const day = new Date(year, month, i);
      const dStr = day.toISOString().split('T')[0];
      const isToday = day.toDateString() === new Date().toDateString();
      days.push({ date: dStr, isCurrentMonth: true, isToday, hasEvent: hasEventOnDate(dStr, events) });
    }

    const remainingDays = 42 - days.length; 
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      const dStr = nextMonthDay.toISOString().split('T')[0];
      days.push({ date: dStr, isCurrentMonth: false, isToday: false, hasEvent: hasEventOnDate(dStr, events) });
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

      const matchesDateFilter = !selectedDate || (() => {
        const target = new Date(selectedDate);
        target.setHours(0,0,0,0);
        const sTime = new Date(event.startDateTime);
        sTime.setHours(0,0,0,0);
        const eTime = event.endDateTime ? new Date(event.endDateTime) : sTime;
        eTime.setHours(0,0,0,0);
        return target >= sTime && target <= eTime;
      })();

      return matchesSearch && matchesType && matchesAudience && matchesStatus && matchesDateFilter;
    }).sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()); 
  }, [events, searchTerm, filterType, filterAudience, filterStatus, selectedDate]);

  const upcomingEvents = useMemo(() => {
    return events.filter(event =>
      new Date(event.endDateTime || event.startDateTime) >= new Date() &&
      new Date(event.startDateTime).getMonth() === currentMonth.getMonth() &&
      new Date(event.startDateTime).getFullYear() === currentMonth.getFullYear()
    ).slice(0, 5);
  }, [events, currentMonth]);

  const handleSaveEvent = async (eventData: Omit<EventData, 'organizerName' | 'organizerEmail' | 'companyName' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    setError(null);
    const method = eventData.id ? 'PATCH' : 'POST';
    const url = eventData.id
      ? `${apiBaseUrl}/admin/events/${eventData.id}?companyId=${encodeURIComponent(companyId)}`
      : `${apiBaseUrl}/admin/events`;

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventData, companyId }),
      });

      if (res.ok) {
        await fetchEvents(); 
        setShowFormModal(false);
        setEditingEvent(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || `Failed to save the event context dynamically.`);
      }
    } catch (err: any) {
      setError(err.message || "A networking error occurred during communication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to completely remove this event track? This operation is permanent.")) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/events/${eventId}?companyId=${encodeURIComponent(companyId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        await fetchEvents();
        if (selectedDate) setSelectedDate(null);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to purge the administrative event.");
      }
    } catch (err: any) {
      setError(err.message || "Network exception encountered.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: EventData['eventStatus']) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/events/${eventId}?companyId=${encodeURIComponent(companyId)}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventStatus: newStatus }),
      });
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventStatus: newStatus }),
      });

      if (res.ok) {
        await fetchEvents();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to transition event state.");
      }
    } catch (err: any) {
      setError(err.message || "API Connection lifecycle failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeStyle = (type: EventData['eventType']) => {
    switch (type) {
      case 'ACADEMIC': return 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900';
      case 'HOLIDAY': return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900';
      case 'MEETING': return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
      case 'SPORTS': return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
      case 'CULTURAL': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900';
      case 'WORKSHOP': return 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getStatusColor = (status: EventData['eventStatus']) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800';
      case 'COMPLETED': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-800';
      case 'POSTPONED': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800';
      case 'CANCELLED': return 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800';
    }
  };

  const resolveAudienceLabels = (event: EventData) => {
    const listMap = (ids: string[], referenceArray: { id: string; name?: string; title?: string }[]) => {
      if (!ids || ids.length === 0) return '';
      return `: ${ids.map(id => referenceArray.find(item => item.id === id)?.name || referenceArray.find(item => item.id === id)?.title || id).slice(0, 2).join(', ')}${ids.length > 2 ? '...' : ''}`;
    };

    switch (event.audience) {
      case 'ACADEMIC_LEVEL': return `Academic Levels${listMap(event.targetAcademicLevelIds, allAcademicLevels)}`;
      case 'COURSE': return `Courses${listMap(event.targetCourseIds, allCourses)}`;
      case 'EDUCATOR': return `Educators${listMap(event.targetEducatorIds, allEducators)}`;
      case 'STUDENT': return `Students${listMap(event.targetStudentIds, allStudents)}`;
      case 'DEPARTMENT': return `Departments${listMap(event.targetDepartmentIds, allDepartments)}`;
      case 'PARENT': return `Parents${listMap(event.targetParentIds, allParents)}`;
      default: return event.audience.replace(/_/g, ' ');
    }
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newDate);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans antialiased selection:bg-indigo-500/10 transition-colors duration-200">
      
      {/* Dynamic Administrative Topbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <span>Admin Control Panel</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span>Operations & Logs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 sm:text-3xl">
            Institutional Master Calendar
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="hidden md:flex bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <CalendarDaysIcon className="h-4 w-4 text-indigo-500" />
            <span>{todayText}</span>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowFormModal(true); setError(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/10 hover:bg-indigo-700 active:scale-[0.98] transition-all"
          >
            <PlusCircleIcon className="h-4 w-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Dynamic Statistical Analytical Overview Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'System Registries', val: events.length, color: 'text-blue-600 dark:text-blue-400', icon: SparklesIcon, bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Active Scheduled', val: events.filter(e => e.eventStatus === 'SCHEDULED' && new Date(e.endDateTime || e.startDateTime) >= new Date()).length, color: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircleIcon, bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Exceptions logged', val: events.filter(e => e.eventStatus === 'POSTPONED' || e.eventStatus === 'CANCELLED').length, color: 'text-amber-600 dark:text-amber-400', icon: ExclamationTriangleIcon, bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Configured Frameworks', val: uniqueEventTypes.length, color: 'text-purple-600 dark:text-purple-400', icon: TagIcon, bg: 'bg-purple-50 dark:bg-purple-900/20', displayMeta: true }
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{card.label}</span>
              {card.displayMeta ? (
                <div className="flex gap-1 overflow-x-auto pt-1 scrollbar-none">
                  {uniqueEventTypes.slice(0, 2).map(t => (
                    <span key={t} className="text-[9px] font-bold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 uppercase tracking-wide whitespace-nowrap">
                      {t.slice(0, 6)}
                    </span>
                  ))}
                  {uniqueEventTypes.length > 2 && <span className="text-[9px] font-bold text-indigo-500 self-center pl-0.5">+{uniqueEventTypes.length - 2}</span>}
                </div>
              ) : (
                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{card.val}</h4>
              )}
            </div>
            <div className={`p-2.5 rounded-xl ${card.bg} flex-shrink-0 ml-2`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Split Interface Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Advanced Interactive Calendar Engine */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 transition-colors"
                title="Previous Month"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2 uppercase">
                <CalendarDaysIcon className="h-4 w-4 text-indigo-500" />
                {getMonthName(currentMonth)}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 transition-colors"
                title="Next Month"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 text-center gap-2">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate === day.date;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(isSelected ? null : day.date)}
                    className={`py-2.5 text-xs rounded-xl relative flex flex-col items-center justify-center transition-all font-bold group select-none border min-h-[42px]
                      ${day.isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300 dark:text-slate-600 border-transparent'}
                      ${day.isToday ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30 border-transparent' : ''}
                      ${day.hasEvent && !day.isToday ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400' : 'border-transparent'}
                      ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'}
                    `}
                  >
                    <span>{new Date(day.date + 'T00:00:00').getDate()}</span>
                    {day.hasEvent && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 transition-colors ${day.isToday ? 'bg-white' : 'bg-indigo-500 dark:bg-indigo-400'}`}></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-indigo-600"></span>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></span>
                <span>Contains Event Logs</span>
              </div>
            </div>
            {selectedDate && (
              <button 
                onClick={() => setSelectedDate(null)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                <XMarkIcon className="h-3 w-3" /> Clear Date Filter
              </button>
            )}
          </div>
        </div>

        {/* Live Monthly Sidebar Track */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-purple-500" /> Monthly Schedule Focus
            </h3>
            <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight line-clamp-1">{event.title}</p>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border uppercase font-extrabold tracking-wider ${getTypeStyle(event.eventType)}`}>
                        {event.eventType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                      <div className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-3 w-3 text-slate-400" />
                        <span>{new Date(event.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1 max-w-[120px]">
                        <MapPinIcon className="h-3 w-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{event.location || 'Distributed/TBD'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <FolderOpenIcon className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-[11px] font-medium">No live system metrics match this scope.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Database Interaction Registry Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Advanced Multi-Tier Search & Filtering Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Operational Ledger</h3>
              {selectedDate && (
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                  Date: {selectedDate}
                  <XMarkIcon className="h-3 w-3 cursor-pointer" onClick={() => setSelectedDate(null)} />
                </span>
              )}
            </div>

            {/* Premium Dual View Controller Switch */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-auto border border-slate-200/40 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                title="Structured Cards Grid View"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                title="Dense Audit Tabular View"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Query via title, descriptions, or coordinator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {[
              { val: filterType, set: setFilterType, opt: uniqueEventTypes, lbl: 'All Classifications' },
              { val: filterAudience, set: setFilterAudience, opt: uniqueAudiences, lbl: 'All Targets' },
              { val: filterStatus, set: setFilterStatus, opt: uniqueStatuses, lbl: 'All States' }
            ].map((f, idx) => (
              <div key={idx} className="relative">
                <select
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full pl-7 pr-2 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="All">{f.lbl}</option>
                  {f.opt.map(o => (
                    <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <FunnelIcon className="h-3 w-3 absolute left-2.5 top-3 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Contextual Content Delivery Framework */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-500 dark:text-slate-400 text-xs gap-3">
            <ArrowPathIcon className="animate-spin h-5 w-5 text-indigo-500" />
            <span className="font-semibold tracking-wide">Syncing contextual matrix...</span>
          </div>
        )}

        {error && (
          <div className="m-5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 p-4 rounded-xl flex items-center justify-between text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-rose-500" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition-colors">
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* View Mode Architecture Dispatcher */}
        {!isLoading && filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-slate-500 space-y-3">
            <FolderOpenIcon className="h-10 w-10 mx-auto text-slate-200 dark:text-slate-800" />
            <p className="text-xs font-bold">No active dynamic logs map into this specified layout array.</p>
            <button 
              onClick={() => { setSearchTerm(''); setFilterType('All'); setFilterAudience('All'); setFilterStatus('All'); setSelectedDate(null); }}
              className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold border border-transparent hover:border-slate-200"
            >
              Reset Search Parameters
            </button>
          </div>
        ) : (
          !isLoading && (
            viewMode === 'grid' ? (
              /* High-Impact Interactive Visual Cards Display */
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fadeIn">
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all relative group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold tracking-wider uppercase ${getTypeStyle(event.eventType)}`}>
                          {event.eventType}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md border uppercase ${getStatusColor(event.eventStatus)}`}>
                          {event.eventStatus}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{event.title}</h4>
                        {event.summary && <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5">{event.summary}</p>}
                      </div>

                      <div className="space-y-1.5 border-t border-b border-slate-50 dark:border-slate-800/80 py-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {new Date(event.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            <span className="mx-1 text-slate-300">|</span>
                            {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{event.location || 'Distributed Architecture'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserGroupIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate font-medium text-indigo-600 dark:text-indigo-400">{resolveAudienceLabels(event)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-1">
                      <div>
                        {event.isPaid ? (
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CurrencyDollarIcon className="h-4 w-4" /> {event.price?.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">Complementary</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        {event.eventStatus === 'SCHEDULED' && (
                          <button
                            onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Cancel Lifecycle Tracker"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                        {event.eventStatus === 'CANCELLED' && (
                          <button
                            onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                            title="Restore Lifecycle Sync"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => { setEditingEvent(event); setShowFormModal(true); setError(null); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                          title="Modify Configurations"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                          title="Purge Record"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tabular View Mode Architecture */
              <div className="overflow-x-auto max-w-full">
                <table className="w-full border-collapse text-left min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 select-none">
                      <th className="px-5 py-3.5">Metadata Asset</th>
                      <th className="px-5 py-3.5">Temporal Matrix</th>
                      <th className="px-5 py-3.5">Spatial Coordinates</th>
                      <th className="px-5 py-3.5">Classification Framework</th>
                      <th className="px-5 py-3.5">Target Scope</th>
                      <th className="px-5 py-3.5">Status Track</th>
                      <th className="px-5 py-3.5 text-right">Operational Array</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    {filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-5 py-3.5 max-w-xs">
                          <div className="font-extrabold text-slate-900 dark:text-white truncate text-xs">{event.title}</div>
                          {event.summary && <div className="text-slate-400 dark:text-slate-500 text-[11px] truncate mt-0.5">{event.summary}</div>}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap font-medium">
                          <div className="text-slate-800 dark:text-slate-200">{new Date(event.startDateTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <ClockIcon className="h-3 w-3 text-slate-400" />
                            <span>
                              {new Date(event.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {event.endDateTime && ` - ${new Date(event.endDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 max-w-[180px]">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 truncate">
                            <MapPinIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            <span>{event.location || 'Distributed Ecosystem'}</span>
                          </div>
                          {event.onlineMeetingLink && (
                            <a href={event.onlineMeetingLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline text-[10px] flex items-center gap-0.5 mt-1 font-bold">
                              <GlobeAltIcon className="h-3 w-3" /> Secure Sync Access
                            </a>
                          )}
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded border text-[9px] font-extrabold tracking-wider uppercase ${getTypeStyle(event.eventType)}`}>
                              {event.eventType}
                            </span>
                            {event.isPaid && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 rounded flex items-center">
                                ${event.price?.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 max-w-[160px]">
                          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                            <UserGroupIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate text-indigo-600 dark:text-indigo-400">{resolveAudienceLabels(event)}</span>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md border uppercase tracking-wide ${getStatusColor(event.eventStatus)}`}>
                            {event.eventStatus}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {event.eventStatus === 'SCHEDULED' && (
                              <button
                                onClick={() => updateEventStatus(event.id, 'CANCELLED')}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                                title="Cancel Lifecycle Array"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            )}
                            {(event.eventStatus === 'CANCELLED' || event.eventStatus === 'POSTPONED') && (
                              <button
                                onClick={() => updateEventStatus(event.id, 'SCHEDULED')}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg transition-colors"
                                title="Re-initialize Tracker"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => { setEditingEvent(event); setShowFormModal(true); setError(null); }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )
        )}
      </div>

      {/* Structured Entry Modification Drawer Portal */}
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