'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  submission: any;
  totalPoints: number;
  onSuccess: (data: any) => void;
}

export default function GradingSidebar({ isOpen, onClose, submission, totalPoints, onSuccess }: SidebarProps) {
  const [score, setScore] = useState<number | string>('');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state when a new submission is selected
  useEffect(() => {
    if (submission) {
      setScore(submission.score ?? '');
      setFeedback(submission.feedback ?? '');
      setError(null);
    }
  }, [submission]);

  const handleSave = async () => {
    if (!submission) return;
    
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/assignment-submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Number(score),
          feedback: feedback,
          status: 'Graded' // Automatically move status to graded
        }),
      });

      if (!response.ok) throw new Error('Failed to update grade');

      const result = await response.json();
      onSuccess(result.data); // Update the parent table UI
      onClose(); // Close the sidebar
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <aside className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Grade Submission</h2>
              <p className="text-sm text-gray-500">{submission?.studentName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Info */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Attached File</p>
              <a 
                href={submission?.fileUrl} 
                target="_blank" 
                className="text-sm font-medium text-indigo-700 hover:underline flex items-center gap-1 mt-1"
              >
                View Student Work.pdf
              </a>
            </div>

            {/* Score Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Score (Out of {totalPoints})
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  max={totalPoints}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-indigo-500 focus:ring-0 outline-none transition-all text-lg font-semibold"
                  placeholder="0.00"
                />
                <span className="absolute right-4 top-3.5 text-gray-400 font-medium">/ {totalPoints}</span>
              </div>
            </div>

            {/* Feedback Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feedback to Student
              </label>
              <textarea 
                rows={8}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:border-indigo-500 focus:ring-0 outline-none transition-all resize-none"
                placeholder="Provide constructive feedback here..."
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 italic">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || score === ''}
              className="flex-[2] px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              {isSaving ? (
                <>
                  <CloudArrowUpIcon className="h-5 w-5 animate-bounce" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-5 w-5" />
                  Release Grade
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}