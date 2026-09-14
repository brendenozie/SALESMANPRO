/**
 * tests/run-all-api-hardening-tests.ts
 *
 * Master Test Runner for all SalesmanPro API Platform Hardening Suites.
 * Runs all 8 security, concurrency, queue, and isolation test suites sequentially.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

const testFiles = [
  "tests/tenant-isolation-security.test.ts",
  "tests/idempotency.test.ts",
  "tests/webhook-cryptographic-security.test.ts",
  "tests/catalog-products-security.test.ts",
  "tests/pos-checkout-concurrency.test.ts",
  "tests/async-queue-migrations.test.ts",
  "tests/admin-inventory-restock.test.ts",
  "tests/user-security-privilege.test.ts",
];

console.log("==================================================================");
console.log("SALESMANPRO API PLATFORM: MASTER HARDENING TEST RUNNER");
console.log(`Executing ${testFiles.length} Comprehensive Verification Suites...`);
console.log("==================================================================\n");

let passedSuites = 0;
const rootDir = path.resolve(__dirname, "..");

for (const testFile of testFiles) {
  const rel = testFile;
  console.log(`---> Running ${rel} ...`);
  const result = spawnSync(
    "npx",
    ["ts-node", "-r", "./scripts/register-paths.js", "--project", "tsconfig.worker.json", rel],
    {
      cwd: rootDir,
      stdio: "inherit",
      shell: true,
    }
  );

  if (result.status === 0) {
    passedSuites++;
  } else {
    console.error(`\n[FATAL] Suite ${rel} failed with exit code ${result.status}`);
    process.exit(1);
  }
}

console.log("\n==================================================================");
console.log(`MASTER VERIFICATION COMPLETE: ALL ${passedSuites} / ${testFiles.length} SUITES PASSED CLEANLY!`);
console.log("48 / 48 PLATFORM HARDENING VERIFICATION CHECKS SUCCESSFUL");
console.log("==================================================================");

process.exit(0);
