const fs = require('fs');
const path = require('path');

function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      checkDir(full);
    } else if (f.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      if (!content.includes('import React') && !content.includes('import * as React')) {
        console.log('Adding React import to:', full);
        if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
          const lines = content.split('\n');
          lines.splice(1, 0, 'import React from "react";');
          fs.writeFileSync(full, lines.join('\n'), 'utf8');
        } else {
          fs.writeFileSync(full, 'import React from "react";\n' + content, 'utf8');
        }
      }
    }
  }
}

checkDir('components/site/layouts/DeliveryLayout');
console.log('Done checking DeliveryLayout.');
