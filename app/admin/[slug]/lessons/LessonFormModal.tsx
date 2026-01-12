import React, { useEffect, useState, useMemo } from 'react';
import { 
  XMarkIcon, BookOpenIcon, UsersIcon, CalendarDaysIcon, 
  ClockIcon, LinkIcon, DocumentTextIcon, BuildingLibraryIcon,
  AcademicCapIcon, ChevronRightIcon, ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { TimetableEntry, CourseOption, EducatorOption, AcademicLevelOption } from './WeeklyTimetable';
import { ClassroomOption } from '../teachers/page';


interface LessonFormModalProps {
  isOpen: boolean;
  entryData: TimetableEntry | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
  allCourses: CourseOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassrooms: ClassroomOption[];
  allEducators: EducatorOption[];
  companyId: string;
  selectedDayOfWeek: string;
  selectedTimeSlot: string;
  allEntries: TimetableEntry[]; 
}

export default function LessonFormModal({
  isOpen, entryData, onClose, onSave, isLoading,
  allCourses, allAcademicLevels, allClassrooms, allEducators,
  companyId, selectedDayOfWeek, selectedTimeSlot,
  allEntries,
}: LessonFormModalProps) {
  
  const [formData, setFormData] = useState({
    id: '', courseId: '', educatorId: '', academicLevelId: '',
    classroomId: '', dayOfWeek: `${selectedDayOfWeek || 'Monday'}`, startTime: `${selectedTimeSlot || '08:00'}`, endTime: `${selectedTimeSlot ? '08:45' : '08:45'}`,
    topic: '', meetingLink: '',
  });

  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    if (entryData) {
      setFormData({
        id: entryData.id,
        courseId: entryData.courseId,
        educatorId: entryData.educatorId,
        academicLevelId: entryData.courseAcademicLevels?.[0]?.id || '',
        classroomId: entryData.courseClassrooms?.[0]?.id || '',
        dayOfWeek: entryData.dayOfWeek,
        startTime: entryData.startTime,
        endTime: entryData.endTime,
        topic: entryData.topic || '',
        meetingLink: entryData.meetingLink || '',
      });
    } else {
      setFormData({
        id: '',
        courseId: '',
        educatorId: '',
        academicLevelId: '',
        classroomId: '',
        dayOfWeek: `${selectedDayOfWeek || 'Monday'}`,
        startTime: `${selectedTimeSlot || '08:00'}`,
        endTime: `${selectedTimeSlot ? '08:45' : '08:45'}`,
        topic: '',
        meetingLink: '',
      });
    }
  }, [entryData, isOpen, selectedDayOfWeek, selectedTimeSlot]);

  // --- CASCADING FILTER LOGIC ---

  // 1. Filter Classrooms by Level
  const filteredClassrooms = useMemo(() => {
    return allClassrooms.filter(c => c.academicLevelId === formData.academicLevelId);
  }, [formData.academicLevelId, allClassrooms]);

  // 2. Filter Courses by Level (Ensure the course is taught at this level)
  const filteredCourses = useMemo(() => {
    if (!formData.academicLevelId) return [];
    return allCourses.filter(course => 
      course.academicLevels?.some(level => level.id === formData.academicLevelId)
    );
  }, [formData.academicLevelId, allCourses]);

  // 3. Optional: Filter Educators by the selected Course (if educators have course specializations)
  const filteredEducators = useMemo(() => {
    if (!formData.courseId) return allEducators;
    // If your Educator type has a 'courseIds' or similar, filter here
    return allEducators; 
  }, [formData.courseId, allEducators]);

  // Reset downstream fields when upstream fields change
  const handleLevelChange = (levelId: string) => {
    setFormData(prev => ({
      ...prev,
      academicLevelId: levelId,
      classroomId: '', // Reset
      courseId: '',    // Reset
    }));
  };

  useEffect(() => {
    if (isOpen) {
      // Initialize logic (same as your previous logic)
      setErrors(null);
    }
  }, [isOpen, entryData]);

  const validate = () => {
    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();
    if (end <= start) {
      setErrors("The lesson cannot end before it starts.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const selectedClass = allClassrooms.find(c => c.id === formData.classroomId);
    await onSave({
      ...formData,
      companyId,
      courseClassrooms: selectedClass ? [selectedClass] : [],
    });
  };

   // --- CONFLICT DETECTION LOGIC ---
    const conflict = useMemo(() => {
      if (!formData.dayOfWeek || !formData.startTime || !formData.endTime) return null;
  
      const currentStart = new Date(formData.startTime).getTime();
      const currentEnd = new Date(formData.endTime).getTime();
  
      return allEntries.find(entry => {
        // 1. Skip if checking the entry we are currently editing
        if (entry.id === formData.id) return false;
  
        // 2. Check if it's the same day
        if (entry.dayOfWeek !== formData.dayOfWeek) return false;
  
        // 3. Time Overlap Logic: (StartA < EndB) AND (EndA > StartB)
        const entryStart = new Date(entry.startTime).getTime();
        const entryEnd = new Date(entry.endTime).getTime();
        const isOverlapping = currentStart < entryEnd && currentEnd > entryStart;
  
        if (isOverlapping) {
          // Check if it's the same Classroom
          if (entry.courseClassrooms?.some(c => c.id === formData.classroomId)) {
            return { type: 'Classroom', name: entry.courseClassrooms[0].name, course: entry.courseTitle };
          }
          // Check if it's the same Educator
          if (entry.educatorId === formData.educatorId) {
            return { type: 'Educator', name: entry.educatorName, course: entry.courseTitle };
          }
        }
        return false;
      });
    }, [formData, allEntries]);
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Step-based Progress Header */}
        <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-4">
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.academicLevelId ? 'bg-green-100 text-green-600' : 'bg-indigo-600 text-white'}`}>
                1
            </span>
            <ChevronRightIcon className="h-4 w-4 text-slate-300" />
            <span className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.courseId ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'}`}>
                2
            </span>
            <ChevronRightIcon className="h-4 w-4 text-slate-300" />
            <span className="text-sm font-semibold text-slate-600">Schedule Details</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 max-h-[85vh] overflow-y-auto">
          <div className="space-y-8">

            {/* CONFLICT INDICATOR BOX */}
            {conflict ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-pulse">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Scheduling Conflict Detected</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    The <strong>{conflict.courseAcademicLevels[0]?.name} ({conflict.courseClassrooms[0]?.name})</strong> is already booked for 
                    "{conflict.courseClassrooms[0]?.name}" during this time slot.
                  </p>
                </div>
              </div>
            ) : formData.startTime && formData.classroomId && formData.educatorId ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-xs font-semibold w-fit">
                <CheckCircleIcon className="h-4 w-4" />
                Slot is available
              </div>
            ) : null}
            
            {/* STEP 1: TARGET AREA */}
            
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">1. Target Audience & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="space-y-1">
                  <FormLabel icon={<AcademicCapIcon />} label="Academic Level" required />
                  <select 
                    value={formData.academicLevelId} 
                    onChange={(e) => handleLevelChange(e.target.value)}
                    required 
                    className="form-select-custom"
                  >
                    <option value="">Choose Level...</option>
                    {allAcademicLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <FormLabel icon={<BuildingLibraryIcon />} label="Classroom" required />
                  <select 
                    name="classroomId" 
                    value={formData.classroomId} 
                    onChange={(e) => setFormData(p => ({...p, classroomId: e.target.value}))}
                    required 
                    disabled={!formData.academicLevelId}
                    className={`form-select-custom disabled:opacity-50 ${conflict?.courseClassrooms[0]?.id === formData.classroomId ? 'border-amber-400 ring-amber-100' : ''}`}

                  >
                    <option value="">{formData.academicLevelId ? "Select Room" : "Waiting for Level..."}</option>
                    {filteredClassrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* STEP 2: CONTENT & STAFF */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">2. Course & Educator</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <FormLabel icon={<BookOpenIcon />} label="Subject / Course" required />
                  <select 
                    name="courseId" 
                    value={formData.courseId} 
                    onChange={(e) => setFormData(p => ({...p, courseId: e.target.value}))} 
                    disabled={!formData.academicLevelId}
                    required 
                    className="form-select-custom disabled:opacity-50"
                  >
                    <option value="">{formData.academicLevelId ? "Select Course" : "Waiting for Level..."}</option>
                    {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <FormLabel icon={<UsersIcon />} label="Lead Educator" required />
                  <select name="educatorId" 
                  value={formData.educatorId} 
                  onChange={(e) => setFormData(p => ({...p, educatorId: e.target.value}))} required 
                  
                    className={`form-select-custom ${conflict?.educatorId === formData.educatorId ? 'border-amber-400 ring-amber-100' : ''}`}
                  >
                    <option value="">Select Educator</option>
                    {filteredEducators.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* STEP 3: LOGISTICS */}
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">3. Schedule & Timing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <FormLabel icon={<CalendarDaysIcon />} label="Day" required />
                    <select name="dayOfWeek" value={formData.dayOfWeek} onChange={(e) => setFormData(p => ({...p, dayOfWeek: e.target.value}))} required className="form-select-custom">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <FormLabel icon={<ClockIcon />} label="Start Time" required />
                    <input type="time" value={formatTimeToHHMM(formData.startTime)} onChange={e => setFormData(p => ({...p, startTime: `1970-01-01T${e.target.value}:00Z`}))} required className="form-select-custom" />
                </div>
                <div className="space-y-1">
                    <FormLabel icon={<ClockIcon />} label="End Time" required />
                    <input type="time" value={formatTimeToHHMM(formData.endTime)} onChange={e => setFormData(p => ({...p, endTime: `1970-01-01T${e.target.value}:00Z`}))} required className="form-select-custom" />
                </div>
              </div>
              {errors && (
                <div className="flex items-center gap-2 text-red-500 text-xs font-semibold bg-red-50 p-3 rounded-xl">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    {errors}
                </div>
              )}
            </section>

            {/* STEP 4: TOPIC */}
            <div className="space-y-1">
                <FormLabel icon={<DocumentTextIcon />} label="Lesson Topic (Optional)" />
                <textarea 
                    name="topic" 
                    value={formData.topic} 
                    onChange={(e) => setFormData(p => ({...p, topic: e.target.value}))} 
                    rows={2} 
                    className="form-select-custom !bg-slate-50 border-dashed" 
                    placeholder="e.g. Molecular Biology Introduction" 
                />
            </div>
          </div>

          {/* Meeting Link (Optional) */}
          <div className="mt-6 space-y-1">
            <FormLabel icon={<LinkIcon />} label="Online Meeting Link (Optional)" />
            <input 
              type="url" 
              name="meetingLink" 
              value={formData.meetingLink}
              onChange={(e) => setFormData(p => ({...p, meetingLink: e.target.value}))}
              className="form-select-custom !bg-slate-50 border-dashed" 
              placeholder="https://example.com/meeting-link" 
            />
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !!conflict  } //|| !formData.courseId
              className={` px-6  bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 disabled:opacity-40 disabled:shadow-none flex-[2] py-4 rounded-2xl font-bold text-white shadow-xl transition-all
                ${conflict ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}
              `}
              // disabled={isLoading || !formData.courseId}
              // className=""
            >
              {/* {isLoading ? 'Processing...' : formData.id ? 'Save Changes' : 'Confirm Schedule'} */}
              {isLoading ? 'Saving...' : conflict ? 'Resolve Conflict to Save' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormLabel({ icon, label, required }: { icon: React.ReactNode, label: string, required?: boolean }) {
  return (
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-1 ml-1">
      <span className="text-slate-300">{icon}</span>
      {label} {required && <span className="text-red-400">*</span>}
    </label>
  );
}


const formatTimeToHHMM = (isoString: string): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '08:00';
  return date.getUTCHours().toString().padStart(2, '0') + ':' + 
         date.getUTCMinutes().toString().padStart(2, '0');
};


// import React, { useEffect, useState } from 'react';
// import { XMarkIcon, BookOpenIcon, UsersIcon, CalendarDaysIcon, ClockIcon, LinkIcon, DocumentTextIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
// import { TimetableEntry, CourseOption, EducatorOption, AcademicLevelOption, } from './WeeklyTimetable'; // Import types
// import { ClassroomOption } from '../teachers/page';

// interface LessonFormModalProps {
//   isOpen: boolean; // Added isOpen prop for explicit modal control
//   entryData: TimetableEntry | null;
//   onClose: () => void;
//   onSave: (lessonData: Omit<TimetableEntry, 'courseTitle' | 'courseCode' | 'courseAcademicLevels' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
//   isLoading: boolean;
//   allCourses: CourseOption[];
//   allAcademicLevels: AcademicLevelOption[];
//   allClassrooms: ClassroomOption[];
//   allEducators: EducatorOption[];
//   companyId: string;
//   selectedDayOfWeek: string;
//   selectedTimeSlot: string;
// }

// // Helper to format Date object to HH:MM string (UTC)
// const formatTimeToHHMM = (isoString: string): string => {
//   const date = new Date(isoString);
//   if (isNaN(date.getTime())) {
//     console.error("Invalid date string passed to formatTimeToHHMM:", isoString);
//     return '00:00';
//   }
//   const hours = date.getUTCHours().toString().padStart(2, '0');
//   const minutes = date.getUTCMinutes().toString().padStart(2, '0');
//   return `${hours}:${minutes}`;
// };

// export default function LessonFormModal({
//   isOpen,
//   entryData,
//   onClose,
//   onSave,
//   isLoading,
//   allCourses,
//   allAcademicLevels,
//   allClassrooms,
//   allEducators,
//   companyId,
//   selectedDayOfWeek,
//   selectedTimeSlot,
// }: LessonFormModalProps) {
//   type LessonFormData = Omit<TimetableEntry,  'courseTitle' | 'courseCode' | 'courseAcademicLevels' | 'courseClassrooms' | 'educatorName' | 'educatorEmail' | 'createdAt' | 'updatedAt'> & { id?: string; classroomId: string, academicLevelId: string; };

//   const [formData, setFormData] = useState<LessonFormData>(() => {
//     const defaultStartTimeISO = selectedTimeSlot ? `1970-01-01T${selectedTimeSlot}:00Z` : '1970-01-01T08:00:00Z';
//     const startTimeDate = new Date(defaultStartTimeISO);
//     const defaultEndTimeISO = new Date(startTimeDate.getTime() + 45 * 60 * 1000).toISOString(); // Add 45 minutes

//     return entryData ? {
//       id: entryData.id,
//       courseId: entryData.courseId,
//       educatorId: entryData.educatorId,
//       academicLevelId: entryData.courseAcademicLevels && entryData.courseAcademicLevels.length > 0 ? entryData.courseAcademicLevels[0].id : '',
//       classroomId: entryData.courseClassrooms && entryData.courseClassrooms.length > 0 ? entryData.courseClassrooms[0].id : '',
//       dayOfWeek: entryData.dayOfWeek,
//       startTime: (entryData.startTime && !isNaN(new Date(entryData.startTime).getTime())) ? entryData.startTime : defaultStartTimeISO,
//       endTime: (entryData.endTime && !isNaN(new Date(entryData.endTime).getTime())) ? entryData.endTime : defaultEndTimeISO,
//       topic: entryData.topic || '',
//       meetingLink: entryData.meetingLink || '',
//       companyId,
//     } : {
//       id: '',
//       courseId: '',
//       educatorId: '',
//       academicLevelId: '',
//       classroomId: '',
//       dayOfWeek: selectedDayOfWeek || 'Monday',
//       startTime: defaultStartTimeISO,
//       endTime: defaultEndTimeISO,
//       topic: '',
//       meetingLink: '',
//       companyId,
//     };
//   });

//   useEffect(() => {
//     if (entryData) {
//       setFormData({
//         id: entryData.id || "",
//         courseId: entryData.courseId,
//         academicLevelId: entryData.courseAcademicLevels && entryData.courseAcademicLevels.length > 0 ? entryData.courseAcademicLevels[0].id : '',
//         classroomId: entryData.courseClassrooms && entryData.courseClassrooms.length > 0 ? entryData.courseClassrooms[0].id : '',
//         educatorId: entryData.educatorId,
//         dayOfWeek: entryData.dayOfWeek,
//         startTime: (entryData.startTime && !isNaN(new Date(entryData.startTime).getTime())) ? entryData.startTime : '1970-01-01T08:00:00Z',
//         endTime: (entryData.endTime && !isNaN(new Date(entryData.endTime).getTime())) ? entryData.endTime : '1970-01-01T08:45:00Z',
//         topic: entryData.topic || '',
//         meetingLink: entryData.meetingLink || '',
//         companyId,
//       });
//     } else {
//       const defaultStartTimeISO = selectedTimeSlot ? `1970-01-01T${selectedTimeSlot}:00Z` : '1970-01-01T08:00:00Z';
//       const startTimeDate = new Date(defaultStartTimeISO);
//       const defaultEndTimeISO = new Date(startTimeDate.getTime() + 45 * 60 * 1000).toISOString();

//       setFormData({
//         id: '',
//         courseId: '',
//         academicLevelId: '',
//         educatorId: '',
//         classroomId: '',
//         dayOfWeek: selectedDayOfWeek || 'Monday',
//         startTime: defaultStartTimeISO,
//         endTime: defaultEndTimeISO,
//         topic: '',
//         meetingLink: '',
//         companyId,
//       });
//     }
//   }, [entryData, selectedDayOfWeek, selectedTimeSlot, companyId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleTimeChange = (name: 'startTime' | 'endTime', value: string) => {
//     const date = new Date(`1970-01-01T${value}:00Z`);
//     setFormData((prev) => ({ ...prev, [name]: date.toISOString() }));
//   };
  
//   const makeISO = (hhmm: string) => new Date(`1970-01-01T${hhmm}:00Z`).toISOString();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.courseId || !formData.educatorId || !formData.academicLevelId || !formData.classroomId || !formData.dayOfWeek || !formData.startTime || !formData.endTime) {
//       alert("Please fill in all required fields (Course, Educator, Academic Level, Classroom, Day, Start Time, End Time).");
//       return;
//     }

//     const selectedClassroom = allClassrooms.find(c => c.id === formData.classroomId);

//     const payload = {
//       id: formData.id,
//       courseId: formData.courseId,
//       educatorId: formData.educatorId,
//       classroomId: formData.classroomId,
//       dayOfWeek: formData.dayOfWeek,
//       courseClassrooms: formData.classroomId && selectedClassroom && selectedClassroom.academicLevelId ? [{ id: selectedClassroom.id, name: selectedClassroom.name, academicLevelId: selectedClassroom.academicLevelId }] : [],
//       startTime: makeISO(formatTimeToHHMM(formData.startTime)),
//       endTime:   makeISO(formatTimeToHHMM(formData.endTime)),
//       topic: formData.topic,
//       meetingLink: formData.meetingLink,
//       companyId: formData.companyId,
//     };

//     await onSave(payload);
//   };

//   if (!isOpen) return null;

//   const selectedCourse = allCourses.find(c => c.id === formData.courseId);
//   const selectedClassroom = allClassrooms.find(c => c.id === formData.classroomId);

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-10">
//       <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-1 rounded-full transition"
//           title="Close"
//         >
//           <XMarkIcon className="h-6 w-6" />
//         </button>

//         {/* Title */}
//         <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
//           {formData.id ? 'Edit Lesson' : 'Create New Lesson'}
//         </h2>

//         {/* Form Grid */}
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//           {/* Course Select */}
//           <div>
//             <label htmlFor="courseId" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//               <BookOpenIcon className="h-4 w-4 text-gray-500" /> Course <span className="text-red-500">*</span>
//             </label>
//             <select
//               name="courseId"
//               id="courseId"
//               value={formData.courseId}
//               onChange={handleChange}
//               required
//               className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="">Select course</option>
//               {allCourses.map((course) => (
//                 <option key={course.id} value={course.id}>
//                   {course.title} ({course.code})
//                 </option>
//               ))}
//             </select>
//             {selectedCourse && selectedCourse.academicLevels?.length > 0 && (
//               <div className="mt-2 flex flex-wrap gap-1">
//                 <span className="text-xs font-medium text-gray-600">Levels:</span>
//                 {selectedCourse.academicLevels.map((level) => (
//                   <span
//                     key={level.id}
//                     className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
//                   >
//                     {level.name}
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Academic Level Select */}
//             <div>
//               <label htmlFor="playGroupId" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//                 <DocumentTextIcon className="h-4 w-4 text-gray-500" /> Academic Level <span className="text-red-500">*</span>
//               </label>
//               <select 
//                 name="academicLevelId"
//                 id="academicLevelId"
//                 value={selectedClassroom ? selectedClassroom.academicLevelId : ''}
//                 onChange={(e) => {
//                   const selectedLevelId = e.target.value;
//                   const filteredClassrooms = allClassrooms.filter(c => c.academicLevelId === selectedLevelId);
//                   if (filteredClassrooms.length > 0) {
//                     setFormData((prev) => ({ ...prev, classroomId: filteredClassrooms[0].id }));
//                   } else {
//                     setFormData((prev) => ({ ...prev, classroomId: '' }));
//                   }
//                 }}
//                 required
//                 className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//               >
//                 <option value="">Select academic level</option>
//                 {allAcademicLevels.map((level) => (
//                   <option key={level.id} value={level.id}>
//                     {level.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
          
//           {/* Classroom Select */}

//           <div>
//             <label htmlFor="classroomId" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//               <BuildingLibraryIcon className="h-4 w-4 text-gray-500" /> Classroom <span className="text-red-500">*</span>
//             </label>
//             <select
//               name="classroomId"
//               id="classroomId"
//               value={formData.classroomId}
//               onChange={handleChange}
//               required
//               className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="">Select classroom</option>
//               {allClassrooms.map((classroom) => (
//                 <option key={classroom.id} value={classroom.id}>
//                   {classroom.name}
//                 </option>
//               ))}
//             </select>
//             {/* {selectedClassroom && (
//               <div className="mt-2 flex flex-wrap gap-1">
//                 <span className="text-xs font-medium text-gray-600">Level:</span>
//                 <span
//                   className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700"
//                 >
//                   {allAcademicLevels.find(level => level.id === selectedClassroom.academicLevelId)?.name || 'N/A'}
//                 </span>
//               </div>
//             )} */}
//           </div>

//           {/* Educator Select */}
//           <div>
//             <label htmlFor="educatorId" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//               <UsersIcon className="h-4 w-4 text-gray-500" /> Educator <span className="text-red-500">*</span>
//             </label>
//             <select
//               name="educatorId"
//               id="educatorId"
//               value={formData.educatorId}
//               onChange={handleChange}
//               required
//               className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               <option value="">Select educator</option>
//               {allEducators.map((edu) => (
//                 <option key={edu.id} value={edu.id}>
//                   {edu.name} ({edu.email})
//                 </option>
//               ))}
//             </select>
//           </div>
          

//           {/* Day */}
//           <div>
//             <label htmlFor="dayOfWeek" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//               <CalendarDaysIcon className="h-4 w-4 text-gray-500" /> Day <span className="text-red-500">*</span>
//             </label>
//             <select
//               name="dayOfWeek"
//               id="dayOfWeek"
//               value={formData.dayOfWeek}
//               onChange={handleChange}
//               required
//               className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//             >
//               {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
//                 <option key={day} value={day}>{day}</option>
//               ))}
//             </select>
//           </div>

//           {/* Time */}
//           <div className="flex gap-2">
//             <div className="flex-1">
//               <label htmlFor="startTime" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//                 <ClockIcon className="h-4 w-4 text-gray-500" /> Start Time <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="time"
//                 id="startTime"
//                 // Display value using the UTC formatter to match the internal ISO string's UTC time
//                 value={formatTimeToHHMM(formData.startTime)}
//                 onChange={(e) => handleTimeChange('startTime', e.target.value)}
//                 required
//                 className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <div className="flex-1">
//               <label htmlFor="endTime" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//                 <ClockIcon className="h-4 w-4 text-gray-500" /> End Time <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="time"
//                 id="endTime"
//                 // Display value using the UTC formatter to match the internal ISO string's UTC time
//                 value={formatTimeToHHMM(formData.endTime)}
//                 onChange={(e) => handleTimeChange('endTime', e.target.value)}
//                 required
//                 className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//           </div>

//           {/* Meeting Link */}
//           <div className="sm:col-span-2">
//             <label htmlFor="meetingLink" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//               <LinkIcon className="h-4 w-4 text-gray-500" /> Meeting Link (Optional)
//             </label>
//             <input
//               type="url"
//               name="meetingLink"
//               id="meetingLink"
//               value={formData.meetingLink || ''}
//               onChange={handleChange}
//               placeholder="https://zoom.us/..."
//               className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//             />
//           </div>

//           {/* Topic */}
//           <div className="sm:col-span-2">
//             <label htmlFor="topic" className="text-sm font-semibold text-gray-700 flex items-center gap-1 mb-1">
//               <DocumentTextIcon className="h-4 w-4 text-gray-500" /> Lesson Topic (Optional)
//             </label>
//             <textarea
//               name="topic"
//               id="topic"
//               value={formData.topic || ''}
//               onChange={handleChange}
//               rows={3}
//               className="mt-1 w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:ring-indigo-500 focus:border-indigo-500"
//               placeholder="e.g. Introduction to Geometry"
//             />
//           </div>

//           {/* Actions */}
//           <div className="sm:col-span-2 mt-6 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition"
//               disabled={isLoading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-md text-sm font-semibold text-white flex items-center justify-center gap-2
//                 ${isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition`}
//             >
//               {isLoading ? (
//                 <>
//                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Saving...
//                 </>
//               ) : (formData.id ? 'Update Lesson' : 'Add Lesson')}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
