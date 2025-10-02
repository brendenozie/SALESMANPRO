// app/[slug]/appointments/page.tsx
import React from "react";
import AdminAppointmentsClient, { AppointmentItem, OrderItem } from "./AdminAppointementsClient"; // Updated import to include OrderItem type

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// export interface OrderItem {
//   id: string;
//   price: number;
//   name?: string; // Made optional as it might come from marketplaceListing
//   email?: string;
//   phone?: string;
//   quantity: number;
//   status?: string;
//   date?: string;
//   timeSlot?: string;
//   marketplaceListing?: {
//     title?: string;
//     name?: string;
//   };
//   order?: {
//     status?: string;
//     rider?: string;
//     createdAt?: string;
//     name?: string;
//     title?: string;
//     email?: string;
//     phone?: string;
//     consumer?: {
//       name?: string;
//     };
//   };
// }

interface Props {
  params: {
    slug: string; // companyId
  };
}

// Sample data for appointments
const sampleAppointments: AppointmentItem[] = [
  {
    id: "apt_001",
    service: "Dental Checkup",
    date: "2025-07-25", // Changed date to be in the future for better demo
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
    date: "2025-07-26", // Changed date
    timeSlot: "02:30 PM",
    client: {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "+254798765432",
    },
    status: "Scheduled", // Changed to Scheduled for demo
    notes: "Follow-up in two weeks",
  },
  {
    id: "apt_003",
    service: "Consultation",
    date: "2025-07-27", // Changed date
    timeSlot: "11:15 AM",
    client: {
      name: "Carol Lee",
      email: "carol.lee@example.com",
      phone: "+254701234567",
    },
    status: "Cancelled",
    notes: "Client requested reschedule",
  },
  {
    id: "apt_004",
    service: "Yoga Class",
    date: "2025-07-25",
    timeSlot: "09:00 AM",
    client: {
      name: "David Green",
      email: "david.green@example.com",
      phone: "+254722334455",
    },
    status: "Scheduled",
    notes: "Beginner session",
  },
];

// Sample data for order items that might have a date/time
const sampleOrderItems: OrderItem[] = [
  {
    id: "ord_item_001",
    price: 50.00,
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
  {
    id: "ord_item_002",
    price: 120.00,
    name: "Plumbing Repair",
    quantity: 1,
    status: "PROCESSING",
    date: "2025-07-26",
    timeSlot: "09:30 AM",
    marketplaceListing: {
      title: "Emergency Plumbing",
    },
    order: {
      id: "order_abc_456",
      status: "PROCESSING",
      rider: "Rider101",
      name: "Frank Black",
      email: "frank.black@example.com",
      phone: "+254744556677",
    },
  },
  {
    id: "ord_item_003",
    price: 75.00,
    name: "Car Wash & Detailing",
    quantity: 1,
    status: "DELIVERED",
    date: "2025-07-24", // Past date to show completed
    timeSlot: "03:00 PM",
    marketplaceListing: {
      title: "Premium Car Detailing",
    },
    order: {
      id: "order_def_789",
      status: "DELIVERED",
      rider: "Rider102",
      name: "Grace Hall",
      email: "grace.hall@example.com",
      phone: "+254755667788",
    },
  },
];

export default async function AppointmentsPage({ params }: Props) {
  const companyId = params.slug;
  let orderItems: OrderItem[] = [];

  // In a real application, you would fetch both appointments and order items
  // based on the companyId from your API.
  try {
    const res = await fetch(
      `${apiUrl}/admin/orders?companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 } } // SSR on every request
    );
    if (res.ok) {
      const json = (await res.json()) as { orderItems: OrderItem[] };
      // Filter orderItems to include only those with date/timeSlot if necessary
      orderItems = json.orderItems.filter(item => item.date && item.timeSlot) || [];
    } else {
      console.error(
        "[AppointmentsPage] Failed to fetch order items →",
        res.status,
        res.statusText
      );
    }
  } catch (err: any) {
    console.error("[AppointmentsPage] Error fetching order items →", err.message);
  }

  // Combine sample data with fetched data for demonstration purposes
  const initialAppointments = sampleAppointments;
  const combinedInitialOrderItems = [...sampleOrderItems, ...orderItems]; // Combine fetched with sample

  console.log("Initial Appointments:", initialAppointments);
  console.log("Initial Order Items (with date/time):", combinedInitialOrderItems);

  return <AdminAppointmentsClient initialAppointments={initialAppointments} initialOrderItems={combinedInitialOrderItems} />;
}