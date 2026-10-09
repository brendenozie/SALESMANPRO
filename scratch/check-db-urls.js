const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');

const regex = /^(DATABASE_URL[A-Za-z_]*)\s*=\s*['"]?([^'"\r\n]+)['"]?/gm;
let m;
while ((m = regex.exec(env)) !== null) {
  const varName = m[1];
  const urlVal = m[2];
  // extract host and db name
  // mongodb+srv://user:pass@host/dbname?...
  const atIdx = urlVal.indexOf('@');
  if (atIdx !== -1) {
    const rest = urlVal.slice(atIdx + 1);
    const slashIdx = rest.indexOf('/');
    const qIdx = rest.indexOf('?');
    const host = slashIdx !== -1 ? rest.slice(0, slashIdx) : (qIdx !== -1 ? rest.slice(0, qIdx) : rest);
    const db = slashIdx !== -1 ? rest.slice(slashIdx + 1, qIdx !== -1 ? qIdx : rest.length) : 'default';
    console.log(`${varName}: Host = ${host}, DB = ${db}`);
  } else {
    console.log(`${varName}: [No @ symbol] ${urlVal.slice(0, 20)}`);
  }
}
