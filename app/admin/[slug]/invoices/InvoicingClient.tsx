"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  PrinterIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  FunnelIcon,
  BanknotesIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentCheckIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  UserPlusIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface InvoicingClientProps {
  companyId: string;
  companySlug: string;
  currency: string;
  companyName: string;
}

export default function InvoicingClient({
  companyId,
  companySlug,
  currency,
  companyName,
}: InvoicingClientProps) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data states
  const [invoices, setInvoices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalBilled: 0, totalOutstanding: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Sharing states (WhatsApp / Email multi-channel & bulk dispatch)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetMode, setShareTargetMode] = useState<"ALL" | "UNPAID" | "SINGLE">("ALL");
  const [targetInvoiceForShare, setTargetInvoiceForShare] = useState<any>(null);
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

  // Edit modal contact autocomplete states
  const [editContactResults, setEditContactResults] = useState<any[]>([]);
  const [isSearchingEditContacts, setIsSearchingEditContacts] = useState(false);
  const [showEditContactDropdown, setShowEditContactDropdown] = useState(false);

  // Quick Customer Registration Modal state
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerTarget, setNewCustomerTarget] = useState<"CREATE" | "EDIT">("CREATE");
  const [newCustomerForm, setNewCustomerForm] = useState({ name: "", email: "", phone: "" });
  const [isSubmittingNewCustomer, setIsSubmittingNewCustomer] = useState(false);

  // Product Catalog / Marketplace Selector Modal states
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productPickerTarget, setProductPickerTarget] = useState<"CREATE" | "EDIT">("CREATE");
  const [targetItemIndex, setTargetItemIndex] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("ALL");
  const [productsList, setProductsList] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // AI Auto-Fill states
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // In-place Invoice Editing states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    clientId: "",
    consumerId: "",
    dueDate: "",
    notes: "",
    terms: "",
    status: "PENDING",
    items: [
      { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0, productId: "", marketplaceListingId: "" },
    ],
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // New Invoice form
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    clientId: "",
    consumerId: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    notes: "",
    terms: "Payment due within 30 days of invoice date.",
    items: [
      { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0, productId: "", marketplaceListingId: "" },
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    amountPaid: "",
    paymentMethod: "MPESA",
    reference: "",
  });
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Fetch invoices from API
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ companyId });
      if (filterStatus !== "All") params.append("status", filterStatus);
      if (search) params.append("search", search);

      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setInvoices(json.data.invoices || []);
        if (json.data.metrics) {
          setMetrics(json.data.metrics);
        }
      }
    } catch (err) {
      console.error("Fetch invoices error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [companyId, filterStatus]);

  // Product Catalog Fetcher & Handlers
  const fetchProductsCatalog = async (searchQuery: string = "") => {
    try {
      setIsLoadingProducts(true);
      const params = new URLSearchParams({ companyId, limit: "50" });
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setProductsList(json.data.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleOpenProductPicker = (target: "CREATE" | "EDIT", itemIndex: number | null = null) => {
    setProductPickerTarget(target);
    setTargetItemIndex(itemIndex);
    setIsProductPickerOpen(true);
    setProductSearch("");
    setProductCategoryFilter("ALL");
    fetchProductsCatalog("");
  };

  const handleSelectProduct = (product: any) => {
    const defaultDiscount = Number(product.discount) || 0;
    const defaultPrice = Number(product.sellingPrice) || 0;
    const desc = product.sku ? `${product.name} [${product.sku}]` : product.name;

    if (productPickerTarget === "CREATE") {
      setForm((prev) => {
        const items = [...prev.items];
        if (targetItemIndex !== null && items[targetItemIndex]) {
          items[targetItemIndex] = {
            ...items[targetItemIndex],
            description: desc,
            unitPrice: defaultPrice,
            discount: defaultDiscount,
            productId: product.id,
            marketplaceListingId: product.marketplaceListing?.id || null,
          };
        } else {
          if (items.length === 1 && !items[0].description.trim() && Number(items[0].unitPrice) === 0) {
            items[0] = {
              description: desc,
              quantity: 1,
              unitPrice: defaultPrice,
              taxRate: 16,
              discount: defaultDiscount,
              productId: product.id,
              marketplaceListingId: product.marketplaceListing?.id || null,
            };
          } else {
            items.push({
              description: desc,
              quantity: 1,
              unitPrice: defaultPrice,
              taxRate: 16,
              discount: defaultDiscount,
              productId: product.id,
              marketplaceListingId: product.marketplaceListing?.id || null,
            });
          }
        }
        return { ...prev, items };
      });
    } else {
      setEditForm((prev) => {
        const items = [...prev.items];
        if (targetItemIndex !== null && items[targetItemIndex]) {
          items[targetItemIndex] = {
            ...items[targetItemIndex],
            description: desc,
            unitPrice: defaultPrice,
            discount: defaultDiscount,
            productId: product.id,
            marketplaceListingId: product.marketplaceListing?.id || null,
          };
        } else {
          if (items.length === 1 && !items[0].description.trim() && Number(items[0].unitPrice) === 0) {
            items[0] = {
              description: desc,
              quantity: 1,
              unitPrice: defaultPrice,
              taxRate: 16,
              discount: defaultDiscount,
              productId: product.id,
              marketplaceListingId: product.marketplaceListing?.id || null,
            };
          } else {
            items.push({
              description: desc,
              quantity: 1,
              unitPrice: defaultPrice,
              taxRate: 16,
              discount: defaultDiscount,
              productId: product.id,
              marketplaceListingId: product.marketplaceListing?.id || null,
            });
          }
        }
        return { ...prev, items };
      });
    }
    setIsProductPickerOpen(false);
  };

  // Quick Customer Registration handler
  const handleSaveNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;
    try {
      setIsSubmittingNewCustomer(true);
      const res = await fetch("/api/admin/contacts/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          name: newCustomerForm.name.trim(),
          email: newCustomerForm.email.trim() || undefined,
          phone: newCustomerForm.phone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.success && (json.data || json.contact)) {
        const contact = json.contact || json.data;
        if (newCustomerTarget === "CREATE") {
          setForm((prev) => ({
            ...prev,
            customerName: contact.name,
            customerEmail: contact.email || prev.customerEmail,
            customerPhone: contact.phone || prev.customerPhone,
            clientId: contact.clientId || contact.id || "",
            consumerId: "",
          }));
        } else {
          setEditForm((prev) => ({
            ...prev,
            customerName: contact.name,
            customerEmail: contact.email || prev.customerEmail,
            customerPhone: contact.phone || prev.customerPhone,
            clientId: contact.clientId || contact.id || "",
            consumerId: "",
          }));
        }
        setIsNewCustomerModalOpen(false);
        setNewCustomerForm({ name: "", email: "", phone: "" });
      } else {
        alert(json.error || "Failed to register customer");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save customer");
    } finally {
      setIsSubmittingNewCustomer(false);
    }
  };

  // Handle line item addition & change
  const handleAddItem = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0, productId: "", marketplaceListingId: "" },
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

  // Compute live gross, discount, subtotal, tax, and total
  const computedTotals = useMemo(() => {
    return form.items.reduce(
      (acc, it) => {
        const gross = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
        const discount = gross * ((Number(it.discount) || 0) / 100);
        const net = gross - discount;
        const tax = net * ((Number(it.taxRate) || 0) / 100);
        acc.gross += gross;
        acc.discount += discount;
        acc.subtotal += net;
        acc.tax += tax;
        acc.total += net + tax;
        return acc;
      },
      { gross: 0, discount: 0, subtotal: 0, tax: 0, total: 0 }
    );
  }, [form.items]);

  // Submit invoice creation
  const handleCreateInvoice = async (e: React.FormEvent) => {
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
      const res = await fetch("/api/admin/invoices", {
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
          clientId: "",
          consumerId: "",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          notes: "",
          terms: "Payment due within 30 days of invoice date.",
          items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0, productId: "", marketplaceListingId: "" }],
        });
        fetchInvoices();
      } else {
        alert(json.error || "Failed to create invoice");
      }
    } catch (err: any) {
      alert(err.message || "Failed to create invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute live gross, discount, subtotal, tax, and total for Edit modal
  const computedEditTotals = useMemo(() => {
    return editForm.items.reduce(
      (acc, it) => {
        const gross = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
        const discount = gross * ((Number(it.discount) || 0) / 100);
        const net = gross - discount;
        const tax = net * ((Number(it.taxRate) || 0) / 100);
        acc.gross += gross;
        acc.discount += discount;
        acc.subtotal += net;
        acc.tax += tax;
        acc.total += net + tax;
        return acc;
      },
      { gross: 0, discount: 0, subtotal: 0, tax: 0, total: 0 }
    );
  }, [editForm.items]);

  // Search existing clients & consumers
  const searchContacts = async (query: string) => {
    try {
      setIsSearchingContacts(true);
      const res = await fetch(
        `/api/admin/contacts/search?companyId=${encodeURIComponent(companyId)}&query=${encodeURIComponent(query)}`
      );
      const json = await res.json();
      if (json.success) {
        setContactResults(json.data || json.contacts || []);
      }
    } catch (e) {
      console.error("Error searching contacts:", e);
    } finally {
      setIsSearchingContacts(false);
    }
  };

  // Search existing clients & consumers for Edit modal
  const searchEditContacts = async (query: string) => {
    try {
      setIsSearchingEditContacts(true);
      const res = await fetch(
        `/api/admin/contacts/search?companyId=${encodeURIComponent(companyId)}&query=${encodeURIComponent(query)}`
      );
      const json = await res.json();
      if (json.success) {
        setEditContactResults(json.data || json.contacts || []);
      }
    } catch (e) {
      console.error("Error searching edit contacts:", e);
    } finally {
      setIsSearchingEditContacts(false);
    }
  };

  // Register brand-new client in database on the fly
  const handleRegisterContact = async (name: string, email?: string, phone?: string) => {
    try {
      setIsRegisteringContact(true);
      const res = await fetch("/api/admin/contacts/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, name, email, phone }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (e) {
      console.error("Error registering contact:", e);
    } finally {
      setIsRegisteringContact(false);
    }
    return null;
  };

  // AI Auto-Fill handler
  const handleAiAutoFill = async (target: "CREATE" | "EDIT") => {
    if (!aiPrompt.trim()) return;
    try {
      setIsAiGenerating(true);
      setAiFeedback(null);
      const res = await fetch("/api/documents/ai-populate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          documentType: "INVOICE",
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
            dueDate: data.dueDate || prev.dueDate,
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
            dueDate: data.dueDate || prev.dueDate,
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
        setAiFeedback(json.error || "Failed to generate document details");
      }
    } catch (e: any) {
      setAiFeedback(e.message || "Failed to call AI assistant");
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Open Edit Invoice modal
  const handleOpenEditModal = (inv: any) => {
    setEditingInvoiceId(inv.id);
    setEditForm({
      customerName: inv.customerName || "",
      customerEmail: inv.customerEmail || "",
      customerPhone: inv.customerPhone || "",
      clientId: inv.clientId || "",
      consumerId: inv.consumerId || "",
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : "",
      notes: inv.notes || "",
      terms: inv.terms || "",
      status: inv.status || "PENDING",
      items:
        inv.items && inv.items.length > 0
          ? inv.items.map((it: any) => ({
              description: it.description,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              taxRate: it.taxRate || 0,
              discount: it.discount || 0,
              productId: it.productId || "",
              marketplaceListingId: it.marketplaceListingId || "",
            }))
          : [{ description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0, productId: "", marketplaceListingId: "" }],
    });
    setIsEditModalOpen(true);
  };

  const handleEditAddItem = () => {
    setEditForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", quantity: 1, unitPrice: 0, taxRate: 16, discount: 0, productId: "", marketplaceListingId: "" },
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

  // Submit in-place invoice edit
  const handleSaveEditInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoiceId) return;
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
      const res = await fetch(`/api/admin/invoices/${editingInvoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        setIsEditModalOpen(false);
        setEditingInvoiceId(null);
        fetchInvoices();
      } else {
        alert(json.error || "Failed to save invoice changes");
      }
    } catch (err: any) {
      alert(err.message || "Failed to save invoice changes");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Submit payment against invoice
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setIsSubmittingPayment(true);
      const res = await fetch(`/api/admin/invoices/${selectedInvoice.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RECORD_PAYMENT",
          amountPaid: paymentForm.amountPaid,
          paymentMethod: paymentForm.paymentMethod,
          reference: paymentForm.reference,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsPaymentModalOpen(false);
        setSelectedInvoice(null);
        fetchInvoices();
      } else {
        alert(json.error || "Failed to record payment");
      }
    } catch (err: any) {
      alert(err.message || "Failed to record payment");
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleExecuteShare = async () => {
    try {
      setIsSharing(true);
      setShareFeedback(null);

      let targetsToShare: any[] = [];
      if (shareTargetMode === "SINGLE" && targetInvoiceForShare) {
        targetsToShare = [targetInvoiceForShare];
      } else if (shareTargetMode === "UNPAID") {
        targetsToShare = invoices.filter((i) => i.amountDue > 0);
      } else {
        targetsToShare = invoices;
      }

      if (targetsToShare.length === 0) {
        setShareFeedback("No invoices found to share.");
        return;
      }

      const recipients = targetsToShare.map((inv) => ({
        name: inv.customerName || "Valued Client",
        email: inv.customerEmail || undefined,
        phone: inv.customerPhone || undefined,
        sourceEntityId: inv.id,
      }));

      const res = await fetch("/api/documents/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          documentType: "INVOICE",
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
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Partially Paid
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            Overdue
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
    }
  };

  // Theme Styling Helpers
  const bgClass = isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardBg = isDarkMode
    ? "bg-slate-900/70 border-slate-800/80 hover:border-slate-700/80 shadow-xl backdrop-blur-md"
    : "bg-white border-slate-200/90 hover:border-slate-300 shadow-sm hover:shadow-md backdrop-blur-md";
  const borderClass = isDarkMode ? "border-slate-800/80" : "border-slate-200";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-500";
  const textSubtle = isDarkMode ? "text-slate-300" : "text-slate-700";
  const textTitle = isDarkMode ? "text-white" : "text-slate-900";
  const inputBg = isDarkMode
    ? "bg-slate-900 border-slate-800 text-white focus:border-blue-500 placeholder-slate-500"
    : "bg-white border-slate-300 text-slate-900 focus:border-blue-500 placeholder-slate-400";
  const modalBg = isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900";

  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 sm:p-6 lg:p-8 font-sans ${bgClass}`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER / TOP ACTION BAR */}
        <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b pb-6 ${borderClass}`}>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
              <span className="text-[11px] font-bold tracking-widest text-blue-500 uppercase flex items-center gap-1">
                <SparklesIcon className="h-3.5 w-3.5" /> Billing & Revenue Suite
              </span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${textTitle}`}>
              Invoicing & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">Receivables.</span>
            </h1>
            <p className={`text-sm mt-1 ${textMuted}`}>
              Create commercial invoices, manage collections, and track customer balances for{" "}
              <span className={`font-semibold ${textSubtle}`}>{companyName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Theme Switcher Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>

            {/* Document Template Settings Shortcut */}
            <a
              href={`/admin/${companySlug}/document-settings`}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
              }`}
              title="Customize Invoice & Document Templates"
            >
              <PrinterIcon className="h-4 w-4 text-emerald-500" />
              <span>Doc Templates</span>
            </a>

            {/* Share with Many Bulk Button */}
            <button
              onClick={() => {
                setShareTargetMode("UNPAID");
                setTargetInvoiceForShare(null);
                setShareFeedback(null);
                setIsShareModalOpen(true);
              }}
              disabled={invoices.length === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isDarkMode
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-sm"
              } disabled:opacity-50`}
              title="Bulk Share Invoices with multiple clients via WhatsApp or Email"
            >
              <ShareIcon className="h-4 w-4 text-emerald-500" />
              <span>Share with Many</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchInvoices}
              className={`p-2.5 rounded-xl border transition-all ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
              }`}
              title="Refresh Invoices"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin text-blue-500" : ""}`} />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-95"
            >
              <PlusIcon className="h-4 w-4 stroke-[3px]" /> Create New Invoice
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Total Billed */}
          <div className={`rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 ${cardBg}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Total Invoiced</span>
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <ClipboardDocumentListIcon className="h-4 w-4" />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${textTitle}`}>
              {currency} {metrics.totalBilled.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-2 flex items-center gap-1 ${textMuted}`}>
              <span>Gross cumulative billed sales</span>
            </div>
          </div>

          {/* Total Collected */}
          <div className={`rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 ${cardBg}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Total Collected</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircleIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-500">
              {currency} {metrics.totalPaid.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-2 flex items-center justify-between ${textMuted}`}>
              <span>Collection Rate</span>
              <span className="font-bold text-emerald-500">
                {metrics.totalBilled > 0
                  ? ((metrics.totalPaid / metrics.totalBilled) * 100).toFixed(1)
                  : "0.0"}%
              </span>
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className={`rounded-2xl p-5 border transition-all transform hover:-translate-y-0.5 ${cardBg}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Outstanding AR</span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <ClockIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-500">
              {currency} {metrics.totalOutstanding.toLocaleString()}
            </div>
            <div className={`text-[11px] mt-2 flex items-center justify-between ${textMuted}`}>
              <span>Pending Receivables</span>
              <span className="font-bold text-amber-500">
                {invoices.filter((i) => i.amountDue > 0).length} Invoices
              </span>
            </div>
          </div>

        </div>

        {/* CONTROLS: SEARCH & STATUS FILTER TAB BAR */}
        <div className={`flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 p-3 rounded-2xl border transition-all ${
          isDarkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className={`h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${textMuted}`} />
            <input
              type="text"
              placeholder="Search by invoice #, customer name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchInvoices()}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl font-medium focus:outline-none transition-all ${inputBg}`}
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {["All", "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : isDarkMode
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {st === "PARTIALLY_PAID" ? "Partially Paid" : st}
              </button>
            ))}
          </div>
        </div>

        {/* INVOICES TABLE DATA LIST */}
        <div className={`rounded-2xl border overflow-hidden transition-all ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase font-bold border-b transition-colors ${
                isDarkMode ? "bg-slate-900/90 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                <tr>
                  <th className="py-4 px-5">Invoice #</th>
                  <th className="py-4 px-5">Customer Details</th>
                  <th className="py-4 px-5">Issue Date</th>
                  <th className="py-4 px-5">Due Date</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Total Amount</th>
                  <th className="py-4 px-5 text-right">Balance Due</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderClass}`}>
                {loading ? (
                  <tr>
                    <td colSpan={8} className={`py-16 text-center ${textMuted}`}>
                      <ArrowPathIcon className="h-7 w-7 animate-spin mx-auto mb-3 text-blue-500" />
                      <span className="font-semibold text-xs">Loading commercial ledger...</span>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={`py-16 text-center ${textMuted}`}>
                      <ClipboardDocumentListIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="font-bold text-sm">No Invoices Found</p>
                      <p className="text-xs mt-1">Click "Create New Invoice" to issue your first invoice.</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className={`transition-colors ${
                        isDarkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className={`py-4 px-5 font-extrabold whitespace-nowrap ${textTitle}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          {inv.invoiceNumber}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className={`font-bold text-sm ${textSubtle}`}>{inv.customerName}</div>
                        {inv.customerEmail && (
                          <div className={`text-[10px] ${textMuted}`}>{inv.customerEmail}</div>
                        )}
                      </td>
                      <td className={`py-4 px-5 whitespace-nowrap font-medium ${textSubtle}`}>
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </td>
                      <td className={`py-4 px-5 whitespace-nowrap font-medium ${textSubtle}`}>
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">{getStatusBadge(inv.status)}</td>
                      <td className={`py-4 px-5 text-right font-extrabold text-sm whitespace-nowrap ${textTitle}`}>
                        {currency} {inv.amount.toLocaleString()}
                      </td>
                      <td className={`py-4 px-5 text-right font-black text-sm whitespace-nowrap ${
                        inv.amountDue > 0 ? "text-amber-500" : "text-emerald-500"
                      }`}>
                        {currency} {inv.amountDue.toLocaleString()}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsViewModalOpen(true);
                            }}
                            className={`p-2 rounded-xl transition-all border ${
                              isDarkMode
                                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                            }`}
                            title="Quick View Invoice"
                          >
                            <ClipboardDocumentListIcon className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(inv)}
                            className={`p-2 rounded-xl transition-all border ${
                              isDarkMode
                                ? "bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border-amber-800/60"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                            }`}
                            title="Directly Edit Invoice Details & Line Items"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>

                          <a
                            href={`/api/documents/invoice/${inv.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-xl transition-all border ${
                              isDarkMode
                                ? "bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border-blue-800/60"
                                : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                            }`}
                            title="Generate Official Vector PDF"
                          >
                            <PrinterIcon className="h-4 w-4" />
                          </a>

                          <a
                            href={`/api/documents/invoice/${inv.id}/pdf?download=true`}
                            className={`p-2 rounded-xl transition-all border ${
                              isDarkMode
                                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                            title="Download PDF"
                          >
                            <DocumentArrowDownIcon className="h-4 w-4" />
                          </a>

                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setTargetInvoiceForShare(inv);
                              setShareTargetMode("SINGLE");
                              setShareFeedback(null);
                              setIsShareModalOpen(true);
                            }}
                            className={`p-2 rounded-xl transition-all border ${
                              isDarkMode
                                ? "bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border-emerald-800/60"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                            title="Share Invoice via WhatsApp / Email"
                          >
                            <ShareIcon className="h-4 w-4" />
                          </button>

                          {inv.amountDue > 0 && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentForm({
                                  amountPaid: inv.amountDue.toString(),
                                  paymentMethod: "MPESA",
                                  reference: "",
                                });
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all transform active:scale-95"
                            >
                              Receive Payment
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

      </div>

      {/* MODAL 1: CREATE INVOICE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border transition-all my-8 ${modalBg}`}>
            
            {/* Modal Header */}
            <div className={`flex justify-between items-center border-b pb-4 ${borderClass}`}>
              <div>
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">New Transaction</span>
                <h3 className={`text-xl font-black ${textTitle}`}>Create Business Invoice</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiOpen(!isAiOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-sm transition-all"
                  title="Auto-populate invoice details using Gemini AI"
                >
                  <SparklesIcon className="h-4 w-4 text-amber-300 animate-pulse" />
                  <span>AI Auto-Fill</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`p-2 rounded-xl hover:opacity-70 ${textMuted}`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* AI Auto-Fill Assistant Drawer */}
            {isAiOpen && (
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  isDarkMode ? "bg-purple-950/20 border-purple-800/40" : "bg-purple-50/70 border-purple-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                    <SparklesIcon className="h-4 w-4" /> AI Document Assistant
                  </span>
                  <span className="text-[10px] text-slate-400">Describe what you need in plain English</span>
                </div>
                <textarea
                  rows={2}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Invoice for 3 Solar Panels 400W at 25,000 each and Inverter 5kVA at 120,000, 16% VAT, client is John Mwangi 0712345678, due in 14 days"
                  className={`w-full p-2.5 rounded-xl border text-xs font-medium resize-none ${inputBg}`}
                />
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() =>
                        setAiPrompt(
                          "Invoice for 10 Office Chairs @ 4,500 and 2 Executive Desks @ 25,000 to Apex Consult, phone 0722112233, 16% VAT, due in 30 days"
                        )
                      }
                      className={`px-2 py-1 rounded-lg border ${borderClass} hover:opacity-80 transition-opacity`}
                    >
                      Office furniture
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAiPrompt(
                          "Annual Cloud Hosting & Domain Renewal $150, SSL Certificate $50 to Global Logistics Ltd, email billing@globallogistics.com"
                        )
                      }
                      className={`px-2 py-1 rounded-lg border ${borderClass} hover:opacity-80 transition-opacity`}
                    >
                      IT services
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAiAutoFill("CREATE")}
                    disabled={isAiGenerating || !aiPrompt.trim()}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isAiGenerating ? (
                      <>
                        <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-3.5 w-3.5" />
                        <span>Generate Details</span>
                      </>
                    )}
                  </button>
                </div>
                {aiFeedback && (
                  <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                    {aiFeedback}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-5 text-xs">
              {/* Section 1: Customer Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-extrabold uppercase text-[11px] text-blue-500 tracking-wider">
                    Customer Information
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] hidden sm:inline ${textMuted}`}>
                      Select from directory or add new
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewCustomerTarget("CREATE");
                        setNewCustomerForm({ name: form.customerName || "", email: form.customerEmail || "", phone: form.customerPhone || "" });
                        setIsNewCustomerModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 transition-all"
                    >
                      <UserPlusIcon className="h-3.5 w-3.5" />
                      <span>+ New Customer</span>
                    </button>
                  </div>
                </div>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl border ${
                    isDarkMode ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  {/* Customer Name with Live Combobox */}
                  <div className="relative">
                    <label className={`block font-bold mb-1.5 ${textSubtle}`}>Customer / Company *</label>
                    <input
                      type="text"
                      required
                      placeholder="Search existing or type new..."
                      value={form.customerName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, customerName: val });
                        searchContacts(val);
                        setShowContactDropdown(true);
                      }}
                      onFocus={() => {
                        searchContacts(form.customerName);
                        setShowContactDropdown(true);
                      }}
                      className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                    />

                    {/* Autocomplete Dropdown */}
                    {showContactDropdown && (form.customerName.trim().length > 0 || contactResults.length > 0) && (
                      <div
                        className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl ${
                          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="p-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <span>Existing System Contacts</span>
                          <button
                            type="button"
                            onClick={() => setShowContactDropdown(false)}
                            className="hover:underline text-slate-500"
                          >
                            Close
                          </button>
                        </div>
                        {contactResults.map((c) => (
                          <div
                            key={`${c.type}-${c.id}`}
                            onClick={() => {
                              setForm({
                                ...form,
                                customerName: c.name,
                                customerEmail: c.email || form.customerEmail,
                                customerPhone: c.phone || form.customerPhone,
                                clientId: c.type === "CLIENT" ? c.id : "",
                                consumerId: c.type === "CONSUMER" ? c.id : "",
                              });
                              setShowContactDropdown(false);
                            }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">{c.name}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                                  c.type === "CLIENT"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-purple-500/10 text-purple-500"
                                }`}
                              >
                                {c.type}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5">
                              {c.email && <span>{c.email}</span>}
                              {c.phone && <span>{c.phone}</span>}
                            </div>
                          </div>
                        ))}

                        {/* Option to register new client on the fly */}
                        {form.customerName.trim() &&
                          !contactResults.some(
                            (c) => c.name.toLowerCase() === form.customerName.trim().toLowerCase()
                          ) && (
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                disabled={isRegisteringContact}
                                onClick={async () => {
                                  const created = await handleRegisterContact(
                                    form.customerName,
                                    form.customerEmail,
                                    form.customerPhone
                                  );
                                  if (created) {
                                    setForm({
                                      ...form,
                                      customerName: created.name,
                                      customerEmail: created.email || form.customerEmail,
                                      customerPhone: created.phone || form.customerPhone,
                                      clientId: created.id,
                                    });
                                    setShowContactDropdown(false);
                                  }
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                              >
                                <UserPlusIcon className="h-3.5 w-3.5" />
                                <span>Save "{form.customerName}" to Clients database</span>
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className={`block font-bold mb-1.5 ${textSubtle}`}>Customer Email</label>
                    <input
                      type="email"
                      placeholder="accounts@acme.com"
                      value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1.5 ${textSubtle}`}>Customer Phone</label>
                    <input
                      type="tel"
                      placeholder="e.g. 0712345678"
                      value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block font-bold mb-1.5 ${textSubtle}`}>Due Date *</label>
                    <input
                      type="date"
                      required
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Line Items */}
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h4 className="font-extrabold uppercase text-[11px] text-blue-500 tracking-wider">
                    Invoice Items ({form.items.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProductPicker("CREATE")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 font-bold text-[11px] border border-blue-500/20 transition-all shadow-sm"
                    >
                      <BuildingStorefrontIcon className="h-4 w-4" />
                      <span>Browse Marketplace Catalog</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-all"
                    >
                      <PlusIcon className="h-3.5 w-3.5 stroke-[3px]" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {form.items.map((it, idx) => {
                    const gross = (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0);
                    const disc = gross * ((Number(it.discount) || 0) / 100);
                    const net = gross - disc;
                    const tax = net * ((Number(it.taxRate) || 0) / 100);
                    const lineTotal = net + tax;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all ${
                          isDarkMode ? "bg-slate-950/40 border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-2.5 items-center">
                          {/* Description + Catalog Picker Button */}
                          <div className="col-span-12 sm:col-span-4">
                            <div className="flex justify-between items-center mb-1">
                              <label className={`block text-[10px] font-bold uppercase ${textMuted}`}>Description</label>
                              <button
                                type="button"
                                onClick={() => handleOpenProductPicker("CREATE", idx)}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 hover:underline"
                                title="Select a product from your catalog for this line"
                              >
                                <BuildingStorefrontIcon className="h-3 w-3" />
                                <span>Catalog</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Product or service name"
                              value={it.description}
                              onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                              className={`w-full text-xs rounded-xl px-3 py-2 border font-medium ${inputBg}`}
                            />
                          </div>

                          {/* Qty */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>Qty</label>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              required
                              value={it.quantity}
                              onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-2 py-2 border text-center font-bold ${inputBg}`}
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>Price ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={it.unitPrice}
                              onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-3 py-2 border font-bold ${inputBg}`}
                            />
                          </div>

                          {/* Tax % */}
                          <div className="col-span-4 sm:col-span-1">
                            <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted}`}>Tax%</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={it.taxRate}
                              onChange={(e) => handleItemChange(idx, "taxRate", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-1 py-2 border text-center font-medium ${inputBg}`}
                            />
                          </div>

                          {/* Disc % */}
                          <div className="col-span-4 sm:col-span-1">
                            <label className={`block text-[10px] font-bold uppercase mb-1 ${textMuted} text-emerald-600 dark:text-emerald-400`}>
                              Disc%
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              placeholder="0"
                              value={it.discount}
                              onChange={(e) => handleItemChange(idx, "discount", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-1 py-2 border text-center font-bold text-emerald-600 dark:text-emerald-400 ${inputBg}`}
                            />
                          </div>

                          {/* Row Total & Delete */}
                          <div className="col-span-8 sm:col-span-2 flex items-center justify-end gap-2 pt-3 sm:pt-0">
                            <div className="text-right">
                              <span className={`text-xs font-black block ${textTitle}`}>
                                {currency} {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                              </span>
                              {disc > 0 && (
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
                                  save -{currency} {disc.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                </span>
                              )}
                            </div>
                            {form.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
                                title="Remove Line Item"
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

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div
                  className={`w-80 space-y-2 p-4 rounded-2xl border ${
                    isDarkMode ? "bg-slate-950/70 border-slate-800" : "bg-slate-100 border-slate-200"
                  }`}
                >
                  <div className={`flex justify-between text-xs ${textMuted}`}>
                    <span>Gross Subtotal:</span>
                    <span className="font-semibold">
                      {currency} {computedTotals.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {computedTotals.discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="flex items-center gap-1">
                        <TagIcon className="h-3.5 w-3.5" /> Total Discounts Given:
                      </span>
                      <span>
                        - {currency} {computedTotals.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className={`flex justify-between text-xs ${textMuted}`}>
                    <span>Net Taxable Subtotal:</span>
                    <span className="font-semibold">
                      {currency} {computedTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`flex justify-between text-xs ${textMuted}`}>
                    <span>Estimated Tax (16%):</span>
                    <span className="font-semibold">
                      {currency} {computedTotals.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`flex justify-between font-black text-sm pt-2 border-t ${borderClass} ${textTitle}`}>
                    <span>Total Amount Due:</span>
                    <span className="text-blue-500">
                      {currency} {computedTotals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Terms & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Terms & Conditions</label>
                  <input
                    type="text"
                    value={form.terms}
                    onChange={(e) => setForm({ ...form, terms: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                  />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${textSubtle}`}>Notes / Payment Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Bank details or payment paybill numbers"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className={`flex justify-end gap-3 pt-4 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                    isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Generating Invoice..." : "Generate Invoice"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border transition-all ${modalBg}`}>
            <div className={`flex justify-between items-center border-b pb-3 ${borderClass}`}>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Receivables Settlement</span>
                <h3 className={`text-base font-bold ${textTitle}`}>Record Customer Payment</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className={`hover:opacity-70 ${textMuted}`}>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className={`text-xs space-y-2 p-3.5 rounded-xl border ${
              isDarkMode ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex justify-between"><span className={textMuted}>Invoice #:</span> <span className={`font-bold ${textTitle}`}>{selectedInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className={textMuted}>Customer:</span> <span className={`font-bold ${textTitle}`}>{selectedInvoice.customerName}</span></div>
              <div className="flex justify-between"><span className={textMuted}>Total Billed:</span> <span className={`font-bold ${textTitle}`}>{currency} {selectedInvoice.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className={textMuted}>Current Balance Due:</span> <span className="font-black text-amber-500">{currency} {selectedInvoice.amountDue.toLocaleString()}</span></div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Amount Received ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-black ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                >
                  <option value="MPESA">M-Pesa Mobile Money</option>
                  <option value="CASH">Cash Payment</option>
                  <option value="BANK">Bank Wire / EFT</option>
                  <option value="CARD">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Transaction Reference / Code</label>
                <input
                  type="text"
                  placeholder="e.g. MPESA Ref Code or Bank Receipt #"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>

              <div className={`flex justify-end gap-2 pt-4 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {isSubmittingPayment ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW / PRINT OFFICIAL INVOICE */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl my-8 print:p-0 print:shadow-none print:m-0">
            
            {/* Invoice Print Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <div className="flex items-center gap-2 text-blue-600 font-black text-xl">
                  <DocumentCheckIcon className="h-6 w-6" /> {companyName}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Commercial Invoice & Delivery Statement</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">{selectedInvoice.invoiceNumber}</span>
                <p className="text-xs text-slate-500 mt-1">Issue Date: {new Date(selectedInvoice.issueDate).toLocaleDateString()}</p>
                <p className="text-xs text-rose-600 font-bold">Due Date: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill To Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Billed To:</span>
                <div className="text-sm font-bold text-slate-900 mt-1">{selectedInvoice.customerName}</div>
                {selectedInvoice.customerEmail && <div className="text-slate-600 mt-0.5">{selectedInvoice.customerEmail}</div>}
                {selectedInvoice.customerPhone && <div className="text-slate-600">{selectedInvoice.customerPhone}</div>}
              </div>
              <div className="text-right">
                <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider">Payment Status:</span>
                <div className="mt-1 font-black text-sm">{selectedInvoice.status}</div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items?.map((it: any, i: number) => (
                    <tr key={i}>
                      <td className="py-3 px-4 font-semibold text-slate-800">{it.description}</td>
                      <td className="py-3 px-4 text-center font-medium">{it.quantity}</td>
                      <td className="py-3 px-4 text-right font-medium">{currency} {it.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{currency} {it.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Breakdown */}
            <div className="flex justify-end">
              <div className="w-60 space-y-1.5 text-right text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{currency} {(selectedInvoice.subtotal || selectedInvoice.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-sm pt-1.5 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span>{currency} {selectedInvoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Amount Paid:</span>
                  <span>{currency} {(selectedInvoice.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-rose-600 text-base pt-1.5 border-t border-slate-200">
                  <span>Balance Due:</span>
                  <span>{currency} {selectedInvoice.amountDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedInvoice.terms && (
              <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3">
                <span className="font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Terms & Conditions</span>
                {selectedInvoice.terms}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-t border-slate-200 pt-5 print:hidden">
              <div className="flex items-center gap-2">
                <a
                  href={`/api/documents/invoice/${selectedInvoice.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <PrinterIcon className="h-4 w-4" /> Print / View PDF
                </a>

                <a
                  href={`/api/documents/invoice/${selectedInvoice.id}/pdf?download=true`}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" /> Download PDF
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setTargetInvoiceForShare(selectedInvoice);
                    setShareTargetMode("SINGLE");
                    setShareFeedback(null);
                    setIsShareModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <ShareIcon className="h-4 w-4" /> Share via WhatsApp / Email
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditModal(selectedInvoice);
                    setIsViewModalOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                >
                  <PencilSquareIcon className="h-4 w-4" /> Edit Invoice
                </button>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/admin/${companySlug}/document-settings`}
                  className="px-3 py-2 text-slate-500 hover:text-slate-900 text-xs font-semibold underline"
                >
                  Change Template
                </a>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: SHARE INVOICE(S) VIA WHATSAPP / EMAIL */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border transition-all my-8 ${modalBg}`}>
            {/* Header */}
            <div className={`flex justify-between items-start border-b pb-4 ${borderClass}`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Multi-Channel Distribution</span>
                <h3 className={`text-base font-bold ${textTitle}`}>
                  {shareTargetMode === "SINGLE" && targetInvoiceForShare
                    ? `Share Invoice ${targetInvoiceForShare.invoiceNumber}`
                    : `Share Invoices with Many Clients`}
                </h3>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  Dispatch official PDF documents directly via WhatsApp and/or Email.
                </p>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className={`p-1.5 rounded-lg hover:opacity-70 transition-opacity ${textMuted}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scope selector if multiple invoices */}
            {shareTargetMode !== "SINGLE" && (
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold ${textSubtle}`}>Target Invoices</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShareTargetMode("UNPAID")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      shareTargetMode === "UNPAID"
                        ? "bg-amber-500/10 border-amber-500 text-amber-500"
                        : `${borderClass} ${textMuted} hover:border-slate-400`
                    }`}
                  >
                    Unpaid Only ({invoices.filter((i) => i.amountDue > 0).length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareTargetMode("ALL")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      shareTargetMode === "ALL"
                        ? "bg-blue-500/10 border-blue-500 text-blue-500"
                        : `${borderClass} ${textMuted} hover:border-slate-400`
                    }`}
                  >
                    All Displayed ({invoices.length})
                  </button>
                </div>
              </div>
            )}

            {/* Channel Selection */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${textSubtle}`}>Delivery Channel</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShareChannel("WHATSAPP")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    shareChannel === "WHATSAPP"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                      : `${borderClass} ${textMuted} hover:border-slate-400`
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setShareChannel("EMAIL")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    shareChannel === "EMAIL"
                      ? "bg-blue-500/10 border-blue-500 text-blue-500"
                      : `${borderClass} ${textMuted} hover:border-slate-400`
                  }`}
                >
                  <EnvelopeIcon className="h-4 w-4" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setShareChannel("BOTH")}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                    shareChannel === "BOTH"
                      ? "bg-purple-500/10 border-purple-500 text-purple-500"
                      : `${borderClass} ${textMuted} hover:border-slate-400`
                  }`}
                >
                  <ShareIcon className="h-4 w-4" /> Both
                </button>
              </div>
            </div>

            {/* Custom Cover Message */}
            <div className="space-y-1.5">
              <label className={`block text-xs font-bold ${textSubtle}`}>
                Custom Message / Cover Note (Optional)
              </label>
              <textarea
                rows={2}
                value={customShareMessage}
                onChange={(e) => setCustomShareMessage(e.target.value)}
                placeholder="e.g. Please find attached your latest invoice. Thank you for your continued business!"
                className={`w-full p-2.5 rounded-xl border text-xs font-medium resize-none ${inputBg}`}
              />
            </div>

            {/* Recipients Summary List */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-bold ${textSubtle}`}>
                  Recipients List (
                  {shareTargetMode === "SINGLE" && targetInvoiceForShare
                    ? 1
                    : shareTargetMode === "UNPAID"
                    ? invoices.filter((i) => i.amountDue > 0).length
                    : invoices.length}
                  )
                </span>
                <span className={`text-[10px] ${textMuted}`}>PDF will be generated individually</span>
              </div>
              <div
                className={`max-h-36 overflow-y-auto divide-y rounded-xl border p-2 text-xs ${
                  isDarkMode
                    ? "bg-slate-950/60 border-slate-800 divide-slate-800"
                    : "bg-slate-50 border-slate-200 divide-slate-200"
                }`}
              >
                {(shareTargetMode === "SINGLE" && targetInvoiceForShare
                  ? [targetInvoiceForShare]
                  : shareTargetMode === "UNPAID"
                  ? invoices.filter((i) => i.amountDue > 0)
                  : invoices
                ).map((inv: any, idx: number) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className={`font-bold truncate ${textTitle}`}>{inv.customerName}</div>
                      <div className={`text-[10px] ${textMuted}`}>{inv.invoiceNumber} • {currency} {inv.amountDue.toLocaleString()} due</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          inv.customerEmail
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                        title={inv.customerEmail || "No email"}
                      >
                        Email {inv.customerEmail ? "✓" : "✗"}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          inv.customerPhone
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-slate-500/10 text-slate-400"
                        }`}
                        title={inv.customerPhone || "No phone"}
                      >
                        WA {inv.customerPhone ? "✓" : "✗"}
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
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                }`}
              >
                {shareFeedback}
              </div>
            )}

            {/* Modal Actions */}
            <div className={`flex justify-end gap-2.5 pt-3 border-t ${borderClass}`}>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                disabled={isSharing}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isDarkMode
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
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
                            shareTargetMode === "UNPAID"
                              ? invoices.filter((i) => i.amountDue > 0).length
                              : invoices.length
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
      {/* 5. EDIT INVOICE MODAL (IN-PLACE ADMIN UPDATE WITH LIVE TOTALS & AI)      */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div
            className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${modalBg}`}
          >
            {/* Header */}
            <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${borderClass}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <PencilSquareIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-xl font-bold flex items-center gap-2 ${textTitle}`}>
                    Edit Invoice Details
                  </h3>
                  <p className={`text-xs ${textMuted}`}>
                    Direct in-place update of customer, line items, taxes, notes, and status.
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
                  className={`p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors ${
                    isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
                  }`}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* AI Assistant Drawer inside Edit Modal */}
            {isAiOpen && (
              <div className="p-4 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-slate-900/40 border-b border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <SparklesIcon className="h-4 w-4" /> AI Document Assistant (Edit Mode)
                  </span>
                  <span className="text-[11px] text-slate-400">Gemini 2.0 & heuristic parsing</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Update customer to Acme Corp, change rate to 15000, add 5% discount"
                    className={`flex-1 text-xs rounded-xl px-3 py-2 border ${inputBg} focus:outline-none`}
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
            <form onSubmit={handleSaveEditInvoice} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Customer Information & Status */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${textMuted}`}>
                    1. Customer & Metadata
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCustomerTarget("EDIT");
                      setNewCustomerForm({ name: editForm.customerName || "", email: editForm.customerEmail || "", phone: editForm.customerPhone || "" });
                      setIsNewCustomerModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 transition-all"
                  >
                    <UserPlusIcon className="h-3.5 w-3.5" />
                    <span>+ New Customer</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Customer Name with Live Directory Search */}
                  <div className="sm:col-span-2 relative">
                    <label className={`block text-xs font-bold mb-1.5 ${textSubtle}`}>
                      Customer / Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.customerName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditForm({ ...editForm, customerName: val });
                        searchEditContacts(val);
                        setShowEditContactDropdown(true);
                      }}
                      onFocus={() => {
                        searchEditContacts(editForm.customerName);
                        setShowEditContactDropdown(true);
                      }}
                      className={`w-full text-xs rounded-xl px-3.5 py-2.5 border ${inputBg}`}
                      placeholder="Search existing or type customer name..."
                    />

                    {/* Edit Modal Autocomplete Dropdown */}
                    {showEditContactDropdown && (editForm.customerName.trim().length > 0 || editContactResults.length > 0) && (
                      <div
                        className={`absolute left-0 right-0 top-full mt-1 z-30 max-h-48 overflow-y-auto rounded-xl border shadow-xl ${
                          isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="p-1.5 text-[10px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <span>Directory Contacts</span>
                          <button
                            type="button"
                            onClick={() => setShowEditContactDropdown(false)}
                            className="hover:underline text-slate-500"
                          >
                            Close
                          </button>
                        </div>
                        {editContactResults.map((c) => (
                          <div
                            key={`${c.type}-${c.id}`}
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                customerName: c.name,
                                customerEmail: c.email || editForm.customerEmail,
                                customerPhone: c.phone || editForm.customerPhone,
                                clientId: c.type === "CLIENT" ? c.id : "",
                                consumerId: c.type === "CONSUMER" ? c.id : "",
                              });
                              setShowEditContactDropdown(false);
                            }}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs">{c.name}</span>
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                                  c.type === "CLIENT"
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-purple-500/10 text-purple-500"
                                }`}
                              >
                                {c.type}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5">
                              {c.email && <span>{c.email}</span>}
                              {c.phone && <span>{c.phone}</span>}
                            </div>
                          </div>
                        ))}

                        {/* Option to register new client on the fly */}
                        {editForm.customerName.trim() &&
                          !editContactResults.some(
                            (c) => c.name.toLowerCase() === editForm.customerName.trim().toLowerCase()
                          ) && (
                            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                disabled={isRegisteringContact}
                                onClick={async () => {
                                  const created = await handleRegisterContact(
                                    editForm.customerName,
                                    editForm.customerEmail,
                                    editForm.customerPhone
                                  );
                                  if (created) {
                                    setEditForm({
                                      ...editForm,
                                      customerName: created.name,
                                      customerEmail: created.email || editForm.customerEmail,
                                      customerPhone: created.phone || editForm.customerPhone,
                                      clientId: created.id,
                                    });
                                    setShowEditContactDropdown(false);
                                  }
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                              >
                                <UserPlusIcon className="h-3.5 w-3.5" />
                                <span>Save "{editForm.customerName}" to Clients database</span>
                              </button>
                            </div>
                          )}
                      </div>
                    )}
                  </div>

                  {/* Customer Email */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${textSubtle}`}>Email Address</label>
                    <input
                      type="email"
                      value={editForm.customerEmail}
                      onChange={(e) => setEditForm({ ...editForm, customerEmail: e.target.value })}
                      className={`w-full text-xs rounded-xl px-3.5 py-2.5 border ${inputBg}`}
                      placeholder="client@example.com"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${textSubtle}`}>Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.customerPhone}
                      onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                      className={`w-full text-xs rounded-xl px-3.5 py-2.5 border ${inputBg}`}
                      placeholder="+254 712 345678"
                    />
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${textSubtle}`}>Due Date</label>
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                      className={`w-full text-xs rounded-xl px-3.5 py-2.5 border ${inputBg}`}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 ${textSubtle}`}>Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className={`w-full text-xs rounded-xl px-3.5 py-2.5 border ${inputBg}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
                      <option value="PAID">PAID</option>
                      <option value="OVERDUE">OVERDUE</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h4 className={`text-xs font-extrabold uppercase tracking-wider ${textMuted}`}>
                    2. Line Items ({editForm.items.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProductPicker("EDIT")}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 border border-blue-500/20 flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <BuildingStorefrontIcon className="h-3.5 w-3.5" />
                      <span>Browse Marketplace Catalog</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleEditAddItem}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center gap-1 transition-all"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
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
                        className={`p-3 rounded-2xl border transition-all ${
                          isDarkMode ? "bg-slate-800/40 border-slate-700/60" : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="grid grid-cols-12 gap-2.5 items-center">
                          {/* Description + Catalog Button */}
                          <div className="col-span-12 sm:col-span-4">
                            <div className="flex justify-between items-center mb-1">
                              <label className={`block text-[10px] font-bold ${textMuted}`}>Description</label>
                              <button
                                type="button"
                                onClick={() => handleOpenProductPicker("EDIT", idx)}
                                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 hover:underline"
                                title="Select a product from your catalog for this line"
                              >
                                <BuildingStorefrontIcon className="h-3 w-3" />
                                <span>Catalog</span>
                              </button>
                            </div>
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => handleEditItemChange(idx, "description", e.target.value)}
                              className={`w-full text-xs rounded-xl px-3 py-2 border ${inputBg}`}
                              placeholder="Product or service name"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Qty</label>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              required
                              value={item.quantity}
                              onChange={(e) => handleEditItemChange(idx, "quantity", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-3 py-2 border ${inputBg}`}
                            />
                          </div>

                          {/* Unit Price */}
                          <div className="col-span-4 sm:col-span-2">
                            <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Price ({currency})</label>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              required
                              value={item.unitPrice}
                              onChange={(e) => handleEditItemChange(idx, "unitPrice", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-3 py-2 border ${inputBg}`}
                            />
                          </div>

                          {/* Tax % */}
                          <div className="col-span-4 sm:col-span-1">
                            <label className={`block text-[10px] font-bold mb-1 ${textMuted}`}>Tax%</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              value={item.taxRate}
                              onChange={(e) => handleEditItemChange(idx, "taxRate", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-2 py-2 border ${inputBg} text-center`}
                            />
                          </div>

                          {/* Discount % */}
                          <div className="col-span-4 sm:col-span-1">
                            <label className={`block text-[10px] font-bold mb-1 text-emerald-600 dark:text-emerald-400`}>Disc%</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="any"
                              placeholder="0"
                              value={item.discount}
                              onChange={(e) => handleEditItemChange(idx, "discount", Number(e.target.value))}
                              className={`w-full text-xs rounded-xl px-2 py-2 border font-bold text-emerald-600 dark:text-emerald-400 ${inputBg} text-center`}
                            />
                          </div>

                          {/* Row Total & Delete */}
                          <div className="col-span-8 sm:col-span-2 flex items-center justify-end gap-2 pt-3 sm:pt-0">
                            <div className="text-right">
                              <span className={`text-xs font-black block ${textTitle}`} title={lineTotal.toFixed(2)}>
                                {currency} {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                              </span>
                              {disc > 0 && (
                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block">
                                  save -{currency} {disc.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                </span>
                              )}
                            </div>
                            {editForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleEditRemoveItem(idx)}
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex-shrink-0"
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
                  <label className={`block text-xs font-bold mb-1.5 ${textSubtle}`}>Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={editForm.terms}
                    onChange={(e) => setEditForm({ ...editForm, terms: e.target.value })}
                    className={`w-full text-xs rounded-xl p-3 border ${inputBg}`}
                    placeholder="Payment terms, bank details, warranties..."
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${textSubtle}`}>Internal Notes / Memo</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className={`w-full text-xs rounded-xl p-3 border ${inputBg}`}
                    placeholder="Notes visible to company staff..."
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 ${
                  isDarkMode ? "bg-slate-800/30 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className={`text-xs ${textMuted}`}>
                  Amounts recalculate in real-time as items, quantities, or discounts are modified.
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-right">
                  <div>
                    <div className={`text-[10px] font-bold ${textMuted}`}>Gross Subtotal</div>
                    <div className={`text-xs font-bold ${textSubtle}`}>
                      {currency} {computedEditTotals.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  {computedEditTotals.discount > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-emerald-500">Total Discounts</div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        - {currency} {computedEditTotals.discount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className={`text-[10px] font-bold ${textMuted}`}>Net Subtotal</div>
                    <div className={`text-xs font-bold ${textSubtle}`}>
                      {currency} {computedEditTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <div className={`text-[10px] font-bold ${textMuted}`}>Tax</div>
                    <div className={`text-xs font-bold ${textSubtle}`}>
                      {currency} {computedEditTotals.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="pl-4 border-l border-slate-700/40">
                    <div className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">Total</div>
                    <div className={`text-lg font-black ${textTitle}`}>
                      {currency} {computedEditTotals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className={`flex justify-end gap-3 pt-4 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmittingEdit}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isDarkMode
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
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
                      <span>Save Invoice Updates</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PRODUCT CATALOG & MARKETPLACE SELECTOR MODAL                         */}
      {/* ========================================================================= */}
      {isProductPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div
            className={`w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${modalBg}`}
          >
            {/* Header */}
            <div className={`p-5 border-b flex items-center justify-between gap-4 ${borderClass}`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <BuildingStorefrontIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold flex items-center gap-2 ${textTitle}`}>
                    Marketplace & Catalog Products
                  </h3>
                  <p className={`text-xs ${textMuted}`}>
                    Select an item to auto-populate description, unit price, and default discount.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className={`p-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors ${
                  isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
                }`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className={`p-4 border-b space-y-3 ${borderClass} ${isDarkMode ? "bg-slate-900/50" : "bg-slate-50/70"}`}>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    fetchProductsCatalog(e.target.value);
                  }}
                  placeholder="Search catalog products by name, SKU, or description..."
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-medium ${inputBg} focus:outline-none`}
                />
                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch("");
                      fetchProductsCatalog("");
                    }}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Products List Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
              {isLoadingProducts ? (
                <div className="py-16 text-center">
                  <ArrowPathIcon className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                  <p className={`text-xs font-semibold ${textMuted}`}>Querying marketplace products catalog...</p>
                </div>
              ) : productsList.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBagIcon className="h-10 w-10 mx-auto mb-2 text-slate-400 opacity-40" />
                  <p className="font-bold text-sm">No Products Found</p>
                  <p className={`text-xs mt-1 ${textMuted}`}>
                    {productSearch
                      ? `No products matching "${productSearch}". Try another keyword.`
                      : "No products currently available in this company inventory."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {productsList.map((prod) => {
                    const price = Number(prod.sellingPrice) || 0;
                    const disc = Number(prod.discount) || 0;
                    const imageUrl = prod.images && prod.images[0]?.url ? prod.images[0].url : null;

                    return (
                      <div
                        key={prod.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between hover:border-blue-500/50 ${
                          isDarkMode ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/50" : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            {imageUrl ? (
                              <img src={imageUrl} alt={prod.name} className="h-full w-full object-cover" />
                            ) : (
                              <ShoppingBagIcon className="h-6 w-6 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h5 className={`font-bold text-xs truncate ${textTitle}`}>{prod.name}</h5>
                              {prod.sku && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                                  {prod.sku}
                                </span>
                              )}
                            </div>
                            {prod.category?.name && (
                              <span className="text-[10px] text-blue-500 font-semibold block mt-0.5">
                                {prod.category.name}
                              </span>
                            )}
                            {prod.description && (
                              <p className={`text-[11px] line-clamp-1 mt-0.5 ${textMuted}`}>{prod.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className={`font-extrabold text-sm ${textTitle}`}>
                                {currency} {price.toLocaleString()}
                              </span>
                              {disc > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                                  {disc}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectProduct(prod)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                          >
                            <span>Select Item</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-4 border-t flex justify-end ${borderClass}`}>
              <button
                type="button"
                onClick={() => setIsProductPickerOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. QUICK REGISTER NEW CUSTOMER MODAL                                     */}
      {/* ========================================================================= */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all p-6 space-y-4 ${modalBg}`}
          >
            <div className={`flex justify-between items-start border-b pb-3 ${borderClass}`}>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">Directory</span>
                <h3 className={`text-base font-bold ${textTitle}`}>Add New Customer / Client</h3>
                <p className={`text-xs mt-0.5 ${textMuted}`}>
                  Creates an authoritative record in your tenant database and selects them.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className={`p-1.5 rounded-lg hover:opacity-70 ${textMuted}`}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe or Acme Corporation"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="accounts@acme.com"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block font-bold mb-1 ${textSubtle}`}>Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+254 712 345678"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border font-medium ${inputBg}`}
                />
              </div>

              <div className={`flex justify-end gap-2.5 pt-3 border-t ${borderClass}`}>
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${
                    isDarkMode ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewCustomer}
                  className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmittingNewCustomer ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="h-4 w-4" />
                      <span>Save & Select Customer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}