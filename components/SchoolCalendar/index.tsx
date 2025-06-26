'use client';

import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { gapi } from 'gapi-script';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';


type EventType = 'exam' | 'meeting' | 'holiday';

interface EventWithMeta extends EventInput {
  createdBy: string;
  type: EventType;
}

interface Props {
  role: 'principal' | 'teacher';
  userId: string;
}

export default function SchoolCalendar({ role, userId }: Props) {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<DateSelectArg | EventClickArg | null>(null);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', type: 'meeting' as EventType });

  const tagColors: Record<EventType, string> = {
    exam: 'bg-red-100 text-red-600',
    meeting: 'bg-blue-100 text-blue-600',
    holiday: 'bg-green-100 text-green-600',
  };

  useEffect(() => {
    const mock: EventWithMeta[] = [
      { id: '1', title: 'Parent Meeting', start: '2025-06-27T10:00:00', createdBy: 'admin', type: 'meeting' },
      { id: '2', title: 'Math Exam', start: '2025-07-01T09:00:00', createdBy: 'teacher123', type: 'exam' },
      { id: '3', title: 'School Holiday', start: '2025-07-10', createdBy: 'admin', type: 'holiday' },
    ];
    const filtered = mock.filter(evt => role === 'principal' || evt.createdBy === userId);
    setEvents(filtered);
  }, [role, userId]);

  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: 'YOUR_API_KEY',
        clientId: 'YOUR_CLIENT_ID',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
      }).then(() => {
        gapi.client.calendar.events.list({
          calendarId: 'primary',
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        }).then((resp: { result: { items?: Array<{ id?: string; summary?: string; start?: { dateTime?: string; date?: string } }> } }) => {
          const googleEvents = resp.result.items?.map(evt => ({
            id: evt.id!,
            title: evt.summary || '',
            start: evt.start?.dateTime || evt.start?.date || '',
            backgroundColor: '#4285F4',
            createdBy: 'google',
            type: 'meeting' as EventType,
          })) || [];
          setEvents(prev => [...prev, ...googleEvents as EventWithMeta[]]);
        });
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setFormData({
      title: '',
      date: selectInfo.startStr.split('T')[0],
      time: selectInfo.startStr.split('T')[1]?.substring(0, 5) || '',
      type: 'meeting',
    });
    setSelectedInfo(selectInfo);
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = clickInfo.event;
    const existing = events.find(e => e.id === event.id);
    if (!existing) return;

    const date = event.startStr;
    setFormData({
      title: event.title,
      date: date.split('T')[0],
      time: date.split('T')[1]?.substring(0, 5) || '',
      type: existing.type,
    });
    setSelectedInfo(clickInfo);
    setModalOpen(true);
  };

  const handleSave = () => {
    const dt = new Date(`${formData.date}T${formData.time}`);
    const id = selectedInfo && 'event' in selectedInfo ? selectedInfo.event.id : String(Math.random());
    const newEvent: EventWithMeta = {
      id,
      title: formData.title,
      start: dt.toISOString(),
      createdBy: userId,
      type: formData.type,
    };

    if (selectedInfo && 'event' in selectedInfo) {
      setEvents(prev => prev.map(e => (e.id === id ? newEvent : e)));
    } else {
      setEvents(prev => [...prev, newEvent]);
    }

    setModalOpen(false);
    setSelectedInfo(null);
    if (selectedInfo && 'start' in selectedInfo) {
      calendarRef.current?.getApi().unselect();
    }
  };

  const handleDelete = () => {
    if (selectedInfo && 'event' in selectedInfo) {
      const id = selectedInfo.event.id;
      setEvents(prev => prev.filter(e => e.id !== id));
    }
    setModalOpen(false);
    setSelectedInfo(null);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-white p-rounded-xl shadow-md border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2 ">
        <CalendarDaysIcon className="h-5 w-5 text-purple-500" /> Calendar
      </h3>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={role === 'principal'}
        selectMirror={true}
        events={events.map(e => ({
          ...e,
          classNames: e.createdBy !== 'google' ? tagColors[e.type] : '',
        }))}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="auto"
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedInfo && 'event' in selectedInfo ? 'Edit Event' : 'New Event'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Type</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as EventType })}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="meeting">Meeting</option>
                  <option value="exam">Exam</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </button>
              <div className="flex gap-4">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
