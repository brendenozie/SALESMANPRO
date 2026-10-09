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
  const { setOCRWorkerFactoryForTests } = await import("../lib/pdf-editor/engine/ocr");
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
    body: JSON.stringify({ userId: "forged-user", companyId: "forged-company" }),
  }));
  assert.equal(response.status, 200);
  const uploaded = await response.json();
  assert.match(uploaded.data.projectId, /^proj_[a-f0-9]{16}$/);
  const uploadedId = uploaded.data.projectId as string;
  const uploadedParams = { params: Promise.resolve({ id: uploadedId }) };

  response = await EXPORT(new NextRequest(`http://localhost/api/pdf/projects/${uploadedId}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRevision: 0, validate: false, document: uploaded.data.document }),
  }), uploadedParams);
  assert.equal(response.status, 200);
  const exportedBytes = new Uint8Array(await response.arrayBuffer());
  assert.ok(exportedBytes.length > 1000);
  const exportedProject = await storage.getProject(uploadedId);
  assert.equal(exportedProject?.revision, 1);
  assert.equal(exportedProject?.userId, "user-a");
  assert.deepEqual(await storage.getExportedPdf(uploadedId), exportedBytes);

  session = { user: { id: "user-b", companyId: "company-b" } };
  response = await EXPORT(new NextRequest(`http://localhost/api/pdf/projects/${uploadedId}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRevision: 1, document: uploaded.data.document }),
  }), uploadedParams);
  assert.equal(response.status, 404);
  assert.equal((await storage.getProject(uploadedId))?.revision, 1);

  session = { user: { id: "user-a", companyId: "company-a" } };
  response = await POST(new NextRequest(`http://localhost/api/pdf/projects/${uploadedId}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRevision: 1, currentDocument: uploaded.data.document, operations: [] }),
  }), uploadedParams);
  assert.equal(response.status, 200);
  response = await EXPORT(new NextRequest(`http://localhost/api/pdf/projects/${uploadedId}/export`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRevision: 1, validate: false, document: uploaded.data.document }),
  }), uploadedParams);
  assert.equal(response.status, 409);
  assert.deepEqual(await storage.getExportedPdf(uploadedId), exportedBytes);

  process.env.PDF_EDITOR_OCR_TIMEOUT_MS = "20";
  setOCRWorkerFactoryForTests(async () => ({
    recognize: () => new Promise(() => undefined),
    terminate: async () => undefined,
  }));
  response = await OCR(new NextRequest(`http://localhost/api/pdf/projects/${uploadedId}/ocr`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ baseRevision: 2, imageBase64: "test-image", pageIndex: 0 }),
  }), uploadedParams);
  assert.equal(response.status, 504);
  const ocrTimeout = await response.json();
  assert.equal(ocrTimeout.data.error.code, "OCR_TIMEOUT");
  assert.equal((await storage.getProject(uploadedId))?.revision, 2);
  setOCRWorkerFactoryForTests(undefined);
  delete process.env.PDF_EDITOR_OCR_TIMEOUT_MS;

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
