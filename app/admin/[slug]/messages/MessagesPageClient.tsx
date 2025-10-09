'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// --- ICONS (No changes, your icon list is great) ---
import {
  ChatBubbleLeftRightIcon, CalendarDaysIcon, MagnifyingGlassIcon, PlusCircleIcon,
  PaperAirplaneIcon, UserCircleIcon, ArrowLeftIcon, EnvelopeOpenIcon, EnvelopeIcon,
  XMarkIcon, ArchiveBoxIcon, TrashIcon, UserPlusIcon, EllipsisVerticalIcon, PaperClipIcon, // Added PaperClipIcon
} from '@heroicons/react/24/outline';

// --- TYPE DEFINITIONS (No changes) ---
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type MessageData = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string; // NEW: Add avatar URL
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM_NOTIFICATION' | 'OTHER';
  attachmentUrls: string[];
  createdAt: string; // ISO string
};

export type ParticipantData = {
  id: string;
  name: string;
  email: string;
  avatar?: string; // NEW: Add avatar URL
};

export type ConversationData = {
  id: string;
  title: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string | null;
  isArchived: boolean;
  isDeleted: boolean;
  unreadCount: number;
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
  avatar?: string; // NEW: Add avatar URL
};

interface MessagesPageProps {
  initialConversations: ConversationData[];
  allUsers: UserData[];
  currentUserId: string;
  companyId: string;
}

