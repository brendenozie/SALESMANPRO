const path = require('path');
const Module = require('module');
const fs = require('fs');

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'server-only' || request === 'client-only') {
    return path.resolve(__dirname, 'server-only-stub.js');
  }
  if (request.startsWith('@/')) {
    const relativePath = request.slice(2);
    let absolutePath = path.resolve(__dirname, '..', relativePath);
    if (!fs.existsSync(absolutePath)) {
      for (const ext of ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js']) {
        if (fs.existsSync(absolutePath + ext)) {
          absolutePath = absolutePath + ext;
          break;
        }
      }
    }
    return originalResolveFilename.call(this, absolutePath, parent, isMain, options);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
require.extensions['.css'] = () => {};
require.extensions['.scss'] = () => {};
