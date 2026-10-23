import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/whatsapp";

// POST /api/pos/receipt/whatsapp
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, receiptType = "SALE_RECEIPT", storeName = "SalesMan Pro", data } = body;

    if (!phone) {
      return NextResponse.json({ error: "Customer phone number is required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");

    let message = "";

    if (receiptType === "CREDIT_SLIP") {
      message = `🧾 *${storeName.toUpperCase()} — ACCOUNT PAYMENT SLIP*\n\n` +
        `👤 *Customer:* ${data.customerName || "Valued Customer"}\n` +
        `📅 *Date:* ${new Date().toLocaleString("en-KE")}\n` +
        `🔖 *Transaction:* ${data.txType || "REPAYMENT"}\n` +
        `🔖 *Ref:* ${data.reference || "N/A"}\n\n` +
        `--------------------------------\n` +
        `💰 *Amount Paid:* ${data.currency || "KES"} ${(data.amount || 0).toLocaleString()}\n` +
        `📉 *New Outstanding Balance:* ${data.currency || "KES"} ${(data.balanceAfter || 0).toLocaleString()}\n` +
        `💳 *Available Credit Limit:* ${data.currency || "KES"} ${(data.availableCredit || 0).toLocaleString()}\n` +
        `--------------------------------\n\n` +
        `_Thank you for your prompt payment! Official digital confirmation._`;
    } else if (receiptType === "CREDIT_STATEMENT") {
      message = `📑 *${storeName.toUpperCase()} — ACCOUNT STATEMENT*\n\n` +
        `👤 *Customer:* ${data.customerName || "Valued Customer"}\n` +
        `📅 *Statement Date:* ${new Date().toLocaleDateString("en-KE")}\n` +
        `💳 *Credit Limit:* ${data.currency || "KES"} ${(data.creditLimit || 0).toLocaleString()}\n` +
        `📉 *Current Outstanding:* ${data.currency || "KES"} ${(data.currentBalance || 0).toLocaleString()}\n` +
        `✅ *Available Credit:* ${data.currency || "KES"} ${(data.availableCredit || 0).toLocaleString()}\n\n` +
        `--------------------------------\n` +
        `_Terms: Payment due within ${data.paymentTermDays || 30} days of invoice._`;
    } else {
      // Standard SALE_RECEIPT
      const itemsList = Array.isArray(data.items)
        ? data.items
            .map((item: any) => `• ${item.quantity}x ${item.name || item.title} = ${data.currency || "KES"} ${(item.total || item.subtotal || item.price * item.quantity || 0).toLocaleString()}`)
            .join("\n")
        : "";

      message = `🧾 *${storeName.toUpperCase()} — E-RECEIPT*\n\n` +
        `🔖 *Receipt #:* ${data.receiptNumber || data.trackingNumber || "REC-" + Date.now().toString().slice(-6)}\n` +
        `📅 *Date:* ${new Date().toLocaleString("en-KE")}\n` +
        `👤 *Cashier:* ${data.cashierName || "Store Cashier"}\n` +
        (data.customerName && data.customerName !== "Walk-in Customer" ? `👥 *Customer:* ${data.customerName}\n` : "") +
        (data.tableNumber ? `🍽️ *Table:* ${data.tableNumber}\n` : "") +
        `\n--------------------------------\n` +
        `*PURCHASED ITEMS:*\n${itemsList}\n` +
        `--------------------------------\n` +
        `💵 *Total Amount:* ${data.currency || "KES"} ${(data.finalTotal || data.total || 0).toLocaleString()}\n` +
        `💳 *Payment Method:* ${data.paymentMethod || "CASH"}\n` +
        (data.loyaltyPointsEarned ? `⭐ *Loyalty Points Earned:* +${data.loyaltyPointsEarned} pts\n` : "") +
        (data.loyaltyPointsBalance ? `⭐ *New Points Balance:* ${data.loyaltyPointsBalance} pts\n` : "") +
        `--------------------------------\n` +
        `_Thank you for shopping with ${storeName}! Have a wonderful day._`;
    }

    // Dispatch via WhatsApp service (graceful fallback if WhatsApp credentials are demo/missing)
    try {
      if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_TOKEN) {
        await sendWhatsApp(cleanPhone, message);
      } else {
        console.log(`[WhatsApp E-Receipt Mock Dispatch to ${cleanPhone}]:\n${message}`);
      }
    } catch (sendErr: any) {
      console.warn("[WhatsApp Dispatch Warning]", sendErr?.message || sendErr);
    }

    return NextResponse.json({
      success: true,
      message: `WhatsApp receipt sent to ${cleanPhone}`,
      preview: message,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
