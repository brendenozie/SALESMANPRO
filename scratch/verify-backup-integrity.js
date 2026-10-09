const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BACKUP_DIR = path.join(__dirname, 'backups', 'snapshot_2026-10-08T20-09-13-053Z');

function sha256(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function verifyBackup() {
  console.log('=== ITEM 1: BACKUP INTEGRITY & RECOVERY VERIFICATION ===');
  console.log('Backup Directory:', BACKUP_DIR);

  if (!fs.existsSync(BACKUP_DIR)) {
    throw new Error(`Backup directory does not exist: ${BACKUP_DIR}`);
  }

  const files = fs.readdirSync(BACKUP_DIR);
  console.log(`Found ${files.length} files in backup directory:`, files);

  const expectedFiles = [
    'manifest.json',
    'products.json',
    'marketplaceListings.json',
    'storeCategories.json',
    'productCategories.json',
    'companies.json'
  ];

  const results = {};

  for (const file of expectedFiles) {
    const filePath = path.join(BACKUP_DIR, file);
    if (!fs.existsSync(filePath)) {
      results[file] = { status: 'MISSING' };
      continue;
    }

    const stat = fs.statSync(filePath);
    const hash = sha256(filePath);
    let recordCount = 0;
    let parseError = null;
    let sampleKeys = [];
    let nullIds = 0;

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(data)) {
        recordCount = data.length;
        if (data.length > 0) {
          sampleKeys = Object.keys(data[0]);
          nullIds = data.filter(r => !r.id && !r._id).length;
        }
      } else if (typeof data === 'object') {
        recordCount = Object.keys(data).length;
        sampleKeys = Object.keys(data);
      }
    } catch (e) {
      parseError = e.message;
    }

    results[file] = {
      sizeBytes: stat.size,
      sha256: hash,
      parseStatus: parseError ? `FAIL: ${parseError}` : 'PASS',
      recordCount,
      nullIds,
      sampleKeys: sampleKeys.slice(0, 8)
    };
  }

  console.table(Object.entries(results).map(([f, r]) => ({
    File: f,
    SizeKB: (r.sizeBytes / 1024).toFixed(2),
    Status: r.parseStatus,
    Records: r.recordCount,
    NullIDs: r.nullIds,
    HashPrefix: r.sha256 ? r.sha256.slice(0, 12) : 'N/A'
  })));

  // Manifest Cross-Check
  const manifestPath = path.join(BACKUP_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log('\nManifest Metadata:');
    console.log('Timestamp:', manifest.timestamp);
    console.log('Environment:', manifest.environment);
    console.log('Target User:', manifest.targetUser);
    console.log('Collections in manifest:', manifest.collections);
  }

  // Deep Schema & Data Quality Check on marketplaceListings.json
  const listingsPath = path.join(BACKUP_DIR, 'marketplaceListings.json');
  const listings = JSON.parse(fs.readFileSync(listingsPath, 'utf-8'));
  console.log(`\nValidating ${listings.length} marketplace listings from backup:`);

  const idSet = new Set();
  let duplicateIds = 0;
  let missingName = 0;
  let missingCompany = 0;
  let hasProtectedListing = false;

  for (const l of listings) {
    if (idSet.has(l.id)) duplicateIds++;
    idSet.add(l.id);
    if (!l.name) missingName++;
    if (!l.companyId) missingCompany++;
    if (l.id === '68e17a8016ac60978dc272ed') hasProtectedListing = true;
  }

  console.log(`- Unique IDs: ${idSet.size} / ${listings.length} (Duplicates: ${duplicateIds})`);
  console.log(`- Missing Names: ${missingName}`);
  console.log(`- Missing Company IDs: ${missingCompany}`);
  console.log(`- Protected OrderItem listing 68e17a8016ac60978dc272ed present: ${hasProtectedListing ? 'YES' : 'NO'}`);

  // Deep Schema & Data Quality Check on products.json
  const productsPath = path.join(BACKUP_DIR, 'products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log(`\nValidating ${products.length} products from backup:`);
  console.log('Product IDs in backup:', products.map(p => ({ id: p.id, name: p.name, companyId: p.companyId })));

  const isSufficientForRecovery = (
    results['marketplaceListings.json']?.parseStatus === 'PASS' &&
    results['products.json']?.parseStatus === 'PASS' &&
    results['storeCategories.json']?.parseStatus === 'PASS' &&
    duplicateIds === 0 &&
    hasProtectedListing
  );

  console.log(`\nBackup Sufficient for Complete Recovery: ${isSufficientForRecovery ? 'YES - VERIFIED' : 'NO - DEFICIENT'}`);
}

verifyBackup().catch(console.error);
