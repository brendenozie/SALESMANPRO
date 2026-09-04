/**
 * scripts/patch-next-worker.js
 *
 * Automatically applies in-process static export fallback to Next.js on Windows.
 * This resolves the notorious Microsoft C-runtime 8,192 handle ceiling EMFILE crash
 * caused when child_process.fork() inherits thousands of compilation handles.
 */
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../node_modules/next/dist/build/index.js');
const workerFile = path.join(__dirname, '../node_modules/next/dist/export/worker.js');

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  const needle = 'function createStaticWorker(config, progress) {';
  const patch = `function createStaticWorker(config, progress) {
    if (process.env.IN_PROCESS_STATIC_WORKER === '1' || process.platform === 'win32') {
        const mod = require(staticWorkerPath);
        return {
            hasCustomGetInitialProps: (...args) => Promise.resolve(mod.hasCustomGetInitialProps(...args)),
            isPageStatic: (...args) => Promise.resolve(mod.isPageStatic(...args)),
            getDefinedNamedExports: (...args) => Promise.resolve(mod.getDefinedNamedExports(...args)),
            exportPages: async (...args) => {
                progress == null ? void 0 : progress.run();
                return await mod.exportPages(...args);
            },
            end: () => Promise.resolve(),
            getStderr: () => null,
            getStdout: () => null
        };
    }`;

  if (!content.includes("process.platform === 'win32'")) {
    content = content.replace(needle, patch);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-next-worker] Applied in-process static worker patch to build/index.js.');
  }
}

if (fs.existsSync(workerFile)) {
  let wContent = fs.readFileSync(workerFile, 'utf8');
  const wNeedle = `    const baseFileWriter = async (type, path, content, encodingOptions = 'utf-8')=>{
        await _promises.default.mkdir((0, _path.dirname)(path), {
            recursive: true
        });
        await _promises.default.writeFile(path, content, encodingOptions);
        files.push({
            type,
            path
        });
    };`;
  const wPatch = `    const gracefulFs = require('graceful-fs');
    const baseFileWriter = async (type, path, content, encodingOptions = 'utf-8')=>{
        await new Promise((resolve, reject) => {
            gracefulFs.mkdir((0, _path.dirname)(path), { recursive: true }, (err) => {
                if (err) return reject(err);
                gracefulFs.writeFile(path, content, encodingOptions, (err2) => {
                    if (err2) return reject(err2);
                    files.push({ type, path });
                    resolve();
                });
            });
        });
    };`;

  if (wContent.includes(wNeedle)) {
    wContent = wContent.replace(wNeedle, wPatch);
    fs.writeFileSync(workerFile, wContent, 'utf8');
    console.log('[patch-next-worker] Applied graceful-fs baseFileWriter patch to export/worker.js.');
  }
}
