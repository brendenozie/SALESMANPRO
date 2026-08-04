'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon, // Main icon for messages
  CalendarDaysIcon, // For date
  MagnifyingGlassIcon, // For search
  PlusCircleIcon, // For new message
  PaperAirplaneIcon, // For send
  UserCircleIcon, // Generic user avatar
  ArrowLeftIcon, // Back to inbox
  CheckCircleIcon, // Read status
  EnvelopeOpenIcon, // Read icon
  EnvelopeIcon, // Unread icon
  TagIcon, // For message types/tags
  XMarkIcon, // For closing modals/errors
  ArchiveBoxIcon, // For archive
  TrashIcon, // For delete
  UserPlusIcon, // For adding participants
  EllipsisVerticalIcon, // More options
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// --- Type Definitions (Aligned with new API responses) ---
export type MessageData = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM_NOTIFICATION' | 'OTHER';
  attachmentUrls: string[];
  createdAt: string; // ISO string
};

export type ParticipantData = {
  id: string; // User ID
  name: string;
  email: string;
};

export type ConversationData = {
  id: string;
  title: string | null;
  companyId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  lastMessageAt: string | null; // ISO string
  isArchived: boolean; // User-specific
  isDeleted: boolean; // User-specific
  unreadCount: number; // User-specific
  participants: ParticipantData[];
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderName: string;
  } | null;
};

export type UserData = {
  id: string;
  name: string;
  email: string;
};

interface MessagesPageProps {
  initialConversations: ConversationData[];
  allUsers: UserData[];
  currentUserId: string; // The ID of the currently logged-in user
  companyId: string;
}

