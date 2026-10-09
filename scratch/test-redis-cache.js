const { Redis } = require('ioredis');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const m = env.match(/^REDIS_URL\s*=\s*['"]?([^'"\r\n]+)['"]?/m);
if (!m) {
  console.log('No REDIS_URL found');
  process.exit(1);
}

const redisUrl = m[1];
const redis = new Redis(redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });

async function main() {
  await redis.connect();
  console.log('Connected to Redis!');
  const info = await redis.info();
  console.log('Redis Info (first lines):', info.split('\r\n').slice(0, 10).join('\n'));

  // Check search keys
  const keys = await redis.keys('search:*');
  console.log(`Found ${keys.length} cached search:* keys in Redis!`);
  if (keys.length > 0) {
    console.log('Sample search keys:', keys.slice(0, 5));
    const sampleVal = await redis.get(keys[0]);
    console.log('Sample key value preview:', sampleVal ? sampleVal.slice(0, 200) : 'null');
  }

  const boseKey = keys.find(k => k.includes('Bose') || k.includes('bose'));
  if (boseKey) {
    console.log('Found Bose cache key:', boseKey);
    const boseVal = await redis.get(boseKey);
    console.log('Bose cache value:', boseVal?.slice(0, 300));
  }
}

main()
  .catch(console.error)
  .finally(() => redis.disconnect());
