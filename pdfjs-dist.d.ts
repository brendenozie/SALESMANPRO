declare module "pdfjs-dist/legacy/build/pdf.worker.mjs" {
  const worker: any;
  export default worker;
}

declare module "pdfjs-dist/build/pdf.worker.mjs" {
  const worker: any;
  export default worker;
}

declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  export * from "pdfjs-dist";
}
