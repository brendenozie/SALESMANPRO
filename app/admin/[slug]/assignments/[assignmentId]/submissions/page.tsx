import React from "react";
import AssignmentSubmissionsManager from "./AssignmentSubmissionsManagerPage";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: Promise<{
    slug: string;
    assignmentId: string;
  }>;
}

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  const { slug: companyId, assignmentId } = await params;
  const cookieHeader = (await cookies()).toString();

  // Logic to fetch assignment metadata and current submissions
  // Fallback to sample data if API is not yet connected
  const sampleAssignment = {
    id: assignmentId,
    title: "Quarterly Marketing Report",
    dueDate: "2025-12-01T23:59:00Z",
    totalPoints: 50,
  };

  const sampleSubmissions = [
    {
      id: "SUB-101",
      studentName: "Marcus Aurelius",
      studentEmail: "marcus@philosophy.edu",
      submittedAt: "2025-11-30T10:00:00Z",
      status: "Submitted",
      fileUrl: "https://example.com/files/report1.pdf",
      score: null,
      feedback: "",
    },
    {
      id: "SUB-102",
      studentName: "Seneca the Younger",
      studentEmail: "seneca@stoic.com",
      submittedAt: "2025-12-02T09:00:00Z", // Late
      status: "Late",
      fileUrl: "https://example.com/files/report2.pdf",
      score: 45,
      feedback: "Excellent analysis, but points deducted for tardiness.",
    }
  ];

  return (
    <AssignmentSubmissionsManager 
      assignment={sampleAssignment}
      initialSubmissions={sampleSubmissions}
      companyId={companyId}
    />
  );
}