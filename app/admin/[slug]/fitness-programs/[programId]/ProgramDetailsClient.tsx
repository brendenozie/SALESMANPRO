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
  ChevronUpIcon,
  XMarkIcon,
  ArrowPathIcon,
  CloudArrowUpIcon
} from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
interface Material { id: string; title: string; type: string; fileUrl?: string; linkUrl?: string; }
interface Lesson { id: string; title: string; duration: number; materials: Material[]; }
interface Module { id: string; title: string; lessons: Lesson[]; }
interface Course { id: string; title: string; companyId: string; modules: Module[]; }

// --- MODALS ---
const AddModuleModal = ({ isOpen, onClose, courseId, companyId, onAdded }: any) => {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch(`${apiBaseUrl}/admin/fitness-curriculum/module`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, courseId, companyId, order: 1 }),
    });
    const data = await res.json();
    setIsSubmitting(false);
    if (data.success) { onAdded(); onClose(); setTitle(""); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
        <h2 className="text-2xl font-bold text-white mb-6">Add Module</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none" placeholder="Module Title (e.g., Week 1: Basics)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <button disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex justify-center">
            {isSubmitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Save Module"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AddLessonModal = ({ isOpen, onClose, moduleId, onAdded }: any) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch(`${apiBaseUrl}/admin/fitness-curriculum/lesson`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, moduleId, duration, order: 1 }),
    });
    const data = await res.json();
    setIsSubmitting(false);
    if (data.success) { onAdded(); onClose(); setTitle(""); setDuration(""); }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
        <h2 className="text-2xl font-bold text-white mb-6">Add Lesson</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none" placeholder="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="number" className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none" placeholder="Duration (Minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} />
          <button disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex justify-center">
            {isSubmitting ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : "Save Lesson"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AddResourceModal = ({ isOpen, onClose, courseId, lessonId, onAdded }: any) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("DOCUMENT"); // DOCUMENT, VIDEO, LINK
  const [externalUrl, setExternalUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();
  const educatorId = session.data?.user?.id || "65f1a2b3c4d5e6f7a8b9c0d1"; // Placeholder ID: Handled contextually by company backend auth token sessions


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalUrl = externalUrl;

      // Map matching file category to S3 logic layout
      if (type !== "LINK" && selectedFile) {
        const uploadType = type === "VIDEO" ? "video" : "book";
        const uploadResult = await uploadFiles([selectedFile], uploadType, (progress) => {
          setUploadProgress(progress);
        });
        if (uploadResult && uploadResult.length > 0) {
          finalUrl = uploadResult[0].url;
        }
      }

      const payload = {
        title,
        type,
        fileUrl: type !== "LINK" ? finalUrl : undefined,
        linkUrl: type === "LINK" ? finalUrl : undefined,
        courseId,
        lessonId,
        uploadedById: educatorId // Fallback fallback contextual Admin/Educator ID proxy
      };

      const res = await fetch(`${apiBaseUrl}/admin/fitness-curriculum/material`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        onAdded();
        onClose();
        setTitle("");
        setExternalUrl("");
        setSelectedFile(null);
        setUploadProgress(null);
        setType("DOCUMENT");
      } else {
        alert(`Error saving asset reference: ${data.message}`);
      }
    } catch (error) {
      console.error("Resource attachment sequence execution failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md relative border border-gray-700">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
        <h2 className="text-2xl font-bold text-white mb-6">Add Lesson Resource</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Resource Title</label>
            <input required className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none" placeholder="e.g., Core Routine Blueprint PDF" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Resource Type</label>
            <select className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none" value={type} onChange={(e) => { setType(e.target.value); setSelectedFile(null); setExternalUrl(""); }}>
              <option value="DOCUMENT">Document (PDF/Doc/EBook Upload)</option>
              <option value="VIDEO">Video Asset (MP4/MOV Upload)</option>
              <option value="LINK">External Resource Link (URL)</option>
            </select>
          </div>

          {type === "LINK" ? (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Destination Link URL</label>
              <input required type="url" className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-indigo-500 outline-none" placeholder="https://youtube.com/..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">File Attachment</label>
              <div className="border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-6 text-center cursor-pointer relative bg-gray-900/50">
                <input required={!selectedFile} type="file" accept={type === "VIDEO" ? "video/*" : ".pdf,.doc,.docx,.epub"} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-300 block font-medium truncate">
                  {selectedFile ? selectedFile.name : `Select a ${type.toLowerCase()} asset file`}
                </span>
              </div>
            </div>
          )}

          {/* S3 Track Context Indicator Bar */}
          {uploadProgress !== null && (
            <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden mt-2">
              <div className="bg-indigo-500 h-2 transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}

          <button disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold flex justify-center items-center mt-2 disabled:opacity-50">
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                {uploadProgress !== null ? `Uploading Asset (${uploadProgress}%)` : "Processing"}
              </>
            ) : (
              "Attach Resource"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN CLIENT COMPONENT ---
export default function ProgramDetailsClient({ slug, programId }: { slug: string, programId: string }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  
  const [isModuleModalOpen, setModuleModalOpen] = useState(false);
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [activeLessonForResource, setActiveLessonForResource] = useState<string | null>(null);

  const fetchDetails = async () => {
    setLoading(true);
    const res = await fetch(`${apiBaseUrl}/admin/fitness-programs/${programId}`);
    const json = await res.json();
    if (json.success) setCourse(json.data);
    setLoading(false);
  };

  useEffect(() => { fetchDetails(); }, [programId]);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  if (!course) return <div className="min-h-screen bg-gray-900 text-white p-8">Program not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">{course.title}</h1>
            <p className="text-gray-400 mt-2">Curriculum Builder</p>
          </div>
          <button onClick={() => setModuleModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 px-5 py-3 rounded-xl flex items-center font-medium transition shadow-lg shadow-indigo-500/20">
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Add Module
          </button>
        </div>

        <div className="space-y-6">
          {course.modules?.map((mod) => (
            <div key={mod.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-sm">
              <div onClick={() => toggleModule(mod.id)} className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-750 transition">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <BookOpenIcon className="w-6 h-6 mr-3 text-indigo-400" />
                  {mod.title}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 bg-gray-900 px-3 py-1 rounded-full">{mod.lessons.length} Lessons</span>
                  {expandedModules[mod.id] ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedModules[mod.id] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-700 bg-gray-800/50">
                    <div className="p-6 space-y-4">
                      {mod.lessons.map(lesson => (
                        <div key={lesson.id} className="bg-gray-900 p-4 rounded-xl flex justify-between items-start border border-gray-700/50">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-200">{lesson.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{lesson.duration ? `${lesson.duration} mins` : 'No duration set'}</p>
                            
                            {lesson.materials?.length > 0 && (
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {lesson.materials.map(mat => (
                                  <span key={mat.id} className="flex items-center text-xs bg-indigo-900/40 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">
                                    {mat.type === 'VIDEO' ? <VideoCameraIcon className="w-3 h-3 mr-1" /> : mat.type === 'LINK' ? <LinkIcon className="w-3 h-3 mr-1" /> : <DocumentTextIcon className="w-3 h-3 mr-1" />}
                                    {mat.title}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <button onClick={() => setActiveLessonForResource(lesson.id)} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-indigo-500 transition">
                            <PlusCircleIcon className="w-4 h-4 mr-1" /> Add Resource
                          </button>
                        </div>
                      ))}

                      <button onClick={() => setActiveModuleForLesson(mod.id)} className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:text-indigo-400 hover:border-indigo-500/50 transition flex items-center justify-center font-medium">
                        <PlusCircleIcon className="w-5 h-5 mr-2" /> Add New Lesson
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {course.modules?.length === 0 && (
            <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700 border-dashed">
              <BookOpenIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400">No Curriculum Yet</h3>
              <p className="text-gray-500 mt-2">Start by adding your first module to this program.</p>
            </div>
          )}
        </div>
      </div>

      <AddModuleModal isOpen={isModuleModalOpen} onClose={() => setModuleModalOpen(false)} courseId={course.id} companyId={course.companyId} onAdded={fetchDetails} />
      <AddLessonModal isOpen={!!activeModuleForLesson} onClose={() => setActiveModuleForLesson(null)} moduleId={activeModuleForLesson} onAdded={fetchDetails} />
      <AddResourceModal isOpen={!!activeLessonForResource} onClose={() => setActiveLessonForResource(null)} courseId={course.id} lessonId={activeLessonForResource} onAdded={fetchDetails} />
    </div>
  );
}