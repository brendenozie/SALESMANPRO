'use client';

import React, { useEffect, useState } from 'react';
import { 
  XMarkIcon, 
  AcademicCapIcon, 
  ArrowUpCircleIcon, 
  ArrowPathIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StudentType } from './StudentFormModal';

export type AcademicLevelOption = {
  id: string;
  name: string;
};

export type ClassRoomOption = {
  id: string;
  name: string;
};

interface PromoteStudentModalProps {
  isOpen: boolean;
  student: StudentType | null;
  onClose: () => void;
  onPromote: (data: {
    studentId: string;
    academicLevelId: string;
    classRoomId?: string | null;
    year: string;
    term?: string | null;
    session?: string | null;
    action: 'PROMOTED' | 'RETAINED';
    levelStatus?: StudentType['academicRecords'][0]['levelStatus'];
  }) => Promise<void>;
  allAcademicLevels: AcademicLevelOption[];
  allClassRooms: ClassRoomOption[];
  isLoading: boolean;
}

const getCurrentAcademicRecord = (student?: StudentType | null) => {
  if (!student?.academicRecords?.length) return null;
  return [...student.academicRecords].sort((a, b) => {
    if (!a.year || !b.year) return 0;
    return Number(b.year) - Number(a.year);
  })[0];
};

