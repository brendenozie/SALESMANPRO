// app/admin/[slug]/billing/page.tsx
import React from "react";
import BillingClient from "./BillingClient";
import { useParams } from "next/navigation";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export interface TransactionItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  type: "Subscription" | "Refund" | "Add-on Purchase";
  status: "Completed" | "Pending" | "Failed" | "Refunded";
  paymentMethod: string; // e.g., "Credit Card", "PayPal", "Bank Transfer"
  transactionDate: string;
  invoiceId: string | null;
  description: string;
}

export interface InvoiceItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amountDue: number;
  currency: string;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue";
  downloadUrl: string; // URL to download the invoice PDF
  periodStart: string;
  periodEnd: string;
  issuedDate: string;
  lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
}

interface PageProps {
  params: Promise<{ slug: string }>; // companyId
  searchParams: Promise<{
    page?: string;
    limit?: string;
    transactionStatus?: string;
    transactionType?: string;
    invoiceStatus?: string;
  }>;
}

export default async function BillingPage({ params, searchParams }: PageProps) {
  const { slug: companyId } = await params;
  const {
    page = "1",
    limit = "10",
    transactionStatus = "",
    transactionType = "",
    invoiceStatus = "",
  } = await searchParams;

  // convert query params to numbers for proper typing
  const pageNumber = Number.isFinite(Number(page)) ? parseInt(page, 10) : 1;
  const limitNumber = Number.isFinite(Number(limit)) ? parseInt(limit, 10) : 10;

  let transactionsData: TransactionItem[] = [];
  let totalTransactionItems = 0;
  let totalTransactionPages = 0;
  let invoicesData: InvoiceItem[] = [];
  let totalInvoiceItems = 0;
  let totalInvoicePages = 0;

  try {
    // Fetch transactions from the new API route
    const transactionsResponse = await fetch(
      `${apiBaseUrl}/admin/billing/transactions?page=${pageNumber}&limit=${limitNumber}&status=${transactionStatus}&type=${transactionType}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Credentials': 'include', // Include cookies for authentication if needed
        },
      }

    );
    const transactionsResult = (await transactionsResponse.json()).data;
    transactionsData = transactionsResult.transactionsData || [];
    totalTransactionItems = transactionsResult.totalTransactionItems || 0;
    totalTransactionPages = transactionsResult.totalTransactionPages || 0;
    
    // Fetch invoices from the new API route
    const invoicesResponse = await fetch(
      `${apiBaseUrl}/admin/billing/invoices?page=${pageNumber}&limit=${limitNumber}&status=${invoiceStatus}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Credentials': 'include', // Include cookies for authentication if needed
        },
      }
    );
    const invoicesResult = (await invoicesResponse.json()).data;
    invoicesData = invoicesResult.invoicesData || [];
    totalInvoiceItems = invoicesResult.totalInvoiceItems || 0;
    totalInvoicePages = invoicesResult.totalInvoicePages || 0;

  } catch (err: any) {
    console.error("[BillingPage] Error fetching data:", err.message);
  }

  return (
    <BillingClient
      companyId={companyId}
      transactions={transactionsData}
      totalTransactionItems={totalTransactionItems}
      totalTransactionPages={totalTransactionPages}
      currentTransactionPage={pageNumber}
      transactionsPerPage={limitNumber}
      
      invoices={invoicesData}
      totalInvoiceItems={totalInvoiceItems}
      totalInvoicePages={totalInvoicePages}
      currentInvoicePage={pageNumber}
      invoicesPerPage={limitNumber}
    />
  );
}


// // app/admin/[slug]/billing/page.tsx
// import React from "react";
// import BillingClient from "./BillingClient";

// export interface TransactionItem {
//   id: string;
//   userId: string;
//   userName: string;
//   userEmail: string;
//   amount: number;
//   currency: string;
//   type: "Subscription" | "Refund" | "Add-on Purchase";
//   status: "Completed" | "Pending" | "Failed" | "Refunded";
//   paymentMethod: string; // e.g., "Credit Card", "PayPal", "Bank Transfer"
//   transactionDate: string;
//   invoiceId: string | null;
//   description: string;
// }

// export interface InvoiceItem {
//   id: string;
//   userId: string;
//   userName: string;
//   userEmail: string;
//   amountDue: number;
//   currency: string;
//   dueDate: string;
//   status: "Paid" | "Unpaid" | "Overdue";
//   downloadUrl: string; // URL to download the invoice PDF
//   periodStart: string;
//   periodEnd: string;
//   issuedDate: string;
//   lineItems: { description: string; quantity: number; unitPrice: number; total: number }[];
// }

// interface PageProps {
//   params:Promise<{ slug: string }> // companyId
//   searchParams: {
//     page?: string;
//     limit?: string;
//     transactionStatus?: string;
//     transactionType?: string;
//     invoiceStatus?: string;
//   };
// }

// // Dummy data generation
// const generateDummyTransactions = (companyId: string, count: number): TransactionItem[] => {
//   const transactions: TransactionItem[] = [];
//   const types = ["Subscription", "Refund", "Add-on Purchase"];
//   const statuses = ["Completed", "Pending", "Failed", "Refunded"];
//   const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer"];

//   for (let i = 1; i <= count; i++) {
//     const userId = `user-${Math.floor(Math.random() * 100) + 1}-${companyId}`;
//     const userName = `User ${Math.floor(Math.random() * 100) + 1} Name`;
//     const userEmail = `user${Math.floor(Math.random() * 100) + 1}@example.com`;
//     const amount = parseFloat((Math.random() * 200 + 10).toFixed(2));
//     const type = types[Math.floor(Math.random() * types.length)];
//     const status = statuses[Math.floor(Math.random() * statuses.length)];
//     const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
//     const transactionDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
//     const invoiceId = status === "Completed" && type === "Subscription" ? `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : null;
//     const description = `${type} for ${userName}`;

