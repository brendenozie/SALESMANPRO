'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  CalendarDaysIcon, // For date input
  ClockIcon, // For time input
  MapPinIcon, // For location input
  TagIcon, // For event type
  BellIcon, // For notification settings
  CheckCircleIcon, // For success message
  ExclamationCircleIcon, // For error message
} from '@heroicons/react/24/outline';
import { useStoreContext } from '@/contexts/StoreContext';

// Mocking context data for demonstration purposes
const useMockStoreContext = () => ({
  storeFormData: {
    themeSettings: {
      primaryColor: "#fd2121", // Red from your sample
      accentColor: "#FFC107", // Amber Yellow, for consistency
    },
    teacherClasses: [ // Sample classes with mock events
      {
        id: '6863daeef4ad17d957b92403',
        name: 'Grade 7 Mathematics',
        grade: '7',
        studentsEnrolled: 35,
        events: [
          { id: 'EV001', title: 'Math Club Meeting', date: '2025-07-15', time: '3:00 PM', location: 'Room 101', type: 'Club Meeting' },
          { id: 'EV002', title: 'Algebra Review Session', date: '2025-07-20', time: '10:00 AM', location: 'Online (Zoom)', type: 'Study Session' },
        ],
      },
      {
        id: 'CL102',
        name: 'Grade 8 English Language',
        grade: '8',
        studentsEnrolled: 30,
        events: [
          { id: 'EV003', title: 'Poetry Slam Tryouts', date: '2025-07-22', time: '4:00 PM', location: 'Auditorium', type: 'Audition' },
        ],
      },
    ]
  },
});

interface AddClassEventPageProps {
  classId: string; // The ID of the class for which to add an event
  // onBack: () => void; // Callback to navigate back to the previous page (e.g., Class List)
}

export default function AddClassEventPage({ classId }: AddClassEventPageProps) {
  // IMPORTANT: In your actual application, use:
  // const { storeFormData } = useStoreContext();
  const { storeFormData } = useMockStoreContext();

  const primaryColor = storeFormData?.themeSettings?.primaryColor || '#fd2121';
  const accentColor = storeFormData?.themeSettings?.accentColor || "#FFC107";

  const [currentClass, setCurrentClass] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form states for event details
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventType, setEventType] = useState('General'); // Default type
  const [sendNotifications, setSendNotifications] = useState(true); // Default to true

  const eventTypes = [
    'General', 'Field Trip', 'Guest Speaker', 'Parent Meeting', 'Exam', 'Study Session', 'Club Meeting', 'Audition', 'Performance'
  ];

  useEffect(() => {
    const foundClass = storeFormData?.teacherClasses?.find(cls => cls.id === classId);
    setCurrentClass(foundClass || null);
  }, [classId, storeFormData?.teacherClasses]);

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000); // Clear after 3 seconds
  };

  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventTime('');
    setEventLocation('');
    setEventType('General');
    setSendNotifications(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentClass) {
      showStatus('error', 'Class not loaded.');
      return;
    }

    if (!eventTitle || !eventDate || !eventTime || !eventLocation) {
      showStatus('error', 'Please fill in all required fields (Title, Date, Time, Location).');
      return;
    }

    const newEvent = {
      id: `EV${Date.now()}`, // Simple unique ID
      title: eventTitle,
      description: eventDescription,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      type: eventType,
      sendNotifications: sendNotifications, // This would trigger actual notifications in a real system
    };

    // Simulate adding the event to the current class's events list
    // In a real application, you would send this data to your backend API
    // e.g., fetch(`/api/classes/${classId}/events`, { method: 'POST', body: JSON.stringify(newEvent) });

    setCurrentClass((prevClass: any) => ({
      ...prevClass,
      events: [...(prevClass.events || []), newEvent],
    }));

    showStatus('success', `Event "${newEvent.title}" added successfully!`);
    resetForm();
  };

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  if (!currentClass) {
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Class Not Found</h2>
        <p className="text-gray-500 mb-6">The class with ID "{classId}" could not be loaded to add an event.</p>
        <button
          onClick={() => window.history.back()}
          className={`inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-md shadow-sm
                      hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
        >
          <ArrowLeftIcon className="h-5 w-5" /> Back to Class List
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Add Class Event <span style={{ color: primaryColor }}>{currentClass.name}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Schedule new activities, meetings, or important dates for your class.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-3 rounded-md flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Event Form */}
      <motion.div
        className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6"
        variants={containerVariants}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Details</h2>
        <form onSubmit={handleSaveEvent} className="space-y-5">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <input
              type="text"
              id="event-title"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g., Parent-Teacher Conference, Field Trip to Museum"
              required
            />
          </div>
          <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              id="event-description"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}] resize-y"
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              placeholder="Provide more details about the event..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <input
                  type="date"
                  id="event-date"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
                <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <div className="relative">
                <input
                  type="time"
                  id="event-time"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                />
                <ClockIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <input
                type="text"
                id="event-location"
                className="w-full p-3 pl-10 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}]"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="e.g., School Auditorium, Online (Zoom Link)"
                required
              />
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="event-type" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
            <div className="relative">
              <select
                id="event-type"
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}] appearance-none pr-10"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <TagIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="send-notifications"
              className={`h-5 w-5 rounded border-gray-300 text-[${primaryColor}] focus:ring-[${primaryColor}]`}
              checked={sendNotifications}
              onChange={(e) => setSendNotifications(e.target.checked)}
            />
            <label htmlFor="send-notifications" className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-gray-500" /> Send notifications to students/parents
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className={`px-6 py-3 bg-[${primaryColor}] text-white font-semibold rounded-md shadow-md
                          hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]`}
            >
              Save Event
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
