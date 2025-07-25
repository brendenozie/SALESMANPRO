// app/admin/fees/page.tsx
import React from "react";
import FeesClient, { StudentFeeRecord } from "./FeesClient"; // Import client component and its types
import { Student, FeeItem } from "@/lib/data"; // Import types from lib/data.ts

// Assuming your API URL is correctly set in environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

/**
 * Server Component: fetches initial data for the Student Fee Dashboard.
 */
export default async function FeesPage() {
  // In a real application, schoolId would likely come from user context/session
  // or be derived from a dynamic route segment if you manage multiple schools.
  const schoolId = "your_school_id"; // Placeholder: Replace with actual logic to get school ID

  let initialFeeRecordsData: StudentFeeRecord[] = [];
  let initialStudentsData: Student[] = [];
  let initialFeeItemsData: FeeItem[] = [];

  try {
    // Fetch Student Fee Records
    const feesRes = await fetch(`${apiUrl}/admin/student-fee-records`, {
      cache: "no-store", // Ensure fresh data on each request
    });
    if (feesRes.ok) {
      initialFeeRecordsData = await feesRes.json();
    } else {
      console.error(
        "[FeesPage] Failed to fetch fee records →",
        feesRes.status,
        feesRes.statusText
      );
    }

    // Fetch Students (needed for the "Create New Fee Record" modal)
    const studentsRes = await fetch(`${apiUrl}/admin/students`, {
      cache: "no-store",
    });
    if (studentsRes.ok) {
      initialStudentsData = await studentsRes.json();
    } else {
      console.error(
        "[FeesPage] Failed to fetch students →",
        studentsRes.status,
        studentsRes.statusText
      );
    }

    // Fetch Fee Items (useful for reference, perhaps for a future "Fee Item Management" page)
    const feeItemsRes = await fetch(`${apiUrl}/admin/fee-items`, {
      cache: "no-store",
    });
    if (feeItemsRes.ok) {
      initialFeeItemsData = await feeItemsRes.json();
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
