// app/admin/[adminSlug]/appointments/page.tsx

import AdminAppointmentsClient from "./AdminAppointmentsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3000/api";

interface Props {
  params: { slug: string };
}


/**
 * Fetch appointments for a given company
 */
async function fetchAppointments(companyId: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/appointments?companyId=${companyId}`,
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

/**
 * Fetch patients for a given company
 */
async function fetchPatients(companyId: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/patients?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookies().toString() }, // forward auth cookies if required
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch patients: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("fetchPatients error:", err);
    return [];
  }
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
        headers: { "Content-Type": "application/json", Cookie: cookies().toString() },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch doctors: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error("fetchDoctors error:", err);
    return [];
  }
}


export default async function AdminAppointmentsPage({ params }: Props) {
  // Get the companyId from the URL params
  const companyId = params.slug;

  // Fetch initial data on the server
  const [appointments, patients, doctors] = await Promise.all([
    fetchAppointments(companyId),
    fetchPatients(companyId),
    fetchDoctors(companyId),
  ]);

  return (
    <AdminAppointmentsClient
      companyId={companyId}
      initialAppointments={appointments}
      initialPatients={patients}
      initialDoctors={doctors}
    />
  );
}
