import React from "react";
import ExamGradesClient from "./ExamGradesClient"; // Ensure correct import path

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{
    slug: string; // companyId
    examId: string;
  }>;
}

export default async function ExamGradesPage({ params }: PageProps) {
  const { slug: companyId, examId } = await params;

  let initialData: any = null;
  let fetchError = false;

  try {
    // 1. Fetch Exam Details (to get courseId and classroomId)
    const examRes = await fetch(`${apiBaseUrl}/admin/course-assignments/${examId}`, {
      next: { revalidate: 60 },
    });
    
    if (!examRes.ok) throw new Error("Failed to fetch assignment details");
    const examData = (await examRes.json()).data;

    // 2. Fetch Eligible Students & Existing Grades
    // We pass classroomId and courseId to find who should be in this list
    const gradesRes = await fetch(
      `${apiBaseUrl}/admin/grades/eligible?examId=${examId}&classroomId=${examData.classroomId || ""}`,
      { next: { revalidate: 0 } } // Don't cache grades usually
    );

    if (gradesRes.ok) {
      initialData = await gradesRes.json();
    }
    
    return (
      <ExamGradesClient
        examId={examId}
        courseId={examData.courseId}
        classroomId={examData.classroomId}
        companyId={companyId}
        // initialStudents={initialData?.data || []}
        examTitle={examData.title}
      />
    );

  } catch (err: any) {
    console.error("[ExamGradesPage] Error →", err.message);
    return (
      <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
        <h2 className="text-xl font-bold">Grade Loading Error</h2>
        <p className="mt-2 text-sm">Could not initialize grading sheet. Please check if the assignment exists.</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 font-bold underline">Retry</button>
      </div>
    );
  }
}