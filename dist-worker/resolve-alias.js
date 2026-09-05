/**
 * workers/resolve-alias.js
 *
 * Intercepts CommonJS module resolution starting with "@/ " and routes them
 * to the compiled dist-worker directory. Solves TypeScript path alias
 * resolution at runtime for background workers with zero external dependencies.
 */

const path = require("path");
const Module = require("module");

// Resolve dist-worker root whether loaded from workers/ or root of dist-worker
const distWorkerRoot = __dirname.endsWith("workers")
  ? path.resolve(__dirname, "..")
  : path.resolve(__dirname);

const origResolveFilename = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(distWorkerRoot, request.slice(2));
  }
  return origResolveFilename.call(this, request, parent, isMain, options);
};

