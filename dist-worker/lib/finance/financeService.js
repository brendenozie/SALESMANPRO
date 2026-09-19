"use strict";
/**
 * lib/finance/financeService.ts
 *
 * Authoritative Business Finance & Operations Engine for SalesmanPro.
 * Computes Income Statement (P&L), Cost of Goods Sold (COGS), Cash Flow,
 * Accounts Receivable (AR), Accounts Payable (AP), Inventory Valuation,
 * Tax/VAT Summaries, and Operational Attention Items.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttentionItems = exports.getTaxReport = exports.getInventoryValuation = exports.getAccountsPayable = exports.getAccountsReceivable = exports.getCashFlowStatement = exports.getIncomeStatement = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
function parseDateRange(filter) {
    let gte = undefined;
    let lte = undefined;
    if (filter?.startDate) {
        gte = new Date(filter.startDate);
        gte.setHours(0, 0, 0, 0);
    }
    if (filter?.endDate) {
        lte = new Date(filter.endDate);
        lte.setHours(23, 59, 59, 999);
    }
    return { gte, lte };
}
function round2(val) {
    if (!Number.isFinite(val) || isNaN(val))
        return 0;
    return Math.round((val + Number.EPSILON) * 100) / 100;
}
async function getIncomeStatement(companyId, filter) {
    const { gte, lte } = parseDateRange(filter);
    // Fetch company currency
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { currency: true },
    });
    const currency = company?.currency || "KES";
    // Build Date filters
    const dateClause = gte || lte ? { gte, lte } : undefined;
    // 1. Fetch valid orders contributing to revenue
    // We include orders with COMPLETED, PAID, SHIPPED, READY_FOR_PICKUP, OUT_FOR_DELIVERY, or PENDING with COMPLETED payment
    const orders = await prismadb_1.default.customerOrder.findMany({
        where: {
            companyId,
            createdAt: dateClause,
            status: { notIn: ["CANCELLED", "FAILED"] },
        },
        include: {
            items: {
                include: {
                    marketplaceListing: {
                        select: { buyingPrice: true, sellingPrice: true, category: true, name: true },
                    },
                    product: {
                        select: { costPrice: true, sellingPrice: true, category: true, name: true },
                    },
                },
            },
        },
    });
    // Calculate Gross Sales, Discounts, Shipping, Tax, and COGS from Orders
    let grossSales = 0;
    let totalDiscounts = 0;
    let totalOrderTax = 0;
    let totalCOGS = 0;
    let itemsSold = 0;
    for (const order of orders) {
        const orderTotal = Number(order.totalFinalPrice ?? order.totalPrice ?? 0);
        grossSales += orderTotal;
        totalDiscounts += Number(order.totalDiscount ?? 0);
        totalOrderTax += Number(order.totalTax ?? 0);
        for (const item of order.items) {
            itemsSold += item.quantity;
            const unitCost = item.marketplaceListing?.buyingPrice ??
                item.product?.costPrice ??
                0;
            totalCOGS += item.quantity * unitCost;
        }
    }
    // 2. Fetch Returns & Refunds
    const returns = await prismadb_1.default.return.findMany({
        where: {
            orderItem: {
                order: { companyId },
            },
            createdAt: dateClause,
            status: "APPROVED",
        },
        select: { refundAmount: true, quantity: true },
    });
    let returnsAndRefunds = 0;
    for (const ret of returns) {
        returnsAndRefunds += Number(ret.refundAmount ?? 0);
    }
    // Net Revenue = Gross Sales - Returns
    const netRevenue = Math.max(0, grossSales - returnsAndRefunds);
    // Gross Profit = Net Revenue - COGS
    const grossProfit = netRevenue - totalCOGS;
    const grossMarginPercentage = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
    // 3. Fetch Operating Expenses
    const expenses = await prismadb_1.default.expense.findMany({
        where: {
            companyId,
            date: dateClause,
            status: { notIn: ["Rejected"] },
        },
    });
    const categoryMap = {};
    let totalOperatingExpenses = 0;
    let totalExpenseTax = 0;
    for (const exp of expenses) {
        const amt = Number(exp.amount || 0);
        totalOperatingExpenses += amt;
        totalExpenseTax += Number(exp.taxAmount || 0);
        const cat = exp.category?.trim() || "Miscellaneous";
        if (!categoryMap[cat]) {
            categoryMap[cat] = { amount: 0, count: 0 };
        }
        categoryMap[cat].amount += amt;
        categoryMap[cat].count += 1;
    }
    const expenseBreakdown = Object.entries(categoryMap)
        .map(([category, data]) => ({
        category,
        amount: round2(data.amount),
        count: data.count,
        percentage: totalOperatingExpenses > 0 ? round2((data.amount / totalOperatingExpenses) * 100) : 0,
    }))
        .sort((a, b) => b.amount - a.amount);
    // 4. Operating Profit (EBIT) & Net Profit
    const operatingProfit = grossProfit - totalOperatingExpenses;
    const operatingMarginPercentage = netRevenue > 0 ? (operatingProfit / netRevenue) * 100 : 0;
    const netProfit = operatingProfit;
    const netMarginPercentage = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;
    return {
        period: {
            startDate: gte ? gte.toISOString() : null,
            endDate: lte ? lte.toISOString() : null,
        },
        revenue: {
            grossSales: round2(grossSales),
            discounts: round2(totalDiscounts),
            returnsAndRefunds: round2(returnsAndRefunds),
            netRevenue: round2(netRevenue),
        },
        cogs: {
            totalCOGS: round2(totalCOGS),
            itemsSold,
        },
        profitability: {
            grossProfit: round2(grossProfit),
            grossMarginPercentage: round2(grossMarginPercentage),
            totalOperatingExpenses: round2(totalOperatingExpenses),
            operatingProfit: round2(operatingProfit),
            operatingMarginPercentage: round2(operatingMarginPercentage),
            taxes: round2(totalOrderTax),
            netProfit: round2(netProfit),
            netMarginPercentage: round2(netMarginPercentage),
        },
        expenseBreakdown,
        currency,
    };
}
exports.getIncomeStatement = getIncomeStatement;
async function getCashFlowStatement(companyId, filter) {
    const { gte, lte } = parseDateRange(filter);
    const dateClause = gte || lte ? { gte, lte } : undefined;
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { currency: true },
    });
    const currency = company?.currency || "KES";
    // 1. Money In: Completed customer order payments & invoice collections
    const payments = await prismadb_1.default.payment.findMany({
        where: {
            companyId,
            status: "COMPLETED",
            createdAt: dateClause,
        },
        orderBy: { createdAt: "desc" },
    });
    let totalCashIn = 0;
    const cashInByMethod = {};
    const movements = [];
    for (const p of payments) {
        const amt = Number(p.amount || 0);
        totalCashIn += amt;
        const method = String(p.provider || "CASH").toUpperCase();
        cashInByMethod[method] = (cashInByMethod[method] || 0) + amt;
        movements.push({
            source: `Customer Payment (${method})`,
            amount: round2(amt),
            type: "IN",
            category: "Sales Collection",
            reference: p.transactionId || p.providerTransactionId || undefined,
            date: p.createdAt?.toISOString() || new Date().toISOString(),
        });
    }
    // 2. Money Out: Expenses paid
    const expenses = await prismadb_1.default.expense.findMany({
        where: {
            companyId,
            status: { in: ["Paid", "COMPLETED", "Approved"] },
            date: dateClause,
        },
        orderBy: { date: "desc" },
    });
    let totalCashOut = 0;
    const cashOutByCategory = {};
    for (const exp of expenses) {
        const amt = Number(exp.amount || 0);
        totalCashOut += amt;
        const cat = exp.category || "General Expense";
        cashOutByCategory[cat] = (cashOutByCategory[cat] || 0) + amt;
        movements.push({
            source: `${exp.vendor || "Expense"} - ${exp.description || cat}`,
            amount: round2(amt),
            type: "OUT",
            category: cat,
            reference: exp.expenseId,
            date: exp.date.toISOString(),
        });
    }
    // 3. Money Out: Supplier payments
    const supplierPayments = await prismadb_1.default.supplierPayment.findMany({
        where: {
            bill: { companyId },
            paidAt: dateClause,
        },
        include: {
            bill: {
                include: { supplier: { select: { name: true } } },
            },
        },
        orderBy: { paidAt: "desc" },
    });
    for (const sp of supplierPayments) {
        const amt = Number(sp.amount || 0);
        totalCashOut += amt;
        const cat = "Supplier Bill Payment";
        cashOutByCategory[cat] = (cashOutByCategory[cat] || 0) + amt;
        movements.push({
            source: `Supplier Payment: ${sp.bill.supplier?.name || "Vendor"} (${sp.bill.billNumber})`,
            amount: round2(amt),
            type: "OUT",
            category: "Procurement",
            reference: sp.reference || sp.id,
            date: sp.paidAt.toISOString(),
        });
    }
    // 4. Money Out: Customer refunds
    const refunds = await prismadb_1.default.return.findMany({
        where: {
            orderItem: { order: { companyId } },
            status: "APPROVED",
            createdAt: dateClause,
        },
        select: { refundAmount: true, createdAt: true, id: true },
    });
    for (const ref of refunds) {
        const amt = Number(ref.refundAmount || 0);
        if (amt > 0) {
            totalCashOut += amt;
            cashOutByCategory["Customer Refunds"] = (cashOutByCategory["Customer Refunds"] || 0) + amt;
            movements.push({
                source: `Customer Refund`,
                amount: round2(amt),
                type: "OUT",
                category: "Returns",
                reference: ref.id,
                date: ref.createdAt?.toISOString() || new Date().toISOString(),
            });
        }
    }
    // Sort all movements chronologically descending
    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const netCashMovement = totalCashIn - totalCashOut;
    const openingBalance = 0; // Baseline
    const closingBalance = openingBalance + netCashMovement;
    return {
        period: {
            startDate: gte ? gte.toISOString() : null,
            endDate: lte ? lte.toISOString() : null,
        },
        summary: {
            openingBalance: round2(openingBalance),
            totalCashIn: round2(totalCashIn),
            totalCashOut: round2(totalCashOut),
            netCashMovement: round2(netCashMovement),
            closingBalance: round2(closingBalance),
        },
        breakdown: {
            cashInByMethod,
            cashOutByCategory,
        },
        movements: movements.slice(0, 100),
        currency,
    };
}
exports.getCashFlowStatement = getCashFlowStatement;
async function getAccountsReceivable(companyId) {
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { currency: true },
    });
    const currency = company?.currency || "KES";
    const invoices = await prismadb_1.default.invoice.findMany({
        where: {
            companyId,
            status: { in: ["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"] },
            amountDue: { gt: 0 },
        },
        include: {
            consumer: {
                include: { user: { select: { name: true, email: true } } },
            },
            client: {
                include: { user: { select: { name: true, email: true } } },
            },
        },
        orderBy: { dueDate: "asc" },
    });
    const now = new Date();
    const aging = {
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        daysOver90: 0,
        total: 0,
    };
    let totalReceivables = 0;
    let totalOverdue = 0;
    const invoiceRows = invoices.map((inv) => {
        const due = new Date(inv.dueDate);
        const diffMs = now.getTime() - due.getTime();
        const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const dueAmt = Number(inv.amountDue || (inv.amount - (inv.amountPaid || 0)));
        totalReceivables += dueAmt;
        if (daysOverdue === 0) {
            aging.current += dueAmt;
        }
        else {
            totalOverdue += dueAmt;
            if (daysOverdue <= 30)
                aging.days1to30 += dueAmt;
            else if (daysOverdue <= 60)
                aging.days31to60 += dueAmt;
            else if (daysOverdue <= 90)
                aging.days61to90 += dueAmt;
            else
                aging.daysOver90 += dueAmt;
        }
        aging.total += dueAmt;
        const custName = inv.customerName ||
            inv.consumer?.user?.name ||
            inv.client?.user?.name ||
            "Unknown Customer";
        const custEmail = inv.customerEmail ||
            inv.consumer?.user?.email ||
            inv.client?.user?.email ||
            null;
        return {
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: custName,
            customerEmail: custEmail,
            amount: round2(inv.amount),
            amountPaid: round2(inv.amountPaid || 0),
            amountDue: round2(dueAmt),
            dueDate: inv.dueDate.toISOString(),
            daysOverdue,
            status: inv.status,
        };
    });
    return {
        totalReceivables: round2(totalReceivables),
        totalOverdue: round2(totalOverdue),
        unpaidInvoicesCount: invoices.length,
        aging: {
            current: round2(aging.current),
            days1to30: round2(aging.days1to30),
            days31to60: round2(aging.days31to60),
            days61to90: round2(aging.days61to90),
            daysOver90: round2(aging.daysOver90),
            total: round2(aging.total),
        },
        invoices: invoiceRows,
        currency,
    };
}
exports.getAccountsReceivable = getAccountsReceivable;
async function getAccountsPayable(companyId) {
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { currency: true },
    });
    const currency = company?.currency || "KES";
    const bills = await prismadb_1.default.supplierBill.findMany({
        where: {
            companyId,
            status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] },
            amountDue: { gt: 0 },
        },
        include: {
            supplier: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
    });
    const now = new Date();
    const aging = {
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        daysOver90: 0,
        total: 0,
    };
    let totalPayables = 0;
    let totalOverdue = 0;
    const billRows = bills.map((b) => {
        const due = new Date(b.dueDate);
        const diffMs = now.getTime() - due.getTime();
        const daysOverdue = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const dueAmt = Number(b.amountDue || (b.amount - (b.amountPaid || 0)));
        totalPayables += dueAmt;
        if (daysOverdue === 0) {
            aging.current += dueAmt;
        }
        else {
            totalOverdue += dueAmt;
            if (daysOverdue <= 30)
                aging.days1to30 += dueAmt;
            else if (daysOverdue <= 60)
                aging.days31to60 += dueAmt;
            else if (daysOverdue <= 90)
                aging.days61to90 += dueAmt;
            else
                aging.daysOver90 += dueAmt;
        }
        aging.total += dueAmt;
        return {
            id: b.id,
            billNumber: b.billNumber,
            supplierName: b.supplier?.name || "Unknown Vendor",
            amount: round2(b.amount),
            amountPaid: round2(b.amountPaid || 0),
            amountDue: round2(dueAmt),
            dueDate: b.dueDate.toISOString(),
            daysOverdue,
            status: b.status,
        };
    });
    return {
        totalPayables: round2(totalPayables),
        totalOverdue: round2(totalOverdue),
        unpaidBillsCount: bills.length,
        aging: {
            current: round2(aging.current),
            days1to30: round2(aging.days1to30),
            days31to60: round2(aging.days31to60),
            days61to90: round2(aging.days61to90),
            daysOver90: round2(aging.daysOver90),
            total: round2(aging.total),
        },
        bills: billRows,
        currency,
    };
}
exports.getAccountsPayable = getAccountsPayable;
async function getInventoryValuation(companyId) {
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { currency: true },
    });
    const currency = company?.currency || "KES";
    const listings = await prismadb_1.default.marketplaceListings.findMany({
        where: { companyId },
        select: {
            quantity: true,
            buyingPrice: true,
            sellingPrice: true,
        },
    });
    let totalUnits = 0;
    let totalCostValue = 0;
    let totalRetailValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    for (const item of listings) {
        const qty = Math.max(0, item.quantity || 0);
        const cost = Number(item.buyingPrice || 0);
        const retail = Number(item.sellingPrice || 0);
        totalUnits += qty;
        totalCostValue += qty * cost;
        totalRetailValue += qty * retail;
        if (qty === 0)
            outOfStockCount++;
        else if (qty <= 5)
            lowStockCount++;
    }
    return {
        totalItemsInCatalog: listings.length,
        totalUnitsInStock: totalUnits,
        totalCostValue: round2(totalCostValue),
        totalRetailValue: round2(totalRetailValue),
        potentialProfit: round2(totalRetailValue - totalCostValue),
        lowStockItemsCount: lowStockCount,
        outOfStockItemsCount: outOfStockCount,
        currency,
    };
}
exports.getInventoryValuation = getInventoryValuation;
async function getTaxReport(companyId, filter) {
    const { gte, lte } = parseDateRange(filter);
    const dateClause = gte || lte ? { gte, lte } : undefined;
    const company = await prismadb_1.default.company.findUnique({
        where: { id: companyId },
        select: { currency: true },
    });
    const currency = company?.currency || "KES";
    // Tax collected from customer orders
    const orders = await prismadb_1.default.customerOrder.aggregate({
        where: {
            companyId,
            createdAt: dateClause,
            status: { notIn: ["CANCELLED", "FAILED"] },
        },
        _sum: { totalTax: true },
    });
    const taxCollectedOnSales = Number(orders._sum.totalTax || 0);
    // Tax paid on expenses
    const expenses = await prismadb_1.default.expense.aggregate({
        where: {
            companyId,
            date: dateClause,
            status: { notIn: ["Rejected"] },
        },
        _sum: { taxAmount: true },
    });
    const taxPaidOnExpenses = Number(expenses._sum.taxAmount || 0);
    // Tax paid on purchase orders
    const pos = await prismadb_1.default.purchaseOrder.aggregate({
        where: {
            companyId,
            issueDate: dateClause,
            status: { not: "CANCELLED" },
        },
        _sum: { taxAmount: true },
    });
    const taxPaidOnProcurement = Number(pos._sum.taxAmount || 0);
    const totalInputTax = taxPaidOnExpenses + taxPaidOnProcurement;
    const netTaxPayable = round2(taxCollectedOnSales - totalInputTax);
    return {
        period: {
            startDate: gte ? gte.toISOString() : null,
            endDate: lte ? lte.toISOString() : null,
        },
        taxCollectedOnSales: round2(taxCollectedOnSales),
        taxPaidOnExpenses: round2(taxPaidOnExpenses),
        taxPaidOnProcurement: round2(taxPaidOnProcurement),
        netTaxPayable,
        currency,
    };
}
exports.getTaxReport = getTaxReport;
async function getAttentionItems(companyId) {
    const items = [];
    const now = new Date();
    // 1. Overdue Invoices
    const overdueInvoices = await prismadb_1.default.invoice.findMany({
        where: {
            companyId,
            status: { in: ["PENDING", "SENT", "VIEWED", "PARTIALLY_PAID", "OVERDUE"] },
            dueDate: { lt: now },
            amountDue: { gt: 0 },
        },
        take: 5,
        orderBy: { dueDate: "asc" },
    });
    for (const inv of overdueInvoices) {
        items.push({
            id: inv.id,
            type: "OVERDUE_INVOICE",
            title: `Invoice #${inv.invoiceNumber} Overdue`,
            description: `Customer owes ${inv.currency} ${(inv.amountDue || 0).toLocaleString()}. Due since ${inv.dueDate.toLocaleDateString()}`,
            amount: inv.amountDue || 0,
            severity: "HIGH",
            actionHref: `/admin/{slug}/invoices`,
            date: inv.dueDate.toISOString(),
        });
    }
    // 2. Bills due soon or overdue
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);
    const dueBills = await prismadb_1.default.supplierBill.findMany({
        where: {
            companyId,
            status: { in: ["PENDING", "PARTIALLY_PAID", "OVERDUE"] },
            dueDate: { lte: in7Days },
            amountDue: { gt: 0 },
        },
        include: { supplier: { select: { name: true } } },
        take: 5,
        orderBy: { dueDate: "asc" },
    });
    for (const b of dueBills) {
        const isOverdue = b.dueDate < now;
        items.push({
            id: b.id,
            type: "SUPPLIER_DUE",
            title: `Bill #${b.billNumber} ${isOverdue ? "Overdue" : "Due Soon"}`,
            description: `Owed to ${b.supplier?.name || "Supplier"}: ${(b.amountDue || 0).toLocaleString()}. Due on ${b.dueDate.toLocaleDateString()}`,
            amount: b.amountDue || 0,
            severity: isOverdue ? "HIGH" : "MEDIUM",
            actionHref: `/admin/{slug}/finance?tab=payables`,
            date: b.dueDate.toISOString(),
        });
    }
    // 3. Low stock
    const lowStock = await prismadb_1.default.marketplaceListings.findMany({
        where: {
            companyId,
            quantity: { lte: 5 },
        },
        take: 5,
        select: { id: true, name: true, quantity: true },
    });
    for (const ls of lowStock) {
        items.push({
            id: ls.id,
            type: "LOW_STOCK",
            title: `Low Stock: ${ls.name}`,
            description: `Only ${ls.quantity} units remaining in inventory.`,
            severity: ls.quantity === 0 ? "HIGH" : "MEDIUM",
            actionHref: `/admin/{slug}/inventory`,
        });
    }
    // 4. Pending Expense Approvals
    const pendingExpenses = await prismadb_1.default.expense.findMany({
        where: {
            companyId,
            status: "Pending Approval",
        },
        take: 5,
        orderBy: { date: "desc" },
    });
    for (const exp of pendingExpenses) {
        items.push({
            id: exp.id,
            type: "EXPENSE_APPROVAL",
            title: `Expense Approval: ${exp.category}`,
            description: `${exp.vendor} - ${exp.description}. Amount: ${exp.amount.toLocaleString()}`,
            amount: exp.amount,
            severity: "LOW",
            actionHref: `/admin/{slug}/finance?tab=expenses`,
            date: exp.date.toISOString(),
        });
    }
    return items;
}
exports.getAttentionItems = getAttentionItems;
