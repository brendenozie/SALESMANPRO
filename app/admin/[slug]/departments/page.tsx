// app/admin/departments-manager/page.tsx

import React from "react";
import DepartmentsPage from "./DepartmentsPage"; // Ensure this path is correct
import { DepartmentData } from "./DepartmentsPage"; // Import the type
import {cookies} from 'next/headers';
import { EducatorType } from "../teachers/TeachersClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: fetches all departments
 * and passes them down to the client component.
 */
export default async function DepartmentsManagerPage({ params}: PageProps) {
  const { slug } = await params;
  const cookieStore = (await cookies()).toString();

  let departmentsData: DepartmentData[] = [];
  let initialEducators: EducatorType[] = [];

  try {
    const res = await fetch(`${apiBaseUrl}/admin/departments?companyId=${slug}`, { // Changed API endpoint
      next: { revalidate: 60 }, // SSR on every request
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieStore, // Pass cookies for authentication
      },
    });

    if (res.ok) {
      // Assuming API responds directly with DepartmentData[]
      departmentsData = (await res.json()).data.data as DepartmentData[];
    } else {
      // console.error(
      //   "[DepartmentsManagerPage] Failed to fetch departments →",
      //   res.status,
      //   res.statusText
      // );
      // Optionally, set an empty array or specific error state if fetch fails
      departmentsData = [];
    }
  } catch (err: any) {
    // console.error("[DepartmentsManagerPage] Error fetching departments →", err.message);
    departmentsData = []; // Ensure an empty array is passed on error
  }

  // Fetch all educators for this company
  const educatorsRes = await fetch(
    `${apiBaseUrl}/admin/educators?companyId=${encodeURIComponent(slug)}`, // Corrected API path
    {
        next: { revalidate: 60 }  // equivalent to SSR on every request
      , headers: { cookie: cookieStore }
    }
  );
  if (educatorsRes.ok) {
    const data = (await educatorsRes.json()).data.data;
    console.log("[TeachersManagementPage] Fetched educators:", data);
    initialEducators = data as EducatorType[];
  } else {
    console.error(
      `[TeachersManagementPage] Failed to fetch educators: ${educatorsRes.status} ${educatorsRes.statusText}`
    );
    // fetchError = true;
  }

  // Mock users for head of department selection (in a real app, fetch these from an API)
  // const possibleHeads = [
  //   { id: 'user_mock_1', name: 'Mr. John Doe', email: 'john.doe@example.com' },
  //   { id: 'user_mock_2', name: 'Mrs. Jane Smith', email: 'jane.smith@example.com' },
  //   { id: 'user_mock_3', name: 'Ms. Emily White', email: 'emily.white@example.com' },
  //   { id: 'user_mock_4', name: 'Mr. David Green', email: 'david.green@example.com' },
  //   { id: 'user_mock_5', name: 'Ms. Sarah Brown', email: 'sarah.brown@example.com' },
  //   { id: 'user_mock_6', name: 'Dr. Anne Ndugu', email: 'anne.ndugu@example.com' },
  // ];


  return <DepartmentsPage initialDepartments={departmentsData} possibleHeads={initialEducators} companyId={slug}/>;
}
