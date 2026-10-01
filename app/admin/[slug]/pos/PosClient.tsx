"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  PrinterIcon,
  ArrowPathIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  ScissorsIcon,
  CheckCircleIcon,
  ClockIcon,
  FireIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  TagIcon,
  TableCellsIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { useStoreContext } from "@/contexts/StoreContext";
import { IStoreCategory, MarketListingForm } from "@/types/typings";
import POSSessionHeader from "@/components/pos/POSSessionHeader";
import POSOperatorModal from "@/components/pos/POSOperatorModal";
import POSCustomerSelector from "@/components/pos/POSCustomerSelector";
import POSHeldOrdersModal from "@/components/pos/POSHeldOrdersModal";
import { standardReceipt } from "@/lib/receipts/standardReceipt";
import type {
  POSCustomerRecord,
  POSOperatorInfo,
  POSSessionInfo,
  POSHeldOrder,
  RestaurantTableRecord,
  RestaurantAreaRecord,
  TableStatusType,
} from "@/types/pos";

export type RestaurantOrderItem = MarketListingForm & {
  cartItemId: string;
  price: number;
  finalPrice: number;
  quantity: number;
  subtotal: number;
  course: "STARTER" | "MAIN" | "DESSERT" | "BEVERAGE";
  kitchenStatus?: "PENDING" | "SENT" | "COOKING" | "READY" | "SERVED";
  notes?: string;
};

interface PosClientProps {
  initialProducts?: MarketListingForm[];
  initialCategories?: IStoreCategory[];
  companyId: string;
  userName: string;
  userId: string | null;
}

