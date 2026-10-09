const { execSync } = require('child_process');

try {
  const keysRaw = execSync('redis-cli --scan --pattern "search:*"', { encoding: 'utf8' }).trim();
  const keys = keysRaw.split('\n').filter(Boolean);
  console.log(`Found ${keys.length} search cache keys to invalidate.`);
  for (const k of keys) {
    execSync(`redis-cli del "${k}"`);
    console.log(`Deleted key: ${k}`);
  }
} catch (err) {
  console.error("Error invalidating search keys:", err.message);
}
