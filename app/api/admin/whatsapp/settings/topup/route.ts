import { NextRequest } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { requireWhatsAppAdmin, unauthorizedResponse } from "@/lib/whatsapp/adminAuth";
import { creditLedger } from "@/lib/ai/creditLedger";
import { normalizePhoneNumber } from "@/lib/whatsapp/normalizePhone";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireWhatsAppAdmin(req);
    const body = await req.json();
    const companyId = auth.companyId;

    const { packageId, customCredits, phone, amountKes, credits } = body;
    const creditsToAdd = Number(credits || customCredits || 10000);
    const normalizedPhone = normalizePhoneNumber(phone);

    if (creditsToAdd <= 0) {
      return formatResponse(false, null, "Invalid credit amount requested", 400);
    }

    const result = await creditLedger.topUpCredits({
      companyId,
      userId: auth.userId,
      amount: creditsToAdd,
      type: "PURCHASE",
      description: `WhatsApp AI Credit Top-Up (${creditsToAdd.toLocaleString()} Credits)`,
      referenceId: `wa_topup_${Date.now()}`,
      metadata: {
        packageId: packageId || "custom",
        phone: normalizedPhone,
        amountKes: amountKes || null,
        paymentMethod: "MPESA",
      },
    });

    return formatResponse(
      true,
      {
        newBalance: result.newBalance,
        transactionId: result.transactionId,
        creditsAdded: creditsToAdd,
        phone: normalizedPhone,
      },
      `Successfully credited ${creditsToAdd.toLocaleString()} AI credits! Current balance: ${result.newBalance.toLocaleString()}`,
      200,
    );
  } catch (error) {
    console.error("[WHATSAPP_TOPUP_ERROR]", error);
    return unauthorizedResponse(error);
  }
}
