"use client";

import React, { useState, useMemo } from 'react';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  MinusCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// --- INTERFACES & MOCK DATA ---

type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';

interface Appointment {
  id: string;
  clientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM AM/PM
  status: AppointmentStatus;
  topic: string;
  link: string; // Mock meeting link
}

const initialAppointments: Appointment[] = [
  // Appointments in October 2025
  { id: 'a1', clientName: 'Sarah Connor', date: '2025-10-25', time: '10:00 AM', status: 'Confirmed', topic: 'Q4 Strategy Review', link: '#' },
  { id: 'a2', clientName: 'John Doe', date: '2025-10-26', time: '02:00 PM', status: 'Pending', topic: 'Initial Consultation', link: '#' },
  { id: 'a3', clientName: 'Alice Smith', date: '2025-10-27', time: '11:00 AM', status: 'Confirmed', topic: 'Execution Check-in', link: '#' },
  { id: 'a4', clientName: 'Robert Green', date: '2025-10-20', time: '09:00 AM', status: 'Completed', topic: 'Kick-off Session', link: '#' },
  // Appointment in November 2025
  { id: 'a5', clientName: 'Jane Foster', date: '2025-11-03', time: '03:30 PM', status: 'Confirmed', topic: 'Scaling Workshop', link: '#' },
];

const statusMap: Record<AppointmentStatus, { color: string; icon: React.ElementType }> = {
  Confirmed: { color: 'bg-indigo-100 text-indigo-700 border-indigo-500', icon: CheckCircleIcon },
  Pending: { color: 'bg-amber-100 text-amber-700 border-amber-500', icon: MinusCircleIcon },
  Completed: { color: 'bg-green-100 text-green-700 border-green-500', icon: CheckCircleIcon },
  Cancelled: { color: 'bg-red-100 text-red-700 border-red-500', icon: XCircleIcon },
};

// --- HELPER COMPONENTS ---

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; accent: string }> = ({ title, value, icon: Icon, accent }) => (
    <div className="p-5 bg-white rounded-2xl shadow-md border-b-4 border-gray-100 transition hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-6 h-6 ${accent}`} />
        <p className="text-sm font-medium text-gray-500">{title}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
);

