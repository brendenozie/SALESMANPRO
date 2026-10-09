const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
for (const l of lines) {
  if (l.trim().startsWith('DATABASE_URL_LOCAL=')) {
    console.log(l.trim());
  }
}
