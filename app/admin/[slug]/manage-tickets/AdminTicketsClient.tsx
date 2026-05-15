"use client";

// =========================================================
// app/admin/[slug]/tickets/AdminTicketsClient.tsx
// =========================================================

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  PlusCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TicketIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import TicketModal from "./TicketModal";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:3000/api";

// =========================================================
// TYPES
// =========================================================

interface Event {
  id: string;
  title: string;
  startDateTime: string;
}

interface Ticket {
  id: string;

  eventId: string;

  event?: {
    id: string;
    title: string;
    startDateTime: string;
  };

  name: string;
  description?: string;

  ticketType: string;

  price: number;
  currency: string;

  quantityTotal: number;
  quantitySold: number;

  remainingTickets: number;

  minPerOrder: number;
  maxPerOrder?: number;

  isActive: boolean;
  isVisible: boolean;

  salesStartDate?: string;
  salesEndDate?: string;

  perks?: string[];

  colorHex?: string;
}

interface Props {
  slug: string;
  events: Event[];
}

// =========================================================
// COMPONENT
// =========================================================

export default function AdminTicketsClient({
  slug,
  events,
}: Props) {
  const [selectedEventId, setSelectedEventId] =
    useState("");

  const [tickets, setTickets] = useState<
    Ticket[]
  >([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingTicket, setEditingTicket] =
    useState<Ticket | null>(null);

  const [deleteModal, setDeleteModal] =
    useState<{
      open: boolean;
      ticketId?: string;
    }>({
      open: false,
    });

  // =========================================================
  // FETCH TICKETS
  // =========================================================

  const fetchTickets = async (
    eventId: string,
  ) => {
    if (!eventId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${apiBaseUrl}/admin/events/${eventId}/tickets?companyId=${slug}`,
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch tickets",
        );
      }

      const data =
        await response.json();

      setTickets(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // EVENT CHANGE
  // =========================================================

  useEffect(() => {
    if (events?.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  useEffect(() => {
    if (selectedEventId) {
      fetchTickets(selectedEventId);
    }
  }, [selectedEventId]);

  // =========================================================
  // FILTERED TICKETS
  // =========================================================

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      return (
        ticket.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase(),
          ) ||
        ticket.ticketType
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase(),
          )
      );
    });
  }, [tickets, searchTerm]);

  // =========================================================
  // OPEN MODAL
  // =========================================================

  const handleAddTicket = () => {
    setEditingTicket(null);

    setIsModalOpen(true);
  };

  const handleEditTicket = (
    ticket: Ticket,
  ) => {
    setEditingTicket(ticket);

    setIsModalOpen(true);
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSaveTicket =
    async (payload: any) => {
      try {
        setSaving(true);

        const isEditing =
          !!editingTicket;

        const url = isEditing
          ? `${apiBaseUrl}/admin/tickets/${editingTicket.id}`
          : `${apiBaseUrl}/admin/events/${selectedEventId}/tickets`;

        const method = isEditing
          ? "PATCH"
          : "POST";

        const response = await fetch(
          url,
          {
            method,

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              ...payload,
              companyId: slug,
            }),
          },
        );

        if (!response.ok) {
          const error =
            await response.json();

          throw new Error(
            error.message ||
              "Failed to save ticket",
          );
        }

        await fetchTickets(
          selectedEventId,
        );

        setIsModalOpen(false);

        setEditingTicket(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    };

  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete =
    async () => {
      try {
        if (!deleteModal.ticketId)
          return;

        const response = await fetch(
          `${apiBaseUrl}/admin/tickets/${deleteModal.ticketId}`,
          {
            method: "DELETE",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to delete ticket",
          );
        }

        setTickets((prev) =>
          prev.filter(
            (t) =>
              t.id !==
              deleteModal.ticketId,
          ),
        );

        setDeleteModal({
          open: false,
        });
      } catch (err: any) {
        setError(err.message);
      }
    };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Event Tickets
            </h1>

            <p className="text-gray-400 mt-2">
              Create and manage
              event ticket inventory
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            onClick={
              handleAddTicket
            }
            disabled={
              !selectedEventId
            }
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition font-semibold"
          >
            <PlusCircleIcon className="w-5 h-5" />

            Add Ticket
          </motion.button>
        </div>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 mb-8">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* EVENT SELECT */}

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Select Event
              </label>

              <div className="relative">

                <CalendarDaysIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <select
                  value={
                    selectedEventId
                  }
                  onChange={(e) =>
                    setSelectedEventId(
                      e.target.value,
                    )
                  }
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500"
                >
                  {events.map(
                    (event) => (
                      <option
                        key={
                          event.id
                        }
                        value={
                          event.id
                        }
                      >
                        {
                          event.title
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            {/* SEARCH */}

            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Search Tickets
              </label>

              <div className="relative">

                <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value,
                    )
                  }
                  placeholder="Search by ticket name or type..."
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="mb-6 bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-2xl flex items-center gap-3"
            >
              <ExclamationCircleIcon className="w-5 h-5" />

              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden">

          {loading ? (
            <div className="h-96 flex items-center justify-center">

              <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-500" />

            </div>
          ) : filteredTickets.length ===
            0 ? (
            <div className="h-96 flex flex-col items-center justify-center text-center p-10">

              <TicketIcon className="w-16 h-16 text-gray-700 mb-4" />

              <h3 className="text-2xl font-bold mb-2">
                No Tickets Found
              </h3>

              <p className="text-gray-500 max-w-md">
                This event does not
                have tickets yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-gray-950 border-b border-gray-800">

                  <tr>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                      Ticket
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                      Price
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                      Inventory
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                      Sold
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">
                      Remaining
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredTickets.map(
                    (ticket) => (
                      <tr
                        key={ticket.id}
                        className="border-b border-gray-800 hover:bg-gray-800/40 transition"
                      >

                        <td className="px-6 py-5">

                          <div>
                            <h4 className="font-semibold">
                              {
                                ticket.name
                              }
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              {
                                ticket.description
                              }
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-5">

                          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
                            {
                              ticket.ticketType
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5 font-semibold">
                          {
                            ticket.currency
                          }{" "}
                          {ticket.price.toLocaleString()}
                        </td>

                        <td className="px-6 py-5">
                          {
                            ticket.quantityTotal
                          }
                        </td>

                        <td className="px-6 py-5 text-orange-300">
                          {
                            ticket.quantitySold
                          }
                        </td>

                        <td className="px-6 py-5">

                          <span
                            className={`font-bold ${
                              ticket.remainingTickets <=
                              10
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          >
                            {
                              ticket.remainingTickets
                            }
                          </span>
                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() =>
                                handleEditTicket(
                                  ticket,
                                )
                              }
                              className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition"
                            >
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteModal(
                                  {
                                    open: true,
                                    ticketId:
                                      ticket.id,
                                  },
                                )
                              }
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 transition"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================================================= */}
      {/* MODAL */}
      {/* ================================================= */}

      <TicketFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);

          setEditingTicket(null);
        }}
        onSave={handleSaveTicket}
        isSaving={saving}
        ticket={editingTicket}
      />

      {/* ================================================= */}
      {/* DELETE */}
      {/* ================================================= */}

      <TicketModal
        isOpen={deleteModal.open}
        onClose={() =>
          setDeleteModal({
            open: false,
          })
        }
        title="Delete Ticket"
        description="Are you sure you want to delete this ticket?"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={false}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// =========================================================
