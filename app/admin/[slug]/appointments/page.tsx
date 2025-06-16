import React from "react";
import AdminAppointmentsClient, { AppointmentItem } from "./AdminAppointementsClient";

// Sample data for appointments
const sampleAppointments: AppointmentItem[] = [
  {
    id: "apt_001",
    service: "Dental Checkup",
    date: "2025-06-20",
    time: "10:00 AM",
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
    date: "2025-06-21",
    time: "02:30 PM",
    client: {
      name: "Bob Smith",
      email: "bob.smith@example.com",
      phone: "+254798765432",
    },
    status: "Completed",
    notes: "Follow-up in two weeks",
  },
  {
    id: "apt_003",
    service: "Consultation",
    date: "2025-06-22",
    time: "11:15 AM",
    client: {
      name: "Carol Lee",
      email: "carol.lee@example.com",
      phone: "+254701234567",
    },
    status: "Cancelled",
    notes: "Client requested reschedule",
  },
];

export default async function AppointmentsPage() {
  // In a real scenario, fetch from API:
  // const res = await fetch(`/api/admin/appointments`);
  // const appointments = (await res.json()) as AppointmentItem[];
  
  // For now, use sample data
  const initialAppointments = sampleAppointments;

  return <AdminAppointmentsClient initialAppointments={initialAppointments} />;
}
