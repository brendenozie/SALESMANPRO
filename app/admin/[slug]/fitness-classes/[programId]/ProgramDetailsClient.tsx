"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircleIcon,
  BookOpenIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  LinkIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  ClockIcon,
  PaperClipIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import AddEditLessonModal from "./AddEditLessonModal";
import AddEditModuleModal from "./AddEditModuleModal";
import AddResourceModal from "./AddResourceModal";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

// --- UTILS: S3 UPLOAD HELPER ---
async function uploadFiles(
  files: File[],
  type: "image" | "video" | "book",
  onProgress?: (progress: number, file: File) => void
): Promise<{ url: string; key: string; contentType: string }[]> {
  if (!files?.length) return [];

  const uploads = files.map(async (file) => {
    const res = await fetch(
      `${apiBaseUrl}/upload-url?filename=${encodeURIComponent(file.name)}&type=${type}&contentType=${encodeURIComponent(file.type)}`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to get signed URL: ${text}`);
    }

    const { uploadUrl, publicUrl, key, contentType } = await res.json();

    const xhr = new XMLHttpRequest();
    await new Promise<void>((resolve, reject) => {
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100), file);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error(`Upload failed for ${file.name}: ${xhr.status}`));
      };

      xhr.onerror = () => reject(new Error(`Network error for ${file.name}`));
      xhr.send(file);
    });

    return { url: publicUrl, key, contentType };
  });

  return Promise.all(uploads);
}

// --- TYPES ---
interface Material {
  id: string;
  title: string;
  type: "DOCUMENT" | "VIDEO" | "LINK";
  fileUrl?: string;
  linkUrl?: string;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isFreePreview: boolean;
  isPublished: boolean;
  teacherNotes?: string;
  objectives: string[];
  materials: Material[];
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  code: string;
  price?: number;
  duration?: string;
  rating?: number;
  status: string;
  companyId: string;
  modules: Module[];
}

// --- MAIN CRUD DETAILS CLIENT VIEW ---
export default function ProgramDetailsClient({ slug, programId }: { slug: string; programId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  // Base Course Details Form Edit State
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaTargetAudience, setMetaTargetAudience] = useState("");
  const [metaDifficultyLevel, setMetaDifficultyLevel] = useState("BEGINNER");
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);

  // Modals Controller Context states
  const [isModuleModalOpen, setModuleModalOpen] = useState(false);
  const [selectedModuleForEdit, setSelectedModuleForEdit] = useState<any | null>(null);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<any | null>(null);
  const [isLessonModalOpen, setLessonModalOpen] = useState(false);
  const [activeLessonForResource, setActiveLessonForResource] = useState<string | null>(null);

  // Destructive Prompt Control Hooks
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-classes/${programId}`, {
        headers: { "Content-Type": "application/json", "Credentials": "include" },
      });
      const json = await res.json();
      if (json.success) {
        setCourse(json.data);
        setMetaTitle(json.data.title || "");
        setMetaDescription(json.data.description || "");
        setMetaTargetAudience(json.data.targetAudience || "");
        setMetaDifficultyLevel(json.data.difficultyLevel || "BEGINNER");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetails(); }, [programId]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingMeta(true);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-classes/${programId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Credentials": "include" },
        body: JSON.stringify({
          title: metaTitle,
          description: metaDescription,
          targetAudience: metaTargetAudience,
          difficultyLevel: metaDifficultyLevel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditingMetadata(false);
        fetchDetails();
      } else {
        alert(`Failed to save details: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingMeta(false);
    }
  };

  const handleDeleteNode = async (id: string, type: "module" | "lesson" | "material") => {
    try {
      const res = await fetch(`${apiBaseUrl}/admin/fitness-curriculum/${type}/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setIsDeletingId(null);
        fetchDetails();
      } else {
        alert(`Deletion error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center gap-3">
        <ArrowPathIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <span className="text-sm font-medium text-slate-500 tracking-wide">Loading workspace...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
        <div className="text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 max-w-md shadow-sm">
          <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">Record Not Found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">The requested configuration could not be located in the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {course.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {course.code && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {course.code}
                </span>
              )}
              {course.status && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {course.status}
                </span>
              )}
              {course.duration && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <ClockIcon className="w-4 h-4" /> {course.duration}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0 w-full sm:w-auto">
            <button 
              onClick={() => setIsEditingMetadata(!isEditingMetadata)} 
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              {isEditingMetadata ? "Cancel Editing" : "Edit Metadata"}
            </button>
            <button 
              onClick={() => { setSelectedModuleForEdit(null); setModuleModalOpen(true); }} 
              className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Add Module
            </button>
          </div>
        </div>

        {/* Dynamic Metadata Form */}
        <AnimatePresence>
          {isEditingMetadata && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 sm:p-8">
                <form onSubmit={handleUpdateMetadata} className="space-y-6">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <AcademicCapIcon className="w-5 h-5 text-slate-500" /> General Information
                  </h3>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Program Title</label>
                      <input 
                        required 
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
                        value={metaTitle} 
                        onChange={(e) => setMetaTitle(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Target Audience</label>
                      <input 
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
                        placeholder="e.g., Enterprise Sales, Beginners" 
                        value={metaTargetAudience} 
                        onChange={(e) => setMetaTargetAudience(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Difficulty Level</label>
                      <select 
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
                        value={metaDifficultyLevel} 
                        onChange={(e) => setMetaDifficultyLevel(e.target.value)}
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                      <textarea 
                        rows={4} 
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
                        placeholder="Provide a comprehensive overview of this module..." 
                        value={metaDescription} 
                        onChange={(e) => setMetaDescription(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button type="button" onClick={() => setIsEditingMetadata(false)} className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors shadow-sm">
                      Cancel
                    </button>
                    <button disabled={isUpdatingMeta} className="inline-flex min-w-[120px] justify-center items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
                      {isUpdatingMeta ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Module Accordion Workspace */}
        <div className="space-y-4">
          {course.modules?.map((mod) => (
            <div 
              key={mod.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden"
            >
              {/* Module Header Strip */}
              <div 
                onClick={() => toggleModule(mod.id)} 
                className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-2 bg-slate-100 text-slate-500 rounded-lg dark:bg-slate-800 dark:text-slate-400">
                    <BookOpenIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white truncate">{mod.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{mod.lessons.length} Lesson{mod.lessons.length !== 1 && 's'}</p>
                  </div>
                </div>
                
                {/* Module Action Utilities */}
                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <button 
                    title="Edit Module" 
                    onClick={() => { setSelectedModuleForEdit(mod); setModuleModalOpen(true); }} 
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  
                  {isDeletingId === mod.id ? (
                    <div className="flex items-center bg-rose-50 border border-rose-200 rounded-lg overflow-hidden dark:bg-rose-500/10 dark:border-rose-500/20">
                      <button onClick={() => handleDeleteNode(mod.id, "module")} className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors">
                        Confirm
                      </button>
                      <button onClick={() => setIsDeletingId(null)} className="px-2 py-1.5 text-rose-700 hover:bg-rose-100 border-l border-rose-200 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/20 transition-colors">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      title="Delete Module" 
                      onClick={() => setIsDeletingId(mod.id)} 
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}

                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                  
                  <motion.div 
                    animate={{ rotate: expandedModules[mod.id] ? 180 : 0 }} 
                    transition={{ duration: 0.2 }}
                    className="p-1"
                  >
                    <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </div>
              </div>

              {/* Lessons List Wrapper */}
              <AnimatePresence initial={false}>
                {expandedModules[mod.id] && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: "auto", opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-6 space-y-4">
                      
                      {mod.lessons?.map((lesson) => (
                        <div 
                          key={lesson.id} 
                          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                        >
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{lesson.title}</h4>
                              {lesson.duration && (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                                  <ClockIcon className="w-3.5 h-3.5" />
                                  {lesson.duration}m
                                </span>
                              )}
                              {lesson.isFreePreview && (
                                <span className="inline-flex text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/20">
                                  Preview
                                </span>
                              )}
                            </div>
                            
                            {lesson.description && (
                              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {lesson.description}
                              </p>
                            )}
                            
                            {lesson.videoUrl && (
                              <a
                                href={lesson.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                              >
                                <VideoCameraIcon className="w-4 h-4" />
                                View Video Asset
                              </a>
                            )}

                            {/* Associated Materials */}
                            {lesson.materials && lesson.materials.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {lesson.materials.map((mat) => (
                                  <div key={mat.id} className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-700 pl-2 pr-1 py-1 rounded-md dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 shadow-sm">
                                    {mat.type === "VIDEO" ? (
                                      <VideoCameraIcon className="w-3.5 h-3.5 text-slate-400" />
                                    ) : mat.type === "LINK" ? (
                                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                                    ) : (
                                      <DocumentTextIcon className="w-3.5 h-3.5 text-slate-400" />
                                    )}
                                    <span className="truncate max-w-[120px]">{mat.title}</span>
                                    
                                    <button 
                                      onClick={() => handleDeleteNode(mat.id, "material")} 
                                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors"
                                    >
                                      <XMarkIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Lesson Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start">
                            <button 
                              onClick={() => setActiveLessonForResource(lesson.id)} 
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 shadow-sm"
                            >
                              <PaperClipIcon className="w-3.5 h-3.5 text-slate-400" />
                              Attach
                            </button>
                            
                            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

                            <button 
                              title="Edit Lesson" 
                              onClick={() => { setSelectedLessonForEdit(lesson); setActiveModuleForLesson(mod.id); setLessonModalOpen(true); }} 
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 transition-colors"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>

                            {isDeletingId === lesson.id ? (
                              <div className="flex items-center bg-rose-50 border border-rose-200 rounded-lg overflow-hidden dark:bg-rose-500/10 dark:border-rose-500/20">
                                <button onClick={() => handleDeleteNode(lesson.id, "lesson")} className="px-2 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors">
                                  Confirm
                                </button>
                                <button onClick={() => setIsDeletingId(null)} className="p-1.5 text-rose-700 hover:bg-rose-100 border-l border-rose-200 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/20 transition-colors">
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button 
                                title="Delete Lesson" 
                                onClick={() => setIsDeletingId(lesson.id)} 
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Lesson Button Area */}
                      <button 
                        onClick={() => { setSelectedLessonForEdit(null); setActiveModuleForLesson(mod.id); setLessonModalOpen(true); }} 
                        className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusCircleIcon className="w-5 h-5" />
                        Add New Lesson
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* PORTALS */}
      <AddEditModuleModal isOpen={isModuleModalOpen} onClose={() => { setModuleModalOpen(false); setSelectedModuleForEdit(null); }} courseId={programId} companyId={course.companyId} onAdded={fetchDetails} editData={selectedModuleForEdit} />
      <AddEditLessonModal isOpen={isLessonModalOpen} onClose={() => { setLessonModalOpen(false); setSelectedLessonForEdit(null); }} moduleId={activeModuleForLesson} onAdded={fetchDetails} editData={selectedLessonForEdit} />
      <AddResourceModal isOpen={activeLessonForResource !== null} onClose={() => setActiveLessonForResource(null)} courseId={programId} lessonId={activeLessonForResource} onAdded={fetchDetails} />
    </div>
  );
}