const PromoteStudentModal: React.FC<PromoteStudentModalProps> = ({
  isOpen,
  student,
  onClose,
  onPromote,
  allAcademicLevels,
  allClassRooms,
  isLoading,
}) => {
  const current = getCurrentAcademicRecord(student);
  const [action, setAction] = useState<'PROMOTED' | 'RETAINED'>('PROMOTED');

  const [form, setForm] = useState({
    academicLevelId: '',
    classRoomId: '',
    year: new Date().getFullYear().toString(),
    term: '',
    session: '',
    levelStatus: '' as any,
  });

  useEffect(() => {
    if (current && isOpen) {
      setForm({
        academicLevelId: current.academicLevelId,
        classRoomId: current.classRoomId || '',
        year: new Date().getFullYear().toString(), // Default to current year
        term: '',
        session: '',
        levelStatus: current.levelStatus || '',
      });
      setAction('PROMOTED');
    }
  }, [current, isOpen]);

  if (!isOpen || !student || !current) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onPromote({
      studentId: student.id,
      academicLevelId: action === 'RETAINED' ? current.academicLevelId : form.academicLevelId,
      classRoomId: form.classRoomId || null,
      year: form.year,
      term: form.term || null,
      session: form.session || null,
      action,
      levelStatus: form.levelStatus || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Academic Promotion</h2>
            <p className="text-xs text-gray-500">Update student placement for the new term/year.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XMarkIcon className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Current Status Card */}
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {student.firstName[0]}
            </div>
            <div>
              <p className="font-bold text-gray-900">{student.firstName} {student.lastName}</p>
              <p className="text-xs text-indigo-600 font-medium">
                Current: {current.academicLevelName} • {current.classRoomName || 'No Class'}
              </p>
            </div>
          </div>

          {/* Action Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setAction('PROMOTED')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${
                action === 'PROMOTED' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'
              }`}
            >
              <ArrowUpCircleIcon className="h-5 w-5" /> Promote
            </button>
            <button
              type="button"
              onClick={() => setAction('RETAINED')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all ${
                action === 'RETAINED' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500'
              }`}
            >
              <ArrowPathIcon className="h-5 w-5" /> Retain/Repeat
            </button>
          </div>

          {/* Target Academic Level */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Academic Level</label>
              <div className="relative">
                <AcademicCapIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  disabled={action === 'RETAINED'}
                  value={form.academicLevelId}
                  onChange={e => setForm(f => ({ ...f, academicLevelId: e.target.value }))}
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {allAcademicLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target Classroom (Optional)</label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={form.classRoomId}
                  onChange={e => setForm(f => ({ ...f, classRoomId: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white"
                >
                  <option value="">No Classroom Assignment</option>
                  {allClassRooms.map(room => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year *</label>
                <input
                  type="text"
                  required
                  placeholder="2025"
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Term / Session</label>
                <input
                  type="text"
                  placeholder="Term 1"
                  value={form.term}
                  onChange={e => setForm(f => ({ ...f, term: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-2.5 rounded-lg text-sm font-bold text-white shadow-lg transition-all ${
                action === 'PROMOTED' ? 'bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700' : 'bg-amber-500 shadow-amber-200 hover:bg-amber-600'
              } disabled:opacity-50`}
            >
              {isLoading ? 'Processing...' : action === 'PROMOTED' ? 'Confirm Promotion' : 'Confirm Retention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteStudentModal;

// 'use client';

// import React, { useEffect, useState } from 'react';
// import { XMarkIcon, AcademicCapIcon, ArrowUpCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
// import { StudentType } from './StudentFormModal';

// export type AcademicLevelOption = {
//   id: string;
//   name: string;
// };

// export type ClassRoomOption = {
//   id: string;
//   name: string;
// };


// interface PromoteStudentModalProps {
//   isOpen: boolean;
//   student: StudentType | null;
//   onClose: () => void;
//   onPromote: (data: {
//     studentId: string;
//     academicLevelId: string;
//     classRoomId?: string | null | undefined;
//     year: string;
//     term?: string | null | undefined;
//     session?: string | null | undefined;
//     action: 'PROMOTED' | 'RETAINED';
//     levelStatus?: StudentType['academicRecords'][0]['levelStatus'];
//   }) => Promise<void>;
//   allAcademicLevels: AcademicLevelOption[];
//   allClassRooms: ClassRoomOption[];
//   isLoading: boolean;
// }

// const getCurrentAcademicRecord = (student?: StudentType | null) => {
//   if (!student?.academicRecords?.length) return null;

//   return [...student.academicRecords].sort((a, b) => {
//     if (!a.year || !b.year) return 0;
//     return Number(b.year) - Number(a.year);
//   })[0];
// };

// const PromoteStudentModal: React.FC<PromoteStudentModalProps> = ({
//   isOpen,
//   student,
//   onClose,
//   onPromote,
//   allAcademicLevels,
//   allClassRooms,
//   isLoading,
// }) => {
//   const current = getCurrentAcademicRecord(student);

//   const [action, setAction] = useState<'PROMOTED' | 'RETAINED'>('PROMOTED');

//   const [form, setForm] = useState({
//     academicLevelId: '',
//     classRoomId: '',
//     year: '',
//     term: '',
//     session: '',
//     levelStatus: '' as StudentType['academicRecords'][0]['levelStatus'] | '',
//   });

//   useEffect(() => {
//     if (current) {
//       setForm({
//         academicLevelId: current.academicLevelId,
//         classRoomId: current.classRoomId || '',
//         year: '',
//         term: '',
//         session: '',
//         levelStatus: current.levelStatus || '',
//       });
//     }
//   }, [current]);

//   if (!isOpen || !student || !current) return null;

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     await onPromote({
//       studentId: student.id,
//       academicLevelId:
//         action === 'RETAINED'
//           ? current.academicLevelId
//           : form.academicLevelId,
//       classRoomId: form.classRoomId || null,
//       year: form.year,
//       term: form.term || null,
//       session: form.session || null,
//       action,
//       levelStatus: form.levelStatus || undefined,
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl relative">
//         {/* Header */}
//         <div className="flex items-center justify-between border-b px-6 py-4">
//           <h2 className="text-xl font-bold text-gray-900">
//             Promote / Retain Student
//           </h2>
//           <button onClick={onClose}>
//             <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Student Info */}
//           <div className="bg-gray-50 p-4 rounded-lg border">
//             <p className="font-semibold text-gray-800">{student.firstName}</p>
//             <p className="text-sm text-gray-600">
//               {current.academicLevelName} • {current.classRoomName || 'No Classroom'} • {current.year || 'N/A'}
//             </p>
//           </div>

//           {/* Action Toggle */}
//           <div className="flex gap-3">
//             <button
//               type="button"
//               onClick={() => setAction('PROMOTED')}
//               className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
//                 action === 'PROMOTED'
//                   ? 'bg-indigo-600 text-white'
//                   : 'bg-white'
//               }`}
//             >
//               <ArrowUpCircleIcon className="h-5 w-5" />
//               Promote
//             </button>

//             <button
//               type="button"
//               onClick={() => setAction('RETAINED')}
//               className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
//                 action === 'RETAINED'
//                   ? 'bg-amber-500 text-white'
//                   : 'bg-white'
//               }`}
//             >
//               <ArrowPathIcon className="h-5 w-5" />
//               Retain / Repeat
//             </button>
//           </div>

//           {/* Academic Level */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Academic Level
//             </label>
//             <select
//               disabled={action === 'RETAINED'}
//               value={form.academicLevelId}
//               onChange={e =>
//                 setForm(f => ({ ...f, academicLevelId: e.target.value }))
//               }
//               required
//               className="w-full px-3 py-2 border rounded-lg"
//             >
//               {allAcademicLevels.map(level => (
//                 <option key={level.id} value={level.id}>
//                   {level.name}
//                 </option>
//               ))}
//             </select>

//             {action === 'RETAINED' && (
//               <p className="text-xs text-gray-500 mt-1">
//                 Academic level is locked because the student is repeating.
//               </p>
//             )}
//           </div>

//           {/* Classroom */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Classroom (Optional)
//             </label>
//             <select
//               value={form.classRoomId}
//               onChange={e =>
//                 setForm(f => ({ ...f, classRoomId: e.target.value }))
//               }
//               className="w-full px-3 py-2 border rounded-lg"
//             >
//               <option value="">-- Select Classroom --</option>
//               {allClassRooms.map(room => (
//                 <option key={room.id} value={room.id}>
//                   {room.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Year / Session */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Academic Year *
//               </label>
//               <input
//                 type="text"
//                 required
//                 placeholder="2025"
//                 value={form.year}
//                 onChange={e =>
//                   setForm(f => ({ ...f, year: e.target.value }))
//                 }
//                 className="w-full px-3 py-2 border rounded-lg"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Term / Session
//               </label>
//               <input
//                 type="text"
//                 placeholder="Term 1 / Session A"
//                 value={form.term}
//                 onChange={e =>
//                   setForm(f => ({ ...f, term: e.target.value }))
//                 }
//                 className="w-full px-3 py-2 border rounded-lg"
//               />
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex justify-end gap-3 pt-4 border-t">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border rounded-lg"
//               disabled={isLoading}
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
//             >
//               {isLoading ? 'Processing…' : action === 'PROMOTED' ? 'Promote Student' : 'Retain Student'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default PromoteStudentModal;