export default function PosClient({
  companyId,
  initialProducts = [],
  initialCategories = [],
  userName,
  userId,
}: PosClientProps) {
  const { storeFormData } = useStoreContext();
  const primaryColor = storeFormData?.themeSettings?.primaryColor || "#4f46e5";
  const currencySymbol = storeFormData?.currency || "USD";

  // Operator & Session State
  const [operator, setOperator] = useState<POSOperatorInfo | null>(null);
  const [posSession, setPosSession] = useState<POSSessionInfo | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Restaurant Tables & Areas State
  const [areas, setAreas] = useState<RestaurantAreaRecord[]>([]);
  const [tables, setTables] = useState<RestaurantTableRecord[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [activeTable, setActiveTable] = useState<RestaurantTableRecord | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);

  // Table Opening Modal State
  const [openTableModalTarget, setOpenTableModalTarget] = useState<RestaurantTableRecord | null>(null);
  const [openGuestCount, setOpenGuestCount] = useState<number>(2);
  const [openServiceMode, setOpenServiceMode] = useState<"DINE_IN" | "TAKEAWAY" | "COUNTER">("DINE_IN");
  const [openTableNotes, setOpenTableNotes] = useState<string>("");
  const [isOpeningTable, setIsOpeningTable] = useState(false);

  // Active Table Order / Cart State
  const [orderItems, setOrderItems] = useState<RestaurantOrderItem[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<POSCustomerRecord | null>(null);
  const [activeCourse, setActiveCourse] = useState<"STARTER" | "MAIN" | "DESSERT" | "BEVERAGE">("MAIN");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [kitchenSent, setKitchenSent] = useState<boolean>(false);

  // Held Orders State
  const [heldOrders, setHeldOrders] = useState<POSHeldOrder[]>([]);
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState(false);

  // Modals for Restaurant Actions
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetTableId, setTransferTargetTableId] = useState<string>("");
  const [transferReason, setTransferReason] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeSourceTableId, setMergeSourceTableId] = useState<string>("");
  const [isMerging, setIsMerging] = useState(false);

  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState<number>(2);
  const [isSplitting, setIsSplitting] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile" | "split">("cash");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Menu Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Check Active Session on Mount
  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch(`/api/pos/session?companyId=${encodeURIComponent(companyId)}&terminalId=T01`);
        const data = await res.json();
        const sessionData = data.data || data.session;
        if (res.ok && sessionData && isMounted) {
          setPosSession({
            id: sessionData.id,
            terminalId: sessionData.terminalId,
            status: sessionData.status,
            openedAt: sessionData.openedAt,
          });
          if (sessionData.operator) {
            setOperator(sessionData.operator);
          }
          setShowAuthModal(false);
        } else if (isMounted) {
          setShowAuthModal(true);
        }
      } catch (err) {
        console.error("Error checking POS session", err);
        if (isMounted) setShowAuthModal(true);
      }
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, [companyId]);

  // Load Restaurant Areas & Tables
  const fetchRestaurantLayout = useCallback(async () => {
    try {
      setLoadingTables(true);
      const [areasRes, tablesRes] = await Promise.all([
        fetch(`/api/pos/restaurant/areas?companyId=${encodeURIComponent(companyId)}`),
        fetch(`/api/pos/restaurant/tables?companyId=${encodeURIComponent(companyId)}`),
      ]);

      if (areasRes.ok) {
        const areasJson = await areasRes.json();
        if (areasJson.data) setAreas(areasJson.data);
      }

      if (tablesRes.ok) {
        const tablesJson = await tablesRes.json();
        if (tablesJson.data) setTables(tablesJson.data);
      }
    } catch (err) {
      console.error("Error fetching restaurant layout", err);
    } finally {
      setLoadingTables(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchRestaurantLayout();
  }, [fetchRestaurantLayout]);

  // Table Selection & Loading Table State
  const handleSelectTable = (table: RestaurantTableRecord) => {
    setActiveTable(table);
    if (table.currentSession) {
      setActiveSession(table.currentSession);
      setOpenGuestCount(table.currentSession.guestCount || table.capacity || 2);
    } else {
      setActiveSession(null);
    }

    // Load active order if table has an open order
    if (table.currentOrder && table.currentOrder.orderItems) {
      const items: RestaurantOrderItem[] = table.currentOrder.orderItems.map((oi: any) => ({
        id: oi.marketplaceListingId,
        cartItemId: `${oi.id || oi.marketplaceListingId}-${Date.now()}`,
        name: oi.name,
        price: oi.price,
        finalPrice: oi.price,
        sellingPrice: oi.price,
        quantity: oi.quantity,
        subtotal: oi.totalPrice,
        course: (oi.course as any) || "MAIN",
        kitchenStatus: oi.kitchenStatus || "SENT",
        images: oi.images || [],
        category: oi.category || "Food",
      }));
      setOrderItems(items);
      setKitchenSent(true);
      if (table.currentOrder.customer) {
        setCurrentCustomer({
          id: table.currentOrder.customer.id,
          name: table.currentOrder.customer.name,
          email: table.currentOrder.customer.email,
          phone: table.currentOrder.customer.phone,
        });
      }
    } else {
      setOrderItems([]);
      setKitchenSent(false);
      setCurrentCustomer(null);
    }
  };

  // Open Table Session
  const handleConfirmOpenTable = async () => {
    if (!openTableModalTarget) return;
    setIsOpeningTable(true);
    try {
      const res = await fetch("/api/pos/restaurant/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          tableId: openTableModalTarget.id,
          openedById: operator?.id || userId || "staff-pos",
          guestCount: openGuestCount,
          serviceMode: openServiceMode,
          notes: openTableNotes,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to open table");
      }

      await fetchRestaurantLayout();
      const updatedTable: RestaurantTableRecord = {
        ...openTableModalTarget,
        status: "OCCUPIED",
        guestCount: openGuestCount,
        currentSession: json.data,
      };
      handleSelectTable(updatedTable);
      setOpenTableModalTarget(null);
      setOpenTableNotes("");
    } catch (err: any) {
      alert(err.message || "Error opening table");
    } finally {
      setIsOpeningTable(false);
    }
  };

  // Add Item to Ticket
  const handleAddItemToTicket = (product: MarketListingForm) => {
    setOrderItems((prev) => {
      const price = Number(product.sellingPrice || product.finalPrice || 0);
      const existingIndex = prev.findIndex(
        (i) => i.id === product.id && i.course === activeCourse && i.kitchenStatus !== "SENT"
      );

      if (existingIndex > -1) {
        const copy = [...prev];
        const item = copy[existingIndex];
        const newQty = item.quantity + 1;
        copy[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.price,
        };
        return copy;
      }

      const newItem: RestaurantOrderItem = {
        ...product,
        cartItemId: `${product.id}-${activeCourse}-${Date.now()}`,
        price,
        finalPrice: price,
        quantity: 1,
        subtotal: price,
        course: activeCourse,
        kitchenStatus: "PENDING",
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateItemQuantity = (cartItemId: string, delta: number) => {
    setOrderItems((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.price,
            };
          }
          return item;
        })
        .filter(Boolean) as RestaurantOrderItem[];
    });
  };

  // Calculations
  const subtotal = useMemo(
    () => orderItems.reduce((acc, item) => acc + item.subtotal, 0),
    [orderItems]
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxAmount = (subtotal - discountAmount) * 0.16; // 16% standard VAT
  const totalAmount = subtotal - discountAmount + taxAmount;

  // Send Order to Kitchen
  const handleSendToKitchen = async () => {
    if (orderItems.length === 0) return alert("Ticket has no items to send to the kitchen.");
    try {
      // If table has no existing active order, create/hold order first
      const orderPayload = {
        companyId,
        cashierId: operator?.id || userId || "pos-staff",
        cashierName: operator?.name || userName,
        cashierEmail: operator?.email || "cashier@pos.local",
        posSessionId: posSession?.id,
        tableId: activeTable?.id,
        tableSessionId: activeSession?.id,
        tableNumber: activeTable?.tableNumber,
        guestCount: openGuestCount,
        serviceMode: openServiceMode,
        channel: "POS",
        actorType: "STAFF",
        isWalkIn: !currentCustomer,
        customerType: currentCustomer ? "IDENTIFIED" : "WALK_IN",
        customer: currentCustomer
          ? {
              name: currentCustomer.name,
              email: currentCustomer.email,
              phone: currentCustomer.phone,
            }
          : {
              name: `Table ${activeTable?.tableNumber || "Order"} Guest`,
              email: "walkin@pos.local",
              phone: "0000000000",
            },
        items: orderItems.map((item) => ({
          marketplaceListingId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.subtotal,
          course: item.course,
          kitchenStatus: "COOKING",
        })),
        isHeld: true,
        heldNote: `Restaurant Floor Order - Table ${activeTable?.tableNumber || "Direct"}`,
        totalPrice: totalAmount,
        subTotal: subtotal,
        taxTotal: taxAmount,
        discountTotal: discountAmount,
      };

      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to dispatch to kitchen");

      const createdOrderId = json.order?.id || json.data?.id;

      if (createdOrderId) {
        await fetch("/api/pos/restaurant/kitchen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyId,
            orderId: createdOrderId,
            staffName: operator?.name || userName,
          }),
        });
      }

      setKitchenSent(true);
      setOrderItems((prev) =>
        prev.map((i) => ({ ...i, kitchenStatus: "COOKING" }))
      );

      // Print Kitchen Order Ticket (KOT)
      const kotContent = `
        <div style="font-family: monospace; width: 280px; padding: 10px;">
          <h2 style="text-align: center; margin: 0 0 4px 0;">KITCHEN TICKET (KOT)</h2>
          <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 6px 0; margin: 8px 0; font-size: 13px;">
            <div><strong>TABLE: ${activeTable?.tableNumber || "N/A"}</strong> | Guests: ${openGuestCount}</div>
            <div>Server: ${operator?.name || userName} | Time: ${new Date().toLocaleTimeString()}</div>
          </div>
          <div style="font-size: 14px;">
            ${orderItems
              .map(
                (item) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span>[${item.course}] ${item.name}</span>
                <strong>x${item.quantity}</strong>
              </div>
            `
              )
              .join("")}
          </div>
          ${orderNotes ? `<div style="margin-top: 8px; font-size: 12px; font-style: italic;">Note: ${orderNotes}</div>` : ""}
        </div>
      `;
      printHtml(kotContent);
      await fetchRestaurantLayout();
      alert(`Order sent to kitchen for Table ${activeTable?.tableNumber}!`);
    } catch (err: any) {
      alert(err.message || "Failed to dispatch order to kitchen");
    }
  };

  // Hold Active Order
  const handleHoldOrder = () => {
    if (orderItems.length === 0) return alert("Ticket is empty.");
    const newHeld: POSHeldOrder = {
      id: `held-${Date.now()}`,
      sessionId: posSession?.id || "default",
      heldAt: new Date().toISOString(),
      note: `Table ${activeTable?.tableNumber || "Order"} - ${orderItems.length} items`,
      customer: currentCustomer,
      tableNumber: activeTable?.tableNumber,
      items: orderItems,
      subtotal,
      discount: discountPercent,
      tax: taxAmount,
      total: totalAmount,
    };
    setHeldOrders((prev) => [newHeld, ...prev]);
    setOrderItems([]);
    setActiveTable(null);
    alert("Ticket held successfully!");
  };

  // Resume Held Order
  const handleResumeHeldOrder = (held: POSHeldOrder) => {
    setOrderItems(held.items);
    if (held.customer) setCurrentCustomer(held.customer);
    setDiscountPercent(held.discount || 0);
    setHeldOrders((prev) => prev.filter((o) => o.id !== held.id));
  };

  // Discard Held Order
  const handleDeleteHeldOrder = (id: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Transfer Table
  const handleConfirmTransfer = async () => {
    if (!activeTable || !transferTargetTableId) return;
    setIsTransferring(true);
    try {
      const res = await fetch("/api/pos/restaurant/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          transferType: "TABLE",
          fromTableId: activeTable.id,
          toTableId: transferTargetTableId,
          staffId: operator?.id || userId || "staff-pos",
          staffName: operator?.name || userName,
          reason: transferReason || "Customer request",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Transfer failed");

      setShowTransferModal(false);
      setTransferTargetTableId("");
      setTransferReason("");
      await fetchRestaurantLayout();
      alert(`Party successfully transferred to destination table.`);
      setActiveTable(null);
    } catch (err: any) {
      alert(err.message || "Table transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  // Merge Tables
  const handleConfirmMerge = async () => {
    if (!activeTable || !mergeSourceTableId) return;
    setIsMerging(true);
    try {
      // Find orders for activeTable and source table
      const sourceTable = tables.find((t) => t.id === mergeSourceTableId);
      if (!sourceTable?.currentOrderId || !activeTable?.currentOrderId) {
        throw new Error("Both tables must have active kitchen orders to merge.");
      }

      const res = await fetch("/api/pos/restaurant/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          sourceOrderId: sourceTable.currentOrderId,
          targetOrderId: activeTable.currentOrderId,
          staffId: operator?.id || userId || "staff-pos",
          staffName: operator?.name || userName,
          reason: "Customer requested bill consolidation",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Merge failed");

      setShowMergeModal(false);
      setMergeSourceTableId("");
      await fetchRestaurantLayout();
      alert(`Bills merged successfully into Table ${activeTable.tableNumber}.`);
    } catch (err: any) {
      alert(err.message || "Bill merge failed");
    } finally {
      setIsMerging(false);
    }
  };

  // Split Bill
  const handleConfirmSplit = async () => {
    if (!activeTable?.currentOrderId) {
      return alert("Save/Send order to kitchen first before splitting.");
    }
    setIsSplitting(true);
    try {
      const splitAmount = totalAmount / splitCount;
      const splitsArray = Array.from({ length: splitCount }, (_, i) => ({
        splitIndex: i + 1,
        label: `Guest ${i + 1}`,
        amount: Number(splitAmount.toFixed(2)),
      }));

      const res = await fetch("/api/pos/restaurant/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          orderId: activeTable.currentOrderId,
          splitType: "EQUAL",
          splits: splitsArray,
          staffId: operator?.id || userId || "staff-pos",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Split failed");

      setShowSplitModal(false);
      alert(`Bill split into ${splitCount} equal payments of ${currencySymbol} ${splitAmount.toFixed(2)}.`);
    } catch (err: any) {
      alert(err.message || "Bill split failed");
    } finally {
      setIsSplitting(false);
    }
  };

  // Finalize Payment & Close Table
  const handleFinalizePayment = async () => {
    if (orderItems.length === 0) return alert("Ticket is empty.");
    setIsProcessingPayment(true);
    try {
      const paymentPayload = {
        companyId,
        cashierId: operator?.id || userId || "pos-staff",
        cashierName: operator?.name || userName,
        cashierEmail: operator?.email || "cashier@pos.local",
        posSessionId: posSession?.id,
        tableId: activeTable?.id,
        tableSessionId: activeSession?.id,
        tableNumber: activeTable?.tableNumber,
        guestCount: openGuestCount,
        serviceMode: openServiceMode,
        channel: "POS",
        actorType: "STAFF",
        isWalkIn: !currentCustomer,
        customerType: currentCustomer ? "IDENTIFIED" : "WALK_IN",
        customer: currentCustomer
          ? {
              name: currentCustomer.name,
              email: currentCustomer.email,
              phone: currentCustomer.phone,
            }
          : {
              name: `Table ${activeTable?.tableNumber || "POS"} Walk-in`,
              email: "walkin@pos.local",
              phone: "0000000000",
            },
        items: orderItems.map((item) => ({
          marketplaceListingId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.subtotal,
          course: item.course,
          kitchenStatus: "SERVED",
        })),
        totalPrice: totalAmount,
        subTotal: subtotal,
        taxTotal: taxAmount,
        discountTotal: discountAmount,
        paymentStatus: "PAID",
        paymentOption: paymentMethod === "cash" ? "CASH" : paymentMethod === "card" ? "CARD" : "MOBILE_MONEY",
        paidAmount: totalAmount,
      };

      const res = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to process payment");

      // Print Customer Receipt
      const receiptData = {
        storeName: storeFormData?.name || "Restaurant & Bar",
        storeAddress: storeFormData?.address || "",
        storePhone: storeFormData?.contactPhone || "",
        transactionId: json.order?.trackingNumber || json.data?.trackingNumber || `TXN-${Date.now()}`,
        cashierName: operator?.name || userName,
        customerName: currentCustomer ? currentCustomer.name : "Walk-in Guest",
        currencySymbol,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        tableNumber: activeTable?.tableNumber,
        guestCount: openGuestCount,
        serviceMode: openServiceMode,
        items: orderItems.map((i) => ({
          name: `[${i.course}] ${i.name}`,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.subtotal,
        })),
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        amountReceived: Number(cashTendered) || totalAmount,
        changeGiven: Math.max(0, (Number(cashTendered) || totalAmount) - totalAmount),
      };

      const receiptHtml = standardReceipt.generateThermalHtml(receiptData);
      printHtml(receiptHtml);

      // Close Table Session
      if (activeSession?.id) {
        await fetch(
          `/api/pos/restaurant/sessions?companyId=${encodeURIComponent(companyId)}&sessionId=${encodeURIComponent(activeSession.id)}`,
          { method: "DELETE" }
        );
      }

      setShowPaymentModal(false);
      setOrderItems([]);
      setActiveTable(null);
      setActiveSession(null);
      await fetchRestaurantLayout();
      alert("Payment Complete! Receipt sent to printer. Table is now available.");
    } catch (err: any) {
      alert(err.message || "Payment failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const printHtml = (html: string) => {
    if ((window as any).chrome?.webview) {
      (window as any).chrome.webview.postMessage({ type: "PRINT_HTML_RECEIPT", payload: html });
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`<html><head><title>Receipt</title><style>@page { size: 80mm auto; margin: 0; } body { font-family: sans-serif; margin: 0; padding: 10px; }</style></head><body>${html}</body></html>`);
      doc.close();
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }
  };

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchArea = selectedAreaId === "ALL" || t.areaId === selectedAreaId;
      const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchArea && matchStatus;
    });
  }, [tables, selectedAreaId, statusFilter]);

  // Filtered Menu Items
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      const matchCat =
        selectedCategory === "ALL" ||
        p.productCategoryId === selectedCategory ||
        p.category === selectedCategory;
      const matchSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [initialProducts, selectedCategory, searchTerm]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. Header with Operator, Drawer, Staff PIN, Held Orders */}
      <POSSessionHeader
        companyId={companyId}
        companyName={storeFormData?.name || "Restaurant POS"}
        operator={operator}
        posSession={posSession}
        onEndSession={() => {
          setOperator(null);
          setPosSession(null);
          setShowAuthModal(true);
        }}
        onLockTerminal={() => setShowAuthModal(true)}
        heldOrdersCount={heldOrders.length}
        onOpenHeldOrders={() => setShowHeldOrdersModal(true)}
        currencySymbol={currencySymbol}
      />

      {/* 2. Main Terminal Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* FLOOR MAP VIEW (When no active table is focused) */}
        {!activeTable ? (
          <div className="flex-1 flex flex-col overflow-hidden p-6 bg-slate-900/60">
            {/* Floor Navigation & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                  <TableCellsIcon className="w-7 h-7 text-indigo-400" />
                  <span>Floor & Dining Layout</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Select a table to open a session, take orders, or settle bills
                </p>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
                {["ALL", "AVAILABLE", "OCCUPIED", "WAITING_PAYMENT"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      statusFilter === st
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "ALL" ? "All Tables" : st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 custom-scroll border-b border-slate-800">
              <button
                onClick={() => setSelectedAreaId("ALL")}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                  selectedAreaId === "ALL"
                    ? "bg-white text-slate-900 border-white shadow-md"
                    : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                All Areas ({tables.length})
              </button>
              {areas.map((area) => {
                const count = tables.filter((t) => t.areaId === area.id).length;
                return (
                  <button
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      selectedAreaId === area.id
                        ? "bg-white text-slate-900 border-white shadow-md"
                        : "bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white"
                    }`}
                  >
                    {area.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Tables Grid */}
            <div className="flex-1 overflow-y-auto custom-scroll pr-2">
              {loadingTables ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <ArrowPathIcon className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <TableCellsIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="font-bold text-base">No tables found</p>
                  <p className="text-xs">Adjust your area or status filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredTables.map((table) => {
                    const isOccupied = table.status === "OCCUPIED" || table.status === "ORDERING";
                    const isWaitingPayment = table.status === "WAITING_PAYMENT";
                    const isAvailable = table.status === "AVAILABLE";

                    let statusBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                    if (isOccupied) statusBg = "bg-amber-500/10 border-amber-500/40 text-amber-400";
                    if (isWaitingPayment) statusBg = "bg-purple-500/10 border-purple-500/40 text-purple-300";

                    return (
                      <motion.div
                        key={table.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isAvailable) {
                            setOpenTableModalTarget(table);
                            setOpenGuestCount(table.capacity || 2);
                          } else {
                            handleSelectTable(table);
                          }
                        }}
                        className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between h-44 shadow-lg ${
                          isAvailable
                            ? "bg-slate-900/80 border-slate-800 hover:border-emerald-500"
                            : isWaitingPayment
                            ? "bg-purple-950/20 border-purple-800/60 hover:border-purple-500"
                            : "bg-slate-900/90 border-slate-700/80 hover:border-amber-400"
                        }`}
                      >
                        {/* Table Top Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xl text-white">
                            Table {table.tableNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${statusBg}`}
                          >
                            {table.status}
                          </span>
                        </div>

                        {/* Middle Info */}
                        <div className="my-2 space-y-1">
                          <div className="text-xs text-slate-400 flex items-center gap-1.5">
                            <UserGroupIcon className="w-4 h-4 text-slate-500" />
                            <span>
                              {table.guestCount ? `${table.guestCount} guests` : `Seats ${table.capacity}`}
                            </span>
                          </div>
                          {table.areaName && (
                            <p className="text-[11px] text-slate-500 font-semibold">{table.areaName}</p>
                          )}
                          {table.elapsedMinutes !== undefined && table.elapsedMinutes > 0 && (
                            <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                              <ClockIcon className="w-3.5 h-3.5" />
                              <span>{table.elapsedMinutes} mins</span>
                            </div>
                          )}
                        </div>

                        {/* Bottom Action / Total */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                          {isAvailable ? (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <PlusIcon className="w-4 h-4" /> Open Table
                            </span>
                          ) : (
                            <span className="text-xs font-black text-white font-mono">
                              {currencySymbol} {(table.currentOrder?.totalPrice || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ACTIVE TABLE WORKSPACE: MENU & ORDER TICKET */
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Dishes / Menu Catalogue */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden border-r border-slate-800 bg-slate-900/40">
              {/* Back to Floor + Table Info */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTable(null)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span>Floor Map</span>
                  </button>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <span>Table {activeTable.tableNumber}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40">
                        {openGuestCount} Guests
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {activeTable.areaName || "Main Hall"} • Opened by {operator?.name || userName}
                    </p>
                  </div>
                </div>

                {/* Course Selector Tabs */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {(["STARTER", "MAIN", "DESSERT", "BEVERAGE"] as const).map((course) => (
                    <button
                      key={course}
                      onClick={() => setActiveCourse(course)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                        activeCourse === course
                          ? "bg-indigo-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Categories Bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    placeholder="Search menu dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-semibold focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  {initialCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Menu Grid */}
              <div className="flex-1 overflow-y-auto custom-scroll pr-2 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleAddItemToTicket(product)}
                    className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 hover:border-indigo-500 cursor-pointer flex flex-col justify-between group shadow-md"
                  >
                    <div className="aspect-video w-full rounded-xl bg-slate-700/50 overflow-hidden mb-2 relative">
                      <img
                        src={product.images?.[0] || "https://placehold.co/200x120?text=Dish"}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                      <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[10px] font-bold text-slate-300 px-1.5 py-0.5 rounded">
                        {activeCourse}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white truncate">{product.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{product.category}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-black text-indigo-400 text-sm">
                        {currencySymbol} {(product.sellingPrice || product.finalPrice || 0).toFixed(2)}
                      </span>
                      <div className="p-1 rounded-lg bg-indigo-600/30 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <PlusIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Active Ticket & Order Sidebar */}
            <div className="w-full lg:w-[440px] flex flex-col bg-slate-900 border-l border-slate-800 p-5">
              {/* Ticket Header & Customer */}
              <div className="pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBagIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-black text-base text-white">
                      Order Ticket • Table {activeTable.tableNumber}
                    </h3>
                  </div>
                  {kitchenSent && (
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <FireIcon className="w-3 h-3" /> In Kitchen
                    </span>
                  )}
                </div>

                {/* Optional Customer Selector */}
                <POSCustomerSelector
                  companyId={companyId}
                  selectedCustomer={currentCustomer}
                  onSelectCustomer={setCurrentCustomer}
                  required={false}
                />
              </div>

              {/* Ticket Items List Grouped by Course */}
              <div className="flex-1 overflow-y-auto custom-scroll py-3 space-y-2 pr-1">
                {orderItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <ShoppingBagIcon className="w-10 h-10 mb-2 opacity-30" />
                    <p className="text-xs font-bold">Ticket is empty</p>
                    <p className="text-[10px]">Select items from menu catalogue</p>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-indigo-900/60 text-indigo-300">
                            {item.course}
                          </span>
                          <h5 className="font-bold text-xs text-white truncate">{item.name}</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {currencySymbol} {item.price.toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateItemQuantity(item.cartItemId, -1)}
                          className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          <MinusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs w-5 text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateItemQuantity(item.cartItemId, 1)}
                          className="p-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                        >
                          <PlusIcon className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-black text-xs text-indigo-300 ml-2 w-16 text-right">
                          {currencySymbol} {item.subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Operational Actions (Transfer, Merge, Split, Hold) */}
              <div className="py-2.5 border-t border-slate-800 grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Move to another table"
                >
                  <ArrowsRightLeftIcon className="w-4 h-4 text-sky-400" />
                  <span>Transfer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowMergeModal(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Merge bills from another table"
                >
                  <DocumentDuplicateIcon className="w-4 h-4 text-amber-400" />
                  <span>Merge</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSplitModal(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Split bill between guests"
                >
                  <ScissorsIcon className="w-4 h-4 text-purple-400" />
                  <span>Split</span>
                </button>

                <button
                  type="button"
                  onClick={handleHoldOrder}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition border border-slate-700"
                  title="Hold cart and free terminal"
                >
                  <ClockIcon className="w-4 h-4 text-emerald-400" />
                  <span>Hold</span>
                </button>
              </div>

              {/* Financial Breakdown */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-200">
                    {currencySymbol} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Discount</span>
                  <span className="font-mono text-rose-400">
                    -{currencySymbol} {discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax (16% VAT)</span>
                  <span className="font-mono text-slate-200">
                    {currencySymbol} {taxAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-800">
                  <span>Total Due</span>
                  <span className="font-mono text-indigo-400 text-lg">
                    {currencySymbol} {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Kitchen KOT & Settlement */}
              <div className="pt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleSendToKitchen}
                  disabled={orderItems.length === 0}
                  className="py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <FireIcon className="w-4 h-4" />
                  <span>Send KOT</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={orderItems.length === 0}
                  className="py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CreditCardIcon className="w-4 h-4" />
                  <span>Pay & Close</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Open Table Session Modal */}
      {openTableModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">
                Open Table {openTableModalTarget.tableNumber}
              </h3>
              <button
                onClick={() => setOpenTableModalTarget(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Guest Count</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenGuestCount((prev) => Math.max(1, prev - 1))}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={openGuestCount}
                    onChange={(e) => setOpenGuestCount(Number(e.target.value))}
                    className="flex-1 text-center py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setOpenGuestCount((prev) => prev + 1)}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Service Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["DINE_IN", "TAKEAWAY", "COUNTER"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setOpenServiceMode(m)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        openServiceMode === m
                          ? "bg-indigo-600 border-indigo-500 text-white shadow"
                          : "bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Table Notes / Requests
                </label>
                <textarea
                  placeholder="e.g. Window preference, High chair requested..."
                  value={openTableNotes}
                  onChange={(e) => setOpenTableNotes(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmOpenTable}
                disabled={isOpeningTable}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isOpeningTable ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Open Table & Start Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Transfer Table Modal */}
      {showTransferModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">
                Transfer Table {activeTable.tableNumber}
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Select Destination Table
                </label>
                <select
                  value={transferTargetTableId}
                  onChange={(e) => setTransferTargetTableId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Target Table --</option>
                  {tables
                    .filter((t) => t.id !== activeTable.id && t.status === "AVAILABLE")
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} ({t.areaName || "Area"}, Seats {t.capacity})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">Reason</label>
                <input
                  placeholder="e.g. Customer requested outdoor seating"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={!transferTargetTableId || isTransferring}
                className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isTransferring ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowsRightLeftIcon className="w-4 h-4" />
                    <span>Complete Table Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Merge Bills Modal */}
      {showMergeModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">
                Merge Into Table {activeTable.tableNumber}
              </h3>
              <button
                onClick={() => setShowMergeModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Consolidates all items from the chosen table into Table {activeTable.tableNumber}'s bill
                and marks the source table available.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Select Source Table to Merge
                </label>
                <select
                  value={mergeSourceTableId}
                  onChange={(e) => setMergeSourceTableId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white font-semibold focus:outline-none"
                >
                  <option value="">-- Choose Occupied Table --</option>
                  {tables
                    .filter((t) => t.id !== activeTable.id && (t.status === "OCCUPIED" || t.status === "ORDERING"))
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.tableNumber} ({currencySymbol} {(t.currentOrder?.totalPrice || 0).toFixed(2)})
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleConfirmMerge}
                disabled={!mergeSourceTableId || isMerging}
                className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isMerging ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>Merge Bills</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Split Bill Modal */}
      {showSplitModal && activeTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-white">Split Bill</h3>
              <button
                onClick={() => setShowSplitModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex justify-between items-center text-sm">
                <span className="text-slate-400">Total to Split:</span>
                <span className="font-black text-white font-mono">
                  {currencySymbol} {totalAmount.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Number of Ways (Equal Split)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSplitCount((prev) => Math.max(2, prev - 1))}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-lg">
                    {splitCount} Guests
                  </div>
                  <button
                    type="button"
                    onClick={() => setSplitCount((prev) => prev + 1)}
                    className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 text-white font-bold"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/50 text-center">
                <p className="text-xs text-indigo-300 font-semibold">Each Guest Pays:</p>
                <p className="text-2xl font-black text-white font-mono mt-0.5">
                  {currencySymbol} {(totalAmount / splitCount).toFixed(2)}
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfirmSplit}
                disabled={isSplitting}
                className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                {isSplitting ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ScissorsIcon className="w-4 h-4" />
                    <span>Confirm {splitCount}-Way Split</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Pay & Close Table Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-white">Settle & Close Table</h3>
                <p className="text-xs text-slate-400">
                  {activeTable ? `Table ${activeTable.tableNumber}` : "POS Sale"} • Total:{" "}
                  <strong className="text-white font-mono">
                    {currencySymbol} {totalAmount.toFixed(2)}
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { id: "cash", label: "Cash", icon: BanknotesIcon },
                { id: "card", label: "Card", icon: CreditCardIcon },
                { id: "mobile", label: "Mobile / M-Pesa", icon: DevicePhoneMobileIcon },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === m.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  <m.icon className="w-5 h-5" />
                  <span className="text-xs font-bold">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Cash Drawer Calculator */}
            {paymentMethod === "cash" && (
              <div className="space-y-3 mb-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <label className="text-xs font-bold text-slate-300 block">Amount Tendered</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-mono text-sm">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={totalAmount.toFixed(2)}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-lg font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Quick Cash Presets */}
                <div className="flex gap-2">
                  {[totalAmount, Math.ceil(totalAmount / 10) * 10, Math.ceil(totalAmount / 50) * 50, Math.ceil(totalAmount / 100) * 100].map(
                    (preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCashTendered(preset.toString())}
                        className="flex-1 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-mono font-bold text-slate-200 transition"
                      >
                        {preset.toFixed(0)}
                      </button>
                    )
                  )}
                </div>

                {/* Change Due Display */}
                {Number(cashTendered) > totalAmount && (
                  <div className="flex justify-between items-center pt-2 text-sm">
                    <span className="text-emerald-400 font-bold">Change Due:</span>
                    <span className="text-emerald-400 font-black font-mono text-base">
                      {currencySymbol} {(Number(cashTendered) - totalAmount).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Payment Button */}
            <button
              type="button"
              onClick={handleFinalizePayment}
              disabled={isProcessingPayment}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-base shadow-xl shadow-indigo-600/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {isProcessingPayment ? (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PrinterIcon className="w-5 h-5" />
                  <span>Complete Payment & Print Receipt</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 8. Staff PIN Login Modal */}
      <POSOperatorModal
        isOpen={showAuthModal}
        companyId={companyId}
        terminalId={posSession?.terminalId || "T01"}
        storeName={storeFormData?.name || "Restaurant POS"}
        onSuccess={(data) => {
          setOperator(data.operator);
          setPosSession(data.posSession);
          setShowAuthModal(false);
        }}
      />

      {/* 9. Held Orders Modal */}
      <POSHeldOrdersModal
        isOpen={showHeldOrdersModal}
        onClose={() => setShowHeldOrdersModal(false)}
        heldOrders={heldOrders}
        onResumeOrder={handleResumeHeldOrder}
        onDeleteHeldOrder={handleDeleteHeldOrder}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}