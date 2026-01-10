import React, { useEffect, useState } from 'react';
import { XMarkIcon, BookOpenIcon, UsersIcon, CalendarDaysIcon, ClockIcon, LinkIcon, DocumentTextIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { TimetableEntry, CourseOption, EducatorOption } from './WeeklyTimetable'; // Import types
import { ClassroomOption } from '../teachers/page';

interface LessonFormModalProps {
  isOpen: boolean; // Added isOpen prop for explicit modal control
  entryData: TimetableEntry | null;
  onClose: () => void;
  onSave: (lessonData: Omit<TimetableEntry, 'courseTitle' | 'courseCode' | 'courseAcademicLevels' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  isLoading: boolean;
  allCourses: CourseOption[];
  allClassrooms: ClassroomOption[];
  allEducators: EducatorOption[];
  companyId: string;
  selectedDayOfWeek: string;
  selectedTimeSlot: string;
}

// Helper to format Date object to HH:MM string (UTC)
const formatTimeToHHMM = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    console.error("Invalid date string passed to formatTimeToHHMM:", isoString);
    return '00:00';
  }
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function LessonFormModal({
  isOpen,
  entryData,
  onClose,
  onSave,
  isLoading,
  allCourses,
  allClassrooms,
  allEducators,
  companyId,
  selectedDayOfWeek,
  selectedTimeSlot,
}: LessonFormModalProps) {
  type LessonFormData = Omit<TimetableEntry, 'courseTitle' | 'courseCode' | 'courseAcademicLevels' | 'courseClassrooms' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'> & { id?: string; classroomId: string };

  const [formData, setFormData] = useState<LessonFormData>(() => {
    const defaultStartTimeISO = selectedTimeSlot ? `1970-01-01T${selectedTimeSlot}:00Z` : '1970-01-01T08:00:00Z';
    const startTimeDate = new Date(defaultStartTimeISO);
    const defaultEndTimeISO = new Date(startTimeDate.getTime() + 45 * 60 * 1000).toISOString(); // Add 45 minutes

    return entryData ? {
      id: entryData.id,
      courseId: entryData.courseId,
      educatorId: entryData.educatorId,
      classroomId: entryData.courseClassrooms && entryData.courseClassrooms.length > 0 ? entryData.courseClassrooms[0].id : '',
      dayOfWeek: entryData.dayOfWeek,
      startTime: (entryData.startTime && !isNaN(new Date(entryData.startTime).getTime())) ? entryData.startTime : defaultStartTimeISO,
      endTime: (entryData.endTime && !isNaN(new Date(entryData.endTime).getTime())) ? entryData.endTime : defaultEndTimeISO,
      topic: entryData.topic || '',
      meetingLink: entryData.meetingLink || '',
      companyId,
    } : {
      id: '',
      courseId: '',
      educatorId: '',
      classroomId: '',
      dayOfWeek: selectedDayOfWeek || 'Monday',
      startTime: defaultStartTimeISO,
      endTime: defaultEndTimeISO,
      topic: '',
      meetingLink: '',
      companyId,
    };
  });

  useEffect(() => {
    if (entryData) {
      setFormData({
        id: entryData.id || "",
        courseId: entryData.courseId,
        classroomId: entryData.courseClassrooms && entryData.courseClassrooms.length > 0 ? entryData.courseClassrooms[0].id : '',
        educatorId: entryData.educatorId,
        dayOfWeek: entryData.dayOfWeek,
        startTime: (entryData.startTime && !isNaN(new Date(entryData.startTime).getTime())) ? entryData.startTime : '1970-01-01T08:00:00Z',
        endTime: (entryData.endTime && !isNaN(new Date(entryData.endTime).getTime())) ? entryData.endTime : '1970-01-01T08:45:00Z',
        topic: entryData.topic || '',
        meetingLink: entryData.meetingLink || '',
        companyId,
      });
    } else {
      const defaultStartTimeISO = selectedTimeSlot ? `1970-01-01T${selectedTimeSlot}:00Z` : '1970-01-01T08:00:00Z';
      const startTimeDate = new Date(defaultStartTimeISO);
      const defaultEndTimeISO = new Date(startTimeDate.getTime() + 45 * 60 * 1000).toISOString();

      setFormData({
        id: '',
        courseId: '',
        educatorId: '',
        classroomId: '',
        dayOfWeek: selectedDayOfWeek || 'Monday',
        startTime: defaultStartTimeISO,
        endTime: defaultEndTimeISO,
        topic: '',
        meetingLink: '',
        companyId,
      });
    }
  }, [entryData, selectedDayOfWeek, selectedTimeSlot, companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (name: 'startTime' | 'endTime', value: string) => {
    const date = new Date(`1970-01-01T${value}:00Z`);
    setFormData((prev) => ({ ...prev, [name]: date.toISOString() }));
  };
  
  const makeISO = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`).toISOString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.educatorId || !formData.classroomId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required fields (Course, Educator, Classroom, Day, Start Time, End Time).");
      return;
    }

    const selectedClassroom = allClassrooms.find(c => c.id === formData.classroomId);

    const payload = {
      id: formData.id,
      courseId: formData.courseId,
      educatorId: formData.educatorId,
      classroomId: formData.classroomId,
      dayOfWeek: formData.dayOfWeek,
      courseClassrooms: formData.classroomId && selectedClassroom && selectedClassroom.academicLevelId ? [{ id: selectedClassroom.id, name: selectedClassroom.name, academicLevelId: selectedClassroom.academicLevelId }] : [],
      startTime: makeISO(formatTimeToHHMM(formData.startTime)),
      endTime:   makeISO(formatTimeToHHMM(formData.endTime)),
      topic: formData.topic,
      meetingLink: formData.meetingLink,
      companyId: formData.companyId,
    };

    await onSave(payload);
  };

  if (!isOpen) return null;

  const selectedCourse = allCourses.find(c => c.id === formData.courseId);
  const selectedClassroom = allClassrooms.find(c => c.id === formData.classroomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 rounded-full transition"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          {formData.id ? 'Edit Lesson' : 'Create New Lesson'}
        </h2>

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Course Select */}
          <div>
            <label htmlFor="courseId" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <BookOpenIcon className="h-4 w-4 text-gray-500" /> Course <span className="text-red-500">*</span>
            </label>
            <select
              name="courseId"
              id="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select course</option>
              {allCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} ({course.code})
                </option>
              ))}
            </select>
            {selectedCourse && selectedCourse.academicLevels?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs font-medium text-gray-600">Levels:</span>
                {selectedCourse.academicLevels.map((level) => (
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

          <div>
            <label htmlFor="classroomId" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <BuildingLibraryIcon className="h-4 w-4 text-gray-500" /> Classroom <span className="text-red-500">*</span>
            </label>
            <select
              name="classroomId"
              id="classroomId"
              value={formData.classroomId}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select classroom</option>
              {allClassrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
            {/* {selectedClassroom && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs font-medium text-gray-600">Level:</span>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
                >
                  {allAcademicLevels.find(level => level.id === selectedClassroom.academicLevelId)?.name || 'N/A'}
                </span>
              </div>
            )} */}
          </div>

          {/* Educator Select */}
          <div>
            <label htmlFor="educatorId" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <UsersIcon className="h-4 w-4 text-gray-500" /> Educator <span className="text-red-500">*</span>
            </label>
            <select
              name="educatorId"
              id="educatorId"
              value={formData.educatorId}
              onChange={handleChange}
              required
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
            <label htmlFor="dayOfWeek" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <CalendarDaysIcon className="h-4 w-4 text-gray-500" /> Day <span className="text-red-500">*</span>
            </label>
            <select
              name="dayOfWeek"
              id="dayOfWeek"
              value={formData.dayOfWeek}
              onChange={handleChange}
              required
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
              <label htmlFor="startTime" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                <ClockIcon className="h-4 w-4 text-gray-500" /> Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="startTime"
                // Display value using the UTC formatter to match the internal ISO string's UTC time
                value={formatTimeToHHMM(formData.startTime)}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endTime" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
                <ClockIcon className="h-4 w-4 text-gray-500" /> End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                id="endTime"
                // Display value using the UTC formatter to match the internal ISO string's UTC time
                value={formatTimeToHHMM(formData.endTime)}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div className="sm:col-span-2">
            <label htmlFor="meetingLink" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <LinkIcon className="h-4 w-4 text-gray-500" /> Meeting Link (Optional)
            </label>
            <input
              type="url"
              name="meetingLink"
              id="meetingLink"
              value={formData.meetingLink || ''}
              onChange={handleChange}
              placeholder="https://zoom.us/..."
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Topic */}
          <div className="sm:col-span-2">
            <label htmlFor="topic" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
              <DocumentTextIcon className="h-4 w-4 text-gray-500" /> Lesson Topic (Optional)
            </label>
            <textarea
              name="topic"
              id="topic"
              value={formData.topic || ''}
              onChange={handleChange}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Introduction to Geometry"
            />
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-md text-sm font-semibold text-white flex items-center justify-center gap-2
                ${isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (formData.id ? 'Update Lesson' : 'Add Lesson')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
