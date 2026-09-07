import React from "react";
import AssignmentSubmissionsManager from "./AssignmentSubmissionsManagerPage";
import { cookies } from "next/headers";

import { getAuthSession } from '@/lib/auth';
import { findCompanyCached } from '@/lib/company-fetcher';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

interface PageProps {
  params: Promise<{
    slug: string;
    assignmentId: string;
  }>;
}

export default async function AssignmentSubmissionsPage({ params }: PageProps) {
  const { slug , assignmentId } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
    // const { slug } = await params;
  
    const session = await getAuthSession();
  
    // 1. Safely resolve the exact same identifier used in AdminStoreLayout
    const identifier = slug || session?.user?.id || '';
  
    // 2. Retrieve the memoized company data (no extra DB cost)
    const company = await findCompanyCached(identifier, "page");
  
    if (!company) {
      return <div>Company not found</div>;
    }
  
    // Use the actual database ID for your API calls, ensuring consistency
    const companyId = company.id;

  // --- Fallback Data Definitions ---
  const sampleAssignment = {
    id: assignmentId,
    title: "Quarterly Marketing Report (Sample)",
    dueDate: new Date().toISOString(),
    totalPoints: 100,
    courseTitle: "Marketing 101"
  };

  const sampleSubmissions = [
    {
      id: "sample-1",
      studentName: "Marcus Aurelius",
      studentEmail: "marcus@stoic.com",
      submittedAt: new Date().toISOString(),
      status: "Submitted",
      fileUrl: "#",
      score: null,
      feedback: "",
    }
  ];

  let assignmentData = null;
  let submissionsData = [];
  let useFallback = false;

  try {
    // Parallel fetching for better performance
    const [assignmentRes, submissionsRes] = await Promise.all([
      fetch(`${apiBaseUrl}/admin/assignments/${assignmentId}`, {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeader },
      }),
      fetch(`${apiBaseUrl}/admin/assignment-submissions?assignmentId=${assignmentId}`, {
        cache: 'no-store', // Submissions change frequently
        headers: { cookie: cookieHeader },
      })
    ]);

    if (assignmentRes.ok && submissionsRes.ok) {
      const assignmentJson = await assignmentRes.json();
      const submissionsJson = await submissionsRes.json();
      
      assignmentData = assignmentJson.data;
      submissionsData = submissionsJson.data || [];
    } else {
      console.error("API Error: One or more requests failed");
      useFallback = true;
    }
  } catch (err) {
    console.error("Network Error fetching submissions:", err);
    useFallback = true;
  }

  // Determine final data to pass
  const finalAssignment = useFallback || !assignmentData ? sampleAssignment : assignmentData;
  const finalSubmissions = useFallback ? sampleSubmissions : submissionsData;

  return (
    <AssignmentSubmissionsManager 
      assignment={finalAssignment}
      initialSubmissions={finalSubmissions}
      companyId={companyId}
    />
  );
}