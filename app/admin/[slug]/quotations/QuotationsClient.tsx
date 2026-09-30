"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  TrashIcon,
  ArrowRightCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  UserPlusIcon,
  UserIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

interface Props {
  companyId: string;
  companySlug: string;
  currency: string;
  companyName: string;
}

export default function QuotationsClient({
  companyId,
  companySlug,
  currency,
  companyName,
}: Props) {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalQuoted: 0, totalAccepted: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetMode, setShareTargetMode] = useState<"ALL" | "PENDING" | "SINGLE">("ALL");
  const [targetQuotationForShare, setTargetQuotationForShare] = useState<any>(null);
  const [shareChannel, setShareChannel] = useState<"WHATSAPP" | "EMAIL" | "BOTH">("BOTH");
  const [customShareMessage, setCustomShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Contact autocomplete & registration states
  const [contactQuery, setContactQuery] = useState("");
  const [contactResults, setContactResults] = useState<any[]>([]);
  const [isSearchingContacts, setIsSearchingContacts] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [isRegisteringContact, setIsRegisteringContact] = useState(false);

  // AI Auto-Fill states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // In-place Quotation Editing states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    clientId: "",
    consumerId: "",
    expiryDate: "",
    notes: "",
    terms: "",
    status: "PENDING",
    items: [
      { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 },
    ],
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // New Quote form
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: "",
    terms: "Quotation valid for 30 calendar days. 50% mobilization deposit upon acceptance.",
    items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 }],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      if (filterStatus !== "All") params.append("status", filterStatus);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/quotations?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuotations(json.data.quotations || []);
        if (json.data.metrics) {
          setMetrics(json.data.metrics);
        }
      }
    } catch (err) {
      console.error("Fetch quotations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [companyId, filterStatus]);

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (form.items.length <= 1) return;
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const computedTotals = useMemo(() => {
    return form.items.reduce(
      (acc, it) => {
        const gross = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
        const discount = gross * ((Number(it.discount) || 0) / 100);
        const net = gross - discount;
        const tax = net * ((Number(it.taxRate) || 0) / 100);
        acc.subtotal += net;
        acc.tax += tax;
        acc.total += net + tax;
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
  }, [form.items]);

  // Search contacts across Clients and Consumers
  const searchContacts = async (query: string) => {
    setContactQuery(query);
    if (!query || query.trim().length < 2) {
      setContactResults([]);
      setShowContactDropdown(false);
      return;
    }
    try {
      setIsSearchingContacts(true);
      const res = await fetch(
        `/api/admin/contacts/search?companyId=${companyId}&q=${encodeURIComponent(query)}`
      );
      const json = await res.json();
      if (json.success && json.data) {
        setContactResults(json.data.contacts || []);
        setShowContactDropdown(true);
      }
    } catch (e) {
      console.error("Error searching contacts:", e);
    } finally {
      setIsSearchingContacts(false);
    }
  };

  // Register a new customer directly into the database on the fly
  const handleRegisterContact = async (name: string, email: string, phone: string, target: "CREATE" | "EDIT" = "CREATE") => {
    if (!name.trim()) {
      alert("Contact name is required to register.");
      return;
    }
    try {
      setIsRegisteringContact(true);
      const res = await fetch("/api/admin/contacts/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          type: "CLIENT",
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.contact) {
        const contact = json.data.contact;
        if (target === "CREATE") {
          setForm((prev) => ({
            ...prev,
            customerName: contact.name,
            customerEmail: contact.email || "",
            customerPhone: contact.phone || "",
            clientId: contact.clientId || "",
            consumerId: "",
          }));
        } else {
          setEditForm((prev) => ({
            ...prev,
            customerName: contact.name,
            customerEmail: contact.email || "",
            customerPhone: contact.phone || "",
            clientId: contact.clientId || "",
            consumerId: "",
          }));
        }
        setShowContactDropdown(false);
        alert(`Registered "${contact.name}" into client directory!`);
      } else {
        alert(json.error || "Failed to register new client");
      }
    } catch (e: any) {
      alert(e.message || "Failed to register contact");
    } finally {
      setIsRegisteringContact(false);
    }
  };

  // AI Auto-Populate details from prompt
  const handleAiAutoFill = async (target: "CREATE" | "EDIT" = "CREATE") => {
    if (!aiPrompt.trim()) return;
    try {
      setIsAiGenerating(true);
      setAiFeedback(null);
      const res = await fetch("/api/documents/ai-populate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          documentType: "QUOTATION",
          currency,
          companyId,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const data = json.data;
        if (target === "CREATE") {
          setForm((prev) => ({
            ...prev,
            customerName: data.customerName || prev.customerName,
            customerEmail: data.customerEmail || prev.customerEmail,
            customerPhone: data.customerPhone || prev.customerPhone,
            expiryDate: data.dueDate || prev.expiryDate,
            terms: data.terms || prev.terms,
            notes: data.notes || prev.notes,
            items: data.items && data.items.length > 0 ? data.items : prev.items,
          }));
        } else {
          setEditForm((prev) => ({
            ...prev,
            customerName: data.customerName || prev.customerName,
            customerEmail: data.customerEmail || prev.customerEmail,
            customerPhone: data.customerPhone || prev.customerPhone,
            expiryDate: data.dueDate || prev.expiryDate,
            terms: data.terms || prev.terms,
            notes: data.notes || prev.notes,
            items: data.items && data.items.length > 0 ? data.items : prev.items,
          }));
        }
        setAiFeedback(`✨ Populated via ${json.source || "AI Assistant"}! Review and adjust any details.`);
        setTimeout(() => {
          setIsAiOpen(false);
          setAiFeedback(null);
        }, 2200);
      } else {
        setAiFeedback(json.error || "Failed to generate quotation details");
      }
    } catch (e: any) {
      setAiFeedback(e.message || "Failed to call AI assistant");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Open Edit Quotation modal
  const handleOpenEditModal = (quote: any) => {
    setEditingQuotationId(quote.id);
    setEditForm({
      customerName: quote.customerName || "",
      customerEmail: quote.customerEmail || "",
      customerPhone: quote.customerPhone || "",
      clientId: quote.clientId || "",
      consumerId: quote.consumerId || "",
      expiryDate: quote.expiryDate ? new Date(quote.expiryDate).toISOString().slice(0, 10) : "",
      notes: quote.notes || "",
      terms: quote.terms || "",
      status: quote.status || "PENDING",
      items:
        quote.items && quote.items.length > 0
          ? quote.items.map((it: any) => ({
              description: it.description,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              taxRate: it.taxRate || 0,
              discount: it.discount || 0,
            }))
          : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 }],
    });
    setIsEditModalOpen(true);
  };

  const handleEditAddItem = () => {
    setEditForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 },
      ],
    }));
  };

  const handleEditRemoveItem = (index: number) => {
    if (editForm.items.length <= 1) return;
    setEditForm((prev) => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleEditItemChange = (index: number, field: string, value: any) => {
    setEditForm((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  // Compute live subtotal, tax, and total for Edit modal
  const computedEditTotals = useMemo(() => {
    return editForm.items.reduce(
      (acc, it) => {
        const gross = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
        const discount = gross * ((Number(it.discount) || 0) / 100);
        const net = gross - discount;
        const tax = net * ((Number(it.taxRate) || 0) / 100);
        acc.subtotal += net;
        acc.tax += tax;
        acc.total += net + tax;
        return acc;
      },
      { subtotal: 0, tax: 0, total: 0 }
    );
  }, [editForm.items]);

  // Submit in-place quotation edit
  const handleSaveEditQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuotationId) return;
    if (!editForm.customerName.trim()) {
      alert("Customer name is required.");
      return;
    }
    if (editForm.items.some((it) => !it.description.trim() || Number(it.unitPrice) <= 0)) {
      alert("Please ensure all items have a description and valid price.");
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const res = await fetch(`/api/admin/quotations/${editingQuotationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        setEditingQuotationId(null);
        fetchQuotations();
      } else {
        alert(json.error || "Failed to save quotation changes");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save quotation changes");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) {
      alert("Customer name is required.");
      return;
    }
    if (form.items.some((it) => !it.description.trim() || Number(it.unitPrice) <= 0)) {
      alert("Please ensure all items have a description and valid price.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/admin/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          companyId,
          currency,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsCreateModalOpen(false);
        setForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: "",
          terms: "Quotation valid for 30 calendar days. 50% mobilization deposit upon acceptance.",
          items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0 }],
        });
        fetchQuotations();
      } else {
        alert(json.error || "Failed to create quotation");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create quotation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToInvoice = async (quote: any) => {
    if (!confirm(`Convert Quotation ${quote.quotationNumber} into a live Invoice? This will generate a formal Invoice with exact line items.`)) {
      return;
    }

    try {
      setIsConverting(true);
      const res = await fetch(`/api/admin/quotations/${quote.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CONVERT_TO_INVOICE" }),
      });
      const json = await res.json();
      if (json.success) {
        alert(`Success! Generated Invoice #${json.data.invoice.invoiceNumber}.`);
        setIsViewModalOpen(false);
        fetchQuotations();
      } else {
        alert(json.error || "Failed to convert quotation");
      }
    } catch (err: any) {
      alert(err.message || "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  const handleExecuteShare = async () => {
    try {
      setIsSharing(true);
      setShareFeedback(null);

      let targetsToShare: any[] = [];
      if (shareTargetMode === "SINGLE" && targetQuotationForShare) {
        targetsToShare = [targetQuotationForShare];
      } else if (shareTargetMode === "PENDING") {
        targetsToShare = quotations.filter((q) => q.status === "DRAFT" || q.status === "SENT");
      } else {
        targetsToShare = quotations;
      }

      if (targetsToShare.length === 0) {
        setShareFeedback("No quotations found to share.");
        return;
      }

      const recipients = targetsToShare.map((q) => ({
        name: q.customerName || "Valued Client",
        email: q.customerEmail || undefined,
        phone: q.customerPhone || undefined,
        sourceEntityId: q.id,
      }));

      const res = await fetch("/api/documents/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          documentType: "QUOTATION",
          channel: shareChannel,
          customMessage: customShareMessage.trim() || undefined,
          recipients,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShareFeedback(`✅ ${json.message}`);
        setTimeout(() => {
          setIsShareModalOpen(false);
          setShareFeedback(null);
        }, 2200);
      } else {
        setShareFeedback(`❌ Error: ${json.error || "Failed to share documents"}`);
      }
    } catch (err: any) {
      setShareFeedback(`❌ Network error: ${err.message}`);
    } finally {
      setIsSharing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Accepted</span>;
      case "CONVERTED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Converted to Invoice</span>;
      case "SENT":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">Sent to Client</span>;
      case "EXPIRED":
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">Expired</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Draft</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Commercial Pipeline
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quotations & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-indigo-500 to-purple-600">Estimates</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Issue formal estimates, track commercial validity, and seamlessly convert accepted quotes to invoices for <strong className="text-slate-800 dark:text-slate-200">{companyName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuotations}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all"
              title="Refresh"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin text-sky-500" : ""}`} />
            </button>
            <button
              onClick={() => {
                setShareTargetMode("ALL");
                setTargetQuotationForShare(null);
                setShareFeedback(null);
                setIsShareModalOpen(true);
              }}
              disabled={quotations.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              title="Share quotes with multiple clients via WhatsApp or Email"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share with Many</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all"
            >
              <PlusIcon className="w-4 h-4 stroke-[3px]" /> Create New Quote
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pipeline Value</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {currency} {metrics.totalQuoted.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cumulative proposals created</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Accepted Quoted Volume</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {currency} {metrics.totalAccepted.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Proposals verified by clients</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["All", "DRAFT", "SENT", "ACCEPTED", "CONVERTED", "EXPIRED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterStatus === st
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-64 relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchQuotations()}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* QUOTATIONS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Quote #</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No quotations found. Click "Create New Quote" to begin.
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">{q.quotationNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{q.customerName}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(q.issueDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(q.expiryDate).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">{currency} {q.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">{getStatusBadge(q.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedQuotation(q);
                              setIsViewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="View details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(q)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                            title="Edit quotation in-place"
                          >
                            <PencilSquareIcon className="w-4 h-4" />
                          </button>
                          <a
                            href={`/api/documents/quotation/${q.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-sky-950 text-sky-600 dark:text-sky-400"
                            title="Print / View PDF"
                          >
                            <PrinterIcon className="w-4 h-4" />
                          </a>
                          <a
                            href={`/api/documents/quotation/${q.id}/pdf?download=true`}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                            title="Download PDF"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => {
                              setSelectedQuotation(q);
                              setTargetQuotationForShare(q);
                              setShareTargetMode("SINGLE");
                              setShareFeedback(null);
                              setIsShareModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                            title="Share via WhatsApp or Email"
                          >
                            <ShareIcon className="w-4 h-4" />
                          </button>
                          {q.status !== "CONVERTED" && (
                            <button
                              onClick={() => handleConvertToInvoice(q)}
                              disabled={isConverting}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm"
                              title="Convert to formal Invoice"
                            >
                              <ArrowRightCircleIcon className="w-3.5 h-3.5" /> Convert
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: CREATE QUOTATION */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
              
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">Proposal Generation</span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Create Commercial Quotation</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAiOpen(!isAiOpen)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-95 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <SparklesIcon className="h-3.5 w-3.5" />
                    <span>AI Auto-Fill</span>
                  </button>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* AI Auto-Fill Assistant Drawer */}
              {isAiOpen && (
                <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/50 rounded-2xl border border-indigo-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <SparklesIcon className="h-4 w-4" /> AI Proposal Assistant
                    </span>
                    <span className="text-[10px] text-slate-400">Natural language to line items & terms</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Commercial office network cabling & Wi-Fi setup",
                      "Solar backup power with 5kVA inverter and lithium battery",
                      "Annual IT maintenance contract with monthly SLA support",
                    ].map((sample, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAiPrompt(sample);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-all text-left truncate max-w-xs"
                      >
                        💡 {sample}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Quotation for 10 executive desks at 25000 and 10 ergonomic chairs at 12000 for Safaricom HQ"
                      className="flex-1 text-xs rounded-xl px-3 py-2 border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isAiGenerating) {
                          e.preventDefault();
                          handleAiAutoFill("CREATE");
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAiAutoFill("CREATE")}
                      disabled={isAiGenerating}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                    >
                      {isAiGenerating ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-3.5 w-3.5" />
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                  {aiFeedback && (
                    <div className="text-[11px] font-semibold text-indigo-300">
                      {aiFeedback}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleCreateQuotation} className="space-y-6 text-xs">
                
                {/* Customer Details with Smart Database Combobox */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Combobox */}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 dark:text-slate-300">
                        Customer / Entity Name *
                      </label>
                      {form.customerName.trim() && !form.clientId && (
                        <button
                          type="button"
                          onClick={() => handleRegisterContact(form.customerName, form.customerEmail, form.customerPhone, "CREATE")}
                          disabled={isRegisteringContact}
                          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                          title="Save this new customer into the company directory"
                        >
                          <UserPlusIcon className="h-3 w-3" />
                          {isRegisteringContact ? "Saving..." : "Save to Database"}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Search existing client or type new..."
                        value={form.customerName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({ ...form, customerName: val, clientId: "" });
                          searchContacts(val);
                        }}
                        onFocus={() => {
                          if (contactResults.length > 0) setShowContactDropdown(true);
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                      />
                      {isSearchingContacts && (
                        <div className="absolute right-3 top-3">
                          <span className="h-4 w-4 border-2 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin block" />
                        </div>
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showContactDropdown && contactResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                          <span>Directory Matches</span>
                          <button
                            type="button"
                            onClick={() => setShowContactDropdown(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            Close ✕
                          </button>
                        </div>
                        {contactResults.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                customerName: c.name,
                                customerEmail: c.email || form.customerEmail,
                                customerPhone: c.phone || form.customerPhone,
                                clientId: c.clientId || "",
                                consumerId: c.consumerId || "",
                              });
                              setShowContactDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="truncate">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                                {c.name}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {c.email || "No email"} • {c.phone || "No phone"}
                              </div>
                            </div>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase flex-shrink-0 ${
                                c.type === "CLIENT"
                                  ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                  : "bg-purple-500/10 text-purple-500 border border-purple-500/20"
                              }`}
                            >
                              {c.type}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Validity Expiry Date *</label>
                    <input
                      type="date"
                      required
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Contact Email</label>
                    <input
                      type="email"
                      placeholder="client@example.com"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+254 700 000 000"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold uppercase text-[11px] text-sky-600 dark:text-sky-400 tracking-wider">Line Items & Deliverables</h4>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-bold text-xs"
                    >
                      <PlusIcon className="w-3.5 h-3.5 stroke-[3px]" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {form.items.map((it, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 items-center">
                        <div className="col-span-5">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Description</label>
                          <input
                            type="text"
                            required
                            placeholder="Deliverable description"
                            value={it.description}
                            onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Qty</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center font-bold"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Unit Rate ({currency})</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={it.unitPrice}
                            onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Total</label>
                          <span className="font-black text-slate-900 dark:text-white">
                            {((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)).toLocaleString()}
                          </span>
                        </div>
                        <div className="col-span-1 flex justify-end items-end pt-4">
                          {form.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg"
                              title="Remove item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-bold">{currency} {computedTotals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated VAT (16%):</span>
                      <span className="font-bold">{currency} {computedTotals.tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                      <span>Total Quotation:</span>
                      <span className="text-sky-600 dark:text-sky-400">{currency} {computedTotals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Terms & Conditions</label>
                  <input
                    type="text"
                    value={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold shadow-md shadow-sky-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? "Generating Quotation..." : "Generate Quotation"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL: VIEW QUOTATION */}
        {isViewModalOpen && selectedQuotation && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
              
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-black text-xl">
                    <ClipboardDocumentCheckIcon className="w-6 h-6" /> {companyName}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Commercial Quotation & Proposal</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{selectedQuotation.quotationNumber}</span>
                  <p className="text-xs text-slate-500 mt-1">Date: {new Date(selectedQuotation.issueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-rose-500 font-bold">Valid Until: {new Date(selectedQuotation.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-extrabold text-slate-400 uppercase text-[10px]">Client / Recipient:</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">{selectedQuotation.customerName}</div>
                {selectedQuotation.customerEmail && <div className="text-slate-500 mt-0.5">{selectedQuotation.customerEmail}</div>}
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Rate</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedQuotation.items?.map((it: any, i: number) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-semibold">{it.description}</td>
                        <td className="py-2.5 px-3 text-center">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right">{currency} {it.unitPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold">{currency} {it.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end text-xs">
                <div className="w-60 space-y-1 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{currency} {selectedQuotation.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax:</span>
                    <span>{currency} {selectedQuotation.taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-sky-600 dark:text-sky-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span>Total Estimate:</span>
                    <span>{currency} {selectedQuotation.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-between items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/documents/quotation/${selectedQuotation.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <PrinterIcon className="w-4 h-4" /> Print / View PDF
                  </a>
                  <a
                    href={`/api/documents/quotation/${selectedQuotation.id}/pdf?download=true`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download PDF
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetQuotationForShare(selectedQuotation);
                      setShareTargetMode("SINGLE");
                      setShareFeedback(null);
                      setIsShareModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <ShareIcon className="w-4 h-4" /> Share via WhatsApp / Email
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleOpenEditModal(selectedQuotation);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Edit Details
                  </button>
                  {selectedQuotation.status !== "CONVERTED" && (
                    <button
                      onClick={() => handleConvertToInvoice(selectedQuotation)}
                      disabled={isConverting}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <ArrowRightCircleIcon className="w-4 h-4" /> Convert to Invoice
                    </button>
                  )}
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      {/* SHARE QUOTATION(S) VIA WHATSAPP / EMAIL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all my-8 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">Multi-Channel Distribution</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {shareTargetMode === "SINGLE" && targetQuotationForShare
                    ? `Share Quote ${targetQuotationForShare.quotationNumber}`
                    : `Share Quotes with Many Clients`}
                </h3>
                <p className="text-xs mt-0.5 text-slate-500 dark:text-slate-400">
                  Dispatch official PDF quotations directly via WhatsApp and/or Email.
                </p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-slate-400"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scope selector if multiple quotes */}
            {shareTargetMode !== "SINGLE" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Target Quotes</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShareTargetMode("PENDING")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      shareTargetMode === "PENDING"
                        ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    Pending Only ({quotations.filter((q) => q.status === "DRAFT" || q.status === "SENT").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareTargetMode("ALL")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      shareTargetMode === "ALL"
                        ? "bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400"
                        : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400"
                    }`}
                  >
                    All Displayed ({quotations.length})
                  </button>
                </div>
              </div>
            )}

            {/* Channel Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">Delivery Channel</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShareChannel("WHATSAPP")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    shareChannel === "WHATSAPP"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setShareChannel("EMAIL")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    shareChannel === "EMAIL"
                      ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  <EnvelopeIcon className="h-4 w-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setShareChannel("BOTH")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    shareChannel === "BOTH"
                      ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400"
                  }`}
                >
                  <ShareIcon className="h-4 w-4" /> Both
                </button>
              </div>
            </div>

            {/* Custom Cover Message */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                Custom Message / Cover Note (Optional)
              </label>
              <textarea
                rows={2}
                value={customShareMessage}
                onChange={(e) => setCustomShareMessage(e.target.value)}
                placeholder="e.g. Please find attached the formal quotation for your requested services."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium resize-none focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Recipients Summary List */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-300">
                  Recipients List (
                  {shareTargetMode === "SINGLE" && targetQuotationForShare
                    ? 1
                    : shareTargetMode === "PENDING"
                    ? quotations.filter((q) => q.status === "DRAFT" || q.status === "SENT").length
                    : quotations.length}
                  )
                </span>
                <span className="text-[10px] text-slate-400">PDF will be generated individually</span>
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-xs">
                {(shareTargetMode === "SINGLE" && targetQuotationForShare
                  ? [targetQuotationForShare]
                  : shareTargetMode === "PENDING"
                  ? quotations.filter((q) => q.status === "DRAFT" || q.status === "SENT")
                  : quotations
                ).map((q: any, idx: number) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-bold truncate text-slate-800 dark:text-slate-200">{q.customerName}</div>
                      <div className="text-[10px] text-slate-400">{q.quotationNumber} • {currency} {q.totalAmount.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          q.customerEmail
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                        title={q.customerEmail || "No email"}
                      >
                        Email {q.customerEmail ? "✓" : "✗"}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          q.customerPhone
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                        title={q.customerPhone || "No phone"}
                      >
                        WA {q.customerPhone ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status / Feedback */}
            {shareFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  shareFeedback.startsWith("✅")
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                }`}
              >
                {shareFeedback}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                disabled={isSharing}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteShare}
                disabled={isSharing}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSharing ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <ShareIcon className="h-4 w-4" />
                    <span>
                      {shareTargetMode === "SINGLE"
                        ? `Send via ${shareChannel}`
                        : `Share with Many (${
                            shareTargetMode === "PENDING"
                              ? quotations.filter((q) => q.status === "DRAFT" || q.status === "SENT").length
                              : quotations.length
                          })`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT QUOTATION MODAL (IN-PLACE ADMIN UPDATE WITH LIVE TOTALS & AI)       */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto transition-all">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <PencilSquareIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Edit Quotation Details
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct in-place update of proposal deliverables, rates, customer, and terms.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiOpen(!isAiOpen)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-95 shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
                >
                  <SparklesIcon className="h-3.5 w-3.5" />
                  <span>AI Auto-Refine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* AI Assistant Drawer inside Edit Modal */}
            {isAiOpen && (
              <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/50 border-b border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <SparklesIcon className="h-4 w-4" /> AI Document Assistant (Edit Mode)
                  </span>
                  <span className="text-[10px] text-slate-400">Gemini 2.0 & heuristic parsing</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Update deliverables to include 2 backup batteries, set total discount 5%"
                    className="flex-1 text-xs rounded-xl px-3 py-2 border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isAiGenerating) {
                        e.preventDefault();
                        handleAiAutoFill("EDIT");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAiAutoFill("EDIT")}
                    disabled={isAiGenerating}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                  >
                    {isAiGenerating ? (
                      <>
                        <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Refining...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-3.5 w-3.5" />
                        <span>Refine</span>
                      </>
                    )}
                  </button>
                </div>
                {aiFeedback && (
                  <div className="text-[11px] font-semibold text-indigo-300">
                    {aiFeedback}
                  </div>
                )}
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEditQuotation} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Customer Information & Status */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider mb-3 text-slate-400">
                  1. Recipient & Parameters
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Customer Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                      Customer / Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.customerName}
                      onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      placeholder="e.g. John Doe / Safaricom Ltd"
                    />
                  </div>

                  {/* Customer Email */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      value={editForm.customerEmail}
                      onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      placeholder="client@example.com"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.customerPhone}
                      onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                      placeholder="+254 712 345678"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Validity Expiry Date</label>
                    <input
                      type="date"
                      value={editForm.expiryDate}
                      onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="EXPIRED">EXPIRED</option>
                      <option value="CONVERTED">CONVERTED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    2. Deliverables & Rates ({editForm.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleEditAddItem}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-600/10 text-sky-600 dark:text-sky-400 hover:bg-sky-600/20 border border-sky-500/20 flex items-center gap-1 transition-all"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {editForm.items.map((item, idx) => {
                    const gross = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
                    const disc = gross * ((Number(item.discount) || 0) / 100);
                    const lineNet = gross - disc;
                    const lineTax = lineNet * ((Number(item.taxRate) || 0) / 100);
                    const lineTotal = lineNet + lineTax;

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 transition-all"
                      >
                        <div className="grid grid-cols-12 gap-2.5 items-center">
                          {/* Description */}
                          <div className="col-span-12 sm:col-span-5">
                            <label className="block text-[10px] font-bold mb-1 text-slate-400">Deliverable / Description</label>
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => handleEditItemChange(idx, "description", e.target.value)}
                              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              placeholder="Product or service description"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className="block text-[10px] font-bold mb-1 text-slate-400">Qty</label>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              required
                              value={item.quantity}
                              onChange={(e) => handleEditItemChange(idx, "quantity", Number(e.target.value))}
                              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className="block text-[10px] font-bold mb-1 text-slate-400">Unit Price ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={item.unitPrice}
                              onChange={(e) => handleEditItemChange(idx, "unitPrice", Number(e.target.value))}
                              className="w-full text-xs rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>

                          {/* Tax % */}
                          <div className="col-span-4 sm:col-span-1">
                            <label className="block text-[10px] font-bold mb-1 text-slate-400">Tax%</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.taxRate}
                              onChange={(e) => handleEditItemChange(idx, "taxRate", Number(e.target.value))}
                              className="w-full text-xs rounded-xl px-2 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center"
                            />
                          </div>

                          {/* Discount % */}
                          <div className="col-span-4 sm:col-span-1">
                            <label className="block text-[10px] font-bold mb-1 text-slate-400">Disc%</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.discount}
                              onChange={(e) => handleEditItemChange(idx, "discount", Number(e.target.value))}
                              className="w-full text-xs rounded-xl px-2 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center"
                            />
                          </div>

                          {/* Row Total & Delete */}
                          <div className="col-span-8 sm:col-span-1 flex items-center justify-end gap-1.5 pt-4 sm:pt-0">
                            <span className="text-xs font-bold truncate text-slate-900 dark:text-white" title={lineTotal.toFixed(2)}>
                              {currency} {lineTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                            </span>
                            {editForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleEditRemoveItem(idx)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Terms & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Quotation Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={editForm.terms}
                    onChange={(e) => setEditForm({ ...editForm, terms: e.target.value })}
                    className="w-full text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    placeholder="Validity period, deposit requirements, delivery schedule..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Internal Memo / Notes</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full text-xs rounded-xl p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    placeholder="Staff notes..."
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Total recalculates live as you edit deliverables, quantities, taxes, or discounts.
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">Subtotal</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {currency} {computedEditTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400">Tax</div>
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {currency} {computedEditTotals.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="pl-4 border-l border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Total Estimate</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">
                      {currency} {computedEditTotals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmittingEdit}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingEdit ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Save Quotation Updates</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
