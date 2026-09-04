const path = require('path');
const Module = require('module');

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const relativePath = request.slice(2);
    const absolutePath = path.resolve(__dirname, '..', relativePath);
    return originalResolveFilename.call(this, absolutePath, parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