// --- Compose New Message Modal ---
type ComposeMessageModalProps = {
  onClose: () => void;
  onSend: (formData: { recipientIds: string[]; subject: string | null; message: string; messageType?: MessageData['messageType'] }) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  allUsers: UserData[];
  currentUserId: string;
};

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ onClose, onSend, isLoading, error, resetError, allUsers, currentUserId }) => {
  const [formData, setFormData] = useState({
    recipientIds: [] as string[],
    subject: '',
    message: '',
    messageType: 'TEXT' as MessageData['messageType'],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    setFormData(prev => ({ ...prev, recipientIds: selectedValues }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();

    if (formData.recipientIds.length === 0 || !formData.message.trim()) {
      alert("Please select at least one recipient and type a message.");
      return;
    }

    // Include current user in participants for new conversation
    const allParticipantIds = Array.from(new Set([...formData.recipientIds, currentUserId]));

    onSend({
      recipientIds: allParticipantIds,
      subject: formData.subject.trim() === '' ? null : formData.subject.trim(),
      message: formData.message.trim(),
      messageType: formData.messageType,
    });
  };

  // Filter out current user from recipients list
  const availableRecipients = allUsers.filter(user => user.id !== currentUserId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl transform transition-all duration-300 scale-100 opacity-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors duration-200"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4 border-gray-200">
          Compose New Message
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4 flex items-center justify-between">
            <span className="block sm:inline">{error}</span>
            <button onClick={resetError} className="text-red-500 hover:text-red-800 focus:outline-none">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="recipientIds" className="block text-sm font-medium text-gray-700 mb-1">Recipients <span className="text-red-500">*</span></label>
            <select multiple name="recipientIds" id="recipientIds" value={formData.recipientIds} onChange={handleRecipientChange} required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white h-32 overflow-y-auto"
            >
              {availableRecipients.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple recipients for a group chat.</p>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject (Optional - for direct chats, often left blank)</label>
            <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base" />
          </div>

          <div>
            <label htmlFor="messageType" className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
            <select name="messageType" id="messageType" value={formData.messageType} onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base bg-white"
            >
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image (URL)</option>
              <option value="FILE">File (URL)</option>
              <option value="AUDIO">Audio (URL)</option>
              <option value="VIDEO">Video (URL)</option>
              <option value="SYSTEM_NOTIFICATION">System Notification</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message Content <span className="text-red-500">*</span></label>
            <textarea name="message" id="message" value={formData.message} onChange={handleChange} required rows={5}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main MessagesPage Component ---
export default function MessagesPageClient({ initialConversations, allUsers, currentUserId, companyId }: MessagesPageProps) {
  const [conversations, setConversations] = useState<ConversationData[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageData[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReadStatus, setFilterReadStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false); // For API operations
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling to bottom of chat

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/conversations?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data: ConversationData[] = await res.json();
        setConversations(data.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime()));
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch conversations.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching conversations.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, companyId]);

  // Fetch messages for a selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/conversations/${convId}/messages?userId=${encodeURIComponent(currentUserId)}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentMessages(data.messages);
        // After fetching and marking as read, re-fetch conversations to update unread counts
        await fetchConversations();
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch messages for conversation.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching messages.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, fetchConversations]);

  // Initial fetch on component mount if initial data is empty
  useEffect(() => {
    if (initialConversations.length === 0 && !isLoading && !error) {
      fetchConversations();
    }
  }, [initialConversations, isLoading, error, fetchConversations]);

  // Scroll to bottom of messages when currentMessages updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);


  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const participantsNames = conv.participants.map(p => p.name.toLowerCase()).join(' ');
      const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';
      const subject = conv.title?.toLowerCase() || '';

      const matchesSearch = participantsNames.includes(searchTerm.toLowerCase()) ||
                            lastMessageContent.includes(searchTerm.toLowerCase()) ||
                            subject.includes(searchTerm.toLowerCase());

      const matchesReadStatus = filterReadStatus === 'All' ||
                                (filterReadStatus === 'Read' && conv.unreadCount === 0) ||
                                (filterReadStatus === 'Unread' && conv.unreadCount > 0);
      return matchesSearch && matchesReadStatus;
    }).sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
  }, [conversations, searchTerm, filterReadStatus]);

  const unreadMessagesCount = conversations.filter(conv => conv.unreadCount > 0).length;

  const selectedConversation = selectedConversationId ? conversations.find(conv => conv.id === selectedConversationId) : null;

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    fetchMessages(convId);
  };

  const handleSendMessage = async () => {
    if (!newMessageContent.trim() || !selectedConversationId) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/conversations/${selectedConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          content: newMessageContent.trim(),
          messageType: 'TEXT', // Default to TEXT for now, can be extended
        }),
      });

      if (res.ok) {
        setNewMessageContent('');
        await fetchMessages(selectedConversationId); // Re-fetch messages and update unread counts
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to send message.");
      }
    } catch (err: any) {
      setError(err.message || "Network error sending message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComposeNewConversation = async (formData: { recipientIds: string[]; subject: string | null; message: string; messageType?: MessageData['messageType'] }) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Create the new conversation
      const convRes = await fetch(`${apiBaseUrl}/admin/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: companyId,
          participantIds: formData.recipientIds,
          title: formData.subject,
        }),
      });

      if (!convRes.ok) {
        const errorData = await convRes.json();
        setError(errorData.message || "Failed to create conversation.");
        setIsLoading(false);
        return;
      }

      const newConversation = await convRes.json();
      const newConversationId = newConversation.id;

      // 2. Send the first message to the new conversation
      const msgRes = await fetch(`${apiBaseUrl}/admin/conversations/${newConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          content: formData.message,
          messageType: formData.messageType,
        }),
      });

      if (!msgRes.ok) {
        const errorData = await msgRes.json();
        setError(errorData.message || "Conversation created, but failed to send initial message.");
        // Consider deleting the conversation if message fails, or leave it for manual cleanup
      }

      setShowComposeModal(false);
      await fetchConversations(); // Re-fetch all conversations to include the new one
      setSelectedConversationId(newConversationId); // Select the newly created conversation
      await fetchMessages(newConversationId); // Load messages for the new conversation

    } catch (err: any) {
      setError(err.message || "Network error composing new message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveConversation = async (convId: string) => {
    if (!confirm("Are you sure you want to archive this conversation? You can unarchive it later.")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/admin/conversations/${convId}/participants?userId=${encodeURIComponent(currentUserId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true }),
      });
      if (res.ok) {
        await fetchConversations();
        if (selectedConversationId === convId) {
          setSelectedConversationId(null); // Deselect if archived
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to archive conversation.");
      }
    } catch (err: any) {
      setError(err.message || "Network error archiving conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm("Are you sure you want to delete this conversation? This will remove it permanently for you.")) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // Soft delete for the current user
      const res = await fetch(`${apiBaseUrl}/admin/conversations/${convId}/participants?userId=${encodeURIComponent(currentUserId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchConversations();
        if (selectedConversationId === convId) {
          setSelectedConversationId(null); // Deselect if deleted
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to delete conversation.");
      }
    } catch (err: any) {
      setError(err.message || "Network error deleting conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationTitle = (conv: ConversationData) => {
    if (conv.title) {
      return conv.title;
    }
    // For direct chats, show the other participant's name
    const otherParticipants = conv.participants.filter(p => p.id !== currentUserId);
    if (otherParticipants.length === 1) {
      return otherParticipants[0].name;
    }
    // Fallback for unexpected cases or group chats without title
    return `Conversation (${conv.participants.length} participants)`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            My Messages
            <span className="ml-2 text-indigo-600 text-base sm:text-xl">💬</span>
          </h1>
          <p className="text-sm text-gray-600 mt-1">Your central hub for school communications.</p>
        </div>
        <div className="bg-white text-gray-700 px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium flex items-center gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
          <span>{today}</span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-blue-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <ChatBubbleLeftRightIcon className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Conversations</p>
            <h2 className="text-3xl font-bold text-gray-800">{conversations.length}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <EnvelopeIcon className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Unread Conversations</p>
            <h2 className="text-3xl font-bold text-gray-800">{unreadMessagesCount}</h2>
          </div>
        </div>
      </div>

      {/* Loading and Error Indicators */}
      {isLoading && (
        <div className="flex items-center justify-center py-4 text-blue-700 font-medium text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl relative shadow-md mb-6 flex items-center justify-between">
          <div>
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Main Message Area (Two Columns on larger screens, Stacked on smaller) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]"> {/* Adjusted height */}
        {/* Left Column: Message List / Inbox */}
        <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col ${selectedConversationId ? 'hidden lg:flex' : 'flex'} lg:col-span-1`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <EnvelopeIcon className="h-5 w-5 text-indigo-500" /> Inbox
            </h3>
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm
                         hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircleIcon className="h-5 w-5" /> Compose
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                           focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterReadStatus}
                onChange={(e) => setFilterReadStatus(e.target.value)}
                className="flex-shrink-0 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="All">All Status</option>
                <option value="Read">Read</option>
                <option value="Unread">Unread</option>
              </select>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-grow space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors duration-150 border
                    ${conv.id === selectedConversationId ? 'bg-indigo-50 border-indigo-300 shadow-md' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                    ${conv.unreadCount > 0 ? 'font-semibold' : 'font-normal'}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-800">
                      {conv.participants.length > 2 ? 'Group Chat' : conv.participants.find(p => p.id !== currentUserId)?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : new Date(conv.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-base text-gray-900 mb-1 line-clamp-1">
                    {getConversationTitle(conv)}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {conv.lastMessage ? `${conv.lastMessage.senderName === allUsers.find(u => u.id === currentUserId)?.name ? 'You' : conv.lastMessage.senderName}: ${conv.lastMessage.content}` : 'No messages yet.'}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    {conv.unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1">
                        <EnvelopeIcon className="h-4 w-4" /> {conv.unreadCount} Unread
                      </span>
                    ) : (
                      <EnvelopeOpenIcon className="h-4 w-4 text-gray-400" title="Read" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">No conversations found.</div>
            )}
          </div>
        </div>

        {/* Right Column: Conversation Detail / Message View */}
        <div className={`bg-white rounded-xl shadow-md border border-gray-200 ${selectedConversationId ? 'flex' : 'hidden lg:flex'} lg:col-span-2 flex-col`}>
          {selectedConversation ? (
            <>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition mr-3"
                  title="Back to Inbox"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900">{getConversationTitle(selectedConversation)}</h3>
                  <p className="text-sm text-gray-600">
                    Participants: {selectedConversation.participants.map(p => p.name).join(', ')}
                  </p>
                </div>
                {/* Actions for conversation (e.g., Archive, Delete, Add Participant) */}
                <div className="relative">
                  <button
                    onClick={() => { /* Implement dropdown for more options */ }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                    title="More options"
                  >
                    <EllipsisVerticalIcon className="h-6 w-6" />
                  </button>
                  {/* Dropdown content (example, implement properly) */}
                  {/* <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button onClick={() => handleArchiveConversation(selectedConversation.id)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      <ArchiveBoxIcon className="h-4 w-4 inline-block mr-2" /> Archive
                    </button>
                    <button onClick={() => handleDeleteConversation(selectedConversation.id)} className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left">
                      <TrashIcon className="h-4 w-4 inline-block mr-2" /> Delete
                    </button>
                    <button onClick={() => { /* open add participant modal * / }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                      <UserPlusIcon className="h-4 w-4 inline-block mr-2" /> Add Participant
                    </button>
                  </div> */}
                </div>
              </div>

              {/* Conversation History */}
              <div className="flex-grow p-6 space-y-4 overflow-y-auto custom-scrollbar flex flex-col-reverse"> {/* flex-col-reverse to show latest at bottom */}
                <div ref={messagesEndRef} /> {/* Scroll target */}
                {[...currentMessages].reverse().map((msg) => ( // Reverse again to map in chronological order for display
                  <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs sm:max-w-md p-3 rounded-lg shadow-sm
                      ${msg.senderId === currentUserId ? 'bg-indigo-100 text-indigo-900 ml-auto' : 'bg-gray-100 text-gray-800 mr-auto'}
                    `}>
                      <p className="font-semibold text-sm mb-1">{msg.senderId === currentUserId ? 'You' : msg.senderName}</p>
                      <p className="text-sm">{msg.content}</p>
                      {msg.attachmentUrls && msg.attachmentUrls.length > 0 && (
                        <div className="mt-2 text-xs text-blue-600">
                          {msg.attachmentUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                              Attachment {idx + 1}
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 text-right mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center gap-3">
                <textarea
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="flex-grow border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessageContent.trim() || isLoading}
                  className="p-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 transition
                              disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send Message"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-gray-500">
              <ChatBubbleLeftRightIcon className="h-20 w-20 mb-4 text-gray-300" />
              <p className="text-lg font-semibold">Select a conversation to view messages</p>
              <p className="text-sm mt-2">Or click "Compose" to start a new message.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showComposeModal && (
        <ComposeMessageModal
          onClose={() => setShowComposeModal(false)}
          onSend={handleComposeNewConversation}
          isLoading={isLoading}
          error={error}
          resetError={() => setError(null)}
          allUsers={allUsers}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
