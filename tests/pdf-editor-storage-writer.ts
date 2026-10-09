import { PDFProjectStorage } from "../lib/pdf-editor/storage/project-storage";

const [projectId, expectedRevision, documentId, delayMs] = process.argv.slice(2);
const storage = new PDFProjectStorage();

setTimeout(async () => {
  try {
    await storage.updateProject(projectId, Number(expectedRevision), {
      currentDocument: {
        id: documentId,
        analysisVersion: 1,
        pages: [],
        fonts: {},
        metadata: {},
        assets: {},
        report: { unidentified: [], warnings: [], formXObjects: 0, annotations: 0, hasAcroForm: false, encrypted: false },
      },
      operations: [],
      updatedAt: new Date().toISOString(),
    });
    console.log(`COMMITTED:${documentId}`);
  } catch (error) {
    console.log(`FAILED:${error instanceof Error ? error.name : "unknown"}`);
    process.exitCode = 2;
  }
}, Number(delayMs || 0));
