const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');

const lines = env.split('\n');
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('#') || !trimmed) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();

  if (key.includes('DATABASE') || key.includes('MONGODB') || key.includes('REDIS') || key.includes('URL')) {
    try {
      if (val.includes('://')) {
        const fakeUrl = val.replace(/^mongodb\+srv:\/\//, 'https://').replace(/^mongodb:\/\//, 'https://').replace(/^redis:\/\//, 'https://').replace(/^rediss:\/\//, 'https://');
        const parsed = new URL(fakeUrl);
        console.log(`${key} => Protocol: ${parsed.protocol.replace('https', 'mongo/redis')}, Host: ${parsed.host}, Path: ${parsed.pathname}`);
      } else {
        console.log(`${key} => ${val.slice(0, 15)}...`);
      }
    } catch {
      console.log(`${key} => [unparseable URL]`);
    }
  }
}
