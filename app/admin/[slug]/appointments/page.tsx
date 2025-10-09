// app/[slug]/appointments/page.tsx
import React from "react";
import AdminAppointmentsClient, {
  AppointmentItem,
  OrderItem,
} from "./AdminAppointementsClient"; // ✅ fixed import
import { cookies } from "next/headers";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: {
    slug: string; // companyId
  };
}

// ──────────────────────────────────────────────
// Sample (Fallback) Data
// ──────────────────────────────────────────────
const sampleAppointments: AppointmentItem[] = [
  {
    id: "apt_001",
    service: "Dental Checkup",
    date: "2025-07-25",
    timeSlot: "10:00 AM",
    client: {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "+254712345678",
    },
    status: "Scheduled",
    notes: "First-time visitor",
  },
  {
    id: "apt_002",
    service: "Therapy Session",
    date: "2025-07-26",
    timeSlot: "02:30 PM",
    client: {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "+254798765432",
    },
    status: "Scheduled",
    notes: "Follow-up in two weeks",
  },
];

const sampleOrderItems: OrderItem[] = [
  {
    id: "ord_item_001",
    price: 50.0,
    name: "Home Cleaning Service",
    quantity: 1,
    status: "PENDING",
    date: "2025-07-25",
    timeSlot: "01:00 PM",
    marketplaceListing: {
      title: "Standard Home Cleaning",
    },
    order: {
      id: "order_xyz_123",
      status: "PENDING",
      name: "Emily White",
      email: "emily.white@example.com",
      phone: "+254733445566",
    },
  },
];

// ──────────────────────────────────────────────
// Page Component
// ──────────────────────────────────────────────
export default async function AppointmentsPage({ params }: Props) {
  const companyId = params.slug;
  const cookieStore = cookies();
  const cookieHeader = cookieStore.toString();

  let fetchedAppointments: AppointmentItem[] = [];
  let fetchedOrderItems: OrderItem[] = [];

  try {
    // Fetch order items (or appointments depending on API structure)
    const res = await fetch(
      `${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`,
      {
        next: { revalidate: 60 },
        headers: { cookie: cookieHeader },
      }
    );

    if (res.ok) {
      const json = await res.json();
      fetchedOrderItems =
        json?.data?.orderItems?.filter(
          (item: OrderItem) => item.date && item.timeSlot
        ) || [];
      console.log("✅ Fetched order items:", fetchedOrderItems);
    } else {
      console.error(
        "[AppointmentsPage] Failed to fetch order items →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error(
      "[AppointmentsPage] Error fetching order items →",
      err.message
    );
  }

  // ──────────────────────────────────────────────
  // Fallback Logic
  // ──────────────────────────────────────────────
  const hasFetchedData =
    fetchedAppointments.length > 0 || fetchedOrderItems.length > 0;

  const initialAppointments = hasFetchedData
    ? fetchedAppointments
    : sampleAppointments;

  const initialOrderItems = hasFetchedData
    ? fetchedOrderItems
    : sampleOrderItems;

  console.log(
    hasFetchedData
      ? "✅ Using fetched data"
      : "⚠️ Using sample fallback data for demo"
  );

  return (
    <AdminAppointmentsClient
      initialAppointments={initialAppointments}
      initialOrderItems={initialOrderItems}
    />
  );
}
