// app/admin/[slug]/events/[eventId]/registrations/page.tsx
import React from "react";
import EventRegistrationsPage, {
  EventRegistrationData,
  EventDetailsForRegistrationPage,
  UserOption,
  StudentOption,
} from "./EventRegistrationsPage";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // companyId
    eventId: string;
  };
}

// --- Helper function to generate sample data (for fallback) ---
const generateSampleRegistrationData = (companyId: string, eventId: string): {
  sampleEventDetails: EventDetailsForRegistrationPage;
  sampleRegistrations: EventRegistrationData[];
  sampleUsers: UserOption[];
  sampleStudents: StudentOption[];
} => {
  const sampleEventDetails: EventDetailsForRegistrationPage = {
    id: eventId,
    title: 'Sample Event Title',
    startDateTime: new Date('2025-08-10T10:00:00Z').toISOString(),
    endDateTime: new Date('2025-08-10T12:00:00Z').toISOString(),
    location: 'Main Hall',
    companyId: companyId,
    isRegistrationRequired: true,
    maxCapacity: 100,
    isPaid: false,
    price: null,
  };

  const sampleUsers: UserOption[] = [
    { id: 'USR001', name: 'John Doe', email: 'john.doe@example.com' },
    { id: 'USR002', name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: 'USR003', name: 'Mike Brown', email: 'mike.b@example.com' },
  ];

  const sampleStudents: StudentOption[] = [
    { id: 'STU001', name: 'Alice Johnson', email: 'alice.j@example.com' },
    { id: 'STU002', name: 'Bob Williams', email: 'bob.w@example.com' },
  ];

  const sampleRegistrations: EventRegistrationData[] = [
    {
      id: 'REG001',
      eventId: eventId,
      eventTitle: sampleEventDetails.title,
      eventStartDateTime: sampleEventDetails.startDateTime,
      eventEndDateTime: sampleEventDetails.endDateTime,
      eventLocation: sampleEventDetails.location,
      eventCompanyId: companyId,
      userId: 'USR001',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      studentId: null,
      studentName: null,
      studentEmail: null,
      registeredAt: new Date('2025-07-01T10:00:00Z').toISOString(),
      status: 'REGISTERED',
    },
    {
      id: 'REG002',
      eventId: eventId,
      eventTitle: sampleEventDetails.title,
      eventStartDateTime: sampleEventDetails.startDateTime,
      eventEndDateTime: sampleEventDetails.endDateTime,
      eventLocation: sampleEventDetails.location,
      eventCompanyId: companyId,
      userId: 'USR002',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      studentId: 'STU001', // Jane registered Alice
      studentName: 'Alice Johnson',
      studentEmail: 'alice.j@example.com',
      registeredAt: new Date('2025-07-02T11:30:00Z').toISOString(),
      status: 'REGISTERED',
    },
    {
      id: 'REG003',
      eventId: eventId,
      eventTitle: sampleEventDetails.title,
      eventStartDateTime: sampleEventDetails.startDateTime,
      eventEndDateTime: sampleEventDetails.endDateTime,
      eventLocation: sampleEventDetails.location,
      eventCompanyId: companyId,
      userId: 'USR003',
      userName: 'Mike Brown',
      userEmail: 'mike.b@example.com',
      studentId: null,
      studentName: null,
      studentEmail: null,
      registeredAt: new Date('2025-07-03T14:00:00Z').toISOString(),
      status: 'WAITLISTED', // Example of a different status
    },
  ];

  return { sampleEventDetails, sampleRegistrations, sampleUsers, sampleStudents };
};


export default async function EventRegistrationsOverviewPage({ params }: PageProps) {
  const { slug: companyId, eventId } = params;

  let initialEventDetails: EventDetailsForRegistrationPage | null = null;
  let initialRegistrations: EventRegistrationData[] = [];
  let allUsers: UserOption[] = [];
  let allStudents: StudentOption[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch event details
    const eventRes = await fetch(`${apiUrl}/events/${eventId}`, {
      cache: "no-store",
    });
    if (eventRes.ok) {
      const eventData = await eventRes.json();
      initialEventDetails = {
        id: eventData.id,
        title: eventData.title,
        startDateTime: eventData.startDateTime,
        endDateTime: eventData.endDateTime,
        location: eventData.location,
        companyId: eventData.companyId,
        isRegistrationRequired: eventData.isRegistrationRequired,
        maxCapacity: eventData.maxCapacity,
        isPaid: eventData.isPaid,
        price: eventData.price,
      };
    } else {
      console.error(`[EventRegistrationsOverviewPage] Failed to fetch event details for ${eventId}: ${eventRes.status} ${eventRes.statusText}`);
      fetchError = true;
    }

    // Fetch event registrations for this event
    const registrationsRes = await fetch(`${apiUrl}/event-registrations?eventId=${encodeURIComponent(eventId)}`, {
      cache: "no-store",
    });
    if (registrationsRes.ok) {
      initialRegistrations = (await registrationsRes.json()) as EventRegistrationData[];
    } else {
      console.error(`[EventRegistrationsOverviewPage] Failed to fetch registrations for event ${eventId}: ${registrationsRes.status} ${registrationsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all users in the company (for registration form/filtering)
    const usersRes = await fetch(`${apiUrl}/users?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/users endpoint
      cache: "no-store",
    });
    if (usersRes.ok) {
      allUsers = (await usersRes.json()) as UserOption[];
    } else {
      console.error(`[EventRegistrationsOverviewPage] Failed to fetch users: ${usersRes.status} ${usersRes.statusText}`);
      fetchError = true;
    }

    // Fetch all students in the company (for registration form/filtering)
    const studentsRes = await fetch(`${apiUrl}/students?companyId=${encodeURIComponent(companyId)}`, { // Assuming /api/students endpoint
      cache: "no-store",
    });
    if (studentsRes.ok) {
      const fetchedStudents = (await studentsRes.json()) as any[];
      allStudents = fetchedStudents.map(s => ({ id: s.id, name: s.user?.name || 'N/A', email: s.user?.email || 'N/A' }));
    } else {
      console.error(`[EventRegistrationsOverviewPage] Failed to fetch students: ${studentsRes.status} ${studentsRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("[EventRegistrationsOverviewPage] Error fetching initial data →", err.message);
    fetchError = true;
  }

  // If any fetch failed or returned empty, use sample data as fallback
  if (fetchError || !initialEventDetails || initialRegistrations.length === 0 || allUsers.length === 0 || allStudents.length === 0) {
    console.log("[EventRegistrationsOverviewPage] Using sample data as fallback.");
    const { sampleEventDetails, sampleRegistrations, sampleUsers, sampleStudents } = generateSampleRegistrationData(companyId, eventId);
    initialEventDetails = sampleEventDetails;
    initialRegistrations = sampleRegistrations;
    allUsers = sampleUsers;
    allStudents = sampleStudents;
  }

  if (!initialEventDetails) {
    return (
      <div className="p-8 text-center text-red-600">
        Error: Could not load event details. Please ensure the event ID is valid.
      </div>
    );
  }

  return (
    <EventRegistrationsPage
      eventDetails={initialEventDetails}
      initialRegistrations={initialRegistrations}
      allUsers={allUsers}
      allStudents={allStudents}
      companyId={companyId}
    />
  );
}
