import { NextRequest } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { pdfProjectStorage } from "@/lib/pdf-editor/storage/project-storage";
import { getPDFSessionIdentity } from "@/lib/pdf-editor/storage/access";

export const dynamic = "force-dynamic";

/**
 * GET /api/pdf/projects
 * Lists all uploaded PDF document projects for the current authenticated store/company.
 */
export async function GET(req: NextRequest) {
  try {
    const requestedCompanyId =
      req.headers.get("x-company-id") ||
      req.nextUrl.searchParams.get("companyId") ||
      null;

    const identity = await getPDFSessionIdentity(requestedCompanyId);
    if (!identity) {
      return formatResponse(false, null, "Authentication required", 401);
    }

    const filterCompanyId = identity.isSuperAdmin ? undefined : identity.companyId;
    const projects = await pdfProjectStorage.listProjects(filterCompanyId);

    return formatResponse(
      true,
      { projects, count: projects.length },
      "Uploaded documents retrieved successfully",
      200
    );
  } catch (err: any) {
    console.error("List PDF projects error:", err);
    return formatResponse(false, null, err.message || "Failed to list documents", 500);
  }
}