//     transactions.push({
//       id: `trx-${i}-${companyId}`,
//       userId,
//       userName,
//       userEmail,
//       amount,
//       currency: "USD",
//       type: type as "Subscription" | "Refund" | "Add-on Purchase",
//       status: status as "Completed" | "Pending" | "Failed" | "Refunded",
//       paymentMethod,
//       transactionDate,
//       invoiceId,
//       description,
//     });
//   }
//   return transactions;
// };

// const generateDummyInvoices = (companyId: string, count: number): InvoiceItem[] => {
//   const invoices: InvoiceItem[] = [];
//   const statuses = ["Paid", "Unpaid", "Overdue"];

//   for (let i = 1; i <= count; i++) {
//     const userId = `user-${Math.floor(Math.random() * 100) + 1}-${companyId}`;
//     const userName = `User ${Math.floor(Math.random() * 100) + 1} Name`;
//     const userEmail = `user${Math.floor(Math.random() * 100) + 1}@example.com`;
//     const amountDue = parseFloat((Math.random() * 150 + 20).toFixed(2));
//     const status = statuses[Math.floor(Math.random() * statuses.length)];
//     const issuedDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString();
//     const dueDate = new Date(new Date(issuedDate).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();
//     const periodStart = new Date(new Date(issuedDate).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
//     const periodEnd = issuedDate;

//     invoices.push({
//       id: `inv-${i}-${companyId}`,
//       userId,
//       userName,
//       userEmail,
//       amountDue,
//       currency: "USD",
//       dueDate,
//       status: status as "Paid" | "Unpaid" | "Overdue",
//       downloadUrl: `${apiBaseUrl}/invoices/${companyId}/inv-${i}.pdf`, // Dummy URL
//       periodStart,
//       periodEnd,
//       issuedDate,
//       lineItems: [
//         { description: "Pro Plan Subscription", quantity: 1, unitPrice: amountDue, total: amountDue },
//       ],
//     });
//   }
//   return invoices;
// };


// export default async function BillingPage({ params, searchParams }: PageProps) {
//   const { slug : companyId } = await params;
//   const page = parseInt(searchParams.page || "1");
//   const limit = parseInt(searchParams.limit || "10");
//   const transactionStatus = searchParams.transactionStatus || "";
//   const transactionType = searchParams.transactionType || "";
//   const invoiceStatus = searchParams.invoiceStatus || "";

//   const fetchTransactions = async (
//     currentPage: number,
//     currentLimit: number,
//     currentStatus: string,
//     currentType: string
//   ) => {
//     // Simulate API call
//     const allDummyTransactions = generateDummyTransactions(companyId, 100);
//     let filteredTransactions = allDummyTransactions;

//     if (currentStatus) {
//       filteredTransactions = filteredTransactions.filter(t => t.status === currentStatus);
//     }
//     if (currentType) {
//       filteredTransactions = filteredTransactions.filter(t => t.type === currentType);
//     }

//     const startIndex = (currentPage - 1) * currentLimit;
//     const endIndex = startIndex + currentLimit;
//     const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

//     return {
//       transactionsData: paginatedTransactions,
//       totalTransactionItems: filteredTransactions.length,
//       totalTransactionPages: Math.ceil(filteredTransactions.length / currentLimit),
//     };
//   };

//   const fetchInvoices = async (
//     currentPage: number,
//     currentLimit: number,
//     currentStatus: string
//   ) => {
//     // Simulate API call
//     const allDummyInvoices = generateDummyInvoices(companyId, 50);
//     let filteredInvoices = allDummyInvoices;

//     if (currentStatus) {
//       filteredInvoices = filteredInvoices.filter(inv => inv.status === currentStatus);
//     }

//     const startIndex = (currentPage - 1) * currentLimit;
//     const endIndex = startIndex + currentLimit;
//     const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

//     return {
//       invoicesData: paginatedInvoices,
//       totalInvoiceItems: filteredInvoices.length,
//       totalInvoicePages: Math.ceil(filteredInvoices.length / currentLimit),
//     };
//   };


//   let transactionsData: TransactionItem[] = [];
//   let totalTransactionItems = 0;
//   let totalTransactionPages = 0;
//   let invoicesData: InvoiceItem[] = [];
//   let totalInvoiceItems = 0;
//   let totalInvoicePages = 0;


//   try {
//     ({ transactionsData, totalTransactionItems, totalTransactionPages } = await fetchTransactions(
//       page,
//       limit,
//       transactionStatus,
//       transactionType
//     ));

//     ({ invoicesData, totalInvoiceItems, totalInvoicePages } = await fetchInvoices(
//       page,
//       limit,
//       invoiceStatus
//     ));

//   } catch (err: any) {
//     console.error("[BillingPage] Error fetching data:", err.message);
//   }

//   return (
//     <BillingClient
//       companyId={companyId}
//       transactions={transactionsData}
//       totalTransactionItems={totalTransactionItems}
//       totalTransactionPages={totalTransactionPages}
//       currentTransactionPage={page}
//       transactionsPerPage={limit}
//       // refetchTransactions={fetchTransactions}

//       invoices={invoicesData}
//       totalInvoiceItems={totalInvoiceItems}
//       totalInvoicePages={totalInvoicePages}
//       currentInvoicePage={page}
//       invoicesPerPage={limit}
//       // refetchInvoices={fetchInvoices}
//     />
//   );
// }