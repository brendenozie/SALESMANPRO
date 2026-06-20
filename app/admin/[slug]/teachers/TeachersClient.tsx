'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  UsersIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BookOpenIcon,
  ClockIcon,
  DocumentTextIcon,
  KeyIcon,
  XMarkIcon,
  TagIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

import EducatorFormModal from './EducatorFormModal';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;

// --- Type Definitions ---
export type AcademicLevelOption = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type ClassroomOption = {
  id: string;
  name: string;
  academicLevelId?: string;
};

export type EducatorAcademicLevelAssignment = {
  id: string;
  academicLevelId: string;
  academicLevel: AcademicLevelOption;
  classRoom: ClassroomOption | null;
  classRoomId: string | null;
  roleInLevel?: string;
};

export type EducatorType = {
  id: string;
  userId: string;
  loginCode: string;
  name: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  bio?: string;
  address?: string;
  companyId: string;
  departmentId?: string | null;
  departmentName?: string;
  academicLevels: AcademicLevelOption[];
  academicLevelAssignments: EducatorAcademicLevelAssignment[]; 
  classRooms?: ClassroomOption[]; 
  totalStudents: number;
  totalCoursesTaught: number;
  totalClassesScheduled: number;
  totalExamsCreated: number;
  totalMaterialsUploaded: number;
  totalAttendanceRecords: number;
  totalDiscussionTopics: number;
  totalUploadedMaterials: number;
  totalAssignmentSubmissions: number;
  totalExamSubmissions: number;
  totalGradesRecorded: number;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
};

interface TeachersClientProps {
  initialEducators: EducatorType[];
  allDepartments: DepartmentOption[];
  allAcademicLevels: AcademicLevelOption[];
  allClassrooms: ClassroomOption[];
  companyId: string;
  apiBaseUrl: string;
}

