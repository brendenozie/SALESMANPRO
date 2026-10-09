const fs = require('fs');

const f = '/var/www/salesmanpro/current/dist-worker/lib/redis.js';
let content = fs.readFileSync(f, 'utf8');

// Backup
fs.writeFileSync(`${f}.bak_${Date.now()}`, content, 'utf8');

// Change maxRetriesPerRequest: 1 to maxRetriesPerRequest: null
content = content.replace(/maxRetriesPerRequest:\s*1,/g, 'maxRetriesPerRequest: null,');

fs.writeFileSync(f, content, 'utf8');
console.log('Patched dist-worker/lib/redis.js to maxRetriesPerRequest: null');
