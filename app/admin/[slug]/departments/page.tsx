// app/admin/departments-manager/page.tsx

import React from "react";
import DepartmentsPage from "./DepartmentsPage"; // Ensure this path is correct
import { DepartmentData } from "./DepartmentsPage"; // Import the type

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
  };
}

/**
 * Server Component: fetches all departments
 * and passes them down to the client component.
 */
export default async function DepartmentsManagerPage({ params: { slug } }: PageProps) {
  let departmentsData: DepartmentData[] = [];

  try {
    const res = await fetch(`${apiUrl}/admin/departments?companyId=${slug}`, { // Changed API endpoint
      cache: "no-store", // SSR on every request
    });

    if (res.ok) {
      // Assuming API responds directly with DepartmentData[]
      departmentsData = (await res.json()) as DepartmentData[];
    } else {
      console.error(
        "[DepartmentsManagerPage] Failed to fetch departments →",
        res.status,
        res.statusText
      );
      // Optionally, set an empty array or specific error state if fetch fails
      departmentsData = [];
    }
  } catch (err: any) {
    console.error("[DepartmentsManagerPage] Error fetching departments →", err.message);
    departmentsData = []; // Ensure an empty array is passed on error
  }

  // Mock users for head of department selection (in a real app, fetch these from an API)
  const possibleHeads = [
    { id: 'user_mock_1', name: 'Mr. John Doe', email: 'john.doe@example.com' },
    { id: 'user_mock_2', name: 'Mrs. Jane Smith', email: 'jane.smith@example.com' },
    { id: 'user_mock_3', name: 'Ms. Emily White', email: 'emily.white@example.com' },
    { id: 'user_mock_4', name: 'Mr. David Green', email: 'david.green@example.com' },
    { id: 'user_mock_5', name: 'Ms. Sarah Brown', email: 'sarah.brown@example.com' },
    { id: 'user_mock_6', name: 'Dr. Anne Ndugu', email: 'anne.ndugu@example.com' },
  ];


  return <DepartmentsPage initialDepartments={departmentsData} possibleHeads={possibleHeads} companyId={slug}/>;
}
