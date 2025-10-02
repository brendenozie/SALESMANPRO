// app/admin/[slug]/exams/[examId]/questions/page.tsx
import React from "react";
import ExamQuestionsManagerPage, { ExamDetailsForQuestions, ExamQuestionData } from "./ExamQuestionsManagerPage";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
    examId: string;
  };
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleQuestionData = (examId: string): {
  sampleExamDetails: ExamDetailsForQuestions;
  sampleQuestions: ExamQuestionData[];
} => {
  const dummyTime = '1970-01-01T';

  const sampleExamDetails: ExamDetailsForQuestions = {
    id: examId,
    title: "Sample Online Exam",
    courseTitle: "Sample Course",
    isOnline: true,
    durationMinutes: 60,
    autoGrade: true,
    companyId: "sample-company-id",
  };

  const sampleQuestions: ExamQuestionData[] = [
    {
      id: 'Q001',
      examId: examId,
      examTitle: sampleExamDetails.title,
      examCourseTitle: sampleExamDetails.courseTitle,
      questionText: 'What is the capital of France?',
      imageUrl: null,
      videoUrl: null,
      questionType: 'MULTIPLE_CHOICE',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      correctAnswer: 'Paris',
      points: 10,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'Q002',
      examId: examId,
      examTitle: sampleExamDetails.title,
      examCourseTitle: sampleExamDetails.courseTitle,
      questionText: 'The Earth revolves around the Sun. (True/False)',
      imageUrl: null,
      videoUrl: null,
      questionType: 'TRUE_FALSE',
      options: ['True', 'False'],
      correctAnswer: 'True',
      points: 5,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'Q003',
      examId: examId,
      examTitle: sampleExamDetails.title,
      examCourseTitle: sampleExamDetails.courseTitle,
      questionText: 'Explain the concept of photosynthesis.',
      imageUrl: 'https://placehold.co/400x200/FF5733/FFFFFF?text=Photosynthesis+Diagram',
      videoUrl: null,
      questionType: 'ESSAY',
      options: [],
      correctAnswer: null,
      points: 25,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'Q004',
      examId: examId,
      examTitle: sampleExamDetails.title,
      examCourseTitle: sampleExamDetails.courseTitle,
      questionText: 'What is 5 + 7?',
      imageUrl: null,
      videoUrl: null,
      questionType: 'NUMERIC',
      options: [],
      correctAnswer: '12',
      points: 8,
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return { sampleExamDetails, sampleQuestions };
};


export default async function ExamQuestionsPage({ params }: PageProps) {
  const { slug: companyId, examId } = params;

  let initialExamDetails: ExamDetailsForQuestions | null = null;
  let initialQuestions: ExamQuestionData[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch exam details
    const examRes = await fetch(`${apiUrl}/admin/exams/${examId}`, {
      next: { revalidate: 60 },
    });
    if (examRes.ok) {
      const examData = await examRes.json();
      initialExamDetails = {
        id: examData.id,
        title: examData.title,
        courseTitle: examData.courseTitle,
        isOnline: examData.isOnline,
        durationMinutes: examData.durationMinutes,
        autoGrade: examData.autoGrade,
        companyId: examData.companyId,
      };
    } else {
      console.error(`[ExamQuestionsPage] Failed to fetch exam details for ${examId}: ${examRes.status} ${examRes.statusText}`);
      fetchError = true;
    }

    // Fetch exam questions
    const questionsRes = await fetch(`${apiUrl}/admin/exam-questions?examId=${encodeURIComponent(examId)}`, {
      next: { revalidate: 60 },
    });
    if (questionsRes.ok) {
      initialQuestions = (await questionsRes.json()) as ExamQuestionData[];
    } else {
      console.error(`[ExamQuestionsPage] Failed to fetch exam questions for ${examId}: ${questionsRes.status} ${questionsRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[ExamQuestionsPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError && !initialExamDetails || initialQuestions.length === 0) {
    console.log("[ExamQuestionsPage] Using sample data as fallback.");
    const { sampleExamDetails, sampleQuestions } = generateSampleQuestionData(examId);
    initialExamDetails = sampleExamDetails;
    initialQuestions = sampleQuestions;
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
    <ExamQuestionsManagerPage
      examDetails={initialExamDetails}
      initialQuestions={initialQuestions}
      companyId={companyId}
    />
  );
}
