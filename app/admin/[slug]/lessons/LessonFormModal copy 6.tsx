import React, { useState } from "react";
import { ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TimetableEntry, CourseOption, EducatorOption } from "./WeeklyTimetable";

// --- Lesson Form Modal ---
type LessonFormModalProps = {
  entryData?: TimetableEntry | null;
  onClose: () => void;
  onSave: (data: Omit<TimetableEntry, 'courseTitle' | 'courseAcademicLevels' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'>) => void;
  isLoading: boolean; // From parent component
  allCourses: CourseOption[];
  allEducators: EducatorOption[];
  companyId: string; // Pass companyId to the modal for new entries
  selectedDayOfWeek?: string; // Pre-fill day if coming from grid cell
  selectedTimeSlot?: string; // Pre-fill time if coming from grid cell
};


const daysOfWeekOrder = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const LessonFormModal: React.FC<LessonFormModalProps> = ({
  entryData,
  onClose,
  onSave,
  isLoading,
  allCourses,
  allEducators,
  companyId,
  selectedDayOfWeek,
  selectedTimeSlot,
}) => {
  const [formData, setFormData] = useState({
    id: entryData?.id || '',
    courseId: entryData?.courseId || '',
    educatorId: entryData?.educatorId || '',
    dayOfWeek: entryData?.dayOfWeek || selectedDayOfWeek || '',
    startTime: entryData?.startTime ? new Date(entryData.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : (selectedTimeSlot || ''),
    endTime: entryData?.endTime ? new Date(entryData.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
    topic: entryData?.topic || '',
    meetingLink: entryData?.meetingLink || '',
    companyId: entryData?.companyId || companyId,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { courseId, educatorId, dayOfWeek, startTime, endTime } = formData;
    if (!courseId || !educatorId || !dayOfWeek || !startTime || !endTime) {
      alert("Please fill all required fields.");
      return;
    }

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      alert("Time format must be HH:MM (24-hour).");
      return;
    }

    const dummyDate = '1970-01-01T';
    const startTimeISO = `${dummyDate}${startTime}:00.000Z`;
    const endTimeISO = `${dummyDate}${endTime}:00.000Z`;

    onSave({ ...formData, startTime: startTimeISO, endTime: endTimeISO });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="px-8 py-6">
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-6">
            {entryData ? `Edit Lesson: ${entryData.courseTitle}` : 'Create New Lesson'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
              <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                <ClockIcon className="h-6 w-6" /> Lesson Info
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label htmlFor="courseId" className="block text-sm font-semibold text-indigo-800 mb-1">Course *</label>
                  <select
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  >
                    <option value="">-- Select Course --</option>
                    {allCourses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} ({course.academicLevels.map(al => al.name).join(', ')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="educatorId" className="block text-sm font-semibold text-indigo-800 mb-1">Educator *</label>
                  <select
                    id="educatorId"
                    name="educatorId"
                    value={formData.educatorId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  >
                    <option value="">-- Select Educator --</option>
                    {allEducators.map(ed => (
                      <option key={ed.id} value={ed.id}>{ed.name} ({ed.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dayOfWeek" className="block text-sm font-semibold text-indigo-800 mb-1">Day *</label>
                  <select
                    id="dayOfWeek"
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white"
                    required
                  >
                    <option value="">-- Select Day --</option>
                    {daysOfWeekOrder.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-semibold text-indigo-800 mb-1">Start Time *</label>
                    <input
                      type="text"
                      name="startTime"
                      id="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      placeholder="HH:MM"
                      className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-semibold text-indigo-800 mb-1">End Time *</label>
                    <input
                      type="text"
                      name="endTime"
                      id="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      placeholder="HH:MM"
                      className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="topic" className="block text-sm font-semibold text-indigo-800 mb-1">Topic (optional)</label>
                  <input
                    type="text"
                    name="topic"
                    id="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="meetingLink" className="block text-sm font-semibold text-indigo-800 mb-1">Meeting Link (optional)</label>
                  <input
                    type="url"
                    name="meetingLink"
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-4 gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : entryData ? 'Save Changes' : 'Add Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LessonFormModal;
