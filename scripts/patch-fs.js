const fs = require('fs');
const gracefulFs = require('graceful-fs');

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

// Patch synchronous fs calls for EMFILE / ENFILE / EBUSY
['openSync', 'readFileSync', 'writeFileSync', 'statSync', 'lstatSync', 'readdirSync'].forEach((fn) => {
  const orig = fs[fn];
  if (typeof orig !== 'function') return;
  fs[fn] = function (...args) {
    let attempts = 0;
    while (true) {
      try {
        return orig.apply(this, args);
      } catch (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE' || err.code === 'EBUSY') && attempts < 30) {
          attempts++;
          sleepSync(20 * attempts);
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
          if (err && (err.code === 'EMFILE' || err.code === 'ENFILE' || err.code === 'EBUSY') && attempts < 30) {
            attempts++;
            await new Promise((r) => setTimeout(r, 20 * attempts));
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
      console.log(`[PID ${process.pid} HANDLES: ${handles.length}]`, JSON.stringify(counts));
    }
  }, 3000).unref();
}
