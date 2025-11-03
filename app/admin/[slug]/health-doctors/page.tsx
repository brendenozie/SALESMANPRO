import { motion } from "framer-motion";
import { cookies } from "next/headers";
import DoctorsClient from "./DoctorsClient";

const apiBaseUrl =
  "/api";//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface Props {
  params:Promise<{ slug: string }>
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

/**
 * Fetch doctors for a given company
 */
async function fetchDoctors(companyId: string) {
  const cookiesHeaders = (await cookies()).toString();
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/doctors?companyId=${companyId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          cookie: cookiesHeaders,
        },
        next: { revalidate: 60 }, // ISR cache
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch doctors: ${res.statusText}`);
    }

    const json = await res.json();
    console.log("Fetched doctors:", json);
    return json.data.data || [];
  } catch (err) {
    console.error("fetchDoctors error:", err);
    return [];
  }
}

export default async function AdminDoctorsPage({ params }: Props) {
  const { slug : companyId } = await params;
  const doctors = await fetchDoctors(companyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 drop-shadow-lg"
        >
          Doctor Management
        </h1>
        <p
          className="text-xl text-gray-700 dark:text-gray-300 mb-12">
          Manage information and availability of your medical team.
        </p>

        {/* ✅ SSR doctors passed to client */}
        <DoctorsClient initialDoctors={doctors} companyId={companyId} />
      </div>
    </div>
  );
}
