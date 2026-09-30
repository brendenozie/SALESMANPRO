'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  TicketIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import POSOperatorModal from '@/components/pos/POSOperatorModal';
import POSSessionHeader from '@/components/pos/POSSessionHeader';
import POSCustomerSelector from '@/components/pos/POSCustomerSelector';
import type { POSCustomerRecord, POSOperatorInfo, POSSessionInfo } from '@/types/pos';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

interface AdminPOSClientProps {
  companyId: string;
}

export default function AdminPOSClient({ companyId }: AdminPOSClientProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [availableTickets, setAvailableTickets] = useState<any[]>([]);
  const [cart, setCart] = useState<{ ticketProductId: string; quantity: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // POS Session & Operator State
  const [operator, setOperator] = useState<POSOperatorInfo | null>(null);
  const [posSession, setPosSession] = useState<POSSessionInfo | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);

  // POS Customer State
  const [currentCustomer, setCurrentCustomer] = useState<POSCustomerRecord | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch(`/api/pos/session?companyId=${encodeURIComponent(companyId)}&terminalId=T01`);
        const data = await res.json();
        const sessionData = data.data || data.session;
        if (res.ok && sessionData) {
          if (sessionData.operator) {
            setOperator(sessionData.operator);
          }
          setPosSession({
            id: sessionData.id,
            terminalId: sessionData.terminalId,
            status: sessionData.status,
            openedAt: sessionData.openedAt,
          });
          setShowAuthModal(false);
        }
      } catch (err) {
        console.error("Failed to check active POS session", err);
      }
    }
    checkSession();
  }, [companyId]);

  const handleOperatorAuthenticated = (data: { operator: POSOperatorInfo; posSession: POSSessionInfo }) => {
    setOperator(data.operator);
    setPosSession(data.posSession);
    setShowAuthModal(false);
  };

  const handleSessionEnded = () => {
    setOperator(null);
    setPosSession(null);
    setCurrentCustomer(null);
    setCart([]);
    setShowAuthModal(true);
  };

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/events?limit=100');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const eventItems = Array.isArray(data) ? data : data.data || data.events || [];
        setEvents(
          eventItems.map((e: any) => ({
            id: e.id,
            title: e.title || e.name || 'Untitled Event',
            startDateTime: e.date || e.startDateTime || e.createdAt || new Date().toISOString(),
          }))
        );
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events.');
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [companyId]);

  // Fetch tickets for selected event
  useEffect(() => {
    const fetchTickets = async () => {
      if (!selectedEventId) {
        setAvailableTickets([]);
        return;
      }
      setIsLoadingTickets(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/events/${selectedEventId}/tickets`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const ticketsList = Array.isArray(data) ? data : data.data || data.tickets || [];
        setAvailableTickets(
          ticketsList.map((t: any) => ({
            id: t.id,
            type: t.name || t.ticketType || 'Standard',
            price: Number(t.price || 0),
            remaining: Math.max(0, (t.quantityTotal ?? t.quantityAvailable ?? 0) - (t.quantitySold || 0)),
          }))
        );
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tickets for event.');
      } finally {
        setIsLoadingTickets(false);
      }
    };

    if (selectedEventId) {
      fetchTickets();
    }
  }, [selectedEventId, companyId]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const hasEventsToSelect = events.length > 0;

  const handleAddTicket = (ticketProductId: string, price: number, available: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.ticketProductId === ticketProductId);
      if (existingItem) {
        if (existingItem.quantity < available) {
          return prevCart.map((item) =>
            item.ticketProductId === ticketProductId ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          setMessage('Maximum available tickets reached for this type.');
          setTransactionStatus('error');
          return prevCart;
        }
      }
      return [...prevCart, { ticketProductId, quantity: 1 }];
    });
    setTransactionStatus('idle');
  };

  const handleRemoveTicket = (ticketProductId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.ticketProductId === ticketProductId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.ticketProductId === ticketProductId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart.filter((item) => item.ticketProductId !== ticketProductId);
    });
    setTransactionStatus('idle');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const ticket = availableTickets.find((t) => t.id === item.ticketProductId);
      return total + (ticket ? ticket.price * item.quantity : 0);
    }, 0);
  };

  const handleProcessSale = async () => {
    const activeName = currentCustomer?.name || customerName || "Box Office Walk-in";
    const activeEmail = currentCustomer?.email || customerEmail || "walkin@boxoffice.local";
    if (!selectedEventId || cart.length === 0 || !paymentMethod) {
      setTransactionStatus('error');
      setMessage('Please select event, tickets, and payment method.');
      return;
    }

    setIsProcessingSale(true);
    setTransactionStatus('idle');
    setMessage('');
    setError(null);

    try {
      const pMethod = paymentMethod.toLowerCase().includes('cash')
        ? 'cash'
        : paymentMethod.toLowerCase().includes('card')
        ? 'card'
        : 'pos';

      const response = await fetch('/api/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          companyId,
          buyer: {
            id: currentCustomer?.id || undefined,
            name: activeName,
            email: activeEmail,
            phone: currentCustomer?.phone || undefined,
          },
          tickets: cart.map((item) => ({
            ticketId: item.ticketProductId,
            quantity: item.quantity,
          })),
          paymentMethod: pMethod,
          posSessionId: posSession?.id || undefined,
          operatorId: operator?.id || undefined,
          cashierName: operator?.name || "Cashier",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const totalAmt = result.data?.totalAmount ?? result.totalAmount ?? calculateTotal();
      setTransactionStatus('success');
      setMessage(result.message || `Sale of $${Number(totalAmt).toFixed(2)} processed successfully! Tickets issued.`);

      // Reset cart and selection, preserve currentCustomer for reuse across session
      setSelectedEventId('');
      setCart([]);
      setPaymentMethod('');

      // Refresh events list
      const eventsResponse = await fetch('/api/admin/events?limit=100');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const eventItems = Array.isArray(eventsData) ? eventsData : eventsData.data || eventsData.events || [];
        setEvents(
          eventItems.map((e: any) => ({
            id: e.id,
            title: e.title || e.name || 'Untitled Event',
            startDateTime: e.date || e.startDateTime || e.createdAt || new Date().toISOString(),
          }))
        );
      }
    } catch (err: any) {
      setTransactionStatus('error');
      setMessage(err.message || 'Failed to process sale.');
      setError(err.message || 'Failed to process sale.');
    } finally {
      setIsProcessingSale(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans relative overflow-hidden flex flex-col">
      {/* POS SESSION OPERATOR HEADER */}
      <POSSessionHeader
        companyId={companyId}
        operator={operator}
        posSession={posSession}
        companyName="Event POS"
        onLockTerminal={() => setShowAuthModal(true)}
        onEndSession={handleSessionEnded}
      />

      <div className="p-8 sm:p-12 relative overflow-hidden flex-1">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-1000"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-3000"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-4xl sm:text-5xl font-black tracking-tighter text-white mb-4"
        >
          Point of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Sale (POS)</span>
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-300 mb-12"
        >
          Quickly sell tickets and manage on-site transactions.
        </motion.p>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event & Ticket Selection */}
          <div className="lg:col-span-2">
            <motion.div variants={formItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <label htmlFor="event-select" className="block text-gray-300 text-sm font-bold mb-2">
                Select Event
              </label>
              <div className="relative mb-6">
                <select
                  id="event-select"
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setCart([]);
                  }}
                  className="block w-full bg-gray-900 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-700 focus:border-indigo-500 appearance-none"
                  disabled={!hasEventsToSelect || isLoadingEvents}
                >
                  <option value="">
                    {isLoadingEvents
                      ? '-- Loading Events --'
                      : hasEventsToSelect
                      ? '-- Choose an Event --'
                      : '-- No Events Available --'}
                  </option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({new Date(event.startDateTime).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {isLoadingEvents && (
              <div className="text-center py-8 text-gray-400 italic flex flex-col items-center bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
                <ArrowPathIcon className="w-12 h-12 mb-4 animate-spin text-indigo-500" />
                <p>Loading events...</p>
              </div>
            )}

            {!isLoadingEvents && !hasEventsToSelect && (
              <div className="text-center py-8 text-gray-400 italic flex flex-col items-center bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
                <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                <p>No events are available for POS sales.</p>
                <p className="text-sm">Please create events in the "Events" section first.</p>
              </div>
            )}

            {selectedEvent && (
              <motion.div variants={formItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <TicketIcon className="w-6 h-6 text-purple-400 mr-2" /> Available Tickets for {selectedEvent.title}
                </h3>
                {isLoadingTickets ? (
                  <div className="text-center py-8 text-gray-400 italic flex flex-col items-center bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
                    <ArrowPathIcon className="w-12 h-12 mb-4 animate-spin text-indigo-500" />
                    <p>Loading tickets...</p>
                  </div>
                ) : availableTickets.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {availableTickets.map((ticket) => (
                      <div key={ticket.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{ticket.type}</p>
                          <p className="text-gray-400 text-sm">${ticket.price.toFixed(2)}</p>
                          <p className="text-gray-500 text-xs">{ticket.remaining} available</p>
                        </div>
                        <button
                          onClick={() => handleAddTicket(ticket.id, ticket.price, ticket.remaining)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={ticket.remaining <= 0}
                        >
                          Add <ShoppingCartIcon className="ml-2 w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 italic flex flex-col items-center bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
                    <ExclamationCircleIcon className="w-12 h-12 mb-4 text-gray-600" />
                    <p>No ticket types defined for this event.</p>
                    <p className="text-sm">Please add ticket types in the "Tickets" section.</p>
                  </div>
                )}
              </motion.div>
            )}

            {!selectedEvent && hasEventsToSelect && !isLoadingEvents && (
              <div className="text-center py-8 text-gray-400 italic flex flex-col items-center bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
                <CalendarIcon className="w-12 h-12 mb-4 text-gray-600" />
                <p>Select an event from the dropdown above to start selling tickets.</p>
              </div>
            )}

            {/* Customer Details */}
            <motion.div variants={formItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <UsersIcon className="w-6 h-6 text-pink-400 mr-2" /> Customer Details
              </h3>
              <div className="mb-6">
                <POSCustomerSelector
                  companyId={companyId}
                  selectedCustomer={currentCustomer}
                  onSelectCustomer={(cust) => {
                    setCurrentCustomer(cust);
                    if (cust) {
                      setCustomerName(cust.name);
                      setCustomerEmail(cust.email || '');
                    } else {
                      setCustomerName('');
                      setCustomerEmail('');
                    }
                  }}
                  required={false}
                />
              </div>
            </motion.div>

          </div>

          {/* Cart & Payment Summary */}
          <div className="lg:col-span-1 bg-gray-900 p-6 rounded-2xl shadow-inner border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <ShoppingCartIcon className="w-6 h-6 text-indigo-400 mr-2" /> Order Summary
            </h3>
            {cart.length === 0 ? (
              <p className="text-gray-400 italic mb-6 text-center">Cart is empty. Add tickets to proceed.</p>
            ) : (
              <ul className="space-y-3 mb-6">
                {cart.map((item) => {
                  const ticket = availableTickets.find((t) => t.id === item.ticketProductId);
                  if (!ticket) return null;
                  return (
                    <li key={item.ticketProductId} className="flex items-center justify-between text-gray-300">
                      <span>
                        {ticket.type} (x{item.quantity})
                      </span>
                      <div className="flex items-center gap-2">
                        <span>${(ticket.price * item.quantity).toFixed(2)}</span>
                        <button onClick={() => handleRemoveTicket(ticket.id)} className="text-red-400 hover:text-red-500">
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="border-t border-gray-700 pt-4 mt-4">
              <div className="flex justify-between items-center text-2xl font-bold text-white mb-6">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <motion.div variants={formItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
              <label htmlFor="payment-method" className="block text-gray-300 text-sm font-bold mb-2">
                Payment Method
              </label>
              <div className="relative mb-6">
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="block w-full bg-gray-800 border border-gray-700 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-gray-700 focus:border-indigo-500 appearance-none"
                  disabled={cart.length === 0 || isProcessingSale}
                >
                  <option value="">-- Select Method --</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Pay">Mobile Pay</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            <motion.button
              onClick={handleProcessSale}
              disabled={
                !hasEventsToSelect ||
                cart.length === 0 ||
                !selectedEventId ||
                !customerName ||
                !customerEmail ||
                !paymentMethod ||
                isProcessingSale
              }
              className="inline-flex items-center justify-center w-full py-4 px-6 text-lg font-semibold bg-green-600 text-white rounded-xl
                         hover:bg-green-700 transition-colors duration-300 shadow-lg hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900
                         disabled:opacity-50 disabled:cursor-not-allowed"
              initial="hidden"
              animate="visible"
              variants={formItemVariants}
              transition={{ delay: 0.7 }}
            >
              {isProcessingSale ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 mr-3 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  Process Sale <ArrowRightIcon className="ml-3 w-5 h-5" />
                </>
              )}
            </motion.button>

            {transactionStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                  transactionStatus === 'success'
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-red-900/50 text-red-300 border border-red-700'
                }`}
              >
                {transactionStatus === 'success' ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <XCircleIcon className="w-6 h-6" />
                )}
                <p>{message}</p>
              </motion.div>
            )}
            {error && transactionStatus === 'error' && (
              <div className="mt-4 text-red-400 text-sm text-center">
                <p>Error: {error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* POS OPERATOR AUTH MODAL */}
      <POSOperatorModal
        isOpen={showAuthModal}
        companyId={companyId}
        terminalId={posSession?.terminalId || "T01"}
        storeName="Event POS"
        onSuccess={handleOperatorAuthenticated}
      />
    </div>
  );
}