import { NextResponse } from "next/server";
import { etimsService } from "@/lib/etims/service";
import { formatResponse } from "@/lib/formatResponse";

/**
 * POST /api/admin/etims/invoices/[id]/retry
 * Re-attempts eTIMS submission for a failed or pending invoice.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return formatResponse(false, null, "Invoice ID is required.", 400);
    }

    const result = await etimsService.retryInvoiceSubmission(id);

    return formatResponse(
      result.success,
      result,
      result.success
        ? "Invoice successfully confirmed by KRA eTIMS."
        : result.errorMessage || "Submission retry failed.",
      result.success ? 200 : 400
    );
  } catch (error: any) {
    console.error("[ETIMS_RETRY_ERROR]", error);
    return formatResponse(false, null, error?.message || "Failed to retry invoice submission.", 500);
  }
}
