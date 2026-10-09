import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import Module from "node:module";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-editor-routes-"));
process.env.PDF_EDITOR_STORAGE_ROOT = root;

let session: unknown = null;
const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, parent: unknown, isMain: boolean) {
  if (request === "next-auth") {
    return { getServerSession: async () => session };
  }
  return originalLoad.call(this, request, parent, isMain);
};

async function main() {
  const { PDFProjectStorage } = await import("../lib/pdf-editor/storage/project-storage");
  const { GET, POST } = await import("../app/api/pdf/projects/[id]/route");
  const { POST: UPLOAD } = await import("../app/api/pdf/upload/route");
  const { POST: OCR } = await import("../app/api/pdf/projects/[id]/ocr/route");
  const { POST: EXPORT } = await import("../app/api/pdf/projects/[id]/export/route");
  (Module as any)._load = originalLoad;
  const storage = new PDFProjectStorage();
  const projectId = "proj_fedcba9876543210";
  const document = {
    id: "doc-route",
    analysisVersion: 1,
    pages: [],
    fonts: {},
    metadata: {},
    assets: {},
    report: { unidentified: [], warnings: [], formXObjects: 0, annotations: 0, hasAcroForm: false, encrypted: false },
  } as any;
  await storage.saveProject({
    id: projectId,
    userId: "user-a",
    companyId: "company-a",
    name: "route",
    originalPdfKey: "original.pdf",
    originalPdfSha256: "sha",
    currentDocument: document,
    operations: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 0,
  });

  const params = { params: Promise.resolve({ id: projectId }) };
  let response = await GET(new NextRequest(`http://localhost/api/pdf/projects/${projectId}`), params);
  assert.equal(response.status, 401);
  response = await UPLOAD(new NextRequest("http://localhost/api/pdf/upload", { method: "POST" }));
  assert.equal(response.status, 401);
  response = await OCR(new NextRequest(`http://localhost/api/pdf/projects/${projectId}/ocr`, { method: "POST" }), params);
  assert.equal(response.status, 401);
  response = await EXPORT(new NextRequest(`http://localhost/api/pdf/projects/${projectId}/export`, { method: "POST" }), params);
  assert.equal(response.status, 401);

  session = { user: { id: "user-b", companyId: "company-a" } };
  response = await GET(new NextRequest(`http://localhost/api/pdf/projects/${projectId}`), params);
  assert.equal(response.status, 404);
  assert.equal((await storage.getProject(projectId))?.revision, 0);

  session = { user: { id: "user-a", companyId: "company-a" } };
  response = await UPLOAD(new NextRequest("http://localhost/api/pdf/upload?fixture=aurum-offer", {
    method: "POST",
    headers: { "content-type": "application/json" },
  }));
  assert.equal(response.status, 200);
  const uploaded = await response.json();
  assert.match(uploaded.data.projectId, /^proj_[a-f0-9]{16}$/);

  response = await POST(new NextRequest(`http://localhost/api/pdf/projects/${projectId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      userId: "user-b",
      companyId: "company-b",
      baseRevision: 0,
      currentDocument: { ...document, id: "authorized-edit" },
      operations: [],
    }),
  }), params);
  assert.equal(response.status, 200);
  assert.equal((await storage.getProject(projectId))?.userId, "user-a");

  response = await POST(new NextRequest(`http://localhost/api/pdf/projects/${projectId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRevision: 0, currentDocument: document, operations: [] }),
  }), params);
  assert.equal(response.status, 409);
  const conflict = await response.json();
  assert.equal(conflict.data.code, "REVISION_CONFLICT");
  assert.equal(conflict.data.currentRevision, 1);

  response = await OCR(new NextRequest(`http://localhost/api/pdf/projects/${projectId}/ocr`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRevision: 1, pageIndex: 0 }),
  }), params);
  assert.equal(response.status, 404);

  fs.rmSync(root, { recursive: true, force: true });
  console.log("PDF route integration tests passed: authentication, tenant isolation, forged ownership, update, and revision conflict.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  fs.rmSync(root, { recursive: true, force: true });
  process.exit(1);
});
