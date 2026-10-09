const { Worker } = require('/var/www/salesmanpro/current/node_modules/bullmq');
async function test() {
  const w = new Worker('test-queue', async (job) => {}, {
    connection: { host: '127.0.0.1', port: 6379, maxRetriesPerRequest: null }
  });
  console.log('Worker created successfully:', !!w);
  await w.close();
  console.log('Worker closed successfully');
  process.exit(0);
}
test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
