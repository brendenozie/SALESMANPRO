import { NextRequest } from "next/server";
import { formatResponse } from "@/lib/formatResponse";
import { pdfProjectStorage } from "@/lib/pdf-editor/storage/project-storage";
import { replayOperations } from "@/lib/pdf-editor/model/operations";
import { getPDFSessionIdentity, ownsPDFProject } from "@/lib/pdf-editor/storage/access";
import { PDFProjectConflictError } from "@/lib/pdf-editor/storage/project-storage";

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
    const { operations, currentDocument, baseRevision } = body;
    if (!Number.isInteger(baseRevision) || baseRevision < 0) {
      return formatResponse(false, null, {
        code: "REVISION_REQUIRED",
        message: "baseRevision is required for project updates",
        currentRevision: project.revision,
      }, 400);
    }
    if (!Array.isArray(operations) || !currentDocument) {
      return formatResponse(false, null, "currentDocument and operations are required", 400);
    }

    try {
      const saved = await pdfProjectStorage.updateProject(id, baseRevision, {
        currentDocument,
        operations,
        updatedAt: new Date().toISOString(),
      });
      return formatResponse(true, saved, "Project saved successfully", 200);
    } catch (error) {
      if (error instanceof PDFProjectConflictError) {
        return formatResponse(false, {
          code: "REVISION_CONFLICT",
          currentRevision: error.currentProject.revision,
          currentProject: error.currentProject,
        }, error.message, 409);
      }
      throw error;
    }
  } catch (err: any) {
    return formatResponse(false, null, err.message, 500);
  }
}
