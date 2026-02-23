// app/admin/[adminSlug]/appointments/page.tsx

import AdminAppointmentsClient from "./AdminAppointmentsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface Props {
  params:Promise<{ slug: string }>
}


/**
 * Fetch appointments for a given company
 */
async function fetchAppointments(companyId: string, cookieHeader: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/appointments?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        next: { revalidate: 60 }, // always fresh
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch appointments: ${res.statusText}`);
    }

    const json = (await res.json()).data;
    console.log("Fetched appointments:", json);
    return json.data || [];
  } catch (err) {
    console.error("fetchAppointments error:", err);
    return [];
  }
}

/**
 * Fetch patients for a given company
 */
async function fetchPatients(companyId: string, cookieHeader: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/patients?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader }, // forward auth cookies if required
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch patients: ${res.statusText}`);
    }

    const json = await res.json();
    console.log("Fetched patients:", json);
    return json.data || [];
  } catch (err) {
    console.error("fetchPatients error:", err);
    return [];
  }
}

/**
 * Fetch doctors for a given company
 */
async function fetchDoctors(companyId: string, cookieHeader: string) {
  try {
    const res = await fetch(
      `${apiBaseUrl}/admin/doctors?companyId=${companyId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        next: { revalidate: 60 },
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


export default async function AdminAppointmentsPage({ params }: Props) {
  // Get the companyId from the URL params
  const { slug : companyId } = await params;
  const cookieHeader = (await cookies()).toString();

  // Fetch initial data on the server
  const [appointments, patients, doctors] = await Promise.all([
    fetchAppointments(companyId, cookieHeader),
    fetchPatients(companyId, cookieHeader),
    fetchDoctors(companyId, cookieHeader),
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
