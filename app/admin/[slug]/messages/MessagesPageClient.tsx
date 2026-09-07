'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

// --- Type Definitions ---
export type MessageData = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'VIDEO' | 'SYSTEM_NOTIFICATION' | 'OTHER';
  attachmentUrls: string[];
  channel?: 'PLATFORM' | 'EMAIL' | 'WHATSAPP' | 'BOTH';
  createdAt: string; 
};

export type ParticipantData = {
  id: string; 
  name: string;
  email: string;
  phone?: string | null;
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
  phone?: string | null;
};

interface MessagesPageProps {
  initialConversations: ConversationData[];
  allUsers: UserData[];
  currentUserId: string;
  companyId: string;
  companyName?: string;
}

// --- Compose New Message Modal ---
type ComposeMessageModalProps = {
  onClose: () => void;
  onSend: (formData: {
    recipientIds: string[];
    subject: string | null;
    message: string;
    messageType?: MessageData['messageType'];
    channel?: 'PLATFORM' | 'EMAIL' | 'WHATSAPP';
  }) => void;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  allUsers: UserData[];
  currentUserId: string;
};

const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  onClose,
  onSend,
  isLoading,
  error,
  resetError,
  allUsers,
  currentUserId,
}) => {
  const [formData, setFormData] = useState({
    recipientIds: [] as string[],
    subject: '',
    message: '',
    messageType: 'TEXT' as MessageData['messageType'],
    channel: 'PLATFORM' as 'PLATFORM' | 'EMAIL' | 'WHATSAPP',
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
      .filter((option) => option.selected)
      .map((option) => option.value);
    setFormData((prev) => ({ ...prev, recipientIds: selectedValues }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetError();

    if (formData.recipientIds.length === 0 || !formData.message.trim()) {
      alert("Please select at least one recipient and type a message.");
      return;
    }

    const allParticipantIds = Array.from(
      new Set([...formData.recipientIds, currentUserId])
    );

    onSend({
      recipientIds: allParticipantIds,
      subject: formData.subject.trim() === '' ? null : formData.subject.trim(),
      message: formData.message.trim(),
      messageType: formData.messageType,
      channel: formData.channel,
    });
  };

  const availableRecipients = allUsers.filter((user) => user.id !== currentUserId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 p-2 rounded-full transition-colors"
          title="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          Compose New Message
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
            <span className="block sm:inline text-sm">{error}</span>
            <button onClick={resetError} className="text-red-500 hover:text-red-800">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Channel selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Initial Outreach Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: 'PLATFORM' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  formData.channel === 'PLATFORM'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>💬 Platform</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: 'EMAIL' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  formData.channel === 'EMAIL'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>✉️ Direct Email</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, channel: 'WHATSAPP' })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                  formData.channel === 'WHATSAPP'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>📱 WhatsApp</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients <span className="text-red-500">*</span>
            </label>
            <select
              multiple
              name="recipientIds"
              value={formData.recipientIds}
              onChange={handleRecipientChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white h-32 custom-scrollbar"
            >
              {availableRecipients.map((user) => (
                <option key={user.id} value={user.id} className="p-1">
                  {user.name} ({user.email || user.phone || 'No direct contact'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject (Optional)
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Order inquiry, Consultation update..."
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Type your message..."
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main MessagesPage Component ---
export default function MessagesPageClient({
  initialConversations,
  allUsers,
  currentUserId,
  companyId,
  companyName = "Store",
}: MessagesPageProps) {
  const [conversations, setConversations] = useState<ConversationData[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<MessageData[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'PLATFORM' | 'EMAIL' | 'WHATSAPP'>('PLATFORM');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReadStatus, setFilterReadStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBaseUrl}/admin/conversations?companyId=${encodeURIComponent(companyId)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();

      if (res.ok && json.success) {
        const conversationList: ConversationData[] = Array.isArray(json.data) ? json.data : [];
        setConversations(
          conversationList.sort(
            (a, b) =>
              new Date(b.lastMessageAt || b.createdAt).getTime() -
              new Date(a.lastMessageAt || a.createdAt).getTime()
          )
        );
      } else {
        setError(json.message || json.error || "Failed to fetch conversations.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching conversations.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  const fetchMessages = useCallback(
    async (convId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${apiBaseUrl}/admin/conversations/${convId}/messages?userId=${encodeURIComponent(currentUserId)}`,
          { cache: 'no-store' }
        );
        const json = await res.json();

        if (res.ok && json.success) {
          const messagesList = json.data?.messages || [];
          setCurrentMessages(messagesList);
          await fetchConversations();
        } else {
          setError(json.message || json.error || "Failed to fetch messages.");
        }
      } catch (err: any) {
        setError(err.message || "Network error fetching messages.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentUserId, fetchConversations]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const filteredConversations = useMemo(() => {
    return conversations
      .filter((conv) => {
        const participantsNames = conv.participants.map((p) => p.name.toLowerCase()).join(' ');
        const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';
        const subject = conv.title?.toLowerCase() || '';

        const matchesSearch =
          participantsNames.includes(searchTerm.toLowerCase()) ||
          lastMessageContent.includes(searchTerm.toLowerCase()) ||
          subject.includes(searchTerm.toLowerCase());

        const matchesReadStatus =
          filterReadStatus === 'All' ||
          (filterReadStatus === 'Read' && conv.unreadCount === 0) ||
          (filterReadStatus === 'Unread' && conv.unreadCount > 0);
        return matchesSearch && matchesReadStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.lastMessageAt || b.createdAt).getTime() -
          new Date(a.lastMessageAt || a.createdAt).getTime()
      );
  }, [conversations, searchTerm, filterReadStatus]);

  const unreadMessagesCount = conversations.filter((conv) => conv.unreadCount > 0).length;
  const selectedConversation = selectedConversationId
    ? conversations.find((conv) => conv.id === selectedConversationId)
    : null;

  // Identify recipient participant in active conversation
  const otherParticipant = selectedConversation?.participants.find((p) => p.id !== currentUserId);

  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    setActionSuccess(null);
    fetchMessages(convId);
  };

  const handleSendMessage = async () => {
    if (!newMessageContent.trim() || !selectedConversationId) return;

    setIsLoading(true);
    setError(null);
    setActionSuccess(null);

    const targetRecipient = otherParticipant;

    try {
      const res = await fetch(
        `${apiBaseUrl}/admin/conversations/${selectedConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            content: newMessageContent.trim(),
            messageType: 'TEXT',
            channel: selectedChannel,
            subject: emailSubject.trim() || undefined,
            recipientEmail: targetRecipient?.email,
            recipientPhone: targetRecipient?.phone || undefined,
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        setNewMessageContent('');
        setEmailSubject('');

        if (selectedChannel === 'EMAIL') {
          setActionSuccess(
            `Message logged and email dispatched to ${targetRecipient?.email || 'recipient'}!`
          );
        } else if (selectedChannel === 'WHATSAPP') {
          if (data.data?.whatsappUrl) {
            window.open(data.data.whatsappUrl, '_blank');
            setActionSuccess('Opening WhatsApp to send message...');
          } else {
            setActionSuccess('Message logged and dispatched via WhatsApp!');
          }
        }

        await fetchMessages(selectedConversationId);
      } else {
        setError(data.message || data.error || "Failed to send message.");
      }
    } catch (err: any) {
      setError(err.message || "Network error sending message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComposeNewConversation = async (formData: {
    recipientIds: string[];
    subject: string | null;
    message: string;
    messageType?: MessageData['messageType'];
    channel?: 'PLATFORM' | 'EMAIL' | 'WHATSAPP';
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const convRes = await fetch(`${apiBaseUrl}/admin/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: companyId,
          participantIds: formData.recipientIds,
          title: formData.subject,
        }),
      });

      if (!convRes.ok) throw new Error("Failed to create conversation.");
      const newConversation = await convRes.json();
      const newConversationId = newConversation.id || newConversation.data?.id;

      const msgRes = await fetch(
        `${apiBaseUrl}/admin/conversations/${newConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUserId,
            content: formData.message,
            messageType: formData.messageType || 'TEXT',
            channel: formData.channel || 'PLATFORM',
            subject: formData.subject,
          }),
        }
      );

      if (!msgRes.ok) throw new Error("Failed to send initial message.");
      const msgData = await msgRes.json();

      if (formData.channel === 'WHATSAPP' && msgData.data?.whatsappUrl) {
        window.open(msgData.data.whatsappUrl, '_blank');
      }

      setShowComposeModal(false);
      await fetchConversations();
      setSelectedConversationId(newConversationId);
      await fetchMessages(newConversationId);
    } catch (err: any) {
      setError(err.message || "Network error composing new message.");
    } finally {
      setIsLoading(false);
    }
  };

  const getConversationTitle = (conv: ConversationData) => {
    if (conv.title) return conv.title;
    const others = conv.participants.filter((p) => p.id !== currentUserId);
    if (others.length === 1) return others[0].name;
    return `Conversation (${conv.participants.length} participants)`;
  };

  const handleQuickWhatsApp = () => {
    if (!otherParticipant?.phone) {
      alert("No phone number found for this participant.");
      return;
    }
    const clean = otherParticipant.phone.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${clean}`, '_blank');
  };

  const handleQuickEmail = () => {
    setSelectedChannel('EMAIL');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Store Messages <span className="ml-2">💬</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Unified multi-channel communications for {companyName}. Reach customers via Platform, Email, or WhatsApp.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium flex items-center gap-2 shadow-sm">
          <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600">{today}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl shadow-sm border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Conversations
            </p>
            <h2 className="text-2xl font-bold text-gray-900">{conversations.length}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl shadow-sm border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <EnvelopeIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Unread Messages
            </p>
            <h2 className="text-2xl font-bold text-gray-900">{unreadMessagesCount}</h2>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-500 hover:text-emerald-800">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[550px]">
        {/* Inbox Sidebar */}
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col ${
            selectedConversationId ? 'hidden lg:flex' : 'flex'
          } lg:col-span-1`}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Inbox
            </h3>
            <button
              onClick={() => setShowComposeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
            >
              <PlusCircleIcon className="h-4 w-4" /> Compose
            </button>
          </div>

          <div className="space-y-3 mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select
              value={filterReadStatus}
              onChange={(e) => setFilterReadStatus(e.target.value)}
              className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-indigo-500"
            >
              <option value="All">All Messages</option>
              <option value="Read">Read</option>
              <option value="Unread">Unread</option>
            </select>
          </div>

          <div className="flex-grow space-y-2 overflow-y-auto custom-scrollbar pr-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    conv.id === selectedConversationId
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-sm ${
                        conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'
                      }`}
                    >
                      {getConversationTitle(conv)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {conv.lastMessage
                      ? `${conv.lastMessage.senderName}: ${conv.lastMessage.content}`
                      : 'No messages'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-400 py-8">No conversations found.</div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div
          className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${
            selectedConversationId ? 'flex' : 'hidden lg:flex'
          } lg:col-span-2 flex-col overflow-hidden`}
        >
          {selectedConversation ? (
            <>
              {/* Header with Participant Contact Actions */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversationId(null)}
                    className="lg:hidden p-1.5 text-gray-400 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {getConversationTitle(selectedConversation)}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 flex-wrap">
                      {otherParticipant?.email && (
                        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          ✉️ {otherParticipant.email}
                        </span>
                      )}
                      {otherParticipant?.phone && (
                        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          📱 {otherParticipant.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickEmail}
                    title="Send Email to customer"
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <span>✉️ Email</span>
                  </button>
                  {otherParticipant?.phone && (
                    <button
                      onClick={handleQuickWhatsApp}
                      title="Open WhatsApp chat"
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <span>📱 WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-grow p-6 overflow-y-auto custom-scrollbar flex flex-col-reverse bg-gray-50/30">
                <div ref={messagesEndRef} />
                {[...currentMessages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex mb-4 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${
                        msg.senderId === currentUserId
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        {msg.senderId !== currentUserId && (
                          <p className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">
                            {msg.senderName}
                          </p>
                        )}
                        {msg.channel === 'EMAIL' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-100/30 text-amber-300 font-semibold rounded">
                            ✉️ Sent via Email
                          </span>
                        )}
                        {msg.channel === 'WHATSAPP' && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100/30 text-emerald-300 font-semibold rounded">
                            📱 Sent via WhatsApp
                          </span>
                        )}
                      </div>

                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                      <p
                        className={`text-[10px] mt-1.5 text-right ${
                          msg.senderId === currentUserId ? 'text-indigo-200' : 'text-gray-400'
                        }`}
                      >
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Multi-Channel Composer */}
              <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                {/* Channel Selector Pills */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
                    Send via:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('PLATFORM')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selectedChannel === 'PLATFORM'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>💬 Platform Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('EMAIL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selectedChannel === 'EMAIL'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>✉️ Direct Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('WHATSAPP')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      selectedChannel === 'WHATSAPP'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>📱 WhatsApp</span>
                  </button>
                </div>

                {/* Channel-Specific Context Prompts */}
                {selectedChannel === 'EMAIL' && (
                  <div className="p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-amber-900 font-medium">
                      <span>✉️ Email will be delivered directly to: <strong>{otherParticipant?.email || 'N/A'}</strong></span>
                      <span className="text-[10px] text-amber-700">From: {companyName}</span>
                    </div>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Email subject (optional, defaults to conversation title)"
                      className="w-full px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                )}

                {selectedChannel === 'WHATSAPP' && (
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-medium">
                    <span>
                      📱 Message will open directly in WhatsApp for: <strong>{otherParticipant?.phone || 'No phone on file'}</strong>
                    </span>
                    <span className="text-[10px] text-emerald-700">Logs in platform thread</span>
                  </div>
                )}

                {/* Textarea & Send Button */}
                <div className="flex items-end gap-3">
                  <textarea
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder={
                      selectedChannel === 'EMAIL'
                        ? "Write email message to customer..."
                        : selectedChannel === 'WHATSAPP'
                        ? "Write WhatsApp message..."
                        : "Type a platform message..."
                    }
                    rows={2}
                    className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-32"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessageContent.trim() || isLoading}
                    className={`p-3.5 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
                      selectedChannel === 'EMAIL'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : selectedChannel === 'WHATSAPP'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <PaperAirplaneIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4 text-gray-200" />
              <p className="text-base font-medium text-gray-500">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>

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