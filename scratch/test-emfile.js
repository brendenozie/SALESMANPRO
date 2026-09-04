const fs = require('fs');

const fds = [];
try {
  for (let i = 0; i < 10000; i++) {
    const fd = fs.openSync('package.json', 'r');
    fds.push(fd);
  }
} catch (e) {
  console.log(`Failed after opening ${fds.length} files:`, e.message, e.code);
} finally {
  for (const fd of fds) {
    try { fs.closeSync(fd); } catch (e) {}
  }
}
