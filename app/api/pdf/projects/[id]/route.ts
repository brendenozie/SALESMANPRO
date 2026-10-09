import { NextRequest } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { pdfProjectStorage } from "@/lib/pdf-editor/storage/project-storage";
import { replayOperations } from "@/lib/pdf-editor/model/operations";
import { getPDFSessionIdentity, ownsPDFProject } from "@/lib/pdf-editor/storage/access";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const identity = await getPDFSessionIdentity();
    if (!identity) return formatResponse(false, null, "Authentication required", 401);
    const project = await pdfProjectStorage.getProject(id);
    if (!project) {
      return formatResponse(false, null, "PDF project not found", 404);
    }
    if (!ownsPDFProject(project, identity)) return formatResponse(false, null, "PDF project not found", 404);

    return formatResponse(true, project, "Project retrieved successfully", 200);
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const identity = await getPDFSessionIdentity();
    if (!identity) return formatResponse(false, null, "Authentication required", 401);
    const project = await pdfProjectStorage.getProject(id);
    if (!project) {
      return formatResponse(false, null, "PDF project not found", 404);
    }
    if (!ownsPDFProject(project, identity)) return formatResponse(false, null, "PDF project not found", 404);

    const body = await req.json();
    const { operations, currentDocument } = body;

    if (operations && Array.isArray(operations)) {
      project.operations = operations;
    }

    if (currentDocument) {
      project.currentDocument = currentDocument;
    }

    project.updatedAt = new Date().toISOString();
    await pdfProjectStorage.saveProject(project);

    return formatResponse(true, project, "Project saved successfully", 200);
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}
