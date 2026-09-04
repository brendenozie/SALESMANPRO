const fs = require('fs');
const gracefulFs = require('graceful-fs');

try {
  gracefulFs.gracefulify(fs);
} catch (e) {}

// Monitor active handles to track handle leaks on Windows
if (process.env.MONITOR_HANDLES === '1') {
  setInterval(() => {
    if (typeof process._getActiveHandles === 'function') {
      const handles = process._getActiveHandles();
      const counts = {};
      for (const h of handles) {
        const type = (h && h.constructor && h.constructor.name) || typeof h;
        counts[type] = (counts[type] || 0) + 1;
      }
      console.log(`[PID ${process.pid} HANDLES: ${handles.length}]`, JSON.stringify(counts));
    }
  }, 3000).unref();
}
