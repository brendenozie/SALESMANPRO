// app/admin/[adminSlug]/parentmessages/page.tsx
import MessagesClientPage from './MessagesClientPage';

export interface ChatThread {
  id: string;
  senderName: string;
  role: string; // e.g., "Math Teacher"
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatarUrl?: string;
  online?: boolean;
}

export default async function ParentMessagesPage({ params }: { params: Promise<{ adminSlug: string }> }) {
  const { adminSlug } = await params;

  // Sample Conversations
  const chatThreads: ChatThread[] = [
    {
      id: 't1',
      senderName: 'Mr. Kamau',
      role: 'Mathematics Teacher',
      lastMessage: 'Zane did excellent in the Algebra test today!',
      timestamp: '2:45 PM',
      unreadCount: 1,
      online: true,
      avatarUrl: 'https://ui-avatars.com/api/?name=Mr+Kamau&background=4f46e5&color=fff'
    },
    {
      id: 't2',
      senderName: 'Mrs. Anyango',
      role: 'Class Teacher',
      lastMessage: 'Please remember the field trip consent form.',
      timestamp: 'Yesterday',
      unreadCount: 0,
      online: false,
      avatarUrl: 'https://ui-avatars.com/api/?name=Mrs+Anyango&background=10b981&color=fff'
    },
  ];

  return (
    <div className="h-[calc(100vh-120px)] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <MessagesClientPage threads={chatThreads} adminSlug={adminSlug} />
    </div>
  );
}