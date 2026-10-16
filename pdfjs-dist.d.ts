declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  const worker: any;
  export default worker;
}

declare module "pdfjs-dist/build/pdf.worker.mjs" {
  const worker: any;
  export default worker;
}

declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export const getDocument: any;
  export const GlobalWorkerOptions: any;
  export const version: string;
  export * from "pdfjs-dist";
  const defaultExport: any;
  export default defaultExport;
}
