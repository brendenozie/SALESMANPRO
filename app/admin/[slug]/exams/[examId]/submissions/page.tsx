// app/admin/[slug]/exams/[examId]/submissions/page.tsx
import React from "react";
import ExamSubmissionsManagerPage, { ExamDetailsForSubmissions, ExamSubmissionData } from "./ExamSubmissionsManagerPage";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{
    slug: string; // companyId
    examId: string;
  }>;
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleSubmissionData = (examId: string, companyId: string): {
  sampleExamDetails: ExamDetailsForSubmissions;
  sampleSubmissions: ExamSubmissionData[];
} => {
  const sampleExamDetails: ExamDetailsForSubmissions = {
    id: examId,
    title: "Sample Physics Final Exam",
    courseTitle: "Physics",
    isOnline: true,
    autoGrade: true,
    totalPoints: 100,
    companyId: companyId,
  };

  const sampleSubmissions: ExamSubmissionData[] = [
    {
      id: 'SUB001',
      examId: examId,
      examTitle: sampleExamDetails.title,
      studentId: 'STU001',
      studentName: 'Alice Johnson',
      studentEmail: 'alice.j@example.com',
      submittedAt: new Date('2025-07-18T11:45:00Z').toISOString(),
      score: 85.5,
      feedback: 'Good understanding of kinematics, but review optics.',
      answers: {
        Q001: "Paris",
        Q002: "True",
        Q003: "Photosynthesis is the process by which green plants...",
      }, // Sample JSON answers
      createdAt: new Date('2025-07-18T11:45:00Z').toISOString(),
      updatedAt: new Date('2025-07-19T09:00:00Z').toISOString(),
    },
    {
      id: 'SUB002',
      examId: examId,
      examTitle: sampleExamDetails.title,
      studentId: 'STU002',
      studentName: 'Bob Williams',
      studentEmail: 'bob.w@example.com',
      submittedAt: new Date('2025-07-18T11:30:00Z').toISOString(),
      score: 72.0,
      feedback: 'Needs to improve on problem-solving techniques. Check calculations.',
      answers: {
        Q001: "Berlin",
        Q002: "True",
        Q003: "Plants make food using sunlight.",
      },
      createdAt: new Date('2025-07-18T11:30:00Z').toISOString(),
      updatedAt: new Date('2025-07-20T10:15:00Z').toISOString(),
    },
    {
      id: 'SUB003',
      examId: examId,
      examTitle: sampleExamDetails.title,
      studentId: 'STU003',
      studentName: 'Charlie Brown',
      studentEmail: 'charlie.b@example.com',
      submittedAt: new Date('2025-07-18T11:00:00Z').toISOString(),
      score: null, // Not yet graded
      feedback: null,
      answers: {
        Q001: "Paris",
        Q002: "False",
        Q003: "Photosynthesis is complex.",
      },
      createdAt: new Date('2025-07-18T11:00:00Z').toISOString(),
      updatedAt: new Date('2025-07-18T11:00:00Z').toISOString(),
    },
    {
      id: 'SUB004',
      examId: examId,
      examTitle: sampleExamDetails.title,
      studentId: 'STU004',
      studentName: 'Diana Prince',
      studentEmail: 'diana.p@example.com',
      submittedAt: new Date('2025-07-18T11:55:00Z').toISOString(),
      score: 91.0,
      feedback: 'Excellent work! Very thorough and accurate.',
      answers: {
        Q001: "Paris",
        Q002: "True",
        Q003: "Detailed explanation of photosynthesis process...",
      },
      createdAt: new Date('2025-07-18T11:55:00Z').toISOString(),
      updatedAt: new Date('2025-07-19T14:30:00Z').toISOString(),
    },
  ];

  return { sampleExamDetails, sampleSubmissions };
};


export default async function ExamSubmissionsPage({ params }: PageProps) {
  const { slug: companyId, examId } = await params;

  let initialExamDetails: ExamDetailsForSubmissions | null = null;
  let initialSubmissions: ExamSubmissionData[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch exam details
    const examRes = await fetch(`${apiBaseUrl}/exams/${examId}`, {
      next: { revalidate: 60 },
    });
    if (examRes.ok) {
      const examData = await examRes.json();
      initialExamDetails = {
        id: examData.id,
        title: examData.title,
        courseTitle: examData.courseTitle,
        isOnline: examData.isOnline,
        autoGrade: examData.autoGrade,
        totalPoints: examData.totalPoints,
        companyId: examData.companyId,
      };
    } else {
      console.error(`[ExamSubmissionsPage] Failed to fetch exam details for ${examId}: ${examRes.status} ${examRes.statusText}`);
      fetchError = true;
    }

    // Fetch exam submissions
    const submissionsRes = await fetch(`${apiBaseUrl}/exam-submissions?examId=${encodeURIComponent(examId)}`, {
      next: { revalidate: 60 },
    });
    if (submissionsRes.ok) {
      initialSubmissions = (await submissionsRes.json()) as ExamSubmissionData[];
    } else {
      console.error(`[ExamSubmissionsPage] Failed to fetch exam submissions for ${examId}: ${submissionsRes.status} ${submissionsRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[ExamSubmissionsPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError || !initialExamDetails || initialSubmissions.length === 0) {
    console.log("[ExamSubmissionsPage] Using sample data as fallback.");
    const { sampleExamDetails, sampleSubmissions } = generateSampleSubmissionData(examId, companyId);
    initialExamDetails = sampleExamDetails;
    initialSubmissions = sampleSubmissions;
  }

  if (!initialExamDetails) {
    // This case should ideally be caught by fetchError and fallback, but as a safeguard
    return (
      <div className="p-8 text-center text-red-600">
        Error: Could not load exam details. Please ensure the exam ID is valid.
      </div>
    );
  }

  return (
    <ExamSubmissionsManagerPage
      examDetails={initialExamDetails}
      initialSubmissions={initialSubmissions}
      companyId={companyId}
    />
  );
}
