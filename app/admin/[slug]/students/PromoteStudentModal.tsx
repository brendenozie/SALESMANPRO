'use client';

import React, { useEffect, useState } from 'react';
import { XMarkIcon, AcademicCapIcon, ArrowUpCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { StudentType } from './StudentFormModal';

export type AcademicLevelOption = {
  id: string;
  name: string;
};

export type ClassRoomOption = {
  id: string;
  name: string;
};

// export type StudentType = {
//   id: string;
//   name: string;
//   academicRecords: {
//     academicLevelId: string;
//     academicLevelName: string;
//     classRoomId?: string | null;
//     classRoomName?: string | null;
//     year?: string | null;
//     term?: string | null;
//     session?: string | null;
//     levelStatus?: 'JUNIOR' | 'SENIOR' | 'SOPHOMORE' | 'FRESHMAN' | null | undefined;
//   }[];
// };

interface PromoteStudentModalProps {
  isOpen: boolean;
  student: StudentType | null;
  onClose: () => void;
  onPromote: (data: {
    studentId: string;
    academicLevelId: string;
    classRoomId?: string | null | undefined;
    year: string;
    term?: string | null | undefined;
    session?: string | null | undefined;
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
    year: '',
    term: '',
    session: '',
    levelStatus: '' as StudentType['academicRecords'][0]['levelStatus'] | '',
  });

  useEffect(() => {
    if (current) {
      setForm({
        academicLevelId: current.academicLevelId,
        classRoomId: current.classRoomId || '',
        year: '',
        term: '',
        session: '',
        levelStatus: current.levelStatus || '',
      });
    }
  }, [current]);

  if (!isOpen || !student || !current) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await onPromote({
      studentId: student.id,
      academicLevelId:
        action === 'RETAINED'
          ? current.academicLevelId
          : form.academicLevelId,
      classRoomId: form.classRoomId || null,
      year: form.year,
      term: form.term || null,
      session: form.session || null,
      action,
      levelStatus: form.levelStatus || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">
            Promote / Retain Student
          </h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="font-semibold text-gray-800">{student.firstName}</p>
            <p className="text-sm text-gray-600">
              {current.academicLevelName} • {current.classRoomName || 'No Classroom'} • {current.year || 'N/A'}
            </p>
          </div>

          {/* Action Toggle */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAction('PROMOTED')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                action === 'PROMOTED'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white'
              }`}
            >
              <ArrowUpCircleIcon className="h-5 w-5" />
              Promote
            </button>

            <button
              type="button"
              onClick={() => setAction('RETAINED')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
                action === 'RETAINED'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white'
              }`}
            >
              <ArrowPathIcon className="h-5 w-5" />
              Retain / Repeat
            </button>
          </div>

          {/* Academic Level */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Academic Level
            </label>
            <select
              disabled={action === 'RETAINED'}
              value={form.academicLevelId}
              onChange={e =>
                setForm(f => ({ ...f, academicLevelId: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border rounded-lg"
            >
              {allAcademicLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>

            {action === 'RETAINED' && (
              <p className="text-xs text-gray-500 mt-1">
                Academic level is locked because the student is repeating.
              </p>
            )}
          </div>

          {/* Classroom */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Classroom (Optional)
            </label>
            <select
              value={form.classRoomId}
              onChange={e =>
                setForm(f => ({ ...f, classRoomId: e.target.value }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">-- Select Classroom --</option>
              {allClassRooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year / Session */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Academic Year *
              </label>
              <input
                type="text"
                required
                placeholder="2025"
                value={form.year}
                onChange={e =>
                  setForm(f => ({ ...f, year: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Term / Session
              </label>
              <input
                type="text"
                placeholder="Term 1 / Session A"
                value={form.term}
                onChange={e =>
                  setForm(f => ({ ...f, term: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
            >
              {isLoading ? 'Processing…' : action === 'PROMOTED' ? 'Promote Student' : 'Retain Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteStudentModal;