const AppointmentCard: React.FC<{ appointment: Appointment }> = ({ appointment }) => {
  const { color, icon: StatusIcon } = statusMap[appointment.status];

  return (
    <div className={`p-5 bg-white rounded-xl shadow-lg transition duration-200 hover:shadow-xl border-l-4 ${statusMap[appointment.status].color.split(' ')[2].replace('border-', 'border-')}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1">
            <ClockIcon className="w-3 h-3" /> {appointment.time}
          </p>
          <h3 className="text-lg font-bold text-gray-900 mt-1">{appointment.topic}</h3>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
          <StatusIcon className="w-3 h-3 inline mr-1" />{appointment.status}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2 text-indigo-600 font-medium">
          <UsersIcon className="w-4 h-4" />
          {appointment.clientName}
        </div>
        <a 
          href={appointment.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition text-xs font-semibold"
        >
          Join Session
        </a>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function BookingAndSchedulingClient() {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 20)); // Start at Oct 2025
  const [activeFilter, setActiveFilter] = useState<'All' | AppointmentStatus>('All');

  // --- Date & Calendar Logic ---

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0];

  const firstDayOfMonth = new Date(year, month, 1).getDay() || 7; // 1 (Mon) to 7 (Sun)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handleMonthChange = (direction: number) => {
    setCurrentDate(prevDate => {
      const newMonth = prevDate.getMonth() + direction;
      return new Date(prevDate.getFullYear(), newMonth, 1);
    });
  };

  const calendarDays = useMemo(() => {
    const days: ({ day: number | null, dateString: string | null })[] = [];
    const dateCheckSet = new Set(appointments.map(a => a.date));

    // Fill leading empty days (offset by -1 because date.getDay() returns 0 for Sunday)
    const startOffset = (firstDayOfMonth === 1 ? 0 : firstDayOfMonth - 1);
    for (let i = 0; i < startOffset; i++) {
        days.push({ day: null, dateString: null });
    }

    // Fill actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = new Date(year, month, day).toISOString().split('T')[0];
        days.push({ day, dateString });
    }

    return days.map(d => ({
        ...d,
        hasAppointment: d.dateString ? dateCheckSet.has(d.dateString) : false,
        isToday: d.dateString === todayDateString,
        isPast: d.dateString ? d.dateString < todayDateString : false,
    }));
  }, [month, year, daysInMonth, appointments, todayDateString, firstDayOfMonth]);


  // --- Filtering and Metrics Logic ---

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(app => activeFilter === 'All' || app.status === activeFilter)
      .filter(app => {
        // Only show appointments from the current month or later for the list view
        const appDate = new Date(app.date);
        return appDate >= new Date(year, month, 1) || app.status !== 'Completed';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, activeFilter, month, year]);

  const metrics = useMemo(() => {
    const confirmedCount = appointments.filter(a => a.status === 'Confirmed').length;
    const pendingCount = appointments.filter(a => a.status === 'Pending').length;
    const upcomingCount = appointments.filter(a => a.date >= todayDateString && (a.status === 'Confirmed' || a.status === 'Pending')).length;

    return { confirmedCount, pendingCount, upcomingCount };
  }, [appointments, todayDateString]);


  // --- Render Logic ---

  const allStatuses: ('All' | AppointmentStatus)[] = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">

        {/* --- Header and Title --- */}
        <header className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            Schedule & <span className="text-amber-600">Booking</span>
            <CalendarDaysIcon className="w-10 h-10 text-indigo-500" />
          </h1>
          <p className="text-xl text-gray-600 font-light mt-2">
            Manage your client sessions, availability, and meeting links.
          </p>
        </header>

        {/* --- Key Metrics --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricCard
            title="Upcoming Sessions"
            value={metrics.upcomingCount}
            icon={CalendarDaysIcon}
            accent="text-indigo-600"
          />
          <MetricCard
            title="Confirmed Bookings"
            value={metrics.confirmedCount}
            icon={CheckCircleIcon}
            accent="text-green-600"
          />
          <MetricCard
            title="Pending Requests"
            value={metrics.pendingCount}
            icon={MinusCircleIcon}
            accent="text-amber-600"
          />
        </section>

        {/* --- Calendar and Appointment List Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ minHeight: '600px' }}>

            {/* --- Left Column: Calendar View --- */}
            <div className="lg:col-span-1 p-6 bg-white rounded-3xl shadow-xl">
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-700">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                        {monthNames[month]} {year}
                    </h2>
                    <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-gray-100 transition text-gray-700">
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Day Names */}
                <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase text-gray-500 mb-2">
                    {dayNames.map(day => <span key={day}>{day}</span>)}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((dayData, index) => (
                        <div
                            key={index}
                            className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition ${
                                dayData.day === null ? 'bg-transparent' : 
                                dayData.isToday ? 'bg-indigo-600 text-white shadow-lg font-bold' : 
                                dayData.hasAppointment ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer border border-amber-300' :
                                dayData.isPast ? 'text-gray-400' :
                                'text-gray-700 hover:bg-gray-50 cursor-pointer'
                            }`}
                        >
                            {dayData.day}
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition shadow-md">
                        <PlusIcon className="w-5 h-5" /> Block Time
                    </button>
                </div>
            </div>

            {/* --- Right Column: Appointment List --- */}
            <div className="lg:col-span-2 p-6 bg-white rounded-3xl shadow-xl flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">
                    Upcoming Sessions Detail
                </h2>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {allStatuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setActiveFilter(status)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 ${
                                activeFilter === status
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Appointment List */}
                <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(app => (
                            <AppointmentCard key={app.id} appointment={app} />
                        ))
                    ) : (
                        <div className="p-10 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 italic">
                            <XCircleIcon className="w-10 h-10 mx-auto mb-3" />
                            <p>No **{activeFilter}** appointments found for the current filter and month.</p>
                        </div>
                    )}
                </div>
                
            </div>
        </div>

      </div>
    </div>
  );
}
