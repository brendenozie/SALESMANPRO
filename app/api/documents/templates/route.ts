import { NextResponse } from "next/server";
import { DOCUMENT_TEMPLATES, getTemplatesForType } from "@/lib/documents/registry";
import { DocumentType } from "@/lib/documents/types";
import { formatResponse } from "@/lib/formatResponse";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as DocumentType | null;

    if (type) {
      const filtered = getTemplatesForType(type);
      return formatResponse(true, filtered, `Templates for ${type} fetched successfully`, 200);
    }

    return formatResponse(true, DOCUMENT_TEMPLATES, "All document templates fetched successfully", 200);
  } catch (error: any) {
    return formatResponse(false, null, error?.message || "Failed to fetch document templates", 500);
  }
}
