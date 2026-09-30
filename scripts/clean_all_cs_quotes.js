const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f !== 'bin' && f !== 'obj' && f !== '.git') {
        processDir(full);
      }
    } else if (f.endsWith('.cs')) {
      let content = fs.readFileSync(full, 'utf8');
      if (content.includes('""')) {
        let fixed = content.replace(/\$""/g, '$"').replace(/""/g, '"');
        fs.writeFileSync(full, fixed, 'utf8');
        console.log(`Cleaned quotes in ${full}`);
      }
    }
  }
}

processDir('C:/Users/Brenden/source/repos/SalesmanProDesktop');
