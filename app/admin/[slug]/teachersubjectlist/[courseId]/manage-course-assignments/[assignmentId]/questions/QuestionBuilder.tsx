'use client';

import React, { useState } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronLeftIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  ListBulletIcon, 
  PlusCircleIcon,
  CheckCircleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function QuestionBuilder({ initialQuestions, assignment, courseId, assignmentId }: any) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = (type: 'text' | 'file' | 'multiple_choice') => {
    const newQuest = {
      id: `new-${Date.now()}`,
      type: type,
      text: '',
      points: 5,
      options: type === 'multiple_choice' ? ['', ''] : []
    };
    setQuestions([...questions, newQuest]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q: any) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map((q: any) => q.id === id ? { ...q, [field]: value } : q));
  };

   const addOption = (questionId: string) => {
    setQuestions(questions.map((q: any) => {
      if (q.id === questionId) {
        return { ...q, options: [...(q.options || []), ""] };
      }
      return q;
    }));
  };

  const updateOptionText = (questionId: string, optIndex: number, text: string) => {
    setQuestions(questions.map((q: any) => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optIndex] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const toggleCorrect = (questionId: string, optIndex: number) => {
    setQuestions(questions.map((q: any) => {
      if (q.id === questionId) {
        // This logic sets a single correct answer. 
        // Change to an array toggle if you want multiple correct answers.
        return { ...q, correctAnswerIndex: optIndex };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optIndex: number) => {
    setQuestions(questions.map((q: any) => {
      if (q.id === questionId) {
        return { ...q, options: q.options.filter((_: any, i: number) => i !== optIndex) };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // API logic to sync the questions array with the backend
    console.log("Saving questions:", questions);
    setTimeout(() => setIsSaving(false), 1000); // Simulate API
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Breadcrumbs & Header */}
      <nav className="mb-6 flex items-center text-sm text-gray-500">
        <Link href={`/admin/teachersubjectlist/${courseId}`} className="hover:text-indigo-600">Subject Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Edit Assignment</span>
      </nav>

      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{assignment?.title || 'Assignment Questions'}</h1>
          <p className="text-gray-500 italic mt-1 font-serif">Prepare the tasks for your students.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isSaving ? 'Syncing...' : 'Save Changes'}
        </button>
      </header>

      {/* Question List */}      
      <div className="space-y-8">
        {questions.map((q: any, index: number) => (
          <div key={q.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm relative group">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg text-xs font-bold">
                  {index + 1}
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  {q.type.replace('_', ' ')}
                </span>
               </div>
               <button onClick={() => removeQuestion(q.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Question Prompt */}
            <input
              className="w-full text-xl font-semibold border-none focus:ring-0 p-0 mb-6 placeholder-gray-300"
              placeholder="What is the question?"
              value={q.text}
              onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
            />

            {/* MCQ Specific Logic */}
            {q.type === 'multiple_choice' && (
              <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-tighter">Answer Options</p>
                {q.options?.map((opt: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 group/opt">
                    <button 
                      onClick={() => toggleCorrect(q.id, i)}
                      title="Mark as correct"
                    >
                      {q.correctAnswerIndex === i ? (
                        <CheckBadgeIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <CheckCircleIcon className="h-6 w-6 text-gray-300 hover:text-green-400" />
                      )}
                    </button>
                    
                    <input 
                      type="text"
                      value={opt}
                      onChange={(e) => updateOptionText(q.id, i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className={`flex-1 bg-white border ${q.correctAnswerIndex === i ? 'border-green-200 ring-2 ring-green-50' : 'border-gray-200'} rounded-lg px-4 py-2 text-sm focus:border-indigo-500 outline-none`}
                    />

                    <button 
                      onClick={() => removeOption(q.id, i)}
                      className="opacity-0 group-hover/opt:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button 
                  onClick={() => addOption(q.id)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-2 ml-9 transition-colors"
                >
                  <PlusCircleIcon className="h-4 w-4" /> Add Option
                </button>
              </div>
            )}

            {/* Question Footer (Points) */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">POINTS:</span>
                    <input 
                        type="number"
                        className="w-12 text-center font-bold text-indigo-600 border-b-2 border-transparent focus:border-indigo-500 outline-none"
                        value={q.points}
                        onChange={(e) => updateQuestion(q.id, 'points', e.target.value)}
                    />
                </div>
            </div>
          </div>
        ))}
        {/* Action Bar: Add Question */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
          <AddButton icon={<DocumentTextIcon className="h-5 w-5" />} label="Short Answer" onClick={() => addQuestion('text')} />
          <AddButton icon={<CloudArrowUpIcon className="h-5 w-5" />} label="File Upload" onClick={() => addQuestion('file')} />
          <AddButton icon={<ListBulletIcon className="h-5 w-5" />} label="Multiple Choice" onClick={() => addQuestion('multiple_choice')} />
        </div>
      </div>
    </div>
  );
}

function AddButton({ icon, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-semibold"
    >
      {icon} {label}
    </button>
  );
}