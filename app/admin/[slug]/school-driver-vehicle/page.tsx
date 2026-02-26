// app/driver/vehicle/page.tsx
import React from "react";
import VehicleClient from "./VehicleClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function VehiclePage() {
  let vehicleData = null;
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/driver/assigned-vehicle`, {
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      vehicleData = rawData.data;
    }
  } catch (err) {
    console.error("Failed to fetch vehicle data", err);
  }

  return <VehicleClient initialVehicle={vehicleData} />;
}