export default function TeachersClient({ 
  initialEducators, 
  allDepartments, 
  allAcademicLevels, 
  allClassrooms, 
  companyId, 
  apiBaseUrl 
}: TeachersClientProps) {
  const [educators, setEducators] = useState<EducatorType[]>(initialEducators);
  const [departments, setDepartments] = useState<DepartmentOption[]>(allDepartments);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevelOption[]>(allAcademicLevels);
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>(allClassrooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEducator, setEditingEducator] = useState<EducatorType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const fetchEducatorsAndDependencies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = `?companyId=${encodeURIComponent(companyId)}`;
      const [educatorsRes, departmentsRes, levelsRes, roomsRes] = await Promise.all([
        fetch(`${apiBaseUrl}/admin/educators${query}`, { credentials: 'include' }),
        fetch(`${apiBaseUrl}/admin/departments${query}`, { credentials: 'include' }),
        fetch(`${apiBaseUrl}/admin/academic-levels${query}`, { credentials: 'include' }),
        fetch(`${apiBaseUrl}/admin/classrooms${query}`, { credentials: 'include' })
      ]);

      if (educatorsRes.ok) setEducators((await educatorsRes.json()).data.data);
      if (departmentsRes.ok) setDepartments((await departmentsRes.json()).data.data);
      if (levelsRes.ok) setAcademicLevels((await levelsRes.json()).data);
      if (roomsRes.ok) setClassrooms((await roomsRes.json()).data);

    } catch (err: any) {
      setError(err.message || "Network error fetching data.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, companyId]);

  useEffect(() => {
    if (initialEducators.length === 0) {
      fetchEducatorsAndDependencies();
    }
  }, [fetchEducatorsAndDependencies, initialEducators.length]);

  const filteredEducators = useMemo(() => {
    return educators.filter(educator => {
      const matchesSearch = (educator.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (educator.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (educator.loginCode?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesDepartment = filterDepartment === 'All' || educator.departmentId === filterDepartment;
      return matchesSearch && matchesDepartment;
    }).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [educators, searchTerm, filterDepartment]);

  const handleSaveEducator = async (educatorData: any) => {
    setIsLoading(true);
    const method = educatorData.id ? 'PATCH' : 'POST';
    const url = educatorData.id ? `${apiBaseUrl}/admin/educators/${educatorData.id}` : `${apiBaseUrl}/admin/educators`;

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...educatorData, companyId }),
      });

      if (res.ok) {
        await fetchEducatorsAndDependencies();
        setShowFormModal(false);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Operation failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEducator = async (educatorId: string) => {
    if (!confirm("Are you sure?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/educators/${educatorId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) await fetchEducatorsAndDependencies();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculated Stats ---
  const totalTeachers = educators.length;
  const totalDepartments = departments.length;
  const avgCoursesPerTeacher = totalTeachers > 0 ? (educators.reduce((sum, e) => sum + e.totalCoursesTaught, 0) / totalTeachers).toFixed(1) : '0';
  const avgStudentsPerTeacher = totalTeachers > 0 ? (educators.reduce((sum, e) => sum + e.totalStudents, 0) / totalTeachers).toFixed(1) : '0';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50  min-h-screen font-sans antialiased text-slate-800">
      
      {/* Header Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm shadow-slate-100/40">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <AcademicCapIcon className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Teachers Directory
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
            Streamlined system to look up profiles, manage department alignments, assignments, and check metric performance indicators.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2.5 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60 text-xs sm:text-sm font-semibold text-slate-600 shadow-sm self-stretch md:self-auto justify-center">
          <CalendarDaysIcon className="h-4 w-4 text-slate-400" />
          <span>{today}</span>
        </div>
      </div>

      {/* Modern Status Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-800 px-5 py-4 rounded-2xl shadow-sm flex items-start justify-between gap-3 animate-fade-in">
          <div className="flex gap-2.5">
            <span className="font-bold text-rose-600 text-sm mt-0.5">Alert:</span>
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* High-Impact Analytics Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { title: "Total Teachers", val: totalTeachers, icon: UsersIcon, color: "indigo" },
          { title: "Active Depts", val: totalDepartments, icon: BriefcaseIcon, color: "emerald" },
          { title: "Avg Courses", val: `${avgCoursesPerTeacher}/tch`, icon: BookOpenIcon, color: "amber" },
          { title: "Avg Students", val: avgStudentsPerTeacher, icon: UsersIcon, color: "sky" },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:border-slate-200 transition-all">
            <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 shrink-0 group-hover:scale-105 transition-transform`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">{stat.title}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">{stat.val}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Main Filter & Content Block */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Dynamic Controls Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-4xl">
            {/* Elegant Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
            {/* Filter Dropdown */}
            <div className="relative min-w-[180px]">
              <FunnelIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none transition-all font-medium text-slate-600"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => { setEditingEducator(null); setShowFormModal(true); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm shadow-indigo-600/10 active:scale-[0.98]"
          >
            <UserPlusIcon className="h-4 w-4" /> Add Teacher
          </button>
        </div>

        {/* Dynamic Loading Overlay View */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center min-h-[200px]">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <svg className="animate-spin h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Syncing changes...
              </div>
            </div>
          )}

          {filteredEducators.length > 0 ? (
            <>
              {/* DESKTOP TABLE VIEW: Visible from Medium Screens (`md`) and up */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                      <th className="px-6 py-4">Teacher</th>
                      <th className="px-6 py-4">Security Code</th>
                      <th className="px-6 py-4">Contact Info</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Assignments</th>
                      <th className="px-6 py-4">Activity Matrix</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {filteredEducators.map((educator) => (
                      <tr key={educator.id} className="hover:bg-indigo-50/20 transition-colors">
                        {/* Profile Block */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Image
                              className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100 bg-slate-50"
                              src={educator.profilePicture || `https://placehold.co/100x100/E0E7FF/4338CA?text=${educator.name?.charAt(0) || '?'}`}
                              alt={educator.name || 'Avatar'}
                              width={44}
                              height={44}
                              loader={loader}
                            />
                            <div className="max-w-[180px]">
                              <p className="font-semibold text-slate-900 truncate">{educator.name}</p>
                              <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{educator.bio || 'No biography written.'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Security Code */}
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-indigo-600">
                          <span className="bg-indigo-50/60 px-2 py-1 rounded-md border border-indigo-100/50 flex items-center gap-1 w-fit">
                            <KeyIcon className="h-3 w-3 text-indigo-400" /> {educator.loginCode}
                          </span>
                        </td>

                        {/* Contact Meta */}
                        <td className="px-6 py-4 whitespace-nowrap text-xs space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400" /> {educator.email}
                          </div>
                          {educator.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <PhoneIcon className="h-3.5 w-3.5" /> {educator.phone}
                            </div>
                          )}
                        </td>

                        {/* Department Data */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{educator.departmentName || 'Unassigned'}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Since {new Date(educator.createdAt).toLocaleDateString()}</p>
                        </td>

                        {/* Assignments Badges */}
                        <td className="px-6 py-4">
                          {educator.academicLevelAssignments && educator.academicLevelAssignments.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                              {educator.academicLevelAssignments.map(asn => {
                                const lvlName = allAcademicLevels.find(l => l.id === asn.academicLevelId)?.name;
                                const rmName = allClassrooms.find(r => r.id === asn.classRoomId)?.name;
                                return (
                                  <div key={asn.id} className="text-[10px] px-2 py-1 rounded-md bg-slate-100 border border-slate-200/40 text-slate-700 font-medium">
                                    <span className="font-bold">{lvlName}</span>
                                    {rmName && <span className="text-slate-400 font-normal block italic">Room: {rmName}</span>}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">None</span>
                          )}
                        </td>

                        {/* Activity Matrix Cell */}
                        <td className="px-6 py-4 whitespace-nowrap text-[11px]">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 max-w-[260px] text-slate-500 font-medium">
                            <div className="flex items-center gap-1"><BookOpenIcon className="h-3 w-3 text-slate-400" /> Crs: <b className="text-slate-800">{educator.totalCoursesTaught}</b></div>
                            <div className="flex items-center gap-1"><UsersIcon className="h-3 w-3 text-slate-400" /> Std: <b className="text-slate-800">{educator.totalStudents}</b></div>
                            <div className="flex items-center gap-1"><ClockIcon className="h-3 w-3 text-slate-400" /> Cls: <b className="text-slate-800">{educator.totalClassesScheduled}</b></div>
                            <div className="flex items-center gap-1"><DocumentTextIcon className="h-3 w-3 text-slate-400" /> Exm: <b className="text-slate-800">{educator.totalExamsCreated}</b></div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingEducator(educator); setShowFormModal(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Edit teacher"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEducator(educator.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove teacher"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE RESPONSIVE BENTO-CARD VIEW: Visible on screens up to `md` */}
              <div className="md:hidden grid grid-cols-1 gap-4 p-4 bg-slate-50/50">
                {filteredEducators.map((educator) => (
                  <div key={educator.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                    
                    {/* Top Identity Block */}
                    <div className="flex items-center gap-3">
                      <Image
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
                        src={educator.profilePicture || `https://placehold.co/100x100/E0E7FF/4338CA?text=${educator.name?.charAt(0) || '?'}`}
                        alt={educator.name}
                        width={48}
                        height={48}
                        loader={loader}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 truncate">{educator.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">{educator.departmentName || 'No Assigned Department'}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => { setEditingEducator(educator); setShowFormModal(true); }}
                          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg bg-slate-50"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEducator(educator.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg bg-slate-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meta Row Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/40">
                        Code: {educator.loginCode}
                      </span>
                      {educator.phone && (
                        <span className="text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/40 flex items-center gap-1">
                          <PhoneIcon className="h-3 w-3" /> {educator.phone}
                        </span>
                      )}
                    </div>

                    {/* Class Assignments Block */}
                    {educator.academicLevelAssignments && educator.academicLevelAssignments.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level Allocations</p>
                        <div className="flex flex-wrap gap-1">
                          {educator.academicLevelAssignments.map(asn => (
                            <span key={asn.id} className="text-[10px] font-medium bg-white text-slate-700 px-2 py-1 rounded-md border border-slate-200/60 shadow-2xs">
                              {allAcademicLevels.find(l => l.id === asn.academicLevelId)?.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Compact Mobile Activity Stat Badges */}
                    <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-center">
                      <div>
                        <p className="text-lg font-bold text-slate-800">{educator.totalCoursesTaught}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase">Courses</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">{educator.totalStudents}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase">Students</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">{educator.totalClassesScheduled}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase">Classes</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-800">{educator.totalExamsCreated}</p>
                        <p className="text-[9px] font-semibold text-slate-400 uppercase">Exams</p>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Clear Empty State Illustration Section */
            <div className="px-6 py-16 text-center text-slate-400 max-w-sm mx-auto">
              <div className="p-4 bg-slate-50 w-fit rounded-full mx-auto mb-4 border border-slate-100">
                <UsersIcon className="h-8 w-8 text-slate-300" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No teachers found</h4>
              <p className="text-xs text-slate-400 mt-1">We couldn't find any teaching profiles matching that name or selected filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Educator Modal component layer stays completely ready */}
      {showFormModal && (
        <EducatorFormModal
          isOpen={showFormModal}
          educatorData={editingEducator}
          onClose={() => { setShowFormModal(false); setEditingEducator(null); }}
          onSave={handleSaveEducator}
          allDepartments={departments}
          allAcademicLevels={academicLevels}
          allClassrooms={classrooms}
          isLoading={isLoading}
          companyId={companyId}
        />
      )}
    </div>
  );
}