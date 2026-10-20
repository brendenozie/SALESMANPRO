const fs = require('fs');
const gracefulFs = require('graceful-fs');

if (!fs.__PATCH_FS_APPLIED) {
  fs.__PATCH_FS_APPLIED = true;

  try {
    gracefulFs.gracefulify(fs);
  } catch (e) {}

  function sleepSync(ms) {
    try {
      const buf = new Int32Array(new SharedArrayBuffer(4));
      Atomics.wait(buf, 0, 0, ms);
    } catch (e) {
      const start = Date.now();
      while (Date.now() - start < ms) {}
    }
  }

  // Active file descriptor tracking for Windows EMFILE diagnostics
  const activeFds = new Map();
  const rawOpenSync = fs.openSync;
  const rawCloseSync = fs.closeSync;

  if (typeof rawOpenSync === 'function') {
    fs.openSync = function (filepath, ...args) {
      const fd = rawOpenSync.apply(this, [filepath, ...args]);
      activeFds.set(fd, filepath);
      if (activeFds.size > 0 && activeFds.size % 2000 === 0) {
        console.warn(`[patch-fs] Warning: ${activeFds.size} active open file descriptors detected.`);
      }
      return fd;
    };
  }

  if (typeof rawCloseSync === 'function') {
    fs.closeSync = function (fd) {
      activeFds.delete(fd);
      return rawCloseSync.apply(this, [fd]);
    };
  }

  // Patch synchronous fs calls for EMFILE / ENFILE / EBUSY
  ['readFileSync', 'writeFileSync', 'statSync', 'lstatSync', 'readdirSync'].forEach((fn) => {
    const orig = fs[fn];
    if (typeof orig !== 'function') return;
    fs[fn] = function (...args) {
      let attempts = 0;
      while (true) {
        try {
          return orig.apply(this, args);
        } catch (err) {
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE' || err.code === 'EBUSY') && attempts < 50) {
            attempts++;
            if (typeof global.gc === 'function') {
              try { global.gc(); } catch (gce) {}
            }
            sleepSync(25 * attempts);
            continue;
          }
          throw err;
        }
      }
    };
  });

  // Patch fs.promises for EMFILE / ENFILE / EBUSY
  if (fs.promises) {
    ['readFile', 'writeFile', 'open', 'stat', 'lstat', 'readdir', 'access', 'copyFile'].forEach((fn) => {
      const orig = fs.promises[fn];
      if (typeof orig !== 'function') return;
      fs.promises[fn] = async function (...args) {
        let attempts = 0;
        while (true) {
          try {
            return await orig.apply(this, args);
          } catch (err) {
            if (err && (err.code === 'EMFILE' || err.code === 'ENFILE' || err.code === 'EBUSY') && attempts < 50) {
              attempts++;
              if (typeof global.gc === 'function') {
                try { global.gc(); } catch (gce) {}
              }
              await new Promise((r) => setTimeout(r, 25 * attempts));
              continue;
            }
            throw err;
          }
        }
      };
    });
  }

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
        console.log(`[PID ${process.pid} HANDLES: ${handles.length} | FDs: ${activeFds.size}]`, JSON.stringify(counts));
      }
    }, 5000).unref();
  }
}
