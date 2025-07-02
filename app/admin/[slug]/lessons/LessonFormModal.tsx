'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { TimetableEntry, CourseOption, EducatorOption } from './WeeklyTimetable';

interface LessonFormModalProps {
  entryData: TimetableEntry | null;
  onClose: () => void;
  onSave: (lessonData: TimetableEntry) => void;
  isLoading: boolean;
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  companyId: string;
  selectedDayOfWeek: string;
  selectedTimeSlot: string;
}

export default function LessonFormModal({
  entryData,
  onClose,
  onSave,
  isLoading,
  allCourses,
  allEducators,
  companyId,
  selectedDayOfWeek,
  selectedTimeSlot,
}: LessonFormModalProps) {
  const [formData, setFormData] = useState<TimetableEntry>(() => {
    const defaultStartTime = `1970-01-01T${selectedTimeSlot || '08:00'}:00Z`;
    const defaultEndTime = `1970-01-01T${selectedTimeSlot || '08:45'}:00Z`;

    return entryData ?? {
      id: '',
      courseId: '',
      courseTitle: '',
      courseAcademicLevels: [],
      educatorId: '',
      educatorName: '',
      educatorEmail: '',
      dayOfWeek: selectedDayOfWeek || 'Monday',
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      topic: '',
      meetingLink: '',
      companyId,
      createdAt: '',
      updatedAt: '',
    };
  });

  useEffect(() => {
    if (entryData) setFormData(entryData);
  }, [entryData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (name: 'startTime' | 'endTime', value: string) => {
    const [h, m] = value.split(':').map(Number);
    const date = new Date('1970-01-01T00:00:00Z');
    date.setUTCHours(h, m);
    setFormData((prev) => ({ ...prev, [name]: date.toISOString() }));
  };

  const handleSubmit = () => {
    if (!formData.courseId || !formData.educatorId || !formData.startTime || !formData.endTime) return;
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {formData.id ? 'Edit Lesson' : 'Create New Lesson'}
        </h2>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Course Select */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Course</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select course</option>
              {allCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            {formData.courseId && (
              <div className="mt-1 flex flex-wrap gap-1">
                {(allCourses.find(c => c.id === formData.courseId)?.academicLevels || []).map((level) => (
                  <span
                    key={level.id}
                    className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
                  >
                    {level.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Educator Select */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Educator</label>
            <select
              name="educatorId"
              value={formData.educatorId}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select educator</option>
              {allEducators.map((edu) => (
                <option key={edu.id} value={edu.id}>
                  {edu.name} ({edu.email})
                </option>
              ))}
            </select>
          </div>

          {/* Day */}
          <div>
            <label className="text-sm font-semibold text-gray-700">Day</label>
            <select
              name="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700">Start Time</label>
              <input
                type="time"
                value={new Date(formData.startTime).toISOString().substring(11, 16)}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-semibold text-gray-700">End Time</label>
              <input
                type="time"
                value={new Date(formData.endTime).toISOString().substring(11, 16)}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Meeting Link</label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink || ''}
              onChange={handleChange}
              placeholder="https://zoom.us/..."
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Topic */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Lesson Topic</label>
            <textarea
              name="topic"
              value={formData.topic || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Introduction to Geometry"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-sm font-semibold text-white 
              ${isLoading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} transition`}
          >
            {isLoading ? 'Saving...' : formData.id ? 'Update Lesson' : 'Add Lesson'}
          </button>
        </div>
      </div>
    </div>
  );
}
