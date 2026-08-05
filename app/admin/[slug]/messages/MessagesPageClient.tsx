'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

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
  createdAt: string; 
};

export type ParticipantData = {
  id: string; 
  name: string;
  email: string;
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
};

interface MessagesPageProps {
  initialConversations: ConversationData[];
  allUsers: UserData[];
  currentUserId: string;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const allParticipantIds = Array.from(new Set([...formData.recipientIds, currentUserId]));

    onSend({
      recipientIds: allParticipantIds,
      subject: formData.subject.trim() === '' ? null : formData.subject.trim(),
      message: formData.message.trim(),
      messageType: formData.messageType,
    });
  };

  const availableRecipients = allUsers.filter(user => user.id !== currentUserId);

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients <span className="text-red-500">*</span></label>
            <select multiple name="recipientIds" value={formData.recipientIds} onChange={handleRecipientChange} required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white h-32 custom-scrollbar"
            >
              {availableRecipients.map(user => (
                <option key={user.id} value={user.id} className="p-1">{user.name} ({user.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject (Optional)</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
            <textarea name="message" value={formData.message} onChange={handleChange} required rows={4}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="px-5 py-2.5 bg-indigo-600 rounded-lg text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70">
              {isLoading ? 'Sending...' : 'Send Message'}
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
  const [isLoading, setIsLoading] = useState(false);
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
      // FIX: Removed invalid Next.js client-side revalidate tag, replaced with no-store to ensure fresh data
      const res = await fetch(`${apiBaseUrl}/admin/conversations?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`, {
        cache: 'no-store'
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
      const res = await fetch(`${apiBaseUrl}/admin/conversations/${convId}/messages?userId=${encodeURIComponent(currentUserId)}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentMessages(data.messages);
        await fetchConversations(); 
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to fetch messages.");
      }
    } catch (err: any) {
      setError(err.message || "Network error fetching messages.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, fetchConversations]);

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
          messageType: 'TEXT', 
        }),
      });

      if (res.ok) {
        setNewMessageContent('');
        await fetchMessages(selectedConversationId); 
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
      const newConversationId = newConversation.id;

      const msgRes = await fetch(`${apiBaseUrl}/admin/conversations/${newConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          content: formData.message,
          messageType: formData.messageType,
        }),
      });

      if (!msgRes.ok) throw new Error("Failed to send initial message.");

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
    const otherParticipants = conv.participants.filter(p => p.id !== currentUserId);
    if (otherParticipants.length === 1) return otherParticipants[0].name;
    return `Conversation (${conv.participants.length} participants)`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50/50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Messages <span className="ml-2">💬</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Your central hub for message communications.</p>
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
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Conversations</p>
            <h2 className="text-2xl font-bold text-gray-900">{conversations.length}</h2>
          </div>
        </div>
        <div className="p-5 rounded-2xl shadow-sm border border-gray-200 bg-white flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <EnvelopeIcon className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unread Messages</p>
            <h2 className="text-2xl font-bold text-gray-900">{unreadMessagesCount}</h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-sm font-medium">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)] min-h-[500px]">
        
        {/* Inbox Sidebar */}
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col ${selectedConversationId ? 'hidden lg:flex' : 'flex'} lg:col-span-1`}>
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
                placeholder="Search..."
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
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border
                    ${conv.id === selectedConversationId ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {getConversationTitle(conv)}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {conv.lastMessage ? `${conv.lastMessage.senderName}: ${conv.lastMessage.content}` : 'No messages'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-gray-400 py-8">No conversations found.</div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${selectedConversationId ? 'flex' : 'hidden lg:flex'} lg:col-span-2 flex-col overflow-hidden`}>
          {selectedConversation ? (
            <>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedConversationId(null)} className="lg:hidden p-1.5 text-gray-400 hover:text-gray-900">
                    <ArrowLeftIcon className="h-5 w-5" />
                  </button>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{getConversationTitle(selectedConversation)}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.participants.length} Participant(s)
                    </p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-50">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-grow p-6 overflow-y-auto custom-scrollbar flex flex-col-reverse bg-gray-50/30">
                <div ref={messagesEndRef} />
                {[...currentMessages].reverse().map((msg) => (
                  <div key={msg.id} className={`flex mb-4 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl
                      ${msg.senderId === currentUserId ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}
                    `}>
                      {msg.senderId !== currentUserId && (
                         <p className="font-bold text-[10px] text-gray-400 mb-1 uppercase tracking-wider">{msg.senderName}</p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 text-right ${msg.senderId === currentUserId ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-gray-100 flex items-end gap-3">
                <textarea
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  rows={1}
                  className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none max-h-32"
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
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ChatBubbleLeftRightIcon className="h-16 w-16 mb-4 text-gray-200" />
              <p className="text-base font-medium text-gray-500">Select a conversation to start chatting</p>
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