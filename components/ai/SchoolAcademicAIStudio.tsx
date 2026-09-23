"use client";

import React, { useState } from "react";
import {
  SparklesIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowPathIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useGenerateText, useAICredits } from "@/hooks/useAI";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

interface Props {
  companyId: string;
  slug?: string;
  onSwitchToGeneralStudio?: () => void;
}

type AcademicTool =
  | "lesson_plan"
  | "exam_quiz"
  | "report_remarks"
  | "parent_circular";

export default function SchoolAcademicAIStudio({
  companyId,
  slug,
  onSwitchToGeneralStudio,
}: Props) {
  const [activeTool, setActiveTool] = useState<AcademicTool>("lesson_plan");
  const [copied, setCopied] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>("");

  const { data: creditsData } = useAICredits();
  const generateTextMutation = useGenerateText();

  // --- Form States ---
  // 1. Lesson Plan
  const [lessonSubject, setLessonSubject] = useState("Mathematics");
  const [lessonGrade, setLessonGrade] = useState("Grade 8");
  const [lessonTopic, setLessonTopic] = useState("Algebraic Expressions and Factorization");
  const [lessonDuration, setLessonDuration] = useState("45");
  const [lessonObjectives, setLessonObjectives] = useState(
    "Students should be able to identify common factors and factorize binomial expressions with confidence."
  );

  // 2. Exam & Quiz
  const [examSubject, setExamSubject] = useState("Integrated Science");
  const [examGrade, setExamGrade] = useState("Grade 7");
  const [examTopic, setExamTopic] = useState("Human Digestive System and Nutrients");
  const [examFormat, setExamFormat] = useState("MIXED"); // MCQ, SHORT_ANSWER, MIXED, ESSAY
  const [examQuestionCount, setExamQuestionCount] = useState("10");
  const [examDifficulty, setExamDifficulty] = useState("Standard");
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState(true);

  // 3. Report Card Remarks
  const [studentName, setStudentName] = useState("");
  const [studentGender, setStudentGender] = useState("neutral"); // he, she, neutral
  const [studentGrade, setStudentGrade] = useState("Grade 8");
  const [performanceLevel, setPerformanceLevel] = useState("Good (B)");
  const [conductNotes, setConductNotes] = useState(
    "Participates actively in classroom debates, polite and cooperative."
  );
  const [areasForGrowth, setAreasForGrowth] = useState(
    "Needs more consistency in submitting weekly math assignments."
  );

  // 4. Parent Circular
  const [circularType, setCircularType] = useState("TERM_DATES");
  const [schoolName, setSchoolName] = useState("St. Jude Academy");
  const [circularKeyPoints, setCircularKeyPoints] = useState(
    "Term 2 closes on Friday 1st August. Visiting day is this Saturday from 10 AM to 3 PM. Outstanding fee balances must be cleared before opening."
  );
  const [circularTone, setCircularTone] = useState("Formal & Courteous");

  const handleGenerate = async () => {
    let prompt = "";
    let systemPrompt = "";

    if (activeTool === "lesson_plan") {
      systemPrompt =
        "You are an expert pedagogical curriculum specialist and master educator. Generate a high-impact, structured lesson plan compliant with modern competency-based education standards. Output clearly with headings, timing breakdowns, and practical student activities.";
      prompt = `Create a comprehensive ${lessonDuration}-minute Lesson Plan for ${lessonGrade} on the subject "${lessonSubject}".
Topic: ${lessonTopic}
Learning Objectives: ${lessonObjectives}

Structure required:
1. Lesson Details (Subject, Grade, Duration, Topic)
2. Specific Learning Outcomes & Competencies
3. Teaching & Learning Resources Required
4. Lesson Phases:
   - Introduction / Hook (5 mins)
   - Teacher Direct Instruction & Modeling (10-15 mins)
   - Guided Practice & Group Work (15 mins)
   - Independent Practice / Plenary Assessment (10 mins)
   - Conclusion & Summary (5 mins)
5. Differentiated Learning (Support for struggling learners, Extension for gifted learners)
6. Homework / Assignment Task
7. Teacher Reflection Prompt`;
    } else if (activeTool === "exam_quiz") {
      systemPrompt =
        "You are an expert school examination officer and subject assessor. Generate rigorous, clear, curriculum-aligned exam and quiz questions with a complete marking scheme and answer key.";
      prompt = `Generate a ${examQuestionCount}-question assessment for ${examGrade} on the subject "${examSubject}".
Topic: ${examTopic}
Format: ${examFormat}
Difficulty: ${examDifficulty}
Include Marking Scheme: ${includeMarkingScheme ? "YES, provide complete answers, scoring criteria, and sample solutions." : "NO"}

Format the output cleanly so it can be printed directly as an official school test paper.`;
    } else if (activeTool === "report_remarks") {
      systemPrompt =
        "You are an experienced school principal and class teacher. Write professional, encouraging, individualized, and constructive report card remarks and term feedback for school transcripts.";
      prompt = `Write 3 tailored options of report card remarks for a student:
Student Name: ${studentName || "The student"}
Grade Level: ${studentGrade}
Academic Performance: ${performanceLevel}
Conduct / Behavior: ${conductNotes}
Areas for Improvement: ${areasForGrowth}

Provide:
Option 1: Balanced & Encouraging (ideal for general term reports)
Option 2: Focus on Excellence & Next-Level Potential
Option 3: Constructive & Action-Oriented (for areas needing effort)`;
    } else if (activeTool === "parent_circular") {
      systemPrompt =
        "You are a school communications director and principal. Write an official, elegant school circular and newsletter notice to parents.";
      prompt = `Draft an official Parent Circular Notice for "${schoolName}".
Notice Category: ${circularType}
Tone: ${circularTone}
Key Details to Include: ${circularKeyPoints}

Format:
- Official School Letterhead Header
- Date and Salutation ("Dear Esteemed Parents and Guardians,")
- Clear, engaging body paragraphs
- Bulleted key dates and requirements
- Action required / Finance / Contact information
- Official Sign-off ("Office of the Headteacher / Principal")`;
    }

    try {
      const res = await generateTextMutation.mutateAsync({
        prompt,
        systemPrompt,
        modelId: "gemini-2.0-flash",
        temperature: 0.7,
        feature: `school_${activeTool}`,
      });

      const result = res as any;
      const output = result?.data?.text || result?.text || "No output generated.";
      setGeneratedOutput(output);
      toast.success("Academic content generated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate content. Check AI credits.");
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                School Intelligence Studio
              </span>
              <span className="text-xs font-semibold text-slate-400">
                AI Powered Academic Assistance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-2 flex items-center gap-2.5">
              <AcademicCapIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              Academic AI Media Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curriculum lesson plans, quiz & exam generation, personalized student report remarks, and official parent circulars.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
              ⚡ Available Credits:{" "}
              <span className="text-purple-600 dark:text-purple-400 font-extrabold">
                {creditsData?.balance ?? "Active"}
              </span>
            </div>

            {onSwitchToGeneralStudio && (
              <button
                onClick={onSwitchToGeneralStudio}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
              >
                <PhotoIcon className="h-4 w-4" />
                Creative & Media Studio
              </button>
            )}
          </div>
        </div>

        {/* Tool Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTool("lesson_plan")}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeTool === "lesson_plan"
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-800"
            }`}
          >
            <BookOpenIcon className={`h-6 w-6 mb-2 ${activeTool === "lesson_plan" ? "text-white" : "text-purple-600 dark:text-purple-400"}`} />
            <div>
              <p className="text-xs font-bold">Lesson Planner</p>
              <p className={`text-[10px] ${activeTool === "lesson_plan" ? "text-purple-200" : "text-slate-400"}`}>
                Curriculum & Timing
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTool("exam_quiz")}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeTool === "exam_quiz"
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-800"
            }`}
          >
            <ClipboardDocumentCheckIcon className={`h-6 w-6 mb-2 ${activeTool === "exam_quiz" ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
            <div>
              <p className="text-xs font-bold">Exams & Quizzes</p>
              <p className={`text-[10px] ${activeTool === "exam_quiz" ? "text-purple-200" : "text-slate-400"}`}>
                With Marking Keys
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTool("report_remarks")}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeTool === "report_remarks"
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-800"
            }`}
          >
            <SparklesIcon className={`h-6 w-6 mb-2 ${activeTool === "report_remarks" ? "text-white" : "text-amber-500"}`} />
            <div>
              <p className="text-xs font-bold">Report Remarks</p>
              <p className={`text-[10px] ${activeTool === "report_remarks" ? "text-purple-200" : "text-slate-400"}`}>
                Tailored Student Feedback
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTool("parent_circular")}
            className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
              activeTool === "parent_circular"
                ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-800"
            }`}
          >
            <ChatBubbleLeftRightIcon className={`h-6 w-6 mb-2 ${activeTool === "parent_circular" ? "text-white" : "text-sky-500"}`} />
            <div>
              <p className="text-xs font-bold">Parent Circulars</p>
              <p className={`text-[10px] ${activeTool === "parent_circular" ? "text-purple-200" : "text-slate-400"}`}>
                School Letters & Notices
              </p>
            </div>
          </button>
        </div>

        {/* Studio Workspace: Form (Left) & Output (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              Configuration Parameters
            </h2>

            {/* 1. LESSON PLAN FORM */}
            {activeTool === "lesson_plan" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Subject</label>
                  <input
                    type="text"
                    value={lessonSubject}
                    onChange={(e) => setLessonSubject(e.target.value)}
                    placeholder="e.g. Mathematics, English, Biology"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Grade / Level</label>
                    <input
                      type="text"
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      placeholder="e.g. Grade 8, Form 2"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Duration (Mins)</label>
                    <input
                      type="number"
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Topic / Theme</label>
                  <input
                    type="text"
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="e.g. Photosynthesis and Chloroplasts"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Key Learning Objectives</label>
                  <textarea
                    rows={3}
                    value={lessonObjectives}
                    onChange={(e) => setLessonObjectives(e.target.value)}
                    placeholder="What should students know and be able to do by end of lesson?"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            )}

            {/* 2. EXAM & QUIZ FORM */}
            {activeTool === "exam_quiz" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Subject</label>
                  <input
                    type="text"
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Grade Level</label>
                    <input
                      type="text"
                      value={examGrade}
                      onChange={(e) => setExamGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block"># of Questions</label>
                    <input
                      type="number"
                      value={examQuestionCount}
                      onChange={(e) => setExamQuestionCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Assessment Topic</label>
                  <input
                    type="text"
                    value={examTopic}
                    onChange={(e) => setExamTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Question Format</label>
                    <select
                      value={examFormat}
                      onChange={(e) => setExamFormat(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold cursor-pointer"
                    >
                      <option value="MIXED">Mixed (MCQ + Short Answer)</option>
                      <option value="MCQ">Multiple Choice Questions</option>
                      <option value="SHORT_ANSWER">Short Structured Questions</option>
                      <option value="ESSAY">Essay & Problem Solving</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Difficulty</label>
                    <select
                      value={examDifficulty}
                      onChange={(e) => setExamDifficulty(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold cursor-pointer"
                    >
                      <option value="Foundation">Foundation / Easy</option>
                      <option value="Standard">Standard / Intermediate</option>
                      <option value="Challenging">Challenging / Advanced</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold text-slate-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={includeMarkingScheme}
                    onChange={(e) => setIncludeMarkingScheme(e.target.checked)}
                    className="h-4 w-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  Include Full Teacher's Marking Scheme & Answers
                </label>
              </div>
            )}

            {/* 3. REPORT CARD REMARKS */}
            {activeTool === "report_remarks" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Student Name (Optional)</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. David Mutua"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Grade Level</label>
                    <input
                      type="text"
                      value={studentGrade}
                      onChange={(e) => setStudentGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Performance Level</label>
                    <select
                      value={performanceLevel}
                      onChange={(e) => setPerformanceLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold cursor-pointer"
                    >
                      <option value="Outstanding (A)">Outstanding (Grade A)</option>
                      <option value="Good (B)">Good / Commendable (Grade B)</option>
                      <option value="Average (C)">Satisfactory / Average (Grade C)</option>
                      <option value="Needs Improvement">Needs Focused Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Conduct & Extracurriculars</label>
                  <textarea
                    rows={2}
                    value={conductNotes}
                    onChange={(e) => setConductNotes(e.target.value)}
                    placeholder="e.g. Respectful, team player in sports, creative"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Specific Areas for Growth</label>
                  <textarea
                    rows={2}
                    value={areasForGrowth}
                    onChange={(e) => setAreasForGrowth(e.target.value)}
                    placeholder="e.g. Needs to revise geometry theorems regularly"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {/* 4. PARENT CIRCULAR */}
            {activeTool === "parent_circular" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Notice Type</label>
                    <select
                      value={circularType}
                      onChange={(e) => setCircularType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold cursor-pointer"
                    >
                      <option value="TERM_DATES">Term Resumption & Closing Dates</option>
                      <option value="FEE_REMINDER">School Fees & Payment Instructions</option>
                      <option value="ACADEMIC_CLINIC">Parents Day / Academic Clinic</option>
                      <option value="SPORTS_EVENT">Sports Day & Co-Curriculars</option>
                      <option value="EMERGENCY_NOTICE">Urgent / Early Dismissal Notice</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Tone</label>
                    <select
                      value={circularTone}
                      onChange={(e) => setCircularTone(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold cursor-pointer"
                    >
                      <option value="Formal & Courteous">Formal & Courteous</option>
                      <option value="Warm & Celebratory">Warm & Celebratory</option>
                      <option value="Urgent & Action-Oriented">Urgent & Direct</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 dark:text-slate-300 mb-1 block">Key Bullet Points & Dates</label>
                  <textarea
                    rows={4}
                    value={circularKeyPoints}
                    onChange={(e) => setCircularKeyPoints(e.target.value)}
                    placeholder="Enter key dates, deadlines, fee details, or meeting timings..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generateTextMutation.isPending}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 mt-4"
            >
              {generateTextMutation.isPending ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Generating Academic Content...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4" />
                  Generate with AI
                </>
              )}
            </button>
          </div>

          {/* Generated Result Output Column */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Generated Document & Output
                  </h3>
                </div>

                {generatedOutput && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                          Copy Text
                        </>
                      )}
                    </button>

                    {slug && (
                      <Link
                        href={`/admin/${slug}/whatsapp-templates`}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30 transition flex items-center gap-1.5"
                      >
                        <PaperAirplaneIcon className="h-3.5 w-3.5" />
                        Send via WhatsApp
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {generatedOutput ? (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 overflow-y-auto max-h-[600px] text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans selection:bg-purple-500 selection:text-white">
                  {generatedOutput}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                  <div className="h-16 w-16 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <SparklesIcon className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Ready to Generate Academic Content
                  </h4>
                  <p className="text-xs max-w-sm">
                    Select a tool, customize your parameters, and click Generate with AI to produce structured lesson plans, exams, remarks, or notices.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