// FORM MODAL
// =========================================================

function TicketFormModal({
  isOpen,
  onClose,
  onSave,
  isSaving,
  ticket,
}: any) {
  const [form, setForm] =
    useState<any>({
      name: "",
      description: "",

      ticketType:
        "REGULAR",

      price: 0,

      currency: "KES",

      quantityTotal: 100,

      minPerOrder: 1,

      maxPerOrder: 10,

      isActive: true,

      isVisible: true,

      perks: [],
    });

  useEffect(() => {
    if (ticket) {
      setForm({
        ...ticket,
      });
    }
  }, [ticket]);

  useEffect(() => {
    if (!ticket) {
      setForm({
        name: "",
        description: "",

        ticketType:
          "REGULAR",

        price: 0,

        currency:
          "KES",

        quantityTotal: 100,

        minPerOrder: 1,

        maxPerOrder: 10,

        isActive: true,

        isVisible: true,

        perks: [],
      });
    }
  }, [ticket]);

  const updateField = (
    key: string,
    value: any,
  ) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >

            <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh]">

              <h2 className="text-3xl font-black mb-8">
                {ticket
                  ? "Edit Ticket"
                  : "Create Ticket"}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">

                  <label className="block text-sm text-gray-400 mb-2">
                    Ticket Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      updateField(
                        "name",
                        e.target.value,
                      )
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  />
                </div>

                <div className="md:col-span-2">

                  <label className="block text-sm text-gray-400 mb-2">
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={(e) =>
                      updateField(
                        "description",
                        e.target.value,
                      )
                    }
                    rows={4}
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  />
                </div>

                <div>

                  <label className="block text-sm text-gray-400 mb-2">
                    Ticket Type
                  </label>

                  <select
                    value={
                      form.ticketType
                    }
                    onChange={(e) =>
                      updateField(
                        "ticketType",
                        e.target.value,
                      )
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  >
                    <option value="REGULAR">
                      REGULAR
                    </option>

                    <option value="VIP">
                      VIP
                    </option>

                    <option value="VVIP">
                      VVIP
                    </option>

                    <option value="EARLY_BIRD">
                      EARLY BIRD
                    </option>

                    <option value="STUDENT">
                      STUDENT
                    </option>

                    <option value="GROUP">
                      GROUP
                    </option>

                    <option value="ONLINE">
                      ONLINE
                    </option>

                    <option value="FREE">
                      FREE
                    </option>
                  </select>
                </div>

                <div>

                  <label className="block text-sm text-gray-400 mb-2">
                    Price
                  </label>

                  <input
                    type="number"
                    value={
                      form.price
                    }
                    onChange={(e) =>
                      updateField(
                        "price",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  />
                </div>

                <div>

                  <label className="block text-sm text-gray-400 mb-2">
                    Quantity
                  </label>

                  <input
                    type="number"
                    value={
                      form.quantityTotal
                    }
                    onChange={(e) =>
                      updateField(
                        "quantityTotal",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  />
                </div>

                <div>

                  <label className="block text-sm text-gray-400 mb-2">
                    Currency
                  </label>

                  <input
                    value={
                      form.currency
                    }
                    onChange={(e) =>
                      updateField(
                        "currency",
                        e.target.value,
                      )
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  />
                </div>

                <div>

                  <label className="block text-sm text-gray-400 mb-2">
                    Min Per Order
                  </label>

                  <input
                    type="number"
                    value={
                      form.minPerOrder
                    }
                    onChange={(e) =>
                      updateField(
                        "minPerOrder",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  />
                </div>

                <div>

                  <label className="block text-sm text-gray-400 mb-2">
                    Max Per Order
                  </label>

                  <input
                    type="number"
                    value={
                      form.maxPerOrder
                    }
                    onChange={(e) =>
                      updateField(
                        "maxPerOrder",
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                    className="w-full bg-gray-950 border border-gray-800 rounded-2xl px-4 py-3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">

                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 transition"
                >
                  Cancel
                </button>

                <button
                  disabled={isSaving}
                  onClick={() =>
                    onSave(form)
                  }
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition inline-flex items-center gap-2 font-semibold"
                >
                  {isSaving && (
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  )}

                  {ticket
                    ? "Update Ticket"
                    : "Create Ticket"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}