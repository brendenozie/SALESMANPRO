import { NextResponse } from "next/server";
import { etimsService } from "@/lib/etims/service";
import { formatResponse } from "@/lib/formatResponse";

/**
 * POST /api/admin/etims/credit-note
 * Issues a compliant KRA eTIMS Credit Note referencing an original invoice.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, originalInvoiceId, reason, cashierName } = body;

    if (!companyId || !originalInvoiceId || !reason) {
      return formatResponse(
        false,
        null,
        "Missing required fields: companyId, originalInvoiceId, and reason are required.",
        400
      );
    }

    const result = await etimsService.issueCreditNote({
      companyId,
      originalInvoiceId,
      reason,
      cashierName,
    });

    if (!result.success) {
      return formatResponse(false, null, result.error || "Failed to issue credit note.", 400);
    }

    return formatResponse(
      true,
      { creditNote: result.creditNote },
      "eTIMS Credit Note issued successfully.",
      201
    );
  } catch (error: any) {
    console.error("[ETIMS_CREDIT_NOTE_ERROR]", error);
    return formatResponse(false, null, error?.message || "Internal credit note error", 500);
  }
}
