// app/admin/[slug]/messages/page.tsx
import React from "react";
import MessagesPageClient, {
  ConversationData,
  UserData,
} from "./MessagesPageClient";
import { cookies } from "next/headers";


const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params:Promise<{ slug: string }>
}

// IMPORTANT: In a real application, the currentUserId would come from an authentication context (e.g., NextAuth.js session).
// For this example, we'll use a hardcoded mock ID.
const MOCK_CURRENT_USER_ID = "USR001"; // Replace with a real user ID from your DB for testing

// --- Helper function to generate sample data (for fallback) ---
const generateSampleMessageData = (companyId: string, currentUserId: string): {
  sampleConversations: ConversationData[];
  sampleAllUsers: UserData[];
} => {
  const sampleUsers: UserData[] = [
    { id: currentUserId, name: 'Current User (You)', email: 'current.user@example.com' },
    { id: 'USR002', name: 'Jane Wanjiru', email: 'jane.w@school.com' },
    { id: 'USR003', name: 'Mr. Alex Smith', email: 'alex.s@school.com' },
    { id: 'USR004', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
    { id: 'USR005', name: 'Principal\'s Office', email: 'principal@school.com' },
  ];

  const sampleConversations: ConversationData[] = [
    {
      id: 'CONV001',
      title: null, // Direct chat
      companyId: companyId,
      createdAt: new Date('2025-06-25T14:00:00Z').toISOString(),
      updatedAt: new Date('2025-06-25T14:30:00Z').toISOString(),
      lastMessageAt: new Date('2025-06-25T14:30:00Z').toISOString(),
      isArchived: false,
      isDeleted: false,
      unreadCount: 0,
      participants: [
        { id: currentUserId, name: 'Current User (You)', email: 'current.user@example.com' },
        { id: 'USR002', name: 'Jane Wanjiru', email: 'jane.w@school.com' },
      ],
      lastMessage: {
        id: 'MSG001',
        content: 'Hi, I had a question about problem 5 on Assignment 3.',
        createdAt: new Date('2025-06-25T14:30:00Z').toISOString(),
        senderName: 'Jane Wanjiru',
      },
    },
    {
      id: 'CONV002',
      title: null, // Direct chat
      companyId: companyId,
      createdAt: new Date('2025-06-24T09:00:00Z').toISOString(),
      updatedAt: new Date('2025-06-24T10:30:00Z').toISOString(),
      lastMessageAt: new Date('2025-06-24T10:30:00Z').toISOString(),
      isArchived: false,
      isDeleted: false,
      unreadCount: 0,
      participants: [
        { id: currentUserId, name: 'Current User (You)', email: 'current.user@example.com' },
        { id: 'USR003', name: 'Mr. Alex Smith', email: 'alex.s@school.com' },
      ],
      lastMessage: {
        id: 'MSG002',
        content: 'Good morning Mr. Smith, I am available on Tuesday or Thursday afternoon.',
        createdAt: new Date('2025-06-24T10:30:00Z').toISOString(),
        senderName: 'Current User (You)',
      },
    },
    {
      id: 'CONV003',
      title: 'English Department Meeting', // Group chat
      companyId: companyId,
      createdAt: new Date('2025-06-23T09:00:00Z').toISOString(),
      updatedAt: new Date('2025-06-23T09:15:00Z').toISOString(),
      lastMessageAt: new Date('2025-06-23T09:15:00Z').toISOString(),
      isArchived: false,
      isDeleted: false,
      unreadCount: 1, // Example unread
      participants: [
        { id: currentUserId, name: 'Current User (You)', email: 'current.user@example.com' },
        { id: 'USR004', name: 'Mrs. Jane Smith', email: 'jane.smith@school.com' },
        { id: 'USR005', name: 'Principal\'s Office', email: 'principal@school.com' },
      ],
      lastMessage: {
        id: 'MSG003',
        content: 'Hi John, the new English curriculum materials are now uploaded to the shared drive.',
        createdAt: new Date('2025-06-23T09:15:00Z').toISOString(),
        senderName: 'Mrs. Jane Smith',
      },
    },
  ];

  return {
    sampleConversations: sampleConversations,
    sampleAllUsers: sampleUsers,
  };
};


/**
 * This is a **Server Component**. It fetches all the data
 * at request‐time (no caching, just like getServerSideProps),
 * then renders the Client Component below.
 */
export default async function MessagesManagerPage({ params }: Props) {
  const { slug : companyId } = await params;
  const currentUserId = MOCK_CURRENT_USER_ID; // In a real app, get this from auth context
  
    const cookieHeader = (await cookies()).toString();

  let initialConversations: ConversationData[] = [];
  let allUsers: UserData[] = [];
  let fetchError: boolean = false;

  try {
    // Fetch conversations for the current user
    const conversationsRes = await fetch(
      `${apiUrl}/admin/conversations?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`,
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (conversationsRes.ok) {
      let dataConvers = await conversationsRes.json();
      initialConversations = dataConvers.data as ConversationData[]
      ;
    } else {
      console.error(`[MessagesManagerPage] Failed to fetch conversations: ${conversationsRes.status} ${conversationsRes.statusText}`);
      fetchError = true;
    }

    // Fetch all users in the company (for recipient selection in compose)
    const usersRes = await fetch(
      `${apiUrl}/admin/users?companyId=${encodeURIComponent(companyId)}`, // Assuming an /api/users endpoint
      { next: { revalidate: 60 }, headers: { cookie: cookieHeader } }
    );
    if (usersRes.ok) {
      let dataUsers = await usersRes.json();
      allUsers = dataUsers.data as UserData[];
    } else {
      console.error(`[MessagesManagerPage] Failed to fetch users: ${usersRes.status} ${usersRes.statusText}`);
      fetchError = true;
    }

  } catch (err: any) {
    console.error("MessagesManagerPage-fetch error:", err.message);
    fetchError = true;
  }

  // If any fetch failed or data is missing, use sample data as fallback
  if (fetchError || initialConversations.length === 0 || allUsers.length === 0) {
    console.log("[MessagesManagerPage] Using sample data as fallback for messages.");
    const { sampleConversations, sampleAllUsers } = generateSampleMessageData(companyId, currentUserId);
    initialConversations = sampleConversations;
    allUsers = sampleAllUsers;
  }

  return (
    <MessagesPageClient
      initialConversations={initialConversations}
      allUsers={allUsers}
      currentUserId={currentUserId}
      companyId={companyId}
    />
  );
}
