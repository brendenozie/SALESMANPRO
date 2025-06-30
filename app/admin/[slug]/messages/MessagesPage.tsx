'use client';

import React, { useState, useMemo } from 'react';
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
} from '@heroicons/react/24/outline';

// Sample Data for Messages
const currentUser = { id: 'TEACHER001', name: 'Mr. John Doe', role: 'Teacher' };

const sampleMessages = [
  {
    id: 'MSG001',
    senderId: 'STUDENT001',
    senderName: 'Jane Wanjiru (G8)',
    subject: 'Question about Assignment 3',
    timestamp: '2025-06-25T14:30:00Z',
    isRead: false,
    type: 'Student Inquiry', // Tag
    conversation: [
      { sender: 'Jane Wanjiru', content: 'Hi Mr. Doe, I had a question about problem 5 on Assignment 3. Can you please clarify?', timestamp: '2025-06-25T14:30:00Z' },
    ],
  },
  {
    id: 'MSG002',
    senderId: 'PARENT001',
    senderName: 'Mr. Alex Smith (Parent of Alice)',
    subject: 'Request for Meeting',
    timestamp: '2025-06-24T10:00:00Z',
    isRead: true,
    type: 'Parent Communication',
    conversation: [
      { sender: 'Mr. Alex Smith', content: 'Good morning Mr. Doe, I would like to schedule a brief meeting to discuss Alice\'s progress in your class. When are you available next week?', timestamp: '2025-06-24T10:00:00Z' },
      { sender: 'You', content: 'Good morning Mr. Smith, I am available on Tuesday or Thursday afternoon. Please let me know which works best for you.', timestamp: '2025-06-24T10:30:00Z' },
    ],
  },
  {
    id: 'MSG003',
    senderId: 'TEACHER002',
    senderName: 'Mrs. Jane Smith (English Dept.)',
    subject: 'New Curriculum Materials',
    timestamp: '2025-06-23T09:15:00Z',
    isRead: false,
    type: 'Internal',
    conversation: [
      { sender: 'Mrs. Jane Smith', content: 'Hi John, the new English curriculum materials are now uploaded to the shared drive. Take a look when you get a chance!', timestamp: '2025-06-23T09:15:00Z' },
    ],
  },
  {
    id: 'MSG004',
    senderId: 'ADMIN001',
    senderName: 'Principal\'s Office',
    subject: 'Reminder: Faculty Meeting',
    timestamp: '2025-06-22T16:00:00Z',
    isRead: true,
    type: 'Announcement',
    conversation: [
      { sender: 'Principal\'s Office', content: 'This is a reminder that the monthly faculty meeting is scheduled for Friday, June 28th, at 3:00 PM in the Auditorium. Attendance is mandatory.', timestamp: '2025-06-22T16:00:00Z' },
    ],
  },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(sampleMessages);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterReadStatus, setFilterReadStatus] = useState('All');

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const uniqueMessageTypes = useMemo(() => Array.from(new Set(messages.map(msg => msg.type))).sort(), [messages]);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          msg.conversation.some(chat => chat.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'All' || msg.type === filterType;
    const matchesReadStatus = filterReadStatus === 'All' ||
                              (filterReadStatus === 'Read' && msg.isRead) ||
                              (filterReadStatus === 'Unread' && !msg.isRead);
    return matchesSearch && matchesType && matchesReadStatus;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by most recent message

  const unreadMessagesCount = messages.filter(msg => !msg.isRead).length;

  const selectedMessage = selectedMessageId ? messages.find(msg => msg.id === selectedMessageId) : null;

  const handleSelectMessage = (id: string) => {
    setSelectedMessageId(id);
    // Mark as read when selected
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === id ? { ...msg, isRead: true } : msg
      )
    );
  };

  const handleSendMessage = () => {
    if (!newMessageContent.trim() || !selectedMessage) return;

    const newReply = {
      sender: currentUser.name,
      content: newMessageContent.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === selectedMessage.id
          ? {
              ...msg,
              conversation: [...msg.conversation, newReply],
              timestamp: newReply.timestamp, // Update conversation timestamp
              isRead: true, // Mark as read by current user (since they replied)
            }
          : msg
      )
    );
    setNewMessageContent('');
  };

  const handleComposeNewMessage = (formData: { recipient: string; subject: string; message: string; type?: string }) => {
    const newId = `MSG${String(messages.length + 1).padStart(3, '0')}`;
    const newMsg = {
      id: newId,
      senderId: currentUser.id, // Assuming current user is sender of new message
      senderName: currentUser.name,
      subject: formData.subject,
      timestamp: new Date().toISOString(),
      isRead: true, // User composed it, so it's read by them
      type: formData.type || 'General',
      conversation: [{ sender: currentUser.name, content: formData.message, timestamp: new Date().toISOString() }],
    };
    setMessages(prevMessages => [newMsg, ...prevMessages]); // Add to top of list
    setShowComposeModal(false);
    setSelectedMessageId(newId); // Select the newly composed message
  };

  // --- Compose New Message Modal ---
  type ComposeMessageModalProps = {
    onClose: () => void;
    onSend: (formData: { recipient: string; subject: string; message: string; type?: string }) => void;
  };
  const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({ onClose, onSend }) => {
    const [formData, setFormData] = useState({
      recipient: '', subject: '', message: '', type: 'General'
    });

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSend(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Compose New Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Recipient (e.g., Student Name, Parent Name, Teacher Name)</label>
              <input type="text" name="recipient" id="recipient" value={formData.recipient} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Message Type</label>
              <select name="type" id="type" value={formData.type} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2">
                <option value="General">General</option>
                <option value="Student Inquiry">Student Inquiry</option>
                <option value="Parent Communication">Parent Communication</option>
                <option value="Internal">Internal (Staff)</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea name="message" id="message" value={formData.message} onChange={handleChange} required rows={5}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
              </button>
              <button type="submit"
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // --- End Compose New Message Modal ---

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-100 min-h-screen font-sans">
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
            <h2 className="text-3xl font-bold text-gray-800">{messages.length}</h2>
          </div>
        </div>
        <div className="p-5 rounded-xl shadow-md border border-gray-200 bg-red-50 flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <EnvelopeIcon className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Unread Messages</p>
            <h2 className="text-3xl font-bold text-gray-800">{unreadMessagesCount}</h2>
          </div>
        </div>
      </div>

      {/* Main Message Area (Two Columns on larger screens, Stacked on smaller) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Message List / Inbox */}
        <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${selectedMessageId ? 'hidden lg:block' : 'block'}`}>
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
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500
                           focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="flex-shrink-0 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="All">All Types</option>
                {uniqueMessageTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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

          {/* Message List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar"> {/* Added custom-scrollbar */}
            {filteredMessages.length > 0 ? (
              filteredMessages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors duration-150 border
                    ${msg.id === selectedMessageId ? 'bg-indigo-50 border-indigo-300 shadow-md' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                    ${!msg.isRead ? 'font-semibold' : 'font-normal'}
                  `}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-800">{msg.senderName}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-base text-gray-900 mb-1 line-clamp-1">{msg.subject}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {msg.conversation[msg.conversation.length - 1].content}
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${msg.type === 'Student Inquiry' ? 'bg-blue-100 text-blue-800' : msg.type === 'Parent Communication' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {msg.type}
                    </span>
                    {!msg.isRead ? (
                        <EnvelopeIcon className="h-4 w-4 text-red-500" title="Unread" />
                    ) : (
                        <EnvelopeOpenIcon className="h-4 w-4 text-gray-400" title="Read" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-6">No messages found.</div>
            )}
          </div>
        </div>

        {/* Right Column: Message Detail / Conversation View */}
        <div className={`bg-white rounded-xl shadow-md border border-gray-200 ${selectedMessageId ? 'block' : 'hidden lg:block'} lg:col-span-2 flex flex-col`}>
          {selectedMessage ? (
            <>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedMessageId(null)}
                  className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition mr-3"
                  title="Back to Inbox"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-600">From: {selectedMessage.senderName}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 text-sm text-gray-500">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${selectedMessage.type === 'Student Inquiry' ? 'bg-blue-100 text-blue-800' : selectedMessage.type === 'Parent Communication' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {selectedMessage.type}
                    </span>
                </div>
              </div>

              {/* Conversation History */}
              <div className="flex-grow p-6 space-y-4 overflow-y-auto custom-scrollbar">
                {selectedMessage.conversation.map((chat, idx) => (
                  <div key={idx} className={`flex ${chat.sender === currentUser.name ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs sm:max-w-md p-3 rounded-lg shadow-sm
                      ${chat.sender === currentUser.name ? 'bg-indigo-100 text-indigo-900 ml-auto' : 'bg-gray-100 text-gray-800 mr-auto'}
                    `}>
                      <p className="font-semibold text-sm mb-1">{chat.sender === currentUser.name ? 'You' : chat.sender}</p>
                      <p className="text-sm">{chat.content}</p>
                      <p className="text-xs text-gray-500 text-right mt-1">
                        {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessageContent.trim()}
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
              <p className="text-lg font-semibold">Select a message to view the conversation</p>
              <p className="text-sm mt-2">Or click "Compose" to start a new message.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showComposeModal && <ComposeMessageModal onClose={() => setShowComposeModal(false)} onSend={handleComposeNewMessage} />}
    </div>
  );
}