// --- HELPER FUNCTION for relative dates ---
const formatTimestamp = (isoDate: string) => {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

  const isYesterday = now.getDate() - 1 === date.getDate() && now.getMonth() === date.getMonth() && now.getFullYear() === date.getFullYear();
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

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


// --- Main MessagesPage Component (Refactored) ---
export default function MessagesPageClient({ initialConversations, allUsers, currentUserId, companyId }: MessagesPageProps) {
  const [conversations, setConversations] = useState<ConversationData[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageData[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // ✅ PERFORMANCE FIX: Efficiently update unread count locally
  const markConversationAsRead = (convId: string) => {
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  
  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/conversations?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`, {
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



  const fetchMessages = useCallback(async (convId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/conversations/${convId}/messages?userId=${encodeURIComponent(currentUserId)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentMessages(data.messages);
        // ✅ PERFORMANCE FIX: Mark as read locally instead of re-fetching all conversations
        markConversationAsRead(convId);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch messages.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching messages.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
       const participantsNames = conv.participants.map(p => p.name.toLowerCase()).join(' ');
      const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';
      const subject = conv.title?.toLowerCase() || '';
      return participantsNames.includes(searchTerm.toLowerCase()) ||
             lastMessageContent.includes(searchTerm.toLowerCase()) ||
             subject.includes(searchTerm.toLowerCase());
    }).sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
  }, [conversations, searchTerm]);

  const unreadMessagesCount = useMemo(() => conversations.reduce((acc, conv) => acc + (conv.unreadCount > 0 ? 1 : 0), 0), [conversations]);

  const selectedConversation = useMemo(() => selectedConversationId ? conversations.find(conv => conv.id === selectedConversationId) : null, [selectedConversationId, conversations]);

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    fetchMessages(convId);
  };
  
  
  const handleSendMessage = async () => {
    if (!newMessageContent.trim() || !selectedConversationId) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/conversations/${selectedConversationId}/messages`, {
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
      const convRes = await fetch(`${apiUrl}/conversations`, {
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
      const msgRes = await fetch(`${apiUrl}/conversations/${newConversationId}/messages`, {
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
      const res = await fetch(`${apiUrl}/conversations/${convId}/participants?userId=${encodeURIComponent(currentUserId)}`, {
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
      const res = await fetch(`${apiUrl}/conversations/${convId}/participants?userId=${encodeURIComponent(currentUserId)}`, {
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
    if (conv.title) return conv.title;
    const otherParticipants = conv.participants.filter(p => p.id !== currentUserId);
    if (otherParticipants.length > 0) return otherParticipants.map(p => p.name).join(', ');
    return 'Conversation';
  };

  const currentUser = useMemo(() => allUsers.find(u => u.id === currentUserId), [allUsers, currentUserId]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen font-sans">
      {/* ... (Your Header and Overview Stats sections are great, no changes needed) ... */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        {/* --- Left Column: Inbox --- */}
        <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col ${selectedConversationId ? 'hidden lg:flex' : 'flex'} lg:col-span-1`}>
            {/* ... (Your search and filter UI is good) ... */}
            <div className="flex-grow space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {filteredConversations.map(conv => {
                    const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
                    return (
                        <div key={conv.id} onClick={() => handleSelectConversation(conv.id)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${conv.id === selectedConversationId ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}>
                            
                            {/* ✨ NEW: Avatar */}
                            <div className="relative flex-shrink-0">
                                {otherParticipant?.avatar ? (
                                    <img src={otherParticipant.avatar} alt="avatar" className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="h-12 w-12 text-gray-300" />
                                )}
                                {conv.unreadCount > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>}
                            </div>

                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-baseline">
                                    <p className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {getConversationTitle(conv)}
                                    </p>
                                    {/* 🕰️ NEW: Relative Timestamp */}
                                    <p className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                        {formatTimestamp(conv.lastMessageAt || conv.createdAt)}
                                    </p>
                                </div>
                                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                    {conv.lastMessage ? `${conv.lastMessage.senderName === currentUser?.name ? 'You: ' : ''}${conv.lastMessage.content}` : 'No messages yet.'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* --- Right Column: Chat View --- */}
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

              
              {/* 💬 NEW: Improved Conversation History with Date Grouping */}
              <div className="flex-grow p-6 space-y-2 overflow-y-auto custom-scrollbar">
                {currentMessages.map((msg, index) => {
                    const prevMsg = currentMessages[index - 1];
                    const showDateHeader = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();
                    const showAvatarAndName = !prevMsg || prevMsg.senderId !== msg.senderId || showDateHeader;

                    return (
                        <React.Fragment key={msg.id}>
                            {showDateHeader && (
                                <div className="text-center text-xs text-gray-500 my-4">
                                    <span className="bg-gray-200 px-2 py-1 rounded-full">{new Date(msg.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                </div>
                            )}
                            <div className={`flex items-end gap-2 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                {/* Avatar for the other person */}
                                {msg.senderId !== currentUserId && (
                                    <div className="w-8 h-8 flex-shrink-0">
                                        {showAvatarAndName && (msg.senderAvatar ? <img src={msg.senderAvatar} alt="avatar" className="w-full h-full rounded-full object-cover"/> : <UserCircleIcon className="text-gray-300"/>)}
                                    </div>
                                )}
                                
                                <div className={`max-w-md p-3 rounded-lg shadow-sm ${msg.senderId === currentUserId ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                    {showAvatarAndName && msg.senderId !== currentUserId && <p className="font-semibold text-sm mb-1 text-indigo-700">{msg.senderName}</p>}
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-xs text-right mt-1 opacity-70">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
              </div>
              
              {/* 📎 NEW: Improved Reply Input with Attachment Button */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg p-2 focus-within:ring-2 focus-within:ring-indigo-500">
                    <button className="p-2 text-gray-500 hover:text-indigo-600">
                        <PaperClipIcon className="h-5 w-5" />
                    </button>
                    <textarea value={newMessageContent} onChange={(e) => setNewMessageContent(e.target.value)}
                        placeholder="Type your message..." rows={1}
                        className="flex-grow bg-transparent border-none focus:ring-0 resize-none text-sm p-0 m-0"
                    />
                    <button onClick={handleSendMessage} disabled={!newMessageContent.trim() || isLoading}
                        className="p-2 bg-indigo-600 text-white rounded-full shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
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