"use client";

import React, { useState } from "react";
import {
  SparklesIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from "@heroicons/react/24/outline";

interface TeacherAIPanelProps {
  companyId?: string;
  currentUserId?: string;
}

type TabType = "lesson" | "assignment" | "assessment" | "grading" | "comment";

export default function TeacherAIPanel({ companyId, currentUserId }: TeacherAIPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("lesson");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Form states
  // 1. Lesson Planner
  const [lessonForm, setLessonForm] = useState({
    subject: "Mathematics",
    topic: "Introduction to Quadratic Equations",
    gradeLevel: "Grade 10",
    duration: "45",
    curriculum: "Standard",
    objectives: "Factorize basic quadratic expressions and find roots",
  });

  // 2. Assignment Generator
  const [assignmentForm, setAssignmentForm] = useState({
    courseName: "General Science",
    topic: "Photosynthesis and Cellular Respiration",
    gradeLevel: "Grade 9",
    type: "HOMEWORK",
    difficulty: "INTERMEDIATE",
    totalPoints: "20",
  });

  // 3. Assessment / Quiz Generator
  const [assessmentForm, setAssessmentForm] = useState({
    subject: "History",
    topic: "The Industrial Revolution",
    gradeLevel: "Grade 8",
    questionCount: "5",
    type: "MULTIPLE_CHOICE",
  });

  // 4. Grading Assistant
  const [gradingForm, setGradingForm] = useState({
    assignmentTitle: "Essay on Renewable Energy",
    submissionContent: "Solar power converts sunlight into electricity using photovoltaic cells. Wind turbines capture kinetic energy. Both decrease fossil fuel reliance.",
    rubric: "Explain at least 2 renewable sources and their mechanism (10 pts). Depth of analysis (10 pts).",
    maxScore: "20",
  });

  // 5. Report Comment
  const [commentForm, setCommentForm] = useState({
    studentName: "Alex Mercer",
    subject: "English Literature",
    gradeScore: "86",
    attendanceRate: "95",
    behavior: "Active participant, attentive, punctual with deadlines.",
    tone: "ENCOURAGING",
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!companyId) {
      setError("Company ID is required to generate AI content.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    let endpoint = "";
    let bodyPayload: any = { companyId };

    if (activeTab === "lesson") {
      endpoint = "/api/admin/school-ai/lesson-plan";
      bodyPayload = {
        ...bodyPayload,
        ...lessonForm,
        duration: Number(lessonForm.duration),
      };
    } else if (activeTab === "assignment") {
      endpoint = "/api/admin/school-ai/generate-assignment";
      bodyPayload = {
        ...bodyPayload,
        ...assignmentForm,
        totalPoints: Number(assignmentForm.totalPoints),
      };
    } else if (activeTab === "assessment") {
      endpoint = "/api/admin/school-ai/generate-assessment";
      bodyPayload = {
        ...bodyPayload,
        ...assessmentForm,
        questionCount: Number(assessmentForm.questionCount),
      };
    } else if (activeTab === "grading") {
      endpoint = "/api/admin/school-ai/grade-assist";
      bodyPayload = {
        ...bodyPayload,
        ...gradingForm,
        maxScore: Number(gradingForm.maxScore),
      };
    } else if (activeTab === "comment") {
      endpoint = "/api/admin/school-ai/report-comment";
      bodyPayload = {
        ...bodyPayload,
        ...commentForm,
        gradeScore: Number(commentForm.gradeScore),
        attendanceRate: Number(commentForm.attendanceRate),
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setResult(json.data);
      } else {
        setError(json.message || "Failed to generate content. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Network error generating AI content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 font-sans">
      {/* Panel Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-2xl shadow-md shadow-indigo-100">
            <SparklesIcon className="h-6 w-6 stroke-[2px]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              AI Teaching Copilot
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-full tracking-wider border border-indigo-100">
                Teacher Only
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Curriculum aligned lesson planning, assignment design & instant grading assistance.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 overflow-x-auto max-w-full">
          {[
            { id: "lesson", label: "Lesson Planner", icon: BookOpenIcon },
            { id: "assignment", label: "Assignments", icon: ClipboardDocumentCheckIcon },
            { id: "assessment", label: "Quiz / Exam", icon: QuestionMarkCircleIcon },
            { id: "grading", label: "Grade Assist", icon: PencilSquareIcon },
            { id: "comment", label: "Report Comments", icon: ChatBubbleBottomCenterTextIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setResult(null);
                  setError(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Form Inputs (Left Column) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Configuration Parameters
            </h3>

            {/* TAB 1: LESSON PLANNER */}
            {activeTab === "lesson" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={lessonForm.subject}
                    onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={lessonForm.topic}
                    onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Grade Level</label>
                    <input
                      type="text"
                      value={lessonForm.gradeLevel}
                      onChange={(e) => setLessonForm({ ...lessonForm, gradeLevel: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      value={lessonForm.duration}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Learning Objectives</label>
                  <textarea
                    rows={2}
                    value={lessonForm.objectives}
                    onChange={(e) => setLessonForm({ ...lessonForm, objectives: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </>
            )}

            {/* TAB 2: ASSIGNMENT GENERATOR */}
            {activeTab === "assignment" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course / Subject</label>
                  <input
                    type="text"
                    value={assignmentForm.courseName}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, courseName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Topic</label>
                  <input
                    type="text"
                    value={assignmentForm.topic}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Type</label>
                    <select
                      value={assignmentForm.type}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="HOMEWORK">Homework</option>
                      <option value="PROJECT">Project</option>
                      <option value="ESSAY">Essay</option>
                      <option value="LAB_REPORT">Lab Report</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Points</label>
                    <input
                      type="number"
                      value={assignmentForm.totalPoints}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, totalPoints: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: ASSESSMENT GENERATOR */}
            {activeTab === "assessment" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={assessmentForm.subject}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, subject: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={assessmentForm.topic}
                    onChange={(e) => setAssessmentForm({ ...assessmentForm, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question Count</label>
                    <input
                      type="number"
                      value={assessmentForm.questionCount}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, questionCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Question Type</label>
                    <select
                      value={assessmentForm.type}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, type: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                      <option value="TRUE_FALSE">True / False</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* TAB 4: GRADING ASSIST */}
            {activeTab === "grading" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={gradingForm.assignmentTitle}
                    onChange={(e) => setGradingForm({ ...gradingForm, assignmentTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Answer</label>
                  <textarea
                    rows={3}
                    value={gradingForm.submissionContent}
                    onChange={(e) => setGradingForm({ ...gradingForm, submissionContent: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grading Rubric / Criteria</label>
                  <textarea
                    rows={2}
                    value={gradingForm.rubric}
                    onChange={(e) => setGradingForm({ ...gradingForm, rubric: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </>
            )}

            {/* TAB 5: REPORT COMMENT */}
            {activeTab === "comment" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={commentForm.studentName}
                    onChange={(e) => setCommentForm({ ...commentForm, studentName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                    <input
                      type="text"
                      value={commentForm.subject}
                      onChange={(e) => setCommentForm({ ...commentForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Score (%)</label>
                    <input
                      type="number"
                      value={commentForm.gradeScore}
                      onChange={(e) => setCommentForm({ ...commentForm, gradeScore: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Observations</label>
                  <textarea
                    rows={2}
                    value={commentForm.behavior}
                    onChange={(e) => setCommentForm({ ...commentForm, behavior: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Draft...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  <span>Generate Pedagogical Draft</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output & Review Workspace (Right Column) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 flex-1 flex flex-col border border-slate-800 relative">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  Review & Approval Container (Draft)
                </span>
              </div>
              {result && (
                <button
                  onClick={() => handleCopy(typeof result === "string" ? result : JSON.stringify(result, null, 2))}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all"
                >
                  {copied ? <CheckIcon className="h-4 w-4 text-emerald-400" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="flex-1 py-4 overflow-y-auto max-h-[500px]">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500 space-y-2">
                  <SparklesIcon className="h-10 w-10 text-slate-700 stroke-[1.5px]" />
                  <p className="text-xs font-bold text-slate-400">Ready to draft educational content</p>
                  <p className="text-[11px] text-slate-600 max-w-sm">
                    Configure your parameters on the left and click Generate. Content is presented as a draft for your review before saving.
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <ArrowPathIcon className="h-8 w-8 text-indigo-400 animate-spin" />
                  <p className="text-xs font-bold text-slate-300">Generating structured curriculum content...</p>
                  <p className="text-[11px] text-slate-500">Aligning with pedagogical objectives and rubrics</p>
                </div>
              )}

              {result && (
                <div className="text-xs font-sans leading-relaxed space-y-4 text-slate-300">
                  {/* Lesson Plan Output */}
                  {result.lessonPlan && (
                    <div className="space-y-4">
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                        <h4 className="text-sm font-bold text-white mb-1">
                          {result.lessonPlan.title || lessonForm.topic}
                        </h4>
                        <p className="text-[11px] text-indigo-300">
                          {result.lessonPlan.duration || lessonForm.duration} Mins • {lessonForm.subject} ({lessonForm.gradeLevel})
                        </p>
                      </div>

                      {result.lessonPlan.warmUp && (
                        <div>
                          <span className="font-bold text-amber-400 block text-[11px] uppercase tracking-wider mb-1">Warm-Up Activity</span>
                          <p className="bg-slate-800/40 p-3 rounded-lg">{result.lessonPlan.warmUp}</p>
                        </div>
                      )}

                      {result.lessonPlan.directInstruction && (
                        <div>
                          <span className="font-bold text-indigo-400 block text-[11px] uppercase tracking-wider mb-1">Direct Instruction</span>
                          <p className="bg-slate-800/40 p-3 rounded-lg">{result.lessonPlan.directInstruction}</p>
                        </div>
                      )}

                      {result.lessonPlan.guidedPractice && (
                        <div>
                          <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider mb-1">Guided Practice</span>
                          <p className="bg-slate-800/40 p-3 rounded-lg">{result.lessonPlan.guidedPractice}</p>
                        </div>
                      )}

                      {result.lessonPlan.independentPractice && (
                        <div>
                          <span className="font-bold text-purple-400 block text-[11px] uppercase tracking-wider mb-1">Independent Practice</span>
                          <p className="bg-slate-800/40 p-3 rounded-lg">{result.lessonPlan.independentPractice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assessment Output */}
                  {result.questions && Array.isArray(result.questions) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-white">Generated Assessment Questions ({result.questions.length})</h4>
                      {result.questions.map((q: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-2">
                          <p className="font-bold text-white">Q{i + 1}. {q.prompt || q.question}</p>
                          {q.options && (
                            <ul className="pl-4 space-y-1 text-[11px] text-slate-300 list-disc">
                              {q.options.map((opt: string, optIdx: number) => (
                                <li key={optIdx}>{opt}</li>
                              ))}
                            </ul>
                          )}
                          <div className="text-[11px] text-emerald-400 font-mono">
                            <span>Correct Answer: {q.correctAnswer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Grading Assist Output */}
                  {result.feedback && (
                    <div className="space-y-3">
                      <div className="p-4 bg-indigo-950/40 border border-indigo-900/60 rounded-xl">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 block">Suggested Score</span>
                        <h4 className="text-2xl font-black text-white mt-1">
                          {result.suggestedScore ?? result.score ?? "--"} / {gradingForm.maxScore}
                        </h4>
                      </div>
                      <div>
                        <span className="font-bold text-slate-400 block text-[11px] uppercase mb-1">Constructive Feedback</span>
                        <p className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">{result.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Report Comment Output */}
                  {result.comment && (
                    <div className="space-y-3">
                      <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                        <span className="text-[10px] uppercase font-bold text-purple-400 block mb-1">Draft Narrative Comment</span>
                        <p className="text-sm text-white italic leading-relaxed">"{result.comment}"</p>
                      </div>
                    </div>
                  )}

                  {/* Generic String or JSON fallback */}
                  {!result.lessonPlan && !result.questions && !result.feedback && !result.comment && (
                    <pre className="p-4 bg-slate-800/50 rounded-xl overflow-x-auto text-[11px] font-mono text-slate-300">
                      {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Teacher Approval Invariant Notice */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>* AI INVARIANT: All drafts require teacher review before persistence.</span>
              <span>Educator Copilot v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
