"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  ArrowPathIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

const AddEditLessonModal = ({ isOpen, onClose, moduleId, onAdded, editData, course }: any) => {
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [teacherNotes, setTeacherNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [objectives, setObjectives] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setTitle(editData.title || "");
      setDuration(editData.duration?.toString() || "");
      setDescription(editData.description || "");
      setContent(editData.content || "");
      setTeacherNotes(editData.teacherNotes || "");
      setVideoUrl(editData.videoUrl || "");
      setObjectives(editData.objectives?.join("\n") || "");
      setIsPublished(editData.isPublished || false);
      setIsFreePreview(editData.isFreePreview || false);
    } else {
      setTitle("");
      setDuration("");
      setDescription("");
      setContent("");
      setTeacherNotes("");
      setVideoUrl("");
      setObjectives("");
      setIsPublished(false);
      setIsFreePreview(false);
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editData
        ? `${apiBaseUrl}/admin/fitness-curriculum/lesson/${editData.id}`
        : `${apiBaseUrl}/admin/fitness-curriculum/lesson`;

      const method = editData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Credentials": "include" },
        body: JSON.stringify({
          title,
          moduleId,
          duration: Number(duration),
          order:
            editData?.order ??
            ((course?.modules?.find((m: any) => m.id === moduleId)?.lessons?.length || 0) + 1),
          description,
          content,
          teacherNotes,
          videoUrl,
          objectives: objectives
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          isPublished,
          isFreePreview,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onAdded();
        onClose();
        setTitle("");
        setDuration("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ y: "100%", sm: { y: 20, scale: 0.95 }, opacity: 0 }}
          animate={{ y: 0, sm: { y: 0, scale: 1 }, opacity: 1 }}
          exit={{ y: "100%", sm: { y: 20, scale: 0.95 }, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] border-t sm:border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-t-none"
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 sm:rounded-t-2xl rounded-t-2xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {editData ? "Edit Lesson Configuration" : "Create New Lesson"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {editData ? "Update the schema details below." : "Define the structural parameters for this lesson."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form id="lesson-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section: Basic Info */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  <DocumentTextIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  General Details
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lesson Title</label>
                    <input
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="e.g., Form Foundations: Deadlift"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Duration (Minutes)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="e.g., 15"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Video Asset URL</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <VideoCameraIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        placeholder="https://..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Written Content */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  <DocumentTextIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Curriculum Content
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Short Description</label>
                    <textarea
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="A brief summary of what this lesson covers..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Learning Objectives</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="One objective per line"
                      value={objectives}
                      onChange={(e) => setObjectives(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Teacher Notes (Private)</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                      placeholder="Internal notes for instructors..."
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Lesson Content</label>
                    <textarea
                      rows={6}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="Main instructional text..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section: Settings */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  <Cog6ToothIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Access & Visibility
                </div>

                <div className="flex flex-col sm:flex-row gap-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <label className="flex items-center justify-between sm:justify-start gap-4 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-indigo-600"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Publish Lesson</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Make visible to students</span>
                      </div>
                    </div>
                  </label>

                  <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-slate-700" />

                  <label className="flex items-center justify-between sm:justify-start gap-4 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" checked={isFreePreview} onChange={(e) => setIsFreePreview(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-500 peer-checked:bg-indigo-600"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">Free Preview</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Available to unsubscribed users</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 p-4 sm:px-6 bg-slate-50 dark:bg-slate-900/80 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="lesson-form"
              disabled={isSubmitting}
              className="inline-flex min-w-[140px] items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editData ? (
                "Save Modifications"
              ) : (
                "Create Lesson"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddEditLessonModal;