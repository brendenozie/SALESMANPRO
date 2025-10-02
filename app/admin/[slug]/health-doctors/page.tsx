

import DoctorsClient from "./DoctorsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000/api";

interface Props {
  params: { slug: string };
}


/**
 * Fetch doctors for a given company
 */
async function fetchDoctors(companyId: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/doctors?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 }, // always fresh
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch appointments: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("fetchAppointments error:", err);
    return [];
  }
}

export default async function AdminDoctorsPage({ params }: { params: { slug: string } }) {
  const companyId = params.slug;
  const doctors = await fetchDoctors(companyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg">
          Doctor Management
        </h1>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-12">
          Manage information and availability of your medical team.
        </p>

        {/* Pass initial server-fetched data into Client Component */}
        <DoctorsClient initialDoctors={doctors} companyId={companyId} />
      </div>
    </div>
  );
}
