// app/driver/incidents/page.tsx
import React from "react";
import IncidentsClient from "./IncidentsClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function IncidentsPage() {
  let incidentHistory = [];
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/driver/incidents/today`, {
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      incidentHistory = rawData.data;
    }
  } catch (err) {
    console.error("Failed to fetch incidents", err);
  }

  return <IncidentsClient initialIncidents={incidentHistory} />;
}