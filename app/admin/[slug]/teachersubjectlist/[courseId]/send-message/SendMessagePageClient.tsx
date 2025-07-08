// app/admin/[slug]/teacher-classes/[courseId]/send-message/SendMessagePageClient.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon, // For removing selected students
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { CourseInfo, EnrolledStudent } from './page';

// Import types from the server component file

// Mocking context data for demonstration purposes (replace with actual context in your app)
const useMockThemeSettings = () => ({
  primaryColor: "#4F46E5", // Indigo-600
  accentColor: "#818CF8", // Indigo-300
});

interface SendMessagePageClientProps {
  course: CourseInfo;
  enrolledStudents: EnrolledStudent[];
  educatorUserId: string;
  companyId: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function SendMessagePageClient({
  course,
  enrolledStudents,
  educatorUserId,
  companyId,
}: SendMessagePageClientProps) {
  const router = useRouter();
  const { primaryColor, accentColor } = useMockThemeSettings(); // Replace with actual context

  const [selectedStudentUserIds, setSelectedStudentUserIds] = useState<string[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const showStatus = useCallback((type: 'success' | 'error', message: string) => {
    setStatusMessage({ type, message });
    setTimeout(() => setStatusMessage(null), 3000);
  }, []);

  const handleStudentSelect = useCallback((userId: string) => {
    setSelectedStudentUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const handleRemoveStudent = useCallback((userId: string) => {
    setSelectedStudentUserIds(prev => prev.filter(id => id !== userId));
  }, []);

  const selectedStudents = useMemo(() => {
    return enrolledStudents.filter(student => selectedStudentUserIds.includes(student.userId));
  }, [enrolledStudents, selectedStudentUserIds]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (selectedStudentUserIds.length === 0) {
      showStatus('error', 'Please select at least one student to send the message to.');
      return;
    }
    if (!messageContent.trim()) {
      showStatus('error', 'Message content cannot be empty.');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const payload = {
      courseId: course.id,
      senderUserId: educatorUserId,
      recipientStudentUserIds: selectedStudentUserIds,
      messageContent: messageContent.trim(),
      companyId: companyId,
    };

    try {
      const res = await fetch(`${apiUrl}/teacher/messages/send-course-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showStatus('success', `Message sent successfully to ${selectedStudentUserIds.length} student(s)!`);
        setMessageContent('');
        setSelectedStudentUserIds([]);
      } else {
        const errorData = await res.json();
        showStatus('error', errorData.message || 'Failed to send message.');
      }
    } catch (err: any) {
      showStatus('error', `Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedStudentUserIds, messageContent, course.id, educatorUserId, companyId, showStatus, loading]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${accentColor}]`}
            aria-label="Back to Class List"
            disabled={loading}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Send Message to <span style={{ color: primaryColor }}>{course.title}</span> Students
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Communicate with students enrolled in {course.academicLevelName} - {course.title}.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-3 rounded-md flex items-center gap-2 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5" />
            ) : (
              <ExclamationCircleIcon className="h-5 w-5" />
            )}
            {statusMessage.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-lg text-gray-700">Sending message...</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Selection */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-gray-600" /> Select Recipients ({selectedStudentUserIds.length})
          </h2>
          {enrolledStudents.length === 0 ? (
            <p className="text-gray-500 italic">No students enrolled in this course.</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedStudents.map(student => (
                  <span
                    key={student.userId}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                                bg-[${primaryColor}10] text-[${primaryColor}] cursor-pointer`}
                    onClick={() => handleRemoveStudent(student.userId)}
                  >
                    {student.name}
                    <XMarkIcon className="h-4 w-4 text-[${primaryColor}]" />
                  </span>
                ))}
              </div>
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                {enrolledStudents.map(student => (
                  <div
                    key={student.userId}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer
                                hover:bg-gray-100 transition-colors
                                ${selectedStudentUserIds.includes(student.userId) ? `bg-[${accentColor}20] border border-[${accentColor}]` : 'bg-white border border-gray-200'}`}
                    onClick={() => handleStudentSelect(student.userId)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.profilePicture || `https://placehold.co/40x40/${primaryColor.substring(1)}/ffffff?text=${student.name.charAt(0).toUpperCase()}`}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/40x40/${primaryColor.substring(1)}/ffffff?text=${student.name.charAt(0).toUpperCase()}`; }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    {selectedStudentUserIds.includes(student.userId) && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Message Composer */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PaperAirplaneIcon className="h-6 w-6 text-gray-600 rotate-90" /> Compose Message
          </h2>
          <form onSubmit={handleSendMessage} className="flex flex-col flex-grow">
            <textarea
              className="w-full flex-grow p-4 border border-gray-300 rounded-md shadow-sm focus:ring-[${accentColor}] focus:border-[${accentColor}] resize-y min-h-[150px]
                         text-gray-900 placeholder-gray-500"
              placeholder="Write your message here..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={loading}
              required
            ></textarea>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className={`inline-flex items-center gap-2 px-6 py-3 bg-[${primaryColor}] text-white rounded-md shadow-md
                            hover:bg-[${primaryColor}D0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${primaryColor}]
                            ${loading || selectedStudentUserIds.length === 0 || !messageContent.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading || selectedStudentUserIds.length === 0 || !messageContent.trim()}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-5 w-5 -rotate-45" /> Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
