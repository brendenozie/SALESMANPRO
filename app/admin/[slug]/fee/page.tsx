// app/admin/fees/page.tsx
import React from "react";
import FeesClient, { StudentFeeRecord } from "./FeesClient"; // Import client component and its types
import { Student, FeeItem } from "@/lib/data"; // Import types from lib/data.ts
import { cookies } from "next/headers";

// Assuming your API URL is correctly set in environment variables
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches initial data for the Student Fee Dashboard.
 */
export default async function FeesPage({ params }: PageProps) {
  // In a real application, schoolId would likely come from user context/session
  // or be derived from a dynamic route segment if you manage multiple schools.
  // const schoolId = "your_school_id"; // Placeholder: Replace with actual logic to get school ID
  const { slug : schoolId } = await params;
  const cookHeader = (await cookies()).toString();

  let initialFeeRecordsData: StudentFeeRecord[] = [];
  let initialStudentsData: Student[] = [];
  let initialFeeItemsData: FeeItem[] = [];

  try {
    // Fetch Student Fee Records
    const feesRes = await fetch(`${apiBaseUrl}/admin/student-fee-records?schoolId=${schoolId}`, {
      next: { revalidate: 60 }, // Ensure fresh data on each request
      headers: {
        cookie: cookHeader, // Forward cookies for authentication if needed
      },
    });
    if (feesRes.ok) {
      initialFeeRecordsData = (await feesRes.json()).data;
      console.log("[FeesPage] Fetched fee records:", initialFeeRecordsData);
    } else {
      console.error(
        "[FeesPage] Failed to fetch fee records →",
        feesRes.status,
        feesRes.statusText
      );
    }

    // Fetch Students (needed for the "Create New Fee Record" modal)
    const studentsRes = await fetch(`${apiBaseUrl}/admin/students?companyId=${encodeURIComponent(schoolId)}`, {
      next: { revalidate: 60 },
      headers: {
        cookie: cookHeader,
      },
    });
    if (studentsRes.ok) {
      initialStudentsData = (await studentsRes.json()).data;
      console.log("[FeesPage] Fetched students:", initialStudentsData);
    } else {
      console.error(
        "[FeesPage] Failed to fetch students →",
        studentsRes.status,
        studentsRes.statusText
      );
    }

    // Fetch Fee Items (useful for reference, perhaps for a future "Fee Item Management" page)
    const feeItemsRes = await fetch(`${apiBaseUrl}/admin/fee-items`, {
      next: { revalidate: 60 },
      headers: {
        cookie: cookHeader,
      },
    });
    if (feeItemsRes.ok) {
      initialFeeItemsData = (await feeItemsRes.json()).data;
      console.log("[FeesPage] Fetched fee items:", initialFeeItemsData);
    } else {
      console.error(
        "[FeesPage] Failed to fetch fee items →",
        feeItemsRes.status,
        feeItemsRes.statusText
      );
    }

  } catch (err: any) {
    console.error("[FeesPage] Error fetching initial data →", err.message);
    // In a production app, you might render an error state or a message to the user
  }

  // Pass all fetched data to the client component
  return (
    <FeesClient
      initialFeeRecordsData={initialFeeRecordsData}
      initialStudentsData={initialStudentsData}
      initialFeeItemsData={initialFeeItemsData}
      schoolId={schoolId}
    />
  );
}
