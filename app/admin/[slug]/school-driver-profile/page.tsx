// app/driver/profile/page.tsx
import React from "react";
import ProfileClient from "./ProfileClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function DriverProfilePage() {
  let driverData = null;
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/driver/me`, {
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      driverData = rawData.data;
    }
  } catch (err) {
    console.error("Failed to fetch driver profile", err);
  }

  return <ProfileClient initialData={driverData} />;
}