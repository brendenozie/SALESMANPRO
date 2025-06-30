'use client';

import React, { useState, useMemo } from 'react';
import {
  MegaphoneIcon, // General announcements icon
  CalendarDaysIcon, // For date
  PlusCircleIcon, // For add announcement
  PencilIcon, // For edit
  MagnifyingGlassIcon, // For search
  TrashIcon, // For delete
  ArchiveBoxIcon, // For archive
  ArrowPathIcon, // For unarchive
  BellAlertIcon, // For urgent
  UsersIcon, // For audience
  ClockIcon, // For publish date
} from '@heroicons/react/24/outline';

// Announcement type definition
type Announcement = {
  id: string;
  title: string;
  message: string;
  publishDate: string;
  expiryDate: string;
  audience: string;
  status: string;
  type: string;
  isUrgent: boolean;
};

// Sample Announcement Data
const sampleAnnouncements: Announcement[] = [
  {
    id: 'AN001',
    title: 'Midterm Exam Schedule Published',
    message: 'The official midterm exam schedule for all grades is now available on the student portal. Please review carefully.',
    publishDate: '2025-06-25',
    expiryDate: '2025-07-15',
    audience: 'All Students',
    status: 'Active', // Active, Archived, Draft
    type: 'Academic', // Academic, General, Event, Policy
    isUrgent: true,
  },
  {
    id: 'AN002',
    title: 'School Closed for National Holiday',
    message: 'School will be closed on July 6th, 2025, in observance of the national holiday (Eid al-Adha).',
    publishDate: '2025-06-20',
    expiryDate: '2025-07-07',
    audience: 'All',
    status: 'Active',
    type: 'Holiday',
    isUrgent: false,
  },
  {
    id: 'AN003',
    title: 'Chess Club Practice Rescheduled',
    message: 'Due to unforeseen circumstances, tomorrow\'s Chess Club practice (June 26th) is moved to Friday, June 28th, at 3:30 PM.',
    publishDate: '2025-06-25',
    expiryDate: '2025-06-28',
    audience: 'Grade 7, Grade 8',
    status: 'Active',
    type: 'Event',
    isUrgent: true,
  },
  {
    id: 'AN004',
    title: 'New Cafeteria Menu Available',
    message: 'The new cafeteria menu for July is now posted on the school website and bulletin boards.',
    publishDate: '2025-06-24',
    expiryDate: '2025-07-31',
    audience: 'All',
    status: 'Active',
    type: 'General',
    isUrgent: false,
  },
  {
    id: 'AN005',
    title: 'Reminder: Teacher Professional Development',
    message: 'All faculty members are required to attend the PD session on July 25th in the Staff Conference Room.',
    publishDate: '2025-06-15',
    expiryDate: '2025-07-26',
    audience: 'All Teachers',
    status: 'Archived', // Example archived announcement
    type: 'Academic',
    isUrgent: false,
  },
];

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(sampleAnnouncements);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAudience, setFilterAudience] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const uniqueAudiences = useMemo(() => Array.from(new Set(announcements.map(a => a.audience))).sort(), [announcements]);
  const uniqueTypes = useMemo(() => Array.from(new Set(announcements.map(a => a.type))).sort(), [announcements]);
  const uniqueStatuses = useMemo(() => Array.from(new Set(announcements.map(a => a.status))).sort(), [announcements]);

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          announcement.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience = filterAudience === 'All' || announcement.audience === filterAudience;
    const matchesStatus = filterStatus === 'All' || announcement.status === filterStatus;
    const matchesType = filterType === 'All' || announcement.type === filterType;
    return matchesSearch && matchesAudience && matchesStatus && matchesType;
  }).sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()); // Sort by most recent publish date

  const activeAnnouncementsCount = announcements.filter(a => a.status === 'Active').length;
  const urgentAnnouncementsCount = announcements.filter(a => a.status === 'Active' && a.isUrgent).length;

  const handleAddNewAnnouncement = (newAnnouncementData: Omit<Announcement, 'id'>) => {
    const newId = `AN${String(announcements.length + 1).padStart(3, '0')}`; // Simple ID generation
    setAnnouncements([...announcements, { id: newId, ...newAnnouncementData }]);
    setShowFormModal(false);
  };
  const handleEditAnnouncement = (updatedAnnouncementData: Announcement | Omit<Announcement, 'id'>) => {
    // Ensure updatedAnnouncementData has an id before updating
    if ('id' in updatedAnnouncementData) {
      setAnnouncements(announcements.map(ann => ann.id === updatedAnnouncementData.id ? updatedAnnouncementData as Announcement : ann));
      setShowFormModal(false);
      setEditingAnnouncement(null);
    }
  };
  const handleDeleteAnnouncement = (announcementId: string) => {
    if (confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) { // Use custom modal in real app
      setAnnouncements(announcements.filter(ann => ann.id !== announcementId));
    }
  };
  const toggleAnnouncementStatus = (announcementId: string, currentStatus: string) => {
    setAnnouncements(announcements.map(ann =>
      ann.id === announcementId ? { ...ann, status: currentStatus === 'Active' ? 'Archived' : 'Active' } : ann
    ));
  };
  const toggleUrgentStatus = (announcementId: string) => {
    setAnnouncements(announcements.map(ann =>
      ann.id === announcementId ? { ...ann, isUrgent: !ann.isUrgent } : ann
    ));
  };

  const archivedAnnouncementsCount = announcements.filter(a => a.status === 'Archived').length;



  // Helper for status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  // Event handlers
  // const handleAddNewAnnouncement = (newAnnouncementData) => {
  //   const newId = `AN${String(announcements.length + 1).padStart(3, '0')}`; // Simple ID generation
  //   setAnnouncements([...announcements, { id: newId, ...newAnnouncementData }]);
  //   setShowFormModal(false);
  // };

  // const handleEditAnnouncement = (updatedAnnouncementData) => {
  //   setAnnouncements(announcements.map(ann => ann.id === updatedAnnouncementData.id ? updatedAnnouncementData : ann));
  //   setShowFormModal(false);
  //   setEditingAnnouncement(null);
  // };

  // const handleDeleteAnnouncement = (announcementId) => {
  //   if (confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) { // Use custom modal in real app
  //     setAnnouncements(announcements.filter(ann => ann.id !== announcementId));
  //   }
  // };

  // const toggleAnnouncementStatus = (announcementId, currentStatus) => {
  //   setAnnouncements(announcements.map(ann =>
  //     ann.id === announcementId ? { ...ann, status: currentStatus === 'Active' ? 'Archived' : 'Active' } : ann
  //   ));
  // };

  // const toggleUrgentStatus = (announcementId) => {
  //   setAnnouncements(announcements.map(ann =>
  //     ann.id === announcementId ? { ...ann, isUrgent: !ann.isUrgent } : ann
  //   ));
  // };

  // --- Announcement Form Modal ---
  type AnnouncementFormModalProps = {
    announcementData?: Announcement | null;
    onClose: () => void;
    onSave: (data: Announcement | Omit<Announcement, 'id'>) => void;
    isEdit?: boolean;
  };

  const AnnouncementFormModal: React.FC<AnnouncementFormModalProps> = ({ announcementData, onClose, onSave, isEdit = false }) => {
    const [formData, setFormData] = useState(announcementData || {
      title: '', message: '', publishDate: new Date().toISOString().split('T')[0], expiryDate: '', audience: '', status: 'Active', type: '', isUrgent: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let fieldValue: string | boolean = value;
      if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        fieldValue = e.target.checked;
      }
      setFormData(prev => ({ ...prev, [name]: fieldValue }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isEdit && announcementData) {
        // For edit, ensure id is included
        onSave({ ...(formData as Announcement), id: announcementData.id });
      } else {
        // For add, omit id
        const { id, ...rest } = formData as Announcement;
        onSave(rest);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{isEdit ? `Edit Announcement: ${formData.title}` : 'Create New Announcement'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea name="message" id="message" value={formData.message} onChange={handleChange} required rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700">Publish Date</label>
                <input type="date" name="publishDate" id="publishDate" value={formData.publishDate} onChange={handleChange} required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              </div>
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date (Optional)</label>
                <input type="date" name="expiryDate" id="expiryDate" value={formData.expiryDate} onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
              </div>
            </div>
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700">Audience</label>
              <select name="audience" id="audience" value={formData.audience} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Audience --</option>
                <option value="All">All School</option>
                <option value="All Students">All Students</option>
                <option value="All Teachers">All Teachers</option>
                <option value="Parents">Parents Only</option>
                <option value="Grade 7">Grade 7 Students</option>
                <option value="Grade 8">Grade 8 Students</option>
                {/* Add more specific audiences as needed */}
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Announcement Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="">-- Select Type --</option>
                <option value="Academic">Academic</option>
                <option value="General">General</option>
                <option value="Event">Event</option>
                <option value="Holiday">Holiday</option>
                <option value="Policy">Policy Update</option>
              </select>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="isUrgent" id="isUrgent" checked={formData.isUrgent} onChange={handleChange}
                className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
              <label htmlFor="isUrgent" className="ml-2 block text-sm font-medium text-gray-700">Mark as Urgent</label>
            </div>
            {isEdit && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select name="status" id="status" value={formData.status} onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {isEdit ? 'Save Changes' : 'Publish Announcement'}
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
            Announcements Management
            <span className="ml-2 text-red-600 text-base sm:text-xl">📢</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Create, edit, and publish school-wide announcements.</p>
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
              <MegaphoneIcon className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Announcements</p>
              <h2 className="text-3xl font-bold text-gray-800">{activeAnnouncementsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <BellAlertIcon className="h-7 w-7 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Announcements</p>
              <h2 className="text-3xl font-bold text-gray-800">{urgentAnnouncementsCount}</h2>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-gray-50">
          <div className="flex items-center mb-3">
            <div className="p-2 bg-white rounded-full shadow-sm mr-3">
              <ArchiveBoxIcon className="h-7 w-7 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Archived Announcements</p>
              <h2 className="text-3xl font-bold text-gray-800">{archivedAnnouncementsCount}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements List Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MegaphoneIcon className="h-5 w-5 text-indigo-500" /> All Announcements
          </h3>
          <button
            onClick={() => { setEditingAnnouncement(null); setShowFormModal(true); }} // Clear editing state for new
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                       hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5" /> Create New Announcement
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
              placeholder="Search by title or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
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
          <div className="flex-shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="All">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Announcements Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <span className="flex items-center">
                            {announcement.isUrgent && <BellAlertIcon className="h-4 w-4 text-red-500 mr-2" title="Urgent" />}
                            {announcement.title}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                            {announcement.audience}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
                            {announcement.type}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(announcement.publishDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {announcement.expiryDate ? new Date(announcement.expiryDate).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(announcement.status)}`}>
                        {announcement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleUrgentStatus(announcement.id)}
                          className={`flex items-center ${announcement.isUrgent ? 'text-orange-600 hover:text-orange-800' : 'text-gray-400 hover:text-gray-600'}`}
                          title={announcement.isUrgent ? 'Mark as Not Urgent' : 'Mark as Urgent'}
                        >
                          <BellAlertIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setEditingAnnouncement(announcement); setShowFormModal(true); }}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          title="Edit Announcement"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleAnnouncementStatus(announcement.id, announcement.status)}
                          className={`flex items-center ${announcement.status === 'Active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          title={announcement.status === 'Active' ? 'Archive Announcement' : 'Reactivate Announcement'}
                        >
                          {announcement.status === 'Active' ? <ArchiveBoxIcon className="h-4 w-4" /> : <ArrowPathIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-gray-400 hover:text-gray-600 flex items-center"
                          title="Delete Announcement"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No announcements found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFormModal && <AnnouncementFormModal announcementData={editingAnnouncement} onClose={() => setShowFormModal(false)} onSave={editingAnnouncement ? handleEditAnnouncement : handleAddNewAnnouncement} isEdit={!!editingAnnouncement} />}
    </div>
  );
}
