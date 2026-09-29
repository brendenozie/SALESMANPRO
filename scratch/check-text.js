const fs = require('fs');
const path = require('path');

function search(dir, patterns) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) search(p, patterns);
    else if (/\.(tsx|ts|jsx|js)$/.test(e.name)) {
      try {
        const txt = fs.readFileSync(p, 'utf8');
        for (const [name, pat] of Object.entries(patterns)) {
          if (pat.test(txt)) {
            console.log(`Matched [${name}] in: ${p}`);
          }
        }
      } catch (err) {}
    }
  }
}

search('app', {
  'Staff Users': /Staff Users/i,
  'Sales Agents': /Sales Agents/i,
  'Single Counter': /Single Counter/i,
  'Upgrade to Ghuba': /Upgrade to Ghuba/i,
  'Capabilities Included': /Capabilities Included/i,
  'Invoices & Receipts': /Invoices & Receipts/i,
  'manifest': /spec manifest/i,
});

search('components', {
  'Staff Users': /Staff Users/i,
  'Sales Agents': /Sales Agents/i,
  'Single Counter': /Single Counter/i,
  'Upgrade to Ghuba': /Upgrade to Ghuba/i,
  'Capabilities Included': /Capabilities Included/i,
  'Invoices & Receipts': /Invoices & Receipts/i,
  'manifest': /spec manifest/i,
});
