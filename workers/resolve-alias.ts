/**
 * workers/resolve-alias.ts
 *
 * Intercepts CommonJS module resolution starting with "@/ " and routes them
 * to the compiled dist-worker directory. Solves TypeScript path alias
 * resolution at runtime for background workers with zero external dependencies.
 */

const path = require("path");
const Module = require("module");

const distWorkerRoot = path.resolve(__dirname, "..");
// @ts-ignore
const origResolveFilename = Module._resolveFilename;

// @ts-ignore
Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
  if (request.startsWith("@/")) {
    request = path.join(distWorkerRoot, request.slice(2));
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};
