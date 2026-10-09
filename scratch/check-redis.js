const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
for (const l of lines) {
  if (l.trim().startsWith('REDIS_URL=')) {
    const val = l.trim().slice('REDIS_URL='.length).replace(/['"]/g, '');
    const at = val.indexOf('@');
    if (at !== -1) {
      console.log('REDIS Host:', val.slice(at + 1).split(':')[0]);
    } else {
      console.log('REDIS Host:', val.slice(0, 20));
    }
  }
}
